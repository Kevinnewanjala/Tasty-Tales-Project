#!/usr/bin/env python3


# Remote library imports
from flask import Flask, request, make_response, jsonify, session
from flask_restful import Resource, Api  #  imported Api
from flask_migrate import Migrate  #  imported Migrate

# Local imports
from server.config import app, db, api
from server.authenticate import authenticate_bp, init_jwt
from server.recipe import recipe_bp
# Add your model imports
from models import User, Recipe, Rating, RecipeTag, Review, Tag

# app = Flask(__name__)
# app.secret_key = b'Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K'
# # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.json.compact = False

# # Initialize database and migration
# db.init_app(app)
# migrate = Migrate(app, db)
# Initialize Flask-Restful Api
api.init_app(app)
init_jwt(app)
app.register_blueprint(authenticate_bp, url_prefix='/user')
app.register_blueprint(recipe_bp, url_prefix='/api')
# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


class RecipeResource(Resource):
    def get(self):
        response = [recipe.to_dict() for recipe in Recipe.query.all()]
        return jsonify(response), 200
        

api.add_resource(RecipeResource, '/recipes')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

