
// 1. CONFIGURATION & CONSTANTS
// ------------------------------------------
// Local Node.js backend server URL.
// Why needed: API Key is hidden inside Node.js server (.env file) so browser users cannot see it.
// What it does: Points to our local backend server running at port 3000.
const API_URL = "http://localhost:3000/api/chat";


// 2. DOM SELECTION (GETTING HTML ELEMENTS)
// ------------------------------------------
// document.getElementById() locates an HTML element using its unique 'id' attribute.
// Why needed: Allows JavaScript to interact with webpage elements (read text, click buttons, modify DOM).

// References the main chat container div where message bubbles are displayed
const chatBox = document.getElementById("chatBox");

// References the text input field where the user types their message
const userInput = document.getElementById("userInput");

// References the Send button element
const sendBtn = document.getElementById("sendBtn");


// HELPER FUNCTION TO FORMAT BOLD TEXT (**text** -> <b>text</b>)
// ------------------------------------------
// Why needed: AI models format bold words using markdown double asterisks like **bold text**.
// What it does: Replaces double asterisks with <b> HTML bold tags so text renders bold on screen.
// Internal operation: Uses String.replace() with regex to find text wrapped between ** and **.
function formatBoldText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}


// 3. FUNCTION TO DYNAMICALLY CREATE AND DISPLAY CHAT BUBBLES
// ------------------------------------------
// Why needed: Creates new chat messages dynamically on the screen without re-loading the webpage.
// What it does: Uses createElement() to create HTML nodes, sets text content, and appends them to chatBox.
// Parameters:
//   - text: The message string to display.
//   - sender: 'user' or 'bot' (used to apply different CSS background colors and alignments).
function addMessage(text, sender) {

    // Step A: Create a new <div> element to hold the chat message box.
    // What happens internally: document.createElement() creates an unattached HTML node in browser memory (RAM).
    const messageDiv = document.createElement("div");

    // Step B: Set the class name on the div for CSS styling.
    // What happens internally: Assigns class string such as "message user" or "message bot".
    messageDiv.className = "message " + sender;

    // Step C: Create a <p> element to hold the actual text content.
    // Why needed: Paragraph element provides proper block spacing and readable text formatting inside bubble.
    const messageParagraph = document.createElement("p");

    // Step D: Put the message text inside the paragraph using innerHTML with bold formatting.
    // Why innerHTML: Allows rendering <b> HTML tags so bold text formatted with ** displays properly as bold.
    messageParagraph.innerHTML = formatBoldText(text);

    // Step E: Insert the paragraph element inside the outer message div container.
    // What happens internally: appendChild() attaches messageParagraph as a child DOM node of messageDiv.
    messageDiv.appendChild(messageParagraph);

    // Step F: Append the finished message div into the chat box area on the webpage.
    // What happens internally: Browser renders the new DOM elements visually on screen inside the chat window.
    chatBox.appendChild(messageDiv);

    // Step G: Scroll the chat box container to the very bottom automatically.
    // Why needed: Ensures newest messages are immediately visible without forcing the user to manually scroll down.
    // Internal operation: Sets scrollTop position value equal to the full scrollable height (scrollHeight) of chatBox.
    chatBox.scrollTop = chatBox.scrollHeight;

    // Return the created paragraph element so its text can be updated later if needed.
    return messageParagraph;
}


// 4. FUNCTION TO SEND MESSAGE TO LOCAL NODE.JS BACKEND USING FETCH
// ------------------------------------------
// Why needed: Sends user prompt to our Node.js server (which safely attaches hidden API key).
// 'async' keyword: Enables asynchronous execution so fetch() can wait for response without freezing browser UI.
async function fetchAIResponse(userMessage) {

    // Step 1: Define request HTTP headers (JSON format)
    const requestHeaders = {
        "Content-Type": "application/json"
    };

    // Step 2: Build JSON payload containing user message
    const requestPayload = {
        message: userMessage
    };

    // Step 3: Send POST request to local Node.js server (http://localhost:3000/api/chat)
    const response = await fetch(API_URL, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestPayload)
    });

    // Step 4: Check if HTTP response status is OK (200-299)
    if (!response.ok) {
        throw new Error("Server error! Status: " + response.status);
    }

    // Step 5: Convert response JSON text into JavaScript object
    const responseData = await response.json();

    // Step 6: Return extracted AI reply text sent from Node.js server
    return responseData.reply;
}


// 5. MAIN CONTROLLER FUNCTION (HANDLES SENDING MESSAGES)
// ------------------------------------------
// Why needed: Connects step 1 through step 10 by coordinating input reading, UI creation, API call, and error handling.
async function handleSendMessage() {

    // Step 1 & 2: Read user input value and trim extra white spaces from ends.
    // Why trim(): Prevents sending empty spaces or blank lines.
    const userText = userInput.value.trim();

    // Stop execution early if user did not type any message text.
    if (userText === "") {
        return;
    }

    // Step 3: Display user's message as a new chat bubble in chat window.
    addMessage(userText, "user");

    // Step 4: Clear input box text so user can type next message easily.
    userInput.value = "";

    // Step 5: Display temporary "Thinking..." bubble for bot while waiting for API.
    // Store paragraph node reference so we can replace text when reply arrives.
    const botParagraph = addMessage("Thinking...", "bot");

    // Step 6, 7 & 8: Send request to NVIDIA API and process response.
    try {
        // Call fetchAIResponse function and wait for AI text reply
        const replyText = await fetchAIResponse(userText);

        // Step 9: Update bot chat bubble text from "Thinking..." to actual AI answer (with bold formatting)
        botParagraph.innerHTML = formatBoldText(replyText);

    } catch (error) {
        // Display clear error message if backend server is not running or network fails
        botParagraph.innerText = "Error: " + error.message + ". Make sure 'node server.js' is running!";
    }

    // Step 10: Scroll to bottom of chat window after response is added or updated.
    chatBox.scrollTop = chatBox.scrollHeight;
}


// 6. EVENT LISTENERS (USER INTERACTION HANDLERS)
// ------------------------------------------
// Why needed: Tells browser to execute handleSendMessage function whenever user interacts with button or keyboard.

// Listen for mouse click event on Send button
sendBtn.addEventListener("click", handleSendMessage);

// Listen for keyboard keypress event on text input field
userInput.addEventListener("keypress", function(event) {
    // Check if key pressed by user is 'Enter' key
    if (event.key === "Enter") {
        // Prevent default browser form refresh behavior
        event.preventDefault();
        // Trigger send message function
        handleSendMessage();
    }
});
