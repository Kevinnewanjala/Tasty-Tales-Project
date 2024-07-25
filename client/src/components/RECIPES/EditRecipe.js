import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../navbar';
import Footer from '../footer'
const API_URL=process.env.REACT_APP_API

const EditRecipes = ({ authState }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState([]);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        const fetchRecipe = async () => {
            console.log(id)
        try {
            const response = await axios.get(`${API_URL}/api/recipes/${id}`);
            setRecipe(response.data);
        } catch (err) {
            setError(err);
        }
        };

        fetchRecipe();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe({ ...recipe, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API_URL}/api/recipes/${id}`, recipe, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate('/myRecipes');
        } catch (error) {
            console.error("Error updating recipe:", error);
        }
    };
    const handleDelete = async (e) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/recipes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate('/myRecipes');
        } catch (error) {
            console.error("Error updating recipe:", error);
        }
    }

    return (
        <>
            <NavBar />
            <div>
                <h1>{recipe.title}</h1>
                <p>Written by:  {recipe.author}</p>
                <img src={recipe.imgUrl} alt={recipe.title} />
            
                <p>{recipe.description}</p>
            </div>
            <div className="row mt-5">
                <div className="col-12 mb-3">
                    <button onClick={handleDelete} className="btn btn-danger">Delete Recipe</button>
                </div>
            <h2>Edit Recipe</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="title" 
                        value={recipe.title} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ingredients</label>
                    <textarea 
                        className="form-control" 
                        name="ingredients" 
                        value={recipe.ingredients} 
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Instructions</label>
                    <textarea 
                        className="form-control" 
                        name="instructions" 
                        value={recipe.instructions} 
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Update Recipe</button>
            </form>
        </div>
            < Footer />
        </>
    );

}
export default EditRecipes;