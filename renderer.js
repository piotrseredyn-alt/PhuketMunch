
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
// v1.0.16 sizing (+50%)
const SIZE={ coco:30, mango:48, durian:54, rbW:42, rbH:54, ghost:48, player:54, palmW:108, palmH:144 };
const RAD ={ coco:15, mango:24, durian:27, redbull:27, ghost:24, player:27 };
// UI
const hudScore=document.getElementById('score'),hudLives=document.getElementById('lives'),hudLevel=document.getElementById('level'),hudDiamonds=document.getElementById('diamonds'),hudMode=document.getElementById('mode');
const welcome=document.getElementById('welcome'),howto=document.getElementById('howto'),vehicle=document.getElementById('vehicle');
const welcomeStart=document.getElementById('welcomeStart'),howtoNext=document.getElementById('howtoNext'),startBtn=document.getElementById('startBtn');
const shop=document.getElementById('shop'),leaderboard=document.getElementById('leaderboard'),gameOver=document.getElementById('gameOver');
document.getElementById('btnShop').onclick=()=>{shop.classList.add('show');shop.classList.remove('hidden');};
document.getElementById('closeShop')?.addEventListener('click',()=>{shop.classList.add('hidden');shop.classList.remove('show');});
document.getElementById('btnLeaderboard').onclick=()=>{Board.renderLeaderboard();leaderboard.classList.add('show');leaderboard.classList.remove('hidden');};
document.getElementById('closeLeaderboard')?.addEventListener('click',()=>{leaderboard.classList.add('hidden');leaderboard.classList.remove('show');});
// Music & SFX
const musicIntro=document.getElementById('audio-intro'),tracks=[document.getElementById('audio-level1'),document.getElementById('audio-level2'),document.getElementById('audio-level3')];
const sEat=document.getElementById('sfx-eat'),sPow=document.getElementById('sfx-powerup'),sHit=document.getElementById('sfx-hit'),sDur=document.getElementById('sfx-durian'),sF=document.getElementById('sfx-fright'),sM=document.getElementById('sfx-mango');
[musicIntro,...tracks].forEach(a=>{if(a)a.volume=1.0;});[sEat,sPow,sHit,sDur,sF,sM].forEach(a=>{if(a)a.volume=0.5;}); if(sF) sF.volume = 0.25;
function stopAllMusic(){[musicIntro,...tracks].forEach(a=>{a.pause();a.currentTime=0;});}
function playLevelMusic(l){stopAllMusic();const i=Math.min(l-1,tracks.length-1);const tr=tracks[i];tr.currentTime=0;tr.play().catch(()=>{});}
// Play intro at load & retry on first interaction
window.addEventListener('load',()=>{musicIntro.play().catch(()=>{});});
window.addEventListener('click',()=>{ if(musicIntro.paused){ musicIntro.play().catch(()=>{});} }, { once:true });
document.getElementById('btnMute').onclick=()=>{const all=[musicIntro,...tracks,sEat,sPow,sHit,sDur,sF,sM].filter(Boolean);const m=!musicIntro.muted;all.forEach(a=>a.muted=m);document.getElementById('btnMute').textContent=m?'🔇':'🔊';};
// Vehicle UI
const optBoat=document.getElementById('opt-boat'),optTuk=document.getElementById('opt-tuktuk');
function updateDim(){const b=optBoat.querySelector('input').checked;optBoat.classList.toggle('dim',!b);optTuk.classList.toggle('dim',!!b);} 
optBoat.addEventListener('click',()=>{optBoat.querySelector('input').checked=true;updateDim();

// v1.0.20 MIN — click vehicle to start (with fade-out)
if (typeof updateDim==='function') updateDim();
const vehicleOverlay = document.getElementById('vehicle');
function startWith(kind){
  try{ setVehicle(kind); }catch(e){}
  if (vehicleOverlay){ vehicleOverlay.classList.add('fade-leave'); setTimeout(()=>{ hide(vehicleOverlay); }, 550); }
  beginGame();
}
const boatCard=document.getElementById('opt-boat');
const tukCard =document.getElementById('opt-tuktuk');
if (boatCard){ boatCard.style.cursor='pointer'; boatCard.onclick=()=>startWith('boat'); }
if (tukCard){  tukCard.style.cursor='pointer';  tukCard.onclick =()=>startWith('tuktuk'); }
}); optTuk.addEventListener('click',()=>{optTuk.querySelector('input').checked=true;updateDim();

// v1.0.20 MIN — click vehicle to start (with fade-out)
if (typeof updateDim==='function') updateDim();
const vehicleOverlay = document.getElementById('vehicle');
function startWith(kind){
  try{ setVehicle(kind); }catch(e){}
  if (vehicleOverlay){ vehicleOverlay.classList.add('fade-leave'); setTimeout(()=>{ hide(vehicleOverlay); }, 550); }
  beginGame();
}
const boatCard=document.getElementById('opt-boat');
const tukCard =document.getElementById('opt-tuktuk');
if (boatCard){ boatCard.style.cursor='pointer'; boatCard.onclick=()=>startWith('boat'); }
if (tukCard){  tukCard.style.cursor='pointer';  tukCard.onclick =()=>startWith('tuktuk'); }
}); updateDim();

// v1.0.20 MIN — click vehicle to start (with fade-out)
if (typeof updateDim==='function') updateDim();
const vehicleOverlay = document.getElementById('vehicle');
function startWith(kind){
  try{ setVehicle(kind); }catch(e){}
  if (vehicleOverlay){ vehicleOverlay.classList.add('fade-leave'); setTimeout(()=>{ hide(vehicleOverlay); }, 550); }
  beginGame();
}
const boatCard=document.getElementById('opt-boat');
const tukCard =document.getElementById('opt-tuktuk');
if (boatCard){ boatCard.style.cursor='pointer'; boatCard.onclick=()=>startWith('boat'); }
if (tukCard){  tukCard.style.cursor='pointer';  tukCard.onclick =()=>startWith('tuktuk'); }

// Game state
let playing=false,score=0,lives=3,level=1; window.playerImg=document.getElementById('img-boat');
const player={x:W/2,y:H*0.7,vx:0,vy:0,base:3.0,spd:3.0,r:16};
let pellets=[],mangoes=[],durians=[],redbulls=[],ghosts=[];
let frightened=false,ft=0,turbo=false,tt=0,aggroTime=0;
let faceDir = -1; // -1 = left, 1 = right

const imgBG=document.getElementById('img-bg'),imgBoat=document.getElementById('img-boat'),imgTuk=document.getElementById('img-tuktuk'),imgGhost=document.getElementById('img-ghost'),imgCoco=document.getElementById('img-coconut'),imgPalm=document.getElementById('img-palm'),imgMango=document.getElementById('img-mango'),imgDur=document.getElementById('img-durian'),imgRB=document.getElementById('img-redbull');
// Controls
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') {
    player.vx = -player.spd;
    faceDir = -1;
  } else if (k === 'arrowright' || k === 'd') {
    player.vx = player.spd;
    faceDir = 1;
  } else if (k === 'arrowup' || k === 'w') {
    player.vy = -player.spd;
  } else if (k === 'arrowdown' || k === 's') {
    player.vy = player.spd;
  }
});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(['arrowleft','a','arrowright','d'].includes(k))player.vx=0;if(['arrowup','w','arrowdown','s'].includes(k))player.vy=0});
// Overlay helpers
function show(el){ el.style.display='flex'; el.classList.add('show'); el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); el.classList.remove('show'); el.style.display='none'; }
// Flow: Welcome -> HowTo -> Vehicle -> Gameplay
welcomeStart.onclick=()=>{ welcome.classList.add('fade-leave'); setTimeout(()=>{ hide(welcome); show(vehicle); vehicle.classList.add('fade-enter'); setTimeout(()=>vehicle.classList.remove('fade-enter'),1000); }, 550); };
howtoNext.onclick=()=>{
  hide(howto);
  show(vehicle);
  vehicle.classList.add('fade-enter');
  setTimeout(()=>vehicle.classList.remove('fade-enter'), 1000);
};
function setVehicle(kind){ window.playerImg = (kind==='tuktuk' && imgTuk)? imgTuk : imgBoat; }

// Gameplay bootstrap
function beginGame(){ playing=true; score=0; lives=3; level=1; player.base=3.0; player.spd=player.base; frightened=false; turbo=false; ft=tt=aggroTime=0; updateHUD(); resetLevel(); stopAllMusic(); playLevelMusic(level); last=performance.now(); requestAnimationFrame(loop); }
let last=0; function loop(now){ if(!playing)return; const dt=Math.min(0.033,(now-last)/1000); last=now; update(dt); render(); requestAnimationFrame(loop); }
// Spawns
let spawnDelay=5+Math.random()*2;
function spawnSpecials(dt){ if(spawnDelay>0){ spawnDelay-=dt; return; } if(Math.random()<0.0015)mangoes.push({x:60+Math.random()*(W-120),y:160+Math.random()*(H-260),r:RAD.mango}); if(Math.random()<0.0010)redbulls.push({x:60+Math.random()*(W-120),y:160+Math.random()*(H-260),r:RAD.redbull}); if(Math.random()<0.0008)durians.push({x:60+Math.random()*(W-120),y:160+Math.random()*(H-260),r:RAD.durian}); }
function update(dt){
  player.x+=player.vx*(turbo?1.5:1); player.y+=player.vy*(turbo?1.5:1);
  player.x=Math.max(RAD.player,Math.min(W-RAD.player,player.x)); player.y=Math.max(RAD.player,Math.min(H-RAD.player,player.y));
  
ghosts.forEach(g=>{
  // Desired direction toward (or away if frightened) the player
  const targetDir = steerTowards(g.x, g.y, player.x, player.y, frightened?0.15:0.35);
  const desired = frightened ? targetDir + Math.PI : targetDir;

  // Blend current heading toward desired
  g.dir += (desired - g.dir) * 0.08;

  // Speed factor
  const sp = g.base * (frightened?0.6:(aggroTime>0?1.5:1));
  const nx = g.x + Math.cos(g.dir) * sp;
  const ny = g.y + Math.sin(g.dir) * sp;

  // Avoid stepping into another ghost's personal space
  let blocked = false;
  for(const other of ghosts){
    if(other===g) continue;
    const dx = (nx - other.x), dy = (ny - other.y);
    if(dx*dx+dy*dy < 28*28){ blocked = true; break; }
  }
  if(blocked){
    // try slight left/right detour
    const tryAngles = [g.dir + 0.6, g.dir - 0.6, g.dir + 1.2, g.dir - 1.2];
    let moved=false;
    for(const a of tryAngles){
      const tx = g.x + Math.cos(a)*sp, ty = g.y + Math.sin(a)*sp;
      let ok=true;
      for(const other of ghosts){
        if(other===g) continue;
        const ddx=tx-other.x, ddy=ty-other.y;
        if(ddx*ddx+ddy*ddy < 28*28){ ok=false; break; }
      }
      if(ok){ g.dir = a; g.x=tx; g.y=ty; moved=true; break; }
    }
    if(!moved){ g.x=nx; g.y=ny; }
  } else {
    g.x=nx; g.y=ny;
  }

  // Keep inside bounds
  avoidWallsAndBounds(g);
});

  
// Separation to avoid overlapping
for(let i=0;i<ghosts.length;i++){
  for(let j=i+1;j<ghosts.length;j++){
    const gi=ghosts[i], gj=ghosts[j];
    const dx=gj.x-gi.x, dy=gj.y-gi.y;
    const d2=dx*dx+dy*dy, minD=30;
    if(d2>0 && d2<minD*minD){
      const d=Math.sqrt(d2)||0.001, ux=dx/d, uy=dy/d, push=(minD-d)*0.5;
      gi.x -= ux*push; gi.y -= uy*push;
      gj.x += ux*push; gj.y += uy*push;
    }
  }
}

for(const p of pellets){ if(!p.eaten){ const dx=player.x-p.x,dy=player.y-p.y; if(dx*dx+dy*dy < (player.r + RAD.coco)*(player.r + RAD.coco)){ p.eaten=true; score+=10; try{sEat.currentTime=0;sEat.play();}catch(e){} if(Math.random()<0.1) IAP.addDiamonds(1); } } }
  for(const m of mangoes){ const dx=player.x-m.x,dy=player.y-m.y; if(dx*dx+dy*dy < (m.r + player.r)*(m.r + player.r)){ score+=200; try{sM.currentTime=0;sM.play();}catch(e){} m.x=-999; } } mangoes=mangoes.filter(m=>m.x>0);
  for(const d of durians){ const dx=player.x-d.x,dy=player.y-d.y; if(dx*dx+dy*dy<(d.r+player.r)**2){ frightened=true; ft=5; aggroTime=0; try{sDur.currentTime=0;sDur.play();sF.play();}catch(e){} d.x=-999; } } durians=durians.filter(d=>d.x>0);
  for(const b of redbulls){ const dx=player.x-b.x,dy=player.y-b.y; if(dx*dx+dy*dy<(b.r+player.r)**2){ turbo=true; tt=6; try{sPow.currentTime=0;sPow.play();}catch(e){} b.x=-999; } } redbulls=redbulls.filter(b=>b.x>0);
  for(const g of ghosts){ const dx=player.x-g.x,dy=player.y-g.y; if(dx*dx+dy*dy < (player.r + RAD.coco)*(player.r + RAD.coco)){ if(frightened){ score+=100; g.x=Math.random()*W; g.y=160+Math.random()*100; } else if(!turbo){ lives--; try{sHit.currentTime=0;sHit.play();}catch(e){} if(lives<=0){ playing=false; stopAllMusic(); document.getElementById('finalScore').textContent=score; IAP.setBest(score); gameOver.classList.remove('hidden'); gameOver.classList.add('show'); return; } else { player.x=W/2; player.y=H*0.7; player.vx=player.vy=0; } } } }
  if(frightened){
    ft-=dt;
    if(ft<=0){
      frightened=false;
      aggroTime=5;
    }
  } else if(aggroTime>0){
    aggroTime-=dt;
    if(aggroTime<=0) aggroTime=0;
  }
  if(turbo){ tt-=dt; if(tt<=0) turbo=false; }
  if(pellets.every(p=>p.eaten)){ level++; player.base+=0.18; player.spd=player.base; ghosts.forEach(g=> g.base+=0.22); resetLevel(); playLevelMusic(level); }
  spawnSpecials(dt); updateHUD();
}

// v1.0.22 MIN — AI helpers
function steerTowards(gx, gy, tx, ty, noise=0.3){
  let a = Math.atan2(ty-gy, tx-gx);
  a += (Math.random()-0.5)*noise; // slight randomness to feel alive
  return a;
}
function avoidWallsAndBounds(g){
  if(g.x<16||g.x>W-16) g.dir=Math.PI-g.dir;
  if(g.y<16||g.y>H-16) g.dir=-g.dir;
}

function render(){
  ctx.fillStyle='#062a2e'; ctx.fillRect(0,0,W,H); ctx.drawImage(imgBG,0,0,W,H);
  for(let x=40;x<W;x+=160) ctx.drawImage(imgPalm,x-SIZE.palmW/3,18,SIZE.palmW,SIZE.palmH);
  
// Separation to avoid overlapping
for(let i=0;i<ghosts.length;i++){
  for(let j=i+1;j<ghosts.length;j++){
    const gi=ghosts[i], gj=ghosts[j];
    const dx=gj.x-gi.x, dy=gj.y-gi.y;
    const d2=dx*dx+dy*dy, minD=30;
    if(d2>0 && d2<minD*minD){
      const d=Math.sqrt(d2)||0.001, ux=dx/d, uy=dy/d, push=(minD-d)*0.5;
      gi.x -= ux*push; gi.y -= uy*push;
      gj.x += ux*push; gj.y += uy*push;
    }
  }
}

for(const p of pellets){ if(!p.eaten) ctx.drawImage(imgCoco,p.x-SIZE.coco/2,p.y-SIZE.coco/2,SIZE.coco,SIZE.coco); }
  mangoes.forEach(o=> ctx.drawImage(imgMango,o.x-SIZE.mango/2,o.y-SIZE.mango/2,SIZE.mango,SIZE.mango));
  durians.forEach(o=> ctx.drawImage(imgDur,o.x-SIZE.durian/2,o.y-SIZE.durian/2,SIZE.durian,SIZE.durian));
  redbulls.forEach(o=> ctx.drawImage(imgRB,o.x-SIZE.rbW/2,o.y-SIZE.rbH/2,SIZE.rbW,SIZE.rbH));
  ctx.save();
  ctx.translate(player.x, player.y);
  if (faceDir > 0) {
    ctx.scale(-1, 1);
  }
  ctx.globalAlpha = turbo ? 0.88 : 1;
  ctx.drawImage(window.playerImg, -SIZE.player/2, -SIZE.player/2, SIZE.player, SIZE.player);
  ctx.restore();
  ctx.globalAlpha=frightened?0.7:1; ghosts.forEach(g=> ctx.drawImage(imgGhost,g.x-SIZE.ghost/2,g.y-SIZE.ghost/2,SIZE.ghost,SIZE.ghost)); ctx.globalAlpha=1;
}
function updateHUD(){ hudScore.textContent=score; hudLives.textContent=lives; hudLevel.textContent=level; hudDiamonds.textContent=IAP.getDiamonds(); hudMode.textContent = frightened?'frightened':(turbo?'turbo':'normal'); }
function makeGhost(x,y,s){ return { x,y,dir:Math.random()*Math.PI*2, base:s }; }
function resetLevel(){
  pellets=[]; const targetPellets = 6 + Math.max(0,(level-1))*4; const rows=6+level, cols=7+level;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) pellets.push({ x:60+c*((W-120)/(cols-1)), y:160+r*((H-260)/(rows-1)), eaten:false });
  ghosts=[]; const gcount=Math.min(2+level,10);
  for(let i=0;i<gcount;i++) ghosts.push(makeGhost(Math.random()*W,160+Math.random()*100,1.2+0.25*level));
  mangoes=[]; durians=[]; redbulls=[]; player.x=W/2; player.y=H*0.72; player.vx=player.vy=0; player.spd=player.base;
  spawnDelay = 5 + Math.random()*2;
}

// v1.0.19 minimal: instructions -> vehicle
if (instructionsNext) instructionsNext.onclick=()=>{ instructions.classList.add('fade-leave'); setTimeout(()=>{ hide(instructions); show(vehicle); vehicle.classList.add('fade-enter'); setTimeout(()=>vehicle.classList.remove('fade-enter'),1000); }, 550); };
