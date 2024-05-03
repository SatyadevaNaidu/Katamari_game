import * as THREE from 'three';

// Create a function to generate the instructions window
function generateInstructions() {
    // Create a container div
    const container = document.createElement('div');
    container.classList.add('instructions-container');

    // Define CSS styles
    const styles = `
        .instructions-container {
            width: 80%;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #F5DEB3; /* Light beige background color */
            border: 2px solid #000; /* Black border */
            border-radius: 10px; /* Rounded corners */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Drop shadow */
        }

        .instructions-container h1 {
            text-align: center;
        }

        .instructions-container ul {
            list-style-type: none;
            padding-left: 20px;
        }

        .instructions-container li {
            margin-bottom: 10px;
            font-size: 18px; /* Increase font size for bullet points */
        }

        .instructions-container button {
            display: block;
            margin: 20px auto 0;
            padding: 10px 20px;
            font-size: 16px;
            background-color: #4CAF50; /* Green button color */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .instructions-container button:hover {
            background-color: #45a049; /* Darker green on hover */
        }
    `;

    // Apply styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Create a title element
    const title = document.createElement('h1');
    title.textContent = 'Instructions';

    // Create a ul element for the bullet points
    const ul = document.createElement('ul');

    // Array of bullet point texts
    const bulletPoints = [
        'Welcome to the game.',
        'Our king has lost his crown and needs to get it back.',
        'He goes to the pirate island to retrieve his crown, but he finds it broken into pieces.',
        'So he creates a ball that can collect these broken pieces and form them into a crown.',
        'Collect all the pieces scattered on the island to see the crown forming on the ball.',
        'After all pieces are collected, the game will end and you can see the crown on the ball.',
        'You have to help our king by navigating the ball around the island using the arrow keys to move in respective direction.',
        'You can stop pressing the arrow keys to apply brakes to the ball, beware it jerks as it stops rolling and has to stop.',
        'After the game is finished you can check the crown by using arrow keys dont worry the ball doesnot move but rotates.'
    ];

    // Create li elements for each bullet point
    bulletPoints.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
    });

    // Append the title and ul to the container
    container.appendChild(title);
    container.appendChild(ul);

    // Create a button to start the game
    const button = document.createElement('button');
    button.textContent = 'Start Game';
    button.addEventListener('click', function() {
        // Call the game() function directly
        game();

        // Remove the instructions container from the DOM
        container.remove();
    });

    // Append the button to the container
    container.appendChild(button);

    // Append the container to the body of the document
    document.body.appendChild(container);
}

// Call the function to generate the instructions window
generateInstructions();


function game(){
let renderer, scene, camera, ball, initialRotation, generatedTreasures = 0, attachedTreasures = 0; // Declaring variables for treasures
let gameEnded = false; // Variable to track game ending
let treasures = []; // Array to store treasure meshes

// Parameters for the damping effect
const dampingFactor = 0.05; // Reduced damping for smoother effect
const dampingThreshold = 0; // Increased threshold for smoother snapping

window.init = async () => {
    // Initialize renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf5deb3); // Sandy color background
    document.body.appendChild(renderer.domElement);

    // Initialize scene
    scene = new THREE.Scene();

    // Initialize camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 950, 500); 
    scene.add(camera);

    // Create vertical plane geometry
    const verticalPlaneGeometry = new THREE.PlaneGeometry(500*2, 250*1.5);

    const treasureTexture = new THREE.TextureLoader().load('/assets/map.jpg', texture => {
        texture.minFilter = THREE.LinearMipmapLinearFilter; //Used Mipmapping
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Used anisotropic filtering
    });
    const verticalPlaneMaterial = new THREE.MeshBasicMaterial({ map: treasureTexture });

    // Create vertical plane mesh
    const verticalPlane = new THREE.Mesh(verticalPlaneGeometry, verticalPlaneMaterial);
    verticalPlane.position.z = -500; 
    verticalPlane.position.y = 140;
    verticalPlane.rotation.x = -Math.PI/10;
    scene.add(verticalPlane);

    // Load sand texture with mipmapping and anisotropic filtering
    const sandTexture = new THREE.TextureLoader().load('/assets/sand.jpg', texture => {
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Used mipmapping for minification
        texture.magFilter = THREE.LinearFilter; // Used linear filtering for magnification
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Used anisotropic filtering
    });

    // Created the 3D box with sand texture
    const squareSize = 450;
    const boxGeometry = new THREE.BoxGeometry(squareSize, 1, squareSize);
    const boxMaterial = new THREE.MeshBasicMaterial({ map: sandTexture }); // Used sand texture
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Created a grid on the square
    const gridGap = squareSize / 8; // Gap between grid squares
    const gridCount = 8; // Number of grid squares
    const gridOffset = (gridCount - 1) * gridGap / 2; // Offset to center the grid
    const gridPositions = [];
    for (let i = 0; i < gridCount; i++) {
        for (let j = 0; j < gridCount; j++) {
            const posX = i * gridGap - gridOffset;
            const posZ = j * gridGap - gridOffset;
            gridPositions.push({ x: posX, z: posZ });
        }
    }

    // Define treasure types
const treasureTypes = [
    { geometry: new THREE.CylinderGeometry(5, 5, 1, 32), material: new THREE.MeshBasicMaterial({ color: 0xffd700 }), name: 'Gold Coin' },
    { geometry: new THREE.DodecahedronGeometry(5), material: new THREE.MeshBasicMaterial({ color: 0x00ffff }), name: 'Diamond' },
    { geometry: new THREE.TetrahedronGeometry(5), material: new THREE.MeshBasicMaterial({ color: 0x00ff00 }), name: 'Gem' },
    { geometry: new THREE.OctahedronGeometry(5), material: new THREE.MeshBasicMaterial({ color: 0xff0000 }), name: 'Ruby' },
    { geometry: new THREE.IcosahedronGeometry(5), material: new THREE.MeshBasicMaterial({ color: 0x008000 }), name: 'Emerald' }
    // Add more treasure types as desired
];


    let currentTreasureIndex = 0;

    // Create treasure objects at each intersection of the grid
    gridPositions.forEach(({ x, z }) => {
        const treasureType = treasureTypes[currentTreasureIndex];
        const treasure = new THREE.Mesh(treasureType.geometry, treasureType.material);
        treasure.position.set(x, 7, z); // Set y-coordinate to 7 to place treasures on the surface
        treasure.rotation.x = Math.PI / 2; // Adjust rotation to stand upright
        treasure.name = treasureType.name; // Store treasure name
        generatedTreasures++; // Increment generated treasures count
        treasures.push(treasure); // Push treasure into treasures array
        scene.add(treasure);

        // Update current treasure index for next iteration
        currentTreasureIndex = (currentTreasureIndex + 1) % treasureTypes.length;
    });

    // Load texture image for the ball
    const textureLoader = new THREE.TextureLoader();
    const ballTexture = textureLoader.load('/assets/golf.jpg', texture => {
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Use mipmapping for minification
        texture.magFilter = THREE.LinearFilter; // Use linear filtering for magnification
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Use anisotropic filtering
    });

    // Initialize ball object with optimized sphere geometry
    const ballGeometry = new THREE.SphereGeometry(14, 100, 100); // Reduced segments
    const ballMaterial = new THREE.MeshBasicMaterial({ map: ballTexture }); // Use MeshBasicMaterial for texture mapping
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.y = 15;
    ball.position.z = 0;
    scene.add(ball);

    ball.rotation.y = -Math.PI / 4;
    // Store the initial rotation state of the ball
    initialRotation = ball.rotation.clone();

    // Set up input controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Start rendering
    animate();
};

// Function to handle keyboard input
function handleKeyDown(event) {
    const speed = 1;
    const rotationSpeed = 0.3;
    const squareSize = 450;
    const ballRadius = 14;
    if (gameEnded){
        return;
    }
    switch (event.key) {
        case 'ArrowUp':
            if (ball.position.z - speed - ballRadius >= -squareSize / 2) {
                moveBall(0, -speed);
                rotateBall(-rotationSpeed, 0);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowDown':
            if (ball.position.z + speed + ballRadius <= squareSize / 2) {
                moveBall(0, speed);
                rotateBall(rotationSpeed, 0);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowLeft':
            if (ball.position.x - speed - ballRadius >= -squareSize / 2) {
                moveBall(-speed, 0);
                rollBall(rotationSpeed);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowRight':
            if (ball.position.x + speed + ballRadius <= squareSize / 2) {
                moveBall(speed, 0);
                rollBall(-rotationSpeed);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
}
}

// Function to handle key release
function handleKeyUp(event) {
    let keyup=true;
    const speed = 1;
    const rotationSpeed = 0.3;
    const squareSize = 450;
    const ballRadius = 14;
    switch (event.key) {
        case 'ArrowUp':
            if (ball.position.z - speed - ballRadius >= -squareSize / 2) {
                console.log(keyup,"Arrow is up",currentSpeed)
                demoveBall(0, -speed,"u");
                rotateBall(-rotationSpeed, 0);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowDown':
            if (ball.position.z + speed + ballRadius <= squareSize / 2) {
                console.log(keyup,"Arrow is down",currentSpeed)
                demoveBall(0, speed,"d");
                rotateBall(rotationSpeed, 0);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowLeft':
            if (ball.position.x - speed - ballRadius >= -squareSize / 2) {
                console.log(keyup,"Arrow is left", currentSpeed)
                demoveBall(-speed,0,"l");
                rollBall(rotationSpeed);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
        case 'ArrowRight':
            if (ball.position.x + speed + ballRadius <= squareSize / 2) {
                console.log(keyup,"Arrow is Right",currentSpeed)
                demoveBall(speed,0,"r");
                rollBall(-rotationSpeed);
                checkCollision();
            }
            else{
                currentSpeed = 0;
            }
            break;
    }
    
}


function demoveBall(dx, dz,c) {
    console.log("inside demoveball");
    const squareSize = 450;
    const ballRadius = 14;

    function loop(i) {
        if (ball.position.x + dx + ballRadius <= squareSize / 2 && c==="r") {
            console.log(c,ball.position.x + dx + ballRadius <= squareSize / 2)
            if (currentSpeed !== 0) {
                setTimeout(() => {
                    decel(dx, dz);
                    loop(i + 1);
                }, 20); 
            }
            checkCollision();
        }
        if (ball.position.x - dx - ballRadius >= -squareSize / 2 && c==="l") {
            console.log(c,ball.position.x - dx - ballRadius >= -squareSize / 2)
            if (currentSpeed !== 0) {
                setTimeout(() => {
                    decel(dx, dz);
                    loop(i + 1);
                }, 20);
            }
            checkCollision();
        }
        if (ball.position.z + dz + ballRadius <= squareSize / 2 && c==="d") {
            console.log(c,ball.position.z + dz + ballRadius <= squareSize / 2)
            if (currentSpeed !== 0) {
                setTimeout(() => {
                    decel(dx, dz);
                    loop(i + 1);
                }, 20);
            }
            checkCollision();
        }
        if (ball.position.z - dz - ballRadius >= -squareSize / 2 && c==="u") {
            console.log(c,ball.position.z - dz - ballRadius >= -squareSize / 2)
            if (currentSpeed !== 0) {
                setTimeout(() => {
                    decel(dx, dz);
                    loop(i + 1);
                }, 20);
            }
            checkCollision();
        }
    }
    loop(0);
}


function decel(dx,dz){
    if (currentSpeed > 0) {
        currentSpeed -= 0.1; 
        if (currentSpeed <= 0) {
            currentSpeed = 0; 
        }
    }
    console.log("inside decel",currentSpeed);
    ball.position.x += dx * currentSpeed;
    ball.position.z += dz * currentSpeed;

}

let currentSpeed = 0; // Current speed of the ball

// Function to move the ball
function moveBall(dx, dz, maxSpeed=4) {
    if (currentSpeed < maxSpeed) {
        currentSpeed += 0.05; // Increase speed by 0.5
        if (currentSpeed > maxSpeed) {
            currentSpeed = maxSpeed; // Ensure speed doesn't exceed maxSpeed
        }
    }
    ball.position.x += dx * currentSpeed;
    ball.position.z += dz * currentSpeed;
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

// Function to check collision between the ball and treasures
function checkCollision() {

    treasures.forEach(treasure => {
        const distance = ball.position.distanceTo(treasure.position);
        if (distance < 20 && !treasure.attached) { // Adjust this value as needed for the collision detection threshold
            // Calculate the offset between the treasure and the ball
            const offset = new THREE.Vector3().subVectors(treasure.position, ball.position);
            ball.add(treasure); // Attach the treasure to the ball
            treasure.position.copy(offset); // Set the treasure's position relative to the ball
            treasure.attached = true; // Mark treasure as attached
            attachedTreasures++; // Increment attached treasures count
        }
    });

    if (attachedTreasures === generatedTreasures) {
        gameEnded = true; // Update gameEnded variable
        showGameEndedPopup();
    }
}

function showGameEndedPopup() {
    // Create a popup element
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = 'Hooray we created the crown!';
    
    // Add styles to the popup
    popup.style.position = 'absolute';
    popup.style.top = '20%'; // Adjusted top position
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '10px';
    popup.style.background = 'rgba(255, 255, 255, 0.9)';
    popup.style.border = '2px solid black';
    popup.style.borderRadius = '10px';
    popup.style.fontSize = '24px';
    popup.style.fontWeight = 'bold';
    
    // Append the popup to the document body
    document.body.appendChild(popup);

    // Create a restart button
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart';
restartButton.style.position = 'absolute';
restartButton.style.top = '70%'; // Adjusted top position
restartButton.style.left = '50%';
restartButton.style.transform = 'translateX(-50%)'; // Center the button horizontally
restartButton.style.padding = '10px';
restartButton.style.background = 'green';
restartButton.style.border = 'none';
restartButton.style.borderRadius = '5px';
restartButton.style.color = 'white';
restartButton.style.fontSize = '16px';
restartButton.style.fontWeight = 'bold';
restartButton.style.cursor = 'pointer';
restartButton.addEventListener('click', () => {
    location.reload(); // Reload the page when the button is clicked
});

// Append the button to the document body
document.body.appendChild(restartButton);
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Apply damping effect to camera movement
    applyDampingEffect();

    // Render the scene
    renderer.render(scene, camera);
}
}
