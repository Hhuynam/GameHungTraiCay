import "./style.css";
import Phaser from "phaser";

const sizes = { width: 500, height: 500 };
const speedDown = 300;
let isPaused = false;

const gameCanvas = document.getElementById("gameCanvas");
const startMenu = document.getElementById("startMenu");
const startGameBtn = document.getElementById("startGameBtn");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtn = document.getElementById("menuBtn");

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player = null;
    this.target = null;
    this.points = 0;
    this.cursor = null;
    this.textScore = null;
  }

  preload() {
    this.load.image("bg", "/assets/bg.png");
    this.load.image("basket", "/assets/basket.png");
    this.load.image("apple", "/assets/apple.png");
    this.load.audio("coin", "/assets/coin.mp3"); // Âm thanh khi hứng táo
    this.load.audio("bgMusic", "/assets/bgMusic.mp3"); // Nhạc nền
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.playTime = 0;
    this.textTime = this.add.text(10, 40, "Time: 0s", { font: "25px Arial", fill: "#ffffff" });

    // Khởi tạo âm thanh
    this.coinMusic = this.sound.add("coin");
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play(); // Bắt đầu phát nhạc nền

    // Tạo giỏ hứng
    this.player = this.physics.add.image(sizes.width / 2, sizes.height - 100, "basket").setOrigin(0.5, 0);
    this.player.setCollideWorldBounds(true);

    // Táo rơi
    this.target = this.physics.add.image(this.getRandomX(), 0, "apple").setOrigin(0.5, 0);
    this.target.setVelocityY(speedDown);

    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(10, 10, "Score: 0", { font: "25px Arial", fill: "#ffffff" });

    this.scene.pause("scene-game"); // Dừng game khi bắt đầu
  }

  update(time, delta) {
    if (isPaused) return;

    // Cập nhật thời gian chơi (tăng theo mili giây)
    this.playTime += delta / 1000;
    this.textTime.setText(`Time: ${Math.floor(this.playTime)}s`);

    // Xử lý di chuyển giỏ
    const { left, right } = this.cursor;
    if (left.isDown) {
      this.player.setVelocityX(-300);
    } else if (right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // Xử lý táo rơi
    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * (sizes.width - 20)) + 10;
  }

  targetHit() {
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);

    this.coinMusic.play(); // Phát âm thanh khi bắt táo
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  }
}

// Cấu hình game
const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
  scene: [GameScene],
};

// Khởi động game
const game = new Phaser.Game(config);
const gameScene = game.scene.getScene("scene-game");

pauseBtn.addEventListener("click", () => {
  game.scene.pause("scene-game");
  isPaused = true;
  showStatus("Game Paused"); // Hiển thị thông báo
});

resumeBtn.addEventListener("click", () => {
  game.scene.resume("scene-game");
  isPaused = false;
  showStatus("Game Resumed"); // Hiển thị thông báo
});

menuBtn.addEventListener("click", () => {
  game.scene.pause("scene-game");
  startMenu.style.display = "flex";
  isPaused = true;
  showStatus("Back to Menu"); // Hiển thị thông báo
});

startGameBtn.addEventListener("click", () => {
  startMenu.style.display = "none";
  game.scene.resume("scene-game");
  gameScene.bgMusic.play(); // Chạy nhạc nền khi bắt đầu game
});

menuBtn.addEventListener("click", () => {
  gameScene.restartGame(); // Khởi động lại game
  game.scene.pause("scene-game");
  startMenu.style.display = "flex";
  isPaused = true;
  gameScene.bgMusic.stop(); // Truy cập nhạc nền từ gameScene

  // Hiển thị điểm số & thời gian đã chơi
  alert(`Điểm số: ${gameScene.points}\nThời gian chơi: ${Math.floor(gameScene.playTime)}s`);
});

const statusDiv = document.getElementById("statusDiv");

function showStatus(message) {
  statusDiv.textContent = message;
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 2000);
}
s