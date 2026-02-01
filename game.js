// Track which samples have been used
let usedSampleIndices = [];

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
    
    // Don't reset usedSampleIndices here to ensure we cycle through all samples
    
    // Update UI
    timeElement.textContent = timeLeft;
    wpmElement.textContent = "0";
    accuracyElement.textContent = "100";
    
    // Clear typing container
    typingContainer.innerHTML = "";
    
    // Set optimal container height based on screen size
    adjustContainerHeight();
    
    // Generate new text lines
    generateTextLines();
}

// Adjust typing container height based on screen size
function adjustContainerHeight() {
    const typingContainer = document.getElementById("typing-container");
    if (!typingContainer) return;
    
    // Get viewport height
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal height (smaller on mobile)
    let optimalHeight;
    if (viewportHeight < 500) {
        // Very small screens (landscape mobile)
        optimalHeight = Math.max(150, viewportHeight * 0.3);
    } else if (viewportHeight < 700) {
        // Small screens (most mobiles)
        optimalHeight = Math.max(200, viewportHeight * 0.35);
    } else if (viewportHeight < 900) {
        // Medium screens (tablets, small laptops)
        optimalHeight = Math.max(250, viewportHeight * 0.4);
    } else {
        // Large screens
        optimalHeight = Math.max(300, viewportHeight * 0.45);
    }
    
    // Apply the height
    typingContainer.style.height = `${Math.round(optimalHeight)}px`;
}

// Function to get the next random text sample
function getNextTextSample() {
    // If all samples have been used, reset the used indices
    if (usedSampleIndices.length === textSamples.length) {
        usedSampleIndices = [];
    }
    
    // Get available sample indices
    const availableIndices = textSamples.map((_, index) => index)
        .filter(index => !usedSampleIndices.includes(index));
    
    // Pick a random index from available indices
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const selectedIndex = availableIndices[randomIndex];
    
    // Mark this index as used
    usedSampleIndices.push(selectedIndex);
    
    // Return the selected sample
    return textSamples[selectedIndex];
}

// Generate text lines with input fields - showing two lines at a time
function generateTextLines() {
    // Initialize text queue if empty
    if (textQueue.length === 0) {
        // Get a random text sample
        const sample = getNextTextSample();
        
        // Split the sample into sentences
        const sentences = sample.match(/[^.!?]+[.!?]+/g) || [sample];
        
        // Process sentences to fit screen width
        const processedSentences = [];
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            
            // Always split into smaller chunks to fit screen width
            // Determine max length based on screen width
            const screenWidth = window.innerWidth;
            let maxLength;
            
            if (screenWidth <= 320) {
                maxLength = 25; // Very small phones
            } else if (screenWidth <= 480) {
                maxLength = 35; // Small phones
            } else if (screenWidth <= 768) {
                maxLength = 45; // Large phones/small tablets
            } else {
                maxLength = 60; // Tablets and desktops
            }
            
            // Split into chunks
            if (trimmed.length > maxLength) {
                // Find natural breaking points (commas, semicolons, etc.)
                const breakPoints = trimmed.match(/[^,;:]+[,;:]/g);
                
                if (breakPoints && breakPoints.length > 1 &&
                    breakPoints.every(chunk => chunk.length <= maxLength * 1.2)) {
                    // Use natural breaks if they're not too long
                    breakPoints.forEach(chunk => {
                        processedSentences.push(chunk.trim());
                    });
                } else {
                    // Otherwise split into chunks of appropriate length
                    let start = 0;
                    while (start < trimmed.length) {
                        // Find a space near the maxLength mark
                        let end = Math.min(start + maxLength, trimmed.length);
                        if (end < trimmed.length) {
                            // Look for a space to break at
                            while (end > start && trimmed[end] !== ' ') {
                                end--;
                            }
                            // If no space found, just use the maxLength mark
                            if (end === start) {
                                end = Math.min(start + maxLength, trimmed.length);
                            }
                        }
                        processedSentences.push(trimmed.substring(start, end).trim());
                        start = end;
                    }
                }
            } else {
                // For shorter sentences, keep as is
                processedSentences.push(trimmed);
            }
        });
        
        // Add processed sentences to the queue
        textQueue = processedSentences;
        
        console.log("New text sample selected:", sample.substring(0, 50) + "...");
    }
    
    // Clear existing lines
    typingContainer.innerHTML = "";
    lineInputs = [];
    
    // If no lines available, show a prompt
    if (textQueue.length === 0) {
        const promptElement = document.createElement("div");
        promptElement.className = "typing-prompt";
        promptElement.textContent = "No more text available. Click restart to begin again.";
        typingContainer.appendChild(promptElement);
        return;
    }
    
    // Create two lines (or one if only one is available)
    const linesToShow = Math.min(2, textQueue.length);
    for (let i = 0; i < linesToShow; i++) {
        createLineWithInput(textQueue[i], i);
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

// Check input for a specific line with word-based validation
function checkLineInput(lineIndex) {
    const inputElement = lineInputs[lineIndex];
    const textDisplay = document.getElementById(`typing-text-${lineIndex}`);
    const spans = textDisplay.querySelectorAll("span");
    const inputText = inputElement.value;
    
    // Get the target text
    const targetText = Array.from(spans).map(span => span.textContent).join('');
    
    // Reset all spans
    spans.forEach(span => {
        span.className = "";
    });
    
    // Track correct keystrokes and errors for this line
    let correctCount = 0;
    let errorCount = 0;
    
    // Split text into words and track positions
    const targetWords = targetText.split(' ');
    const inputWords = inputText.split(' ');
    
    let targetCharIndex = 0;
    let inputCharIndex = 0;
    
    // Process each word
    for (let wordIndex = 0; wordIndex < Math.min(targetWords.length, inputWords.length); wordIndex++) {
        const targetWord = targetWords[wordIndex];
        const inputWord = inputWords[wordIndex];
        
        // Check if this is the last word being typed (still in progress)
        const isLastTypedWord = wordIndex === inputWords.length - 1;
        
        // Compare characters within this word
        for (let charIndex = 0; charIndex < Math.max(targetWord.length, inputWord.length); charIndex++) {
            // For the last word being typed, only validate up to the number of characters typed
            // For previous words, validate the entire word
            if (isLastTypedWord && charIndex >= inputWord.length) {
                // Don't validate or mark characters that haven't been typed yet in the current word
                continue;
            }
            
            if (charIndex < targetWord.length && charIndex < inputWord.length) {
                // Both target and input have this character
                if (targetWord[charIndex] === inputWord[charIndex]) {
                    if (targetCharIndex + charIndex < spans.length) {
                        spans[targetCharIndex + charIndex].classList.add("correct");
                        correctCount++;
                    }
                } else {
                    if (targetCharIndex + charIndex < spans.length) {
                        spans[targetCharIndex + charIndex].classList.add("incorrect");
                        errorCount++;
                    }
                }
            } else if (charIndex < targetWord.length) {
                // Missing character in input (only for completed words)
                if (!isLastTypedWord && targetCharIndex + charIndex < spans.length) {
                    spans[targetCharIndex + charIndex].classList.add("incorrect");
                    errorCount++;
                }
            } else {
                // Extra character in input - no span to mark
                errorCount++;
            }
        }
        
        // For the last word, mark the next character to be typed as "current"
        if (isLastTypedWord && inputWord.length < targetWord.length &&
            targetCharIndex + inputWord.length < spans.length) {
            spans[targetCharIndex + inputWord.length].classList.add("current");
        }
        
        // Move indices past this word and the following space
        targetCharIndex += targetWord.length + 1; // +1 for space
        inputCharIndex += inputWord.length + 1;  // +1 for space
        
        // Mark the space after the word if it exists
        if (wordIndex < targetWords.length - 1 && targetCharIndex - 1 < spans.length) {
            if (wordIndex < inputWords.length - 1) {
                // Space exists in both target and input
                spans[targetCharIndex - 1].classList.add("correct");
                correctCount++;
            } else {
                // Space missing in input
                spans[targetCharIndex - 1].classList.add("current");
            }
        }
    }
    
    // Mark current position if not at the end
    if (inputText.length < targetText.length && inputText.length < spans.length) {
        spans[inputText.length].classList.add("current");
    }
    
    // Update total keystrokes and correct keystrokes
    totalKeystrokes = lineIndex > 0 ?
        lineInputs.slice(0, lineIndex).reduce((sum, input) => sum + input.value.length, 0) + inputText.length :
        inputText.length;
    
    correctKeystrokes = lineIndex > 0 ?
        lineInputs.slice(0, lineIndex).reduce((sum, input, idx) => {
            // Word-based matching for previous lines
            const textDisplay = document.getElementById(`typing-text-${idx}`);
            if (!textDisplay) return sum;
            
            const spans = textDisplay.querySelectorAll("span");
            const targetText = Array.from(spans).map(span => span.textContent).join('');
            const lineInputText = input.value;
            
            // Split into words
            const targetWords = targetText.split(' ');
            const inputWords = lineInputText.split(' ');
            
            let correct = 0;
            let targetCharIndex = 0;
            
            // Process each word
            for (let wordIndex = 0; wordIndex < Math.min(targetWords.length, inputWords.length); wordIndex++) {
                const targetWord = targetWords[wordIndex];
                const inputWord = inputWords[wordIndex];
                
                // Compare characters within this word
                for (let charIndex = 0; charIndex < Math.min(targetWord.length, inputWord.length); charIndex++) {
                    if (targetWord[charIndex] === inputWord[charIndex]) {
                        correct++;
                    }
                }
                
                // Count space after word if not the last word
                if (wordIndex < targetWords.length - 1 && wordIndex < inputWords.length - 1) {
                    correct++;
                }
            }
            
            return sum + correct;
        }, 0) + correctCount :
        correctCount;
    
    // Update metrics
    updateMetrics();
    
    // Word-based completion check with last word verification
    // Basic check: have we typed at least as many words as the target?
    const hasTypedAllWords = inputWords.length >= targetWords.length;
    
    // Last word check: is the last word fully typed?
    let isLastWordComplete = false;
    
    // Define these variables outside the if statement so they're available for logging
    const lastInputWord = inputWords.length > 0 ? inputWords[inputWords.length - 1] : "";
    const lastTargetWord = targetWords.length > 0 ? targetWords[targetWords.length - 1] : "";
    
    if (inputWords.length > 0 && targetWords.length > 0) {
        // Check if the last word is at least as long as the target last word
        // This ensures we've typed the full last word
        isLastWordComplete = lastInputWord.length >= lastTargetWord.length;
    }

        
    // Only complete if we've typed all words AND the last word is complete
    if (hasTypedAllWords && isLastWordComplete && inputText.length > 0) {
        // Move to next line only when last word is fully typed
        
        // Mark as completed
        inputElement.classList.add("completed");
        inputElement.disabled = true;
        
        // Line completed, increment counter
        linesCompleted++;
        
        // Remove completed line from queue
        textQueue.shift();
        
        // If there are more lines in the queue, add a new line at the bottom
        if (textQueue.length >= lineInputs.length) {
            // Create a new line at the bottom
            createLineWithInput(textQueue[lineInputs.length], lineInputs.length);
            
            // Always focus the next input (which should be at index lineIndex + 1)
            if (lineIndex + 1 < lineInputs.length) {
                // Remove active class from all inputs
                lineInputs.forEach(input => input.classList.remove("active"));
                
                // Add active class to next input
                lineInputs[lineIndex + 1].classList.add("active");
                
                // Focus the next input - use a more reliable approach
                setTimeout(() => {
                    try {
                        // Force blur first
                        inputElement.blur();
                        
                        // Then focus the next input
                        lineInputs[lineIndex + 1].focus();
                        
                        // Scroll to show the next line
                        const nextLineContainer = document.getElementById(`line-container-${lineIndex + 1}`);
                        if (nextLineContainer) {
                            nextLineContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        
                    } catch (e) {
                        console.error("Error moving focus:", e);
                    }
                }, 100); // Longer delay to ensure DOM is updated
            }
        } else {
            // No more lines in the queue, generate new lines
            generateTextLines();
            
            // Focus the first input of the new lines
            setTimeout(() => {
                if (lineInputs.length > 0) {
                    lineInputs[0].focus();
                }
            }, 50);
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

// Adjust container height when window is resized
window.addEventListener("resize", () => {
    if (!isGameActive) {
        // Only adjust height when not actively typing
        adjustContainerHeight();
    }
});
