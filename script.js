//
// ------------------- GLOBAL VALUES -------------------
//
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");

let camera = null;
let latestPose = null;


//
// ------------------- NAVIGATION -------------------
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
  startCamera();
}


//
// ------------------- ANGUL -------------------
//
function updateAngul(){
  angulPx = angulSlider.value;
  angulValue.innerText = angulPx;
  angulBox.style.width = angulPx + "px";
}


//
// ------------------- HEIGHT -------------------
//
function updateHeight(){
  heightPx = heightSlider.value;
  totalAngul = Math.round(heightPx / angulPx);
  angulTotal.innerText = totalAngul;

  heightBox.style.height = (heightPx / 4) + "px";
}



//
// ------------------- START CAMERA -------------------
//
async function startCamera(){

  if(camera){ return; } // camera already running

  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }},
      audio:false
    });

    video.srcObject = stream;
    statusText.innerText = "Camera Active ✔";

  }catch(e){
    statusText.innerText = "Camera blocked: " + e.message;
  }
}



//
// ------------------- MEDIAPIPE POSE -------------------
//

// create MediaPipe pose object
const mpPose = new Pose({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

mpPose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// callback: receives detected landmarks
mpPose.onResults((results)=>{
  latestPose = results.poseLandmarks;
});


//
// camera-utils attaches video frames to MediaPipe
//
const mpCamera = new Camera(video, {
  onFrame: async () => {
    await mpPose.send({image: video});
  },
  width: 640,
  height: 480
});

mpCamera.start();



//
// ------------------- ANALYZE BODY -------------------
//
function analyze(){

  pointsDiv.innerHTML = "";

  if(!latestPose){
    alert("No body detected. Stand inside camera frame.");
    return;
  }

  // key anatomical references
  const nose = latestPose[0];
  const shoulderMidY = (latestPose[11].y + latestPose[12].y)/2;
  const hipMidY = (latestPose[23].y + latestPose[24].y)/2;
  const kneeMidY = (latestPose[25].y + latestPose[26].y)/2;
  const ankleMidY = (latestPose[27].y + latestPose[28].y)/2;

  // map marma positions in live proportion
  const marmaMap = [
    { y:nose.y, name:"Sringataka", text:"Vital head marma" },
    { y:shoulderMidY, name:"Ani Marma", text:"Shoulder joint marma" },
    { y:hipMidY, name:"Nabhi Marma", text:"Navel energy centre" },
    { y:kneeMidY, name:"Janu Marma", text:"Knee marma" },
    { y:ankleMidY, name:"Gulpha Marma", text:"Ankle marma" }
  ];

  marmaMap.forEach(m=>{

    const p = document.createElement("div");
    p.className = "mar-point";

    // convert relative Y → pixel
    p.style.left = "50%";
    p.style.top = (m.y * video.clientHeight) + "px";

    p.onclick = ()=>openPopup(m.name, m.text);

    pointsDiv.appendChild(p);

  });

}



//
// ------------------- POPUP -------------------
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
// ----------- EXPOSE TO HTML BUTTONS -----------
//
window.goToFinger = goToFinger;
window.goToHeight = goToHeight;
window.goToAR = goToAR;
window.analyze = analyze;
window.updateAngul = updateAngul;
window.updateHeight = updateHeight;
window.closePopup = closePopup;
