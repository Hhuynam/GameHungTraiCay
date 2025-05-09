import { getCurrentHandX } from './handsModule.js';
import { languageData } from './language.js';
import { saveScore } from './firebaseModule.js';
export class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.player;
        this.target;
        this.cursor;
        this.score = 0;
        this.timeElapsed = 0;
        this.scoreText;
        this.timeText;
        this.controlText;
        this.mode = localStorage.getItem("gameMode") || "free";
        this.remainingTime = 60;
        this.timerText;
        this.gameEnded = false;
    }
    preload() {
        this.load.image("bg", "assets/caytao.png");
        this.load.image("basket", "assets/basket.png");
        this.load.image("apple", "assets/apple.png");
        this.load.audio("bgMusic", "assets/bgMusic.mp3");
        this.load.audio("coinSound", "assets/coin.mp3");
    }
    create() {
        this.leftPressed = false;
        this.rightPressed = false;
        // Sự kiện cảm ứng
        const leftBtn = document.getElementById("btn-left");
        const rightBtn = document.getElementById("btn-right");
        leftBtn?.addEventListener("touchstart", () => {
            this.leftPressed = true;
            console.log("Nút trái nhấn");
        });
        leftBtn?.addEventListener("touchend", () => {
            this.leftPressed = false;
            console.log("Nút trái nhả");
        });
        rightBtn?.addEventListener("touchstart", () => {
            this.rightPressed = true;
            console.log("Nút phải nhấn");
        });
        rightBtn?.addEventListener("touchend", () => {
            this.rightPressed = false;
            console.log("Nút phải nhả");
        });        
        // Logic phát nhạc
        this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
        this.bgMusic.play();
        if (this.mode === "60s") {
            this.timerText = this.add.text(300, 10, "60", {
                fontSize: "22px",
                fill: "#ff3333",
                stroke: "#000",
                strokeThickness: 2
            });
        }
        // Logic thay đổi ngôn ngữ 
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.player = this.physics.add.image(0, 500, "basket").setCollideWorldBounds(true);
        this.target = this.physics.add.image(Math.random() * 500, 0, "apple").setVelocityY(50);
        this.cursor = this.input.keyboard.createCursorKeys();
        this.scoreText = this.add.text(10, 10, `${texts.score}: 0`, {
            fontSize: "22px",
            fill: "#ffcc00",
            stroke: "#000",
            strokeThickness: 2
        });
        this.timeText = this.add.text(10, 40, `${texts.time}: 0s`, {
            fontSize: "20px",
            fill: "#66ff99",
            stroke: "#000",
            strokeThickness: 2
        });
        this.controlText = this.add.text(10, 70, "", {
            fontSize: "18px",
            fill: "#ffffff",
            strokeThickness: 1
        });
        this.modeText = this.add.text(10, 100, "", {
            fontSize: "18px",
            fill: "#ffffff",
            strokeThickness: 1
        });
        this.physics.add.overlap(this.player, this.target, this.catchApple, null, this);
    }
    update() {
        //Logic hiển thị ngôn ngữ lựa chọn
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        const controlType = localStorage.getItem("controlType") || "keyboard";
        this.controlText.setText(`${texts.control}: ${controlType === "keyboard" ? texts.keyboard : texts.handtracking}`);
        this.modeText.setText(`Chế độ: ${this.mode === "60s" ? "60 Giây" : "Tự Do"}`);
        if (this.mode === "60s" && !this.gameEnded) {
            this.remainingTime -= this.game.loop.delta / 1000;
            if (this.remainingTime <= 0) {
                this.remainingTime = 0;
                this.endGame();
            }
            this.timeText.setText(`${texts.time}: ${Math.floor(this.remainingTime)}s`);
        } else {
            this.timeElapsed += this.game.loop.delta / 1000;
            this.timeText.setText(`${texts.time}: ${Math.floor(this.timeElapsed)}s`);
        }
        //Điều khiển bằng nút ảo 
        if (controlType === "virtualButtons") {
            if (this.leftPressed) {
                this.player.setVelocityX(-200);
                console.log("Giỏ đang di chuyển sang trái");
            } else if (this.rightPressed) {
                this.player.setVelocityX(200);
                console.log("Giỏ đang di chuyển sang phải");
            } else {
                this.player.setVelocityX(0);
                console.log("Giỏ dừng lại");
            }
        }
        if (controlType === "handtracking") {
            const handX = getCurrentHandX();
            const canvasWidth = this.sys.canvas.width;
            const targetX = handX * canvasWidth;
            this.player.x = Phaser.Math.Linear(this.player.x, Phaser.Math.Clamp(targetX, 0 + this.player.width / 2, canvasWidth - this.player.width / 2), 0.2);
            this.player.setVelocityX(0);
        } 
        else {
            if (this.cursor.left.isDown || this.leftPressed) {
                this.player.setVelocityX(-200);
            } else if (this.cursor.right.isDown || this.rightPressed) {
                this.player.setVelocityX(200);
            } else {
                this.player.setVelocityX(0);
            }
        }
        if (this.target.y >= 500) {
            this.target.setY(0);
            this.target.setX(Math.random() * 500);
        }
    }
    catchApple() {
        this.sound.play("coinSound", { volume: 1 });
        this.score += 10;
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.scoreText.setText(`${texts.score}: ${this.score}`);
        this.target.setY(0);
        this.target.setX(Math.random() * 500);
    }
    endGame() {
        this.gameEnded = true;
        this.physics.pause();
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        const duration = Math.floor(this.timeElapsed);
        const playerName = prompt("Nhập tên:");
        if (playerName) {
            saveScore(playerName, this.score);
        }
        this.add.text(150, 220, `Kết thúc!\n${texts.score}: ${this.score}`, {
            fontSize: "28px",
            fill: "#ffffff",
            align: "center",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
    }
}
//Hàm lưu dữ liệu lên Firebase
function saveScoreToFirebase(name, score, duration) {
    fetch('https://gamehungtraicay-d301f-default-rtdb.asia-southeast1.firebasedatabase.app/scores.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            score: score,
            duration: duration,
            time: Date.now()
        })
    })
    .then(res => res.json())
    .then(data => console.log("Điểm đã được lưu:", data))
    .catch(err => console.error("Lỗi khi lưu điểm:", err));
}