// Sample text passages for typing practice
const textSamples = [
    // Interesting quotes
    "Be yourself; everyone else is already taken. Oscar Wilde's famous quote reminds us of the value of authenticity in a world that often encourages conformity.",
    "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. Einstein's humorous observation continues to resonate with people who observe human behavior.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. Steve Jobs delivered this advice in his famous Stanford commencement speech.",
    "In three words I can sum up everything I've learned about life: it goes on. Robert Frost's simple yet profound observation captures the relentless forward movement of time.",
    
    // Fascinating facts
    "Octopuses have three hearts, nine brains, and blue blood. Their sophisticated nervous system allows them to solve complex puzzles and even use tools, making them among the most intelligent invertebrates.",
    "The Great Barrier Reef is the largest living structure on Earth, stretching over 1,400 miles. It's so massive that it can be seen from outer space and contains thousands of individual reef systems.",
    "A day on Venus is longer than a year on Venus. Due to its slow rotation, Venus takes 243 Earth days to complete one rotation, but only 225 Earth days to orbit the Sun.",
    "The human brain processes images in just 13 milliseconds, making visual processing far faster than previously believed. This remarkable speed allows us to make split-second decisions based on what we see.",
    
    // Interesting passages
    "The ancient Library of Alexandria was one of the largest and most significant libraries of the ancient world. Founded in the 3rd century BCE, it functioned as a major center of scholarship and contained works by the greatest thinkers and writers of the ancient world.",
    "The first computer programmer was a woman named Ada Lovelace, who wrote the first algorithm designed to be processed by a machine in the mid-1800s. Her notes on Charles Babbage's Analytical Engine include what is recognized as the first computer program.",
    "The world's oldest known living tree is a Great Basin bristlecone pine named Methuselah, estimated to be over 4,850 years old. It was already ancient when the pyramids were being built in Egypt.",
    "The human body contains approximately 60,000 miles of blood vessels. If laid end to end, they would circle the Earth nearly two and a half times, demonstrating the incredible complexity of our circulatory system.",
    
    // Technology insights
    "Quantum computing harnesses the strange properties of quantum physics to process information in ways that classical computers cannot. Instead of using bits that are either 0 or 1, quantum computers use qubits that can exist in multiple states simultaneously.",
    "Blockchain technology creates a decentralized and immutable ledger that records transactions across many computers. This design makes the history of any digital asset transparent and verifiable without requiring a trusted third party.",
    "Machine learning algorithms improve automatically through experience, allowing computers to find insights without being explicitly programmed where to look. This capability powers many modern technologies from recommendation systems to autonomous vehicles.",
    "The Internet of Things refers to the billions of physical devices around the world that are connected to the internet, collecting and sharing data. This massive network is transforming how we live and work by making our environment smarter and more responsive."
];

// Game variables
let timer;
let timeLeft = 60;
let isGameActive = false;
let currentText = "";
let startTime;
let endTime;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let textQueue = [];
let linesCompleted = 0;

// DOM elements
const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const typingContainer = document.getElementById("typing-container");
const typingText = document.getElementById("typing-text");
const typingCursor = document.querySelector(".typing-cursor");
const restartBtn = document.getElementById("restart-btn");
const timeSelect = document.getElementById("time-select");
const inputField = document.getElementById("input-field");

// Typing variables
let currentPosition = 0;
let typedText = "";

// Initialize the game
function initGame() {
    // Get selected time
    const selectedTime = parseInt(timeSelect.value);
    
    // Reset game state
    timeLeft = selectedTime;
    isGameActive = false;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    linesCompleted = 0;
    textQueue = []; // Reset text queue to get fresh sentences
    usedSentences.clear(); // Reset used sentences tracking
    
    // Reset the stored keystroke counts
    window.previousTotalKeystrokes = 0;
    window.previousCorrectKeystrokes = 0;
    
    // Update UI
    timeElement.textContent = timeLeft;
    wpmElement.textContent = "0";
    accuracyElement.textContent = "100";
    
    // Generate new text
    generateNewText();
    
    // Reset typing position
    currentPosition = 0;
    typedText = "";
    
    // Reset and focus the input field
    inputField.value = "";
    inputField.disabled = false;
    inputField.focus();
    updateCursorPosition();
}

// Keep track of used sentences to avoid repetition
let usedSentences = new Set();

// Generate new text for typing
function generateNewText() {
    // Initialize text queue if empty
    if (textQueue.length === 0) {
        // Split each sample into sentences
        const allSentences = [];
        textSamples.forEach(sample => {
            // Split by periods, question marks, and exclamation points
            const sentences = sample.match(/[^.!?]+[.!?]+/g) || [sample];
            allSentences.push(...sentences);
        });
        
        // Filter out previously used sentences
        const availableSentences = allSentences.filter(sentence => !usedSentences.has(sentence.trim()));
        
        // If we've used most sentences, reset the used set
        if (availableSentences.length < 10) {
            usedSentences.clear();
        }
        
        // Shuffle sentences
        for (let i = availableSentences.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableSentences[i], availableSentences[j]] = [availableSentences[j], availableSentences[i]];
        }
        
        // Add to queue and mark as used
        textQueue = availableSentences.map(sentence => {
            const trimmed = sentence.trim();
            usedSentences.add(trimmed);
            return trimmed;
        });
    }
    
    // Get 3 sentences for display (or fewer if queue is smaller)
    const linesToShow = Math.min(3, textQueue.length);
    currentText = textQueue.slice(0, linesToShow).join(" ");
    
    // Display text with character spans for tracking
    typingText.innerHTML = "";
    currentText.split("").forEach(char => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        typingText.appendChild(charSpan);
    });
    
    // Position cursor at the beginning
    updateCursorPosition();
}

// Update cursor position
function updateCursorPosition() {
    const spans = typingText.querySelectorAll("span");
    
    if (currentPosition < spans.length) {
        const currentSpan = spans[currentPosition];
        const rect = currentSpan.getBoundingClientRect();
        const containerRect = typingContainer.getBoundingClientRect();
        
        // Add a small offset to prevent cutting off the first character
        typingCursor.style.left = (currentSpan.offsetLeft) + "px";
        typingCursor.style.top = (currentSpan.offsetTop) + "px";
        
        // Scroll if needed
        if (currentSpan.offsetTop > typingContainer.clientHeight - 50) {
            typingContainer.scrollTop = typingText.offsetHeight - typingContainer.clientHeight + 50;
        }
    }
}

// Start the game timer
function startTimer() {
    startTime = new Date();
    isGameActive = true;
    
    timer = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Calculate WPM (Words Per Minute)
function calculateWPM() {
    // Count completed lines as words (average 10 words per line)
    const completedWords = linesCompleted * 10;
    
    // Add current progress
    const currentText = inputField.value;
    const currentWords = currentText.length / 5;
    
    // Calculate total words
    const totalWords = completedWords + currentWords;
    
    // Calculate minutes
    const minutes = (new Date() - startTime) / 60000;
    
    // Return WPM
    return minutes > 0 ? Math.round(totalWords / minutes) : 0;
}

// Calculate accuracy percentage
function calculateAccuracy() {
    return totalKeystrokes > 0
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 100;
}

// Update metrics during gameplay
function updateMetrics() {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    wpmElement.textContent = wpm;
    accuracyElement.textContent = accuracy;
}

// Add new text when current text is completed
function addNewText() {
    // Save current metrics
    const currentWPM = calculateWPM();
    const currentAccuracy = calculateAccuracy();
    
    // Store the current keystroke counts before resetting
    const previousTotal = totalKeystrokes;
    const previousCorrect = correctKeystrokes;
    
    // Remove the first sentence from the queue
    textQueue.shift();
    linesCompleted++;
    
    // Reset input
    inputField.value = "";
    
    // Generate new text (this will add more text from the queue)
    generateNewText();
    
    // Reset typing position but keep the timer running
    currentPosition = 0;
    typedText = "";
    
    // Focus the input field
    inputField.focus();
    
    // Preserve the keystroke counts across text segments
    // We'll restore these values in checkInput
    window.previousTotalKeystrokes = previousTotal;
    window.previousCorrectKeystrokes = previousCorrect;
}

// End the game and save results
function endGame() {
    clearInterval(timer);
    isGameActive = false;
    endTime = new Date();
    inputField.disabled = true;
    
    // Get the total test duration
    const totalTime = parseInt(timeSelect.value);
    
    // Save results to localStorage
    const results = {
        wpm: calculateWPM(),
        accuracy: calculateAccuracy(),
        time: totalTime - timeLeft,
        totalDuration: totalTime,
        charsTyped: totalKeystrokes,
        correctChars: correctKeystrokes,
        incorrectChars: totalKeystrokes - correctKeystrokes
    };
    
    localStorage.setItem("typingResults", JSON.stringify(results));
    
    // Redirect to results page
    setTimeout(() => {
        window.location.href = "results.html";
    }, 1000);
}

// Check user input against the text
function checkInput() {
    const inputText = inputField.value;
    const textSpans = typingText.querySelectorAll("span");
    
    // Reset all spans
    textSpans.forEach(span => {
        span.className = "";
    });
    
    // Initialize window.previousTotalKeystrokes and window.previousCorrectKeystrokes if they don't exist
    if (typeof window.previousTotalKeystrokes === 'undefined') {
        window.previousTotalKeystrokes = 0;
        window.previousCorrectKeystrokes = 0;
    }
    
    // Track correct and incorrect keystrokes
    // Count the actual number of keystrokes, including previous segments
    totalKeystrokes = window.previousTotalKeystrokes + inputText.length;
    let currentCorrect = 0;
    
    // Compare each character independently
    for (let i = 0; i < inputText.length; i++) {
        if (i >= textSpans.length) break;
        
        if (inputText[i] === textSpans[i].textContent) {
            textSpans[i].classList.add("correct");
            currentCorrect++;
        } else {
            textSpans[i].classList.add("incorrect");
        }
    }
    
    // Update total correct keystrokes with actual count, including previous segments
    correctKeystrokes = window.previousCorrectKeystrokes + currentCorrect;
    
    // Mark current position
    if (inputText.length < textSpans.length) {
        textSpans[inputText.length].classList.add("current");
    }
    
    // Update metrics
    updateMetrics();
    
    // Check if first sentence is completed
    if (inputText.length === textSpans.length) {
        // Check if all characters are correct for the first sentence
        const allCorrect = currentCorrect === textSpans.length;
        if (allCorrect) {
            // Add new text instead of ending the game
            addNewText();
        }
    }
}

// Event listeners
inputField.addEventListener("input", () => {
    if (!isGameActive && inputField.value.length > 0) {
        startTimer();
    }
    
    checkInput();
});

restartBtn.addEventListener("click", () => {
    clearInterval(timer);
    initGame();
});

// Handle time selection change
timeSelect.addEventListener("change", () => {
    if (!isGameActive) {
        const selectedTime = parseInt(timeSelect.value);
        timeLeft = selectedTime;
        timeElement.textContent = timeLeft;
    }
});

// Focus input field when typing container is clicked
typingContainer.addEventListener("click", () => {
    inputField.focus();
});

// Initialize game on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded - initializing game");
    try {
        initGame();
        console.log("Game initialized successfully");
    } catch (error) {
        console.error("Error initializing game:", error);
    }
});
