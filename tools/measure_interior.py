"""Find the flat interior of a frame artwork.

The ornament is high-frequency; the interior is smooth. Scan inward from each
edge along the middle band and take the first index where the detail signal
stays low for a sustained run. Verified by drawing the rectangle back onto the
art (see the *_check.png files).
"""
import glob, os, sys
import numpy as np
from PIL import Image, ImageDraw

BASE = r"D:/Things I Need/IDX Projects/Kreatech/mrs-g6/public/assets/themes/"
OUT = r"C:/Users/nices/AppData/Local/Temp/claude/D--Things-I-Need-IDX-Projects-Kreatech-mrs-g6/32afc0a2-314c-4689-b757-1d932664e9f3/scratchpad/insets/"
os.makedirs(OUT, exist_ok=True)


def detail_map(im):
    a = np.asarray(im.convert("RGBA")).astype(float)
    alpha = a[..., 3] / 255.0
    lum = (a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114) * alpha
    gx = np.abs(np.gradient(lum, axis=1))
    gy = np.abs(np.gradient(lum, axis=0))
    d = gx + gy
    # transparent regions count as ornament edge so the scan stops at the art
    d = np.where(alpha < 0.75, d.max() if d.max() else 1.0, d)
    return d, alpha


def scan(profile, limit, thresh, run):
    """First index where `profile` stays under `thresh` for `run` samples."""
    n = len(profile)
    for i in range(min(limit, n - run)):
        if np.all(profile[i:i + run] < thresh):
            return i
    return 0


def measure(path):
    im = Image.open(path)
    d, alpha = detail_map(im)
    h, w = d.shape
    # middle bands, averaged, so a single ornament spur doesn't dominate
    rowband = d[int(h * 0.42):int(h * 0.58), :].mean(axis=0)
    colband = d[:, int(w * 0.42):int(w * 0.58)].mean(axis=1)
    # noise floor from the very centre of the art
    core = d[int(h * 0.4):int(h * 0.6), int(w * 0.4):int(w * 0.6)]
    thr = max(core.mean() * 2.2 + 1.0, np.percentile(d, 55))
    runw, runh = max(6, w // 40), max(6, h // 40)
    l = scan(rowband, int(w * 0.45), thr, runw)
    r = scan(rowband[::-1], int(w * 0.45), thr, runw)
    t = scan(colband, int(h * 0.45), thr, runh)
    b = scan(colband[::-1], int(h * 0.45), thr, runh)
    return w, h, t, r, b, l


def check(path, t, r, b, l, name):
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", im.size, (18, 18, 22, 255))
    bg.alpha_composite(im)
    im = bg.convert("RGB")
    dr = ImageDraw.Draw(im)
    w, h = im.size
    dr.rectangle([l, t, w - r, h - b], outline=(255, 0, 128), width=max(2, w // 200))
    im.thumbnail((300, 300))
    im.save(OUT + name + "_check.png")


targets = sys.argv[1:] or ["card-frame", "title-plaque", "plaque", "stat-card", "row-frame", "table-frame"]
for kind in targets:
    print(f"\n== {kind}")
    for p in sorted(glob.glob(BASE + "*/war/" + kind + ".webp")):
        theme = p.replace("\\", "/").split("/")[-3]
        w, h, t, r, b, l = measure(p)
        print(f"  {theme:9s} {w}x{h}  T {100*t/h:5.1f}%  R {100*r/w:5.1f}%  B {100*b/h:5.1f}%  L {100*l/w:5.1f}%")
        check(p, t, r, b, l, f"{theme}-{kind}")
