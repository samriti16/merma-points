console.log("DOM Ready");

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

let latestPose = null;   // <-- real pose stored here

//----------------------------------------------------
// 🎥 START CAMERA (used for BOTH Step 2 & Step 3)
//----------------------------------------------------
async function startCamera() {

  try {

    if (currentStream)
      currentStream.getTracks().forEach(t => t.stop());

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: useBackCamera ? "environment" : "user"
      },
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

//----------------------------------------------------
// 🔁 SWITCH CAMERA
//----------------------------------------------------
function switchCamera(){
  useBackCamera = !useBackCamera;
  startCamera();
}

//----------------------------------------------------
// 🧮 ANGUL
//----------------------------------------------------
function updateAngul(){
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}

//----------------------------------------------------
// 📏 HEIGHT
//----------------------------------------------------
function updateHeight(){

  heightPx = heightSlider.value;

  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;

  heightBox.style.height = (heightPx / 4) + "px";
}

//----------------------------------------------------
// 🧭 NAVIGATION
//----------------------------------------------------
function goToFinger(){
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");

  heightBox.classList.add("hidden");
  pointsDiv.classList.add("hidden");
}

function goToHeight(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");

  startCamera();

  heightBox.classList.remove("hidden");
  pointsDiv.classList.add("hidden");
}

function goToAR(){

  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");

  heightBox.classList.add("hidden");
  pointsDiv.classList.remove("hidden");

  startCamera();            // camera stays ON
  startPoseTracking();      // <-- enable Mediapipe
}

//----------------------------------------------------
// 🧠 MEDIAPIPE POSE
//----------------------------------------------------
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

pose.onResults((results)=>{
  latestPose = results.poseLandmarks;
  drawDynamicMarmaPoints();
});

//----------------------------------------------------
// 🚀 START LIVE POSE TRACKING
//----------------------------------------------------
function startPoseTracking(){

  const cam = new Camera(video, {
    onFrame: async () => {
      await pose.send({image: video});
    },
    width: 640,
    height: 480
  });

  cam.start();
}

//----------------------------------------------------
// 🔴 PLACE MARMA POINTS USING BODY LANDMARKS
//----------------------------------------------------
function drawDynamicMarmaPoints(){

  pointsDiv.innerHTML = "";

  if(!latestPose){
    return;
  }

  function mp(id){ return latestPose[id]; }

  const map = [

    // head between eyes
    {id: 10, name:"Sira Matrika", txt:"Head marma"},

    // chest centre between shoulders
    {id: 12, name:"Hridaya", txt:"Heart marma"},

    // navel close to midpoint hip line
    {id: 24, name:"Nabhi", txt:"Navel marma"},

    // knee left/right
    {id: 25, name:"Janu", txt:"Knee marma"},
    {id: 26, name:"Janu", txt:"Knee marma"},

    // ankle
    {id: 27, name:"Gulpha", txt:"Ankle marma"},
    {id: 28, name:"Gulpha", txt:"Ankle marma"}

  ];

  const vw = video.clientWidth;
  const vh = video.clientHeight;

  map.forEach(m => {

    const lm = mp(m.id);
    if(!lm) return;

    const x = lm.x * vw;
    const y = lm.y * vh;

    const d = document.createElement("div");
    d.className = "mar-point";
    d.style.left = x + "px";
    d.style.top = y + "px";

    d.onclick = ()=>openPopup(m.name, m.txt);

    pointsDiv.appendChild(d);
  });

}

//----------------------------------------------------
// 🧍 Static fallback button (optional)
//----------------------------------------------------
function analyze(){
  drawDynamicMarmaPoints();
}

//----------------------------------------------------
// 🔳 POPUP
//----------------------------------------------------
function openPopup(a,b){
  popup.classList.remove("hidden");
  pTitle.innerText = a;
  pText.innerText = b;
}

function closePopup(){
  popup.classList.add("hidden");
}

//----------------------------------------------------
// 🌍 BIND BUTTONS
//----------------------------------------------------
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;

window.switchCamera = switchCamera;

window.updateAngul = updateAngul;
window.updateHeight = updateHeight;

window.analyze = analyze;

window.closePopup = closePopup;
