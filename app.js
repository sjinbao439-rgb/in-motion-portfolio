const detail = document.querySelector('#detail');
const detailBody = document.querySelector('#detailBody');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const types = { project: '项目案例', study: '新作 · 交互片段', result: '成果展示' };
let cleanUp = () => {};
let opener = null;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}
function canvasArt(parent, entry) {
  const art = node('div', 'art');
  if (entry.image) {
    const picture = node('img');
    picture.src = entry.image;
    picture.alt = entry.imageAlt || '';
    art.style.setProperty('--image-anchor', entry.anchor || '50% 50%');
    art.append(picture);
  } else {
    const canvas = node('canvas');
    canvas.width = 840;
    canvas.height = 420;
    canvas.setAttribute('aria-hidden', 'true');
    art.append(canvas);
    const c = canvas.getContext('2d');
    if (entry.id === 'handover') road(c, 840, 420, true);
    else if (entry.id === 'climate') air(c, 840, 420, {x: 17, y: -9, power: 3}, .44);
    else if (entry.id === 'gesture') gestureArt(c);
    else memoryArt(c, entry.id === 'sound-lab');
  }
  parent.append(art);
}
function renderCard(entry, index = null) {
  // Links retain native keyboard and browser behaviors. The same card opens a detail dialog.
  const card = node('a', index === null ? 'card' : 'featured-card');
  card.href = '#' + entry.id;
  canvasArt(card, entry);
  if (index !== null) {
    const caption = node('div', 'featured-caption');
    caption.append(node('span', '', String(index + 1).padStart(2, '0')), node('b', '', entry.title), node('span', '', '↗'));
    card.append(caption);
  } else {
    const body = node('div', 'card-body');
    const meta = node('div', 'card-meta');
    meta.append(node('span', '', types[entry.type]), node('span', '', entry.theme));
    body.append(meta, node('h3', '', entry.title), node('p', '', entry.summary));
    card.append(body);
  }
  return card;
}

const cardList = document.querySelector('#cards');
function filter(type) {
  cardList.replaceChildren(...works.filter((item) => type === 'all' || item.type === type).map((item) => renderCard(item)));
  document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
}
document.querySelector('#filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (button) filter(button.dataset.filter);
});
filter('all');
const featuredCards = featured.map((key) => works.find((item) => item.id === key)).filter(Boolean);
document.querySelector('#featuredCards').replaceChildren(...featuredCards.map(renderCard));

const route = document.querySelector('#route');
function drawRoute() {
  const rect = route.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const density = Math.min(devicePixelRatio, 2);
  route.width = Math.ceil(rect.width * density);
  route.height = Math.ceil(rect.height * density);
  const c = route.getContext('2d');
  const w = route.width, h = route.height;
  c.strokeStyle = '#304034'; c.lineWidth = 1;
  for (let x = 0; x < w; x += 30 * density) {
    for (let y = 0; y < h; y += 30 * density) {
      c.beginPath(); c.moveTo(x - 1.8 * density, y); c.lineTo(x + 1.8 * density, y);
      c.moveTo(x, y - 1.8 * density); c.lineTo(x, y + 1.8 * density); c.stroke();
    }
  }
  const line = (offset) => {
    c.beginPath(); c.moveTo(w * .90, 0);
    c.bezierCurveTo(w * 1.0, h * .16 + offset, w * .13, h * .17 + offset, w * .20, h * .34 + offset);
    c.bezierCurveTo(w * .25, h * .50 + offset, w * .99, h * .47 + offset, w * .89, h * .62 + offset);
    c.bezierCurveTo(w * .85, h * .77 + offset, w * .16, h * .74 + offset, w * .20, h * .91 + offset);
    c.quadraticCurveTo(w * .24, h * .97 + offset, w * .33, h);
    c.stroke();
  };
  c.strokeStyle = '#b8ee6554'; c.lineWidth = 1.5 * density; line(-9 * density); line(9 * density);
  c.strokeStyle = '#c4ed7e9c'; c.lineWidth = 1 * density; c.setLineDash([4 * density, 9 * density]); line(0);
}
new ResizeObserver(drawRoute).observe(route);

function setView(id) {
  const entry = works.find((item) => item.id === id);
  if (!entry) {
    if (detail.open) detail.close();
    return;
  }
  cleanUp();
  cleanUp = () => {};
  detailBody.replaceChildren();
  const heading = node('h2', '', entry.title);
  heading.id = 'detailTitle';
  detailBody.append(node('p', 'eyebrow', types[entry.type] + ' / ' + entry.theme), heading, node('p', 'detail-copy', entry.description));
  if (entry.url) {
    const art = node('div', 'project-art');
    canvasArt(art, entry);
    detailBody.append(art);
    if (entry.steps) {
      const steps = node('ol', 'project-steps');
      entry.steps.forEach((step) => steps.append(node('li', '', step)));
      detailBody.append(steps);
    }
    const link = node('a', 'pill primary', '打开原型 ↗');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const actions = node('div', 'project-cta');
    actions.append(link);
    detailBody.append(actions);
  } else {
    const template = document.getElementById(id);
    if (template) detailBody.append(template.content.cloneNode(true));
  }
  if (!detail.open) detail.showModal();
  detail.scrollTop = 0;
  document.querySelector('#back').focus();
  if (id === 'handover') cleanUp = setupHandover();
  if (id === 'climate') cleanUp = setupClimate();
  if (id === 'gesture') setupGesture();
}
function updateView() { setView(location.hash.slice(1)); }
function backToArchive() {
  const target = opener?.classList.contains('featured-card') ? '#featured' : '#archive';
  history.replaceState(null, '', target);
  detail.close();
}
document.addEventListener('click', (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const card = event.target.closest('.card,.featured-card');
  if (!card) return;
  opener = card;
  if (card.hash === location.hash && !detail.open) updateView();
});
window.addEventListener('hashchange', updateView);
document.getElementById('back').addEventListener('click', backToArchive);
detail.addEventListener('cancel', (event) => { event.preventDefault(); backToArchive(); });
detail.addEventListener('close', () => {
  if (detail.open) return;
  cleanUp();
  cleanUp = () => {};
  opener?.focus({ preventScroll: true });
});
updateView();

function background(c, w, h, top, bottom) {
  const gradient = c.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
  c.fillStyle = gradient; c.fillRect(0, 0, w, h);
}
function path(c, points, color, width = 1.5) {
  c.strokeStyle = color; c.lineWidth = width;
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.stroke();
}
function memoryArt(c, waveform) {
  const w = 840, h = 420;
  background(c, w, h, '#142026', '#080d14');
  const glow = c.createRadialGradient(452, 180, 12, 452, 180, 390);
  glow.addColorStop(0, '#536a6040'); glow.addColorStop(1, '#35474400');
  c.fillStyle = glow; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 460; i++) {
    const x = ((i * 59.7) % 840), y = ((i * 137.31 + i * i * .57) % 420);
    c.fillStyle = i % 28 === 0 ? '#d7ffe889' : '#96cbd32b';
    c.fillRect(x, y, i % 28 === 0 ? 2 : 1, i % 28 === 0 ? 2 : 1);
  }
  if (waveform) {
    for (let i = 0; i < 93; i++) {
      const a = 8 + Math.abs(Math.sin(i * 2.45) * Math.sin(i * .09)) * 104;
      path(c, [[94 + i * 7, 211 - a], [94 + i * 7, 211 + a]], i % 5 ? '#8bbba9' : '#d5f678', 3);
    }
    return;
  }
  const stars = [[98,257],[191,188],[242,273],[342,160],[430,219],[530,119],[608,204],[697,152],[766,219]];
  path(c, stars, '#88c8a768', 1.3);
  path(c, [stars[1],stars[3],stars[5],stars[6],stars[8]], '#818bc269');
  ['河岸','工作室','家','小公园','机场','海边','林间停车点','灯塔','堤坝'].forEach((label, i) => {
    const [x,y] = stars[i]; const g = c.createRadialGradient(x,y,0,x,y,22);
    g.addColorStop(0, '#ddffb2'); g.addColorStop(.18,'#adf4ab79'); g.addColorStop(1,'#a9f4ca00');
    c.fillStyle = g; c.fillRect(x-22,y-22,44,44);
    c.fillStyle = '#c3dcd2'; c.font = '15px Microsoft YaHei, sans-serif'; c.fillText(label,x-9,y+27);
  });
}
function road(c, w, h, poster) {
  background(c, w, h, '#14242f', '#080d13');
  const x = w * .52, horizon = h * .32;
  for (let i = 0; i < 11; i++) {
    const top = horizon + Math.pow(i / 10, 2.3) * h * .69;
    path(c, [[0,top],[w,top]], '#5c84932a', 1);
  }
  for (const dx of [-.8,-.57,-.33,-.18,0,.18,.33,.57,.8]) {
    path(c, [[x+dx*w*.03,horizon],[x+dx*w,h]], dx === -.33 || dx === .33 ? '#84c9ce88' : '#5c84933b', 2);
  }
  const area = c.createLinearGradient(0,horizon,0,h);
  area.addColorStop(0,'#79e2d000'); area.addColorStop(1,'#79e2d025');
  c.fillStyle = area; c.beginPath();
  c.moveTo(x,horizon); c.lineTo(x+w*.18,h); c.lineTo(x-w*.18,h); c.fill();
  c.strokeStyle = '#c7eaed73'; c.strokeRect(x-26,horizon+15,52,28);
  if (poster) {
    c.fillStyle='#503720'; c.fillRect(x-79,h*.48,158,55);
    c.strokeStyle='#ffd790'; c.strokeRect(x-79,h*.48,158,55);
    c.font='20px Microsoft YaHei, sans-serif'; c.fillStyle='#ffe4a7'; c.textAlign='center';
    c.fillText('▲  请接管',x,h*.48+34); c.textAlign='start';
  }
}
function air(c, w, h, state, time) {
  background(c, w, h, '#112b2c', '#080f16');
  const ox = w*.50, oy=h*.30;
  const tx = w*(.5+state.x/100), ty=h*(.60+state.y/105);
  c.strokeStyle='#5174695f'; c.lineWidth=1.2;
  c.strokeRect(w*.11,h*.26,w*.78,h*.59);
  c.beginPath(); c.ellipse(ox,h*.56,w*.29,h*.28,0,0,Math.PI*2); c.stroke();
  path(c,[[w*.11,oy],[w*.89,oy]],'#b1d4bd9a',2);
  for (let i=0; i<13; i++) {
    const shift=(i-6)*w*.013, color=i%4===0?'#a6ffda':'#64cfc19a';
    const spread=(i-6)*w*.016*(state.power/5+.5);
    c.strokeStyle=color; c.lineWidth=i%4===0?2.3:1;
    c.beginPath(); c.moveTo(ox+shift,oy);
    c.quadraticCurveTo(ox+shift*1.4,oy+h*.16,tx+spread,ty);
    c.stroke();
    for (let j=0; j<state.power; j++) {
      const t=((time*(.28+state.power*.07)+i*.065+j/state.power)%1);
      const px=(1-t)**2*(ox+shift)+2*(1-t)*t*(ox+shift*1.4)+t*t*(tx+spread);
      const py=(1-t)**2*oy+2*(1-t)*t*(oy+h*.16)+t*t*ty;
      c.fillStyle='#d3fff2'; c.beginPath(); c.arc(px,py,1.7,0,7); c.fill();
    }
  }
  c.strokeStyle='#d1fba6'; c.lineWidth=2; c.beginPath(); c.arc(tx,ty,12,0,Math.PI*2); c.stroke();
  path(c,[[tx-18,ty],[tx+18,ty]],'#c4f394'); path(c,[[tx,ty-18],[tx,ty+18]],'#c4f394');
}
function gestureArt(c) {
  background(c,840,420,'#282643','#111222');
  for(let r=40;r<=126;r+=22){
    c.strokeStyle='#c1a9ff83'; c.lineWidth=1.4; c.beginPath(); c.arc(296,210,r,0,Math.PI*2); c.stroke();
  }
  c.fillStyle='#d9c5ff'; c.font='74px sans-serif'; c.textAlign='center'; c.fillText('✳',296,236);
  c.textAlign='start';
  for(let i=0;i<39;i++){
    const a=6+Math.abs(Math.sin(i * 1.96)*Math.sin(i*.14))*38;
    path(c,[[490+i*6.1,222-a],[490+i*6.1,222+a]],'#bba8f5',2);
  }
}
function setupHandover() {
  const lab = detailBody.querySelector('.lab');
  const select = (key) => lab.querySelector(key);
  const start = select('[data-action="start"]');
  const take = select('[data-action="takeover"]');
  const label = select('[data-time]');
  const warning = select('[data-warning]');
  const result = select('[data-result]');
  const canvas = select('canvas');
  road(canvas.getContext('2d'), canvas.width, canvas.height, false);
  let stage = 'idle';
  let waitTimer, ticker, audio, shownAt, mode;

  const finish = (answered) => {
    const elapsed = (performance.now() - shownAt) / 1000;
    stage = 'done';
    clearInterval(ticker);
    take.disabled = true;
    start.disabled = false;
    warning.hidden = true;
    select('[data-system]').textContent = answered ? '手动驾驶 · 模拟' : '场景结束 · 模拟';
    label.textContent = answered ? '确认完成' : '未确认';
    const score = answered ? elapsed.toFixed(2) + ' s' : '未响应';
    select('[data-best="' + mode + '"]').textContent = score;
    result.textContent = answered ? '已确认接管，本轮响应 ' + score + '。可切换另一方案重试。' : '本轮结束。可以重新尝试，或切换另一种提示。';
  };
  function beep() {
    if (!audio || audio.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.frequency.value = 610;
    volume.gain.setValueAtTime(.055, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .25);
    oscillator.connect(volume).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .26);
  }
  start.addEventListener('click', () => {
    if (stage === 'waiting' || stage === 'cue') return;
    mode = select('input[name="cue"]:checked').value;
    if (mode === 'layered' && window.AudioContext) {
      audio ??= new AudioContext();
      audio.resume().catch(() => {});
    }
    stage = 'waiting';
    start.disabled = true;
    label.textContent = '领航中';
    select('[data-system]').textContent = '领航辅助 · 模拟';
    result.textContent = '场景已开始，留意前方提示。';
    waitTimer = setTimeout(() => {
      stage = 'cue';
      shownAt = performance.now();
      warning.hidden = false;
      select('[data-warning-cause]').textContent = mode === 'layered' ? '前方车道线缺失 · 请确认接管' : '';
      take.disabled = false;
      label.textContent = '5.0 s';
      result.textContent = '请接管车辆。';
      if (mode === 'layered') beep();
      ticker = setInterval(() => {
        const remaining = Math.max(0, 5 - (performance.now() - shownAt) / 1000);
        label.textContent = remaining.toFixed(1) + ' s';
        if (!remaining) finish(false);
      }, 50);
    }, 1400);
  });
  take.addEventListener('click', () => {
    if (stage === 'cue') finish(performance.now() - shownAt < 5000);
  });
  return () => {
    clearTimeout(waitTimer);
    clearInterval(ticker);
    if (audio) audio.close().catch(() => {});
  };
}

function setupClimate() {
  const lab = detailBody.querySelector('.lab');
  const canvas = lab.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const state = { x: 0, y: 0, power: 3 };
  const sliders = Array.from(lab.querySelectorAll('[data-axis]'));
  let dragging = null, frame = 0;
  const clamp = (value, max) => Math.min(max, Math.max(-max, Math.round(value)));
  function paint(time) { air(ctx, canvas.width, canvas.height, state, time); }
  function sync() {
    sliders.forEach((input) => {
      const axis = input.dataset.axis;
      input.value = state[axis];
      lab.querySelector('[data-value="' + axis + '"]').textContent = state[axis] + (axis === 'power' ? '' : '°');
    });
    if (reducedMotion.matches) paint(0);
  }
  function animate(timestamp) {
    paint(timestamp / 1000);
    frame = requestAnimationFrame(animate);
  }
  function motionChange() {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) paint(0);
    else frame = requestAnimationFrame(animate);
  }
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    state.x = clamp(((event.clientX - bounds.left) / bounds.width - .5) * 100, 35);
    state.y = clamp(((event.clientY - bounds.top) / bounds.height - .6) * 105, 28);
    sync();
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (dragging !== null || event.button !== 0) return;
    dragging = event.pointerId;
    canvas.setPointerCapture(dragging);
    point(event);
  });
  canvas.addEventListener('pointermove', (event) => { if (dragging === event.pointerId) point(event); });
  canvas.addEventListener('lostpointercapture', () => { dragging = null; });
  sliders.forEach((input) => input.addEventListener('input', () => {
    state[input.dataset.axis] = Number(input.value);
    sync();
  }));
  lab.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => {
    const preset = button.dataset.preset;
    state.x = 0;
    state.y = preset === 'face' ? -21 : preset === 'feet' ? 22 : 0;
    if (preset === 'reset') state.power = 3;
    sync();
  }));
  sync();
  motionChange();
  reducedMotion.addEventListener('change', motionChange);
  return () => {
    cancelAnimationFrame(frame);
    reducedMotion.removeEventListener('change', motionChange);
  };
}

function setupGesture() {
  const lab = detailBody.querySelector('.lab');
  const select = (key) => lab.querySelector(key);
  const board = select('.gesture-board');
  const title = select('[data-track]');
  const status = select('[data-status]');
  const actions = select('[data-gesture-actions]');
  const undo = select('[data-action="undo"]');
  const songs = ['01 / 夜间电台', '02 / 回程', '03 / 九号公路'];
  let track = 0, previous = null;
  function next() {
    previous = track;
    track = (track + 1) % songs.length;
    title.textContent = songs[track];
    undo.hidden = false;
    actions.hidden = true;
    status.textContent = '已换歌。可以撤销这次操作。';
  }
  select('[data-action="simulate"]').addEventListener('click', () => {
    const reading = select('input[name="gesture"]:checked').value;
    board.dataset.state = reading;
    actions.hidden = true;
    if (reading === 'certain') next();
    else if (reading === 'uncertain') {
      actions.hidden = false;
      undo.hidden = true;
      status.textContent = '可能识别到换歌手势，等待确认。';
    } else {
      undo.hidden = previous === null;
      status.textContent = '未识别到可执行的手势，歌曲保持不变。';
    }
  });
  select('[data-action="confirm"]').addEventListener('click', next);
  select('[data-action="cancel"]').addEventListener('click', () => {
    actions.hidden = true;
    undo.hidden = previous === null;
    status.textContent = '已取消，继续播放当前歌曲。';
  });
  undo.addEventListener('click', () => {
    if (previous === null) return;
    track = previous;
    previous = null;
    title.textContent = songs[track];
    undo.hidden = true;
    status.textContent = '已恢复上一首歌曲。';
  });
}
