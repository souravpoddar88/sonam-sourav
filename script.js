const progressBar = document.getElementById("progressBar");
const revealItems = document.querySelectorAll(".reveal");
const celebration = document.getElementById("celebration");
const yesButtons = document.querySelectorAll("[data-yes]");
const replay = document.getElementById("replay");
const soundToggle = document.getElementById("soundToggle");

window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}, {passive:true});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});

revealItems.forEach(el => observer.observe(el));

yesButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    celebration.classList.add("show");
    celebration.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.scrollTo({top: celebration.offsetTop, behavior:"smooth"});
    createHearts();
  });
});

function createHearts() {
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
  celebration.appendChild(layer);
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span");
    s.textContent = Math.random() > .45 ? "♡" : "✦";
    s.style.position = "absolute";
    s.style.left = `${Math.random()*100}%`;
    s.style.top = `${70 + Math.random()*30}%`;
    s.style.fontSize = `${12 + Math.random()*18}px`;
    s.style.color = "rgba(242,180,169,.8)";
    s.style.animation = `floatUp ${3 + Math.random()*3}s ease-out forwards`;
    layer.appendChild(s);
  }
  if (!document.getElementById("floatStyle")) {
    const style = document.createElement("style");
    style.id = "floatStyle";
    style.textContent = "@keyframes floatUp{to{transform:translateY(-90vh) rotate(25deg);opacity:0}}";
    document.head.appendChild(style);
  }
}

replay.addEventListener("click", () => {
  celebration.classList.remove("show");
  celebration.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.scrollTo({top:0, behavior:"smooth"});
});


// Smooth anchor behavior for the opening button.
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth"});
    }
  });
});

// Interactive memory cards
const memoryData = {
  sunset: {
    eyebrow: "our first sunset",
    title: "I remember this one.",
    text: "Not because it was the most beautiful sunset I'd ever seen. Because I wasn't watching it alone. Some evenings become memories simply because of who was there."
  },
  star: {
    eyebrow: "our silly little promise",
    title: "The star one.",
    text: "I made that ridiculous little thing for fun, but I kept telling you I'd buy you a proper one someday and make you wear it when you're my wife. Somehow the joke became one of my favourite little promises."
  },
  love: {
    eyebrow: "the honest one",
    title: "If you ever wonder what I want…",
    text: "I want you. Not one perfect version of you. You on the good days, the bad days, the stubborn days, the silly days, and every version in between."
  }
};
const memoryModal = document.getElementById("memoryModal");
const modalClose = document.getElementById("modalClose");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

document.querySelectorAll("[data-memory]").forEach(card => {
  card.addEventListener("click", () => {
    const data = memoryData[card.dataset.memory];
    modalEyebrow.textContent = data.eyebrow;
    modalTitle.textContent = data.title;
    modalText.textContent = data.text;
    memoryModal.classList.add("open");
    memoryModal.setAttribute("aria-hidden","false");
  });
});
modalClose.addEventListener("click", () => {
  memoryModal.classList.remove("open");
  memoryModal.setAttribute("aria-hidden","true");
});
memoryModal.addEventListener("click", e => {
  if (e.target === memoryModal) modalClose.click();
});

// Interactive note buttons
const noteData = {
  want: "If you asked what I want: honestly, you. Not a perfect story, not a perfect person — just something real with you, for as long as you'll let me.",
  flaws: "If you asked what I love: every version of you. The smile, the stubbornness, the overthinking, the silly side, even the flaws you wish you could hide. I'd rather know them and love them than ask you to change them.",
  promise: "If you asked what I promise: I'll try to understand before I react, listen when you're hurt, and never make hurting you feel normal. And if I ever mess up by mistake, slap me, sit me down and explain it to me properly, my Aloo."
};
const noteDisplay = document.getElementById("noteDisplay");
document.querySelectorAll("[data-note]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-note]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    noteDisplay.innerHTML = `<p>${noteData[btn.dataset.note]}</p>`;
  });
});

// ===== Background music =====
// Browsers block sound until the visitor taps. The "Tap to open" gate is that tap,
// so the song starts reliably, and the floating button can pause/resume it.
const bgMusic = document.getElementById("bgMusic");
const gate = document.getElementById("gate");
const gateBtn = document.getElementById("gateBtn");
const soundBtn = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
const soundText = document.getElementById("soundText");
let musicOn = false;

function setMusicUI(on){
  musicOn = on;
  soundBtn.classList.toggle("playing", on);
  soundIcon.textContent = on ? "♫" : "♪";
  soundText.textContent = on ? "music on" : "music off";
}
async function playMusic(){
  if(!bgMusic) return false;
  try{
    bgMusic.volume = 0;
    await bgMusic.play();
    setMusicUI(true);
    let v = 0;                       // gentle fade in
    const f = setInterval(()=>{ v = Math.min(.6, v+.03); bgMusic.volume = v; if(v>=.6) clearInterval(f); }, 120);
    return true;
  }catch(err){
    console.warn("Music could not play. Is the .mp3 inside the assets folder with the right name?", err);
    setMusicUI(false);
    return false;
  }
}
function pauseMusic(){ bgMusic.pause(); setMusicUI(false); }

function openGate(){
  gate.classList.add("hide");
  document.body.style.overflow = "";
  startFloaters();
}

// 1) Try to play the moment the page opens.
//    If the browser allows it, the gate disappears by itself.
(async function autoStart(){
  if(!bgMusic) return;
  bgMusic.load();
  const ok = await playMusic();
  if(ok) openGate();
})();

// 2) Phones/browsers that block autoplay: the very first tap, click or key press
//    anywhere starts the song (this is the earliest moment browsers permit sound).
let started = false;
function firstGesture(){
  if(started) return;
  started = true;
  ["pointerdown","touchend","click","keydown"].forEach(ev => window.removeEventListener(ev, firstGesture, true));
  if(!musicOn) playMusic();
  openGate();
}
["pointerdown","touchend","click","keydown"].forEach(ev => window.addEventListener(ev, firstGesture, {capture:true, passive:true}));

gateBtn.addEventListener("click", () => { if(!musicOn) playMusic(); openGate(); });
soundBtn.addEventListener("click", e => { e.stopPropagation(); musicOn ? pauseMusic() : playMusic(); });
setMusicUI(false);
document.body.style.overflow = "hidden"; // hold scrolling until the gate is opened
gate.addEventListener("transitionend", () => { if(gate.classList.contains("hide")) gate.style.display="none"; });

// Pause the song while a memory video plays, resume after
let resumeAfterVideo = false;
document.querySelectorAll("video").forEach(v => {
  v.addEventListener("play", () => { if(musicOn){ resumeAfterVideo = true; pauseMusic(); } });
  const back = () => { if(resumeAfterVideo){ resumeAfterVideo = false; playMusic(); } };
  v.addEventListener("pause", back); v.addEventListener("ended", back);
});

// Keep sound in sync when the tab/app goes to background and returns
document.addEventListener("visibilitychange", () => {
  if(document.hidden){ if(musicOn) bgMusic.pause(); }
  else if(musicOn){ bgMusic.play().catch(()=>{}); }
});

// ===== Floating hearts & petals =====
const floaters = document.getElementById("floaters");
const shapes = ["♥","♡","❀","✿","✦"];
const tints = ["#ff8fab","#ffb3c1","#ffd1dc","#f7a8b8","#ffe0c2"];
let floaterTimer = null;
function spawnFloater(){
  if(document.hidden) return;
  const el = document.createElement("span");
  el.textContent = shapes[Math.floor(Math.random()*shapes.length)];
  el.style.left = Math.random()*100 + "%";
  el.style.fontSize = (10 + Math.random()*20) + "px";
  el.style.color = tints[Math.floor(Math.random()*tints.length)];
  el.style.setProperty("--dx", (Math.random()*160-80) + "px");
  el.style.setProperty("--rot", (Math.random()*360-180) + "deg");
  const d = 9 + Math.random()*9;
  el.style.animationDuration = d + "s";
  floaters.appendChild(el);
  setTimeout(()=>el.remove(), d*1000);
}
function startFloaters(){
  if(floaterTimer || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for(let i=0;i<8;i++) setTimeout(spawnFloater, i*250);
  floaterTimer = setInterval(spawnFloater, 900);
}
// the gate itself also gets a few hearts
for(let i=0;i<6;i++) setTimeout(spawnFloater, i*400);
setInterval(()=>{ if(!gate.classList.contains("hide")) spawnFloater(); }, 800);

// ===== Sparkle trail (mouse / finger) =====
let lastTrail = 0;
function trail(x,y){
  const now = Date.now();
  if(now - lastTrail < 70) return;
  lastTrail = now;
  const t = document.createElement("span");
  t.className = "trail";
  t.textContent = Math.random()>.5 ? "♥" : "✦";
  t.style.left = x + "px"; t.style.top = y + "px";
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 1000);
}
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  window.addEventListener("pointermove", e => trail(e.clientX, e.clientY), {passive:true});
  window.addEventListener("pointerdown", e => { for(let i=0;i<5;i++) setTimeout(()=>trail(e.clientX+(Math.random()*40-20), e.clientY+(Math.random()*40-20)), i*40); lastTrail=0; }, {passive:true});
}

// Bigger heart burst when she says YES
yesButtons.forEach(btn => btn.addEventListener("click", () => {
  for(let i=0;i<40;i++) setTimeout(spawnFloater, i*60);
}));
