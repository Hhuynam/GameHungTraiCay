//canvas handgesture feedback
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const toggleBtn = document.getElementById("Nut_Webcam");
// Khởi tạo MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks) => {
            // Vẽ các điểm nối bàn tay
            canvasCtx.strokeStyle = "yellow";
            canvasCtx.lineWidth = 2;
            for (let i = 0; i < landmarks.length - 1; i++) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(landmarks[i].x * canvasElement.width, landmarks[i].y * canvasElement.height);
                canvasCtx.lineTo(landmarks[i + 1].x * canvasElement.width, landmarks[i + 1].y * canvasElement.height);
                canvasCtx.stroke();
            }

            // Hiển thị từng điểm landmark nhỏ màu đỏ
            canvasCtx.fillStyle = "red";
            landmarks.forEach((landmark) => {
                canvasCtx.beginPath();
                canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 2, 0, 2 * Math.PI);
                canvasCtx.fill();
            });
        });
    }
});
// Xử lý nút bật/tắt webcam
let streamActive = false;
let camera;
toggleBtn.addEventListener("click", () => {
    if (!streamActive) {
        const videoElement = document.createElement("video");
        videoElement.width = 640;
        videoElement.height = 480;

        camera = new Camera(videoElement, {
            onFrame: async () => await hands.send({ image: videoElement }),
            width: 640,
            height: 480
        });
        camera.start();
        toggleBtn.textContent = "Tắt Webcam";
        toggleBtn.classList.add("active"); // Đổi màu sang đỏ khi bật
        console.log("Webcam BẬT - Đã thêm class 'active'");
        streamActive = true;
    } else {
        camera.stop();
        toggleBtn.textContent = "Bật Webcam";
        toggleBtn.classList.remove("active"); // Đổi màu sang trắng khi tắt
        console.log("Webcam TẮT - Đã xóa class 'active'");
        streamActive = false;
    }
});
