const canvas = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const dotGeometry = new THREE.SphereGeometry(0.05, 32, 32);
const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0x4444ff, emissiveIntensity: 0.8 });
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 });

const dots = [];
const lines = [];
let lastDot = null;
let connectedDots = [];
let progressCounter = 0;
const dotCount = 5; // Number of dots to generate

// Generate random positions for dots
function generateRandomPosition() {
    return {
        x: (Math.random() * 2 - 1) * 0.7, // Random X position within range
        y: (Math.random() * 2 - 1) * 0.7, // Random Y position within range
        z: 0
    };
}

// Create dots based on random positions
for (let i = 0; i < dotCount; i++) {
    const pos = generateRandomPosition();
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(pos.x, pos.y, pos.z);
    dots.push(dot);
    scene.add(dot);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(dots);

    if (intersects.length > 0) {
        const clickedDot = intersects[0].object;

        if (lastDot && !connectedDots.includes(clickedDot)) {
            const points = [];
            points.push(lastDot.position);
            points.push(clickedDot.position);

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);

            lines.push(line);
            scene.add(line);

            connectedDots.push(clickedDot);
            progressCounter++;
            updateProgress();

            animateLine(line, points);
        } else if (!lastDot) {
            connectedDots.push(clickedDot);
        }

        lastDot = clickedDot;
        checkWinCondition();
    }
}

function updateProgress() {
    document.getElementById('progress').textContent = `${progressCounter} Connections Made`;
}

function animateLine(line, points) {
    const animationSpeed = 0.05;
    let progress = 0;

    function draw() {
        progress += animationSpeed;

        if (progress > 1) progress = 1;

        const interpolatedPoints = new THREE.Vector3().lerpVectors(points[0], points[1], progress);
        const updatedPoints = [points[0], interpolatedPoints];

        line.geometry.setFromPoints(updatedPoints);

        if (progress < 1) {
            requestAnimationFrame(draw);
        }
    }

    draw();
}

function checkWinCondition() {
    if (connectedDots.length === dots.length) {
        const winProbability = Math.random() <= 0.6;
        if (winProbability) {
            document.getElementById('overlay').textContent = 'You Won!';
            playWinAnimation();
        } else {
            document.getElementById('overlay').textContent = 'Try Again!';
            resetGame();
        }
    }
}

function playWinAnimation() {
    dots.forEach(dot => {
        dot.material.emissive.setHex(0x00ff00);
    });

    setTimeout(() => resetGame(), 2000);
}

function resetGame() {
    lines.forEach(line => scene.remove(line));
    lines.length = 0;
    connectedDots.length = 0;
    lastDot = null;
    progressCounter = 0;
    updateProgress();

    dots.forEach(dot => {
        dot.material.emissive.setHex(0x4444ff);
    });

    document.getElementById('overlay').textContent = 'Connect the Dots!';
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(dots);

    dots.forEach(dot => {
        dot.material.emissiveIntensity = 0.8; // Default glow
    });

    if (intersects.length > 0) {
        intersects[0].object.material.emissiveIntensity = 1.5; // Highlight glow
    }
}

function animate() {
    requestAnimationFrame(animate);

    dots.forEach(dot => {
        dot.rotation.x += 0.01;
        dot.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

camera.position.z = 2;
animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

window.addEventListener('click', onMouseClick);
window.addEventListener('mousemove', onMouseMove);
