let angulPx = 60;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");

// ========== SCREEN NAVIGATION ==========
function goToFingerMeasure(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
}

function goToHeightMeasure(){
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");
}

function startAR(){
  screen3.classList.add("hidden");
  screen4.classList.remove("hidden");

  startCamera();
  placeMarmaPoints();
}

// ========== ANGUL MEASUREMENT ==========
function updateAngul(){
  angulPx = parseInt(document.getElementById("angulSlider").value);
  document.getElementById("angulValue").innerText = angulPx;
  document.getElementById("angulBox").style.width = angulPx + "px";
}

// ========== HEIGHT TO ANGUL ==========
function updateHeight(){
  heightPx = parseInt(document.getElementById("heightSlider").value);

  document.getElementById("heightPx").innerText = heightPx;

  totalAngul = Math.round(heightPx / angulPx);

  document.getElementById("totalAngul").innerText = totalAngul;
}

// ========== START CAMERA ==========
async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }},
      audio: false
    });

    video.srcObject = stream;
    status.innerText = "Camera Active ✔";

  }catch(e){
    status.innerText = "Camera failed: " + e.message;
  }
}

// ========== PLACE MARMA BASED ON ANGUL PROPORTION ==========
function placeMarmaPoints(){

  pointsDiv.innerHTML = "";

  // Map using proportion of height in Anguls
  const map = [
    { ratio: 0.35, name:"Hridaya Marma", text:"Heart centre – consciousness & prana" },
    { ratio: 0.50, name:"Sthanmoola Marma", text:"Base of chest region" },
    { ratio: 0.15, name:"Ani Marma", text:"Shoulder region movement control" },
    { ratio: 0.65, name:"Indravasti Marma", text:"Calf region vascular marma" },
    { ratio: 0.80, name:"Janu Marma", text:"Knee marma controlling locomotion" }
  ];

  map.forEach(m => {

    const pt = document.createElement("div");
    pt.className = "marma-point";

    pt.style.left = "50%";
    pt.style.top = (m.ratio * 100) + "%";

    pt.onclick = ()=>openPopup(m.name, m.text);

    pointsDiv.appendChild(pt);
  });
}

// ========== POPUP ==========
function openPopup(a,b){
  popupTitle.innerText = a;
  popupText.innerText = b;
  popup.classList.remove("hidden");
}

function closePopup(){
  popup.classList.add("hidden");
}
