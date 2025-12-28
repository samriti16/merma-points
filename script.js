console.log("DOM Ready");

// ---------- GLOBAL ----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

// DOM elements
const video = document.getElementById("video");
const points = document.getElementById("points");
const heightBox = document.getElementById("heightBox");

const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");

let currentStream = null;
let useBackCamera = true;

let latestPose = null;


// ---------------- CAMERA ----------------
async function startCamera() {
  try {

    if (currentStream)
      currentStream.getTracks().forEach(t => t.stop());

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useBackCamera ? "environment" : "user" },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;
    await video.play();

    if (status2) status2.innerText = "Camera Active ✔";
    if (statusText) statusText.innerText = "Camera Active ✔";

  } catch (err) {
    console.log("Camera error", err);

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
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}


// ---------------- HEIGHT ----------------
function updateHeight() {
  heightPx = heightSlider.value;

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
  points.classList.remove("hidden");   // <<< IMPORTANT

  startCamera();
  startPoseTracking();
}


// ---------------- MEDIAPIPE POSE ----------------
const pose = new Pose({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.3/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults((results) => {
  latestPose = results.poseLandmarks;

  if (!latestPose) {
    console.log("❌ NO POSE");
    return;
  }

  console.log("✔ POSE FOUND");
  drawDynamicMarmaPoints();
});


// ------------- START LIVE TRACKING -------------
function startPoseTracking() {

  const cam = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480
  });

  cam.start();
}


// ------------- DRAW MARMA POINTS -------------
function drawDynamicMarmaPoints() {

  points.innerHTML = "";

  if (!latestPose) return;

  console.log("drawing dots", latestPose.length);

  const vw = video.clientWidth;
  const vh = video.clientHeight;

  const mp = (id) => latestPose[id];

  const marmaMap = [
    { id: 10, name: "Sira Matrika", txt: "Head marma" },
    { id: 12, name: "Hridaya", txt: "Heart marma" },
    { id: 24, name: "Nabhi", txt: "Navel marma" },
    { id: 25, name: "Janu", txt: "Knee marma" },
    { id: 26, name: "Janu", txt: "Knee marma" },
    { id: 27, name: "Gulpha", txt: "Ankle marma" },
    { id: 28, name: "Gulpha", txt: "Ankle marma" }
  ];

  marmaMap.forEach(m => {

    const lm = mp(m.id);
    if (!lm) return;

    const dot = document.createElement("div");
    dot.className = "marma-point";

    dot.style.left = (lm.x * vw) + "px";
    dot.style.top = (lm.y * vh) + "px";

    dot.addEventListener("pointerdown", () => openPopup(m.name, m.txt));

    points.appendChild(dot);
  });

  console.log("dots drawn:", points.children.length);
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


// ------------- EXPORT TO HTML -------------
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;

window.switchCamera = switchCamera;

window.updateAngul = updateAngul;
window.updateHeight = updateHeight;

window.analyze = drawDynamicMarmaPoints;

window.closePopup = closePopup;
