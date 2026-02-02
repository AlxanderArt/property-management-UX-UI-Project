import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db
from models import Property, Tenant, Payment, User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def auth_headers(client):
    """Create a test user and return auth headers with JWT token."""
    response = client.post('/auth/register', json={
        'email': 'test@example.com',
        'password': 'testpass123',
        'name': 'Test User'
    })
    assert response.status_code == 201
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# --- Auth Tests ---
def test_register_user(client):
    """Test user registration."""
    response = client.post('/auth/register', json={
        'email': 'newuser@example.com',
        'password': 'password123',
        'name': 'New User'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'newuser@example.com'

def test_login_user(client):
    """Test user login."""
    # First register
    client.post('/auth/register', json={
        'email': 'login@example.com',
        'password': 'password123',
        'name': 'Login User'
    })
    # Then login
    response = client.post('/auth/login', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data

def test_login_invalid_credentials(client):
    """Test login with wrong password."""
    client.post('/auth/register', json={
        'email': 'user@example.com',
        'password': 'correctpass',
        'name': 'User'
    })
    response = client.post('/auth/login', json={
        'email': 'user@example.com',
        'password': 'wrongpass'
    })
    assert response.status_code == 401

# --- Property Tests ---
def test_create_property(client, auth_headers):
    """Test creating a property."""
    response = client.post('/properties', json={
        'address': 'Test Property 123',
        'unitCount': 2,
        'monthlyRent': 1500,
        'status': 'vacant',
        'type': 'Residential'
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.get_json()
    assert data['address'] == 'Test Property 123'
    assert data['monthlyRent'] == 1500
    assert data['type'] == 'Residential'

def test_get_properties(client, auth_headers):
    """Test retrieving property list."""
    # Create a property first
    client.post('/properties', json={
        'address': 'Seed St',
        'monthlyRent': 1000
    }, headers=auth_headers)

    response = client.get('/properties', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['address'] == 'Seed St'

def test_update_property(client, auth_headers):
    """Test updating a property."""
    # Create property
    create_resp = client.post('/properties', json={
        'address': 'Original Address',
        'monthlyRent': 1000
    }, headers=auth_headers)
    prop_id = create_resp.get_json()['id']

    # Update it
    response = client.put(f'/properties/{prop_id}', json={
        'address': 'Updated Address',
        'monthlyRent': 1500,
        'status': 'occupied'
    }, headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data['address'] == 'Updated Address'
    assert data['monthlyRent'] == 1500
    assert data['status'] == 'occupied'

def test_delete_property(client, auth_headers):
    """Test deleting a property."""
    # Create property
    create_resp = client.post('/properties', json={
        'address': 'To Be Deleted',
        'monthlyRent': 1000
    }, headers=auth_headers)
    prop_id = create_resp.get_json()['id']

    # Delete it
    response = client.delete(f'/properties/{prop_id}', headers=auth_headers)
    assert response.status_code == 200

    # Verify it's gone
    get_resp = client.get('/properties', headers=auth_headers)
    assert len(get_resp.get_json()) == 0

def test_create_property_missing_fields(client, auth_headers):
    """Test creating property with missing required fields."""
    response = client.post('/properties', json={}, headers=auth_headers)
    assert response.status_code == 400

# --- Tenant Tests ---
def test_create_tenant(client, auth_headers):
    """Test creating a tenant."""
    # Create a property first
    prop_resp = client.post('/properties', json={
        'address': 'Tenant Property',
        'monthlyRent': 2000
    }, headers=auth_headers)
    prop_id = prop_resp.get_json()['id']

    # Create tenant
    response = client.post('/tenants', json={
        'name': 'John Doe',
        'email': 'john@example.com',
        'propertyId': prop_id,
        'leaseStart': '2024-01-01',
        'leaseEnd': '2025-01-01'
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'John Doe'
    assert data['propertyId'] == prop_id

def test_get_tenants(client, auth_headers):
    """Test retrieving tenant list."""
    # Create tenant
    client.post('/tenants', json={
        'name': 'Jane Smith',
        'email': 'jane@example.com'
    }, headers=auth_headers)

    response = client.get('/tenants', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['name'] == 'Jane Smith'

# --- Payment Tests ---
def test_create_payment(client, auth_headers):
    """Test creating a payment."""
    # Create property and tenant first
    prop_resp = client.post('/properties', json={
        'address': 'Payment Property',
        'monthlyRent': 1500
    }, headers=auth_headers)
    prop_id = prop_resp.get_json()['id']

    tenant_resp = client.post('/tenants', json={
        'name': 'Paying Tenant',
        'email': 'paying@example.com',
        'propertyId': prop_id
    }, headers=auth_headers)
    tenant_id = tenant_resp.get_json()['id']

    # Create payment
    response = client.post('/payments', json={
        'propertyId': prop_id,
        'tenantId': tenant_id,
        'amount': 1500,
        'date': '2024-03-01',
        'status': 'paid'
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.get_json()
    assert data['amount'] == 1500
    assert data['status'] == 'paid'

def test_get_payments(client, auth_headers):
    """Test retrieving payment list."""
    response = client.get('/payments', headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

# --- Protected Route Tests ---
def test_protected_route_without_token(client):
    """Test that protected routes require authentication."""
    response = client.get('/properties')
    assert response.status_code == 401
