from PIL import Image
from collections import Counter
import os

Q = r'C:\Users\pierr\dev\azote\qa\shots2'
CREAM = (236, 231, 219); PANEL = (227, 221, 207)
LINEC = (199, 194, 183); LINEP = (192, 186, 174); INK = (30, 27, 21)

def d(a, b): return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5
def lum(c):
    def f(v):
        v /= 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
def contrast(a, b):
    l1, l2 = lum(a), lum(b); hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)
def hx(c): return '#%02x%02x%02x' % c[:3]

def klass(c):
    cands = [('CREME', CREAM, 6), ('PANEL', PANEL, 6), ('FILET', LINEC, 14), ('FILET', LINEP, 14), ('ENCRE', INK, 30)]
    best = None
    for name, ref, tol in cands:
        dd = d(c, ref)
        if dd <= tol and (best is None or dd < best[0]):
            best = (dd, name)
    return best[1] if best else 'CONTENU'

def analyse(fn):
    im = Image.open(os.path.join(Q, fn)).convert('RGB')
    W, H = im.size; px = im.load()
    rows = []
    for y in range(H):
        cnt = Counter(px[x, y] for x in range(0, W, 2))
        mode = cnt.most_common(1)[0][0]
        rows.append((mode, klass(mode)))
    runs = []
    s = 0
    for y in range(1, H + 1):
        if y == H or rows[y][1] != rows[s][1]:
            runs.append({'c': rows[s][1], 'y0': s, 'y1': y - 1, 'h': y - s, 'rgb': rows[(s + y - 1) // 2][0]})
            s = y
    return W, H, runs

print('#' * 80)
for slug in ('home', 'degustation', 'laboratoire', 'reserver'):
    W, H, runs = analyse(f'{slug}__full.png')
    print(f"\n=== {slug}__full.png  {W}x{H}")
    bands = [r for r in runs if r['h'] >= 20]
    prev = None
    for r in bands:
        cr = f"  (contraste voisin {contrast(r['rgb'], prev['rgb']):.3f}:1)" if prev else ''
        print(f"  {r['c']:<6} y {r['y0']:>5}-{r['y1']:<5} h={r['h']:>4} {hx(r['rgb'])}{cr}")
        prev = r
    fil = [r for r in runs if r['c'] == 'FILET']
    print(f"  -> filets détectés : {len(fil)}  " + ', '.join(f"y={r['y0']}" for r in fil[:22]))
