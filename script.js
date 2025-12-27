let angulPx = 42;
let heightPx = 600;
let totalAngul = 0;

const video = document.getElementById("video");
const pointsDiv = document.getElementById("points");

//
// ---------- NAVIGATION ----------
//
function goToFinger(){
 screen0.classList.add("hidden");
 screen1.classList.remove("hidden");
}

function goToHeight(){
 screen1.classList.add("hidden");
 screen2.classList.remove("hidden");
 startCamera();   // turn camera ON here
}

function goToAR(){
 screen2.classList.add("hidden");
 screen3.classList.remove("hidden");
 startCamera();
}

//
// ---------- ANGUL ----------
//
function updateAngul(){
 angulPx = angulSlider.value;
 angulValue.innerText = angulPx;
 angulBox.style.width = angulPx+"px";
}

//
// ---------- HEIGHT ----------
//
function updateHeight(){
 heightPx = heightSlider.value;
 totalAngul = Math.round(heightPx/angulPx);
 angulTotal.innerText = totalAngul;
 heightBox.style.height = heightPx/4+"px";
}

//
// ---------- CAMERA START ----------
//
async function startCamera(){

 try{
   const stream = await navigator.mediaDevices.getUserMedia({
     video:{facingMode:{ideal:"environment"}},
     audio:false
   });

   video.srcObject = stream;
   statusText.innerText = "Camera Active ✔ Point camera at body";

 }catch(e){
   statusText.innerText = "Camera blocked: "+e.message;
 }
}

//
// ---------- ANALYZE BODY ----------
// (currently simulated marma layout)
//
function analyze(){

 pointsDiv.innerHTML="";

 const map = [
 {y:0.18,name:"Ani Marma",txt:"Shoulder joint marma"},
 {y:0.30,name:"Hridaya Marma",txt:"Heart centre marma"},
 {y:0.50,name:"Sthanmoola",txt:"Chest base marma"},
 {y:0.70,name:"Indravasti",txt:"Calf marma"},
 {y:0.85,name:"Janu",txt:"Knee marma"}
 ];

 map.forEach(m=>{
  const d=document.createElement("div");
  d.className="mar-point";
  d.style.left="50%";
  d.style.top=(video.clientHeight*m.y)+"px";
  d.onclick=()=>openPopup(m.name,m.txt);
  pointsDiv.appendChild(d);
 });

}

//
// ---------- POPUP ----------
//
function openPopup(a,b){
 popup.classList.remove("hidden");
 pTitle.innerText=a;
 pText.innerText=b;
}

function closePopup(){
 popup.classList.add("hidden");
}
