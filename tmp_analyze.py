import json

candidates = {
0: [{"shape":"sphere","dims":[0.17],"mat":"steel","pos":[0,0,0]},{"shape":"sphere","dims":[0.145],"mat":"dark","pos":[0,0.01,0]},{"shape":"torus","dims":[0.155,0.028],"mat":"plate","pos":[0,-0.02,0]},{"shape":"cyl","dims":[0.16,0.155,0.07],"mat":"armor","pos":[0,-0.11,0]},{"shape":"box","dims":[0.34,0.14,0.32],"mat":"armor","pos":[0,-0.2,0]},{"shape":"box","dims":[0.36,0.05,0.34],"mat":"plate","pos":[0,-0.14,0]},{"shape":"box","dims":[0.3,0.06,0.3],"mat":"plate","pos":[0,-0.27,0]},{"shape":"box","dims":[0.2,0.04,0.04],"mat":"dark","pos":[0,-0.2,-0.17]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[-0.14,-0.14,-0.15]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[0.14,-0.14,-0.15]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[-0.14,-0.14,0.15]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[0.14,-0.14,0.15]},{"shape":"box","dims":[0.3,0.34,0.28],"mat":"armor","pos":[0,-0.42,0]},{"shape":"box","dims":[0.32,0.16,0.3],"mat":"plate","pos":[0,-0.34,0]},{"shape":"box","dims":[0.31,0.14,0.29],"mat":"plate","pos":[0,-0.5,0]},{"shape":"box","dims":[0.26,0.03,0.04],"mat":"dark","pos":[0,-0.43,-0.15]},{"shape":"box","dims":[0.04,0.18,0.26],"mat":"dark","pos":[-0.155,-0.42,0]},{"shape":"box","dims":[0.04,0.18,0.26],"mat":"dark","pos":[0.155,-0.42,0]},{"shape":"box","dims":[0.05,0.04,0.04],"mat":"steel","pos":[-0.13,-0.32,-0.15]},{"shape":"box","dims":[0.05,0.04,0.04],"mat":"steel","pos":[0.13,-0.32,-0.15]},{"shape":"box","dims":[0.05,0.04,0.04],"mat":"steel","pos":[-0.13,-0.52,-0.15]},{"shape":"box","dims":[0.05,0.04,0.04],"mat":"steel","pos":[0.13,-0.52,-0.15]},{"shape":"box","dims":[0.04,0.1,0.18],"mat":"plate","pos":[-0.17,-0.4,0]},{"shape":"box","dims":[0.04,0.1,0.18],"mat":"plate","pos":[0.17,-0.4,0]},{"shape":"cyl","dims":[0.035,0.035,0.26],"mat":"hydraulic","pos":[-0.19,-0.36,0.02]},{"shape":"cyl","dims":[0.05,0.05,0.1],"mat":"steel","pos":[-0.19,-0.24,0.02]},{"shape":"cyl","dims":[0.05,0.05,0.1],"mat":"steel","pos":[-0.19,-0.5,0.02]},{"shape":"cyl","dims":[0.035,0.035,0.26],"mat":"hydraulic","pos":[0.19,-0.36,0.02]},{"shape":"cyl","dims":[0.05,0.05,0.1],"mat":"steel","pos":[0.19,-0.24,0.02]},{"shape":"cyl","dims":[0.05,0.05,0.1],"mat":"steel","pos":[0.19,-0.5,0.02]},{"shape":"box","dims":[0.06,0.16,0.02],"mat":"neon","pos":[0,-0.42,-0.155]},{"shape":"box","dims":[0.18,0.02,0.02],"mat":"dark","pos":[0,-0.34,-0.155]},{"shape":"box","dims":[0.18,0.02,0.02],"mat":"dark","pos":[0,-0.5,-0.155]},{"shape":"box","dims":[0.28,0.1,0.26],"mat":"steel","pos":[0,-0.6,0]},{"shape":"box","dims":[0.3,0.06,0.28],"mat":"plate","pos":[0,-0.56,0]},{"shape":"cyl","dims":[0.13,0.13,0.3],"mat":"dark","pos":[0,-0.63,0],"rot":[1.5708,0,0]},{"shape":"cyl","dims":[0.14,0.14,0.06],"mat":"steel","pos":[-0.15,-0.63,0],"rot":[0,0,1.5708]},{"shape":"cyl","dims":[0.14,0.14,0.06],"mat":"steel","pos":[0.15,-0.63,0],"rot":[0,0,1.5708]},{"shape":"sphere","dims":[0.035],"mat":"core","pos":[-0.15,-0.63,0]},{"shape":"sphere","dims":[0.035],"mat":"core","pos":[0.15,-0.63,0]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[-0.11,-0.58,-0.13]},{"shape":"box","dims":[0.04,0.04,0.04],"mat":"steel","pos":[0.11,-0.58,-0.13]},{"shape":"box","dims":[0.22,0.04,0.04],"mat":"gold","pos":[0,-0.3,-0.16]}],
1: [{"shape":"sphere","dims":[0.19],"mat":"steel","pos":[0,0,0]},{"shape":"sphere","dims":[0.155],"mat":"armor","pos":[0,0.01,-0.01]},{"shape":"torus","dims":[0.17,0.028],"mat":"dark","pos":[0,0,0],"rot":[1.5708,0,0]},{"shape":"sphere","dims":[0.09],"mat":"core","pos":[0,0.02,-0.02]},{"shape":"box","dims":[0.05,0.05,0.05],"mat":"hydraulic","pos":[0.13,0.04,0.06]},{"shape":"box","dims":[0.05,0.05,0.05],"mat":"hydraulic","pos":[-0.13,0.04,0.06]},{"shape":"box","dims":[0.28,0.26,0.24],"mat":"armor","pos":[0,-0.16,0]},{"shape":"box","dims":[0.3,0.16,0.26],"mat":"plate","pos":[0,-0.05,0.01]},{"shape":"box","dims":[0.31,0.12,0.2],"mat":"armor","pos":[0.02,-0.08,-0.09]},{"shape":"box","dims":[0.26,0.2,0.27],"mat":"armor","pos":[0,-0.32,0.005]},{"shape":"box","dims":[0.24,0.22,0.25],"mat":"plate","pos":[0,-0.5,0.005]},{"shape":"box","dims":[0.13,0.3,0.13],"mat":"steel","pos":[0,-0.4,0]},{"shape":"box","dims":[0.26,0.2,0.12],"mat":"armor","pos":[0,-0.28,0.12]},{"shape":"box","dims":[0.24,0.18,0.1],"mat":"plate","pos":[0,-0.46,0.12]},{"shape":"box","dims":[0.27,0.16,0.1],"mat":"armor","pos":[0,-0.33,-0.12]},{"shape":"box","dims":[0.25,0.18,0.09],"mat":"plate","pos":[0,-0.5,-0.11]},{"shape":"box","dims":[0.05,0.4,0.13],"mat":"dark","pos":[0.15,-0.34,0]},{"shape":"box","dims":[0.05,0.4,0.13],"mat":"dark","pos":[-0.15,-0.34,0]},{"shape":"cyl","dims":[0.022,0.022,0.34],"mat":"hydraulic","pos":[0.16,-0.32,0.07]},{"shape":"cyl","dims":[0.03,0.03,0.13],"mat":"steel","pos":[0.16,-0.42,0.07]},{"shape":"cyl","dims":[0.022,0.022,0.34],"mat":"hydraulic","pos":[-0.16,-0.32,0.07]},{"shape":"cyl","dims":[0.03,0.03,0.13],"mat":"steel","pos":[-0.16,-0.42,0.07]},{"shape":"cyl","dims":[0.02,0.02,0.3],"mat":"hydraulic","pos":[0.165,-0.3,-0.08]},{"shape":"cyl","dims":[0.02,0.02,0.3],"mat":"hydraulic","pos":[-0.165,-0.3,-0.08]},{"shape":"torus","dims":[0.035,0.012],"mat":"gold","pos":[0.16,-0.18,0.07],"rot":[1.5708,0,0]},{"shape":"torus","dims":[0.035,0.012],"mat":"gold","pos":[-0.16,-0.18,0.07],"rot":[1.5708,0,0]},{"shape":"box","dims":[0.32,0.06,0.2],"mat":"neon","pos":[0,-0.24,0.005]},{"shape":"box","dims":[0.1,0.015,0.1],"mat":"dark","pos":[0,-0.24,0.13]},{"shape":"box","dims":[0.03,0.1,0.03],"mat":"steel","pos":[0.13,-0.18,0.13]},{"shape":"box","dims":[0.03,0.1,0.03],"mat":"steel","pos":[-0.13,-0.18,0.13]},{"shape":"sphere","dims":[0.018],"mat":"gold","pos":[0.1,-0.16,0.14]},{"shape":"sphere","dims":[0.018],"mat":"gold","pos":[-0.1,-0.16,0.14]},{"shape":"sphere","dims":[0.018],"mat":"gold","pos":[0.1,-0.52,0.13]},{"shape":"sphere","dims":[0.018],"mat":"gold","pos":[-0.1,-0.52,0.13]},{"shape":"box","dims":[0.34,0.14,0.28],"mat":"armor","pos":[0,-0.62,0]},{"shape":"cyl","dims":[0.1,0.1,0.34],"mat":"steel","pos":[0,-0.66,0],"rot":[1.5708,0,0]},{"shape":"cyl","dims":[0.115,0.115,0.06],"mat":"dark","pos":[0.16,-0.66,0],"rot":[1.5708,0,0]},{"shape":"cyl","dims":[0.115,0.115,0.06],"mat":"dark","pos":[-0.16,-0.66,0],"rot":[1.5708,0,0]},{"shape":"sphere","dims":[0.045],"mat":"core","pos":[0,-0.66,0.06]},{"shape":"torus","dims":[0.13,0.02],"mat":"gold","pos":[0,-0.66,0],"rot":[1.5708,0,0]},{"shape":"box","dims":[0.28,0.1,0.12],"mat":"plate","pos":[0,-0.6,0.14]},{"shape":"box","dims":[0.26,0.09,0.1],"mat":"armor","pos":[0,-0.58,-0.14]},{"shape":"octa","dims":[0.05],"mat":"steel","pos":[0,-0.16,-0.14]}],
2: [{"shape":"sphere","dims":[0.17],"mat":"steel","pos":[0,0,0]},{"shape":"sphere","dims":[0.145],"mat":"armor","pos":[0,0.01,0]},{"shape":"torus","dims":[0.16,0.035],"mat":"dark","pos":[0,0,0],"rot":[1.5708,0,0]},{"shape":"torus","dims":[0.155,0.022],"mat":"gold","pos":[0,-0.02,0],"rot":[1.5708,0,0]},{"shape":"cyl","dims":[0.075,0.075,0.05],"mat":"hydraulic","pos":[0,0.06,0]},{"shape":"box","dims":[0.06,0.05,0.06],"mat":"plate","pos":[0.13,-0.02,0]},{"shape":"box","dims":[0.06,0.05,0.06],"mat":"plate","pos":[-0.13,-0.02,0]},{"shape":"box","dims":[0.3,0.12,0.26],"mat":"armor","pos":[0,-0.12,0]},{"shape":"box","dims":[0.34,0.06,0.3],"mat":"plate","pos":[0,-0.07,0.01]},{"shape":"box","dims":[0.28,0.08,0.04],"mat":"dark","pos":[0,-0.12,-0.15]},{"shape":"box","dims":[0.1,0.04,0.28],"mat":"neon","pos":[0,-0.06,0]},{"shape":"box","dims":[0.26,0.34,0.22],"mat":"armor","pos":[0,-0.28,0]},{"shape":"box","dims":[0.22,0.36,0.2],"mat":"plate","pos":[0,-0.28,0.02]},{"shape":"box","dims":[0.28,0.16,0.24],"mat":"plate","pos":[0,-0.2,0.005]},{"shape":"box","dims":[0.27,0.14,0.23],"mat":"armor","pos":[0,-0.36,0.005]},{"shape":"box","dims":[0.13,0.05,0.22],"mat":"gold","pos":[0,-0.18,-0.115]},{"shape":"box","dims":[0.13,0.05,0.005],"mat":"dark","pos":[0,-0.25,-0.12]},{"shape":"box","dims":[0.13,0.05,0.22],"mat":"gold","pos":[0,-0.32,-0.115]},{"shape":"box","dims":[0.04,0.26,0.16],"mat":"dark","pos":[0.135,-0.28,0]},{"shape":"cyl","dims":[0.035,0.035,0.3],"mat":"hydraulic","pos":[0.15,-0.27,0.04]},{"shape":"cyl","dims":[0.022,0.022,0.34],"mat":"steel","pos":[0.15,-0.27,0.04]},{"shape":"cyl","dims":[0.04,0.04,0.04],"mat":"steel","pos":[0.15,-0.13,0.04]},{"shape":"cyl","dims":[0.04,0.04,0.04],"mat":"steel","pos":[0.15,-0.43,0.04]},{"shape":"cyl","dims":[0.03,0.03,0.28],"mat":"hydraulic","pos":[-0.145,-0.27,0.03]},{"shape":"cyl","dims":[0.018,0.018,0.32],"mat":"steel","pos":[-0.145,-0.27,0.03]},{"shape":"cyl","dims":[0.035,0.035,0.035],"mat":"steel","pos":[-0.145,-0.13,0.03]},{"shape":"box","dims":[0.2,0.04,0.16],"mat":"dark","pos":[0,-0.28,-0.12]},{"shape":"box","dims":[0.18,0.012,0.14],"mat":"steel","pos":[0,-0.24,-0.13]},{"shape":"box","dims":[0.18,0.012,0.14],"mat":"steel","pos":[0,-0.28,-0.13]},{"shape":"box","dims":[0.18,0.012,0.14],"mat":"steel","pos":[0,-0.32,-0.13]},{"shape":"sphere","dims":[0.012],"mat":"gold","pos":[0.1,-0.09,-0.12]},{"shape":"sphere","dims":[0.012],"mat":"gold","pos":[-0.1,-0.09,-0.12]},{"shape":"sphere","dims":[0.012],"mat":"steel","pos":[0.1,-0.47,-0.1]},{"shape":"sphere","dims":[0.012],"mat":"steel","pos":[-0.1,-0.47,-0.1]},{"shape":"box","dims":[0.3,0.12,0.24],"mat":"armor","pos":[0,-0.46,0]},{"shape":"box","dims":[0.32,0.08,0.2],"mat":"plate","pos":[0,-0.48,0.01]},{"shape":"cyl","dims":[0.1,0.1,0.32],"mat":"steel","pos":[0,-0.5,0],"rot":[1.5708,0,0]},{"shape":"torus","dims":[0.1,0.03,0],"mat":"dark","pos":[0.16,-0.5,0],"rot":[0,1.5708,0]},{"shape":"torus","dims":[0.1,0.03,0],"mat":"dark","pos":[-0.16,-0.5,0],"rot":[0,1.5708,0]},{"shape":"cyl","dims":[0.045,0.045,0.34],"mat":"gold","pos":[0,-0.5,0],"rot":[1.5708,0,0]},{"shape":"box","dims":[0.05,0.05,0.05],"mat":"neon","pos":[0,-0.5,-0.12]},{"shape":"box","dims":[0.26,0.05,0.05],"mat":"hydraulic","pos":[0,-0.44,-0.1]}],
}

def half_extents(p):
    s=p['shape']; d=p['dims']; rot=p.get('rot',[0,0,0])
    if s=='sphere':
        return d[0],d[0],d[0]
    if s=='box':
        return d[0]/2,d[1]/2,d[2]/2
    if s=='cyl':
        r=d[0]; h=d[2] if len(d)>2 else d[1]
        # account for rotation around x (1.5708) -> axis along y becomes z
        if abs(rot[0]-1.5708)<0.1:
            return r,r,h/2
        if abs(rot[2]-1.5708)<0.1:
            return h/2,r,r
        if abs(rot[1]-1.5708)<0.1:
            return h/2,r,r  # approx
        return r,h/2,r
    if s=='torus':
        R=d[0]; r=d[1]
        if abs(rot[0]-1.5708)<0.1:
            return R+r,r,R+r
        if abs(rot[1]-1.5708)<0.1:
            return r,R+r,R+r
        return R+r,R+r,r
    if s=='octa':
        return d[0],d[0],d[0]
    return 0.05,0.05,0.05

for idx,parts in candidates.items():
    print("\n========== CANDIDATE %d (%d parts) ==========" % (idx,len(parts)))
    minx=miny=minz=1e9; maxx=maxy=maxz=-1e9
    mats={}; shapes={}
    elbow_parts=[]
    shoulder_top=None
    for p in parts:
        x,y,z=p['pos']
        hx,hy,hz=half_extents(p)
        minx=min(minx,x-hx); maxx=max(maxx,x+hx)
        miny=min(miny,y-hy); maxy=max(maxy,y+hy)
        minz=min(minz,z-hz); maxz=max(maxz,z+hz)
        mats[p['mat']]=mats.get(p['mat'],0)+1
        shapes[p['shape']]=shapes.get(p['shape'],0)+1
    # core body width: only main armor/plate boxes near center
    body_w=[]
    for p in parts:
        if p['shape']=='box' and abs(p['pos'][0])<0.05 and p['dims'][0]>0.2:
            body_w.append(p['dims'][0])
    print("  Full X width incl hydraulics: %.3f (min %.3f max %.3f)" % (maxx-minx,minx,maxx))
    print("  Core body box widths: %s -> max %.3f" % ([round(w,3) for w in body_w], max(body_w) if body_w else 0))
    print("  Y span: %.3f (top %.3f bottom %.3f)" % (maxy-miny,maxy,miny))
    print("  Z depth: %.3f (min %.3f max %.3f)" % (maxz-minz,minz,maxz))
    print("  materials: %s" % mats)
    print("  shapes: %s" % shapes)
    # find elbow hinge axle (cyl rotated x near bottom)
    for p in parts:
        if p['shape']=='cyl' and abs(p.get('rot',[0,0,0])[0]-1.5708)<0.1 and p['dims'][0]>0.08:
            print("  -> elbow axle cyl at y=%.3f r=%.3f len=%.3f mat=%s" % (p['pos'][1],p['dims'][0],p['dims'][2],p['mat']))
