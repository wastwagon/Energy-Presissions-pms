"""
Aggregate quote header totals from quote options (multi-package quotations).
"""
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session, joinedload

from app.models import Product, Quote, QuoteItem, QuoteOption


def equipment_services_subtotals_for_items(
    db: Session, items: List[QuoteItem]
) -> Tuple[float, float]:
    """
    Split line totals into equipment vs services using the same rules as quote_recalculator.
    """
    equipment_items: List[QuoteItem] = []
    for item in items:
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.product_type.value in ["panel", "inverter", "battery", "mounting"]:
                equipment_items.append(item)

    bos_item = None
    for item in items:
        if "BOS" in (item.description or "").upper() or "Balance of System" in (item.description or ""):
            bos_item = item
            break

    equipment_subtotal = sum(item.total_price for item in equipment_items)
    if bos_item:
        equipment_subtotal += bos_item.total_price

    services_subtotal = 0.0
    for item in items:
        if item not in equipment_items and item != bos_item:
            services_subtotal += item.total_price

    return equipment_subtotal, services_subtotal


def refresh_quote_header_totals(db: Session, quote_id: int) -> None:
    """
    Refresh quotes.equipment_subtotal / services / tax / discount / grand_total from options.

    - Primary row (list UI, first tab): first option by sort_order.
    - grand_total on the quote: max option grand total when multiple options exist
      (pipeline shows largest package); single option uses that option's total.
    """
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        return

    options = (
        db.query(QuoteOption)
        .filter(QuoteOption.quote_id == quote_id)
        .options(joinedload(QuoteOption.items))
        .order_by(QuoteOption.sort_order, QuoteOption.id)
        .all()
    )
    if not options:
        return

    tax_p = float(quote.tax_percent or 0.0)
    disc_p = float(quote.discount_percent or 0.0)

    option_grands: List[float] = []
    for opt in options:
        items = list(opt.items or [])
        eq, svc = equipment_services_subtotals_for_items(db, items)
        sub = eq + svc
        tax_amt = sub * (tax_p / 100.0) if tax_p else 0.0
        disc_amt = sub * (disc_p / 100.0) if disc_p else 0.0
        option_grands.append(sub + tax_amt - disc_amt)

    primary = options[0]
    peq, psvc = equipment_services_subtotals_for_items(db, list(primary.items or []))
    psub = peq + psvc
    ptax = psub * (tax_p / 100.0) if tax_p else 0.0
    pdisc = psub * (disc_p / 100.0) if disc_p else 0.0
    pgrand = psub + ptax - pdisc

    quote.equipment_subtotal = peq
    quote.services_subtotal = psvc
    quote.tax_amount = ptax
    quote.discount_amount = pdisc
    quote.grand_total = max(option_grands) if len(option_grands) > 1 else pgrand


def get_primary_quote_option_id(db: Session, quote_id: int) -> Optional[int]:
    opt = (
        db.query(QuoteOption)
        .filter(QuoteOption.quote_id == quote_id)
        .order_by(QuoteOption.sort_order, QuoteOption.id)
        .first()
    )
    return opt.id if opt else None
