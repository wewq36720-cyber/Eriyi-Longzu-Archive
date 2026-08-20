(() => {
  'use strict';

  const ROOT = '/images/dragon/';
  const SCENES = {
    hero: {
      bg: `${ROOT}longzu-main.jpg`,
      accent: [224, 174, 92],
      kicker: 'DRAGON ARCHIVE / 非官方同人主题站',
      title: '绘梨衣',
      subtitle: '在雨落下以前，记住她安静而明亮的世界',
      narrations: [
        '她把复杂的世界写成很短的句子，也把最柔软的愿望藏在沉默里。',
        '东京的雨、夜晚的列车和一盏没有熄灭的灯，组成她被记住的方向。',
        '这是一份关于龙族、绘梨衣与短暂旅程的非官方同人档案。',
      ],
      choices: [
        { label: '进入记忆', target: 'projects' },
        { label: '查看世界观', target: 'capabilities' },
        { label: '打开档案', target: 'about' },
        { label: '浏览 CG', target: 'gallery' },
      ],
    },
    projects: {
      bg: `${ROOT}longzu-projects.jpg`,
      accent: [111, 151, 211],
      kicker: 'MEMORY FRAGMENTS / 记忆片段',
      title: '雨夜与列车',
      subtitle: '城市、樱井小暮、源稚生，以及没有说完的话',
      narrations: [
        '雨水把东京的灯光拉成长线，列车从夜色中穿过，带走一段短暂的同行。',
        '她不擅长解释自己的心意，却会用一个简单的词，把重要的人留在身边。',
        '记忆不是结局；它是每一次回望时，仍然亮着的那一小块地方。',
      ],
      choices: [
        { label: '回到总览', target: 'hero' },
        { label: '查看世界观', target: 'capabilities' },
        { label: '打开档案', target: 'about' },
        { label: '浏览 CG', target: 'gallery' },
      ],
    },
    capabilities: {
      bg: `${ROOT}longzu-capabilities.jpg`,
      accent: [202, 93, 117],
      kicker: 'WORLD FILES / 世界观索引',
      title: '龙族世界',
      subtitle: '血统、学院、家族与命运交汇的边界',
      narrations: [
        '蛇岐八家的灯火、学院的钟声与龙血的回响，构成这个世界危险又华丽的底色。',
        '暴血意味着力量，也意味着必须付出的代价；每一次选择都在靠近命运的中心。',
        '在巨大的传说里，她仍然保留着自己的速度、语言和不肯熄灭的温柔。',
      ],
      choices: [
        { label: '回到总览', target: 'hero' },
        { label: '进入记忆', target: 'projects' },
        { label: '打开档案', target: 'about' },
        { label: '浏览 CG', target: 'gallery' },
      ],
    },
    about: {
      bg: `${ROOT}longzu-about.jpg`,
      accent: [111, 201, 190],
      kicker: 'CHARACTER FILE / 角色档案',
      title: '安静的火焰',
      subtitle: '绘梨衣：直接、孤独、温柔，也从未真正黯淡',
      narrations: [
        '她喜欢简单的表达，喜欢清晰的答案，也把没有说出口的情绪交给雨和风。',
        '她的孤独不是空白，而是一座很少有人能够进入、却一直有人守护的城。',
        '如果故事还会继续，愿她在下一场雨里拥有更长的春天。',
      ],
      choices: [
        { label: '回到总览', target: 'hero' },
        { label: '进入记忆', target: 'projects' },
        { label: '查看世界观', target: 'capabilities' },
        { label: '浏览 CG', target: 'gallery' },
      ],
    },
    lost: {
      bg: `${ROOT}longzu-about.jpg`,
      accent: [224, 174, 92],
      kicker: 'ARCHIVE LOST / 记忆偏航',
      title: '这段记忆不在这里',
      subtitle: '沿着雨声返回档案入口',
      narrations: ['有些页面会迷路，但故事仍然知道回家的方向。'],
      choices: [{ label: '返回档案入口', target: 'hero' }],
    },
  };

  const SCENE_ORDER = ['hero', 'projects', 'capabilities', 'about'];
  const SCENE_LABELS = { hero: '总览', projects: '记忆', capabilities: '世界观', about: '档案', gallery: 'CG' };
  const CG_IMAGES = Array.from({ length: 10 }, (_, i) => `${ROOT}cg_${String(i + 1).padStart(2, '0')}.jpg`);

  let currentScene = 'hero';
  let narrationIndex = 0;
  let isTyping = false;
  let cgIndex = 0;
  let galleryOpen = false;
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;

  const createDOM = (body) => {
    const particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particle-canvas';
    body.appendChild(particleCanvas);

    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.id = 'cursor-glow';
    body.appendChild(cursorGlow);

    const orb1 = document.createElement('div');
    orb1.className = 'ambient-orb ambient-orb-1';
    orb1.id = 'ambient-orb-1';
    body.appendChild(orb1);

    const orb2 = document.createElement('div');
    orb2.className = 'ambient-orb ambient-orb-2';
    orb2.id = 'ambient-orb-2';
    body.appendChild(orb2);

    const loading = document.createElement('div');
    loading.className = 'loading-screen';
    loading.id = 'loading-screen';
    loading.innerHTML = `
      <div class="loading-glyph"><div class="loading-ring"></div><div class="loading-ring"></div><div class="loading-ring"></div><div class="loading-center-dot"></div></div>
      <div class="loading-title">龙族档案</div>
      <div class="loading-subtitle">ARCHIVE INITIALIZING</div>
      <div class="loading-progress"><div class="loading-progress-fill"></div></div>
    `;
    body.appendChild(loading);

    const overlay = document.createElement('div');
    overlay.id = 'dragon-overlay';
    overlay.innerHTML = `
      <div class="scene-bg-layer"><div class="scene-bg-image" id="scene-bg"></div><div class="scene-gradient-overlay"></div><div class="scene-color-wash" id="scene-color-wash"></div></div>
      <div class="content-overlay" id="content-overlay">
        <div class="scene-title-block"><div class="scene-kicker" id="scene-kicker"></div><h1 class="scene-main-title" id="scene-title"></h1><div class="scene-subtitle" id="scene-subtitle"></div></div>
        <div class="bottom-info"><div class="scene-indicator"><div class="scene-line" id="scene-line"></div><div class="scene-number" id="scene-number"></div></div><div class="narration-text" id="narration-text"></div><div class="nav-choices" id="nav-choices"></div></div>
      </div>
      <div class="top-nav" id="top-nav"><div class="brand-lockup"><span class="brand-mark">DRAGON</span><span class="brand-divider">/</span><span class="brand-context">ARCHIVE · 龙族档案</span></div><div class="nav-dots" id="nav-dots"></div><div class="nav-meta"><span class="nav-meta-dot"></span><span>ERISU</span><span class="nav-meta-slash">/</span><span>MEMORY FILES</span></div></div>
      <div class="side-indicator" id="side-indicator"></div>
    `;
    body.appendChild(overlay);

    const navDots = document.getElementById('nav-dots');
    navDots.innerHTML = SCENE_ORDER.map((key) => `<div class="nav-dot${key === 'hero' ? ' active' : ''}" data-target="${key}"><div class="nav-dot-label">${SCENE_LABELS[key]}</div><div class="nav-dot-circle"></div></div>`).join('') + '<div class="nav-dot" data-target="gallery"><div class="nav-dot-label">CG</div><div class="nav-dot-circle"></div></div>';
    document.getElementById('side-indicator').innerHTML = SCENE_ORDER.map((key, i) => `<div class="side-tick${i === 0 ? ' active' : ''}" data-target="${key}"><div class="side-tick-label">${SCENE_LABELS[key]}</div><div class="side-tick-line"></div><div class="side-tick-dot"></div></div>`).join('');

    const gallery = document.createElement('div');
    gallery.className = 'cg-gallery';
    gallery.id = 'cg-gallery';
    gallery.innerHTML = `<div class="cg-display"><button class="cg-close" id="cg-close">CLOSE ✕</button><button class="cg-nav-btn cg-nav-prev" id="cg-prev">‹</button><img class="cg-image" id="cg-image" src="" alt="龙族主题 CG"><button class="cg-nav-btn cg-nav-next" id="cg-next">›</button><div class="cg-counter" id="cg-counter"></div></div><div class="cg-thumbnails" id="cg-thumbnails"></div>`;
    body.appendChild(gallery);
  };

  const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length: 80 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, size: .5 + Math.random() * 2, speedX: (Math.random() - .5) * .3, speedY: -.1 - Math.random() * .3, opacity: .1 + Math.random() * .4, phase: Math.random() * Math.PI * 2 }));
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * .001;
      const r = getComputedStyle(document.documentElement).getPropertyValue('--accent-r') || '224';
      const g = getComputedStyle(document.documentElement).getPropertyValue('--accent-g') || '174';
      const b = getComputedStyle(document.documentElement).getPropertyValue('--accent-b') || '92';
      particles.forEach((p) => { p.x += p.speedX + (mouseX - .5) * .2; p.y += p.speedY; if (p.y < -10) p.y = canvas.height + 10; if (p.x < -10) p.x = canvas.width + 10; if (p.x > canvas.width + 10) p.x = -10; const alpha = p.opacity * (.5 + .5 * Math.sin(time * 2 + p.phase)); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`; ctx.fill(); });
      requestAnimationFrame(draw);
    };
    draw();
  };

  const initMouseTracking = () => {
    document.addEventListener('mousemove', (event) => { targetMouseX = event.clientX / innerWidth; targetMouseY = event.clientY / innerHeight; const glow = document.getElementById('cursor-glow'); glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; glow.classList.add('active'); });
    const animate = () => { mouseX += (targetMouseX - mouseX) * .05; mouseY += (targetMouseY - mouseY) * .05; const bg = document.getElementById('scene-bg'); if (bg) { const x = (mouseX - .5) * -8; const y = (mouseY - .5) * -6; bg.style.transform = `scale(${bg.classList.contains('active') ? 1 : 1.08}) translate(${x}px, ${y}px)`; } requestAnimationFrame(animate); };
    animate();
  };

  const setAccentColor = (rgb) => { const root = document.documentElement; root.style.setProperty('--accent-r', rgb[0]); root.style.setProperty('--accent-g', rgb[1]); root.style.setProperty('--accent-b', rgb[2]); const wash = document.getElementById('scene-color-wash'); wash.style.background = `radial-gradient(ellipse at 50% 50%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},.3), transparent 70%)`; wash.classList.add('active'); document.getElementById('ambient-orb-1').style.background = `rgb(${rgb.join(',')})`; document.getElementById('ambient-orb-2').style.background = `rgb(${rgb.join(',')})`; document.getElementById('ambient-orb-1').classList.add('active'); document.getElementById('ambient-orb-2').classList.add('active'); };

  const typeNarration = (text) => { isTyping = true; const element = document.getElementById('narration-text'); element.innerHTML = ''; let index = 0; const type = () => { if (index < text.length) { element.innerHTML = `${text.slice(0, index + 1)}<span class="type-cursor"></span>`; index += 1; setTimeout(type, 30); } else { isTyping = false; }; }; type(); };
  const updateChoices = (choices) => { const container = document.getElementById('nav-choices'); container.innerHTML = ''; choices.forEach((choice) => { const button = document.createElement('button'); button.className = 'nav-choice'; button.textContent = choice.label; button.addEventListener('click', () => switchScene(choice.target)); container.appendChild(button); }); };
  const advanceNarration = () => { if (isTyping) return; const scene = SCENES[currentScene]; narrationIndex += 1; if (narrationIndex < scene.narrations.length) typeNarration(scene.narrations[narrationIndex]); else document.querySelector('.type-cursor')?.remove(); };

  const switchScene = (sceneId) => {
    if (sceneId === 'gallery') return openGallery();
    const scene = SCENES[sceneId]; if (!scene) return;
    currentScene = sceneId; narrationIndex = 0;
    document.querySelectorAll('.nav-dot').forEach((dot) => dot.classList.toggle('active', dot.dataset.target === sceneId));
    document.querySelectorAll('.side-tick').forEach((tick) => tick.classList.toggle('active', tick.dataset.target === sceneId));
    setAccentColor(scene.accent);
    const bg = document.getElementById('scene-bg'); bg.classList.remove('active');
    setTimeout(() => { bg.style.backgroundImage = `url(${scene.bg})`; requestAnimationFrame(() => bg.classList.add('active')); }, 300);
    const kicker = document.getElementById('scene-kicker'); const title = document.getElementById('scene-title'); const subtitle = document.getElementById('scene-subtitle'); const line = document.getElementById('scene-line');
    [kicker, title, subtitle, line].forEach((element) => element.classList.remove('revealed'));
    setTimeout(() => { kicker.textContent = scene.kicker; title.textContent = scene.title; subtitle.textContent = scene.subtitle; document.getElementById('scene-number').textContent = `${String(Math.max(1, SCENE_ORDER.indexOf(sceneId) + 1)).padStart(2, '0')} / ${String(SCENE_ORDER.length).padStart(2, '0')}`; [kicker, title, subtitle, line].forEach((element) => element.classList.add('revealed')); }, 400);
    updateChoices(scene.choices); typeNarration(scene.narrations[0]);
  };

  const showCG = (index) => { cgIndex = index; const image = document.getElementById('cg-image'); image.classList.remove('ken-burns'); setTimeout(() => { image.src = CG_IMAGES[index]; image.classList.add('ken-burns'); document.getElementById('cg-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(CG_IMAGES.length).padStart(2, '0')}`; }, 100); document.querySelectorAll('.cg-thumb').forEach((thumb, i) => thumb.classList.toggle('active', i === index)); };
  const openGallery = () => { galleryOpen = true; const thumbs = document.getElementById('cg-thumbnails'); thumbs.innerHTML = ''; CG_IMAGES.forEach((src, index) => { const thumb = document.createElement('img'); thumb.className = `cg-thumb${index === 0 ? ' active' : ''}`; thumb.src = src; thumb.alt = `CG ${index + 1}`; thumb.addEventListener('click', () => showCG(index)); thumbs.appendChild(thumb); }); showCG(0); document.getElementById('cg-gallery').classList.add('active'); };
  const closeGallery = () => { galleryOpen = false; document.getElementById('cg-gallery').classList.remove('active'); };

  const bindEvents = () => {
    document.getElementById('content-overlay').addEventListener('click', (event) => { if (!event.target.closest('.nav-choice')) advanceNarration(); });
    document.querySelectorAll('.nav-dot, .side-tick').forEach((item) => item.addEventListener('click', () => switchScene(item.dataset.target)));
    document.getElementById('cg-close').addEventListener('click', closeGallery);
    document.getElementById('cg-prev').addEventListener('click', () => showCG((cgIndex - 1 + CG_IMAGES.length) % CG_IMAGES.length));
    document.getElementById('cg-next').addEventListener('click', () => showCG((cgIndex + 1) % CG_IMAGES.length));
    document.addEventListener('keydown', (event) => { if (galleryOpen) { if (event.key === 'Escape') closeGallery(); if (event.key === 'ArrowLeft') showCG((cgIndex - 1 + CG_IMAGES.length) % CG_IMAGES.length); if (event.key === 'ArrowRight') showCG((cgIndex + 1) % CG_IMAGES.length); } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advanceNarration(); } });
    let wheelTimeout; document.addEventListener('wheel', (event) => { if (galleryOpen) return; clearTimeout(wheelTimeout); wheelTimeout = setTimeout(() => { const index = SCENE_ORDER.indexOf(currentScene); if (event.deltaY > 0 && index < SCENE_ORDER.length - 1) switchScene(SCENE_ORDER[index + 1]); else if (event.deltaY < 0 && index > 0) switchScene(SCENE_ORDER[index - 1]); }, 100); }, { passive: true });
  };

  const start = () => { const body = document.body; if (!body || !body.classList.contains('site-body')) return; createDOM(body); initParticles(); initMouseTracking(); bindEvents(); const initial = body.dataset.scene || 'hero'; setTimeout(() => { document.getElementById('loading-screen').classList.add('hidden'); setTimeout(() => switchScene(SCENES[initial] ? initial : 'hero'), 450); }, 1800); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
