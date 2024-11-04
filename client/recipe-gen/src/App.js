import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState } from "react";

const RecipeCard = ({onSubmit}) => {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");

  const handleSubmit = () => {
    const recipeData = {
      ingredients,
      mealType,
      cuisine,
      cookingTime,
      complexity,
    };
    onSubmit(recipeData);
  };
  
  return (
    <div className='w-[400px] border rounded-lg overflow-hidden shadow-1g'>
      <div className = "px-6 py-4">
      <div className = "font-bold text-xl mb-2">Recipe Generator</div>
        <div className="mb-4">
          <label
            className = "block text-gray-700 text-sm font-bold mb-2"
            htmlFor= "ingredients"
          >
            Ingredients
          </label>
          <input
            className = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
            id = "ingredients"
            type="text"
            placeholder = "Enter ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="mealType"
          >
            Meal Type
          </label>
          <select
            className= "block appearance-none w-full bg-white border border-gray-400 hover: border-gray-500"
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="cuisine"
          >
            Cuisine Preference
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight"
            id="cuisine"
            type="text"
            placeholder="e.g., Italian, Mexican"
            value={cuisine}
            onChange={(e) => setCuisine (e.target.value)}
          />
        </div> 
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="cookingTime"
          >
            Cooking Time
          </label>
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover: border-gray-500"
            id="cookingTime"
            value={cookingTime}
            onChange={(e) => setCookingTime (e.target.value)}
          >
            <option value="Less than 30 minutes">Less than 30 minutes</option>
            <option value="30-60 minutes">30-60 minutes</option>
            <option value="More than 1 hour">More than 1 hour</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="complexity"
          >
            Complexity
          </label>
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover: border-gray-500"
            id="complexity"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="px-6 py-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus: outline"
            type="button"
            onClick={handleSubmit}
          >
            Generate Recipe
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState ("");

  let eventSourceRef = useRef(null)

  useEffect(()=>{
    if(recipeData){
      closeEventStream();
      initializeEventStream()
    }
  }, [recipeData])

  const initializeEventStream = () => {
    const recipeInputs = {... recipeData };

    const queryParams = new URLSearchParams(recipeInputs).toString();
    const url = `http://localhost:3000/recipeStream?${queryParams}`;
    eventSourceRef.current = new EventSource(url);
    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if(data.action === "close") {
        closeEventStream()
      } else if (data.action === 'chunk'){
        setRecipeText((prev) => prev + data.chunk)
      }
    }

    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
  }

  const closeEventStream = () => {
    if(eventSourceRef.current){
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  async function onSubmit(data){
    setRecipeText('');
    setRecipeData(data);
  }

  return (
    <div className="App">
      <div className="flex flex-row h-full my-4 gap-2 justify-center">
        <RecipeCard onSubmit={onSubmit} />
        <div className='flex-1 border rounded-lg overflow-hidden shadow-1g p-4'>
          <h2 className="font-bold text-xl mb-2">Generated Recipe</h2>
          <pre>{recipeText}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;