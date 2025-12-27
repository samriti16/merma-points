// defaults
let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

// element refs
const screen0 = document.getElementById("screen0");
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");

const video = document.getElementById("video");
const video2 = document.getElementById("video2");
const pointsDiv = document.getElementById("points");

// ---------------- NAVIGATION ----------------
function goToFinger(){
 screen0.classList.add("hidden");
 screen1.classList.remove("hidden");
}

function goToHeight(){
 screen1.classList.add("hidden");
 screen2.classList.remove("hidden");
 startCamera(video); // show camera in height step
}

function goToAR(){
 screen2.classList.add("hidden");
 screen3.classList.remove("hidden");
 startCamera(video2);
}

// ---------------- ANGUL ----------------
function updateAngul(){
 angulPx = angulSlider.value;
 angulValue.innerText = angulPx;
 angulBox.style.width = angulPx + "px";
}

// ---------------- HEIGHT ----------------
function updateHeight(){
 heightPx = heightSlider.value;
 totalAngul = Math.round(heightPx / angulPx);
 angulTotal.innerText = totalAngul;
 heightBox.style.height = (heightPx / 4) + "px";
}

// ---------------- CAMERA ----------------
async function startCamera(vidEl){

 try{
   const stream = await navigator.mediaDevices.getUserMedia({
     video: { facingMode: { ideal: "environment" }},
     audio: false
   });

   vidEl.srcObject = stream;

 }catch(e){
   alert("Camera blocked: " + e.message);
 }
}

// ---------------- ANALYZE BODY ----------------
function analyze(){

 pointsDiv.innerHTML = "";

 const map = [
  {y:0.18,name:"Ani Marma",txt:"Shoulder joint marma"},
  {y:0.30,name:"Hridaya Marma",txt:"Heart centre"},
  {y:0.50,name:"Sthanmoola Marma",txt:"Base of chest"},
  {y:0.70,name:"Indravasti Marma",txt:"Calf region"},
  {y:0.85,name:"Janu Marma",txt:"Knee marma"}
 ];

 const h = video2.clientHeight;

 map.forEach(m=>{
   const d=document.createElement("div");
   d.className="mar-point";
   d.style.left="50%";
   d.style.top=(h*m.y)+"px";
   d.onclick=()=>openPopup(m.name,m.txt);
   pointsDiv.appendChild(d);
 });
}

// ---------------- POPUP ----------------
function openPopup(a,b){
 popup.classList.remove("hidden");
 pTitle.innerText=a;
 pText.innerText=b;
}

function closePopup(){
 popup.classList.add("hidden");
}
