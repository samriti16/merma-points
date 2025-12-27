const video = document.getElementById("video");
const statusText = document.getElementById("status");
const loader = document.getElementById("loader");
const pointsBox = document.getElementById("points");

async function startAnalysis() {

  statusText.innerText = "Requesting camera...";
  loader.style.display = "block";

  // safety fallback
  const getUserMedia = (
    navigator.mediaDevices?.getUserMedia ||
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
  );

  if (!getUserMedia) {
    statusText.innerText = "Camera not supported or insecure connection. Open using localhost or HTTPS.";
    loader.style.display = "none";
    return;
  }

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;

    statusText.innerText = "Camera Active ✔ Align inside frame";
    loader.style.display = "none";

    setTimeout(showMarmaPoints, 1500);

  } catch (err) {

    loader.style.display = "none";
    statusText.innerText = "Camera blocked: " + err.message;
  }
}


function showMarmaPoints(){

  statusText.innerText = "Tap on points to read Ayurveda description";

  pointsBox.classList.remove("hidden");

  const marmaPoints = [
    {x:48, y:18, name:"Stanamula Marma", desc:"Located in chest region – vital for Prana Vayu"},
    {x:52, y:18, name:"Hridaya Marma", desc:"Heart centre – governs consciousness & circulation"},

    {x:48, y:35, name:"Indravasti Marma", desc:"Abdominal marma controlling digestive fire"},
    {x:52, y:35, name:"Indravasti Marma", desc:"Abdominal marma controlling digestive fire"},

    {x:35, y:25, name:"Ani Marma", desc:"Shoulder joint marma – movement control"},
    {x:65, y:25, name:"Ani Marma", desc:"Shoulder joint marma – movement control"},

    {x:35, y:55, name:"Kurpara Marma", desc:"Elbow marma – nerve pathway point"},
    {x:65, y:55, name:"Kurpara Marma", desc:"Elbow marma – nerve pathway point"},

    {x:40, y:75, name:"Janu Marma", desc:"Knee marma connected to locomotion"},
    {x:60, y:75, name:"Janu Marma", desc:"Knee marma connected to locomotion"},
  ];

  marmaPoints.forEach(p=>{
    const d=document.createElement("div");
    d.className="dot";
    d.style.left=p.x+"%";
    d.style.top=p.y+"%";

    d.onclick=()=>openPopup(p.name,p.desc);

    pointsBox.appendChild(d);
  });
}

function openPopup(t,txt){
  document.getElementById("popup-title").innerText=t;
  document.getElementById("popup-text").innerText=txt;
  document.getElementById("popup").classList.remove("hidden");
}

function closePopup(){
  document.getElementById("popup").classList.add("hidden");
}
