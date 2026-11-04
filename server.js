// ==========================================
// NODE.JS BACKEND SERVER (Hiding API Key)
// ==========================================
// Why needed: Running API calls on the backend hides your secret API key from public view in browser code.

// 1. IMPORT REQUIRED MODULES
// express: Easy framework for building web servers in Node.js
const express = require("express");

// cors: Enables Cross-Origin Resource Sharing so browser frontend can safely talk to this server
const cors = require("cors");

// dotenv: Loads environment variables (like API_KEY) from .env file into process.env
require("dotenv").config();


// 2. INITIALIZE EXPRESS APPLICATION & PORT
const app = express();
const PORT = 3000;


// 3. MIDDLEWARE SETUP
// Enable CORS for all incoming requests from the browser
app.use(cors());

// Parse incoming JSON body from frontend fetch requests
app.use(express.json());


// 4. API ROUTE TO HANDLE CHAT REQUESTS
// Why needed: Frontend browser sends user prompt here instead of directly contacting NVIDIA.
app.post("/api/chat", async (req, res) => {
    try {
        // Step A: Extract user message sent from frontend script.js
        const userMessage = req.body.message;

        // Step B: Get secret API key safely from process.env (.env file)
        const apiKey = process.env.API_KEY;

        // Check if API key is configured
        if (!apiKey) {
            return res.status(500).json({ error: "API key is missing in .env file" });
        }

        // Step C: Prepare payload object for NVIDIA API
        const payload = {
            model: "model: "nvidia/nemotron-3-super-120b-a12b",",
            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 1024
        };

        // Step D: Call NVIDIA API from backend server (API key is hidden here!)
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify(payload)
        });

        // Handle unsuccessful API response from NVIDIA
        if (!response.ok) {
            throw new Error("NVIDIA API returned status: " + response.status);
        }

        // Step E: Convert response stream to JSON object
        const data = await response.json();

        // Step F: Extract AI text reply from NVIDIA response structure
        const replyText = data.choices[0].message.content;

        // Step G: Send JSON response back to frontend browser
        res.json({ reply: replyText });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// 5. START SERVER LISTENING ON PORT 3000
app.listen(PORT, () => {
    console.log("==========================================");
    console.log("Server is running on http://localhost:" + PORT);
    console.log("API Key is secure and hidden on backend!");
    console.log("==========================================");
});
