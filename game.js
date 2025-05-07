const cubes = document.querySelectorAll('.cube');
const startButton = document.getElementById('start-btn');
const messageBox = document.getElementById('result-number');
const tickSound = document.getElementById('tickSound');

function getRandomNumber() {
    return Math.floor(Math.random() * 10);
}

function animateCube(cube, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
        	cube.classList.add('rotate');
                    setTimeout(() => {
                        const randomNumber = getRandomNumber();
                        const faces = cube.querySelectorAll('.face');
                        faces.forEach(face => {
                            face.textContent = randomNumber;
                        });
                        cube.classList.remove('rotate');
                        resolve(randomNumber);
                    }, 100);
                }, delay);
            });
        }

        async function startRandom() {
            startButton.disabled = true;
            showMessage('Đang quay...');
            tickSound.currentTime = 0;
            tickSound.play();

            cubes.forEach(cube => cube.classList.add('rotate'));

            const results = [];
            for (let i = 0; i < cubes.length; i++) {
                const result = await animateCube(cubes[i], i * 2500);
                results.push(result);
            }

            showMessage(`0  0  0 ${results.join('  ')}`);
			startFireworks(); // Bắt đầu pháo hoa sau khi quay xong
            setTimeout(() => {
                messageBox.classList.remove('show-message');
				stopFireworks(); // Dừng pháo hoa sau khi hiển thị kết quả
            }, 5000);
            startButton.disabled = false;
        }

        function showMessage(message) {
            messageBox.textContent = message;
            messageBox.classList.add('show-message');
        }

        startButton.addEventListener('click', startRandom);

        // cubes.forEach(cube => {
        //     const faces = cube.querySelectorAll('.face');
        //     faces.forEach(face => {
        //         face.textContent = "";
        //     });
        // });


// Quay tự động lúc vào trang
// window.onload = spinNumbers;


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
      document.body.style.backgroundColor = '#fff';
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
  function uploadBackground() {
    const fileInput = document.getElementById("bg-file");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;
            document.body.style.backgroundImage = `url('${imageUrl}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';

            // Lưu URL vào localStorage
            localStorage.setItem('backgroundImage', imageUrl);
            // Hoặc sử dụng sessionStorage nếu bạn muốn xóa khi đóng tab
            // sessionStorage.setItem('backgroundImage', imageUrl);
        };
        reader.readAsDataURL(file);
    }
}

// Hàm để tải hình nền đã lưu (gọi khi trang web tải)
function loadSavedBackground() {
    const savedImage = localStorage.getItem('backgroundImage');
    // Hoặc:  const savedImage = sessionStorage.getItem('backgroundImage');
    if (savedImage) {
        document.body.style.backgroundImage = `url('${savedImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Gọi hàm loadSavedBackground khi trang web tải
window.onload = loadSavedBackground;



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
	this.coordinates = Array.from({length: 3}, () => [sx, sy]);
	this.angle = Math.atan2(ty - sy, tx - sx);
	this.speed = 2;
	this.acceleration = 1.05;
	this.brightness = random(50, 70);
	this.targetRadius = 1;
}
Firework.prototype.update = function(index) {
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
Firework.prototype.draw = function() {
	ctx.beginPath();
	const last = this.coordinates[this.coordinates.length - 1];
	ctx.moveTo(last[0], last[1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
	ctx.stroke();
};

function Particle(x, y) {
	this.x = x; this.y = y;
	this.coordinates = Array.from({length: 5}, () => [x, y]);
	this.angle = random(0, Math.PI * 2);
	this.speed = random(1, 10);
	this.friction = 0.95;
	this.gravity = 0.6;
	this.hue = random(hue - 20, hue + 20);
	this.brightness = random(50, 80);
	this.alpha = 1;
	this.decay = random(0.0075, 0.009);
}
Particle.prototype.update = function(index) {
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
Particle.prototype.draw = function() {
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
	setTimeout(stopFireworks, 10000); // Dừng sau 10 giây
}
function stopFireworks() {
	isRunning = false;
	cancelAnimationFrame(animationId);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	fireworks = [];
	particles = [];
}
