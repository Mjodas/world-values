// Get the modal
var modal = document.getElementsByClassName('modal');

// Get the button that opens the modal
var btn = document.getElementsByClassName("modal-button");


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close");


btn[0].onclick = function () {
    modal[0].style.display = "block";
}

span[0].onclick = function () {
    modal[0].style.display = "none";
}

btn[1].onclick = function () {
    modal[1].style.display = "block";
}

span[1].onclick = function () {
    modal[1].style.display = "none";
}

btn[2].onclick = function () {
    modal[2].style.display = "block";
}

span[2].onclick = function () {
    modal[2].style.display = "none";
}

btn[3].onclick = function () {
    modal[3].style.display = "block";
}

span[3].onclick = function () {
    modal[3].style.display = "none";
}



window.onclick = function (event) {
    if (event.target == modal[0]) {
        modal[0].style.display = "none";
    } else if (event.target == modal[1]) {
        modal[1].style.display = "none";
    } else if (event.target == modal[2]) {
        modal[2].style.display = "none";
    } else if (event.target == modal[3]) {
        modal[3].style.display = "none";
    }
}



// When the user clicks anywhere outside of the modal, close it
