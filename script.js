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

const poseCanvas = document.getElementById("poseCanvas");
const ctx = poseCanvas.getContext("2d");

const heightBox = document.getElementById("heightBox");
const canvasArea = document.getElementById("canvasArea");

const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");


// ------------ CAMERA ------------
async function startCamera(){

  try {
    if (currentStream)
      currentStream.getTracks().forEach(t=>t.stop());

    currentStream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode: useBackCamera ? "environment" : "user" },
      audio:false
    });

    video.srcObject = currentStream;
    await video.play().catch(()=>{});

    resizeCanvas();

    if(status2) status2.innerText="Camera Active ✔";
    if(statusText) statusText.innerText="Camera Active ✔";

  } catch(err){
    console.warn(err);
  }
}

function resizeCanvas(){
  const rect = video.getBoundingClientRect();
  poseCanvas.width = rect.width;
  poseCanvas.height = rect.height;
}


window.addEventListener("resize", resizeCanvas);


// ---------- CAMERA SWITCH ----------
function switchCamera(){
  useBackCamera = !useBackCamera;
  startCamera();
}


// ---------- ANGUL ----------
function updateAngul(){
  angulPx = +angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx+"px";
}


// ---------- HEIGHT ----------
function updateHeight(){
  heightPx = +heightSlider.value;
  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;
  heightBox.style.height = (heightPx/4)+"px";
}


// ---------- NAVIGATION ----------
function goToFinger(){
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");
}

function goToHeight(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");

  canvasArea.classList.remove("hidden");
  heightBox.classList.remove("hidden");
  points.classList.add("hidden");

  startCamera();
}

function goToAR(){
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");

  heightBox.classList.add("hidden");
  points.classList.add("hidden");   // ⛔ hidden until ANALYZE

  canvasArea.classList.remove("hidden");

  startCamera();
  startPoseTracking();               // live pose + skeleton only
}


// ------------- MEDIAPIPE -------------
const pose = new Pose({
  locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

pose.setOptions({
  modelComplexity:1,
  smoothLandmarks:true,
  minDetectionConfidence:0.5,
  minTrackingConfidence:0.5
});

const POSE_CONNECTIONS = window.POSE_CONNECTIONS;


// ------------ RECEIVE RESULTS ------------
pose.onResults((results)=>{

  latestPose = results.poseLandmarks;

  drawSkeleton(results);
});


// ----------- SKELETON DRAW ----------
function drawSkeleton(results){

  ctx.clearRect(0,0,poseCanvas.width,poseCanvas.height);

  if(!results.poseLandmarks) return;

  const vw = poseCanvas.width;
  const vh = poseCanvas.height;

  // joints
  ctx.fillStyle="rgba(0,255,255,.9)";

  results.poseLandmarks.forEach(lm=>{
    ctx.beginPath();
    ctx.arc(lm.x*vw, lm.y*vh, 4, 0, Math.PI*2);
    ctx.fill();
  });

  // bones
  ctx.strokeStyle="rgba(0,255,255,.7)";
  ctx.lineWidth=2;

  POSE_CONNECTIONS.forEach(([a,b])=>{
    const p1 = results.poseLandmarks[a];
    const p2 = results.poseLandmarks[b];
    if(!p1||!p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x*vw, p1.y*vh);
    ctx.lineTo(p2.x*vw, p2.y*vh);
    ctx.stroke();
  });
}


// ---------- LIVE POSE LOOP ----------

async function trackingLoop(){
  if(video.readyState >= 2){
    await pose.send({image:video});
  }
  requestAnimationFrame(trackingLoop);
}

function startPoseTracking(){
  requestAnimationFrame(trackingLoop);
}


function startPoseTracking(){
  trackingLoop();
}


// ---------- ANALYZE BUTTON ----------
async function analyze(){

  if(video.readyState < 2){
    return;
  }

  // force one fresh pose estimate
  await pose.send({image:video});

  // show points
  drawDynamicMarmaPoints();
  points.classList.remove("hidden");
}



// ---------- MARMA POINTS ----------
function drawDynamicMarmaPoints(){

  points.innerHTML="";

  if(!latestPose) return;

  const rect = video.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  const mp = (id)=>latestPose[id];

  const map = [
    {id:10, name:"Sira Matrika"},
    {id:12, name:"Hridaya"},
    {id:24, name:"Nabhi"},
    {id:25, name:"Janu (L)"},
    {id:26, name:"Janu (R)"},
    {id:27, name:"Gulpha (L)"},
    {id:28, name:"Gulpha (R)"}
  ];

  map.forEach(m=>{
    const lm = mp(m.id);
    if(!lm) return;

    const dot=document.createElement("div");
    dot.className="marma-point";

    dot.style.left=(lm.x*vw)+"px";
    dot.style.top =(lm.y*vh)+"px";

    dot.onclick=()=>openPopup(m);

    points.appendChild(dot);
  });
}


// ---------- POPUP ----------
function openPopup(m){
  popup.classList.remove("hidden");

  pTitle.innerText = m.name;

  // placeholder – you will insert Sanskrit/Ayurveda later
  pText.innerHTML = `
    <b>Calculated landmark index:</b> ${m.id}<br>
    <b>Mapped marma:</b> ${m.name}<br><br>
    <i>Measurement basis:</i> Pose landmark detection with skeletal overlay.<br>
    <i>Validation:</i> Match dot to joint visually on skeleton.
  `;
}

function closePopup(){
  popup.classList.add("hidden");
}


// ---------- EXPORT ----------
window.goToFinger=goToFinger;
window.goToHeight=goToHeight;
window.goToAR=goToAR;

window.updateAngul=updateAngul;
window.updateHeight=updateHeight;

window.switchCamera=switchCamera;
window.analyze=analyze;
window.closePopup=closePopup;
