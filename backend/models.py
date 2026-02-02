
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(255), nullable=False)
    unit_count = db.Column(db.Integer, default=1)
    monthly_rent = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='vacant') # occupied or vacant
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tenants = db.relationship('Tenant', backref='property', lazy=True)
    payments = db.relationship('Payment', backref='property', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'address': self.address,
            'unitCount': self.unit_count,
            'monthlyRent': self.monthly_rent,
            'status': self.status
        }

class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    lease_start = db.Column(db.String(50))
    lease_end = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'propertyId': self.property_id,
            'leaseStart': self.lease_start,
            'leaseEnd': self.lease_end
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
            'id': self.id,
            'propertyId': self.property_id,
            'tenantId': self.tenant_id,
            'amount': self.amount,
            'date': self.date,
            'status': self.status
        }
