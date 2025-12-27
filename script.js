//
// ---------------- GLOBAL VALUES ----------------
//
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const points = document.getElementById("points");

let latestPose = null;
let currentStream = null;
let useBackCamera = true;


//
// ---------------- NAVIGATION ----------------
//
function goToFinger(){
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");
}

function goToHeight(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
  startCamera();
}

function goToAR(){
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");
}


//
// ---------------- ANGUL ----------------
//
function updateAngul(){
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}


//
// ---------------- HEIGHT ----------------
//
function updateHeight(){
  heightPx = heightSlider.value;
  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;

  heightBox.style.height = (heightPx / 4) + "px";
}


//
// ---------------- SWITCH CAMERA ----------------
//
async function switchCamera(){

  if(currentStream){
    currentStream.getTracks().forEach(t=>t.stop());
  }

  useBackCamera = !useBackCamera;

  const stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode: useBackCamera ? "environment" : "user" }
  });

  currentStream = stream;
  video.srcObject = stream;
}


//
// ---------------- START CAMERA ----------------
//
async function startCamera(){

  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:{ ideal:"environment"}},
      audio:false
    });

    currentStream = stream;
    video.srcObject = stream;

    statusText.innerText = "Camera Active ✔";

  }catch(e){
    statusText.innerText = "Camera blocked: " + e.message;
  }
}


//
// ---------------- MEDIAPIPE POSE ----------------
//

// correct constructor (important!)
const mpPose = new Pose.Pose({
  locateFile:(file)=>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

mpPose.setOptions({
  modelComplexity:1,
  smoothLandmarks:true,
  enableSegmentation:false,
  minDetectionConfidence:0.5,
  minTrackingConfidence:0.5
});

mpPose.onResults(results=>{
  latestPose = results.poseLandmarks;
});


// attach mediapipe camera util
const mpCamera = new Camera(video,{
  onFrame: async ()=>{
    await mpPose.send({image:video});
  },
  width:640,
  height:480
});

mpCamera.start();


//
// ---------------- ANALYZE BODY (TEMP STATIC POINTS) ----------------
//
function analyze(){

  points.innerHTML = "";

  const vh = video.clientHeight;

  const map = [
    {y:0.18,name:"Ani",txt:"Shoulder marma"},
    {y:0.30,name:"Hridaya",txt:"Heart marma"},
    {y:0.50,name:"Sthanmoola",txt:"Chest base"},
    {y:0.70,name:"Indravasti",txt:"Calf"},
    {y:0.85,name:"Janu",txt:"Knee"}
  ];

  map.forEach(m=>{

    const d=document.createElement("div");
    d.className="mar-point";

    d.style.top = (vh*m.y) + "px";
    d.style.left = "50%";

    d.onclick = ()=>openPopup(m.name,m.txt);

    points.appendChild(d);

  });
}


//
// ---------------- POPUP ----------------
//
function openPopup(a,b){
  popup.classList.remove("hidden");
  pTitle.innerText = a;
  pText.innerText = b;
}

function closePopup(){
  popup.classList.add("hidden");
}


//
// ---------- EXPOSE FUNCTIONS TO HTML ----------
//
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;
window.analyze = analyze;
window.updateAngul = updateAngul;
window.updateHeight = updateHeight;
window.closePopup = closePopup;
window.switchCamera = switchCamera;
