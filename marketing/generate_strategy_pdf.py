#!/usr/bin/env python3
"""Generate Energy Precisions Digital Growth Strategy PDF on letterhead."""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
MD_PATH = REPO_ROOT / "docs" / "DIGITAL_GROWTH_STRATEGY_2026.md"
LOGO_PATH = REPO_ROOT / "frontend" / "public" / "website_images" / "Logo1-1-scaled-e1752479241874.png"
OUTPUT_PATH = Path.home() / "Downloads" / "Energy_Precisions_Digital_Growth_Strategy_2026.pdf"

BRAND_DARK = colors.HexColor("#0a0e17")
BRAND_GREEN = colors.HexColor("#00E676")
BRAND_GRAY = colors.HexColor("#4a5568")
BRAND_LIGHT = colors.HexColor("#f7fafc")
TABLE_HEADER = colors.HexColor("#1a2332")
TABLE_ALT = colors.HexColor("#f0f4f8")

COMPANY = {
    "name": "Energy Precisions",
    "tagline": "Engineered hybrid solar · LiFePO4 lithium storage · Full installation",
    "address": "Haatso, Ecomog, Accra, Ghana",
    "phone": "(+233) 533 611 611",
    "email": "info@energyprecisions.com",
    "web": "www.energyprecisions.com",
}


def clean_text(text: str) -> str:
    text = text.replace("LiFePO₄", "LiFePO4").replace("LiFePO\u2084", "LiFePO4")
    text = text.replace("✅", "Done").replace("⚠️", "Pending").replace("🟡", "Partial")
    text = text.replace("⏳", "Future").replace("★", "*")
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text.strip()


def inline_markup(text: str) -> str:
    text = clean_text(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='Courier'>\1</font>", text)
    return text


def parse_table_row(line: str) -> list[str]:
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return cells


def is_table_separator(line: str) -> bool:
    return bool(re.match(r"^\|[\s\-:|]+\|$", line.strip()))


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=BRAND_DARK,
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=BRAND_GRAY,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BRAND_DARK,
            spaceBefore=16,
            spaceAfter=8,
            borderPadding=0,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=BRAND_DARK,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=BRAND_GRAY,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=BRAND_DARK,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=BRAND_DARK,
            leftIndent=14,
            bulletIndent=6,
            spaceAfter=3,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=9.5,
            leading=14,
            textColor=BRAND_GRAY,
            leftIndent=12,
            rightIndent=12,
            borderColor=BRAND_GREEN,
            borderWidth=0,
            borderPadding=6,
            spaceBefore=6,
            spaceAfter=8,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=BRAND_GRAY,
            spaceAfter=4,
        ),
        "toc": ParagraphStyle(
            "TOC",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=BRAND_DARK,
            leftIndent=8,
            spaceAfter=2,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=10,
            textColor=BRAND_DARK,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.white,
        ),
    }
    return styles


class LetterheadCanvas:
    def __init__(self, logo_path: Path):
        self.logo_path = logo_path
        self.page_num = 0

    def on_page(self, canvas, doc):
        self.page_num += 1
        canvas.saveState()
        w, h = A4

        # Header band
        canvas.setFillColor(BRAND_DARK)
        canvas.rect(0, h - 2.4 * cm, w, 2.4 * cm, fill=1, stroke=0)

        if self.logo_path.exists():
            canvas.drawImage(
                str(self.logo_path),
                1.2 * cm,
                h - 2.05 * cm,
                width=3.2 * cm,
                height=1.5 * cm,
                preserveAspectRatio=True,
                mask="auto",
            )

        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 11)
        canvas.drawRightString(w - 1.2 * cm, h - 1.15 * cm, COMPANY["name"])
        canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(w - 1.2 * cm, h - 1.55 * cm, COMPANY["address"])
        canvas.drawRightString(
            w - 1.2 * cm,
            h - 1.85 * cm,
            f"{COMPANY['phone']}  |  {COMPANY['email']}  |  {COMPANY['web']}",
        )

        canvas.setStrokeColor(BRAND_GREEN)
        canvas.setLineWidth(2)
        canvas.line(0, h - 2.42 * cm, w, h - 2.42 * cm)

        # Footer
        canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
        canvas.setLineWidth(0.5)
        canvas.line(1.2 * cm, 1.5 * cm, w - 1.2 * cm, 1.5 * cm)

        canvas.setFillColor(BRAND_GRAY)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(
            1.2 * cm,
            0.9 * cm,
            f"{COMPANY['name']}  ·  Digital Growth & Marketing Strategy  ·  Confidential",
        )
        canvas.drawRightString(w - 1.2 * cm, 0.9 * cm, f"Page {self.page_num}")

        canvas.restoreState()


def make_table(rows: list[list[str]], styles, col_widths=None) -> Table:
    if not rows:
        return Spacer(1, 1)

    wrapped = []
    for ri, row in enumerate(rows):
        style = styles["table_header"] if ri == 0 else styles["table_cell"]
        wrapped.append([Paragraph(inline_markup(c), style) for c in row])

    ncols = len(rows[0])
    avail = A4[0] - 2.4 * cm
    if not col_widths:
        col_widths = [avail / ncols] * ncols
    else:
        total = sum(col_widths)
        col_widths = [avail * (w / total) for w in col_widths]

    table = Table(wrapped, colWidths=col_widths, repeatRows=1)
    ts = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 7.5),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, TABLE_ALT]),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]
    )
    table.setStyle(ts)
    return table


def parse_markdown_to_story(md_text: str, styles) -> list:
    story = []
    lines = md_text.splitlines()
    i = 0
    skip_title_block = True

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped == "---":
            story.append(Spacer(1, 4))
            i += 1
            continue

        # Skip duplicate cover metadata at top of md
        if skip_title_block:
            if stripped.startswith("## "):
                skip_title_block = False
            else:
                i += 1
                continue

        if stripped.startswith("# ") and not stripped.startswith("## "):
            i += 1
            continue

        if stripped.startswith("## "):
            title = clean_text(stripped[3:])
            if title.lower() == "table of contents":
                story.append(Paragraph(inline_markup(title), styles["h1"]))
                story.append(Spacer(1, 4))
                i += 1
                while i < len(lines) and re.match(r"^\d+\.", lines[i].strip()):
                    story.append(
                        Paragraph(inline_markup(lines[i].strip()), styles["toc"])
                    )
                    i += 1
                continue
            story.append(Paragraph(inline_markup(title), styles["h1"]))
            story.append(
                HRFlowable(
                    width="100%",
                    thickness=1,
                    color=BRAND_GREEN,
                    spaceBefore=2,
                    spaceAfter=8,
                )
            )
            i += 1
            continue

        if stripped.startswith("### "):
            story.append(Paragraph(inline_markup(stripped[4:]), styles["h2"]))
            i += 1
            continue

        if stripped.startswith("|") and "|" in stripped[1:]:
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                if not is_table_separator(lines[i]):
                    table_rows.append(parse_table_row(lines[i]))
                i += 1
            if table_rows:
                story.append(make_table(table_rows, styles))
                story.append(Spacer(1, 8))
            continue

        if stripped.startswith("> "):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            story.append(Paragraph(inline_markup(" ".join(quote_lines)), styles["quote"]))
            continue

        if re.match(r"^[-*] ", stripped):
            while i < len(lines) and re.match(r"^[-*] ", lines[i].strip()):
                item = lines[i].strip()[2:]
                story.append(
                    Paragraph(f"• {inline_markup(item)}", styles["bullet"])
                )
                i += 1
            story.append(Spacer(1, 4))
            continue

        if re.match(r"^\d+\. ", stripped):
            while i < len(lines) and re.match(r"^\d+\. ", lines[i].strip()):
                story.append(Paragraph(inline_markup(lines[i].strip()), styles["bullet"]))
                i += 1
            story.append(Spacer(1, 4))
            continue

        if stripped.startswith("**") and stripped.endswith("**") and stripped.count("**") == 2:
            story.append(Paragraph(inline_markup(stripped), styles["body"]))
            i += 1
            continue

        para_lines = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if (
                not nxt
                or nxt.startswith("#")
                or nxt.startswith("|")
                or nxt.startswith(">")
                or nxt == "---"
                or re.match(r"^[-*] ", nxt)
                or re.match(r"^\d+\. ", nxt)
            ):
                break
            para_lines.append(nxt)
            i += 1
        story.append(Paragraph(inline_markup(" ".join(para_lines)), styles["body"]))

    return story


def main():
    if not MD_PATH.exists():
        raise SystemExit(f"Markdown not found: {MD_PATH}")

    md_text = MD_PATH.read_text(encoding="utf-8")
    styles = build_styles()
    letterhead = LetterheadCanvas(LOGO_PATH)

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
        topMargin=2.7 * cm,
        bottomMargin=2.0 * cm,
        title="Energy Precisions Digital Growth Strategy 2026",
        author="Energy Precisions",
        subject="Digital Growth and Marketing Strategy",
    )

    story = parse_markdown_to_story(md_text, styles)

    doc.build(story, onFirstPage=letterhead.on_page, onLaterPages=letterhead.on_page)
    print(f"PDF generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
