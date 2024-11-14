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

app.get("/recipe", async (req, res) => {
    const ingredients = req.query.ingredients;
    const mealType = req.query.mealType;
    const cuisine = req.query.cuisine;
    const cookingTime = req.query.cookingTime;
    const complexity = req.query.complexity;

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
    try {
        const recipeText = await fetchGeminiCompletions(prompt.join(" "));
        
        // Send the entire recipe as a single response
        res.json({ recipe: recipeText });
    } catch (error) {
        console.error("Error fetching Gemini completions:", error);
        res.status(500).json({ recipe: 'Error generating recipe' }); // Send error message to the client
    }
});

async function fetchGeminiCompletions(prompt) {
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
        if (typeof response.text === 'function') {
            recipeText = await response.text(); // Await the function if it returns a promise
        } else {
            recipeText = response.text || ''; // Otherwise, use the text directly
        }

        return recipeText;
    } catch (error) {
        console.error("Error fetching Gemini completions:", error);
        throw new Error('Error generating recipe');
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});