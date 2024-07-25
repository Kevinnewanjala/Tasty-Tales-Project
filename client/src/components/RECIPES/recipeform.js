import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from '../navbar';
import Footer from '../footer';

const API_URL=process.env.REACT_APP_API

const RecipeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: '',
      imgUrl: '',
      description: '',
      ingredients: '',
      instructions: '',
      tags: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      imgUrl: Yup.string().url('Invalid URL'),
      description: Yup.string().required('Description is required'),
      ingredients: Yup.string().required('Ingredients are required'),
      instructions: Yup.string().required('Instructions are required'),
      tags: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/recipes/${data.id}`);
      } else {
        console.error('Failed to add recipe');
      }
    },
  });

  return (
    <>
      <NavBar />
       
      <div className='container' style={{ padding: "50px", background: 'url("https://st4.depositphotos.com/9012638/30613/i/450/depositphotos_306130638-stock-photo-herb-and-spices-cooking-background.jpg")'}}>
          <form onSubmit={formik.handleSubmit}>
          
          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="title">Title</label>
            <div className='col-sm-8'>
              <input
                type="text"
                id="title"
                name="title"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.title && formik.errors.title ? (
              <div>{formik.errors.title}</div>
            ) : null}
          </div>

          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="imgUrl">Image URL</label>
            <div className='col-sm-8'>
              <input
                type="text"
                id="imgUrl"
                name="imgUrl"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.imgUrl}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.imgUrl && formik.errors.imgUrl ? (
              <div>{formik.errors.imgUrl}</div>
            ) : null}
          </div>

          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="description">Description</label>
            <div className='col-sm-8'>
              <textarea
                id="description"
                name="description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.description && formik.errors.description ? (
              <div>{formik.errors.description}</div>
            ) : null}
          </div>

          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="ingredients">Ingredients</label>
            <div className='col-sm-8'>
              <textarea
                id="ingredients"
                name="ingredients"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.ingredients}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.ingredients && formik.errors.ingredients ? (
              <div>{formik.errors.ingredients}</div>
            ) : null}
          </div>

          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="instructions">Instructions</label>
            <div className='col-sm-8'>
              <textarea
                id="instructions"
                name="instructions"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.instructions}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.instructions && formik.errors.instructions ? (
              <div>{formik.errors.instructions}</div>
            ) : null}
          </div>

          <div className='row mb-3'>
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm" htmlFor="tags">Tags (comma-separated)</label>
            <div className='col-sm-8'>
              <input
                type="text"
                id="tags"
                name="tags"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.tags}
                class="form-control form-control-sm"
              />
            </div>
            
            {formik.touched.tags && formik.errors.tags ? (
              <div>{formik.errors.tags}</div>
            ) : null}
          </div>

          <button type="submit">Add Recipe</button>
        </form>
      </div>
      
      <Footer />
    </>
  );
};

export default RecipeForm;
