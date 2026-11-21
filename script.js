/* ==========================================================
   ✏️  CUSTOMISE EVERYTHING HERE  — you only need to edit this block
   ========================================================== */
const CONFIG = {
  // 1. Recipient's name
  name: "Wiha🌺",

  // 2. Birthday message (each line becomes a paragraph, fades in one by one)
  message: [
    "Today is all about you, and I hope it feels as warm and special as you make everyone else feel.",
    "Thank you for the laughter, the quiet moments, and for simply being you.",
    "I wanted to make you something small, from the heart."
  ],
  signOff: "With love, Winstoon",

  // 3 & 4. Photos and captions (put your files in assets/images/)
  photos: [
    { src: "assets/images/gundi.jpeg", caption: "Where it all began" },
    { src: "assets/images/water.jpeg", caption: "Miss Water" },
    { src: "assets/images/holy.jpeg", caption: "Miss Holy Moly" },
    { src: "assets/images/traditional.jpeg", caption: "Miss Traditional" },
    { src: "assets/images/us.jpeg", caption: "Us, always" },
    { src: "assets/images/Signature.jpeg", caption: "Signature Pose" }
  ],

  // 5. Background music file (put it in assets/music/)
  music: "assets/music/singer.mp4",

  // 6. Final birthday message
  finalTitle: "Happy Birthday, Wiha 🌺",
  finalMessage: "May this year bring you gentle mornings, big dreams coming true, and people who love you exactly as you are."
};
/* ========================  END OF CUSTOMISING  ======================== */

const $ = s => document.querySelector(s);
const bgm = $("#bgm"), musicBtn = $("#musicBtn");
let playing = false, timers = [], floatTimer;

// tiny pink placeholder shown if a photo file is missing
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='#f4dcd8'/><text x='200' y='215' font-size='64' text-anchor='middle' fill='#b9707a'>♡</text></svg>");

/* ---------- screens ---------- */
function show(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  if (id === "letterScreen") revealLetter();
  if (id === "finalScreen") celebrate();
}
document.querySelectorAll("[data-next]").forEach(b => b.addEventListener("click", () => show(b.dataset.next)));

/* ---------- floating background ---------- */
function spawn(symbol, fast){
  const el = document.createElement("span");
  el.className = "float";
  el.textContent = symbol || ["♡","✦","✧","·"][Math.floor(Math.random()*4)];
  el.style.left = Math.random()*100 + "%";
  el.style.fontSize = (10 + Math.random()*16) + "px";
  const dur = (fast ? 5 : 9) + Math.random()*7;
  el.style.animationDuration = dur + "s";
  $("#floaters").appendChild(el);
  setTimeout(() => el.remove(), dur*1000);
}
function startFloaters(fast){ clearInterval(floatTimer); floatTimer = setInterval(() => spawn(fast ? "♡" : null, fast), fast ? 280 : 900); }

/* ---------- music ---------- */
function setMusicUI(){ musicBtn.classList.toggle("paused", !playing); musicBtn.setAttribute("aria-label", playing ? "Pause music" : "Play music"); }
function playMusic(){ bgm.play().then(() => { playing = true; setMusicUI(); }).catch(() => { playing = false; setMusicUI(); }); }
musicBtn.addEventListener("click", () => { if (playing){ bgm.pause(); playing = false; setMusicUI(); } else playMusic(); });

/* ---------- envelope ---------- */
function openEnvelope(){
  const env = $("#envelope");
  if (env.classList.contains("open")) return;
  bgm.src = CONFIG.music;         // music starts only after this click
  playMusic();
  musicBtn.hidden = false;
  env.classList.add("open");
  $("#openBtn").style.visibility = "hidden";
  timers.push(setTimeout(() => show("letterScreen"), 2300));
}
$("#envelope").addEventListener("click", openEnvelope);
$("#openBtn").addEventListener("click", openEnvelope);

/* ---------- letter ---------- */
function revealLetter(){
  const box = $("#message");
  box.innerHTML = "";
  CONFIG.message.forEach(t => { const p = document.createElement("p"); p.textContent = t; box.appendChild(p); });
  const sign = $("#signoff"); sign.textContent = CONFIG.signOff; sign.classList.remove("show");
  const items = [...box.children, sign];
  items.forEach((el, i) => timers.push(setTimeout(() => el.classList.add("show"), 600 + i*1400)));
}

/* ---------- gallery ---------- */
let current = 0;
function buildGallery(){
  const wrap = $("#scrapbook");
  wrap.innerHTML = "";
  CONFIG.photos.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "polaroid";
    b.style.setProperty("--r", ((i % 2 ? 1 : -1) * (1 + (i*1.3) % 3)) + "deg");
    b.style.setProperty("--d", (i*0.15) + "s");
    b.innerHTML = `<img src="${p.src}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span>${p.video ? '<i class="play">▶</i>' : ''}`;
    b.querySelector("img").onerror = e => { e.target.onerror = null; e.target.src = PLACEHOLDER; };
    b.addEventListener("click", () => openLightbox(i));
    wrap.appendChild(b);
  });
}
const lb = $("#lightbox"), lbVid = $("#lbVid");
let musicWasOn = false;
function closeLightbox(){ lbVid.pause(); lb.hidden = true; }
function openLightbox(i){
  current = (i + CONFIG.photos.length) % CONFIG.photos.length;
  const p = CONFIG.photos[current], img = $("#lbImg");
  lbVid.pause();
  if (p.video){
    img.hidden = true; lbVid.hidden = false;
    lbVid.poster = p.src; lbVid.src = p.video;
  } else {
    lbVid.hidden = true; img.hidden = false;
    img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
    img.src = p.src; img.alt = p.caption;
  }
  $("#lbCap").textContent = p.caption;
  lb.hidden = false;
}
lbVid.addEventListener("play", () => { musicWasOn = playing; if (playing){ bgm.pause(); playing = false; setMusicUI(); } });
lbVid.addEventListener("pause", () => { if (musicWasOn){ playMusic(); musicWasOn = false; } });
$(".lb-close").addEventListener("click", closeLightbox);
$(".prev").addEventListener("click", () => openLightbox(current - 1));
$(".next").addEventListener("click", () => openLightbox(current + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") openLightbox(current - 1);
  if (e.key === "ArrowRight") openLightbox(current + 1);
});

/* ---------- final ---------- */
function celebrate(){
  $("#finalTitle").textContent = CONFIG.finalTitle;
  $("#finalText").textContent = CONFIG.finalMessage;
  startFloaters(true);
  for (let i = 0; i < 18; i++) setTimeout(() => spawn("♡", true), i*120);
}
$("#replayBtn").addEventListener("click", () => {
  timers.forEach(clearTimeout); timers = [];
  $("#envelope").classList.remove("open");
  $("#openBtn").style.visibility = "visible";
  startFloaters(false);
  show("envelopeScreen");
});

/* ---------- start ---------- */
$("#dearLine").textContent = "A letter for you";
$("#greeting").textContent = "Happy Birthday, " + CONFIG.name;
buildGallery();
startFloaters(false);
