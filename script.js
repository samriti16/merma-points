document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready – starting camera");
});

// ----------- GLOBAL VALUES -----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");
const heightBox = document.getElementById("heightBox");

const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");

let currentStream = null;
let useBackCamera = true;

//
// ---------- START CAMERA ----------
async function startCamera() {

  try {

    // stop old stream if exists
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: useBackCamera ? { ideal: "environment" } : "user"
      },
      audio: false
    });

    currentStream = stream;

    video.srcObject = stream;

    video.onloadeddata = () => {
      video.play();
      console.log("🎥 video playing");
      if (status2) status2.innerText = "Camera Active ✔";
      if (statusText) statusText.innerText = "Camera Active ✔";
    };

  } catch (err) {

    console.error("❌ Camera error:", err);

    if (status2) status2.innerText = "Camera failed: " + err.name;
    if (statusText) statusText.innerText = "Camera failed: " + err.name;

    // fallback automatically to front cam
    if (useBackCamera) {
      useBackCamera = false;
      startCamera();
    }
  }
}

//
// ---------- SWITCH CAMERA ----------
function switchCamera() {
  useBackCamera = !useBackCamera;
  startCamera();
}

//
// ---------- ANGUL ----------
function updateAngul() {
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}

//
// ---------- HEIGHT ----------
function updateHeight() {
  heightPx = heightSlider.value;
  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;
  heightBox.style.height = (heightPx / 4) + "px";
}

//
// ---------- NAVIGATION ----------
function goToFinger() {
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");
}

function goToHeight() {
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
  startCamera();
}

function goToAR() {
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");
  startCamera();     // <-- only this. no video.play() here
}

//
// ---------- STATIC MARMA POINTS ----------
function analyze() {

  pointsDiv.innerHTML = "";

  const rect = video.getBoundingClientRect();
  const vh = rect.height;

  const map = [
    { y: 0.18, name: "Ani Marma", txt: "Shoulder joint marma" },
    { y: 0.30, name: "Hridaya Marma", txt: "Heart centre marma" },
    { y: 0.50, name: "Sthanamoola", txt: "Base of chest" },
    { y: 0.70, name: "Indravasti", txt: "Calf marma" },
    { y: 0.85, name: "Janu", txt: "Knee marma" }
  ];

  map.forEach(m => {

    const d = document.createElement("div");
    d.className = "mar-point";

    d.style.top = (vh * m.y) + "px";
    d.style.left = "50%";

    d.onclick = () => openPopup(m.name, m.txt);

    pointsDiv.appendChild(d);
  });
}

//
// ---------- POPUP ----------
function openPopup(a, b) {
  popup.classList.remove("hidden");
  pTitle.innerText = a;
  pText.innerText = b;
}

function closePopup() {
  popup.classList.add("hidden");
}

//
// ---------- EXPOSE ----------
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;

window.switchCamera = switchCamera;

window.updateAngul = updateAngul;
window.updateHeight = updateHeight;

window.analyze = analyze;

window.closePopup = closePopup;
