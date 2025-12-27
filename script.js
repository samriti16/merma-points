let angulPx = 60;
let heightPx = 600;
let totalAngul = 0;

let currentFacing = "environment";

const video = document.getElementById("arVideo");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

let pose;
let camera;

// ======== NAVIGATION ========

function goToFingerMeasure(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
}

function goToHeightMeasure(){
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");

  startCamera();
}

async function startAR(){
  screen3.classList.add("hidden");
  screen4.classList.remove("hidden");

  document.getElementById("status").innerText =
    "Analyzing… Please hold still";

  await startCamera();

  setTimeout(()=>{
    runPoseDetection();
  },2000);
}

// ======== ANGUL ========

function updateAngul(){
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx+"px";
}

// ======== HEIGHT ========

function updateHeight(){
  heightPx = heightSlider.value;
  heightPx.innerText = heightPx;

  totalAngul = Math.round(heightPx / angulPx);
  totalAngulText.innerText = totalAngul;

  heightBox.style.height = heightPx+"px";
}

// ======== CAMERA ========

async function startCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{facingMode: currentFacing},
    audio:false
  });

  video.srcObject = stream;
  arVideo.srcObject = stream;
}

// SWITCH FRONT/BACK
function switchCamera(){
  currentFacing = currentFacing === "environment" ? "user" : "environment";
  startCamera();
}

// ======== MEDIAPIPE POSE ========

function runPoseDetection(){

  pose = new Pose({
    locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
  });

  pose.setOptions({
    modelComplexity:1,
    smoothLandmarks:true,
    enableSegmentation:false,
    minDetectionConfidence:0.5,
    minTrackingConfidence:0.5
  });

  pose.onResults(renderMarma);

  camera = new Camera(arVideo,{
    onFrame: async ()=>{
      await pose.send({image:arVideo});
    },
    width:640,
    height:480
  });

  camera.start();
}

// ======== MAPPING LANDMARKS TO MARMA ========

function renderMarma(results){

  ctx.clearRect(0,0,overlay.width,overlay.height);

  if(!results.poseLandmarks){return;}

  let lm = results.poseLandmarks;

  // selected anatomical anchors
  let head = lm[0];
  let chest = lm[12];
  let navel = lm[24];
  let knee = lm[26];
  let ankle = lm[28];

  drawPoint(head,"Sringataka Marma","Head marma – senses & mind");
  drawPoint(chest,"Hridaya Marma","Heart centre – Prana & Ojas");
  drawPoint(navel,"Nabhi Marma","Digestive fire control");
  drawPoint(knee,"Janu Marma","Knee marma for locomotion");
  drawPoint(ankle,"Gulpha Marma","Ankle marma balance control");

  document.getElementById("status").innerText =
    "Tap points to read Ayurveda description";
}

// ======== DRAW INTERACTIVE POINT ========

function drawPoint(lm,name,text){

  const x = lm.x * overlay.width;
  const y = lm.y * overlay.height;

  ctx.beginPath();
  ctx.fillStyle="red";
  ctx.arc(x,y,8,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle="white";
  ctx.stroke();

  overlay.onclick = function(e){
    let dx=e.offsetX-x;
    let dy=e.offsetY-y;
    if(dx*dx+dy*dy < 150) openPopup(name,text);
  }
}

// ======== POPUP ========

function openPopup(t,d){
  popupTitle.innerText=t;
  popupText.innerText=d;
  popup.classList.remove("hidden");
}

function closePopup(){
  popup.classList.add("hidden");
}
