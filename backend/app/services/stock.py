"""
Stock management service.
Deducts stock when project status → ACCEPTED and when e-commerce order payment completes.
Restores stock when project status ACCEPTED → REJECTED.
"""
import math
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models import (
    Quote, QuoteItem, Product,
    QuoteStatus,
    StockMovement, StockMovementType
)


def _get_quote_for_project(db: Session, project_id: int) -> Optional[Quote]:
    """
    Get the quote to use for stock deduction.
    Prefer ACCEPTED quote, else latest SENT quote.
    """
    quote = db.query(Quote).filter(
        Quote.project_id == project_id,
        Quote.status == QuoteStatus.ACCEPTED
    ).order_by(Quote.created_at.desc()).first()

    if quote:
        return quote

    quote = db.query(Quote).filter(
        Quote.project_id == project_id,
        Quote.status == QuoteStatus.SENT
    ).order_by(Quote.created_at.desc()).first()

    return quote


def _items_for_stock_deduction(db: Session, quote_id: int) -> List[Tuple[QuoteItem, int]]:
    """
    Get quote items that have product_id and manage_stock=True.
    Returns list of (item, qty_to_deduct) where qty is integer (ceil of quantity).
    """
    items = db.query(QuoteItem).filter(
        QuoteItem.quote_id == quote_id,
        QuoteItem.product_id.isnot(None)
    ).all()

    result = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.manage_stock:
            qty = max(1, int(math.ceil(item.quantity)))
            result.append((item, qty))
    return result


def check_stock_availability(db: Session, project_id: int) -> Tuple[bool, List[str]]:
    """
    Check if sufficient stock exists for project acceptance.
    Returns (ok, list of error messages).
    """
    quote = _get_quote_for_project(db, project_id)
    if not quote:
        return False, ["No accepted or sent quote found for this project. Create and send a quote first."]

    items = _items_for_stock_deduction(db, quote.id)
    if not items:
        return True, []  # No stock-tracked items, no issue

    errors = []
    for item, qty in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        if product.stock_quantity < qty:
            errors.append(
                f"Insufficient stock for '{product.name or product.model or product.brand or 'Product'}': "
                f"required {qty}, available {product.stock_quantity}"
            )

    return len(errors) == 0, errors


def deduct_stock_on_project_accept(
    db: Session,
    project_id: int,
    user_id: Optional[int] = None
) -> Tuple[bool, List[str]]:
    """
    Deduct stock when project status changes to ACCEPTED.
    Returns (success, list of error messages).
    """
    ok, errors = check_stock_availability(db, project_id)
    if not ok:
        return False, errors

    quote = _get_quote_for_project(db, project_id)
    if not quote:
        return False, ["No quote found for stock deduction"]

    # Auto-set quote to ACCEPTED when project is accepted
    quote.status = QuoteStatus.ACCEPTED

    items = _items_for_stock_deduction(db, quote.id)
    for item, qty in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue

        product.stock_quantity = max(0, product.stock_quantity - qty)
        product.in_stock = product.stock_quantity > 0

        movement = StockMovement(
            product_id=product.id,
            quantity=-qty,
            movement_type=StockMovementType.DEDUCTION_ON_ACCEPT,
            project_id=project_id,
            quote_id=quote.id,
            quote_item_id=item.id,
            created_by=user_id
        )
        db.add(movement)

    return True, []


def restore_stock_on_project_reject(
    db: Session,
    project_id: int,
    user_id: Optional[int] = None
) -> bool:
    """
    Restore stock when project status changes from ACCEPTED to REJECTED.
    Reverses previous deductions for this project.
    Returns True if any stock was restored.
    """
    # Find deductions for this project
    deductions = db.query(StockMovement).filter(
        StockMovement.project_id == project_id,
        StockMovement.movement_type == StockMovementType.DEDUCTION_ON_ACCEPT,
        StockMovement.quantity < 0
    ).all()

    if not deductions:
        return False

    for mov in deductions:
        product = db.query(Product).filter(Product.id == mov.product_id).first()
        if not product:
            continue

        restore_qty = abs(mov.quantity)
        product.stock_quantity = product.stock_quantity + restore_qty
        product.in_stock = True

        restore_mov = StockMovement(
            product_id=product.id,
            quantity=restore_qty,
            movement_type=StockMovementType.RESTORE_ON_REJECT,
            project_id=project_id,
            quote_id=mov.quote_id,
            quote_item_id=mov.quote_item_id,
            created_by=user_id
        )
        db.add(restore_mov)

    return True


def deduct_stock_on_order_paid(db: Session, order_id: int) -> bool:
    """
    Deduct stock when an e-commerce order payment is completed.
    Idempotent: skips if already deducted for this order.
    Returns True if any stock was deducted.
    """
    from app.models_ecommerce import Order

    existing = db.query(StockMovement).filter(
        StockMovement.order_id == order_id,
        StockMovement.movement_type == StockMovementType.DEDUCTION_ECOM_ORDER
    ).first()
    if existing:
        return False  # Already deducted for this order

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or not order.items:
        return False

    deducted = False
    for item in order.items:
        if not item.product_id:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.manage_stock:
            continue

        qty = max(1, int(math.ceil(item.quantity)))
        product.stock_quantity = product.stock_quantity - qty
        product.in_stock = product.stock_quantity > 0

        movement = StockMovement(
            product_id=product.id,
            quantity=-qty,
            movement_type=StockMovementType.DEDUCTION_ECOM_ORDER,
            project_id=None,
            quote_id=None,
            order_id=order_id,
            created_by=None
        )
        db.add(movement)
        deducted = True

    return deducted
