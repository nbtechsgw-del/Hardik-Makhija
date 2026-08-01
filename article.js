const btn = document.getElementById("btn");
const readmore = document.getElementById("readmore");

btn.addEventListener("click", function() {
    if (readmore.style.display === "none") {
        readmore.style.display = "inline";
        btn.textContent = "Read Less";
    } else {
        readmore.style.display = "none";
        btn.textContent = "Read More";
    }
});