import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let renderer, scene, camera, ball, initialRotation, generatedCoins = 0, attachedCoins = 0; // Declaring variables for coins
let gameEnded = false; // Variable to track game ending
let coins = []; // Array to store coin meshes

// Parameters for the damping effect
const dampingFactor = 0.05; // Reduced damping for smoother effect
const dampingThreshold = 0; // Increased threshold for smoother snapping

window.init = async () => {
    // Initialize renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize scene
    scene = new THREE.Scene();

    // Initialize camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 150, 500); // Adjusted camera position
    scene.add(camera);

    // Load sand texture
    const sandTexture = new THREE.TextureLoader().load('/assets/sand.jpg');

    // Create the 3D box with sand texture
    const squareSize = 450;
    const boxGeometry = new THREE.BoxGeometry(squareSize, 1, squareSize);
    const boxMaterial = new THREE.MeshBasicMaterial({ map: sandTexture }); // Use sand texture
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Create a grid on the square
    const gridGap = squareSize / 10; // Gap between grid squares
    const gridCount = 10; // Number of grid squares
    const gridOffset = (gridCount - 1) * gridGap / 2; // Offset to center the grid
    const gridPositions = [];
    for (let i = 0; i < gridCount; i++) {
        for (let j = 0; j < gridCount; j++) {
            const posX = i * gridGap - gridOffset;
            const posZ = j * gridGap - gridOffset;
            gridPositions.push({ x: posX, z: posZ });
        }
    }

    // Create gold coins at each intersection of the grid
    const coinGeometry = new THREE.CylinderGeometry(5, 5, 1, 32); // Coin geometry (cylinder)
    const coinMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Gold color
    gridPositions.forEach(({ x, z }) => {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.position.set(x, 7, z); // Set y-coordinate to 7 to place coins on the surface
        coin.rotation.x = Math.PI / 2; // Adjust rotation to stand upright
        generatedCoins++; // Increment generated coins count
        coins.push(coin); // Push coin into coins array
        scene.add(coin);
    });

    // Load texture image for the ball
    const textureLoader = new THREE.TextureLoader();
    const ballTexture = textureLoader.load('/assets/ball.jpg');

    // Initialize ball object with optimized sphere geometry
    const ballGeometry = new THREE.SphereGeometry(14, 100, 100); // Reduced segments
    const ballMaterial = new THREE.MeshBasicMaterial({ map: ballTexture }); // Use MeshBasicMaterial for texture mapping
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.y = 15;
    ball.position.z = 0;
    scene.add(ball);

    // Store the initial rotation state of the ball
    initialRotation = ball.rotation.clone();

    // Set up input controls
    document.addEventListener('keydown', handleKeyDown);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;

    // Start rendering
    animate();
};

// Function to handle keyboard input
function handleKeyDown(event) {
    const speed = 10;
    const rotationSpeed = 0.3;
    const squareSize = 450;
    const ballRadius = 14;

    switch (event.key) {
        case 'ArrowUp':
            if (ball.position.z - speed - ballRadius >= -squareSize / 2) {
                moveBall(0, -speed);
                rotateBall(-rotationSpeed, 0);
                checkCollision();
            }
            break;
        case 'ArrowDown':
            if (ball.position.z + speed + ballRadius <= squareSize / 2) {
                moveBall(0, speed);
                rotateBall(rotationSpeed, 0);
                checkCollision();
            }
            break;
        case 'ArrowLeft':
            if (ball.position.x - speed - ballRadius >= -squareSize / 2) {
                moveBall(-speed, 0);
                rollBall(rotationSpeed);
                checkCollision();
            }
            break;
        case 'ArrowRight':
            if (ball.position.x + speed + ballRadius <= squareSize / 2) {
                moveBall(speed, 0);
                rollBall(-rotationSpeed);
                checkCollision();
            }
            break;
    }
}

// Function to move the ball
function moveBall(dx, dz) {
    ball.position.x += dx;
    ball.position.z += dz;
}

// Function to rotate the ball
function rotateBall(dx, dy) {
    ball.rotation.x += dx;
    ball.rotation.y += dy;
}

// Function to roll the ball
function rollBall(rotationSpeed) {
    ball.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), rotationSpeed);
}

// Function to check collision between the ball and coins
function checkCollision() {
    if (gameEnded) return; // If the game has already ended, return early

    coins.forEach(coin => {
        const distance = ball.position.distanceTo(coin.position);
        if (distance < 20 && !coin.attached) { // Adjust this value as needed for the collision detection threshold
            // Calculate the offset between the coin and the ball
            const offset = new THREE.Vector3().subVectors(coin.position, ball.position);
            ball.add(coin); // Attach the coin to the ball
            coin.position.copy(offset); // Set the coin's position relative to the ball
            coin.attached = true; // Mark coin as attached
            attachedCoins++; // Increment attached coins count
        }
    });

    if (attachedCoins === generatedCoins) {
        gameEnded = true; // Update gameEnded variable
        showGameEndedPopup();
    }
}

// Function to show the game ended popup
function showGameEndedPopup() {
    // Create a popup element
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = 'Game Ended!';
    
    // Add styles to the popup
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.background = 'rgba(255, 255, 255, 0.9)';
    popup.style.border = '2px solid black';
    popup.style.borderRadius = '10px';
    popup.style.fontSize = '24px';
    popup.style.fontWeight = 'bold';
    
    // Append the popup to the document body
    document.body.appendChild(popup);
}

// Function to remove the popup
function removeGameEndedPopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

// Apply the damping effect to the camera movement
function applyDampingEffect() {
    const targetPosition = ball.position.clone().add(new THREE.Vector3(0, 30, 100));
    const displacement = new THREE.Vector3().subVectors(targetPosition, camera.position);
    
    // Adjust damping factor for smoother effect
    const dampingForce = displacement.multiplyScalar(dampingFactor);
    camera.position.add(dampingForce);
    camera.lookAt(ball.position);

    // Check if damping is complete
    if (displacement.length() < dampingThreshold) {
        camera.position.copy(targetPosition); // Snap to target position
    }
}

// Animate the rotation of the gold coins
function animateCoins(coins) {
    coins.forEach(coin => {
        coin.rotation.y += 0.03; // Adjust rotation speed as needed
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Apply damping effect to camera movement
    applyDampingEffect();

    // Animate rotation of gold coins
    animateCoins(coins);

    // Render the scene
    renderer.render(scene, camera);
}
