from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from werkzeug.security import generate_password_hash, check_password_hash

from server.config import db, bcrypt

# Models go here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String(128))

    recipes = db.relationship('Recipe', back_populates='author')
    reviews = db.relationship('Review', back_populates='author')
    ratings = db.relationship('Rating', back_populates='user')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    

    serialize_only = ('id', 'username', 'email')
    
class Recipe(db.Model, SerializerMixin):
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    imgUrl = db.Column(db.String(200), nullable=True)

    serialize_only = ('id', 'title', 'description', 'ingredients', 'instructions','author.username',
                      'tags.name', 'imgUrl')

    #relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    author = db.relationship('User', back_populates='recipes')
    ratings = db.relationship('Rating', back_populates='recipe', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='recipe', cascade='all, delete-orphan')
    recipe_tags = db.relationship('RecipeTag', back_populates='recipe')
    # Association proxy to get tags for this recipe through recipetag
    tags = association_proxy('recipe_tags', 'tag',
                                  creator=lambda tag_obj: RecipeTag(tag=tag_obj))


    @property
    def average_rating(self):
        if self.ratings:
            return sum(rating.score for rating in self.ratings) / len(self.ratings)
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'imgUrl': self.imgUrl,
            'description': self.description,
            'ingredients': self.ingredients,
            'instructions': self.instructions,
            'user_id': self.user_id,
        }

class Review(db.Model, SerializerMixin):
    __tablename__ = 'comments'

    serialize_only = ("id", "author.username", "content", "user_id", "recipe_id")
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String, nullable=False)

    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id', ondelete='CASCADE'))
    recipe = db.relationship('Recipe', back_populates='reviews')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    author = db.relationship('User', back_populates='reviews')

    serialize_only = ('id', 'content', 'recipe_id', 'author.username')
class Rating(db.Model, SerializerMixin):
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    user = db.relationship('User', back_populates='ratings')
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id', ondelete='CASCADE'))
    recipe = db.relationship('Recipe', back_populates='ratings')

    serialize_only = ('id', 'score', 'recipe_id')
class Tag(db.Model, SerializerMixin):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable = False)
    recipe_tags = db.relationship('RecipeTag', back_populates='tag')

    # Association proxy to get recipes for this tag through recipetag
    recipes = association_proxy('recipe_tags', 'recipe',
                                  creator=lambda recipe_obj: RecipeTag(recipe=recipe_obj))

class RecipeTag(db.Model, SerializerMixin):
    __tablename__ = 'recipe-tags'

    id = db.Column(db.Integer, primary_key=True)
    user_note = db.Column(db.String)

    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'))
    # Relationship mapping the recipetag to related recipe
    recipe = db.relationship('Recipe', back_populates='recipe_tags')
    # Relationship mapping the recipetag to related tag
    tag = db.relationship('Tag', back_populates='recipe_tags')

    