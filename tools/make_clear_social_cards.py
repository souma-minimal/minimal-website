#!/usr/bin/env python3
"""Create explicit, watermarked social cards for minimal.'s Threads posts.

The cards lead with a familiar situation, rather than an internal collection name.
They use the low-resolution SAMPLE preview so a social attachment cannot replace
the purchased original file.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "social" / "clear-cards"
SAMPLE = ROOT / "assets" / "social-samples" / "terrain-studies-01-dune-iphone-sample.jpg"

W, H = 1080, 1350
JP = "/System/Library/Fonts/Hiragino Sans GB.ttc"
EN = "/System/Library/Fonts/Supplemental/Arial.ttf"
EN_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size, bold=False, japanese=False):
    path = JP if japanese else (EN_BOLD if bold else EN)
    return ImageFont.truetype(path, size)


def wrap(draw, value, text_font, max_width):
    if "\n" in value:
        lines = []
        for paragraph in value.split("\n"):
            lines.extend(wrap(draw, paragraph, text_font, max_width))
        return lines
    words = value.split(" ") if " " in value else list(value)
    lines, current = [], ""
    for word in words:
        candidate = (current + (" " if current and " " in value else "") + word)
        if current and draw.textbbox((0, 0), candidate, font=text_font)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def card(filename, eyebrow, headline, detail, label, japanese=False):
    base = Image.open(SAMPLE).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    base = base.filter(ImageFilter.GaussianBlur(8)).convert("RGBA")
    veil = Image.new("RGBA", (W, H), (244, 244, 240, 232))
    canvas = Image.alpha_composite(base, veil)
    draw = ImageDraw.Draw(canvas)
    # Preview shows the product in use, while text says why it matters.
    preview = Image.open(SAMPLE).convert("RGB").resize((330, 586), Image.Resampling.LANCZOS)
    preview = preview.convert("RGBA")
    shadow = Image.new("RGBA", (370, 626), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((18, 18, 352, 608), radius=42, fill=(0, 0, 0, 45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(shadow, (672, 595))
    canvas.alpha_composite(preview, (692, 615))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((72, 86, 124, 92), fill=(20, 20, 20, 255))
    eyebrow_font = font(22, bold=True, japanese=japanese)
    head_font = font(64 if japanese else 68, bold=True, japanese=japanese)
    body_font = font(27, japanese=japanese)
    label_font = font(21, bold=True, japanese=japanese)
    draw.text((72, 124), eyebrow, font=eyebrow_font, fill=(82, 82, 78, 255))
    y = 194
    for line in wrap(draw, headline, head_font, 720):
        draw.text((72, y), line, font=head_font, fill=(14, 14, 14, 255))
        # Japanese glyphs need a more generous rhythm than Latin text. This
        # also prevents the visible overlap that dense mobile typography creates.
        y += 98 if japanese else 82
    y += 24
    for line in wrap(draw, detail, body_font, 550):
        draw.text((72, y), line, font=body_font, fill=(70, 70, 67, 255))
        y += 43
    draw.line((72, 1124, 1008, 1124), fill=(28, 28, 28, 70), width=2)
    draw.text((72, 1160), label, font=label_font, fill=(22, 22, 22, 255))
    draw.text((72, 1208), "minimal.  ·  sample preview", font=font(20, japanese=False), fill=(103, 103, 98, 255))
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUT / filename, "JPEG", quality=90, optimize=True)


def main():
    cards = [
        ("jp-phone-quiet.jpg", "スマホを開いたとき", "通知より先に、\n画面の情報量に疲れていませんか？", "目に入るものを減らすための、iPhone用モノクロ壁紙です。", "静かなホーム画面をつくる", True),
        ("jp-plan-one.jpg", "予定が多い日の朝", "やることを増やす前に、\n今日の一つを見つける。", "頭の中に散らばった予定を、Notionで一か所にまとめます。", "週間管理テンプレート", True),
        ("en-phone-quiet.jpg", "WHEN YOU OPEN YOUR PHONE", "Does your home screen feel loud before you tap anything?", "Monochrome iPhone wallpapers made to leave room for what matters.", "A quieter home screen", False),
        ("en-plan-one.jpg", "ON A BUSY MORNING", "Before adding another task, find the one thing for today.", "A simple Notion weekly planner for turning scattered thoughts into one clear list.", "A calmer weekly plan", False),
    ]
    for args in cards:
        card(*args)


if __name__ == "__main__":
    main()
