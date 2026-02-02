
# Property Manager Lite 🏢

A modern, simplified property management system designed for small portfolio owners and landlords. This project demonstrates full-stack development skills using React, TypeScript, Python (Flask), and SQLite.

## 🚀 Live Demo
The preview environment runs the **React Frontend** with a **Mock API Service** to demonstrate functionality immediately in the browser. The actual Python backend code is provided in the `/backend` directory for local development.

## 🛠 Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** Python 3.x, Flask, SQLAlchemy ORM.
- **Database:** SQLite.
- **Testing:** Pytest.

## ✨ Features
- **Property Management:** Full CRUD (Create, Read, Update, Delete) for property listings.
- **Tenant Tracking:** Manage tenant details and link them to specific properties.
- **Lease Management:** Track lease start and end dates.
- **Rent Tracking:** Record payments and view historical transaction data.
- **Dashboard:** Visual analytics showing occupancy rates, revenue trends, and pending items.
- **Responsive Design:** Optimized for mobile, tablet, and desktop screens.

## 📂 Project Structure
```text
property-manager-lite/
├── App.tsx             # Main React entry point
├── services/           # API communication layers
├── pages/              # View components (Dashboard, Properties, etc.)
├── components/         # Reusable UI elements
├── backend/            # Flask server & SQLAlchemy models
│   ├── app.py          # Main server logic
│   ├── models.py       # DB Schema
│   └── tests/          # Pytest cases
└── README.md           # Documentation
```

## ⚙️ Setup Instructions

### Backend (Python/Flask)
1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Run the server: `python app.py`.
6. The API will be available at `http://localhost:5000`.

### Frontend (React)
1. Run `npm install`.
2. Start the development server: `npm run dev`.
3. Open `http://localhost:5173`.

## 🧪 Testing
Run backend tests using:
```bash
cd backend
pytest tests/test_app.py
```

## 📝 Lessons Learned
- Implementing a robust "Mock API" layer allowed for high-speed frontend development before the backend was even finalized.
- Recharts provides a great balance of customization and ease of use for real-time financial data.
- Using a relational database (SQLite) via SQLAlchemy makes managing the Property-Tenant relationship intuitive.

## 🔮 Future Improvements
- User Authentication (JWT) and User roles.
- Document storage for signed lease agreements (PDFs).
- Integration with payment gateways (Stripe/PayPal).
- Email notifications for upcoming rent deadlines.
