import os
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

# Configuración de la aplicación
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Inicializar CORS
CORS(app)

# Inicializar la administración y comandos
setup_admin(app)
setup_commands(app)

# Registrar blueprints
app.register_blueprint(api, url_prefix='/api')

# Configuración de JWT
app.config["JWT_SECRET_KEY"] = "tu-clave-secreta"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
jwt = JWTManager(app)



def __repr__(self):
        return f'<User {self.email}>'

# Ruta de Registro de Usuario
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Usuario ya existe"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "Usuario creado exitosamente"}), 201

# Ruta de Inicio de Sesión
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity={'user_id': user.id, 'email': user.email, 'role': user.role})
        return jsonify({"message": "Autenticación exitosa", "token": access_token}), 200
    else:
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401

# Ruta Privada
@app.route('/private', methods=['GET'])
@jwt_required()
def private():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Generar sitemap
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Manejo de errores
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Ejecutar la aplicación
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)