var darkMode = document.querySelector(".darkMode");
var lightMode = document.querySelector(".lightMode");
var section4 = document.querySelector(".section4");
var section3Text = document.querySelector(".section3Text");

darkMode.onclick = function () {
    document.body.style.backgroundColor = "#323232";
    document.body.style.color = "white";
    lightMode.style.display = "block";
    darkMode.style.display = "none";
    section3Text.style.color = "#d1d5db";
    section4.style.backgroundColor= "#292929";
}

lightMode.onclick = function () {
    document.body.style.backgroundColor = "#f9f9f9";
    document.body.style.color = "#1f2937";
    lightMode.style.display = "none";
    darkMode.style.display = "block";
    section3Text.style.color = "#4b5563";
    section4.style.backgroundColor= "#f3f4f6";
}


// JavaScript to animate the number from 0 to a specific value
const animateCounter = (element, targetValue, duration) => {
    let startValue = 0;
    const increment = targetValue / (duration / 10);
    const interval = setInterval(() => {
        startValue += increment;
        if (startValue >= targetValue) {
            clearInterval(interval);
            element.textContent = targetValue.toFixed(0);
        } else {
            element.textContent = Math.round(startValue);
        }
    }, 10);
};

// Run the animation for the stat elements
animateCounter(document.querySelector(".count1"), 100, 2000);
animateCounter(document.querySelector(".count2"), 100, 2000);
animateCounter(document.querySelector(".count3"), 100, 2000);
animateCounter(document.querySelector(".count4"), 100, 2000);