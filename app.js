const width = 8;
// Not necessary
// const squares = [];

// Transparent ? To give background image?
const candyColors = [
    "red",
    "yellow",
    "orange",
    "purple",
    "green",
    "blue"
]

let squareDragged;
let squareReplaced;

document.addEventListener('DOMContentLoaded', () => {
    // When page loaded
    const grid = document.querySelector(".grid");

    // Create board
    createBoard(width, grid);
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
            let square = document.createElement("div");

            // Give square a random background color from the array
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundColor = candyColors[randomColor];

            // Draggable - change to not show?
            square.setAttribute("draggable", true);

            // id = row / column
            let id = i * 10 + j;
            square.setAttribute("id", id.toString());

            // Event Listeners
            square.addEventListener("dragstart", dragStart)
            square.addEventListener("dragend", dragEnd)
            square.addEventListener("dragover", dragOver)
            square.addEventListener("dragenter", dragEnter)
            square.addEventListener("dragleave", dragLeave)
            square.addEventListener("drop", dragDrop)

            // put square in grid and in array
            grid.appendChild(square);
            //row.push(square);
        }

        //array.push(row);
    }
}

function dragStart() {
    squareDragged = this;
}

function dragEnd() {

}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {

}

function dragDrop() {
    squareReplaced = this;

    // Switch colours
    let savedColour = squareDragged.style.backgroundColor;
    squareDragged.style.backgroundColor = squareReplaced.style.backgroundColor;
    squareReplaced.style.backgroundColor = savedColour;
}