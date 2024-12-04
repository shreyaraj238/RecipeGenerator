import './App.css';
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faScroll, faCarrot } from '@fortawesome/free-solid-svg-icons'; 

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");

  const handleSubmit = () => {
    const recipeData = { ingredients, mealType, cuisine, cookingTime, complexity };
    onSubmit(recipeData);
  };

  return (
    <div className="w-[400px] border rounded-lg overflow-hidden shadow-md p-6 bg-white">
      <div className="flex justify-center items-center mb-4">
        <FontAwesomeIcon icon={faScroll} className="mr-3 text-xl" />
        <h2 className="font-bold text-xl text-green-700">Recipe Generator Form</h2>
      </div>

      {/* Ingredients Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Ingredients</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
          type="text"
          placeholder="Enter ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </div>

      {/* Meal Type Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Meal Type</label>
        <select
          className="shadow border rounded w-full py-2 px-3"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="">Select Meal Type</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
      </div>

      {/* Cuisine Preference Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Cuisine Preference</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
          type="text"
          placeholder="e.g., Italian, Mexican"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
      </div>

      {/* Cooking Time Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Cooking Time</label>
        <select
          className="shadow border rounded w-full py-2 px-3"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
        >
          <option value="">Select Cooking Time</option>
          <option value="Less than 30 minutes">Less than 30 minutes</option>
          <option value="30-60 minutes">30-60 minutes</option>
          <option value="More than 1 hour">More than 1 hour</option>
        </select>
      </div>

      {/* Complexity Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Complexity</label>
        <select
          className="shadow border rounded w-full py-2 px-3"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
        >
          <option value="">Select Complexity</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none mt-4 transition-all"
        onClick={handleSubmit}
      >
        Generate Recipe
      </button>
    </div>
  );
};

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState("");

  const initializeRecipeGeneration = useCallback(async () => {
    const queryParams = new URLSearchParams(recipeData).toString();
    const url = `http://localhost:3000/recipe?${queryParams}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const formattedRecipeText = formatRecipeWithCheckboxes(data.recipe);
      setRecipeText(formattedRecipeText);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setRecipeText("Error generating recipe.");
    }
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      setRecipeText("");
      initializeRecipeGeneration();
    }
  }, [recipeData, initializeRecipeGeneration]);

  const onSubmit = (data) => {
    setRecipeData(data);
  };

  const formatRecipeWithCheckboxes = (recipeText) => {
    // Extract ingredients section to include checkboxes for ingredient checklist
    const ingredientsStart = recipeText.indexOf("**Ingredients:**");
    const instructionsStart = recipeText.indexOf("**Instructions:**");
    
    if (ingredientsStart === -1 || instructionsStart === -1) {
      return recipeText;
    }

    const ingredientsSection = recipeText.slice(ingredientsStart + 15, instructionsStart).trim();
    const ingredientsList = ingredientsSection.split("\n*").map((ingredient, index) => {
      return `<div><input type="checkbox" id="ingredient-${index}" /> <label for="ingredient-${index}">${ingredient.trim()}</label></div>`;
    });

    const beforeIngredients = recipeText.slice(0, ingredientsStart + 15);
    const afterInstructions = recipeText.slice(instructionsStart);
    return beforeIngredients + "\n" + ingredientsList.join("\n") + "\n" + afterInstructions;
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-pattern bg-cover">
      <header className="header-title">
        <h1 className="text-4xl font-extrabold text-white">
          <FontAwesomeIcon icon={faUtensils} className="mr-3" />
          Recipe Generator
        </h1>
      </header>

      <div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-24">
        <RecipeCard onSubmit={onSubmit} />
        <div className="flex-1 border rounded-lg overflow-hidden shadow-md p-6 bg-white">
          <div className="flex justify-center items-center mb-4">
            <FontAwesomeIcon icon={faCarrot} className="mr-3 text-xl" />
            <h2 className="font-bold text-xl text-green-700">Generated Recipe</h2>
          </div>
          <div
            className="whitespace-pre-wrap text-gray-800"
            dangerouslySetInnerHTML={{ __html: recipeText }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
