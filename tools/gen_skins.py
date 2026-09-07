"""Regenerate each theme's Boss War frame specs from the artwork itself.

The hand-entered slice numbers were rough estimates from the export agents.
This measures the real ornament thickness per file and emits warFrame() calls
carrying the art's pixel size, so the border scales uniformly (no squashing).
"""
import os
import re
import numpy as np
from PIL import Image

ROOT = r"D:/Things I Need/IDX Projects/Kreatech/mrs-g6/"
PUB = ROOT + "public/assets/themes/"

THEMES = {
    "acebet77": ("Acebet77RpgSkin.jsx", "ACEBET_ASSETS"),
    "ubetclub": ("UbetclubRpgSkin.jsx", "UBET_ASSETS"),
    "ep369": ("Ep369RpgSkin.jsx", "EP369_ASSETS"),
    "kgame99": ("Kgame99RpgSkin.jsx", "KGAME99_ASSETS"),
    "lv918": ("Lv918RpgSkin.jsx", "LV918_ASSETS"),
    "n1gang": ("N1gangRpgSkin.jsx", "N1GANG_ASSETS"),
}
# skin key -> (assets key, reference box)
SPECS = {
    "card": ("cardFrame", (358, 160)),
    "statCard": ("statCard", (358, 96)),
    "table": ("tableFrame", (358, 440)),
    "row": ("rowFrame", (358, 52)),
    "plaque": ("plaque", (358, 213)),
}


def detail(im):
    a = np.asarray(im.convert("RGBA")).astype(float)
    al = a[..., 3] / 255.0
    lum = (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114) * al
    d = np.abs(np.gradient(lum, axis=1)) + np.abs(np.gradient(lum, axis=0))
    return np.where(al < 0.75, max(d.max(), 1.0), d)


def scan(prof, limit, thr, run):
    for i in range(min(limit, len(prof) - run)):
        if np.all(prof[i:i + run] < thr):
            return i
    return 0


def measure(path):
    im = Image.open(path)
    d = detail(im)
    h, w = d.shape
    rb = d[int(h * .42):int(h * .58), :].mean(axis=0)
    cb = d[:, int(w * .42):int(w * .58)].mean(axis=1)
    core = d[int(h * .4):int(h * .6), int(w * .4):int(w * .6)]
    thr = max(core.mean() * 2.2 + 1.0, np.percentile(d, 55))
    rw_, rh_ = max(6, w // 40), max(6, h // 40)
    t = scan(cb, int(h * .45), thr, rh_)
    b = scan(cb[::-1], int(h * .45), thr, rh_)
    l = scan(rb, int(w * .45), thr, rw_)
    r = scan(rb[::-1], int(w * .45), thr, rw_)
    f = lambda v, dim: round(100 * v / dim, 1)
    return (w, h, max(f(t, h), 2.0), max(f(r, w), 2.0), max(f(b, h), 2.0), max(f(l, w), 2.0))


def asset_file(theme, key):
    """Resolve ASSETS.war.<key> to a real file under public/."""
    src = open(ROOT + f"app/components/themes/{theme}/assets.js", encoding="utf-8").read()
    m = re.search(r"^  war: \{(.*?)^  \},", src, re.S | re.M)
    if not m:
        return None
    blk = m.group(1)
    mm = re.search(rf"^\s*{key}: `\$\{{BASE\}}/war/([^`]+)`", blk, re.M)
    if not mm:
        return None
    p = PUB + theme + "/war/" + mm.group(1)
    return p if os.path.exists(p) else None


for theme, (fname, const) in THEMES.items():
    lines = []
    for skin_key, (asset_key, box) in SPECS.items():
        p = asset_file(theme, asset_key)
        if not p:
            continue
        w, h, t, r, b, l = measure(p)
        lines.append(
            f"    {skin_key}: warFrame({const}.war.{asset_key}, {t}, {r}, {b}, {l}, "
            f"[{box[0]}, {box[1]}], {{ art: [{w}, {h}] }}),"
        )
    path = ROOT + f"app/components/themes/{theme}/{fname}"
    s = open(path, encoding="utf-8").read()
    # replace only the warFrame(...) lines inside the war block, keep the rest
    s2 = re.sub(r"^    (?:card|statCard|table|row|plaque): warFrame\([^\n]*\n", "", s, flags=re.M)
    s2 = s2.replace("  war: {\n", "  war: {\n" + "\n".join(lines) + "\n", 1)
    assert s2 != s
    open(path, "w", encoding="utf-8").write(s2)
    print(f"{theme}: {len(lines)} frames measured")
