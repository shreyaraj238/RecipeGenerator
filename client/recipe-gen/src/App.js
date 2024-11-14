import './App.css';
import React, { useCallback, useEffect, useRef, useState } from "react";

// Component for the Recipe Input Form
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
    <div className="w-[400px] border rounded-lg overflow-hidden shadow-md p-6">
      <h2 className="font-bold text-xl mb-4">Recipe Generator</h2>
      
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
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none mt-4"
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
  const eventSourceRef = useRef(null);

  const initializeEventStream = useCallback(() => {
    const queryParams = new URLSearchParams(recipeData).toString();
    const url = `http://localhost:3000/recipeStream?${queryParams}`;

    eventSourceRef.current = new EventSource(url);
    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "close") {
        closeEventStream();
      } else if (data.action === "chunk") {
        console.log("Appending chunk:", data.chunk); // Debugging line
        setRecipeText((prev) => prev + data.chunk);
      }
    };

    eventSourceRef.current.onerror = () => {
      closeEventStream();
    };
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      setRecipeText(""); // Clear previous recipe text
      closeEventStream();
      initializeEventStream();
    }
  }, [recipeData, initializeEventStream]);

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const onSubmit = (data) => {
    setRecipeData(data);
  };

  return (
    <div className="App h-screen flex flex-col md:flex-row justify-center items-start gap-8 p-4">
      <RecipeCard onSubmit={onSubmit} />
      <div className="flex-1 border rounded-lg overflow-hidden shadow-md p-6">
        <h2 className="font-bold text-xl mb-4">Generated Recipe</h2>
        
        {/* Display recipeText in pre tag */}
        <pre className="whitespace-pre-wrap text-gray-800">{recipeText}</pre>
      </div>
    </div>
  );
}

export default App;