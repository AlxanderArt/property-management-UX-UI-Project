
import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db
from models import Property

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_create_property(client):
    """Test that we can successfully create a property via the API."""
    response = client.post('/properties', json={
        'address': 'Test Property 123',
        'unitCount': 2,
        'monthlyRent': 1500,
        'status': 'vacant'
    })
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['address'] == 'Test Property 123'
    assert data['monthlyRent'] == 1500

def test_get_properties(client):
    """Test retrieving property list."""
    # Seed a property
    with app.app_context():
        p = Property(address="Seed St", monthly_rent=1000)
        db.session.add(p)
        db.session.commit()

    response = client.get('/properties')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['address'] == "Seed St"
