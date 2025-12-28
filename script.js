console.log("DOM Ready");

// ---------- GLOBAL ----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

let latestPose = null;
let currentStream = null;
let useBackCamera = true;

// ---------- DOM ----------
const video = document.getElementById("video");
const points = document.getElementById("points");
const heightBox = document.getElementById("heightBox");

const canvasArea = document.getElementById("canvasArea");

const screen0 = document.getElementById("screen0");
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");

const angulSlider = document.getElementById("angulSlider");
const angulValue  = document.getElementById("angulValue");
const angulBox    = document.getElementById("angulBox");

const heightSlider = document.getElementById("heightSlider");
const angulTotal   = document.getElementById("angulTotal");

const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");


// ---------------- CAMERA ----------------
async function startCamera() {
  try {

    if (currentStream)
      currentStream.getTracks().forEach(t => t.stop());

    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useBackCamera ? "environment" : "user" },
      audio: false
    });

    video.srcObject = currentStream;
    await video.play().catch(()=>{});   // ignore AbortError safely

    if (status2) status2.innerText = "Camera Active ✔";
    if (statusText) statusText.innerText = "Camera Active ✔";

  } catch (err) {
    console.warn("Camera error", err);

    if (status2) status2.innerText = "Camera failed ❌";
    if (statusText) statusText.innerText = "Camera failed ❌";

    if (useBackCamera) {
      useBackCamera = false;
      startCamera();
    }
  }
}

function switchCamera() {
  useBackCamera = !useBackCamera;
  startCamera();
}


// ---------------- ANGUL ----------------
function updateAngul() {
  angulPx = +angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}


// ---------------- HEIGHT ----------------
function updateHeight() {
  heightPx = +heightSlider.value;

  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;

  heightBox.style.height = (heightPx / 4) + "px";
}


// ---------------- NAVIGATION ----------------
function goToFinger() {
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");
}

function goToHeight() {
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");

  canvasArea.classList.remove("hidden");

  heightBox.classList.remove("hidden");
  points.classList.add("hidden");

  startCamera();
}
function goToAR() {

  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");

  canvasArea.classList.remove("hidden");

  heightBox.classList.add("hidden");
  points.classList.add("hidden");   // hide until analyze

  startCamera();                    // only camera starts
}

// ---------------- MEDIAPIPE POSE ----------------
const pose = new Pose({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults((results) => {
  latestPose = results.poseLandmarks;

  if (!latestPose) return;

  drawDynamicMarmaPoints();
});


// ------------- START LIVE TRACKING AFTER ANALYZE -------------
function startPoseTracking(){

  async function loop() {
    if (video.readyState >= 2) {
      await pose.send({ image: video });
    }
    requestAnimationFrame(loop);
  }

  loop();
}


// ------------- ANALYZE BUTTON HANDLER -------------
function analyze(){
  points.classList.remove("hidden");  // show
  startPoseTracking();                // begin landmark loop
}

window.analyze = analyze;

// ------------- DRAW MARMA POINTS -------------
function drawDynamicMarmaPoints() {

  points.innerHTML = "";
  if (!latestPose) return;

  const rect = video.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  const mp = (id) => latestPose[id];

  const marmaMap = [
    { id: 10, name: "Sira Matrika", txt: "Head marma" },
    { id: 12, name: "Hridaya", txt: "Heart marma" },
    { id: 24, name: "Nabhi", txt: "Navel marma" },
    { id: 25, name: "Janu", txt: "Left knee" },
    { id: 26, name: "Janu", txt: "Right knee" },
    { id: 27, name: "Gulpha", txt: "Left ankle" },
    { id: 28, name: "Gulpha", txt: "Right ankle" }
  ];

  marmaMap.forEach(m => {

    const lm = mp(m.id);
    if (!lm) return;

    const x = lm.x * vw;
    const y = lm.y * vh;

    if (!isFinite(x) || !isFinite(y)) return;

    const dot = document.createElement("div");
    dot.className = "marma-point";

    dot.style.left = x + "px";
    dot.style.top  = y + "px";

    dot.addEventListener("pointerdown",
      () => openPopup(m.name, m.txt)
    );

    points.appendChild(dot);
  });
}


// ------------- POPUP -------------
function openPopup(a, b) {
  popup.classList.remove("hidden");
  pTitle.innerText = a;
  pText.innerText = b;
}

function closePopup() {
  popup.classList.add("hidden");
}


// ------------- EXPORT -------------
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;

window.switchCamera = switchCamera;

window.updateAngul = updateAngul;
window.updateHeight = updateHeight;

window.analyze = analyze;   // <<<<<< IMPORTANT

window.closePopup = closePopup;
