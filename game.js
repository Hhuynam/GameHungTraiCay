//game.js
import { GameScene } from './gamescene.js';
import { languageData } from './language.js';
import { setupHandsTracking, setupWebcamToggle } from './handsModule.js';
const canvasElement = document.getElementById("canvas");
const toggleBtn = document.getElementById("Nut_Webcam");
const hands = setupHandsTracking(canvasElement, toggleBtn);
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
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
  if (game) game.destroy(true);
});
updateTexts();
