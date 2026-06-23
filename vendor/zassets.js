/* ZAssets — 真实 glTF 僵尸/怪物资产管线（独立全局，不依赖游戏主闭包）。
 *
 * 资产: models/zmob_*.glb (Quaternius "Ultimate Monsters", CC0 公共领域)，每个都带
 *       Death / Walk(或Run/Fast_Flying) / 攻击 / Idle / HitReact 等骨骼动画。
 * 依赖: window.THREE (vendor/three.min.js) + THREE.GLTFLoader + THREE.SkeletonUtils
 *       —— 三个 <script> 必须按 three → GLTFLoader/SkeletonUtils → zassets 的顺序加载。
 *
 * 暴露 window.ZAssets:
 *   ZAssets.ready                 当前是否全部预载完成 (bool)
 *   ZAssets.onReady(cb)           注册就绪回调(已就绪立即触发)
 *   ZAssets.list                  可用变体键数组: ['demon','orc','yeti','ghost','skull']
 *   ZAssets.info()                调试信息(就绪/已载/各变体片段名)
 *   ZAssets.makeZombie(variant)   -> 实例对象，或 null(未就绪/无此变体且无回退):
 *       { root:Object3D, mixer:AnimationMixer, variant, clipNames:[],
 *         play(action,opts), dispose() }
 *       action ∈ 'move'|'attack'|'death'|'idle'|'hit'（自动映射到该模型实际片段）
 *       opts: { once:bool, fade:秒(默认0.15) }。'death' 自动单次播放并定格。
 *   ZAssets.update(dt)            统一推进所有未 dispose 实例的 mixer（也可各自 inst.mixer.update）
 *
 * 设计为「可选接入」：游戏玩法层若检测到 window.ZAssets && ZAssets.ready 即可用真实模型，
 * 否则继续用程序化网格。本文件不触碰游戏任何全局/DOM。
 */
(function () {
  'use strict';
  var T = window.THREE;
  function stub(err) {
    window.ZAssets = {
      ready: false, error: err, list: [],
      onReady: function () {}, update: function () {},
      info: function () { return { ready: false, error: err }; },
      makeZombie: function () { return null; }
    };
    if (window.console) console.warn('[ZAssets] 未启用:', err);
  }
  if (!T) { stub('window.THREE 不存在'); return; }
  if (!T.GLTFLoader || !T.SkeletonUtils) { stub('缺少 THREE.GLTFLoader / THREE.SkeletonUtils'); return; }

  var BASE = './models/';
  var PRE = 'CharacterArmature|';   // Quaternius 片段统一前缀
  // 变体 → 文件 + 缩放 + 语义动作到该模型真实片段名的映射
  var DEFS = {
    demon: { file: 'zmob_demon.glb', scale: 1.00, act: { move: 'Run',         attack: 'Punch',      death: 'Death', idle: 'Idle',        hit: 'HitReact'   } },
    orc:   { file: 'zmob_orc.glb',   scale: 1.05, act: { move: 'Walk',        attack: 'Bite_Front', death: 'Death', idle: 'Idle',        hit: 'HitRecieve' } },
    yeti:  { file: 'zmob_yeti.glb',  scale: 1.55, act: { move: 'Walk',        attack: 'Bite_Front', death: 'Death', idle: 'Idle',        hit: 'HitRecieve' } },
    ghost: { file: 'zmob_ghost.glb', scale: 1.00, act: { move: 'Fast_Flying', attack: 'Headbutt',   death: 'Death', idle: 'Flying_Idle', hit: 'HitReact'   } },
    skull: { file: 'zmob_skull.glb', scale: 0.90, act: { move: 'Fast_Flying', attack: 'Headbutt',   death: 'Death', idle: 'Flying_Idle', hit: 'HitReact'   } }
  };
  var keys = Object.keys(DEFS);
  var cache = {};        // variant -> { scene, clips, names:{} }
  var live = [];         // 活动实例(供 update)
  var readyCbs = [];
  var loaded = 0;
  var loader = new T.GLTFLoader();

  var API = {
    ready: false, error: null, list: keys.slice(),
    onReady: function (cb) { if (typeof cb !== 'function') return; if (API.ready) cb(); else readyCbs.push(cb); },
    update: function (dt) { for (var i = 0; i < live.length; i++) { if (live[i] && live[i].mixer) live[i].mixer.update(dt); } },
    info: function () {
      var o = { ready: API.ready, loaded: loaded, total: keys.length, variants: {} };
      for (var k in cache) o.variants[k] = Object.keys(cache[k].names);
      return o;
    },
    makeZombie: function (variant) {
      var key = cache[variant] ? variant : (cache[keys[0]] ? keys[0] : null);
      if (!key) return null;                       // 一个都没载成功
      var def = DEFS[key], entry = cache[key];
      var root = T.SkeletonUtils.clone(entry.scene);
      root.scale.setScalar(def.scale || 1);
      root.traverse(function (o) { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } });
      var mixer = new T.AnimationMixer(root);
      var names = entry.names;                      // realName -> clip
      function pick(action) { var real = def.act[action]; return names[PRE + real] || names[real] || null; }
      var current = null;
      function play(action, opts) {
        opts = opts || {};
        var clip = pick(action); if (!clip) return null;
        var a = mixer.clipAction(clip);
        if (action === 'death' || opts.once) { a.setLoop(T.LoopOnce, 1); a.clampWhenFinished = true; }
        else { a.setLoop(T.LoopRepeat, Infinity); }
        a.reset();
        if (current && current !== a && current.fadeOut) current.fadeOut(opts.fade == null ? 0.15 : opts.fade);
        if (a.fadeIn) a.fadeIn(opts.fade == null ? 0.15 : opts.fade);
        a.play();
        current = a;
        return a;
      }
      var inst = {
        root: root, mixer: mixer, variant: key, clipNames: Object.keys(names),
        play: play,
        dispose: function () { var k = live.indexOf(inst); if (k >= 0) live.splice(k, 1); try { mixer.stopAllAction(); mixer.uncacheRoot(root); } catch (e) {} }
      };
      live.push(inst);
      return inst;
    }
  };
  window.ZAssets = API;

  function done() {
    if (++loaded >= keys.length) {
      API.ready = true;
      for (var i = 0; i < readyCbs.length; i++) { try { readyCbs[i](); } catch (e) {} }
      readyCbs.length = 0;
    }
  }
  keys.forEach(function (key) {
    loader.load(BASE + DEFS[key].file, function (gltf) {
      var names = {};
      var clips = gltf.animations || [];
      for (var i = 0; i < clips.length; i++) names[clips[i].name] = clips[i];
      cache[key] = { scene: gltf.scene, clips: clips, names: names };
      done();
    }, undefined, function (err) {
      if (window.console) console.warn('[ZAssets] 载入失败 ' + key, err);
      done();   // 单个失败不卡死整体；该变体 makeZombie 回退到首个成功的
    });
  });
})();
