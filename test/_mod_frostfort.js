// ===== 地图模块：frostfort「冰封要塞·极光雪原」 =====
// 共享工具直接调用(mAdd/mBox/mCyl/makeStairs/makeParticles/fxOwn/texSet/makePanelPBR/GLSL_NOISE/highestSurfaceAt)
var FROSTFORT_THEME = { floor:0xdfeefc, wall:0x9fc4e0, accent:0x46e8ff, ice:0xbfe0f5, deep:0x0a1430 };

// ---- 自写极光天穹 fragment shader(复用 GLSL_NOISE) ----
var FROSTFORT_SKY_VS = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
var FROSTFORT_SKY_FS = GLSL_NOISE + '\n' + [
  'varying vec3 vDir; uniform float uTime;',
  'uniform vec3 uDeep, uGreen, uCyan, uMag;',
  'void main(){',
  '  float hh = clamp(vDir.y*0.5+0.5, 0.0, 1.0);',
  '  // 暗夜空底色，越高越深',
  '  vec3 col = mix(uDeep*1.4, uDeep*0.5, smoothstep(0.0,1.0,hh));',
  '  // 极光主要出现在中上空(hh 0.45~0.95)的水平带',
  '  float band = smoothstep(0.40,0.62,hh) * (1.0 - smoothstep(0.86,0.99,hh));',
  '  vec2 uv = vec2(atan(vDir.z, vDir.x)*0.9, vDir.y*2.2);',
  '  // 缓慢水平平移的飘带',
  '  float curtain = fbm(uv*2.2 + vec2(uTime*0.035, uTime*0.012));',
  '  float curtain2 = fbm(uv*4.1 - vec2(uTime*0.05, 0.0));',
  '  float w = curtain*0.65 + curtain2*0.35;',
  '  // 沿高度分层取色: 低->绿, 中->青, 高->品红',
  '  vec3 aur = mix(uGreen, uCyan, smoothstep(0.30,0.62,hh));',
  '  aur = mix(aur, uMag, smoothstep(0.66,0.92,hh) * 0.7);',
  '  // 竖直褶皱使飘带呈条纹',
  '  float streak = smoothstep(0.45,0.85,w);',
  '  float glow = streak * band;',
  '  col += aur * glow * 1.25;',
  '  // 高处稀疏星点',
  '  float st = h21(floor(uv*40.0));',
  '  col += vec3(0.7,0.8,1.0) * smoothstep(0.992,1.0,st) * hh;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

function frostfortMakeSky() {
  var u = { uTime:{value:0},
    uDeep:{value:new THREE.Color(0x0a1430)},
    uGreen:{value:new THREE.Color(0x5affa0)},
    uCyan:{value:new THREE.Color(0x46e8ff)},
    uMag:{value:new THREE.Color(0xc060ff)} };
  var mat = fxOwn(new THREE.ShaderMaterial({ uniforms:u, vertexShader:FROSTFORT_SKY_VS, fragmentShader:FROSTFORT_SKY_FS, side:THREE.BackSide, depthWrite:false, fog:false }));
  var mesh = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 24), mat);
  mesh.renderOrder = -1; mesh.frustumCulled = false;
  scene.add(mesh); mapMeshes.push(mesh); fxUniforms.push(u);
  return mesh;
}

MAP_BUILD['frostfort'] = function buildFrostfort() {
  var T = FROSTFORT_THEME, HALF = 30, WH = 7;

  // ---- 地面:高明度雪面 ----
  var ft = texSet(makePanelPBR(512, 8, T.floor), 22); fxOwn(ft.map); fxOwn(ft.normalMap); fxOwn(ft.roughnessMap);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF*2, HALF*2),
    fxOwn(new THREE.MeshStandardMaterial({ map:ft.map, normalMap:ft.normalMap, roughnessMap:ft.roughnessMap, roughness:0.9, metalness:0.05, envMapIntensity:0.35 })));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; mAdd(floor, true, false);

  // ---- 四周冰墙 ----
  var wt = texSet(makePanelPBR(512, 6, T.wall), 10, 1.4); fxOwn(wt.map); fxOwn(wt.normalMap); fxOwn(wt.roughnessMap);
  var wallMat = fxOwn(new THREE.MeshStandardMaterial({ map:wt.map, normalMap:wt.normalMap, roughnessMap:wt.roughnessMap, roughness:0.7, metalness:0.18, envMapIntensity:0.5 }));
  mBox(0, WH/2, HALF, HALF*2, WH, 1, wallMat); mBox(0, WH/2, -HALF, HALF*2, WH, 1, wallMat);
  mBox(HALF, WH/2, 0, 1, WH, HALF*2, wallMat); mBox(-HALF, WH/2, 0, 1, WH, HALF*2, wallMat);

  // ---- 共享材质 ----
  var iceMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.ice, roughness:0.28, metalness:0.1, envMapIntensity:0.8 }));
  var crystalMat = fxOwn(new THREE.MeshStandardMaterial({ color:0xeaf6ff, roughness:0.15, metalness:0.05, envMapIntensity:1.0 }));
  // 发光青强调材质(被 bloom 拾取)
  var accentMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.accent, emissive:T.accent, emissiveIntensity:2.4, roughness:0.4, metalness:0.2 }));
  // 半透发光晶体(顶端仙器)
  var glowCrystalMat = fxOwn(new THREE.MeshStandardMaterial({ color:0xaef4ff, emissive:T.accent, emissiveIntensity:1.6, roughness:0.2, metalness:0.1, transparent:true, opacity:0.55 }));

  // ============ 中央冰核巨柱 ============
  // 基座圆台(可站)
  mCyl(0, 0.4, 0, 4.0, 0.8, iceMat, true, 30);
  // 主巨柱 r2.4 h10
  mCyl(0, 5.4, 0, 2.4, 10, iceMat, true, 28);
  // 外裹旋转错位的细长冰晶(非碰撞装饰,带发光青缝)
  var coreShards = 6;
  for (var ci = 0; ci < coreShards; ci++) {
    var ang = (ci / coreShards) * Math.PI * 2;
    var rad = 3.0;
    var sx = Math.cos(ang) * rad, sz = Math.sin(ang) * rad;
    var shard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.5, 0.5), crystalMat);
    shard.position.set(sx, 5.0 + (ci % 2) * 1.2, sz);
    shard.rotation.set((ci % 2 ? 0.18 : -0.14), ang, (ci % 3) * 0.12 - 0.12);
    shard.castShadow = true; mAdd(shard, true, false); // 装饰不碰撞(避免旋转AABB误差)
    // 发光青裂缝条
    var crack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.0, 0.12), accentMat);
    crack.position.set(sx, 5.2 + (ci % 2) * 1.2, sz);
    crack.rotation.copy(shard.rotation);
    mAdd(crack, true, false);
  }
  // 顶端半透发光晶体(仙器核心)
  var topCrystal = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 0), glowCrystalMat);
  topCrystal.position.set(0, 11.8, 0); mAdd(topCrystal, true, false);
  var topGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), accentMat);
  topGlow.position.set(0, 11.8, 0); mAdd(topGlow, true, false);

  // ============ 中央悬浮仙器祭坛(环形平台 top≈4.5) ============
  // 用一圈实心 mBox 拼成方环(避免圆环不可站),内径留空给冰核
  var altarY = 4.3, altarT = 0.4, ringHalf = 7.5, segLen = 6.0, segW = 2.2;
  // 四条边(轴对齐,可站立)
  mBox(0, altarY - altarT/2, ringHalf, segLen, altarT, segW, iceMat);   // +z
  mBox(0, altarY - altarT/2, -ringHalf, segLen, altarT, segW, iceMat);  // -z
  mBox(ringHalf, altarY - altarT/2, 0, segW, altarT, segLen, iceMat);   // +x
  mBox(-ringHalf, altarY - altarT/2, 0, segW, altarT, segLen, iceMat);  // -x
  // 四角连接块,使环封闭可绕行
  mBox(ringHalf-1.0, altarY - altarT/2, ringHalf-1.0, 2.4, altarT, 2.4, iceMat);
  mBox(-(ringHalf-1.0), altarY - altarT/2, ringHalf-1.0, 2.4, altarT, 2.4, iceMat);
  mBox(ringHalf-1.0, altarY - altarT/2, -(ringHalf-1.0), 2.4, altarT, 2.4, iceMat);
  mBox(-(ringHalf-1.0), altarY - altarT/2, -(ringHalf-1.0), 2.4, altarT, 2.4, iceMat);
  // 符文环:沿环面铺发光青条(非碰撞,薄,贴在平台上表面)
  var runeY = altarY + 0.06;
  mBox(0, runeY, ringHalf, segLen-0.6, 0.08, 0.25, accentMat, false);
  mBox(0, runeY, -ringHalf, segLen-0.6, 0.08, 0.25, accentMat, false);
  mBox(ringHalf, runeY, 0, 0.25, 0.08, segLen-0.6, accentMat, false);
  mBox(-ringHalf, runeY, 0, 0.25, 0.08, segLen-0.6, accentMat, false);

  // ============ 四角冰晶尖塔(塔身 r2 h6, 顶平台 top≈6, 斜插冰晶尖) ============
  var towerPos = [[22,22],[-22,22],[22,-22],[-22,-22]];
  for (var ti = 0; ti < towerPos.length; ti++) {
    var tx = towerPos[ti][0], tz = towerPos[ti][1];
    // 塔身圆柱 r2 h6 -> 顶面 y=6
    mCyl(tx, 3.0, tz, 2.0, 6, iceMat, true, 24);
    // 顶平台 box(可站, top≈6.4)
    mBox(tx, 6.2, tz, 5.0, 0.4, 5.0, iceMat);
    // 平台边缘发光青条(非碰撞)
    mBox(tx, 6.46, tz+2.3, 5.0, 0.06, 0.18, accentMat, false);
    mBox(tx, 6.46, tz-2.3, 5.0, 0.06, 0.18, accentMat, false);
    mBox(tx+2.3, 6.46, tz, 0.18, 0.06, 5.0, accentMat, false);
    mBox(tx-2.3, 6.46, tz, 0.18, 0.06, 5.0, accentMat, false);
    // 斜插冰晶尖(装饰,非碰撞)指向场内
    var inX = (tx > 0 ? -1 : 1), inZ = (tz > 0 ? -1 : 1);
    var spike = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.5, 6), crystalMat);
    spike.position.set(tx + inX*1.3, 7.6, tz + inZ*1.3);
    spike.rotation.set(inZ*0.5, 0, -inX*0.5);
    spike.castShadow = true; mAdd(spike, true, false);
    var spikeGlow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4.0, 6), accentMat);
    spikeGlow.position.copy(spike.position); spikeGlow.rotation.copy(spike.rotation);
    mAdd(spikeGlow, true, false);
    // 上塔楼梯:从塔旁地面爬到顶平台(top≈6.4),沿朝向场内方向退台阶
    makeStairs(tx + inX*2.6, tz + inZ*2.6, inX, inZ, 6.2, 2.4, iceMat);
  }

  // ============ 三条断裂冰桥(桥面 top≈3.2, 中段缺口分两段) ============
  // 桥连接相邻塔/通向祭坛。桥墩 mCyl 撑地, 桥侧 accent 灯条。
  // 桥 helper: 沿 X 方向的一段桥(给中点cx,cz,半长,留缺口)
  function frostfortBridgeX(cx, cz, halfLen, gap) {
    var segL = halfLen - gap/2; var bw = 3.0, bt = 0.4, by = 3.0;
    // 左段 + 右段(中段缺口)
    var lcx = cx - (gap/2 + segL/2), rcx = cx + (gap/2 + segL/2);
    mBox(lcx, by - bt/2, cz, segL, bt, bw, iceMat);
    mBox(rcx, by - bt/2, cz, segL, bt, bw, iceMat);
    // 桥侧发光青灯条(非碰撞)
    mBox(lcx, by + 0.05, cz+bw/2-0.1, segL, 0.08, 0.16, accentMat, false);
    mBox(lcx, by + 0.05, cz-bw/2+0.1, segL, 0.08, 0.16, accentMat, false);
    mBox(rcx, by + 0.05, cz+bw/2-0.1, segL, 0.08, 0.16, accentMat, false);
    mBox(rcx, by + 0.05, cz-bw/2+0.1, segL, 0.08, 0.16, accentMat, false);
    // 桥墩撑地(每段一个)
    mCyl(lcx, by/2, cz, 0.6, by, iceMat, true, 12);
    mCyl(rcx, by/2, cz, 0.6, by, iceMat, true, 12);
    return { lcx:lcx, rcx:rcx, by:by };
  }
  function frostfortBridgeZ(cx, cz, halfLen, gap) {
    var segL = halfLen - gap/2; var bw = 3.0, bt = 0.4, by = 3.0;
    var lcz = cz - (gap/2 + segL/2), rcz = cz + (gap/2 + segL/2);
    mBox(cx, by - bt/2, lcz, bw, bt, segL, iceMat);
    mBox(cx, by - bt/2, rcz, bw, bt, segL, iceMat);
    mBox(cx+bw/2-0.1, by + 0.05, lcz, 0.16, 0.08, segL, accentMat, false);
    mBox(cx-bw/2+0.1, by + 0.05, lcz, 0.16, 0.08, segL, accentMat, false);
    mBox(cx+bw/2-0.1, by + 0.05, rcz, 0.16, 0.08, segL, accentMat, false);
    mBox(cx-bw/2+0.1, by + 0.05, rcz, 0.16, 0.08, segL, accentMat, false);
    mCyl(cx, by/2, lcz, 0.6, by, iceMat, true, 12);
    mCyl(cx, by/2, rcz, 0.6, by, iceMat, true, 12);
    return { lcz:lcz, rcz:rcz, by:by };
  }
  // 桥1: 沿 +Z 一侧横桥(x方向),中点(0,15),半长10,缺口3
  frostfortBridgeX(0, 15, 10, 3.0);
  // 桥2: 沿 -Z 一侧横桥(x方向),中点(0,-15)
  frostfortBridgeX(0, -15, 10, 3.0);
  // 桥3: 沿 +X 一侧纵桥(z方向),中点(15,0)
  frostfortBridgeZ(15, 0, 10, 3.0);
  // 桥可达:在桥两端落地处放小冰阶梯爬上桥面(by=3.0)
  makeStairs(9.5, 15, 1, 0, 3.0, 3.0, iceMat);   // 桥1右端附近上桥
  makeStairs(-9.5, 15, -1, 0, 3.0, 3.0, iceMat);
  makeStairs(9.5, -15, 1, 0, 3.0, 3.0, iceMat);
  makeStairs(-9.5, -15, -1, 0, 3.0, 3.0, iceMat);
  makeStairs(15, 9.5, 0, 1, 3.0, 3.0, iceMat);
  makeStairs(15, -9.5, 0, -1, 3.0, 3.0, iceMat);

  // ============ 出生点 ~10:四角塔顶 + 四边城墙回廊中点(远离中央祭坛) ============
  var sp = [
    [22,22],[-22,22],[22,-22],[-22,-22],   // 四角塔顶(highestSurfaceAt 落到 6.4)
    [0,27],[0,-27],[27,0],[-27,0],          // 四边墙边中点(地面)
    [14,27],[-14,-27]                       // 补两个边角(地面)
  ];
  spawnPoints = sp.map(function (p) { return new THREE.Vector3(p[0], highestSurfaceAt(p[0], p[1]) + EYE, p[1]); });
};

MAP_FX['frostfort'] = { onEnter: function (scene) {
  scene.background = new THREE.Color(0x0a1430);
  scene.fog = new THREE.FogExp2(0x9fb8d6, 0.018);
  if (hemiLight) { hemiLight.color.setHex(0xbfe3ff); hemiLight.groundColor.setHex(0x34465e); hemiLight.intensity = 0.85; }
  if (keyLight) { keyLight.color.setHex(0xdfefff); keyLight.intensity = 0.7; keyLight.position.set(30, 22, -18); }
  if (bloom) { bloom.bright.uniforms.threshold.value = 0.82; bloom.comp.uniforms.strength.value = 1.0; bloom.comp.uniforms.exposure.value = 1.1; }
  // 极光天穹
  frostfortMakeSky();
  // 中央冰核青色辉光点光
  var pl1 = new THREE.PointLight(0x46e8ff, 1.6, 28, 2); pl1.position.set(0, 11, 0); scene.add(pl1); mapMeshes.push(pl1);
  // 祭坛环柔光
  var pl2 = new THREE.PointLight(0x8ff0ff, 0.9, 18, 2); pl2.position.set(0, 5.5, 0); scene.add(pl2); mapMeshes.push(pl2);
  // ---- 风雪下落粒子(横风偏移, 落底/出界回卷顶部) ----
  makeParticles({ count:1000, color:0xffffff, size:0.12, opacity:0.85, additive:false,
    init:function(arr,n){ for(var i=0;i<n;i++){ var k=i*3; arr[k]=Math.random()*60-30; arr[k+1]=Math.random()*20; arr[k+2]=Math.random()*60-30; } },
    step:function(arr,n,dt,t){ for(var i=0;i<n;i++){ var k=i*3;
      arr[k+1] -= dt*(3.2 + (i%7)*0.35);                       // 下落
      arr[k]   += dt*(1.1 + Math.sin(t*0.4 + i)*0.6);           // 横风偏移(+x)
      if (arr[k+1] < 0.05 || arr[k] > 30 || arr[k] < -30) {     // 落底或出界 -> 回卷顶部
        arr[k+1] = 20; arr[k] = Math.random()*60-30; arr[k+2] = Math.random()*60-30;
      }
    } } });
} };
if (!MAP_LIST.some(function (m) { return m.id === 'frostfort'; })) MAP_LIST.push({ id:'frostfort', name:'冰封要塞·极光雪原' });