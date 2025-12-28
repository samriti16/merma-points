console.log("DOM Ready");

// ---------- GLOBAL ----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

let latestPose = null;
let currentStream = null;
let useBackCamera = true;
let trackingActive = false;

// ---------- DOM ----------
const video = document.getElementById("video");
const points = document.getElementById("points");
const poseCanvas = document.getElementById("poseCanvas");
const ctx = poseCanvas.getContext("2d");

const heightBox = document.getElementById("heightBox");
const canvasArea = document.getElementById("canvasArea");

const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");


// ---------- CAMERA ----------
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
    console.warn("Camera error", err);
  }
}


// keep overlay equal to video
function resizeCanvas(){
  poseCanvas.width = video.clientWidth;
  poseCanvas.height = video.clientHeight;
}

window.addEventListener("resize", resizeCanvas);


// ---------- UI NAVIGATION ----------
function switchCamera(){
  useBackCamera = !useBackCamera;
  startCamera();
}

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

  canvasArea.classList.remove("hidden");

  heightBox.classList.add("hidden");
  points.classList.add("hidden");

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


// ---------- MEDIAPIPE ----------
const pose = new Pose({
  locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

pose.setOptions({
  modelComplexity:1,
  smoothLandmarks:true,
  minDetectionConfidence:0.5,
  minTrackingConfidence:0.5
});

pose.onResults((results)=>{
  latestPose = results.poseLandmarks;

  drawSkeleton(results);
});


// ---------- SKELETON ----------
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

  window.POSE_CONNECTIONS.forEach(([a,b])=>{
    const p1 = results.poseLandmarks[a];
    const p2 = results.poseLandmarks[b];
    if(!p1||!p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x*vw, p1.y*vh);
    ctx.lineTo(p2.x*vw, p2.y*vh);
    ctx.stroke();
  });
}


// ---------- ANALYZE BUTTON ----------
async function analyze(){
  trackingActive = true;
  points.classList.remove("hidden");
  await pose.send({image:video});
  drawDynamicMarmaPoints();
}


// ---------- LIVE TRACKING LOOP ----------
async function trackingLoop(){
  if(trackingActive && video.readyState>=2){
    await pose.send({image:video});
    drawDynamicMarmaPoints();
  }
  requestAnimationFrame(trackingLoop);
}

trackingLoop();


// ---------- MARMA CALC + POINTS ----------
function drawDynamicMarmaPoints(){

  points.innerHTML="";

  if(!latestPose) return;

  const rect = video.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  const mp = (id)=>latestPose[id];

  const marma = [
    {
      id:10,
      name:"Śira Marma (Head)",
      desc:"Controls sense organs and prana vayu. Trauma causes loss of consciousness."
    },
    {
      id:12,
      name:"Hṛdaya Marma (Heart)",
      desc:"Seat of consciousness and ojas. Injury can be fatal."
    },
    {
      id:24,
      name:"Nābhi Marma (Navel)",
      desc:"Controls digestion and abdominal organs."
    },
    { id:25, name:"Jānu Marma (Left Knee)", desc:"Supports locomotion."},
    { id:26, name:"Jānu Marma (Right Knee)", desc:"Supports locomotion."},
    { id:27, name:"Gulpha Marma (Left Ankle)", desc:"Controls movement & stability."},
    { id:28, name:"Gulpha Marma (Right Ankle)", desc:"Controls movement & stability."}
  ];

  marma.forEach(m=>{

    const lm = mp(m.id);
    if(!lm) return;

    const x = lm.x * vw;
    const y = lm.y * vh;

    const dot=document.createElement("div");
    dot.className="marma-point";
    dot.style.left=x+"px";
    dot.style.top =y+"px";

    const angulFromTop = Math.round((y / vh) * totalAngul);

    dot.onclick=()=>openPopup(
      m.name,
      m.desc + `\n\nCalculated Position: ${angulFromTop} Aṅgula from crown`
    );

    points.appendChild(dot);
  });
}


// ---------- POPUP ----------
function openPopup(name,text){
  popup.classList.remove("hidden");
  pTitle.innerText=name;
  pText.innerText=text;
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
