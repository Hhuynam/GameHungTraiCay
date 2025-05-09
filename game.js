//game.js
import { GameScene } from './gamescene.js';
import { languageData } from './language.js';
import { getTopScores } from './firebaseModule.js';
import { saveScore } from './firebaseModule.js';
import { setupHandsTracking, setupWebcamToggle } from './handsModule.js';
const canvasElement = document.getElementById("canvas");
const toggleBtn = document.getElementById("Nut_Webcam");
const hands = setupHandsTracking(canvasElement, toggleBtn);
const selectedControl = document.querySelector('input[name="controlType"]:checked').value;
localStorage.setItem("controlType", selectedControl);
setupWebcamToggle(toggleBtn, hands);
let game;
let speedDown = 50;
let basketSpeed = 200;
function updateTexts() {
  const lang = localStorage.getItem("language") || "vi";
  const texts = languageData[lang];
  document.getElementById("gameTitle").innerText = texts.title;
  document.getElementById("startGameBtn").innerText = texts.startGame;
  document.getElementById("settingsBtn").innerText = texts.settings;
  document.getElementById("fallSpeedLabel").childNodes[0].textContent = texts.fallSpeed + " ";
  document.getElementById("basketSpeedLabel").childNodes[0].textContent = texts.basketSpeed + " ";
  document.getElementById("controlTypeTitle").innerText = texts.controlType;
  document.getElementById("keyboardLabel").innerText = texts.keyboard;
  document.getElementById("handtrackingLabel").innerText = texts.handtracking;
  document.getElementById("languageSelectTitle").innerText = texts.languageSelect;
  document.getElementById("saveSettingsBtn").innerText = texts.save;
  document.getElementById("backToMenuBtn").innerText = texts.back;
  document.getElementById("returnToMenuBtn").innerText = texts.returnMenu;
}
document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("settings").style.display = "block";
});
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  speedDown = parseInt(document.getElementById("speedSlider").value);
  basketSpeed = parseInt(document.getElementById("basketSpeedSlider").value);
  const selectedControl = document.querySelector('input[name="controlType"]:checked').value;
  const selectedLanguage = document.getElementById("languageSelect").value;
  const selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
  localStorage.setItem("gameMode", selectedGameMode);
  localStorage.setItem("controlType", selectedControl);
  localStorage.setItem("fallSpeed", speedDown);
  localStorage.setItem("basketSpeed", basketSpeed);
  localStorage.setItem("language", selectedLanguage);
  updateTexts();
  alert("Cài đặt đã được lưu!");
});
document.getElementById("backToMenuBtn").addEventListener("click", () => {
  document.getElementById("settings").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
});
document.getElementById("startGameBtn").addEventListener("click", () => {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  if (game) game.destroy(true);
  game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: 500,
    height: 500,
    canvas: document.querySelector("#gameCanvas"),
    physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
    scene: [GameScene],
  });
});
document.getElementById("returnToMenuBtn").addEventListener("click", () => {
  // Ẩn game, hiện menu
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
  
  // Xoá game nếu tồn tại
  if (game) game.destroy(true);
  
  // 👉 Gọi lại leaderboard ngay
  loadLeaderboard();
});
updateTexts();
//Bảng xếp hạng
async function loadLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "<li>Đang tải...</li>";
  try {
    const scores = await getTopScores();
    if (scores.length === 0) {
      list.innerHTML = "<li>Chưa có dữ liệu.</li>";
      return;
    }
    list.innerHTML = "";
    scores.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${entry.name} - ${entry.score} điểm`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Lỗi khi tải bảng xếp hạng:", err);
    list.innerHTML = "<li>Lỗi khi tải dữ liệu.</li>";
  }
}