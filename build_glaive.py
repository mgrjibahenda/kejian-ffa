import math, json
parts=[]
def add(p): parts.append(p)
HALF=math.pi/2

# ---- CORE ROD ----
add({'shape':'cyl','dims':[0.026,0.026,1.40],'mat':'pole','pos':[0,0,0.27],'rot':[HALF,0,0],'note':'core rod'})
add({'shape':'cyl','dims':[0.015,0.015,1.40],'mat':'neondark','pos':[0,0,0.27],'rot':[HALF,0,0],'neon':True,'glow':0.35,'note':'jade inner glow core'})

# ---- SPIRAL POLE: continuous helical ribbons via cyl connectors ----
z0=0.92; z1=-0.40; turns=6.0
steps=26
R=0.045
def ribbon(matgold):
    for i in range(steps):
        t=i/steps; t2=(i+1)/steps
        z=z0+(z1-z0)*t; z2=z0+(z1-z0)*t2
        a=turns*2*math.pi*t; a2=turns*2*math.pi*t2
        ph=0.0 if matgold else math.pi
        x=R*math.cos(a+ph); y=R*math.sin(a+ph)
        x2=R*math.cos(a2+ph); y2=R*math.sin(a2+ph)
        mx=(x+x2)/2; my=(y+y2)/2; mz=(z+z2)/2
        dx=x2-x; dy=y2-y; dz=z2-z
        L=math.sqrt(dx*dx+dy*dy+dz*dz)
        yaw=math.atan2(dx,dz); pitch=math.atan2(dy,math.sqrt(dx*dx+dz*dz))
        seg={'shape':'cyl','dims':[0.018,0.018,round(L*1.25,4)],
             'pos':[round(mx,4),round(my,4),round(mz,4)],
             'rot':[round(-pitch+HALF,4),round(yaw,4),0]}
        if matgold:
            seg.update({'mat':'gold','note':'gold spiral ribbon'})
        else:
            seg.update({'mat':'neon','neon':True,'glow':0.42,'note':'jade spiral ribbon'})
        add(seg)
ribbon(True)
ribbon(False)

# ---- POMMEL / BUTT-CAP ----
add({'shape':'torus','dims':[0.06,0.02],'mat':'gold','pos':[0,0,0.93],'rot':[HALF,0,0],'note':'pommel collar ring'})
add({'shape':'cone','dims':[0.075,0.13],'mat':'gold','pos':[0,0,1.0],'rot':[-HALF,0,0],'note':'pommel flared cap'})
add({'shape':'sphere','dims':[0.055],'mat':'gold','pos':[0,0,1.08],'note':'pommel knob'})
for ang in [math.pi/4,3*math.pi/4,5*math.pi/4,7*math.pi/4]:
    add({'shape':'cone','dims':[0.024,0.09],'mat':'gold',
         'pos':[round(0.04*math.cos(ang),4),round(0.04*math.sin(ang),4),1.05],
         'rot':[-HALF,0,round(ang+HALF,4)],'note':'pommel fin'})
add({'shape':'sphere','dims':[0.033],'mat':'neon','pos':[0,0,1.14],'neon':True,'glow':0.5,'note':'pommel jade gem'})
add({'shape':'octa','dims':[0.027],'mat':'gold','pos':[0,0,1.18],'note':'pommel finial tip'})

# ---- GREEN GRIP COLLAR ----
add({'shape':'cyl','dims':[0.058,0.058,0.1],'mat':'neon','pos':[0,0,-0.4],'rot':[HALF,0,0],'neon':True,'glow':0.42,'note':'jade grip wrap band'})
add({'shape':'torus','dims':[0.064,0.018],'mat':'neon','pos':[0,0,-0.34],'rot':[HALF,0,0],'neon':True,'glow':0.45,'note':'jade collar torus front'})
add({'shape':'torus','dims':[0.064,0.018],'mat':'neon','pos':[0,0,-0.45],'rot':[HALF,0,0],'neon':True,'glow':0.45,'note':'jade collar torus back'})
add({'shape':'torus','dims':[0.056,0.012],'mat':'gold','pos':[0,0,-0.4],'rot':[HALF,0,0],'note':'gold band on grip'})

# ---- GOLD DRAGON HEAD ----
add({'shape':'torus','dims':[0.06,0.02],'mat':'gold','pos':[0,0,-0.47],'rot':[HALF,0,0],'note':'dragon neck ring'})
add({'shape':'sphere','dims':[0.078],'mat':'gold','pos':[0,0.012,-0.5],'note':'dragon cranium'})
add({'shape':'sphere','dims':[0.06],'mat':'gold','pos':[0,0,-0.54],'note':'dragon skull mid'})
add({'shape':'cone','dims':[0.055,0.18],'mat':'gold','pos':[0,0.062,-0.62],'rot':[-2.05,0,0],'note':'upper jaw snout open up'})
add({'shape':'sphere','dims':[0.038],'mat':'gold','pos':[0,0.1,-0.65],'note':'upper jaw tip'})
add({'shape':'cone','dims':[0.05,0.16],'mat':'gold','pos':[0,-0.07,-0.61],'rot':[-1.05,0,0],'note':'lower jaw open down'})
add({'shape':'sphere','dims':[0.034],'mat':'gold','pos':[0,-0.105,-0.635],'note':'lower jaw tip'})
add({'shape':'sphere','dims':[0.05],'mat':'dark','pos':[0,-0.004,-0.585],'note':'open mouth cavity'})
add({'shape':'cone','dims':[0.012,0.05],'mat':'steel','pos':[0.032,0.03,-0.62],'rot':[-1.0,0,0],'note':'upper fang R'})
add({'shape':'cone','dims':[0.012,0.05],'mat':'steel','pos':[-0.032,0.03,-0.62],'rot':[-1.0,0,0],'note':'upper fang L'})
add({'shape':'cone','dims':[0.011,0.044],'mat':'steel','pos':[0.03,-0.04,-0.62],'rot':[-2.15,0,0],'note':'lower fang R'})
add({'shape':'cone','dims':[0.011,0.044],'mat':'steel','pos':[-0.03,-0.04,-0.62],'rot':[-2.15,0,0],'note':'lower fang L'})
add({'shape':'sphere','dims':[0.026],'mat':'gold','pos':[0.047,0.062,-0.55],'note':'brow ridge R'})
add({'shape':'sphere','dims':[0.026],'mat':'gold','pos':[-0.047,0.062,-0.55],'note':'brow ridge L'})
add({'shape':'sphere','dims':[0.02],'mat':'neon','pos':[0.053,0.052,-0.565],'neon':True,'glow':0.5,'note':'eye R'})
add({'shape':'sphere','dims':[0.02],'mat':'neon','pos':[-0.053,0.052,-0.565],'neon':True,'glow':0.5,'note':'eye L'})
add({'shape':'cone','dims':[0.022,0.17],'mat':'gold','pos':[0.05,0.105,-0.43],'rot':[1.05,0,-0.4],'note':'horn R swept back'})
add({'shape':'cone','dims':[0.022,0.17],'mat':'gold','pos':[-0.05,0.105,-0.43],'rot':[1.05,0,0.4],'note':'horn L swept back'})
add({'shape':'sphere','dims':[0.015],'mat':'gold','pos':[0.078,0.165,-0.39],'note':'horn tip R'})
add({'shape':'sphere','dims':[0.015],'mat':'gold','pos':[-0.078,0.165,-0.39],'note':'horn tip L'})
for dx,h in [(-0.035,0.09),(0.0,0.1),(0.035,0.11)]:
    add({'shape':'cone','dims':[0.012,0.1],'mat':'gold','pos':[dx,h,-0.46],'rot':[1.4,0,0],'note':'mane spike'})
add({'shape':'cyl','dims':[0.006,0.003,0.1],'mat':'gold','pos':[0.07,-0.015,-0.56],'rot':[0,-0.5,0.4],'note':'whisker R'})
add({'shape':'cyl','dims':[0.006,0.003,0.1],'mat':'gold','pos':[-0.07,-0.015,-0.56],'rot':[0,0.5,-0.4],'note':'whisker L'})

# ---- CRESCENT BLADE (sweeping reclining-moon) ----
N=13
# Spine is a quadratic Bezier sweeping from the dragon's mouth (base) forward and UP
# to the tip — the classic 偃月 reclining-moon: the belly bows forward-down near the
# base, then the blade curves up to the point. Monotonic forward sweep, no looping.
P0=(-0.55, 0.00)   # base, at the mouth (z,y)
P1=(-1.15,-0.08)   # control: forward & slightly low -> bows the belly forward-down
P2=(-1.45, 0.55)   # tip, forward & up
spine_pts=[]
for i in range(N):
    t=i/(N-1)
    sz=(1-t)**2*P0[0]+2*(1-t)*t*P1[0]+t*t*P2[0]
    sy=(1-t)**2*P0[1]+2*(1-t)*t*P1[1]+t*t*P2[1]
    spine_pts.append((0.0,sy,sz,t,t))

# 'spine_pts' is the blade CENTERLINE. Width is offset PERPENDICULAR to the local
# travel direction (z-y plane), so width is controlled and the outer edge follows
# the same sweep as the spine (no radial ballooning).
def width_at(t):
    return 0.20*(1-0.66*t)+0.045   # ~0.245 at base -> ~0.083 at tip (widest near base)

# per-vertex outward normal. The OUTER (cutting) edge is the convex upper-forward side;
# the INNER (back, spine-bead) edge is the concave side facing the reference point REF
# which sits up-and-back behind the blade's belly. Outward = away from REF.
REFz, REFy = -0.55, 1.10   # up-and-back reference (concave side)
norms=[]
for i in range(N):
    if i==0:
        _,y0,z0p,_,_=spine_pts[0]; _,y1,z1p,_,_=spine_pts[1]
    elif i==N-1:
        _,y0,z0p,_,_=spine_pts[-2]; _,y1,z1p,_,_=spine_pts[-1]
    else:
        _,y0,z0p,_,_=spine_pts[i-1]; _,y1,z1p,_,_=spine_pts[i+1]
    dz=z1p-z0p; dy=y1-y0
    L=math.hypot(dz,dy); tz,ty=dz/L,dy/L
    nz,ny=-ty,tz
    _,sy,sz,_,_=spine_pts[i]
    if (nz*(sz-REFz)+ny*(sy-REFy))<0: nz,ny=-nz,-ny
    norms.append((nz,ny))

# body segments (jade green): centered on the centerline
for i in range(N-1):
    _,sy,sz,a,t=spine_pts[i]
    _,sy2,sz2,a2,t2=spine_pts[i+1]
    w=width_at((t+t2)/2)
    cz_m=(sz+sz2)/2; cy_m=(sy+sy2)/2
    dz=sz2-sz; dy=sy2-sy
    seglen=math.hypot(dz,dy); pitch=math.atan2(dy,dz)
    add({'shape':'box','dims':[0.05,round(w,4),round(seglen*1.5,4)],
         'mat':'neon','pos':[0,round(cy_m,4),round(cz_m,4)],
         'rot':[round(pitch,4),0,0],'neon':True,'glow':0.4,'note':'crescent blade body jade'})

# outer steel edge strip along the OUTER (upper) curve
for i in range(N-1):
    _,sy,sz,a,t=spine_pts[i]
    _,sy2,sz2,a2,t2=spine_pts[i+1]
    w=width_at((t+t2)/2)
    nz=(norms[i][0]+norms[i+1][0])/2; ny=(norms[i][1]+norms[i+1][1])/2
    nl=math.hypot(nz,ny); nz/=nl; ny/=nl
    cz_m=(sz+sz2)/2; cy_m=(sy+sy2)/2
    ez=cz_m+nz*(w/2+0.01); ey=cy_m+ny*(w/2+0.01)
    dz=sz2-sz; dy=sy2-sy
    seglen=math.hypot(dz,dy); pitch=math.atan2(dy,dz)
    add({'shape':'box','dims':[0.024,0.028,round(seglen*1.55,4)],'mat':'steel',
         'pos':[0,round(ey,4),round(ez,4)],'rot':[round(pitch,4),0,0],'note':'silver steel outer edge'})

# gold spine bead chain along the INNER (lower/back) edge
for i in range(N):
    _,sy,sz,a,t=spine_pts[i]
    nz,ny=norms[i]; w=width_at(t)
    iz=sz-nz*(w/2); iy=sy-ny*(w/2)
    rad=0.036*(1-0.45*t)
    add({'shape':'sphere','dims':[round(rad,4)],'mat':'gold','pos':[0,round(iy,4),round(iz,4)],'note':'gold spine bead'})

# green scale plates mid-body, both faces
for i in range(N-1):
    _,sy,sz,a,t=spine_pts[i]
    _,sy2,sz2,a2,t2=spine_pts[i+1]
    cz_m=(sz+sz2)/2; cy_m=(sy+sy2)/2
    sc=0.052*(1-0.30*t)
    add({'shape':'sphere','dims':[round(sc,4)],'mat':'neondark','pos':[0.02,round(cy_m,4),round(cz_m,4)],'neon':True,'glow':0.3,'note':'scale plate'})
    add({'shape':'sphere','dims':[round(sc,4)],'mat':'neondark','pos':[-0.02,round(cy_m,4),round(cz_m,4)],'neon':True,'glow':0.3,'note':'scale plate'})

# blade tip
_,sy,sz,a,t=spine_pts[-1]
_,syp,szp,ap,tp=spine_pts[-2]
dz=sz-szp; dy=sy-syp
pitch=math.atan2(dy,dz)
add({'shape':'cone','dims':[0.038,0.18],'mat':'steel','pos':[0,round(sy+0.06*math.sin(pitch),4),round(sz+0.06*math.cos(pitch),4)],'rot':[round(pitch-HALF,4),0,0],'note':'blade tip steel point'})
add({'shape':'cone','dims':[0.022,0.1],'mat':'neon','pos':[0,round(sy+0.04*math.sin(pitch),4),round(sz+0.04*math.cos(pitch),4)],'rot':[round(pitch-HALF,4),0,0],'neon':True,'glow':0.45,'note':'blade tip jade'})

# base barb / downward flange
_,by,bz,ba,bt=spine_pts[0]
add({'shape':'cone','dims':[0.03,0.18],'mat':'steel','pos':[0,round(by-0.1,4),round(bz+0.02,4)],'rot':[-2.5,0,0],'note':'base barb downward hook'})
add({'shape':'sphere','dims':[0.022],'mat':'gold','pos':[0,round(by-0.02,4),round(bz,4)],'note':'barb root gold'})
add({'shape':'cone','dims':[0.016,0.07],'mat':'gold','pos':[0,round(by-0.2,4),round(bz+0.01,4)],'rot':[-2.5,0,0],'note':'barb tip flange'})
add({'shape':'cyl','dims':[0.045,0.03,0.1],'mat':'gold','pos':[0,round(by+0.02,4),round(bz,4)],'rot':[HALF,0,0],'note':'blade root socket at mouth'})

# ---- NORMALIZE dims to canonical 3-element [x,y,z] convention ----
def norm_dims(p):
    s=p['shape']; d=p['dims']
    if s in ('sphere','octa'):
        if len(d)==1: p['dims']=[d[0],d[0],d[0]]
        elif len(d)==2: p['dims']=[d[0],d[1],d[1]]
    elif s=='torus':
        if len(d)==2: p['dims']=[d[0],d[0],d[1]]        # [ringR,ringR,tubeR]
    elif s=='cone':
        if len(d)==2: p['dims']=[d[0],0.0,d[1]]         # [baseR,topR=0,height]
    elif s=='cyl':
        if len(d)==2: p['dims']=[d[0],d[0],d[1]]
    p['dims']=[round(x,4) for x in p['dims']]
for _p in parts: norm_dims(_p)

# report
print('TOTAL PARTS:',len(parts))
zs=[p['pos'][2] for p in parts]; ys=[p['pos'][1] for p in parts]
print('z range',round(min(zs),3),round(max(zs),3))
print('y range',round(min(ys),3),round(max(ys),3))
from collections import Counter
print('mats',dict(Counter(p['mat'] for p in parts)))
print('blade spine z',round(spine_pts[0][2],3),'->',round(spine_pts[-1][2],3),'y',round(spine_pts[0][1],3),'->',round(spine_pts[-1][1],3))
json.dump(parts,open('glaive_out.json','w'))
