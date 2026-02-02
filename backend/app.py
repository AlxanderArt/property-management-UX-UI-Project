import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from dotenv import load_dotenv
from models import db, Property, Tenant, Payment, User

load_dotenv()

app = Flask(__name__)

# CORS Configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins != '*':
    cors_origins = cors_origins.split(',')
CORS(app, origins=cors_origins)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'sqlite:///' + os.path.join(basedir, 'property_manager.db')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-in-production')
jwt = JWTManager(app)

db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()

# --- Auth Routes ---
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Email, password, and name are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(email=data['email'], name=data['name'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token, 'user': user.to_dict()}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token, 'user': user.to_dict()})

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())

# --- Property Routes ---
@app.route('/properties', methods=['GET'])
@jwt_required()
def get_properties():
    props = Property.query.all()
    return jsonify([p.to_dict() for p in props])

@app.route('/properties', methods=['POST'])
@jwt_required()
def create_property():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('address'):
        return jsonify({'error': 'Address is required'}), 400
    if not data.get('monthlyRent'):
        return jsonify({'error': 'Monthly rent is required'}), 400

    new_prop = Property(
        address=data.get('address'),
        unit_count=data.get('unitCount', 1),
        monthly_rent=data.get('monthlyRent'),
        status=data.get('status', 'vacant'),
        property_type=data.get('type', 'Residential'),
        image_url=data.get('imageUrl')
    )
    db.session.add(new_prop)
    db.session.commit()
    return jsonify(new_prop.to_dict()), 201

@app.route('/properties/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_property(id):
    prop = Property.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(prop)
        db.session.commit()
        return jsonify({'message': 'Property deleted'})

    data = request.json
    prop.address = data.get('address', prop.address)
    prop.status = data.get('status', prop.status)
    prop.monthly_rent = data.get('monthlyRent', prop.monthly_rent)
    prop.unit_count = data.get('unitCount', prop.unit_count)
    prop.property_type = data.get('type', prop.property_type)
    prop.image_url = data.get('imageUrl', prop.image_url)
    db.session.commit()
    return jsonify(prop.to_dict())

# --- Tenant Routes ---
@app.route('/tenants', methods=['GET'])
@jwt_required()
def get_tenants():
    tens = Tenant.query.all()
    return jsonify([t.to_dict() for t in tens])

@app.route('/tenants', methods=['POST'])
@jwt_required()
def create_tenant():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    new_tenant = Tenant(
        name=data.get('name'),
        email=data.get('email'),
        property_id=int(data.get('propertyId')) if data.get('propertyId') else None,
        lease_start=data.get('leaseStart'),
        lease_end=data.get('leaseEnd'),
        avatar=data.get('avatar')
    )
    db.session.add(new_tenant)

    # Update property status if assigned
    if new_tenant.property_id:
        prop = Property.query.get(new_tenant.property_id)
        if prop:
            prop.status = 'occupied'
    db.session.commit()
    return jsonify(new_tenant.to_dict()), 201

# --- Payment Routes ---
@app.route('/payments', methods=['GET'])
@jwt_required()
def get_payments():
    pays = Payment.query.all()
    return jsonify([p.to_dict() for p in pays])

@app.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('propertyId') or not data.get('tenantId') or not data.get('amount'):
        return jsonify({'error': 'Property ID, tenant ID, and amount are required'}), 400

    new_payment = Payment(
        property_id=int(data.get('propertyId')),
        tenant_id=int(data.get('tenantId')),
        amount=data.get('amount'),
        date=data.get('date'),
        status=data.get('status', 'paid')
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.to_dict()), 201

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
