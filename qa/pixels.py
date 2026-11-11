"""Pixel-level verification of the rendered AZOTE screenshots."""
from PIL import Image
from collections import Counter
import json, os, math

SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots')

def srgb_lin(v):
    v = v / 255.0
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

def lum(c):
    r, g, b = c[:3]
    return 0.2126 * srgb_lin(r) + 0.7152 * srgb_lin(g) + 0.0722 * srgb_lin(b)

def contrast(a, b):
    l1, l2 = lum(a), lum(b)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def hexc(c):
    return '#%02x%02x%02x' % c[:3]

def analyse(name, step=3):
    im = Image.open(os.path.join(SH, name)).convert('RGB')
    W, H = im.size
    px = im.load()
    rows = []
    for y in range(H):
        cnt = Counter(px[x, y] for x in range(0, W, step))
        mode, n = cnt.most_common(1)[0]
        dark = sum(v for k, v in cnt.items() if abs(k[0]-mode[0]) + abs(k[1]-mode[1]) + abs(k[2]-mode[2]) > 40)
        rows.append((mode, dark / float(sum(cnt.values()))))
    # group consecutive rows by mode colour (tolerance 3)
    runs = []
    start = 0
    for y in range(1, H + 1):
        if y == H or max(abs(rows[y][0][i] - rows[start][0][i]) for i in range(3)) > 3:
            mid = rows[(start + y - 1) // 2][0]
            runs.append({'y0': start, 'y1': y - 1, 'h': y - start, 'color': hexc(mid), 'rgb': mid})
            start = y
    bands = [r for r in runs if r['h'] >= 24]
    filets = [r for r in runs if r['h'] <= 3 and rows[r['y0']][1] > 0.55]
    return {'file': name, 'W': W, 'H': H, 'bands': bands, 'filetRows': filets}

def report(page):
    out = {}
    for suffix in ('full', 'mid'):
        fn = f'{page}__desktop__{suffix}.png'
        if not os.path.exists(os.path.join(SH, fn)):
            continue
        r = analyse(fn)
        print('=' * 78)
        print(f"{fn}  ({r['W']}x{r['H']})")
        print('  bandes de fond (>=24 px de haut) :')
        prev = None
        for b in r['bands']:
            cr = f"  contrast/bande préc. = {contrast(b['rgb'], prev['rgb']):.3f}:1" if prev else ''
            print(f"    y {b['y0']:>5}-{b['y1']:<5} h={b['h']:>4}  {b['color']}{cr}")
            prev = b
        print(f"  lignes 'filet' pleine largeur : {len(r['filetRows'])} -> " +
              ', '.join(f"y={f['y0']}" for f in r['filetRows'][:14]))
        # accent red share
        im = Image.open(os.path.join(SH, f'{page}__desktop__full.png')).convert('RGB')
        px = im.load(); W, H = im.size
        tot = 0; red = 0
        for y in range(0, H, 4):
            for x in range(0, W, 4):
                c = px[x, y]; tot += 1
                if abs(c[0]-142) < 42 and abs(c[1]-47) < 42 and abs(c[2]-31) < 42:
                    red += 1
        print(f"  pixels proches du bordeaux #8e2f1f : {100.0*red/tot:.2f} % de l'image")

for p in ('home', 'degustation', 'laboratoire', 'reserver'):
    report(p)
