import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import NavBar from '../navbar';
import Footer from '../footer'

const API_URL=process.env.REACT_APP_API

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState(0)
 
 
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchRecipe();
  }, [id]);

  if (error) return <p>Error loading recipe: {error.message}</p>;
  if (!recipe) return <p>Loading...</p>;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return <p> You need to login first</p>
      const response = await axios.post(`${API_URL}/api/recipes/${id}/comments`,
         { content: commentContent }, 
         {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });
      console.log('Comment added:', response.data);
      setCommentContent('');
      // Fetch updated recipe data to display new comment
      const updatedRecipe = await axios.get(`${API_URL}/api/recipes/${id}`);
      console.log(updatedRecipe)
      setRecipe(updatedRecipe.data);
    } catch (err) {
      setError(err);
    }
  };
 
  const handleStarClick = async (starRating) => {
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/recipes/${id}/ratings`, { score: starRating }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Rating added', response.data)
      // Fetch updated recipe data to display new rating
      const updatedRecipe = await axios.get(`${API_URL}/api/recipes/${id}`);
      console.log(updatedRecipe);
      setRecipe(updatedRecipe.data);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <NavBar />
      <div className='container-fluid' 
        style={{
          backgroundColor: '#f1faf8', minHeight: '100vh',
          
          }}>
        <div className='row align-items-center'>
          <div className='col col-lg-6'>
            <img src={recipe.imgUrl} alt={recipe.title}
              className='img-fluid'
              style={{padding: "20px"}} />
          </div>
          <div className='col col-md-6'>
            <div style={{padding: "50px"}}>
              <h2>{recipe.title}</h2>
              <p>Written by:  {recipe.author}</p>
              
              <h3>Tags</h3>
              <ul className='list-group list-group-flush' style={{backgroundColor: "f1faf8"}}>
                {recipe.tags.map(tag => (
                  <li className='list-group-item' key={tag.id}>{tag}</li>
                ))}
              </ul>
              <p>{recipe.description}</p>
              <h3>Ratings</h3>
              {recipe.ratings> 0 ? (
                <div className="text-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{ fontSize: '30px', cursor: 'pointer', color: star <= recipe.ratings ? '#ffd700' : '#6c757d' }} 
                  >
                    ★
                  </span>
                ))}
                </div>
              ) : (
                <p>No ratings yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className='row align-items-center'>
          <div className='col-12'>
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients.split('\n').map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div className='col-12'>
            <h3>Instructions</h3>
            <ul>
              {recipe.instructions.split('\n').map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className='row'>
          <h3>Comments</h3>
            {recipe.comments.length > 0 ? (
              <ul>
                {recipe.comments.map(comment => (
                  <li key={comment.id}>
                    <span>{comment.author.username}</span><br />
                    {comment.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
        </div>
        <div className='row align-items-center'>
          
          <div className=" col mb-4" style={{width: "500px"}}>
            <h3>Leave a Review</h3>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{ fontSize: '30px', cursor: 'pointer', color: star <= rating ? '#ffd700' : '#6c757d' }}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}

            <form onSubmit={handleCommentSubmit} style={{width: "600px"}} >
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />
              <button type="submit">Submit Review</button>
            </form> 
          </div>
        
        </div>
        
      </div>
      <div>
      

        

      </div>
      <Footer />
    </>
  );
};

export default RecipeDetail;