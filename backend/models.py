from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name
        }

class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(255), nullable=False)
    unit_count = db.Column(db.Integer, default=1)
    monthly_rent = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='vacant')
    property_type = db.Column(db.String(50), default='Residential')
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tenants = db.relationship('Tenant', backref='property', lazy=True)
    payments = db.relationship('Payment', backref='property', lazy=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'address': self.address,
            'unitCount': self.unit_count,
            'monthlyRent': self.monthly_rent,
            'status': self.status,
            'type': self.property_type,
            'imageUrl': self.image_url
        }

class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    lease_start = db.Column(db.String(50))
    lease_end = db.Column(db.String(50))
    avatar = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'propertyId': str(self.property_id) if self.property_id else None,
            'leaseStart': self.lease_start,
            'leaseEnd': self.lease_end,
            'avatar': self.avatar
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(50))
    status = db.Column(db.String(50), default='paid')

    def to_dict(self):
        return {
            'id': str(self.id),
            'propertyId': str(self.property_id),
            'tenantId': str(self.tenant_id),
            'amount': self.amount,
            'date': self.date,
            'status': self.status
        }
