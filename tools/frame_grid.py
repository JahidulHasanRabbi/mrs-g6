"""Render a Boss War frame's artwork under a percent grid, per theme.

Some skin values cannot be measured automatically, so they are authored per
theme and read off these overlays by eye:

    earnTile.box  the tile interior the label, icon and CTA sit in
    war.tablePad  how far the History frame's corner ornament reaches inward

gen_skins.py cannot find either. Its detail scan lands on kgame99's painted
clouds and lv918's interior filigree, its metal test misses lv918's rose-gold
rail, and measure_pinch reads these card interiors at 50-70% of the art width.
Re-run this and re-read the numbers when the art changes.

    python tools/frame_grid.py earnTile          # every theme, one asset
    python tools/frame_grid.py tableFrame ep369  # one theme
"""
import os
import re
import sys
from PIL import Image

ROOT = r"D:/Things I Need/IDX Projects/Kreatech/mrs-g6/"
OUT = ROOT + ".next/frame-grid/"
THEMES = ("acebet77", "ubetclub", "ep369", "kgame99", "lv918", "n1gang")
H, PAD = 700, 50


def asset_file(theme, key):
    """Resolve ASSETS.war.<key> to a real file under public/ (as gen_skins.py does)."""
    src = open(ROOT + f"app/components/themes/{theme}/assets.js", encoding="utf-8").read()
    war = re.search(r"^  war: \{(.*?)^  \},", src, re.S | re.M)
    if not war:
        return None
    m = re.search(rf"^\s*{key}: `\$\{{BASE\}}/war/([^`]+)`", war.group(1), re.M)
    if not m:
        return None
    p = ROOT + f"public/assets/themes/{theme}/war/{m.group(1)}"
    return p if os.path.exists(p) else None


key = sys.argv[1] if len(sys.argv) > 1 else "earnTile"
os.makedirs(OUT, exist_ok=True)
for theme in sys.argv[2:] or THEMES:
    src = asset_file(theme, key)
    if not src:
        print(f"{theme}: no war.{key}"); continue
    art = Image.open(src).convert("RGBA")
    w, h = art.size
    W = int(w * H / h)
    sheet = Image.new("RGBA", (W + PAD + 10, H + 40), (20, 20, 20, 255))
    sheet.alpha_composite(art.resize((W, H)), (PAD, 20))
    from PIL import ImageDraw
    dr = ImageDraw.Draw(sheet)
    for pct in range(0, 101, 5):
        y, x = 20 + H * pct // 100, PAD + W * pct // 100
        major = pct % 25 == 0
        dr.line([PAD, y, PAD + W, y], fill=(255, 80, 80, 200) if major else (255, 255, 255, 80))
        dr.line([x, 20, x, 20 + H], fill=(80, 160, 255, 200) if major else (255, 255, 255, 80))
        dr.text((6, y - 6), str(pct), fill=(255, 255, 255, 255))
        if pct % 10 == 0:
            dr.text((x - 6, H + 24), str(pct), fill=(255, 255, 255, 255))
    dst = OUT + f"{key}-{theme}.png"
    sheet.convert("RGB").save(dst)
    print(f"{theme}: {os.path.basename(src)} {w}x{h} (aspect {w / h:.3f}) -> {dst}")
