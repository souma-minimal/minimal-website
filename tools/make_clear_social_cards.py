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


def card(filename, eyebrow, headline, detail, label, japanese=False, sample=SAMPLE):
    base = Image.open(sample).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    base = base.filter(ImageFilter.GaussianBlur(8)).convert("RGBA")
    veil = Image.new("RGBA", (W, H), (244, 244, 240, 232))
    canvas = Image.alpha_composite(base, veil)
    draw = ImageDraw.Draw(canvas)
    # Preview shows the product in use, while text says why it matters.
    planner_files = {"post-01.jpg", "post-02.jpg", "post-07.jpg", "post-08.jpg", "post-11.jpg", "post-12.jpg", "post-13.jpg"}
    if filename in planner_files:
        # Show the planner concept itself instead of an unrelated wallpaper.
        panel = (612, 570, 1008, 1124)
        draw.rounded_rectangle(panel, radius=20, fill=(18, 18, 18, 255))
        labels = [("TODAY", "one next task"), ("THIS WEEK", "plans in view"), ("LATER", "ideas kept safe")]
        y_card = 620
        for heading, small in labels:
            draw.rounded_rectangle((650, y_card, 970, y_card + 122), radius=13, fill=(247, 247, 243, 255))
            draw.text((676, y_card + 23), heading, font=font(18, bold=True), fill=(30, 30, 30, 255))
            draw.text((676, y_card + 62), small, font=font(18), fill=(93, 93, 89, 255))
            y_card += 145
        draw.text((650, 1062), "minimal Schedule  ·  Notion", font=font(16, bold=True), fill=(224, 224, 220, 255))
    else:
        preview = Image.open(sample).convert("RGB").resize((330, 586), Image.Resampling.LANCZOS)
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

    # One visual per scheduled post.  Each image tells the same everyday story
    # as its caption, instead of making an unexplained collection name do work.
    samples = [
        "terrain-studies-01-dune-iphone-sample.jpg", "terrain-studies-02-ridge-iphone-sample.jpg",
        "terrain-studies-03-tide-iphone-sample.jpg", "terrain-studies-04-stone-iphone-sample.jpg",
        "terrain-studies-05-moon-iphone-sample.jpg", "terrain-studies-06-fog-iphone-sample.jpg",
        "minimal-wallpaper-01-iphone-sample.jpg", "minimal-wallpaper-02-iphone-sample.jpg",
        "minimal-wallpaper-03-iphone-sample.jpg", "minimal-wallpaper-04-iphone-sample.jpg",
        "terrain-studies-01-dune-iphone-sample.jpg", "terrain-studies-02-ridge-iphone-sample.jpg",
        "terrain-studies-03-tide-iphone-sample.jpg"
    ]
    posts = [
        ("post-01.jpg", "予定が多い日の朝", "頭の中で同じことを\n何度も確認してしまう。", "予定・やること・思いつきを、Notionの一か所へ。", "次にすることを見つける", True),
        ("post-02.jpg", "WHEN THE DAY FEELS FULL", "You do not need\nmore reminders.", "Keep plans, tasks and ideas in one calm place.", "Find the next thing", False),
        ("post-03.jpg", "スマホを開くたび", "通知より先に、\n画面がうるさく感じる。", "必要なものを見つけやすくする、iPhone用モノクロ壁紙。", "静かなホーム画面", True),
        ("post-04.jpg", "BEFORE YOU OPEN AN APP", "Does your phone\nalready feel busy?", "A monochrome iPhone wallpaper with less visual noise.", "A quieter home screen", False),
        ("post-05.jpg", "毎日何度も見る画面", "時計と必要なアプリが\n見つけやすければいい。", "派手さを足すためではない、iPhone用モノクロ壁紙です。", "1枚ずつ選べます", True),
        ("post-06.jpg", "THE SCREEN YOU SEE MOST", "Make room for the time\nand your next tap.", "A quiet iPhone wallpaper, sold one at a time.", "Less visual noise", False),
        ("post-07.jpg", "予定が崩れた日", "全部を立て直さなくていい。", "まず今日やることを見える場所へ。残りは忘れない場所へ。", "今日に戻る", True),
        ("post-08.jpg", "WHEN PLANS CHANGE", "You do not need to\nrebuild your week.", "See today’s task. Keep the rest safe for later.", "Return to today", False),
        ("post-09.jpg", "壁紙を探している人へ", "スマホを開いたとき、\n必要なものが見つかる。", "そのための、控えめなモノクロ壁紙です。", "購入前にサンプルを見る", True),
        ("post-10.jpg", "LOOKING FOR A WALLPAPER?", "Not more decoration.\nMore room to notice.", "A monochrome background for the things you use every day.", "See the sample first", False),
        ("post-11.jpg", "何から始めればいい？", "今日の一つが見えれば、\nそれでいい。", "予定・タスク・思いつきを、ひとつのNotionページへ。", "忙しい朝のために", True),
        ("post-12.jpg", "WHERE DO I BEGIN?", "Find one clear thing\nfor today.", "A Notion planner for keeping the rest safely in one place.", "Start with one thing", False),
        ("post-13.jpg", "来週が少し気になる夜", "全部を覚えておかなくていい。", "予定とやることを一か所に置いて、次の一歩を見失わない。", "静かに週を始める", True),
    ]
    for values, sample_name in zip(posts, samples):
        card(*values, sample=ROOT / "assets" / "social-samples" / sample_name)


if __name__ == "__main__":
    main()
