const width = 8;
const height = 8

const candyColors = [
    `red`,
    `yellow`,
    `orange`,
    `purple`,
    `green`,
    `blue`
]

let grid;
let scoreDisplay;

let squareDragged;
let squareReplaced;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    // When page loaded
    grid = document.querySelector(`.grid`);
    scoreDisplay = document.getElementById(`score`);

    // Create board
    createBoard(width, height, grid);

    // set timer
    // maybe let this trigger only when stuff would change?
    window.setInterval(function (){
        onStatusChanged();
    }, 200)
})

function onStatusChanged() {
    let boardFilled = moveDown();
    if (boardFilled) {
        checkMatches();
    }
}

// Idea: width + height
// Based on screen dimensions?
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
    let validMoves = [
        {row: idDragged.row + 1, column: idDragged.column},
        {row: idDragged.row - 1, column: idDragged.column},
        {row: idDragged.row, column: idDragged.column + 1},
        {row: idDragged.row, column: idDragged.column - 1}
    ];

    let isValidMove = false;

    for (let i = 0; i < 4 && !isValidMove; i++) {
        isValidMove = draggedTo.row === validMoves[i].row && draggedTo.column === validMoves[i].column;
    }

    // Switch colors
    if (isValidMove) {
        let savedColour = squareDragged.className;
        squareDragged.className = squareReplaced.className;
        squareReplaced.className = savedColour;
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

// Check for matches
function checkMatches() {
    // for lengths from 6 to 3 (starting at largest)
    for (let checkingLength = 6; checkingLength > 2; checkingLength-- ) {
        // for every row
        for (let row = 0; row < height; row++) {
            // for every square in this row
            for (let column = 0; column < width; column++) {
                // Get the id for this square
                let checkingId = {row: row, column: column};

                // if our row number is greater than the length we're checking minus two
                // check for matches in de squares above
                if (row > checkingLength - 2) {
                    checkForColumn(checkingId, checkingLength);
                }

                // if our column number is greater than the length we're checking minus two
                // check for matches in de squares to the left
                if (column > checkingLength - 2){
                    checkForRow(checkingId, checkingLength);
                }
            }
        }
    }
}

function checkForRow(id, amountToCheck) {
    // empty array to store ID's in
    let rowArray = [];

    // Add relevant squares
    for (let i = 0; i < amountToCheck; i++) {
        rowArray.push(getShape(id.row, id.column - i));
    }

    // If colors match
    // Check on other axis if all the colors in the column match
    if (isSameColor(rowArray)) {
        rowArray.forEach(function (itemChecked){
            let secondaryArray = secondaryColumn(JSON.parse(itemChecked.id), itemChecked.className);
            // Turn this into lambda function?
            secondaryArray.forEach(function(itemAdded){
                rowArray.push(itemAdded);
            })
        })
        onColorMatch(rowArray);
    }
}

function checkForColumn(id, amountToCheck) {
    // empty array to store ID's in
    let columnArray = [];

    // Add relevant squares
    for (let i = 0; i < amountToCheck; i++) {
        columnArray.push(getShape(id.row - i, id.column));
    }

    // Check on other axis if all the colors in the column match
    if (isSameColor(columnArray)) {
        columnArray.forEach(function (itemChecked){
            let secondaryArray = secondaryRow(itemChecked.id, itemChecked.className);
            secondaryArray.forEach(function(itemAdded){
                columnArray.push(itemAdded);
            })
        })
        onColorMatch(columnArray);
    }
}

// Check for secondary axis
// CODE DUPLICATION!!!
function secondaryRow(id, color) {
    // Booleans to store whether we can still match on the left/right
    let canMatchLeft = true;
    let canMatchRight = true;

    let array = [];

    let distance = 1;

    while (canMatchLeft || canMatchRight) {
        distance++;

        // As long as there are matches possible on the left
        if (canMatchLeft) {
            // get the square to the left of the leftmost square
            let checkingSquare = getShape(id.row, id.column - distance);

            // if our square is not null and has the correct color
            if (checkingSquare && checkingSquare.className === color){
                // Add square to new array
                array.push(checkingSquare);
            } else {
                // Stop looking to the left
                canMatchLeft = false;
            }
        }

        // As long as there are matches possible on the right
        if (canMatchRight) {
            // get the square to the right of the rightmost square
            let checkingSquare = getShape(id.row, id.column + distance);

            // if our square is not null and has the correct color
            if (checkingSquare && checkingSquare.className === color) {
                // Add square to new array
                array.push(checkingSquare);
            } else {
                // Stop looking to the left
                canMatchRight = false;
            }
        }
    }

    if (array.length > 1 ) {
        return array;
    } else {
        return [];
    }
}

function secondaryColumn(id, color) {
    // Booleans to store whether we can still match on the top/bottom
    let canMatchBottom = true;
    let canMatchTop = true;

    let array = [];

    let distance = 0;

    while (canMatchBottom || canMatchTop) {
        // move one further away from the center in either direction
        distance++;

        // As long as there are matches possible on the left
        if (canMatchBottom) {
            // get the square to the left of the leftmost square
            let checkingSquare = getShape(id.row - distance, id.column);

            // if our square is not null and has the correct color
            if (checkingSquare && checkingSquare.className === color){
                // Add square to new array
                array.push(checkingSquare);
            } else {
                // Stop looking to the left
                canMatchBottom = false;
            }
        }

        // As long as there are matches possible on the right
        if (canMatchTop) {
            // get the square to the right of the leftmost square
            let checkingSquare = getShape(id.row + distance, id.column);

            // if our square is not null and has the correct color
            if (checkingSquare && checkingSquare.className === color) {
                // Add square to new array
                array.push(checkingSquare);
            } else {
                // Stop looking to the left
                canMatchTop = false;
            }
        }
    }

    if (array.length > 1 ) {
        return array;
    } else {
        return [];
    }
}

// checks if al the squares in the array have the same color
function isSameColor(array) {
    // get the color of the first item in the array
    let colorToCheck = array[0].className;

    let isMatch = false;

    if (array.every(item => item.className === colorToCheck && colorToCheck !== `blank`)) {
        isMatch = true;
    }

    return isMatch;
}

// executes scoring and removing matched squares
function onColorMatch(array) {
    score += Math.floor((array.length / 2.0) * (1 + array.length));
    scoreDisplay.innerHTML = score;

    // remove bg
    array.forEach(item => {
        item.className = `blank`;
    })
}

function randomColor() {
    let randomColor = Math.floor(Math.random() * candyColors.length);
    return candyColors[randomColor];
}

function getShape(row, column) {
    // Get shape in this position
    let id = {row: row, column: column};
    let shape = document.getElementById(JSON.stringify(id));
    return shape;
}