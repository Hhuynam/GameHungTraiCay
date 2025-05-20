// gamescene.js
import { getCurrentHandX } from './handsModule.js';
import { languageData } from './language.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        // Khai báo biến instance
        this.player = null;
        this.target = null;
        this.cursor = null;
        this.score = 0;
        this.timeElapsed = 0;
        this.scoreText = null;
        this.timeText = null;
        this.controlText = null;
        this.mode = localStorage.getItem("gameMode") || "free";
        this.remainingTime = 60; // 60 giây nếu chế độ đếm ngược
        this.timerText = null;
        this.gameEnded = false;
        // Lấy tốc độ rơi từ localStorage và chuyển sang số nguyên
        this.fallSpeed = parseInt(localStorage.getItem("fallSpeed")) || 50;
    }

    preload() {
        this.load.image("bg", "public/assets/caytao.png");
        this.load.image("basket", "public/assets/basket.png");
        this.load.image("apple", "public/assets/apple.png");
        // Load âm thanh cho game
        this.load.audio("bgMusic", "public/assets/bgMusic.mp3");
        this.load.audio("coinSound", "public/assets/coin.mp3");
    }

    create() {
        // Thêm ảnh nền tại vị trí (0,0)
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        
        // Tạo đối tượng player (giỏ táo)
        this.player = this.physics.add.image(0, 500, "basket").setCollideWorldBounds(true);
        
        // Tạo đối tượng target (táo) và đặt vận tốc rơi ban đầu theo fallSpeed
        this.target = this.physics.add.image(Math.random() * 500, 0, "apple");
        this.target.setVelocityY(this.fallSpeed);
        
        // Thiết lập bàn phím
        this.cursor = this.input.keyboard.createCursorKeys();

        // Lấy ngôn ngữ từ localStorage hoặc mặc định tiếng Việt
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];

        // Khởi tạo văn bản hiển thị điểm số, thời gian, v.v.
        this.scoreText = this.add.text(10, 10, `${texts.score}: 0`, { fontSize: "22px", fill: "#ffcc00", stroke: "#000", strokeThickness: 2 });
        this.timeText = this.add.text(10, 40, `${texts.time}: 0s`, { fontSize: "20px", fill: "#66ff99", stroke: "#000", strokeThickness: 2 });
        this.controlText = this.add.text(10, 70, "", { fontSize: "18px", fill: "#ffffff", strokeThickness: 1 });
        this.modeText = this.add.text(10, 100, "", { fontSize: "18px", fill: "#ffffff", strokeThickness: 1 });

        // Nếu chế độ là "60s", tạo thêm timer text ở góc
        if (this.mode === "60s") {
            this.timerText = this.add.text(300, 10, "60", { fontSize: "22px", fill: "#ff3333", stroke: "#000", strokeThickness: 2 });
        }

        // Thiết lập va chạm giữa player và target
        this.physics.add.overlap(this.player, this.target, this.catchApple, null, this);

        // Thêm âm thanh nền và phát nhạc
        this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
        this.bgMusic.play();
    }

    update() {
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];

        // Cập nhật tốc độ rơi nếu giá trị trong localStorage thay đổi
        const newFallSpeed = parseInt(localStorage.getItem("fallSpeed")) || 50;
        if (this.fallSpeed !== newFallSpeed && this.target) {
            this.fallSpeed = newFallSpeed;
            this.target.setVelocityY(this.fallSpeed);
        }

        // Cập nhật văn bản điều khiển dựa trên chế độ (keyboard/handtracking)
        const savedControlType = localStorage.getItem("controlType") || "keyboard";
        this.controlText.setText(`${texts.control}: ${savedControlType === "keyboard" ? texts.keyboard : texts.handtracking}`);
        this.modeText.setText(`Chế độ: ${this.mode === "60s" ? "60 Giây" : "Tự Do"}`);

        // Cập nhật đồng hồ đếm thời gian
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
        
        // Điều khiển di chuyển của player (giỏ) theo kiểu điều khiển đã chọn
        const controlType = localStorage.getItem("controlType") || "keyboard";
        if (controlType === "handtracking") {
            const handX = getCurrentHandX(); // Giá trị tỉ lệ từ 0 đến 1 của khung hình webcam
            const canvasWidth = this.sys.canvas.width;
            const targetX = handX * canvasWidth;
            this.player.x = Phaser.Math.Clamp(targetX, this.player.width / 2, canvasWidth - this.player.width / 2);
            this.player.setVelocityX(0);
        } else {
            if (this.cursor.left.isDown) {
                this.player.setVelocityX(-200);
            } else if (this.cursor.right.isDown) {
                this.player.setVelocityX(200);
            } else {
                this.player.setVelocityX(0);
            }
        }

        // Nếu táo vượt quá đáy màn hình (y >= 500), reset vị trí táo
        if (this.target.y >= 500) {
            this.target.setY(0);
            this.target.setX(Math.random() * 500);
        }
    }

    catchApple() {
        // Phát âm thanh coin khi bắt được táo
        this.sound.play("coinSound", { volume: 1 });
        
        // Tăng điểm và cập nhật văn bản điểm số lên màn hình
        this.score += 10;
        const lang = localStorage.getItem("language") || "vi";
        const texts = languageData[lang];
        this.scoreText.setText(`${texts.score}: ${this.score}`);
        
        // Reset vị trí của táo khi được bắt
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
