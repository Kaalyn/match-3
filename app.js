const width = 8;
const height = 8
const candyColors = [`red`, `yellow`, `orange`, `purple`, `green`, `blue`]

let grid;
let scoreDisplay;
let countdownDisplay;
let tick = 200;

let score = 0;
let countdown = -100000;
let isCountdownActive = false;

let shapeDragged;
let shapeReplaced;

// When page loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    grid = document.querySelector(`.grid`);
    scoreDisplay = document.getElementById(`score`);
    countdownDisplay = document.getElementById(`timer`);

    createBoard(width, height, grid);

    // set timer
    // maybe let this trigger only when stuff would change?
    window.setInterval(function (){
        onStatusChanged();
        updateCountdown();
    }, tick)
})

function onStatusChanged() {
    let boardFilled = moveDown();

    if (boardFilled && !isCountdownActive) {
        countdown = 60000;
        isCountdownActive = true;
    }
    if (boardFilled) {
        checkMatches();
    }
}

function createBoard(width, height, grid) {
    for (let row = 0; row < height; row++){
        for (let column = 0; column < width; column++)
        {
            let shape = document.createElement(`div`);

            // Shapes empty at start
            shape.className = `blank`;

            shape.setAttribute(`draggable`, `true`);

            let id = {row: row, column: column};
            shape.setAttribute(`id`, JSON.stringify(id));

            // Event Listeners
            shape.addEventListener(`dragstart`, dragStart)
            shape.addEventListener(`dragover`, dragOver)
            shape.addEventListener(`dragenter`, dragEnter)
            shape.addEventListener(`dragleave`, dragLeave)
            shape.addEventListener(`drop`, dragDrop)

            // put shape in grid
            grid.appendChild(shape);
        }
    }
}

// Swapping functions
function dragStart() {
    shapeDragged = this;
}
function dragLeave() {
    // Needs to be defined
}
function dragDrop() {
    shapeReplaced = this;
    let idDragged = JSON.parse(shapeDragged.id);
    let draggedTo = JSON.parse(shapeReplaced.id);



    // Create list of valid moves
    // No valid moves if timer is not running
    let validMoves;
    if (countdown > 0) {
        validMoves = [
            {row: idDragged.row + 1, column: idDragged.column},
            {row: idDragged.row - 1, column: idDragged.column},
            {row: idDragged.row, column: idDragged.column + 1},
            {row: idDragged.row, column: idDragged.column - 1}
        ];
    }

    let isValidMove = false;

    for (let i = 0; i < 4 && !isValidMove; i++) {
        isValidMove = draggedTo.row === validMoves[i].row && draggedTo.column === validMoves[i].column;
    }

    if (isValidMove) {
        swapColor(shapeDragged, shapeReplaced);

        let isCreatingMatch;

        // Resolve top swap first
        if (idDragged.row < draggedTo.row) {
            isCreatingMatch = checkIfMatch(idDragged) || checkIfMatch(draggedTo);
        } else {
            isCreatingMatch = checkIfMatch(draggedTo) || checkIfMatch(idDragged);
        }

        // Swap colors back if there is no match
        // Maybe add animation or something to indicate that there's no match?
        if (!isCreatingMatch) {
            swapColor(shapeDragged, shapeReplaced);
        }
    }
}

function dragOver(e) {
    e.preventDefault();
}
function dragEnter(e) {
    e.preventDefault();
}

// Drop items
function moveDown() {
    // Check if the grid contains empty spaces
    let isFull = true;
    for (let item of document.querySelectorAll(`div.grid div`)) {
        if (item.className === `blank`) {
            isFull = false;
        }
    }

    // for all rows except top
    for (let row = height - 1; row > 0; row--) {
        for (let column = 0; column < width; column++){
            // Get shape in this position
            let checkingShape = getShape(row, column);

            // If shape is empty
            if (checkingShape.className === `blank`) {
                // Get shape above
                let fallingShape = getShape(row - 1, column);

                // copy color of shape above
                checkingShape.className = fallingShape.className;

                // empty shape above
                fallingShape.className= `blank`;
            }
        }
    }

    // for top row only
    for (let  column = 0; column < width; column++) {
        let checkingShape = getShape(0, column);

        // If the shape has no bg
        if (checkingShape.className === `blank`) {
            checkingShape.className = randomColor();
        }
    }

    return isFull;
}

// Iterate over grid to check for matches
function checkMatches() {
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            // Id for the currently selected shape
            let checkingId = {row: row, column: column};

            // find the color of the currently selected shape
            let color = getShape(row, column).className;

            // if the shape hasn't already been cleared
            if (color !== `blank`) {
                // check for matches
                checkIfMatch(checkingId);
            }
        }
    }
}

// Check if a shape is part of a valid match
// Multiple directions with recursion maybe? This can be done better
function checkIfMatch(idObject) {
    // Arrays to store matching shapes
    let allMatches = [];
    let rowArray = [];
    let columnArray = [];

    checkHorizontalMatch(rowArray, idObject);
    if (rowArray.length > 1) {
        // Check the horizontal array for vertical matches
        // if there are valid matches, add them to the array
        let secondaryArray = [];
        rowArray.forEach(function (x) {
            checkVerticalMatch(secondaryArray, JSON.parse(x.id));
            if (secondaryArray.length > 1){
                secondaryArray.forEach(x => rowArray.push(x));
            }
            secondaryArray = [];
        });

        // add all valid matches to the ultimate array
        rowArray.forEach(x => allMatches.push(x));
    }

    checkVerticalMatch(columnArray, idObject);
    if (columnArray.length > 1) {
        // Check the horizontal array for vertical matches
        // if there are valid matches, add them to the array
        let secondaryArray = [];
        columnArray.forEach(function (x) {
            checkHorizontalMatch(secondaryArray, JSON.parse(x.id));
            if (secondaryArray.length > 1){
                secondaryArray.forEach(x => columnArray.push(x));
            }
            secondaryArray = [];
        });

        // add all valid matches to the ultimate array
        columnArray.forEach(x => allMatches.push(x));
    }

    // If there are shapes matched
    if (allMatches.length) {
        // First add the original shape
        allMatches.push(getShape(idObject.row, idObject.column));

        // Then remove all candies in the array
        onColorMatch(allMatches);
        return true;
    } else {
        return false;
    }
}

// horizontal/vertical matching could be done together?
// Iterates over shapes to the left/right for a match
function checkHorizontalMatch(array, idObject) {
    // Booleans to store whether we can still match on the left/right
    let canMatchLeft = true;
    let canMatchRight = true;

    // Check for matches to the left
    for (let i = -1; canMatchLeft; i--) {
        canMatchLeft = isHorizontalMatch(array, idObject, i);
    }

    // Check for matches to the right
    for (let i = 1; canMatchRight; i++) {
        canMatchRight = isHorizontalMatch(array, idObject, i)
    }
}

// Iterates over shapes on the top/bottom for a match
function checkVerticalMatch(array, idObject) {
    // Booleans to store whether we can still match on the left/right/top/bottom
    let canMatchTop = true;
    let canMatchBottom = true;

    // Check for matches above
    for (let i = -1; canMatchTop; i--) {
        canMatchTop = isVerticalMatch(array, idObject, i);
    }

    // Check for matches below
    for (let i = 1; canMatchBottom; i++) {
        canMatchBottom = isVerticalMatch(array, idObject, i)
    }
}

// Adds shape to the array if it's a horizontal match
function isHorizontalMatch(array, idObject, distance) {
    let color = getShape(idObject.row, idObject.column).className;
    let shape = getShape(idObject.row, idObject.column + distance);

    // if our shape is not null and has the correct color
    if (shape && shape.className === color){
        array.push(shape);
        return true;
    } else {
        return false;
    }
}

// Adds shape to the array if it's a vertical match
function isVerticalMatch(array, idObject, distance) {
    let color = getShape(idObject.row, idObject.column).className;
    let shape = getShape(idObject.row + distance, idObject.column);

    // if our shape is not null and has the correct color
    if (shape && shape.className === color){
        array.push(shape);
        return true;
    } else {
        return false;
    }
}

// executes scoring and removing matched shapes
function onColorMatch(array) {
    score += Math.floor((array.length / 2.0) * (1 + array.length));
    scoreDisplay.innerHTML = score;

    if (countdown > 0) {
        countdown += array.length * 50000 / score;
    }

    // remove bg
    array.forEach(shape => shape.className = `blank`)
}

// Returns a random color
function randomColor() {
    let randomColor = Math.floor(Math.random() * candyColors.length);
    return candyColors[randomColor];
}

function swapColor(shapeA, shapeB) {
    let savedColour = shapeA.className;
    shapeA.className = shapeB.className;
    shapeB.className = savedColour;
}

// Returns the div positioned at the coordinates
function getShape(row, column) {
    let id = {row: row, column: column};
    return document.getElementById(JSON.stringify(id));
}

function updateCountdown() {
    // If the counter has not hit zero
    if (isCountdownActive) {
        if (countdown > 0){
            countdown -= tick;
            countdownDisplay.innerHTML = Math.ceil(countdown / 1000);
        } else  {
            window.clearInterval();
            isCountdownActive = false;
            showGameOver();
        }
    }

}

function showGameOver() {
    let gameOver = document.createElement(`div`);
    gameOver.innerHTML = `Time's up! Congratulations, you scored ${score} points! Feel free to refresh the page if you'd like to play again.`;
    gameOver.className = `game-over`;

    let container = document.querySelector(`body`);
    container.appendChild(gameOver);
}