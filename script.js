console.log("DOM Ready");

// ---------- GLOBAL ----------
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

let latestPose = null;
let trackingActive = false;
let useBackCamera = true;
let currentStream = null;   // <-- FIX added


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

  try {
    if (currentStream)
      currentStream.getTracks().forEach(t => t.stop());

    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useBackCamera ? "environment" : "user" },
      audio: false
    });

    video.srcObject = currentStream;

    await video.play();

    video.onloadedmetadata = () => resizeCanvas();

    if(status2) status2.innerText = "Camera Active ✔";
    if(statusText) statusText.innerText = "Camera Active ✔";

  } catch (err){
    console.error("Camera failed:", err);
    if(status2) status2.innerText = "Camera permission denied ❌";
  }
}


// ---------- KEEP CANVAS MATCHING VIDEO ----------
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
  drawDynamicMarmaPoints();   // <-- FIX added
});


// ---------- DRAW SKELETON ----------
function drawSkeleton(results){

  ctx.clearRect(0,0,poseCanvas.width,poseCanvas.height);

  if(!results.poseLandmarks) return;

  const vw = poseCanvas.width;
  const vh = poseCanvas.height;

  ctx.fillStyle = "cyan";
  results.poseLandmarks.forEach(lm=>{
    ctx.beginPath();
    ctx.arc(lm.x*vw, lm.y*vh, 4, 0, Math.PI*2);
    ctx.fill();
  });

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


// ---------- LIVE LOOP (IMPORTANT) ----------
async function trackingLoop(){

  if(trackingActive && video.readyState >= 2){
    await pose.send({image: video});   // <-- FIX added
  }

  requestAnimationFrame(trackingLoop);
}

trackingLoop();


// ---------- MARMA POINT LOGIC ----------
function drawDynamicMarmaPoints(){

  points.innerHTML = "";
  if (!latestPose) return;

  // keep same scale as pose skeleton
  const vw = poseCanvas.width;
  const vh = poseCanvas.height;

  const mp = (id)=>latestPose[id];

  const marma = [
    { id:10, name:"Śira (Head)", desc:"Controls prāṇa & senses" },
    { id:12, name:"Hṛdaya (Heart)", desc:"Seat of ojas & consciousness" },
    { id:24, name:"Nābhi (Navel)", desc:"Centre of digestion (agni)" },
    { id:25, name:"Jānu (Left Knee)", desc:"Supports locomotion" },
    { id:26, name:"Jānu (Right Knee)", desc:"Supports locomotion" },
    { id:27, name:"Gulpha (Left Ankle)", desc:"Stability & movement" },
    { id:28, name:"Gulpha (Right Ankle)", desc:"Stability & movement" }
  ];

  marma.forEach(m => {

    const lm = mp(m.id);
    if (!lm) return;

    let x = lm.x * vw;
    let y = lm.y * vh;

    // clamp so dot never goes outside frame
    x = Math.min(Math.max(x, 0), vw);
    y = Math.min(Math.max(y, 0), vh);

    // create dot
    const dot = document.createElement("div");
    dot.className = "marma-point";
    dot.style.left = x + "px";
    dot.style.top  = y + "px";

    // pixel calculations
    const bodyPx = vh;
    const pointPx = Math.round(y);

    // avoid divide-by-zero
    const angulTotal = totalAngul || 1;

    const angulFromTop = Math.round((pointPx / bodyPx) * angulTotal);

    // CLICK HANDLER
    dot.onclick = () => {

      const descriptionHtml = `
        <b>${m.name}</b><br>
        ${m.desc}<br><br>

        <b>📐 Numerical Calculation</b><br>
        Body height = ${bodyPx} px<br>
        Point position = ${pointPx} px<br>
        Total Height = ${angulTotal} Aṅgula<br><br>

        Formula:<br>
        Aṅgula = (Point px / Body px) × Total Aṅgula<br><br>

        Substitution:<br>
        Aṅgula = (${pointPx} / ${bodyPx}) × ${angulTotal}<br><br>

        <b>➡ Result:</b> ${angulFromTop} Aṅgula from crown
      `;

      openPopup(m.name, descriptionHtml);
    };

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
