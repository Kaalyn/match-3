const width = 8;
const height = 8
const candyColors = [`red`, `yellow`, `orange`, `purple`, `green`, `blue`]

let grid;
let scoreDisplay;
let timerDisplay;
let timeOut = 200;

let score = 0;
let timer = -100000;

let squareDragged;
let squareReplaced;

// When page loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    grid = document.querySelector(`.grid`);
    scoreDisplay = document.getElementById(`score`);
    timerDisplay = document.getElementById(`timer`);

    createBoard(width, height, grid);

    // set timer
    // maybe let this trigger only when stuff would change?
    window.setInterval(function (){
        onStatusChanged();
        updateTimer();
    }, timeOut)
})

function onStatusChanged() {
    let boardFilled = moveDown();

    if (boardFilled && timer === -100000) {
        timer = 60000;
    }
    if (boardFilled) {
        checkMatches();
    }
}

function createBoard(width, height, grid) {
    for (let row = 0; row < height; row++){
        for (let column = 0; column < width; column++)
        {
            let square = document.createElement(`div`);

            // Shapes empty at start
            square.className = `blank`;

            square.setAttribute(`draggable`, `true`);

            let id = {row: row, column: column};
            square.setAttribute(`id`, JSON.stringify(id));

            // Event Listeners
            square.addEventListener(`dragstart`, dragStart)
            square.addEventListener(`dragover`, dragOver)
            square.addEventListener(`dragenter`, dragEnter)
            square.addEventListener(`dragleave`, dragLeave)
            square.addEventListener(`drop`, dragDrop)

            // put square in grid and in array
            grid.appendChild(square);
        }
    }
}

// Swapping functions
function dragStart() {
    squareDragged = this;
}
function dragLeave() {
    // Needs to be defined
}
function dragDrop() {
    squareReplaced = this;
    let idDragged = JSON.parse(squareDragged.id);
    let draggedTo = JSON.parse(squareReplaced.id);



    // Create list of valid moves
    // No valid moves if timer is not running
    let validMoves;
    if (timer > 0) {
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
        swapColor(squareDragged, squareReplaced);

        let isCreatingMatch = checkIfMatch(JSON.parse(squareDragged.id)) || checkIfMatch(JSON.parse(squareReplaced.id))

        // Maybe add animation or something to indicate that there's no match?
        if (!isCreatingMatch) {
            swapColor(squareDragged, squareReplaced);
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
            let checkingSquare = getShape(row, column);

            // If square is empty
            if (checkingSquare.className === `blank`) {
                // Get square above
                let fallingSquare = getShape(row - 1, column);

                // copy color of square above
                checkingSquare.className = fallingSquare.className;

                // empty square above
                fallingSquare.className= `blank`;
            }
        }
    }

    // for top row only
    for (let  column = 0; column < width; column++) {
        let checkingSquare = getShape(0, column);

        // If the square has no bg
        if (checkingSquare.className === `blank`) {
            checkingSquare.className = randomColor();
        }
    }

    return isFull;
}

// Iterate over grid to check for matches
function checkMatches() {
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            // Id for the currently selected square
            let checkingId = {row: row, column: column};

            // find the color of the currently selected square
            let color = getShape(row, column).className;

            // if the square hasn't already been cleared
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

// executes scoring and removing matched squares
function onColorMatch(array) {
    score += Math.floor((array.length / 2.0) * (1 + array.length));
    scoreDisplay.innerHTML = score;

    if (timer > 0) {
        timer += array.length * 50000 / score;
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

function updateTimer() {
    // If the counter has not hit zero
    if (timer > 0){
        timer -= timeOut;
        timerDisplay.innerHTML = Math.ceil(timer / 1000);
    } else  {
        window.clearInterval();
    }
}