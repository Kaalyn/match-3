const width = 8;

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
    createBoard(width, grid);

    let boardHasGaps;
    // set timer
    // maybe let this trigger only when stuff would change?
    window.setInterval(function (){

        // TODO: SOMETHING HERE SO NO MATCHES WHILE DROP ACTIVE
        do {
            boardHasGaps = moveDown();
        } while (boardHasGaps)

        checkRowOfFour();
        checkColumnOfFour();
        checkRowOfThree();
        checkColumnOfThree();
    }, 1000)
})

// Idea: width + height
// Based on screen dimensions?
function createBoard(width, grid) {

    //Rows
    for (let i = 0; i < width; i++){
        // let row = [];

        // Squares in row
        for (let j = 0; j < width; j++)
        {
            let square = document.createElement(`div`);

            // Give square a random background color from the array
            square.className = randomColor();

            // Draggable - change to not show?
            square.setAttribute(`draggable`, `true`);

            // id = row / column
            let id = i * 10 + j;
            square.setAttribute(`id`, id.toString());

            // Event Listeners
            square.addEventListener(`dragstart`, dragStart)
            square.addEventListener(`dragover`, dragOver)
            square.addEventListener(`dragenter`, dragEnter)
            square.addEventListener(`dragleave`, dragLeave)
            square.addEventListener(`drop`, dragDrop)

            // put square in grid and in array
            grid.appendChild(square);
            //row.push(square);
        }

        //array.push(row);
    }
}

// Swapping functions
function dragStart() {
    squareDragged = this;
}
function dragLeave() {

}
function dragDrop() {
    squareReplaced = this;
    let idDragged = parseInt(squareDragged.id);

    // Positions the square can be dragged to
    let validMoves = [
        // left and right
        idDragged - 1,
        idDragged + 1,
        // above and below
        idDragged + 10,
        idDragged - 10
    ];

    // If we execute on drop
    // No need to check if there is an actual item being selected
    if (validMoves.includes(parseInt(squareReplaced.id))) {
        // Switch colours
        let savedColour = squareDragged.className;
        squareDragged.className = squareReplaced.className;
        squareReplaced.className = savedColour;
    } else {
        console.log(`Invalid move`);
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
    // we want the blocks to fall row by row
    // but we don't want matches to trigger while blocks are falling
    // --> while
    let containsBlank = false;

    // Get all squares in DOM
    for (let item of document.querySelectorAll(`div.grid div`)) {
        // If no background
        if (item.className === `blank`) {
            // grid contains blanks
            containsBlank = true;
        }
    }

    // for all rows except top
    for (let i = width - 1; i > 0; i--) {
        // for all squares in this row
        for (let j = 0; j < width; j++){
            let checkingId = i * 10 + j;
            let checkingSquare = document.getElementById((checkingId).toString());

            // If square is empty
            if (checkingSquare.className === `blank`) {
                // Get square above
                let fallingSquare = document.getElementById((checkingId -10).toString());

                // copy color of square above
                checkingSquare.className = fallingSquare.className;

                // empty square above
                fallingSquare.className= `blank`;
            }
        }
    }

    // for top row only
    for (let  j = 0; j < width; j++) {
        let checkingSquare = document.getElementById((j).toString());

        // If the square has no bg
        if (checkingSquare.className === `blank`) {
            checkingSquare.className = randomColor();
        }
    }

    return containsBlank;
}

// Check for matches
// TODO: add 5, add angles/T's
function checkRowOfFour() {
    //Rows
    // For every row
    for (let i = 0; i < width; i++) {

        // Squares in row
        // For all squares but the first two squares
        // moving right to left - one way to avoid recalculating end condition
        for (let j = 3; j < width; j++) {
            // Rightmost square
            let checkingId = i * 10 + j;

            // Fill array with squares to be checked
            let rowOfThree = [
                document.getElementById((checkingId - 3).toString()),
                document.getElementById((checkingId - 2).toString()),
                document.getElementById((checkingId - 1).toString()),
                document.getElementById((checkingId).toString())
            ];

            checkColor(rowOfThree, 5);
        }
    }
}
function checkColumnOfFour() {
    //Rows
    // For all but the top two rows
    // moving bottom to top - one way to avoid recalculating end condition
    for (let i = 3; i < width; i++) {

        // Squares in row
        // For all rows
        for (let j = 0; j < width; j++) {
            // Rightmost square
            let checkingId = i * 10 + j;

            // Fill array with squares to be checked
            let columnOfThree = [
                document.getElementById((checkingId - 30).toString()),
                document.getElementById((checkingId - 20).toString()),
                document.getElementById((checkingId - 10).toString()),
                document.getElementById((checkingId).toString())
            ];

            checkColor(columnOfThree, 5);
        }
    }
}
function checkRowOfThree() {
    //Rows
    // For every row
    for (let i = 0; i < width; i++) {

        // Squares in row
        // For all squares but the first two squares
        // moving right to left - one way to avoid recalculating end condition
        for (let j = 2; j < width; j++) {
            // Rightmost square
            let checkingId = i * 10 + j;

            // Fill array with squares to be checked
            let rowOfThree = [
                document.getElementById((checkingId - 2).toString()),
                document.getElementById((checkingId - 1).toString()),
                document.getElementById((checkingId).toString())
            ];

            checkColor(rowOfThree, 3);
        }
    }
}
function checkColumnOfThree() {
    //Rows
    // For all but the top two rows
    // moving bottom to top - one way to avoid recalculating end condition
    for (let i = 2; i < width; i++) {

        // Squares in row
        // For all rows
        for (let j = 0; j < width; j++) {
            // Rightmost square
            let checkingId = i * 10 + j;

            // Fill array with squares to be checked
            let columnOfThree = [
                document.getElementById((checkingId - 20).toString()),
                document.getElementById((checkingId - 10).toString()),
                document.getElementById((checkingId).toString())
            ];

            checkColor(columnOfThree, 3);
        }
    }
}

// Removes the background in an array of divs
// if all divs have the same bg color
function checkColor(array, pointValue){
    // get the color of the first item in the array
    let colorToCheck = array[0].className;

    if (array.every(item => item.className === colorToCheck && colorToCheck !== `blank`)) {
        score += pointValue;
        scoreDisplay.innerHTML = score;

        // remove bg
        array.forEach(item => {
            item.className = `blank`;
        })
    }
}

function randomColor() {
    let randomColor = Math.floor(Math.random() * candyColors.length);
    return candyColors[randomColor];
}

