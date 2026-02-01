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
let startTime;
let endTime;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let textQueue = [];
let linesCompleted = 0;
let currentLineIndex = 0;
let lineInputs = [];

// DOM elements
const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const typingContainer = document.getElementById("typing-container");
const restartBtn = document.getElementById("restart-btn");
const timeSelect = document.getElementById("time-select");
const inputField = document.getElementById("input-field"); // Kept for compatibility

// Keep track of used sentences to avoid repetition
let usedSentences = new Set();

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
    currentLineIndex = 0;
    lineInputs = [];
    textQueue = []; // Reset text queue to get fresh sentences
    usedSentences.clear(); // Reset used sentences tracking
    
    // Update UI
    timeElement.textContent = timeLeft;
    wpmElement.textContent = "0";
    accuracyElement.textContent = "100";
    
    // Clear typing container
    typingContainer.innerHTML = "";
    
    // Generate new text lines
    generateTextLines();
}

// Generate text lines with input fields
function generateTextLines() {
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
    
    // Clear existing lines
    typingContainer.innerHTML = "";
    lineInputs = [];
    
    // Create 3 lines (or fewer if queue is smaller)
    const linesToShow = Math.min(3, textQueue.length);
    
    // If no lines available, show a prompt
    if (linesToShow === 0) {
        const promptElement = document.createElement("div");
        promptElement.className = "typing-prompt";
        promptElement.textContent = "No more text available. Click restart to begin again.";
        typingContainer.appendChild(promptElement);
        return;
    }
    
    // Create each line with its input field
    for (let i = 0; i < linesToShow; i++) {
        const lineText = textQueue[i];
        createLineWithInput(lineText, i);
    }
    
    // Focus the first input
    if (lineInputs.length > 0) {
        lineInputs[0].focus();
        lineInputs[0].classList.add("active");
    }
}

// Create a line container with text display and input field
function createLineWithInput(text, index) {
    // Create container for this line
    const lineContainer = document.createElement("div");
    lineContainer.className = "typing-line-container";
    lineContainer.id = `line-container-${index}`;
    
    // Create text display element
    const textDisplay = document.createElement("div");
    textDisplay.className = "typing-text";
    textDisplay.id = `typing-text-${index}`;
    
    // Add character spans for tracking
    text.split("").forEach(char => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        textDisplay.appendChild(charSpan);
    });
    
    // Create input field for this line
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "typing-input";
    inputElement.id = `typing-input-${index}`;
    // Only add placeholder text for the first input field
    if (index === 0) {
        inputElement.placeholder = "Start typing here";
    }
    inputElement.autocomplete = "off";
    
    // Add input event listener
    inputElement.addEventListener("input", () => {
        if (!isGameActive && inputElement.value.length > 0) {
            startTimer();
        }
        
        checkLineInput(index);
    });
    
    // Add elements to container
    lineContainer.appendChild(textDisplay);
    lineContainer.appendChild(inputElement);
    
    // Add to typing container
    typingContainer.appendChild(lineContainer);
    
    // Store reference to input
    lineInputs.push(inputElement);
}

// Check input for a specific line
function checkLineInput(lineIndex) {
    const inputElement = lineInputs[lineIndex];
    const textDisplay = document.getElementById(`typing-text-${lineIndex}`);
    const spans = textDisplay.querySelectorAll("span");
    const inputText = inputElement.value;
    
    // Reset all spans
    spans.forEach(span => {
        span.className = "";
    });
    
    // Track correct keystrokes for this line
    let correctCount = 0;
    
    // Compare each character
    for (let i = 0; i < inputText.length; i++) {
        if (i >= spans.length) break;
        
        if (inputText[i] === spans[i].textContent) {
            spans[i].classList.add("correct");
            correctCount++;
        } else {
            spans[i].classList.add("incorrect");
        }
    }
    
    // Mark current position
    if (inputText.length < spans.length) {
        spans[inputText.length].classList.add("current");
    }
    
    // Update total keystrokes and correct keystrokes
    totalKeystrokes = lineIndex > 0 ?
        lineInputs.slice(0, lineIndex).reduce((sum, input) => sum + input.value.length, 0) + inputText.length :
        inputText.length;
    
    correctKeystrokes = lineIndex > 0 ?
        lineInputs.slice(0, lineIndex).reduce((sum, input, idx) => {
            const textSpans = document.getElementById(`typing-text-${idx}`).querySelectorAll("span");
            let correct = 0;
            for (let i = 0; i < input.value.length && i < textSpans.length; i++) {
                if (input.value[i] === textSpans[i].textContent) correct++;
            }
            return sum + correct;
        }, 0) + correctCount :
        correctCount;
    
    // Update metrics
    updateMetrics();
    
    // Check if line is completed correctly
    if (inputText.length === spans.length) {
        const allCorrect = correctCount === spans.length;
        if (allCorrect) {
            // Mark as completed
            inputElement.classList.add("completed");
            inputElement.disabled = true;
            
            // Move to next line if available
            if (lineIndex < lineInputs.length - 1) {
                lineInputs[lineIndex + 1].classList.add("active");
                lineInputs[lineIndex + 1].focus();
                currentLineIndex = lineIndex + 1;
            } else {
                // All lines completed, add more lines
                linesCompleted += lineInputs.length;
                
                // Remove completed lines from queue
                textQueue.splice(0, lineInputs.length);
                
                // Generate new lines
                generateTextLines();
            }
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
    
    // Add current progress from active inputs
    let currentInputChars = 0;
    lineInputs.forEach(input => {
        if (!input.disabled) {
            currentInputChars += input.value.length;
        }
    });
    
    // Convert characters to words (standard: 5 chars = 1 word)
    const currentWords = currentInputChars / 5;
    
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

// End the game and save results
function endGame() {
    clearInterval(timer);
    isGameActive = false;
    endTime = new Date();
    
    // Disable all input fields
    lineInputs.forEach(input => {
        input.disabled = true;
    });
    
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

// Restart button event listener
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
