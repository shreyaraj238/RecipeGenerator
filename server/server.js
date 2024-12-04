const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Integrate Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:3001', //React app URL
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

    // Call Gemini API
    try {
        const recipeText = await fetchGeminiCompletions(prompt.join(" "));
        
        res.json({ recipe: recipeText });
    } catch (error) {
        console.error("Error fetching Gemini completions:", error);
        res.status(500).json({ recipe: 'Error generating recipe' });
    }
});

async function fetchGeminiCompletions(prompt) {
    // Initialize the Gemini API with API Key- need to input personal API key in .env file
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    // Modify to include the correct model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent(prompt);

        console.log("Gemini Response:", result); 

        const response = result.response;
        let recipeText = '';

        if (typeof response.text === 'function') {
            recipeText = await response.text(); // Await the function to see if it returns a promise
        } else {
            recipeText = response.text || ''; 
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