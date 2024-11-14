const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Integrate Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3001', // Replace with the actual React app URL
    methods: ['GET', 'POST'],
}));

app.get("/recipeStream", (req, res) => {
    const ingredients = req.query.ingredients;
    const mealType = req.query.mealType;
    const cuisine = req.query.cuisine;
    const cookingTime = req.query.cookingTime;
    const complexity = req.query.complexity;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendEvent = (chunk) => {
        if (chunk && chunk.choices && chunk.choices[0].finish_reason === "stop") {
            // Close the event stream
            res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
        } else {
            // Send a chunk of the response
            const chunkResponse = {
                action: "chunk",
                chunk: chunk.text || chunk.response?.text || "",
            };
            res.write(`data: ${JSON.stringify(chunkResponse)}\n\n`);
        }
    };

    const prompt = [
        `Generate a recipe that incorporates the following details:`,
        `[Ingredients: ${ingredients}]`,
        `[Meal Type: ${mealType}]`,
        `[Cuisine Preference: ${cuisine}]`,
        `[Cooking Time: ${cookingTime}]`,
        `[Complexity: ${complexity}]`,
        "Please provide a detailed recipe, including steps for preparation and cooking.",
        "The recipe should highlight the fresh and vibrant flavors of the ingredients.",
        "Also give the recipe a suitable name in its local language based on cuisine preference."
    ];

    // Call Gemini API to generate recipe content
    fetchGeminiCompletions(prompt.join(" "), sendEvent);

    req.on("close", () => {
        res.end(); // Close the response when the client disconnects
    });
});

async function fetchGeminiCompletions(prompt, callback) {
    // Initialize the Gemini API with API Key from environment variables
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    // Select the correct model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        // Generate content from the model based on the prompt
        const result = await model.generateContent(prompt);

        console.log("Gemini Response:", result); // Log the response for debugging

        const response = result.response; // Get the actual response
        let recipeText = '';

        // Check if response.text is a function, and invoke it if true
        console.log("response.text type:", typeof response.text);
        if (typeof response.text === 'function') {
            recipeText = response.text(); // Await the function if it returns a promise
            console.log("response.text result:", response.text());
        } else {
            recipeText = response.text || ''; // Otherwise, use the text directly
        }

        // Call the callback to send the response back to the client
        callback({ response: recipeText });

    } catch (error) {
        console.error("Error fetching Gemini completions:", error);
        callback({ response: 'Error generating recipe' }); // Send error message to the client
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
