import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let renderer, scene, camera, ball, initialRotation;

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
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  // Create the 3D box with yellow color
  const squareSize = 360;
  const boxGeometry = new THREE.BoxGeometry(squareSize, 5, squareSize);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(box);

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
  const speed = 2.5;
  const rotationSpeed = 0.3;
  const squareSize = 360;
  const ballRadius = 14;

  switch (event.key) {
    case 'ArrowUp':
      if (ball.position.z - speed - ballRadius >= -squareSize / 2) {
        moveBall(0, -speed);
        rotateBall(-rotationSpeed, 0);
      }
      break;
    case 'ArrowDown':
      if (ball.position.z + speed + ballRadius <= squareSize / 2) {
        moveBall(0, speed);
        rotateBall(rotationSpeed, 0);
      }
      break;
    case 'ArrowLeft':
      if (ball.position.x - speed - ballRadius >= -squareSize / 2) {
        moveBall(-speed, 0);
        rollBall(rotationSpeed);
      }
      break;
    case 'ArrowRight':
      if (ball.position.x + speed + ballRadius <= squareSize / 2) {
        moveBall(speed, 0);
        rollBall(-rotationSpeed);
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera position to follow the ball
  camera.position.x = ball.position.x;
  camera.position.y = ball.position.y + 30;
  camera.position.z = ball.position.z + 100;
  camera.lookAt(ball.position);

  // Render the scene
  renderer.render(scene, camera);
}
