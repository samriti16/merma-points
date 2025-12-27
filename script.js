const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const analyzingBox = document.getElementById("analyzing");
const pointsContainer = document.getElementById("points");
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-text");

let stream;

// ==============================
//  START CAMERA (BACK CAMERA)
// ==============================
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: "environment" }   // back camera
      },
      audio: false
    });

    video.srcObject = stream;

  } catch (err) {
    console.log("Back camera failed, switching to front camera...");
    // fallback: front camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
  }
}

// ==============================
//   START ANALYSIS BUTTON CLICK
// ==============================
startBtn.addEventListener("click", async () => {

  // hide points until analysis finishes
  pointsContainer.style.display = "none";

  // show analyzing loader
  analyzingBox.classList.remove("hidden");

  // start camera if not already
  if (!stream) {
    await startCamera();
  }

  // simulate AI analyzing delay (replace later with pose detection)
  setTimeout(() => {
    analyzingBox.classList.add("hidden");

    // show marma points only now
    showMarmaPoints();

  }, 2000);
});

// ==============================
//   DISPLAY STATIC DEMO POINTS
// ==============================
function showMarmaPoints() {

  pointsContainer.innerHTML = ""; // clear old

  pointsContainer.style.display = "block";

  // example demo marma set
  const marmaData = [
    { x: 50, y: 15, name: "Sringataka", text: "Head + sensory control marma" },
    { x: 50, y: 30, name: "Ani Marma", text: "Shoulder joint – movement control" },
    { x: 50, y: 45, name: "Hridaya Marma", text: "Heart energy & consciousness" },
    { x: 30, y: 60, name: "Kukundara", text: "Hip marma – balance & walking" },
    { x: 70, y: 60, name: "Kukundara", text: "Hip marma – balance & walking" },
    { x: 40, y: 80, name: "Janu Marma", text: "Knee marma – leg strength" },
    { x: 60, y: 80, name: "Janu Marma", text: "Knee marma – leg strength" }
  ];

  marmaData.forEach(m => {
    const point = document.createElement("div");
    point.className = "marma-point";
    point.style.left = m.x + "%";
    point.style.top = m.y + "%";

    point.onclick = () => openPopup(m.name, m.text);

    pointsContainer.appendChild(point);
  });
}

// ==============================
//   POPUP FUNCTIONS
// ==============================
function openPopup(title, text) {
  popupTitle.innerText = title;
  popupText.innerText = text;
  popup.classList.remove("hidden");
}

function closePopup() {
  popup.classList.add("hidden");
}

window.closePopup = closePopup;
