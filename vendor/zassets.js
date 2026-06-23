/* ZAssets — 真实 glTF 僵尸/怪物资产管线（独立全局，不依赖游戏主闭包）。
 *
 * 资产: models/zmob_*.glb (Quaternius "Ultimate Monsters", CC0)，含 Death/Walk/Run/Fast_Flying/
 *       Punch/Bite_Front/Headbutt/Idle/HitReact 骨骼动画（前缀 "CharacterArmature|"）。
 * 依赖: window.THREE + THREE.GLTFLoader + THREE.SkeletonUtils（按 three→loader→zassets 顺序加载）。
 *
 * 与玩法层的契约（玩法层 makeZombieMesh 里已有: `var ext=ZAssets.makeZombie(type);
 * if(ext && ext.isObject3D){ return {root:ext, rig:false}; }`）:
 *   ZAssets.makeZombie(type) 直接返回一个【裸 THREE.Object3D】(可直接 scene.add / 当作模型根),
 *   已做好: ①按僵尸种类映射到不同怪物模型 ②尺寸归一化到与该种类匹配的身高(脚底=y0)
 *           ③朝向对齐(正面朝 -z, 与程序化僵尸一致) ④默认自动播放行走动画
 *           ⑤动画由本模块内部 RAF 自驱(玩法层 poseZombie 在 !rig 时跳过, 无需它调用 update)
 *           ⑥从场景移除后自动回收 mixer(玩法层 zClearAll/死亡 remove(group) 即可, 无内存泄漏)
 *   控制句柄挂在 obj.userData.za = { mixer, play(action,opts), variant, type }，可选用于触发 attack/death。
 *
 * 其它: ZAssets.ready / onReady(cb) / list / info() / update(dt)(手动推进, 已有内部RAF则一般不需要)。
 */
(function () {
  'use strict';
  var T = window.THREE;
  function stub(err) {
    window.ZAssets = { ready: false, error: err, list: [], onReady: function () {}, update: function () {},
      info: function () { return { ready: false, error: err }; }, makeZombie: function () { return null; } };
    if (window.console) console.warn('[ZAssets] 未启用:', err);
  }
  if (!T) { stub('window.THREE 不存在'); return; }
  if (!T.GLTFLoader || !T.SkeletonUtils) { stub('缺少 THREE.GLTFLoader / THREE.SkeletonUtils'); return; }

  var BASE = './models/';
  var PRE = 'CharacterArmature|';
  // 模型变体 → 文件 + 语义动作到该模型真实片段名的映射
  var DEFS = {
    demon: { file: 'zmob_demon.glb', act: { move: 'Run',         attack: 'Punch',      death: 'Death', idle: 'Idle',        hit: 'HitReact'   } },
    orc:   { file: 'zmob_orc.glb',   act: { move: 'Walk',        attack: 'Bite_Front', death: 'Death', idle: 'Idle',        hit: 'HitRecieve' } },
    yeti:  { file: 'zmob_yeti.glb',  act: { move: 'Walk',        attack: 'Bite_Front', death: 'Death', idle: 'Idle',        hit: 'HitRecieve' } },
    ghost: { file: 'zmob_ghost.glb', act: { move: 'Fast_Flying', attack: 'Headbutt',   death: 'Death', idle: 'Flying_Idle', hit: 'HitReact'   } },
    skull: { file: 'zmob_skull.glb', act: { move: 'Fast_Flying', attack: 'Headbutt',   death: 'Death', idle: 'Flying_Idle', hit: 'HitReact'   } }
  };
  // 玩法层僵尸种类 → { 模型变体, 目标身高(单位) }。身高镜像玩法层 ZTYPES.scale(基准≈1.75u)。
  var H = 1.75;
  var TYPEMAP = {
    walker:   { variant: 'orc',   h: H * 1.00 },
    runner:   { variant: 'demon', h: H * 0.96 },
    crawler:  { variant: 'skull', h: H * 0.78 },
    brute:    { variant: 'yeti',  h: H * 1.70 },
    spitter:  { variant: 'ghost', h: H * 1.08 },
    bomber:   { variant: 'demon', h: H * 1.05 },
    screamer: { variant: 'skull', h: H * 1.02 },
    boss:     { variant: 'yeti',  h: H * 2.10 },
    _default: { variant: 'orc',   h: H * 1.00 }
  };

  var keys = Object.keys(DEFS);
  var cache = {};        // variant -> { scene, names:{}, natH, minY }
  var live = [];         // { root, mixer, added }
  var readyCbs = [];
  var loaded = 0;
  var loader = new T.GLTFLoader();

  function firstReady() { for (var i = 0; i < keys.length; i++) if (cache[keys[i]]) return keys[i]; return null; }

  var API = {
    ready: false, error: null, list: Object.keys(TYPEMAP).filter(function (k) { return k !== '_default'; }),
    onReady: function (cb) { if (typeof cb !== 'function') return; if (API.ready) cb(); else readyCbs.push(cb); },
    update: function (dt) { for (var i = 0; i < live.length; i++) if (live[i].mixer) live[i].mixer.update(dt); },
    info: function () { var o = { ready: API.ready, loaded: loaded, total: keys.length, variants: {} }; for (var k in cache) o.variants[k] = { natH: +cache[k].natH.toFixed(2), clips: Object.keys(cache[k].names).length }; return o; },
    // 返回裸 Object3D（玩法层 ext.isObject3D 检查通过）；模型已归一化+自动行走+自驱动画。
    makeZombie: function (type) {
      var map = TYPEMAP[type] || TYPEMAP._default;
      var key = cache[map.variant] ? map.variant : firstReady();
      if (!key) return null;
      var def = DEFS[key], entry = cache[key];
      var model = T.SkeletonUtils.clone(entry.scene);
      model.traverse(function (o) { if (o.isMesh || o.isSkinnedMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } });
      var s = entry.natH > 0.001 ? (map.h / entry.natH) : 1;
      model.scale.multiplyScalar(s);
      model.position.y = -entry.minY * s;     // 脚底落到 y=0
      model.rotation.y = Math.PI;             // 正面朝 -z, 与程序化僵尸(双臂朝 -z 前伸)一致
      var outer = new T.Group();
      outer.add(model);
      var mixer = new T.AnimationMixer(model);
      var names = entry.names, current = null;
      function play(action, opts) {
        opts = opts || {};
        var real = def.act[action]; var clip = names[PRE + real] || names[real]; if (!clip) return null;
        var a = mixer.clipAction(clip);
        if (action === 'death' || opts.once) { a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = true; } else { a.setLoop(T.LoopRepeat, Infinity); }
        a.reset();
        if (current && current !== a && current.fadeOut) current.fadeOut(opts.fade == null ? 0.15 : opts.fade);
        if (a.fadeIn) a.fadeIn(opts.fade == null ? 0.12 : opts.fade);
        a.play(); current = a; return a;
      }
      play('move');   // 默认行走循环（玩法层负责平移，动画在原地循环）
      outer.userData.za = { mixer: mixer, play: play, variant: key, type: type };
      live.push({ root: outer, mixer: mixer, added: false });
      return outer;
    }
  };
  window.ZAssets = API;

  // 内部自驱：每帧推进所有活动 mixer；被移出场景(parent=null)后自动回收，避免泄漏。
  var _last = 0;
  function tick(t) {
    requestAnimationFrame(tick);
    var dt = _last ? Math.min((t - _last) / 1000, 0.05) : 0.016; _last = t;
    for (var i = live.length - 1; i >= 0; i--) {
      var L = live[i];
      if (L.root.parent) L.added = true;
      else if (L.added) { try { L.mixer.stopAllAction(); L.mixer.uncacheRoot(L.root.children[0]); } catch (e) {} live.splice(i, 1); continue; }
      L.mixer.update(dt);
    }
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(tick);

  function done() { if (++loaded >= keys.length) { API.ready = true; for (var i = 0; i < readyCbs.length; i++) { try { readyCbs[i](); } catch (e) {} } readyCbs.length = 0; } }
  keys.forEach(function (key) {
    loader.load(BASE + DEFS[key].file, function (gltf) {
      var names = {}; var clips = gltf.animations || [];
      for (var i = 0; i < clips.length; i++) names[clips[i].name] = clips[i];
      var box = new T.Box3().setFromObject(gltf.scene);
      var natH = (box.max.y - box.min.y) || 1, minY = box.min.y;
      cache[key] = { scene: gltf.scene, names: names, natH: natH, minY: minY };
      done();
    }, undefined, function (err) { if (window.console) console.warn('[ZAssets] 载入失败 ' + key, err); done(); });
  });
})();
