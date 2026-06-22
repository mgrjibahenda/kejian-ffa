import math, json
from collections import Counter

PX, PY = 0.04, -0.08      # pole axis offset (held lower-right)
RZ = [1.5708, 0, 0]       # cyl/torus around -z axis
parts = []

def add(shape, dims, mat, pos, rot=None, neon=None, glow=None, note=None):
    p = {"shape": shape, "dims": [round(d, 4) for d in dims], "mat": mat,
         "pos": [round(c, 4) for c in pos]}
    if rot is not None:
        p["rot"] = [round(r, 4) for r in rot]
    if neon:
        p["neon"] = 1
    if glow is not None:
        p["glow"] = glow
    if note:
        p["note"] = note
    parts.append(p)

# ============================================================
# 1) JADE POLE  (smooth tapered cylinders along z)
# ============================================================
add("cyl", [0.046, 0.05, 1.85], "neondark", [PX, PY, 0.32], RZ, neon=1, note="jade pole core")
add("cyl", [0.05, 0.052, 1.7], "neon", [PX, PY, 0.3], RZ, neon=1, glow=0.4, note="jade pole sheath")

for z in [0.95, 0.78, 0.6, 0.42, 0.24, 0.06, -0.12, -0.3]:
    add("torus", [0.054, 0.006], "gold", [PX, PY, z], RZ, note="scale ring")
for z in [0.87, 0.51, 0.15, -0.21]:
    add("torus", [0.053, 0.004], "neonbright", [PX, PY, z], RZ, neon=1, glow=0.5)

# grip wraps
add("cyl", [0.058, 0.058, 0.2], "rubber", [PX, PY, 0.92], RZ, note="upper grip")
add("cyl", [0.058, 0.058, 0.2], "rubber", [PX, PY, 0.6], RZ, note="lower grip")
for z in [1.02, 0.82, 0.7, 0.5]:
    add("torus", [0.062, 0.007], "gold", [PX, PY, z], RZ)

# pommel
add("cyl", [0.06, 0.052, 0.06], "gold", [PX, PY, 1.16], RZ, note="pommel collar")
add("sphere", [0.062], "gold", [PX, PY, 1.24], note="pommel knob")
add("sphere", [0.04], "neonbright", [PX, PY, 1.29], neon=1, glow=0.7, note="pommel gem")
add("torus", [0.05, 0.006], "gold", [PX, PY, 1.22], RZ)

# ============================================================
# 2) RED TASSEL
# ============================================================
add("sphere", [0.05], "gold", [PX, PY - 0.06, 0.72], note="tassel bead")
add("cyl", [0.034, 0.026, 0.06], "gold", [PX, PY - 0.12, 0.72], note="tassel cap")
cord_specs = [(-0.028, 0.18, -0.05), (-0.014, 0.2, -0.02), (0.0, 0.21, 0.0),
              (0.014, 0.2, 0.02), (0.028, 0.18, 0.05)]
for dx, ln, zr in cord_specs:
    add("cone", [0.014, ln], "tassel", [PX + dx, PY - 0.2 - ln * 0.4, 0.72],
        [zr * 0.6, 0, dx * 5], note="tassel cord")
add("cone", [0.013, 0.19], "tassel", [PX, PY - 0.21, 0.66], [-0.3, 0, 0])
add("cone", [0.013, 0.2], "tassel", [PX, PY - 0.22, 0.78], [0.35, 0, 0])
for dx in (-0.02, 0.0, 0.02):
    add("sphere", [0.016], "tassel", [PX + dx, PY - 0.36, 0.72])

# ============================================================
# 3) DRAGON-HEAD COLLAR  (azure jade, smooth)  at z ~ -0.52
# ============================================================
DZ = -0.52
add("cyl", [0.07, 0.052, 0.16], "gold", [PX, PY, -0.34], RZ, note="collar ferrule")
add("torus", [0.075, 0.014], "gold", [PX, PY, -0.42], RZ, note="collar lip")
add("sphere", [0.1], "neon", [PX, PY + 0.01, DZ], neon=1, glow=0.5, note="cranium")
add("sphere", [0.085], "neon", [PX, PY - 0.02, DZ - 0.06], neon=1, glow=0.4, note="jaw mass")
add("cone", [0.062, 0.2], "neon", [PX, PY - 0.03, DZ - 0.18], [-1.571, 0, 0], neon=1, glow=0.4, note="snout")
add("sphere", [0.05], "neon", [PX, PY - 0.05, DZ - 0.12], neon=1, glow=0.4, note="muzzle")
add("sphere", [0.018], "neondark", [PX + 0.03, PY - 0.02, DZ - 0.22], neon=1, note="nostril")
add("sphere", [0.018], "neondark", [PX - 0.03, PY - 0.02, DZ - 0.22], neon=1, note="nostril")
add("sphere", [0.03], "neondark", [PX + 0.06, PY + 0.06, DZ - 0.04], neon=1, note="brow")
add("sphere", [0.03], "neondark", [PX - 0.06, PY + 0.06, DZ - 0.04], neon=1, note="brow")
add("sphere", [0.026], "neonbright", [PX + 0.07, PY + 0.02, DZ - 0.06], neon=1, glow=0.8, note="eye")
add("sphere", [0.026], "neonbright", [PX - 0.07, PY + 0.02, DZ - 0.06], neon=1, glow=0.8, note="eye")
add("sphere", [0.01], "dark", [PX + 0.075, PY + 0.02, DZ - 0.085], note="pupil")
add("sphere", [0.01], "dark", [PX - 0.075, PY + 0.02, DZ - 0.085], note="pupil")
add("torus", [0.03, 0.006], "gold", [PX + 0.07, PY + 0.02, DZ - 0.05], RZ)
add("torus", [0.03, 0.006], "gold", [PX - 0.07, PY + 0.02, DZ - 0.05], RZ)
add("cone", [0.026, 0.26], "gold", [PX + 0.07, PY + 0.12, DZ + 0.02], [0.7, 0, 0.4], note="horn")
add("cone", [0.026, 0.26], "gold", [PX - 0.07, PY + 0.12, DZ + 0.02], [0.7, 0, -0.4], note="horn")
add("cone", [0.016, 0.13], "gold", [PX + 0.09, PY + 0.16, DZ + 0.1], [0.9, 0, 0.6], note="horn tine")
add("cone", [0.016, 0.13], "gold", [PX - 0.09, PY + 0.16, DZ + 0.1], [0.9, 0, -0.6], note="horn tine")
add("sphere", [0.016], "neonbright", [PX + 0.105, PY + 0.24, DZ + 0.12], neon=1, glow=0.7)
add("sphere", [0.016], "neonbright", [PX - 0.105, PY + 0.24, DZ + 0.12], neon=1, glow=0.7)
for dx, zz in [(0.04, -0.16), (-0.04, -0.16), (0.025, -0.12), (-0.025, -0.12)]:
    add("cone", [0.012, 0.06], "glass", [PX + dx, PY - 0.09, DZ + zz], [3.14, 0, 0], neon=1, glow=0.4, note="fang")
add("cone", [0.01, 0.16], "gold", [PX + 0.05, PY - 0.06, DZ - 0.16], [-1.3, 0, 0.3], note="whisker")
add("cone", [0.01, 0.16], "gold", [PX - 0.05, PY - 0.06, DZ - 0.16], [-1.3, 0, -0.3], note="whisker")
for a, dx in [(0.5, 0.06), (0.0, 0.0), (-0.5, -0.06)]:
    add("cone", [0.018, 0.12], "neondark", [PX + dx, PY + 0.1, DZ + 0.08], [-0.6, 0, a], neon=1, note="mane")

# ============================================================
# 4) CRESCENT BLADE  (smooth jade + gold spine + one runic edge line)
# ============================================================
cx, cz = PY + 0.18, -0.55     # center of curvature (y, z)
R = 0.78
a0, a1 = -0.55, 2.15
N = 14

def yz(ang, r):
    return (cx + math.sin(ang) * r, cz - math.cos(ang) * r)

# blade body: tapered cones along the arc (moon width profile)
for i in range(N):
    t = i / (N - 1)
    ang = a0 + (a1 - a0) * t
    w = 0.06 + 0.42 * math.sin(math.pi * t)
    y, z = yz(ang, R - w * 0.4)
    seglen = (a1 - a0) / (N - 1) * R * 1.18
    add("cone", [w * 0.55, seglen], "neon", [PX, y, z], [ang, 0, 0], neon=1, glow=0.55, note="crescent body")
# glowing belly
for i in range(N):
    t = i / (N - 1)
    ang = a0 + (a1 - a0) * t
    w = 0.05 + 0.34 * math.sin(math.pi * t)
    y, z = yz(ang, R - 0.05 - w * 0.5)
    add("sphere", [w * 0.5], "neonbright", [PX, y, z], neon=1, glow=0.7, note="crescent belly glow")
# outer gold spine (smooth thin cyl segments on convex edge)
for i in range(N):
    t = i / (N - 1)
    ang = a0 + (a1 - a0) * t
    y, z = yz(ang, R + 0.005)
    seglen = (a1 - a0) / (N - 1) * R * 1.2
    add("cyl", [0.012, 0.012, seglen], "gold", [PX, y, z], [ang, 0, 0], note="outer gold spine")
for i in range(0, N, 3):
    t = i / (N - 1)
    ang = a0 + (a1 - a0) * t
    y, z = yz(ang, R + 0.005)
    add("sphere", [0.018], "gold", [PX, y, z])
# one fine runic edge line on concave inner edge
for i in range(N):
    t = i / (N - 1)
    ang = a0 + (a1 - a0) * t
    w = 0.06 + 0.42 * math.sin(math.pi * t)
    y, z = yz(ang, R - w * 0.85)
    seglen = (a1 - a0) / (N - 1) * R * 1.1
    add("box", [0.01, seglen, 0.004], "neonbright", [PX, y, z], [ang + 1.571, 0, 0], neon=1, glow=0.85, note="runic edge")

# crescent tips
yT, zT = yz(a1, R)
add("cone", [0.05, 0.34], "neonbright", [PX, yT + 0.02, zT - 0.02], [a1, 0, 0], neon=1, glow=0.7, note="upper moon tip")
add("sphere", [0.02], "neonbright", [PX, yT + 0.17, zT - 0.06], neon=1, glow=0.9, note="tip spark")
yB, zB = yz(a0, R)
add("cone", [0.04, 0.22], "neonbright", [PX, yB - 0.01, zB - 0.02], [a0, 0, 0], neon=1, glow=0.7, note="lower barb tip")
# classic rear hook off the spine
add("cone", [0.035, 0.2], "gold", [PX, PY + 0.0, -0.42], [1.3, 0, 0], note="rear hook base")
add("cone", [0.022, 0.14], "neon", [PX, PY + 0.12, -0.34], [1.6, 0, 0], neon=1, glow=0.5, note="rear hook tip")
# blade root socket into dragon mouth
add("cyl", [0.055, 0.04, 0.16], "gold", [PX, PY + 0.02, -0.62], [1.2, 0, 0], note="blade tang")
add("octa", [0.04], "neonbright", [PX, PY + 0.05, -0.66], neon=1, glow=0.6, note="root gem")
add("torus", [0.05, 0.008], "gold", [PX, PY + 0.05, -0.66], RZ)

# ---- report ----
xs = [p["pos"][0] for p in parts]
ys = [p["pos"][1] for p in parts]
zs = [p["pos"][2] for p in parts]
print("TOTAL parts:", len(parts))
print("x range:", round(min(xs), 3), round(max(xs), 3))
print("y range:", round(min(ys), 3), round(max(ys), 3))
print("z range:", round(min(zs), 3), round(max(zs), 3))
print("mats:", dict(Counter(p["mat"] for p in parts)))
print("shapes:", dict(Counter(p["shape"] for p in parts)))

out = {"parts": parts, "muzzleZ": -1.5}
open("blade_new.json", "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False))
print("wrote blade_new.json")
