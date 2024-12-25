// Game Setup
const gameBoard = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");

const candyImages = [
    "https://i.postimg.cc/CLMJcDrm/Litchi-Candy.png",
    "https://i.postimg.cc/wjZVxrqG/Pineapple-Candy.png",
    "https://i.postimg.cc/y8kjHKHR/Orange-Candy.png",
    "https://i.postimg.cc/sXR47ZZP/Tetul-Candy.png",
    "https://i.postimg.cc/vTY7SFhc/Caramel-Candy.png",
    "https://i.postimg.cc/PfyQvJfZ/Green-Mango.png"
];

let board = [];
let score = 0;
const gridSize = 8;

// Helper function to create the game board
function createBoard() {
    board = [];
    for (let row = 0; row < gridSize; row++) {
        const rowArr = [];
        for (let col = 0; col < gridSize; col++) {
            const randomCandy = Math.floor(Math.random() * candyImages.length);
            rowArr.push(randomCandy);
            const candy = document.createElement("img");
            candy.src = candyImages[randomCandy];
            candy.setAttribute("data-row", row);
            candy.setAttribute("data-col", col);
            candy.setAttribute("class", "candy");
            candy.addEventListener("click", selectCandy);
            gameBoard.appendChild(candy);
        }
        board.push(rowArr);
    }
}

// Select and swap candies
let selectedCandy = null;

function selectCandy(e) {
    if (!selectedCandy) {
        selectedCandy = e.target;
        selectedCandy.style.border = "2px solid red";
    } else {
        if (isAdjacent(selectedCandy, e.target)) {
            swapCandies(selectedCandy, e.target);
        }
        selectedCandy.style.border = "";
        selectedCandy = null;
    }
}

function isAdjacent(candy1, candy2) {
    const row1 = parseInt(candy1.getAttribute("data-row"));
    const col1 = parseInt(candy1.getAttribute("data-col"));
    const row2 = parseInt(candy2.getAttribute("data-row"));
    const col2 = parseInt(candy2.getAttribute("data-col"));

    return Math.abs(row1 - row2) === 1 && col1 === col2 || Math.abs(col1 - col2) === 1 && row1 === row2;
}

function swapCandies(candy1, candy2) {
    // Swap in the DOM
    const src1 = candy1.src;
    candy1.src = candy2.src;
    candy2.src = src1;

    // Swap in the board array
    const row1 = parseInt(candy1.getAttribute("data-row"));
    const col1 = parseInt(candy1.getAttribute("data-col"));
    const row2 = parseInt(candy2.getAttribute("data-row"));
    const col2 = parseInt(candy2.getAttribute("data-col"));

    [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];

    // Play swap sound
    const swapSound = document.getElementById("swap-sound");
    swapSound.play();

    checkForMatches();
}

// Check for matches
function checkForMatches() {
    let matchFound = false;

    // Check for horizontal matches
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize - 2; col++) {
            const candyType = board[row][col];
            if (candyType === board[row][col + 1] && candyType === board[row][col + 2]) {
                matchFound = true;
                removeCandies(row, col, "horizontal");
            }
        }
    }

    // Check for vertical matches
    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize - 2; row++) {
            const candyType = board[row][col];
            if (candyType === board[row + 1][col] && candyType === board[row + 2][col]) {
                matchFound = true;
                removeCandies(row, col, "vertical");
            }
        }
    }

    if (matchFound) {
        updateScore();
        applyGravity();
        setTimeout(checkForMatches, 300); // Check again after applying gravity
    }
}

function removeCandies(row, col, direction) {
    let removedCandies = 0;

    if (direction === "horizontal") {
        for (let i = 0; i < 3; i++) {
            board[row][col + i] = -1; // Mark as removed
            const candy = document.querySelector(`img[data-row="${row}"][data-col="${col + i}"]`);
            candy.src = ""; // Clear the candy
            removedCandies++;
        }
    } else if (direction === "vertical") {
        for (let i = 0; i < 3; i++) {
            board[row + i][col] = -1; // Mark as removed
            const candy = document.querySelector(`img[data-row="${row + i}"][data-col="${col}"]`);
            candy.src = ""; // Clear the candy
            removedCandies++;
        }
    }

    // Play match sound
    const matchSound = document.getElementById("match-sound");
    matchSound.play();

    return removedCandies;
}

function applyGravity() {
    // Loop through each column
    for (let col = 0; col < gridSize; col++) {
        let emptySlots = [];
        
        // Collect empty slots
        for (let row = 0; row < gridSize; row++) {
            if (board[row][col] === -1) {
                emptySlots.push(row);
            }
        }

        // For each row in the column, fill empty slots with new candies
        for (let row = gridSize - 1; row >= 0; row--) {
            if (board[row][col] === -1 && emptySlots.length > 0) {
                let emptyRow = emptySlots.pop();
                board[emptyRow][col] = Math.floor(Math.random() * candyImages.length); // New candy
                const candy = document.querySelector(`img[data-row="${row}"][data-col="${col}"]`);
                candy.src = candyImages[board[emptyRow][col]]; 
                candy.setAttribute("data-row", emptyRow);
            }
        }
    }
}

// Update score
function updateScore() {
    score += 100; // Increment score for matches
    scoreElement.innerText = score;
}

// Restart Game
restartBtn.addEventListener("click", () => {
    score = 0;
    scoreElement.innerText = score;
    gameBoard.innerHTML = "";
    createBoard();
});

// Initialize Game
createBoard();
