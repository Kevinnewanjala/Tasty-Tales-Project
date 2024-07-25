import React, { useState } from 'react';

const API_URL=process.env.REACT_APP_API

const Review = () => {
  const [rating, setRating] = useState(0); // State to hold the rating
  const [comment, setComment] = useState(''); // State to hold the comment

  // Function to handle clicking on a star
  const handleStarClick = (starRating) => {
    setRating(starRating); // Set the rating based on the clicked star
  };

  // Function to handle comment change
  const handleCommentChange = (event) => {
    setComment(event.target.value); // Update comment state
  };

  // Function to submit the review
  const submitReview = async () => {
    const reviewData = { rating, comment };

    try {
      const response = await fetch('${API_URL}/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Optionally handle success response
      console.log('Review submitted successfully!');
      // Reset form or navigate to another page

    } catch (error) {
      console.error('Error submitting review:', error.message);
      // Handle error, show user feedback, etc.
    }
  };

  return (
    <div className="container-fluid" style={{ backgroundImage: 'url(https://images.pexels.com/photos/9821386/pexels-photo-9821386.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)', backgroundSize: 'cover', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow mt-5">
            <h2 className="text-center mb-4">Leave a Review</h2>
            <div className="text-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{ fontSize: '30px', cursor: 'pointer', color: star <= rating ? '#ffd700' : '#6c757d' }}
                  onClick={() => handleStarClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="form-group">
              <label>Comment:</label>
              <textarea
                className="form-control"
                value={comment}
                onChange={handleCommentChange}
                placeholder="Leave your comment here..."
                rows={4}
              />
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={submitReview}>
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;