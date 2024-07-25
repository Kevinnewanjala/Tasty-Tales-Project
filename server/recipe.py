from flask import request, jsonify, Blueprint
from  flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
import requests

# Local imports
from server.config import db, api
from server.models import Recipe, User, Tag, Review, Rating, RecipeTag

recipe_bp = Blueprint('recipe_bp', __name__)

def combine_ingredients(data):
    ingredients = []
    for i in range(1, 21):
        ingredient = data.get(f'strIngredient{i}')
        measure = data.get(f'strMeasure{i}')
        if ingredient and ingredient.strip() and measure and measure.strip():
            ingredients.append(f"{measure.strip()} {ingredient.strip()}")
    return '\n'.join(ingredients)

def get_or_create_tag(name):
    tag = Tag.query.filter_by(name=name).first()
    if not tag:
        tag = Tag(name=name)
        db.session.add(tag)
    return tag

@recipe_bp.route('/recipes')
def get_recipes():
    response = Recipe.query.all()
    recipes_data = []
    for recipe in response:
        recipe_data = {
            'id': recipe.id,
            'title': recipe.title,
            'imgUrl': recipe.imgUrl,
            'description': recipe.description,
            'ingredients': recipe.ingredients,
            'instructions': recipe.instructions,
            'author': recipe.author.username,
            'tags': [tag.name for tag in recipe.tags]
        }
        recipes_data.append(recipe_data)

    #print(recipes_data)
    return jsonify(recipes_data), 200

@recipe_bp.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    comments = Review.query.filter_by(recipe_id=recipe.id).all()
    ratings = Rating.query.filter_by(recipe_id=recipe.id).all()
    print(recipe.average_rating)
   
    # Serialize the recipe data
    recipe_data = {
        'id': recipe.id,
        'title': recipe.title,
        'imgUrl': recipe.imgUrl,
        'description': recipe.description,
        'ingredients': recipe.ingredients,
        'instructions': recipe.instructions,
        'author': recipe.author.username,
        'ratings': recipe.average_rating,
        'tags': [tag.name for tag in recipe.tags], 
        'comments': [comment.to_dict() for comment in comments]
    }

    return jsonify(recipe_data), 200

#@recipe_bp.route('/fetch_and_save/<meal_id>', methods=['GET'])
def fetch_and_save(meal_id):
    # Fetch data from the external API
    url = f'https://www.themealdb.com/api/json/v1/1/lookup.php?i={meal_id}'
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data'}), response.status_code
    
    data = response.json()
    if not data or 'meals' not in data or not data['meals']:
        return jsonify({'error': 'No data found'}), 404
    
    meal = data['meals'][0]
    #print(data)
    title = meal.get('strMeal')
    description = f"{meal.get('strCategory')} dish from {meal.get('strArea')}"
    ingredients = combine_ingredients(meal)
    instructions = meal.get('strInstructions')
    category = meal.get('strCategory')
    tags = meal.get('strTags')
    #print(title, description, ingredients, instructions, category)

    if not (title and description and ingredients and instructions):
        return jsonify({'error': 'All fields are required'}), 400
    
    # Extract relevant fields
    new_recipe = Recipe(
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        user_id=3,
        imgUrl=meal.get('strMealThumb')
    )
    if category:
        category_tag = get_or_create_tag(category)
        new_recipe.tags.append(category_tag)

    # Add additional tags
    if tags:
        tag_list = tags.split(',')
        for tag_name in tag_list:
            tag = get_or_create_tag(tag_name.strip())
            new_recipe.tags.append(tag)

    # Save the data to the database
    db.session.add(new_recipe)
    db.session.commit()

    return jsonify(new_recipe.to_dict()), 201

# search for recipe
@recipe_bp.route('/search', methods=['GET'])
def search_recipes():
    query = request.args.get('q')
    #print(query)
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # Search recipes by title or ingredients, or tag name
    results = Recipe.query.filter(
        or_(
            Recipe.title.ilike(f'%{query}%'),
            Recipe.ingredients.ilike(f'%{query}%')
        )
    ).all()

    return jsonify([recipe.to_dict() for recipe in results]), 200

# Add a comment to a recipe
@recipe_bp.route('/recipes/<int:id>/comments', methods=['POST'])
@jwt_required()
def add_comment(id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({'error': 'Content is required'}), 400

    new_comment = Review(
        content=content,
        user_id=current_user_id,
        recipe_id=id
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify(new_comment.to_dict()), 201


# Add a rating to the recipe
@recipe_bp.route('/recipes/<int:id>/ratings', methods=['POST'])
@jwt_required()
def add_rating(id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    score = data.get('score')

    new_rating = Rating(
        score=score,
        user_id=current_user_id,
        recipe_id=id
    )

    db.session.add(new_rating)
    db.session.commit()

    return jsonify(new_rating.to_dict()), 201


# add recipe
@recipe_bp.route('/recipes', methods=['POST'])
@jwt_required()
def add_recipe():
    current_user_id = get_jwt_identity()
    
    data = request.get_json()
    title = data.get('title')
    imgUrl = data.get('imgUrl')
    description = data.get('description')
    ingredients = data.get('ingredients')
    instructions = data.get('instructions')
    tags = data.get('tags', '')

    if not (title and description and ingredients and instructions):
        return jsonify({'error': 'All fields are required'}), 400

    new_recipe = Recipe(
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        user_id=current_user_id,
        imgUrl=imgUrl
    )

    # Handle tags
    if tags:
        tag_list = tags.split(',')
        for tag_name in tag_list:
            tag = get_or_create_tag(tag_name.strip())
            new_recipe.tags.append(tag)
    
    db.session.add(new_recipe)
    db.session.commit()

    return jsonify(new_recipe.to_dict()), 201


@recipe_bp.route('recipes/<int:id>', methods=['PUT'])
@jwt_required()
def update_recipe(id):
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    instructions = data.get('instructions')
    ingredients = data.get('ingredients')
    imgurl = data.get('imgUrl')

    recipe = Recipe.query.get(id)
    if not recipe or recipe.user_id != current_user:
        return jsonify({"msg": "Unauthorized"})
    
    if title:
        recipe.title = title
    if description:
        recipe.description = description
    if ingredients:
        recipe.ingredients = ingredients
    if instructions:
        recipe.instructions = instructions
    if imgurl:
        recipe.imgUrl = imgurl

    db.session.commit()
    return jsonify({"msg": "Recipe updated successfully"}), 200

@recipe_bp.route('recipes/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(id):
    current_user = get_jwt_identity()
    recipe = Recipe.query.get(id)
    if not recipe or recipe.user_id != current_user:
        return jsonify({"msg": "Unauthorized"}), 404
    
    db.session.delete(recipe)
    db.session.commit()

    return jsonify({"msg": "Recipe deleted successfully"}), 200

@recipe_bp.route('/user_recipes', methods=['GET'])
@jwt_required()
def get_user_recipes():
    current_user_id = get_jwt_identity()
    recipes = Recipe.query.filter_by(user_id=current_user_id).all()
    return jsonify([recipe.to_dict() for recipe in recipes]), 200