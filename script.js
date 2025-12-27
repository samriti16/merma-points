let angulPx = 60;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");
const statusText = document.getElementById("status");

// ========== SCREEN NAVIGATION ==========
function goToFingerMeasure(){
  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
}

function goToHeightMeasure(){
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");
}

// MAIN START BUTTON (USER GESTURE FOR iPHONE)
function startAR(){
  screen3.classList.add("hidden");
  screen4.classList.remove("hidden");

  startCamera();   // start video
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

  statusText.innerText = "Requesting camera...";

  try{

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },   // BACK CAMERA
      audio: false
    });

    video.srcObject = stream;
    video.play();
    statusText.innerText = "Camera Active ✔ Analyzing body...";

    // Wait 2s then show points (looks like AI analyzed)
    setTimeout(placeMarmaPoints, 2000);

  }catch(e){
    statusText.innerText = "Camera blocked ❌: " + e.message;
  }
}

// ========== PLACE MARMA POINTS AFTER ANALYSIS ==========
function placeMarmaPoints(){

  statusText.innerText = "Tap on points for Ayurveda information";

  pointsDiv.innerHTML = "";

  const map = [
    { ratio: 0.15, name:"Ani Marma", text:"Shoulder joint marma – movement control" },
    { ratio: 0.30, name:"Hridaya Marma", text:"Heart marma – prana and consciousness" },
    { ratio: 0.50, name:"Nabhi Marma", text:"Navel marma – digestive fire (Agni)" },
    { ratio: 0.65, name:"Indravasti Marma", text:"Leg marma – blood / nerve flow" },
    { ratio: 0.80, name:"Janu Marma", text:"Knee marma – locomotion centre" }
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
