// ============================================================ 破碎天空神殿 skytemple（仙侠浮空岛）
// 自定义冷蓝云海天空(makeSkyDome) + 冷暖光 + 中央青龙祭坛 + 四角浮台(断桥相连) + 残破仙门牌坊 + 金色符文/裂隙(accent发光) + 上飘灵尘
var SKYTEMPLE_THEME = { floor:0x3a3050, wall:0x6b5a7e, metal:0x8a82a0, crate:0x4a3f63, accentHot:0xffcf5a, accentWarm:0xffd98a };

MAP_BUILD['skytemple'] = function buildSkytemple() {
  var T = SKYTEMPLE_THEME, WH = 7, HALF = 30;

  // ---- 地面（暗紫灰石材）----
  var ft = texSet(makePanelPBR(512, 8, T.floor), 22); fxOwn(ft.map); fxOwn(ft.normalMap); fxOwn(ft.roughnessMap);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF*2, HALF*2), fxOwn(new THREE.MeshStandardMaterial({ map:ft.map, normalMap:ft.normalMap, roughnessMap:ft.roughnessMap, roughness:0.94, metalness:0.1, envMapIntensity:0.35 })));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; mAdd(floor, true, false);

  // ---- 四周围墙 ----
  var wt = texSet(makePanelPBR(512, 6, T.wall), 10, 1.4); fxOwn(wt.map); fxOwn(wt.normalMap); fxOwn(wt.roughnessMap);
  var wallMat = fxOwn(new THREE.MeshStandardMaterial({ map:wt.map, normalMap:wt.normalMap, roughnessMap:wt.roughnessMap, roughness:0.8, metalness:0.22, envMapIntensity:0.45 }));
  mBox(0, WH/2, HALF, HALF*2, WH, 1, wallMat); mBox(0, WH/2, -HALF, HALF*2, WH, 1, wallMat);
  mBox(HALF, WH/2, 0, 1, WH, HALF*2, wallMat); mBox(-HALF, WH/2, 0, 1, WH, HALF*2, wallMat);

  // ---- 共享材质 ----
  var metalMat  = fxOwn(new THREE.MeshStandardMaterial({ color:T.metal, roughness:0.4, metalness:0.6, envMapIntensity:0.7 }));
  var crateMat  = fxOwn(new THREE.MeshStandardMaterial({ color:T.crate, roughness:0.78, metalness:0.15, envMapIntensity:0.4 }));
  var stoneMat  = fxOwn(new THREE.MeshStandardMaterial({ color:T.wall, roughness:0.82, metalness:0.18, envMapIntensity:0.45 }));
  var accentMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.accentHot, emissive:T.accentHot, emissiveIntensity:2.2, roughness:0.4, metalness:0.2 }));
  var accentWarmMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.accentWarm, emissive:T.accentWarm, emissiveIntensity:1.8, roughness:0.4, metalness:0.2 }));

  // ---- 中央青龙祭坛：三级抬高圆台(顶≈2.6) + 中心炉柱 + 发光金色符文环(非碰撞) ----
  mCyl(0, 0.45, 0, 7.0, 0.9, stoneMat, true, 36);
  mCyl(0, 1.25, 0, 5.0, 0.8, metalMat, true, 32);
  mCyl(0, 1.95, 0, 3.4, 0.7, metalMat, true, 28);   // 顶面 y≈2.3
  // 中心炉柱（掩体）
  mCyl(0, 3.1, 0, 1.0, 2.2, metalMat, true, 20);
  // 发光符文环（扁圆柱，非碰撞，被 bloom 点亮）
  var ring1 = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.55, 0.12, 40, 1, true), accentMat); ring1.position.set(0, 2.32, 0); mAdd(ring1, true, false);
  var ring2 = new THREE.Mesh(new THREE.CylinderGeometry(5.15, 5.15, 0.12, 44, 1, true), accentWarmMat); ring2.position.set(0, 1.62, 0); mAdd(ring2, true, false);
  var ring3 = new THREE.Mesh(new THREE.CylinderGeometry(7.15, 7.15, 0.12, 48, 1, true), accentMat); ring3.position.set(0, 0.88, 0); mAdd(ring3, true, false);
  // 祭坛四向上坛楼梯（贴第三级，退向第一级外缘）
  makeStairs(0, 3.4, 0, 1, 2.3, 2.2, crateMat);   // 朝 +z 退向 -z … 顶贴(0,3.4)
  makeStairs(0, -3.4, 0, -1, 2.3, 2.2, crateMat);
  makeStairs(3.4, 0, 1, 0, 2.3, 2.2, crateMat);
  makeStairs(-3.4, 0, -1, 0, 2.3, 2.2, crateMat);

  // ---- 四角浮台（top≈3.2, 5x5）+ 倒锥支撑 + 上台楼梯 ----
  var platTop = 3.2, platH = 0.8, platCY = platTop - platH/2;   // 中心 y
  var corners = [[18,18],[-18,18],[18,-18],[-18,-18]];
  for (var ci = 0; ci < corners.length; ci++) {
    var px = corners[ci][0], pz = corners[ci][1];
    // 浮台主体
    mBox(px, platCY, pz, 5, platH, 5, stoneMat);
    // 台缘金色裂隙发光条（非碰撞，沿四边）
    var edgeY = platTop + 0.02;
    var eN = new THREE.Mesh(new THREE.BoxGeometry(5, 0.06, 0.3), accentWarmMat); eN.position.set(px, edgeY, pz+2.35); mAdd(eN, true, false);
    var eS = new THREE.Mesh(new THREE.BoxGeometry(5, 0.06, 0.3), accentWarmMat); eS.position.set(px, edgeY, pz-2.35); mAdd(eS, true, false);
    // 倒锥悬浮支撑（装饰，顶大底小，非碰撞，悬于浮台之下）
    var cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.0, 18), metalMat); cone.position.set(px, platTop - platH - 1.5, pz); cone.rotation.x = Math.PI; mAdd(cone, true, false);
    // 上台楼梯（朝竞技场中心方向退向地面）
    var sgnx = px > 0 ? 1 : -1, sgnz = pz > 0 ? 1 : -1;
    makeStairs(px - sgnx*1.6, pz - sgnz*1.6, -sgnx, -sgnz, platTop, 2.0, crateMat);
  }

  // ---- 断桥：四角浮台向中央祭坛方向延伸的窄长条（可走，中段留视觉缺口但路径连续）----
  // 桥面高度与浮台齐平(top≈3.2)，逐段铺设，段间小间隙(<可跨越)由台阶补足落差。这里桥与祭坛顶(≈2.3)有落差，用矮台阶过渡。
  var bridgeTop = platTop, bridgeH = 0.5, bridgeCY = bridgeTop - bridgeH/2;
  // 每条桥从浮台(±18,±18)指向祭坛外缘，分两段，中间留 1.2 视觉缺口
  var bridgeDefs = [
    { x:18, z:18 }, { x:-18, z:18 }, { x:18, z:-18 }, { x:-18, z:-18 }
  ];
  for (var bi = 0; bi < bridgeDefs.length; bi++) {
    var bx = bridgeDefs[bi].x, bz = bridgeDefs[bi].z;
    var sx2 = bx > 0 ? 1 : -1, sz2 = bz > 0 ? 1 : -1;
    // 外段：从浮台内缘(±15.5)向中心铺到 ±10
    mBox(sx2*12.7, bridgeCY, sz2*12.7, 5.8, bridgeH, 2.0, stoneMat);   // 沿对角线的近似窄桥(用方块近似，足以行走)
    // 内段：从 ±8 铺到祭坛外（落差用台阶补）
    mBox(sx2*8.2, bridgeCY, sz2*8.2, 3.0, bridgeH, 2.0, stoneMat);
    // 桥灯（金色发光条，非碰撞）
    var bl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 6.0), accentMat); bl.position.set(sx2*12.7, bridgeTop+0.03, sz2*12.7); bl.rotation.y = sz2*sx2 > 0 ? -Math.PI/4 : Math.PI/4; mAdd(bl, true, false);
    // 内段下台阶接祭坛顶（从桥内端 ±6.5 退到祭坛第三级外缘）
    makeStairs(sx2*6.6, sz2*6.6, sx2, sz2, bridgeTop, 1.8, crateMat);
  }

  // ---- 地面金色裂隙发光条（非碰撞，纵横交错点缀）----
  var crackDefs = [
    [0, 0, 24, 0.18, 0.4, 0], [0, 0, 0.4, 0.18, 24, 0],
    [13, 0, 10, 0.16, 0.3, 0.6], [-13, 0, 10, 0.16, 0.3, -0.6],
    [0, 13, 0.3, 0.16, 10, 0], [0, -13, 0.3, 0.16, 10, 0]
  ];
  for (var cri = 0; cri < crackDefs.length; cri++) {
    var cd = crackDefs[cri];
    var crk = new THREE.Mesh(new THREE.BoxGeometry(cd[2], cd[3], cd[4]), accentMat);
    crk.position.set(cd[0], 0.09, cd[1]); crk.rotation.y = cd[5]; mAdd(crk, true, false);
  }

  // ---- 两侧对角残破仙门牌坊（两柱一梁，柱可碰撞作掩体）----
  var gates = [[ -24, 24, Math.PI/4 ], [ 24, -24, Math.PI/4 ]];
  for (var gi = 0; gi < gates.length; gi++) {
    var gx = gates[gi][0], gz = gates[gi][1], grot = gates[gi][2];
    var off = 2.6;
    var dxg = Math.cos(grot) * off, dzg = Math.sin(grot) * off;
    // 两根立柱（碰撞掩体）
    var col1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 1.0), stoneMat); col1.position.set(gx + dxg, 3.0, gz + dzg); col1.castShadow = true; col1.receiveShadow = true; mAdd(col1, true, true);
    var col2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 1.0), stoneMat); col2.position.set(gx - dxg, 3.0, gz - dzg); col2.castShadow = true; col2.receiveShadow = true; mAdd(col2, true, true);
    // 横梁（破损，略短，非碰撞装饰）+ 金色符文梁纹
    var lintel = new THREE.Mesh(new THREE.BoxGeometry(off*2 + 1.4, 0.9, 1.2), stoneMat); lintel.position.set(gx, 6.3, gz); lintel.rotation.y = -grot; lintel.castShadow = true; mAdd(lintel, true, false);
    var rune = new THREE.Mesh(new THREE.BoxGeometry(off*2 + 1.0, 0.18, 0.3), accentMat); rune.position.set(gx, 6.3, gz); rune.rotation.y = -grot; mAdd(rune, true, false);
  }

  // ---- 出生点（四角浮台 + 地面外环，远离中央祭坛超级武器点）----
  var sp = [
    [18,18],[-18,18],[18,-18],[-18,-18],   // 四角浮台顶
    [26,0],[-26,0],[0,26],[0,-26],         // 四边地面
    [24,12],[-24,-12]                      // 补充外环
  ];
  spawnPoints = sp.map(function (p) { return new THREE.Vector3(p[0], highestSurfaceAt(p[0], p[1]) + EYE, p[1]); });
};

MAP_FX['skytemple'] = { onEnter: function (scene) {
  scene.background = new THREE.Color(0x9fc0e8);
  scene.fog = new THREE.Fog(0x8fb4e0, 30, 150);   // 边缘溶进云海
  if (hemiLight) { hemiLight.color.setHex(0x7fb6ff); hemiLight.groundColor.setHex(0x4a3a60); hemiLight.intensity = 0.9; }
  if (keyLight) { keyLight.color.setHex(0xffd98a); keyLight.intensity = 1.0; keyLight.position.set(-30, 42, 18); }
  if (bloom) { bloom.bright.uniforms.threshold.value = 0.62; bloom.comp.uniforms.strength.value = 1.1; bloom.comp.uniforms.exposure.value = 1.0; }
  // 冷蓝云海渐变天穹
  makeSkyDome({ radius:150, topCol:0x16284a, midCol:0x6f9fd8, botCol:0xbcd2f0, emberAmt:0.0 });
  // 暖金祭坛点光（中央上方）
  var pl1 = new THREE.PointLight(0xffcf5a, 1.6, 26, 2); pl1.position.set(0, 6, 0); scene.add(pl1); mapMeshes.push(pl1);
  var pl2 = new THREE.PointLight(0x7fb6ff, 0.8, 40, 2); pl2.position.set(0, 16, 0); scene.add(pl2); mapMeshes.push(pl2);
  // 上飘金色灵尘（缓慢上升 + 轻微横移，越界回卷）
  makeParticles({ count:260, color:0xffd98a, size:0.14, opacity:0.85, additive:true,
    init:function(arr,n){ for(var i=0;i<n;i++){ var k=i*3; arr[k]=Math.random()*58-29; arr[k+1]=Math.random()*16; arr[k+2]=Math.random()*58-29; } },
    step:function(arr,n,dt,t){ for(var i=0;i<n;i++){ var k=i*3;
      arr[k+1] += dt*(0.5+(i%7)*0.06);
      arr[k]   += dt*Math.sin(t*0.4 + i)*0.25;
      arr[k+2] += dt*Math.cos(t*0.35 + i)*0.25;
      if(arr[k+1]>16){ arr[k+1]=0.1; arr[k]=Math.random()*58-29; arr[k+2]=Math.random()*58-29; }
      if(arr[k]>29) arr[k]=-29; else if(arr[k]<-29) arr[k]=29;
      if(arr[k+2]>29) arr[k+2]=-29; else if(arr[k+2]<-29) arr[k+2]=29;
    } } });
} };

if (!MAP_LIST.some(function (m) { return m.id === 'skytemple'; })) MAP_LIST.push({ id:'skytemple', name:'破碎天空神殿' });