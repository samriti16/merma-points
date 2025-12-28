console.log("DOM Ready");

// ---------- GLOBAL ----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

let latestPose = null;
let trackingActive = false;
let useBackCamera = true;

let mpCamera = null;


// ---------- DOM ----------
const video = document.getElementById("video");
const points = document.getElementById("points");
const poseCanvas = document.getElementById("poseCanvas");
const ctx = poseCanvas.getContext("2d");

const heightBox = document.getElementById("heightBox");
const status2 = document.getElementById("status2");
const statusText = document.getElementById("statusText");


// ---------- CAMERA ----------
async function startCamera(){

  if (mpCamera){
    await mpCamera.stop();
    mpCamera = null;
  }

  mpCamera = new Camera(video, {
    onFrame: async () => {
      await pose.send({image: video});

      if(trackingActive){
        drawDynamicMarmaPoints();
      }
    },
    facingMode: useBackCamera ? "environment" : "user",
    width: 480,
    height: 640
  });

  await mpCamera.start();

  if(status2) status2.innerText = "Camera Active ✔";
  if(statusText) statusText.innerText = "Camera Active ✔";

  resizeCanvas();
}


// ---------- MATCH CANVAS TO VIDEO ----------
function resizeCanvas(){
  poseCanvas.width  = video.videoWidth;
  poseCanvas.height = video.videoHeight;

  poseCanvas.style.width  = video.clientWidth + "px";
  poseCanvas.style.height = video.clientHeight + "px";
}

window.addEventListener("resize", resizeCanvas);


// ---------- SWITCH CAMERA ----------
function switchCamera(){
  useBackCamera = !useBackCamera;
  startCamera();
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

  canvasArea.classList.remove("hidden");

  heightBox.classList.add("hidden");
  points.classList.add("hidden");

  trackingActive = false;

  startCamera();
}


// ---------- ANGUL ----------
function updateAngul(){
  angulPx = +angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}


// ---------- HEIGHT ----------
function updateHeight(){
  heightPx = +heightSlider.value;
  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;

  heightBox.style.height = (heightPx/4)+"px";
}


// ---------- MEDIAPIPE POSE ----------
const pose = new Pose({
  locateFile: (file)=>
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

  resizeCanvas();
  drawSkeleton(results);
});


// ---------- DRAW SKELETON ----------
function drawSkeleton(results){

  ctx.clearRect(0,0,poseCanvas.width,poseCanvas.height);

  if(!results.poseLandmarks) return;

  const vw = poseCanvas.width;
  const vh = poseCanvas.height;

  // joints
  ctx.fillStyle = "cyan";
  results.poseLandmarks.forEach(lm=>{
    ctx.beginPath();
    ctx.arc(lm.x*vw, lm.y*vh, 4, 0, Math.PI*2);
    ctx.fill();
  });

  // bones
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 2;

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


// ---------- ANALYZE BUTTON ----------
function analyze(){
  trackingActive = true;
  points.classList.remove("hidden");
}


// ---------- MARMA POINT LOGIC ----------
function drawDynamicMarmaPoints(){

  points.innerHTML = "";

  if(!latestPose) return;

  const rect = video.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;

  const mp = (id)=>latestPose[id];

  const marma = [
    { id:10, name:"Śira (Head)", desc:"Controls prāṇa & senses" },
    { id:12, name:"Hṛdaya (Heart)", desc:"Seat of ojas & consciousness" },
    { id:24, name:"Nābhi (Navel)", desc:"Centre of digestion (agni)" },
    { id:25, name:"Jānu L", desc:"Supports locomotion" },
    { id:26, name:"Jānu R", desc:"Supports locomotion" },
    { id:27, name:"Gulpha L", desc:"Stability & movement" },
    { id:28, name:"Gulpha R", desc:"Stability & movement" }
  ];

  marma.forEach(m=>{

    const lm = mp(m.id);
    if(!lm) return;

    const x = lm.x * vw;
    const y = lm.y * vh;

    const dot = document.createElement("div");
    dot.className = "marma-point";
    dot.style.left = x + "px";
    dot.style.top  = y + "px";

    const angulFromTop = Math.round((y/vh)*totalAngul);

    dot.onclick = ()=>openPopup(
      m.name,
      `${m.desc}<br><br><b>📏 Position:</b> ${angulFromTop} Aṅgula from crown`
    );

    points.appendChild(dot);
  });
}


// ---------- POPUP ----------
function openPopup(name,text){
  popup.classList.remove("hidden");
  pTitle.innerHTML = name;
  pText.innerHTML = text;
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
