// ==========================================
// NODE.JS BACKEND SERVER
// NVIDIA NEMOTRON 3.5 BOLT E4B
// ==========================================

// 1. IMPORT MODULES
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 2. INITIALIZE SERVER
const app = express();
const PORT = process.env.PORT || 3000;

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. NVIDIA API CONFIGURATION
const NVIDIA_API_URL =
    "https://integrate.api.nvidia.com/v1/chat/completions";

// 5. CHAT API ROUTE
app.post("/api/chat", async (req, res) => {
    try {

        // Step A: Get user message
        const userMessage = req.body.message;

        if (!userMessage || typeof userMessage !== "string") {
            return res.status(400).json({
                error: "Please provide a valid message."
            });
        }

        // Step B: Get API key from environment
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "NVIDIA API key is missing."
            });
        }

        // Step C: Prepare NVIDIA payload
        const payload = {
            model: "nvidia/nemotron-3.5-bolt-e4b",

            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ],

            temperature: 1,
            top_p: 0.95,
            max_tokens: 1024,
            seed: 42,

            // Non-streaming response for frontend compatibility
            stream: false,

            parallel_tool_calls: true,

            chat_template_kwargs: {
                enable_thinking: true
            }
        };

        // Step D: Send request to NVIDIA
        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",

            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify(payload)
        });

        // Step E: Handle NVIDIA errors
        if (!response.ok) {

            const errorDetails = await response.text();

            console.error("NVIDIA API Status:", response.status);
            console.error("NVIDIA API Details:", errorDetails);

            return res.status(502).json({
                error: "NVIDIA API request failed.",
                status: response.status,
                details: errorDetails
            });
        }

        // Step F: Read JSON response
        const data = await response.json();

        // Step G: Extract AI response
        const replyText = data.choices?.[0]?.message?.content;

        if (!replyText) {
            console.error("Unexpected NVIDIA response:", data);

            return res.status(502).json({
                error: "NVIDIA returned an empty response."
            });
        }

        // Step H: Send response to frontend
        res.json({
            reply: replyText
        });

    } catch (error) {

        console.error("Server Error:", error);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});

// 6. START SERVER
app.listen(PORT, () => {

    console.log("==========================================");
    console.log(`Server running on port ${PORT}`);
    console.log("NVIDIA Nemotron 3.5 Bolt E4B configured");
    console.log("API key loaded securely from environment");
    console.log("==========================================");

});
