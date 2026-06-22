// ============================================================ 赛博废城·雨夜霓虹 cybercity
// 雨夜都市战：中央霓虹武器塔 + 东侧倒塌写字楼(可攀爬狙击位) + 四色霓虹牌坊 + 集装箱/车体掩体 + 斜向落雨
var CYBER_THEME = {
  floor:0x10141d, wall:0x171c2b, steel:0x2a3346, crate:0x222a3a,
  neonCyan:0x16e0ff, neonMag:0xff2a9d, neonAmb:0xffae3a, neonPur:0x9a4cff
};
MAP_BUILD['cybercity'] = function buildCybercity() {
  var T = CYBER_THEME, HALF = 30, WH = 7;

  // ---- 地面：湿沥青 ----
  var ft = texSet(makePanelPBR(512, 8, T.floor), 24); fxOwn(ft.map); fxOwn(ft.normalMap); fxOwn(ft.roughnessMap);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF*2, HALF*2), fxOwn(new THREE.MeshStandardMaterial({
    map:ft.map, normalMap:ft.normalMap, roughnessMap:ft.roughnessMap, roughness:0.42, metalness:0.45, envMapIntensity:0.6 })));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; mAdd(floor, true, false);

  // ---- 四周墙：暗钢蓝 ----
  var wt = texSet(makePanelPBR(512, 6, T.wall), 10, 1.4); fxOwn(wt.map); fxOwn(wt.normalMap); fxOwn(wt.roughnessMap);
  var wallMat = fxOwn(new THREE.MeshStandardMaterial({ map:wt.map, normalMap:wt.normalMap, roughnessMap:wt.roughnessMap,
    roughness:0.78, metalness:0.32, envMapIntensity:0.4 }));
  mBox(0, WH/2, HALF, HALF*2, WH, 1, wallMat); mBox(0, WH/2, -HALF, HALF*2, WH, 1, wallMat);
  mBox(HALF, WH/2, 0, 1, WH, HALF*2, wallMat); mBox(-HALF, WH/2, 0, 1, WH, HALF*2, wallMat);

  // ---- 共享材质 ----
  var steelMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.steel, roughness:0.4, metalness:0.7, envMapIntensity:0.7 }));
  var crateMat = fxOwn(new THREE.MeshStandardMaterial({ color:T.crate, roughness:0.66, metalness:0.34, envMapIntensity:0.4 }));
  // 四色霓虹发光材质(被 bloom 强烈点亮)
  function cyberNeon(hex, inten) { return fxOwn(new THREE.MeshStandardMaterial({
    color:hex, emissive:hex, emissiveIntensity:inten == null ? 2.6 : inten, roughness:0.35, metalness:0.2 })); }
  var matCyan = cyberNeon(T.neonCyan, 2.8), matMag = cyberNeon(T.neonMag, 2.8),
      matAmb = cyberNeon(T.neonAmb, 2.6), matPur = cyberNeon(T.neonPur, 2.4);

  // ====== 中央霓虹武器塔 ======
  // 八棱基座(可站, 顶≈2.4 是拾取点)
  mCyl(0, 0.6, 0, 5.0, 1.2, steelMat, true, 8);
  mCyl(0, 1.8, 0, 4.0, 1.2, steelMat, true, 8);   // 顶面 y≈2.4
  // 渐细塔身(装饰, 非碰撞以免卡顶)
  var bodyA = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 4.0, 16), steelMat); bodyA.position.set(0, 4.4, 0);
  bodyA.castShadow = true; bodyA.receiveShadow = true; mAdd(bodyA, true, false);
  var bodyB = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, 4.0, 16), steelMat); bodyB.position.set(0, 8.0, 0);
  bodyB.castShadow = true; mAdd(bodyB, true, false);
  // 竖直霓虹条(青/品红交替, 贴塔身, 非碰撞)
  var stripN = 6;
  for (var s = 0; s < stripN; s++) {
    var ang = s / stripN * Math.PI * 2, sr = 2.7;
    var strip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.4, 0.22), (s % 2 === 0) ? matCyan : matMag);
    strip.position.set(Math.cos(ang)*sr, 5.5, Math.sin(ang)*sr); mAdd(strip, true, false);
  }
  // 顶端 Torus 光环(发光, 非碰撞)
  var halo = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.18, 12, 40), matCyan);
  halo.position.set(0, 10.4, 0); halo.rotation.x = Math.PI/2; mAdd(halo, true, false);

  // ====== 东侧倒塌写字楼(错层堆叠, 可攀爬到顶层狙击平台) ======
  // 错位楼板(每层落差≤台阶高, 玩家可逐级跳/走上); 楼板间用矮台阶补可达性
  // 第1层 y≈1.4
  mBox(20, 0.7, 6, 8, 1.4, 7, crateMat);
  // 第2层 偏移 y≈3.0 (相对第1层顶2.0 抬1.0, 留一阶)
  mBox(22, 2.0, 2, 7, 1.2, 6, crateMat);   // 顶≈2.6
  mBox(18, 3.0, -1, 6, 1.0, 5, crateMat);  // 顶≈3.5
  // 第3层 顶层狙击平台 y≈4.6 顶≈5.2
  mBox(21, 4.6, -4, 6, 1.2, 5, crateMat);  // 狙击平台顶≈5.2
  // 断裂女儿墙(掩体, 在狙击平台边缘)
  mBox(21, 5.9, -6.0, 6, 0.9, 0.5, crateMat);
  // 攀爬阶梯：从地面爬上第1层(top≈1.4) 与 跨层补阶
  makeStairs(24, 9.5, 0, 1, 1.4, 3.0, crateMat);     // 地面->第1层(沿 +z 退向墙根)
  makeStairs(26, 2, -1, 0, 2.6, 2.6, crateMat);      // 第1层顶->第2层(2.0) 退向东墙
  makeStairs(17.5, -1, 0, -1, 3.5, 2.6, crateMat);   // ->第3层附近
  makeStairs(21, -1.5, 0, 1, 5.2, 2.6, crateMat);    // ->狙击平台(5.2) 退向内场

  // ====== 四座霓虹牌坊门(两立柱碰撞作掩体 + 横向发光牌匾非碰撞) ======
  function cyberGate(cx, cz, rot, neonMat) {
    var hw = 3.2; // 半跨
    // 立柱(碰撞掩体)
    var dirx = Math.cos(rot), dirz = Math.sin(rot);
    var lx = cx + (-hw)*dirx, lz = cz + (-hw)*dirz;
    var rx = cx + ( hw)*dirx, rz = cz + ( hw)*dirz;
    mBox(lx, 2.5, lz, 0.7, 5.0, 0.7, steelMat);
    mBox(rx, 2.5, rz, 0.7, 5.0, 0.7, steelMat);
    // 横向发光牌匾(非碰撞, 切高视线): 用细长 box 横跨两柱顶
    var beam = new THREE.Mesh(new THREE.BoxGeometry(hw*2 + 0.8, 0.8, 0.4), neonMat);
    beam.position.set(cx, 5.2, cz); beam.rotation.y = -rot; mAdd(beam, true, false);
    // 牌匾下挂霓虹小条
    var hang = new THREE.Mesh(new THREE.BoxGeometry(hw*2, 0.25, 0.18), neonMat);
    hang.position.set(cx, 4.5, cz); hang.rotation.y = -rot; mAdd(hang, true, false);
  }
  cyberGate(0, 22, 0, matCyan);          // 北门 青
  cyberGate(0, -22, 0, matMag);          // 南门 品红
  cyberGate(22, 0, Math.PI/2, matAmb);   // 东门 琥珀
  cyberGate(-22, 0, Math.PI/2, matPur);  // 西门 紫

  // ====== 集装箱 / 断墙 / 翻倒车体 掩体(mBox 组合) ======
  // 集装箱(西北/西南)
  mBox(-18, 1.3, 14, 6, 2.6, 2.6, crateMat); mBox(-18, 3.6, 14, 5.6, 2.0, 2.4, crateMat); // 叠两层可上
  makeStairs(-15, 14, -1, 0, 2.6, 2.4, crateMat); // 爬上集装箱第一层
  mBox(-16, 1.3, -14, 2.6, 2.6, 6, crateMat);
  // 断墙(中场分割掩体)
  mBox(8, 1.4, 12, 0.6, 2.8, 5, steelMat);
  mBox(-8, 1.4, -12, 5, 2.8, 0.6, steelMat);
  // 翻倒车体(扁长低掩体)
  mBox(12, 0.8, -6, 4.2, 1.6, 2.0, steelMat);
  mBox(-12, 0.8, 6, 2.0, 1.6, 4.2, steelMat);
  // 西南低台阶掩体堆
  mBox(-20, 1.0, -18, 3, 2.0, 3, crateMat);

  // ====== 沿墙霓虹招牌灯箱(emissive, 非碰撞, 贴墙发光) ======
  function cyberSign(x, y, z, w, h, neonMat, ry) {
    var sign = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), neonMat);
    sign.position.set(x, y, z); if (ry) sign.rotation.y = ry; mAdd(sign, true, false);
  }
  cyberSign(-14, 4.5, 29.2, 5, 2.2, matMag);            // 北墙
  cyberSign(13, 4.0, 29.2, 4, 1.6, matAmb);
  cyberSign(10, 4.8, -29.2, 5, 2.4, matCyan);           // 南墙
  cyberSign(-12, 3.8, -29.2, 4, 1.5, matPur);
  cyberSign(29.2, 4.6, -14, 5, 2.2, matCyan, Math.PI/2); // 东墙
  cyberSign(-29.2, 4.4, 12, 5, 2.0, matMag, Math.PI/2);  // 西墙
  cyberSign(-29.2, 4.0, -10, 3.5, 1.6, matAmb, Math.PI/2);

  // ====== 出生点 ~10 个：四角走廊入口 + 四边招牌阴影处, 背靠墙, 远离中央塔 ======
  var sp = [[26,26],[-26,26],[26,-26],[-26,-26],[27,12],[-27,12],[-27,-12],[12,27],[-14,-27],[27,-2]];
  spawnPoints = sp.map(function (p) { return new THREE.Vector3(p[0], highestSurfaceAt(p[0], p[1]) + EYE, p[1]); });
};

MAP_FX['cybercity'] = { onEnter: function (scene) {
  // 紫黑雨夜背景 + 浓紫雾
  scene.background = new THREE.Color(0x0c0a18);
  scene.fog = new THREE.FogExp2(0x1a1438, 0.03);
  // 压暗全局光照, 真正照明靠 emissive + PointLight
  if (hemiLight) { hemiLight.color.setHex(0x2b1f4a); hemiLight.groundColor.setHex(0x0a0c14); hemiLight.intensity = 0.35; }
  if (keyLight) { keyLight.color.setHex(0x3550aa); keyLight.intensity = 0.25; keyLight.position.set(0, 40, -20); }
  if (bloom) { bloom.bright.uniforms.threshold.value = 0.6; bloom.comp.uniforms.strength.value = 1.15; bloom.comp.uniforms.exposure.value = 1.0; }
  // 紫黑雨夜渐变天穹(地平线被霓虹染紫)
  makeSkyDome({ radius:150, topCol:0x07060f, midCol:0x2a1850, botCol:0x3a1c5c, emberAmt:0.0 });

  // 6~10 个 PointLight(青/品红/琥珀交替, 钉在招牌/掩体上)
  var lights = [
    [0, 11, 0, 0x16e0ff, 2.0, 20],     // 中央塔光环
    [0, 5.4, 22, 0x16e0ff, 1.6, 16],   // 北门
    [0, 5.4, -22, 0xff2a9d, 1.6, 16],  // 南门
    [22, 5.4, 0, 0xffae3a, 1.4, 16],   // 东门
    [-22, 5.4, 0, 0x9a4cff, 1.4, 16],  // 西门
    [21, 6.0, -4, 0xff2a9d, 1.6, 15],  // 倒塌楼顶
    [-14, 4.8, 28, 0xff2a9d, 1.3, 14], // 北墙招牌
    [29, 4.8, -14, 0x16e0ff, 1.3, 14], // 东墙招牌
    [-18, 4.0, 14, 0xffae3a, 1.2, 13]  // 集装箱
  ];
  for (var i = 0; i < lights.length; i++) {
    var L = lights[i], pl = new THREE.PointLight(L[3], L[4], L[5], 2);
    pl.position.set(L[0], L[1], L[2]); scene.add(pl); mapMeshes.push(pl);
  }

  // 斜向落雨(快速下落 + 横移, 回卷)
  makeParticles({ count:900, color:0xafc8e0, size:0.10, opacity:0.55, additive:false,
    init:function(arr,n){ for(var i=0;i<n;i++){ var k=i*3; arr[k]=Math.random()*60-30; arr[k+1]=Math.random()*20; arr[k+2]=Math.random()*60-30; } },
    step:function(arr,n,dt,t){ for(var i=0;i<n;i++){ var k=i*3;
      arr[k+1] -= dt*26.0;             // 快速下落
      arr[k]   += dt*5.0;              // 横移(雨丝斜向)
      if(arr[k+1] < 0.0 || arr[k] > 30){ arr[k]=Math.random()*60-30; arr[k+1]=20.0; arr[k+2]=Math.random()*60-30; } } } });

  // 稀疏品红火花(additive, 上飘)
  makeParticles({ count:120, color:0xff2a9d, size:0.13, opacity:0.9, additive:true,
    init:function(arr,n){ for(var i=0;i<n;i++){ var k=i*3; arr[k]=Math.random()*60-30; arr[k+1]=Math.random()*10; arr[k+2]=Math.random()*60-30; } },
    step:function(arr,n,dt,t){ for(var i=0;i<n;i++){ var k=i*3;
      arr[k+1] += dt*(0.8+(i%7)*0.1);
      if(arr[k+1] > 11){ arr[k+1]=0.2; arr[k]=Math.random()*60-30; arr[k+2]=Math.random()*60-30; } } } });
} };

if (!MAP_LIST.some(function (m) { return m.id === 'cybercity'; })) MAP_LIST.push({ id:'cybercity', name:'赛博废城·雨夜霓虹' });