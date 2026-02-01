// DOM elements
const resultWpm = document.getElementById("result-wpm");
const resultAccuracy = document.getElementById("result-accuracy");
const resultTime = document.getElementById("result-time");
const testDuration = document.getElementById("test-duration");
const charsTyped = document.getElementById("chars-typed");
const correctChars = document.getElementById("correct-chars");
const incorrectChars = document.getElementById("incorrect-chars");
const tryAgainBtn = document.getElementById("try-again-btn");

// Load and display results
function loadResults() {
    // Get results from localStorage
    const resultsData = localStorage.getItem("typingResults");
    
    if (!resultsData) {
        // No results found, redirect to game page
        window.location.href = "index.html";
        return;
    }
    
    const results = JSON.parse(resultsData);
    
    // Display results
    resultWpm.textContent = results.wpm;
    resultAccuracy.textContent = results.accuracy + "%";
    resultTime.textContent = results.time + "s";
    
    // Display test duration
    if (results.totalDuration) {
        const durationText = formatDuration(results.totalDuration);
        testDuration.textContent = `of ${durationText} test`;
    }
    
    charsTyped.textContent = results.charsTyped;
    correctChars.textContent = results.correctChars;
    incorrectChars.textContent = results.incorrectChars;
    
    // Add performance message based on WPM
    addPerformanceMessage(results.wpm);
}

// Add a performance message based on WPM
function addPerformanceMessage(wpm) {
    const resultsContainer = document.querySelector(".results-container");
    const messageElement = document.createElement("p");
    messageElement.className = "performance-message";
    
    if (wpm < 30) {
        messageElement.textContent = "Keep practicing! Your typing speed will improve with time.";
    } else if (wpm < 50) {
        messageElement.textContent = "Good job! You're approaching the average typing speed.";
    } else if (wpm < 70) {
        messageElement.textContent = "Great work! You're above average.";
    } else if (wpm < 90) {
        messageElement.textContent = "Excellent! You're typing at a professional level.";
    } else {
        messageElement.textContent = "Outstanding! You're among the fastest typists.";
    }
    
    // Insert message before the buttons
    resultsContainer.insertBefore(messageElement, document.querySelector(".buttons"));
}

// Format duration in seconds to a readable format
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}

// Event listeners
tryAgainBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Load results when page loads
document.addEventListener("DOMContentLoaded", loadResults);
