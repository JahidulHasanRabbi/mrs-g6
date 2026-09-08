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
# skin key -> (assets key, reference box, extra vertical padding)
# `row` dresses the Boss Info / Rewards blocks as well as a one-line
# leaderboard row, and at three lines tall the default gap read cramped.
SPECS = {
    "card": ("cardFrame", (358, 160), None),
    "statCard": ("statCard", (358, 96), None),
    "table": ("tableFrame", (358, 440), None),
    "row": ("rowFrame", (358, 52), 12),
    "plaque": ("plaque", (358, 213), None),
}

# measure() reads titleInset off the crown's filigree opening. On the plaques
# that hang a solid gem crown (kgame99, lv918) that opening sits well above the
# flat writable panel, so the title rode high into the ornament. Eyeballed off
# each panel's own top/bottom bevel (top, bottom).
TITLE_INSET = {
    "kgame99": (31.0, 15.0),
    "lv918": (31.0, 15.0),
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
    core = d[int(h * .4):int(h * .6), int(w * .4):int(w * .6)]
    thr = max(core.mean() * 2.2 + 1.0, np.percentile(d, 55))
    rw_, rh_ = max(6, w // 40), max(6, h // 40)
    # Top and bottom take the widest reading: the crown and the foot ornament
    # have to live inside the corner slices or the middle stretches them.
    cb = d[:, int(w * .42):int(w * .58)].mean(axis=1)
    t = scan(cb, int(h * .45), thr, rh_)
    b = scan(cb[::-1], int(h * .45), thr, rh_)
    # Left and right take the NARROWEST reading across the height. Sampling
    # only the waist caught the diamonds several frames hang at mid-height and
    # read them as rail: the plaque measured a 15.7% side border where the rail
    # is ~6%, and the content box lost 47px to it.
    ls, rs = [], []
    for frac in (0.12, 0.22, 0.32, 0.5, 0.68, 0.78, 0.88):
        band = d[int(h * (frac - .04)):int(h * (frac + .04)), :].mean(axis=0)
        ls.append(scan(band, int(w * .45), thr, rw_))
        rs.append(scan(band[::-1], int(w * .45), thr, rw_))
    l, r = min(ls), min(rs)
    f = lambda v, dim: round(100 * v / dim, 1)
    return (w, h, max(f(t, h), 2.0), max(f(r, w), 2.0), max(f(b, h), 2.0), max(f(l, w), 2.0))


def metal_edges(path):
    """Where the interior starts, by asking what the ornament is made of: every
    station's rail is gold or polished silver and no interior is. detail() reads
    a smooth rail face as interior — it has no edges in its middle — which
    floored ep369's row frame at 2% and let the label ride the rail."""
    a = np.asarray(Image.open(path).convert("RGBA")).astype(float) / 255.0
    al = a[..., 3]
    h, w = al.shape
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a[..., :3].max(axis=2), a[..., :3].min(axis=2)
    chroma = mx - mn
    sat = np.where(mx > 1e-6, chroma / np.maximum(mx, 1e-6), 0)
    with np.errstate(invalid="ignore", divide="ignore"):
        hue = np.select(
            [chroma == 0, mx == r, mx == g],
            [0.0,
             ((g - b) / np.maximum(chroma, 1e-6)) % 6,
             (b - r) / np.maximum(chroma, 1e-6) + 2],
            default=(r - g) / np.maximum(chroma, 1e-6) + 4,
        ) * 60.0
    gold = (mx > .45) & (hue >= 20) & (hue <= 70) & (sat > .32)
    silver = (mx > .72) & (sat < .22)
    metal = (al > .5) & (gold | silver)
    band = slice(int(w * .40), int(w * .60))
    prof = metal[:, band].mean(axis=1)
    opaque = al[:, band].mean(axis=1) > .5
    run = max(4, h // 45)

    def first_interior(p, o):
        for i in range(len(p) - run):
            if o[i] and np.all(p[i:i + run] < .25):
                return i
        return 0

    f = lambda v, dim: round(100 * v / dim, 1)
    return f(first_interior(prof, opaque), h), f(first_interior(prof[::-1], opaque[::-1]), h)


def longest_run(mask):
    best = (0, 0, 0)
    i, n = 0, len(mask)
    while i < n:
        if mask[i]:
            j = i
            while j < n and mask[j]:
                j += 1
            if j - i > best[0]:
                best = (j - i, i, j)
            i = j
        else:
            i += 1
    return best[1], best[2]


def flat_run(prof):
    """Longest featureless stretch of a detail profile — a frame's interior."""
    thr = np.percentile(prof, 40) + max(prof.mean() * .35, 1.5)
    return longest_run(prof < thr)


def measure_timer(path):
    """Timer plaque: natural aspect, the countdown's window, and where the
    pill itself sits (the crown some plaques hang above it is not the pill)."""
    im = Image.open(path)
    d = detail(im)
    h, w = d.shape
    l, r = flat_run(d[int(h * .44):int(h * .56), :].mean(axis=0))
    # Probe verticals on the window's right third, clear of the crown/shield
    # ornament several plaques hang off the top-centre of the border.
    t, b = flat_run(d[:, int(l + (r - l) * .62):int(l + (r - l) * .92)].mean(axis=1))
    al = np.asarray(im.convert("RGBA"))[..., 3] / 255.0
    rows = np.where(al[:, int(w * .68):int(w * .82)].mean(axis=1) > .6)[0]
    f = lambda v, dim: round(100 * v / dim, 1)
    return (
        round(w / h, 3),
        [f(l, w), f(r, w), f(t, h), f(b, h)],
        [f(rows[0], h), f(rows[-1] + 1, h)],
    )


def measure_pinch(path, side):
    """How much narrower the interior is at its top and bottom than at its
    waist, as % of art width. These frames are chevrons, not rectangles, so a
    rectangular padding box let the first label ride the diagonal."""
    im = Image.open(path)
    d = detail(im)
    h, w = d.shape

    def inset(frac):
        band = d[int(h * (frac - .04)):int(h * (frac + .04)), :].mean(axis=0)
        thr = np.percentile(band, 40) + max(band.mean() * .35, 1.5)
        l, r = longest_run(band < thr)
        return max(l, w - r)

    pinch = max(inset(.20), inset(.80)) - inset(.50)
    # Capped: on a frame that is not a chevron this measures interior detail,
    # not a diagonal, and an unclamped value swallowed the content box.
    waist = round(min(8.0, max(0.0, 100 * pinch / w)), 1)
    # Content as tall as the row (the Rewards badge) reaches the diagonal's
    # widest point, at the very ends — which the waist sample undershoots by
    # enough to put the badge on the rail. A reading past 15% of the width is
    # interior detail, not a rail, so a non-chevron frame keeps the waist value.
    ends = 100 * max(inset(.13), inset(.87)) / w
    return max(waist, round(min(10.0, ends - side), 1)) if ends <= 15.0 else waist


def measure_button(path):
    """ATTACK plaque: the opening its label sits in. Every one of these hangs
    an ornament off the top, so the opening's centre is 55-61% down the art,
    not 50% — centring the label on the box put it visibly high."""
    im = Image.open(path)
    d = detail(im)
    h, w = d.shape
    l, r = flat_run(d[int(h * .44):int(h * .56), :].mean(axis=0))
    t, b = flat_run(d[:, int(l + (r - l) * .3):int(l + (r - l) * .7)].mean(axis=1))
    f = lambda v, dim: round(100 * v / dim, 1)
    return [f(l, w), f(r, w), f(t, h), f(b, h)]


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


# Keys this script owns. Anything else in a theme's `war` block is a decision
# a person made (ink, the baked CTA band) and is preserved.
# bossFrame stays authored: its opening is measured by a separate pass.
MEASURED_KEYS = ("timerAspect", "timerWindow", "timerBody", "titleInset",
                 "card", "statCard", "table", "row", "plaque")

HEADER = """// GENERATED by tools/gen_skins.py — do not edit.
// Every value here is measured off this theme's own artwork under
// public/assets/themes/{theme}/war/. Re-run the script when the art changes.

import {{ warFrame }} from "../../rpg/rpgSkin";
import {{ {const} }} from "./assets";

export const WAR_FRAMES = {{
"""

for theme, (fname, const) in THEMES.items():
    lines = []
    tp = asset_file(theme, "timerPlaque")
    if tp:
        aspect, win, body = measure_timer(tp)
        lines += [
            f"  timerAspect: {aspect},",
            f"  timerWindow: [{', '.join(str(v) for v in win)}],",
            f"  timerBody: [{', '.join(str(v) for v in body)}],",
        ]
    tpl = asset_file(theme, "titlePlaque")
    if tpl:
        _, _, t, r, b, l = measure(tpl)
        if theme in TITLE_INSET:
            t, b = TITLE_INSET[theme]
        lines.append(f"  titleInset: {{ top: {t}, right: {r}, bottom: {b}, left: {l} }},")
    ab = asset_file(theme, "attackBtn")
    if ab:
        lines.append(f"  attackWindow: [{', '.join(str(v) for v in measure_button(ab))}],")
    et = asset_file(theme, "earnTile")
    if et:
        ew, eh = Image.open(et).size
        lines.append(f"  earnTileAspect: {round(ew / eh, 3)},")
    for skin_key, (asset_key, box, pad_y) in SPECS.items():
        path_ = asset_file(theme, asset_key)
        if not path_:
            continue
        w, h, t, r, b, l = measure(path_)
        # A rail is never thinner than the metal in it. Deliberately NOT applied
        # to titleInset: kgame99's and lv918's header crowns are solid filigree
        # and this reads 41% into the plaque there.
        mt, mb = metal_edges(path_)
        t, b = max(t, mt), max(b, mb)
        pinch = measure_pinch(path_, min(r, l))
        lines.append(
            f"  {skin_key}: warFrame({const}.war.{asset_key}, {t}, {r}, {b}, {l}, "
            f"[{box[0]}, {box[1]}], {{ art: [{w}, {h}]"
            + (f", pinch: {pinch}" if skin_key == "row" and pinch >= 1.0 else "")
            + (f", padY: {pad_y}" if pad_y else "")
            # The plaque's crown ornament runs much taller (16-26% of the art)
            # than a card/row rail ever does; the default 30px cap squashed it
            # to a sliver and let the stretch-fill middle balloon sideways to
            # match, warping the crown. A taller cap keeps its own scale close
            # to the corners' so the top edge stretches by roughly the same
            # factor in both directions.
            + (", cap: 56" if skin_key == "plaque" else "")
            + f" }}),"
        )

    out = ROOT + f"app/components/themes/{theme}/warFrames.generated.js"
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(HEADER.format(theme=theme, const=const) + "\n".join(lines) + "\n};\n")
    print(f"{theme}: warFrames.generated.js — {len(lines)} measured values")

    # Prune the measured keys out of the authored skin and spread them in, so a
    # rerun can never revert a hand-made decision (and never churns the file).
    skin_path = ROOT + f"app/components/themes/{theme}/{fname}"
    src = open(skin_path, encoding="utf-8").read()
    m = re.search(r"^  war: \{\n(.*?)^  \},$", src, re.S | re.M)
    if not m:
        print(f"   {theme}: no war block found"); continue
    # The spread goes back in below, so drop the one a previous run left —
    # keeping it stacked another copy on every rerun.
    drop = re.compile(r"^    (?:\.\.\.WAR_FRAMES,|(?:%s):)" % "|".join(MEASURED_KEYS))
    kept = [ln for ln in m.group(1).split("\n") if ln.strip() and not drop.match(ln)]
    body = "\n".join(["  war: {", "    ...WAR_FRAMES,"] + kept + ["  },"])
    src = src[:m.start()] + body + src[m.end():]
    if "warFrames.generated" not in src:
        src = src.replace(
            'import { THEME_IDS } from "../../../config/themes";',
            'import { THEME_IDS } from "../../../config/themes";\n'
            'import { WAR_FRAMES } from "./warFrames.generated";', 1)
    # warFrame is only referenced from the generated module now.
    if "warFrame(" not in src:
        src = src.replace(", warFrame }", " }", 1)
    open(skin_path, "w", encoding="utf-8").write(src)
    print(f"   {theme}: skin spreads WAR_FRAMES, {len(kept)} authored line(s) kept")
