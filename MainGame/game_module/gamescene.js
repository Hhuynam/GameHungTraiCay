//gamescene.js
import { getCurrentHandX } from './handsModule.js';
import { languageData } from './language.js';
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
        this.remainingTime = 60; // 60s nếu cần
        this.timerText; // sẽ tạo 1 text hiện thời gian đếm ngược
        this.gameEnded = false; // kiểm soát trạng thái kết thúc
    }
    preload() {
        this.load.image("bg", "public/assets/caytao.png");
        this.load.image("basket", "public/assets/basket.png");
        this.load.image("apple", "public/assets/apple.png");
        // Âm thanh game 
        this.load.audio("bgMusic", "public/assets/bgMusic.mp3");
        this.load.audio("coinSound", "public/assets/coin.mp3");
    }
    create() {
        //Âm thanh background
        this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
        this.bgMusic.play();
        if (this.mode === "60s") {
            this.timerText = this.add.text(300, 10, "60", { fontSize: "22px", fill: "#ff3333", stroke: "#000", strokeThickness: 2 });
        }
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.player = this.physics.add.image(0, 500, "basket").setCollideWorldBounds(true);
        this.target = this.physics.add.image(Math.random() * 500, 0, "apple").setVelocityY(50);
        this.cursor = this.input.keyboard.createCursorKeys();
        this.scoreText = this.add.text(10, 10, `${texts.score}: 0`, { fontSize: "22px", fill: "#ffcc00", stroke: "#000", strokeThickness: 2 });
        this.timeText = this.add.text(10, 40, `${texts.time}: 0s`, { fontSize: "20px", fill: "#66ff99", stroke: "#000", strokeThickness: 2 });
        this.controlText = this.add.text(10, 70, "", { fontSize: "18px", fill: "#ffffff", strokeThickness: 1 });
        this.modeText = this.add.text(10, 100, "", { fontSize: "18px", fill: "#ffffff", strokeThickness: 1 });
        this.physics.add.overlap(this.player, this.target, this.catchApple, null, this);
    }
    update() {
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        const savedControlType = localStorage.getItem("controlType") || "keyboard";
        this.controlText.setText(`${texts.control}: ${savedControlType === "keyboard" ? texts.keyboard : texts.handtracking}`);
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
        const controlType = localStorage.getItem("controlType") || "keyboard";
        if (controlType === "handtracking") {
            const handX = getCurrentHandX(); // [0, 1] là tỉ lệ so với khung hình webcam
            const canvasWidth = this.sys.canvas.width;
            const targetX = handX * canvasWidth;
            this.player.x = Phaser.Math.Clamp(targetX, 0 + this.player.width / 2, canvasWidth - this.player.width / 2);
            this.player.setVelocityX(0); // giữ đứng yên theo trục X vì ta cập nhật trực tiếp
        } else {
            if (this.cursor.left.isDown) {
                this.player.setVelocityX(-200);
            } else if (this.cursor.right.isDown) {
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
        //Âm thanh khi bắt táo 
        this.sound.play("coinSound", { volume: 1 });
        this.score += 10;
        this.scoreText.setText(`${languageData.vi.score}: ${this.score}`);
        this.target.setY(0);
        this.target.setX(Math.random() * 500);
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.score += 10;
        this.scoreText.setText(`${texts.score}: ${this.score}`);
        this.target.setY(0);
        this.target.setX(Math.random() * 500);
    }
    endGame() {
        this.gameEnded = true;
        this.physics.pause();
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.add.text(150, 220, `Kết thúc!\n${texts.score}: ${this.score}`, {
            fontSize: "28px",
            fill: "#ffffff",
            align: "center",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
    }
}