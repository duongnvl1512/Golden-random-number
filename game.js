const itemContainers = document.querySelectorAll('.item-container');
const heartImages = document.querySelectorAll('.heart-img');
const numberDisplays = document.querySelectorAll('.number');
const startButton = document.getElementById('start-btn');
const messageBox = document.getElementById('result-number');
const tickSound = document.getElementById('tickSound');

function getRandomNumber() {
    return Math.floor(Math.random() * 10);
}

function initializeNumbers() {
    numberDisplays.forEach(display => {
        display.textContent = 0;
    });
    heartImages.forEach(img => {
        img.classList.add('fade-in');
    });
}

function startNumberAnimation(index) {
    const intervalId = setInterval(() => {
        numberDisplays[index].textContent = getRandomNumber();
    }, 100);
    return intervalId;
}

function stopNumberAnimation(intervalId) {
    clearInterval(intervalId);
}

async function startGame() {
    startButton.disabled = true;
    showMessage('Đang quay...');
    tickSound.currentTime = 0;
    tickSound.play();

    heartImages.forEach(img => {
        img.classList.add('animated-image');
        img.classList.remove('fade-in');
    });

    const numberIntervalIds = [];
    numberDisplays.forEach((display, index) => {
        numberIntervalIds.push(startNumberAnimation(index));
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const results = [0, 0, 0];
    const randomNumber = Math.floor(Math.random() * 351);
    const hundreds = Math.floor(randomNumber / 100);
    const tens = Math.floor((randomNumber % 100) / 10);
    const units = randomNumber % 10;
    results.push(hundreds, tens, units);

    for (let i = 0; i < itemContainers.length; i++) {
        stopNumberAnimation(numberIntervalIds[i]);
        numberDisplays[i].textContent = results[i];
        heartImages[i].classList.remove('animated-image');
        heartImages[i].classList.add('zoom-in'); // Thay đổi thành zoom-in
        await new Promise(resolve => setTimeout(resolve, i * 500));
    }

    showMessage(`Kết quả: ${results.slice(3).map(num => num.toString()).join('')}`);
    startFireworks();

    // Tạo và phát âm thanh kết quả
    const resultSound = new Audio('/assets/result-sound.mp3'); // Đảm bảo bạn có file 'result-sound.mp3'
    resultSound.play();

    setTimeout(() => {
        messageBox.classList.remove('show-message');
        stopFireworks();
    }, 5000);
    startButton.disabled = false;
}

function showMessage(message) {
    messageBox.textContent = message;
    messageBox.classList.add('show-message');
}

// Khởi tạo số ngẫu nhiên khi trang tải
initializeNumbers();

startButton.addEventListener('click', startGame);

// Đổi nền từ dropdown
function changeBackground() {
    const select = document.getElementById("bg-select");
    const url = select.value;

    if (url) {
        document.body.style.backgroundImage = `url('${url}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else {
        document.body.style.backgroundImage = '';
        document.body.backgroundColor = '#fff';
    }
}

// Đổi nền từ URL nhập vào
function setCustomBackground() {
    const url = document.getElementById("bg-url").value.trim();
    if (url) {
        document.body.style.backgroundImage = `url('${url}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Đổi nền từ ảnh upload
function changeBackgroundSelect() {
    const select = document.getElementById("bg-select");
    const url = select.value;
    const styleTag = document.getElementById("dynamic-bg");

    if (url) {
        styleTag.textContent = `body { background-image: url('${url}'); background-size: cover; background-position: center; }`;
        localStorage.setItem('backgroundImageURLSelect', url);
        localStorage.removeItem('backgroundImageURLInput');
        localStorage.removeItem('backgroundImageFile');
    } else {
        styleTag.textContent = `body { background-image: ''; background-color: #fff; }`;
        localStorage.removeItem('backgroundImageURLSelect');
    }
}

function changeBackgroundInput() {
    const inputUrl = document.getElementById("bg-url").value;
    const styleTag = document.getElementById("dynamic-bg");

    if (inputUrl) {
        styleTag.textContent = `body { background-image: url('${inputUrl}'); background-size: cover; background-position: center; }`;
        localStorage.setItem('backgroundImageURLInput', inputUrl);
        localStorage.removeItem('backgroundImageURLSelect');
        localStorage.removeItem('backgroundImageFile');
    } else {
        // Nếu input rỗng, khôi phục background (tùy chọn)
        const savedSelectURL = localStorage.getItem('backgroundImageURLSelect');
        if (savedSelectURL) {
            styleTag.textContent = `body { background-image: url('${savedSelectURL}'); background-size: cover; background-position: center; }`;
        } else {
            styleTag.textContent = `body { background-image: ''; background-color: #fff; }`;
        }
        localStorage.removeItem('backgroundImageURLInput');
    }
}

function uploadBackground() {
    const fileInput = document.getElementById("bg-file");
    const file = fileInput.files[0];
    const styleTag = document.getElementById("dynamic-bg");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;
            styleTag.textContent = `body { background-image: url('${imageUrl}'); background-size: cover; background-position: center; }`;
            localStorage.setItem('backgroundImageFile', imageUrl);
            localStorage.removeItem('backgroundImageURLSelect');
            localStorage.removeItem('backgroundImageURLInput');
        };
        reader.readAsDataURL(file);
    } else {
        const savedSelectURL = localStorage.getItem('backgroundImageURLSelect');
        if (savedSelectURL) {
            styleTag.textContent = `body { background-image: url('${savedSelectURL}'); background-size: cover; background-position: center; }`;
        } else {
            styleTag.textContent = `body { background-image: ''; background-color: #fff; }`;
        }
        localStorage.removeItem('backgroundImageFile');
    }
}

function loadSavedBackground() {
    const savedURLSelect = localStorage.getItem('backgroundImageURLSelect');
    const savedURLInput = localStorage.getItem('backgroundImageURLInput');
    const savedImageFile = localStorage.getItem('backgroundImageFile');
    const styleTag = document.getElementById("dynamic-bg");

    if (savedImageFile) {
        styleTag.textContent = `body { background-image: url('${savedImageFile}'); background-size: cover; background-position: center; }`;
        // Cập nhật input file (không thể đặt lại giá trị input file vì lý do bảo mật)
    } else if (savedURLInput) {
        styleTag.textContent = `body { background-image: url('${savedURLInput}'); background-size: cover; background-position: center; }`;
        // Cập nhật giá trị input url (tùy chọn nếu bạn có input hiển thị url)
        const urlInput = document.getElementById("bg-url");
        if (urlInput) {
            urlInput.value = savedURLInput;
        }
    } else if (savedURLSelect) {
        styleTag.textContent = `body { background-image: url('${savedURLSelect}'); background-size: cover; background-position: center; }`;
        // Cập nhật giá trị dropdown (tùy chọn nếu bạn muốn dropdown hiển thị lựa chọn đã lưu)
        const selectElement = document.getElementById("bg-select");
        if (selectElement) {
            selectElement.value = savedURLSelect;
        }
    } else {
        styleTag.textContent = `body { background-image: ''; background-color: #fff; }`;
    }
}

window.onload = () => {
    // Thêm thẻ style động nếu chưa có
    if (!document.getElementById('dynamic-bg')) {
        const style = document.createElement('style');
        style.id = 'dynamic-bg';
        document.head.appendChild(style);
    }
    loadSavedBackground();
    initializeNumbers(); // Giữ nguyên hàm này nếu nó tồn tại và cần thiết
};

// Thêm event listener cho dropdown và input url (nếu chúng tồn tại trong HTML)
document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById("bg-select");
    if (selectElement) {
        selectElement.addEventListener('change', changeBackgroundSelect);
    }

    const urlInputElement = document.getElementById("bg-url");
    if (urlInputElement) {
        urlInputElement.addEventListener('input', changeBackgroundInput); // Hoặc 'change' tùy theo UX bạn muốn
    }

    const fileInputElement = document.getElementById("bg-file");
    if (fileInputElement) {
        fileInputElement.addEventListener('change', uploadBackground);
    }
});

// Pháo hoa
const canvas = document.getElementById("fireworks-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [], particles = [], hue = 120;
let limiterTotal = 20, limiterTick = 0;
let timerTotal = 500, timerTick = 0;
let mousedown = false, mx, my;
let isRunning = false, animationId = null;

function random(min, max) {
    return Math.random() * (max - min) + min;
}
function calculateDistance(p1x, p1y, p2x, p2y) {
    const x = p1x - p2x, y = p1y - p2y;
    return Math.sqrt(x * x + y * y);
}

function Firework(sx, sy, tx, ty) {
    this.x = sx; this.y = sy; this.sx = sx; this.sy = sy;
    this.tx = tx; this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = Array.from({ length: 3 }, () => [sx, sy]);
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
}
Firework.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    if (this.targetRadius < 8) this.targetRadius += 0.3;
    else this.targetRadius = 1;
    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
    if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty);
        fireworks.splice(index, 1);
    } else {
        this.x += vx;
        this.y += vy;
    }
};
Firework.prototype.draw = function () {
    ctx.beginPath();
    const last = this.coordinates[this.coordinates.length - 1];
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
    ctx.stroke();
};

function Particle(x, y) {
    this.x = x; this.y = y;
    this.coordinates = Array.from({ length: 5 }, () => [x, y]);
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 0.6;
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.0075, 0.009);
}
Particle.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    if (this.alpha <= this.decay) {
        particles.splice(index, 1);
    }
};
Particle.prototype.draw = function () {
    ctx.beginPath();
    const last = this.coordinates[this.coordinates.length - 1];
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();
};

function createParticles(x, y) {
    let count = 20;
    while (count--) {
        particles.push(new Particle(x, y));
    }
}

function loop() {
    if (!isRunning) return;
    animationId = requestAnimationFrame(loop);
    hue += 0.5;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    i = particles.length;
    while (i--) {
        particles[i].draw();
        particles[i].update(i);
    }

    if (timerTick >= timerTotal) {
        timerTick = 0;
    } else {
        let temp = timerTick % 400;
        if (temp <= 15) {
            fireworks.push(new Firework(100, canvas.height, random(190, 200), random(90, 100)));
            fireworks.push(new Firework(canvas.width - 100, canvas.height, random(canvas.width - 200, canvas.width - 190), random(90, 100)));
        }
        if (temp > 319) {
            const temp3 = temp / 10;
            fireworks.push(new Firework(300 + (temp3 - 31) * 100, canvas.height, 300 + (temp3 - 31) * 100, 200));
        }
        timerTick++;
    }
    if (limiterTick >= limiterTotal) {
        if (mousedown) {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, mx, my));
            limiterTick = 0;
        }
    } else {
        limiterTick++;
    }
}

function startFireworks() {
    if (isRunning) return;
    isRunning = true;
    loop();
    setTimeout(stopFireworks, 10000);
}
function stopFireworks() {
    isRunning = false;
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks = [];
    particles = [];
}


// Button Group
// Button Service
// Button Cancel
const refreshLink = document.getElementById('refreshLink');
refreshLink.addEventListener('click', function() {
  location.reload();
});

// Button save
document.addEventListener('DOMContentLoaded', function() {
    const saveResultButton = document.getElementById('saveResultButton');
    const resultNumberDiv = document.getElementById('result-number');
  
    saveResultButton.addEventListener('click', function() {
      const resultValue = resultNumberDiv.textContent.trim();
      const currentTime = new Date().toLocaleString(); // Lấy thời gian hiện tại
      const storedResultsJSON = localStorage.getItem('savedResults');
      let savedResults = storedResultsJSON ? JSON.parse(storedResultsJSON) : [];
  
      // Tạo ID mới bằng cách lấy độ dài của mảng hiện tại
      const newId = savedResults.length + 1;
  
      // Tạo đối tượng mới chứa thông tin cần lưu
      const newResult = {
        id: newId,
        thoiGian: currentTime,
        ketQua: resultValue
      };
  
      // Thêm đối tượng mới vào mảng
      savedResults.push(newResult);
  
      // Lưu mảng đã cập nhật vào localStorage
      localStorage.setItem('savedResults', JSON.stringify(savedResults));
  
      alert(`Đã lưu kết quả với ID ${newId} vào lúc ${currentTime}: ${resultValue}`);
    });
  });

//   Button show list