const video = document.getElementById("video");

//
// ----------- GLOBAL VALUES -----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");
const heightBox = document.getElementById("heightBox");

let currentStream = null;
let useBackCamera = true;


//
// ---------- START CAMERA ----------
async function startCamera() {

  // stop old stream if exists
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useBackCamera ? "environment" : "user" },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;

    // update status text when video actually loads
    video.onloadedmetadata = () => {
      if (status2) status2.innerText = "Camera Active ✔";
      if (statusText) statusText.innerText = "Camera Active ✔";
    };

  } catch (err) {
    if (status2) status2.innerText = "Camera blocked ❌ allow camera in browser settings";
    if (statusText) statusText.innerText = "Camera blocked ❌";
    console.log(err);
  }
}


//
// ---------- SWITCH CAMERA ----------
async function switchCamera() {
  useBackCamera = !useBackCamera;
  startCamera();
}


//
// ---------- ANGUL MEASUREMENT ----------
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

  // visual yellow box scale
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
  startCamera();
}


//
// ---------- STATIC MARMA (SIMULATION NOW) ----------
async function startCamera() {

  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useBackCamera ? "environment" : "user" },
      audio: false
    });

    currentStream = stream;

    // 🔥 send video to the ONLY video element
    video.srcObject = stream;

  } catch (err) {
    console.log(err);
  }
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
// ---------- EXPOSE FOR HTML ----------
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;

window.switchCamera = switchCamera;

window.updateAngul = updateAngul;
window.updateHeight = updateHeight;

window.analyze = analyze;

window.closePopup = closePopup;
