import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './recipeCard';
import NavBar from '../navbar';
import Footer from '../footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL=process.env.REACT_APP_API

const MyRecipes = ({ authState }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRecipes = async () => {
            const token = localStorage.getItem('token');
            console.log(token)
            try {
                const response = await axios.get('${API_URL}/api/user_recipes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setRecipes(response.data);
                console.log(recipes)
            } catch (error) {
                console.error("Error fetching user recipes:", error);
            } finally {
                setLoading(false); // Ensure loading state is updated
            }
        };
        fetchUserRecipes();
    }, []);

    const backgroundImageUrl = 'https://images.pexels.com/photos/4346328/pexels-photo-4346328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    // Define an array of background colors for recipe cards
    const cardColors = ['#f4a261', '#43aa8b', '#f3722c', '#577590', '#f9c74f', '#90be6d'];

    return (
        <>
            <NavBar />
            <div
                className="container-fluid p-0"
                style={{
                    backgroundImage: `url(${backgroundImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    overflowX: 'hidden',
                    backgroundAttachment: 'fixed',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                }}
            >
                <div className="container mt-4">
                    <h1 className="mb-4" style={{ color: '#ff69b4', fontWeight: 'bold', fontFamily: 'cursive', fontSize: '3rem' }}> My Recipes</h1>
                    <div className="row">
                        {loading ? (
                            <p>Loading...</p>  // Placeholder for loading state
                        ) : recipes.length === 0 ? (
                            <p>No recipes found.</p>  // Placeholder for empty state
                        ) : (
                            recipes.map((recipe, index) => (
                                <div key={recipe.id} className="col-10 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
                                    <Link to={`/recipes/${recipe.id}`}>
                                        <div className="card" style={{ backgroundColor: cardColors[index % cardColors.length], padding: '10px', borderRadius: '10px', height: '100%' }}>
                                            <RecipeCard recipe={recipe} />
                                            <Link to={`/editrecipe/${recipe.id}`}>
                                                <button>Edit Recipe</button>
                                            </Link>
                                        </div>
                                    </Link>
                                    
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyRecipes;
