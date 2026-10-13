#!/usr/bin/env python3
"""Create short-form Reel story frames from minimal.'s protected samples.

These are intentionally *production boards*, not fake lifestyle photography.
The product preview remains visibly watermarked and the phone is an illustrated
device, so the exported images cannot act as the paid wallpaper download.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "social" / "reel-boards"
SAMPLES = ROOT / "assets" / "social-samples"
W, H = 1080, 1920
JP = "/System/Library/Fonts/Hiragino Sans GB.ttc"
EN = "/System/Library/Fonts/Supplemental/Arial.ttf"
EN_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def text_font(size, bold=False, japanese=False):
    return ImageFont.truetype(JP if japanese else (EN_BOLD if bold else EN), size)


def wrap(draw, value, font, width, japanese):
    parts = list(value) if japanese else value.split(" ")
    gap = "" if japanese else " "
    lines, current = [], ""
    for part in parts:
        candidate = current + (gap if current else "") + part
        if current and draw.textbbox((0, 0), candidate, font=font)[2] > width:
            lines.append(current)
            current = part
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def base(sample):
    image = Image.open(sample).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    image = image.filter(ImageFilter.GaussianBlur(22)).convert("RGBA")
    veil = Image.new("RGBA", (W, H), (246, 246, 242, 244))
    return Image.alpha_composite(image, veil)


def draw_label(draw, index, total, language):
    label = f"{index:02d} / {total:02d}" if language == "en" else f"{index:02d} / {total:02d}"
    draw.text((74, 82), "minimal.", font=text_font(30, bold=True), fill=(18, 18, 18))
    draw.text((W - 170, 88), label, font=text_font(22, bold=True), fill=(94, 94, 90))
    draw.line((72, 142, W - 72, 142), fill=(18, 18, 18, 55), width=2)


def multiline(draw, words, y, japanese):
    f = text_font(72 if japanese else 66, bold=True, japanese=japanese)
    for line in wrap(draw, words, f, 890, japanese):
        draw.text((74, y), line, font=f, fill=(16, 16, 16))
        y += 104 if japanese else 88
    return y


def phone(canvas, sample):
    draw = ImageDraw.Draw(canvas)
    box = (262, 600, 818, 1588)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((box[0] + 20, box[1] + 28, box[2] + 20, box[3] + 28), radius=70, fill=(0, 0, 0, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas.alpha_composite(shadow)
    draw.rounded_rectangle(box, radius=74, fill=(16, 16, 16))
    inset = (box[0] + 17, box[1] + 17, box[2] - 17, box[3] - 17)
    screen = Image.open(sample).convert("RGB").resize((inset[2] - inset[0], inset[3] - inset[1]), Image.Resampling.LANCZOS)
    mask = Image.new("L", screen.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, screen.width, screen.height), radius=56, fill=255)
    canvas.paste(screen, (inset[0], inset[1]), mask)
    draw.rounded_rectangle((450, 626, 630, 660), radius=18, fill=(12, 12, 12))
    draw.rounded_rectangle((470, 1536, 610, 1544), radius=4, fill=(235, 235, 232, 210))


def checklist(canvas, title, items, japanese):
    draw = ImageDraw.Draw(canvas)
    panel = (102, 706, 978, 1438)
    draw.rounded_rectangle(panel, radius=34, fill=(19, 19, 19))
    draw.text((148, 760), title, font=text_font(31, bold=True, japanese=japanese), fill=(245, 245, 240))
    y = 864
    for number, item in enumerate(items, 1):
        draw.ellipse((150, y - 3, 198, y + 45), fill=(244, 244, 240))
        draw.text((165, y + 5), str(number), font=text_font(22, bold=True), fill=(18, 18, 18))
        f = text_font(36, bold=True, japanese=japanese)
        for line in wrap(draw, item, f, 660, japanese):
            draw.text((230, y), line, font=f, fill=(244, 244, 240))
            y += 51
        y += 72


REELS = [
    {
        "slug": "jp-quiet-iphone", "lang": "jp", "sample": "terrain-studies-01-dune-iphone-sample.jpg",
        "title": "スマホを開いた瞬間、もう疲れる人へ。",
        "sub": "画面を静かにする、3つだけの選び方。",
        "steps": ["時間が見える余白を残す", "毎日使うアプリだけ置く", "今日やる一つを決める"],
        "end": "静かなiPhone setup", "cta": "保存して、あとで整える",
        "caption": "スマホを整えるとき、最初に消したもの。\n\nホーム画面から「今すぐ必要ないもの」を外すと、時計と次に開くアプリが見つけやすくなりました。\n\n残したのは、時間が見える余白・毎日使うアプリ・今日やる一つ。\n\nあなたのホーム画面から、最初に一つ消すなら何ですか？\n\n透かし入り壁紙サンプルはプロフィールにあります。\n\n#iphoneホーム画面 #デジタルミニマリズム #壁紙",
    },
    {
        "slug": "en-quiet-iphone", "lang": "en", "sample": "terrain-studies-02-ridge-iphone-sample.jpg",
        "title": "If your iPhone feels busy before you unlock it.",
        "sub": "Three choices for a quieter screen.",
        "steps": ["Leave room for the time", "Keep only daily apps", "Choose one next task"],
        "end": "A quieter iPhone setup", "cta": "Save this for later", 
        "caption": "The first thing I removed from my iPhone home screen.\n\nWhen I removed what I do not need right now, it became easier to find the time and the next app I actually mean to open.\n\nWhat stays: room for the time, the apps I use every day, and one next task.\n\nWhat is the first thing you would remove from your home screen?\n\nThe watermarked wallpaper preview is in the profile.\n\n#iphonehomescreen #digitalminimalism #iossetup",
    },
    {
        "slug": "jp-sunday-reset", "lang": "jp", "sample": "terrain-studies-03-tide-iphone-sample.jpg",
        "title": "日曜の15分で、月曜の朝を軽くする。",
        "sub": "予定を増やす前に、置き場所をひとつにする。",
        "steps": ["来週の予定を書く", "気になることを残す", "月曜の一つを決める"],
        "end": "週を始める前の、静かな準備", "cta": "月曜の朝に見返す", 
        "caption": "月曜を少し軽くする、日曜15分。\n\n日曜に完璧な計画は作りません。来週の予定、気になっていること、月曜に始める一つだけを、忘れない場所に置いておきます。\n\n次の日曜に見返せるよう、保存しておいてください。\n\n使っているminimal Scheduleはプロフィールから見られます。\n\n#notion #週間計画 #月曜の準備",
    },
    {
        "slug": "en-sunday-reset", "lang": "en", "sample": "terrain-studies-04-stone-iphone-sample.jpg",
        "title": "A 15-minute reset for a lighter Monday.",
        "sub": "Put the week somewhere safe before it starts.",
        "steps": ["Write next week’s plans", "Capture what is on your mind", "Pick Monday’s first task"],
        "end": "A quieter start to the week", "cta": "Save for Sunday", 
        "caption": "My 15-minute Sunday reset for a lighter Monday.\n\nI do not make a perfect plan. I put next week’s plans, loose thoughts, and Monday’s first task somewhere I will not lose them.\n\nSave this for Sunday.\n\nminimal Schedule is linked in the profile.\n\n#notiontemplate #weeklyreset #productivity",
    },
    {
        "slug": "jp-screen-reset", "lang": "jp", "sample": "terrain-studies-05-moon-iphone-sample.jpg",
        "title": "机を買い替えなくても、作業画面は整えられる。",
        "sub": "最初に変えるのは、目に入る順番。",
        "steps": ["壁紙の情報量を減らす", "今日のタスクを一つ見る", "終わったら画面を閉じる"],
        "end": "今あるデスクを、少し静かに。", "cta": "あなたなら何を消す？", 
        "caption": "新しいデスクを買う前に、画面で整えた3つのこと。\n\n高い機材ではなく、今ある画面で最初に目に入るものを変えました。\n\n壁紙の情報量を減らす。今日のタスクを一つだけ見る。終わったら画面を閉じる。\n\nあなたなら、ホーム画面から何を一つ消しますか？\n\n#デスクセットアップ #macbook #デジタルミニマリズム",
    },
    {
        "slug": "en-screen-reset", "lang": "en", "sample": "terrain-studies-06-fog-iphone-sample.jpg",
        "title": "You do not need a new desk to make work feel calmer.",
        "sub": "Start with the order of what you see.",
        "steps": ["Reduce visual noise", "See one task for today", "Close the screen when done"],
        "end": "A quieter screen setup", "cta": "What would you remove first?", 
        "caption": "Three things I changed on my screen before buying any desk gear.\n\nI started with the first things I see on the screen I already own: less visual noise in the wallpaper, one task for today, and closing the screen when I am done.\n\nWhat is one thing you would remove from your home screen?\n\n#desksetup #macbooksetup #digitalminimalism",
    },
]


def make_reel(data):
    japanese = data["lang"] == "jp"
    sample = SAMPLES / data["sample"]
    folder = OUT / data["slug"]
    folder.mkdir(parents=True, exist_ok=True)
    total = 4

    # Frame 1 earns the pause with a familiar problem, not a product name.
    canvas = base(sample)
    draw = ImageDraw.Draw(canvas)
    draw_label(draw, 1, total, data["lang"])
    y = multiline(draw, data["title"], 270, japanese)
    draw.text((76, y + 42), data["sub"], font=text_font(30, japanese=japanese), fill=(85, 85, 80))
    phone(canvas, sample)
    canvas.convert("RGB").save(folder / "01-hook.jpg", quality=92)

    # Frame 2 makes the product's role tangible and keeps the SAMPLE visible.
    canvas = base(sample)
    draw = ImageDraw.Draw(canvas)
    draw_label(draw, 2, total, data["lang"])
    heading = "画面に残すもの" if japanese else "WHAT STAYS ON SCREEN"
    draw.text((74, 264), heading, font=text_font(42, bold=True, japanese=japanese), fill=(17, 17, 17))
    phone(canvas, sample)
    draw.rounded_rectangle((94, 1642, 986, 1772), radius=20, fill=(18, 18, 18))
    marker = "透かし入りサンプル。購入前に見え方を試せます。" if japanese else "Watermarked sample. Preview how it feels before buying."
    draw.text((126, 1685), marker, font=text_font(25, japanese=japanese), fill=(246, 246, 241))
    canvas.convert("RGB").save(folder / "02-screen.jpg", quality=92)

    # Frame 3 is a copyable three-step system.
    canvas = base(sample)
    draw = ImageDraw.Draw(canvas)
    draw_label(draw, 3, total, data["lang"])
    checklist(canvas, "3 STEPS" if not japanese else "3つだけ", data["steps"], japanese)
    canvas.convert("RGB").save(folder / "03-steps.jpg", quality=92)

    # Frame 4 prompts save/comment rather than an immediate hard sell.
    canvas = base(sample)
    draw = ImageDraw.Draw(canvas)
    draw_label(draw, 4, total, data["lang"])
    y = multiline(draw, data["end"], 370, japanese)
    draw.text((74, y + 40), data["cta"], font=text_font(40, bold=True, japanese=japanese), fill=(16, 16, 16))
    draw.line((74, y + 118, 492, y + 118), fill=(16, 16, 16), width=3)
    draw.text((74, y + 150), "minimal.  ·  profile link" if not japanese else "minimal.  ·  プロフィールから", font=text_font(26, bold=True, japanese=japanese), fill=(81, 81, 77))
    canvas.convert("RGB").save(folder / "04-cta.jpg", quality=92)


def main():
    for reel in REELS:
        make_reel(reel)


if __name__ == "__main__":
    main()
