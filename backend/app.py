
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Property, Tenant, Payment
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'property_manager.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()

# --- Property Routes ---
@app.route('/properties', methods=['GET'])
def get_properties():
    props = Property.query.all()
    return jsonify([p.to_dict() for p in props])

@app.route('/properties', methods=['POST'])
def create_property():
    data = request.json
    new_prop = Property(
        address=data.get('address'),
        unit_count=data.get('unitCount', 1),
        monthly_rent=data.get('monthlyRent'),
        status=data.get('status', 'vacant')
    )
    db.session.add(new_prop)
    db.session.commit()
    return jsonify(new_prop.to_dict()), 201

@app.route('/properties/<int:id>', methods=['PUT', 'DELETE'])
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
    db.session.commit()
    return jsonify(prop.to_dict())

# --- Tenant Routes ---
@app.route('/tenants', methods=['GET'])
def get_tenants():
    tens = Tenant.query.all()
    return jsonify([t.to_dict() for t in tens])

@app.route('/tenants', methods=['POST'])
def create_tenant():
    data = request.json
    new_tenant = Tenant(
        name=data.get('name'),
        email=data.get('email'),
        property_id=data.get('propertyId'),
        lease_start=data.get('leaseStart'),
        lease_end=data.get('leaseEnd')
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
@app.route('/payments', methods=['POST'])
def create_payment():
    data = request.json
    new_payment = Payment(
        property_id=data.get('propertyId'),
        tenant_id=data.get('tenantId'),
        amount=data.get('amount'),
        date=data.get('date'),
        status=data.get('status', 'paid')
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.to_dict()), 201

@app.route('/payments', methods=['GET'])
def get_payments():
    pays = Payment.query.all()
    return jsonify([p.to_dict() for p in pays])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
