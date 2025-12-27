let video = document.getElementById("video");
let pointsDiv = document.getElementById("points");

let usingBackCamera = true;

//
// ******** START CAMERA ********
//
async function startCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode: usingBackCamera ? "environment" : "user" },
    audio:false
  });
  video.srcObject = stream;
}

//
// ******** SWITCH CAMERA ********
//
function switchCamera(){
  usingBackCamera = !usingBackCamera;
  startCamera();
}

//
// ********* LOAD MEDIAPIPE POSE ********
//
const pose = new Pose.Pose({
  locateFile: (file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});
function goToFinger(){
  screen0.classList.add("hidden");
  screen1.classList.remove("hidden");
}


pose.setOptions({
  modelComplexity:1,
  smoothLandmarks:true,
  enableSegmentation:false,
  minDetectionConfidence:0.6,
  minTrackingConfidence:0.6
});

pose.onResults(onPoseResults);

//
// ******** RUN AI ON CAMERA ********
//
const camera = new Camera(video,{
  onFrame: async()=> { await pose.send({image: video}); },
  width: 640,
  height: 480
});

camera.start();

//
// ******** HANDLE AI OUTPUT ********
//
function onPoseResults(results){

  pointsDiv.innerHTML = "";

  if(!results.poseLandmarks) return;

  const L = results.poseLandmarks;

  // key body reference points
  const head = L[0].y;
  const foot = Math.max(L[31].y, L[32].y);

  // normalize body height
  const bodyHeight = foot - head;

  // Marma proportional rules
  const marmas = [
    { r:0.18 , name:"Ani Marma", text:"Shoulder joint marma" },
    { r:0.30 , name:"Hridaya", text:"Heart region marma" },
    { r:0.50 , name:"Sthanamula", text:"Base of chest marma" },
    { r:0.70 , name:"Indravasti", text:"Calf vascular marma" },
    { r:0.85 , name:"Janu", text:"Knee marma" }
  ];

  marmas.forEach(m=>{

    let y = (head + bodyHeight*m.r) * video.clientHeight;
    let x = video.clientWidth/2;

    const dot = document.createElement("div");
    dot.className="mar-point";
    dot.style.top = y+"px";
    dot.style.left = x+"px";

    dot.onclick = ()=>openPopup(m.name,m.text);

    pointsDiv.appendChild(dot);
  });
}

//
// ******** POPUP ********
//
function openPopup(a,b){
  popup.classList.remove("hidden");
  pTitle.innerText=a;
  pText.innerText=b;
}

function closePopup(){
 popup.classList.add("hidden");
}
