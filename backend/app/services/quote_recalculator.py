"""
Service to recalculate dependent quote items (BOS, Installation) when equipment changes
"""
from sqlalchemy.orm import Session

from app.models import Product, QuoteItem
from app.services.bom_quantities import catalog_bom_append_enabled
from app.services.pricing import get_setting_value, use_bos_percentage_pricing
from app.services.quote_totals import refresh_quote_header_totals


def recalculate_dependent_items(db: Session, quote_id: int, quote_option_id: int) -> None:
    """
    Recalculate BOS and Installation items when equipment totals change for one quote option.

    Skipped when itemized catalog BOM is enabled — BOS/install/transport are fixed
    catalog lines, not legacy % of equipment.
    """
    if catalog_bom_append_enabled(db):
        refresh_quote_header_totals(db, quote_id)
        db.commit()
        return
    all_items = (
        db.query(QuoteItem)
        .filter(QuoteItem.quote_id == quote_id, QuoteItem.quote_option_id == quote_option_id)
        .all()
    )

    equipment_items = []
    for item in all_items:
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.product_type.value in ["panel", "inverter", "battery", "mounting"]:
                equipment_items.append(item)

    equipment_total = sum(item.total_price for item in equipment_items)

    bos_item = None
    for item in all_items:
        if "BOS" in item.description.upper() or "Balance of System" in item.description:
            bos_item = item
            break

    if bos_item and use_bos_percentage_pricing(db):
        if bos_item.product_id:
            bos_product = db.query(Product).filter(Product.id == bos_item.product_id).first()
            if bos_product and bos_product.price_type == "percentage":
                new_bos_price = equipment_total * (bos_product.base_price / 100)
                bos_item.unit_price = new_bos_price
                bos_item.total_price = new_bos_price
            elif bos_product and bos_product.price_type == "per_kw":
                pass
        else:
            import re

            match = re.search(r"(\d+\.?\d*)%", bos_item.description)
            if match:
                bos_percentage = float(match.group(1))
            else:
                bos_percentage = get_setting_value(db, "bos_percentage", 12.0)

            new_bos_price = equipment_total * (bos_percentage / 100)
            bos_item.unit_price = new_bos_price
            bos_item.total_price = new_bos_price
            if not match:
                bos_item.description = f"Balance of System (BOS) - {bos_percentage}% of equipment"

    installation_item = None
    for item in all_items:
        if "Installation" in item.description and "Transport" not in item.description:
            installation_item = item
            break

    if installation_item:
        total_equipment_for_installation = equipment_total
        if bos_item and use_bos_percentage_pricing(db):
            total_equipment_for_installation += bos_item.total_price

        if installation_item.product_id:
            installation_product = db.query(Product).filter(Product.id == installation_item.product_id).first()
            if installation_product and installation_product.price_type == "percentage":
                new_installation_price = total_equipment_for_installation * (installation_product.base_price / 100)
                installation_item.unit_price = new_installation_price
                installation_item.total_price = new_installation_price
            elif installation_product and installation_product.price_type == "per_kw":
                pass
        else:
            import re

            match = re.search(r"(\d+\.?\d*)%", installation_item.description)
            if match:
                installation_percentage = float(match.group(1))
            else:
                installation_percentage = get_setting_value(db, "installation_cost_percent", 20.0)

            new_installation_price = total_equipment_for_installation * (installation_percentage / 100)
            installation_item.unit_price = new_installation_price
            installation_item.total_price = new_installation_price
            if not match:
                installation_item.description = (
                    f"Installation ({installation_percentage}% of total equipment cost)"
                )

    refresh_quote_header_totals(db, quote_id)
    db.commit()
