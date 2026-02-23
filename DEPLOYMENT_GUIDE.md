# Eventra - Deployment Guide

## 🚀 Website is Now Live!

Your Eventra website is running and ready to use.

### Access the Website

**URL:** http://localhost:3000

Open this link in your browser to access the full Eventra platform.

---

## 📋 Features Available

### 1. **Authentication**
- Register as a Company, Event Organizer, or Admin
- Secure login with JWT tokens
- Session management

### 2. **Company Management**
- Browse all verified companies
- View company details (industry, location, budget, sponsorship types)
- Companies can create and manage their profiles

### 3. **Event Organizers**
- Search for companies to sponsor their events
- Send sponsorship requests to companies
- Track request status

### 4. **Sponsorship Requests**
- Create sponsorship requests
- Track request status (Pending, Accepted, Rejected)
- Communicate with sponsors

### 5. **Messaging**
- Send messages between organizers and companies
- Track conversation history

---

## 🧪 Test Accounts

### Company Account
- **Email:** company@test.com
- **Password:** password123
- **Role:** COMPANY

### Organizer Account
- **Email:** organizer@test.com
- **Password:** password123
- **Role:** ORGANIZER

### Admin Account
- **Email:** admin@test.com
- **Password:** password123
- **Role:** ADMIN

---

## 🎯 Quick Start Guide

### 1. Register a New Account
1. Click "Register" button
2. Fill in your details:
   - Email
   - Name
   - Password
   - Select your role (Company, Organizer, or Admin)
3. Click "Register"

### 2. For Companies
1. Login with your company account
2. Create your company profile with:
   - Company name
   - Industry
   - Location
   - Website
   - Contact person
   - Sponsorship types
   - Budget range
3. Browse incoming sponsorship requests
4. Accept or reject requests

### 3. For Event Organizers
1. Login with your organizer account
2. Browse available companies
3. Click "Send Sponsorship Request" on a company
4. Fill in event details and sponsorship ask
5. Track your requests in the dashboard

---

## 🔧 Technical Details

### Backend
- **Framework:** Express.js (Node.js)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Database:** In-memory (for demo purposes)
- **Port:** 3000

### Frontend
- **Type:** Vanilla JavaScript (no build step needed)
- **Styling:** CSS3 with responsive design
- **API Communication:** Fetch API

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Companies
- `GET /api/companies` - List all verified companies
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company profile
- `PUT /api/companies/:id` - Update company profile

#### Organizers
- `GET /api/organizers/:id` - Get organizer details
- `POST /api/organizers` - Create organizer profile

#### Sponsorship Requests
- `POST /api/requests` - Create sponsorship request
- `GET /api/requests/company/:companyId` - Get requests for company
- `GET /api/requests/organizer/:organizerId` - Get requests from organizer
- `PUT /api/requests/:id/status` - Update request status

#### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/request/:requestId` - Get messages for request

---

## 📊 Data Storage

Currently, the application uses **in-memory storage**, which means:
- ✅ Data persists during the session
- ❌ Data is lost when the server restarts
- ✅ Perfect for testing and demos

For production, you would replace this with a real database like PostgreSQL.

---

## 🛑 Stopping the Server

To stop the server, press `Ctrl+C` in the terminal where it's running.

---

## 🔄 Restarting the Server

To restart the server:
```bash
npm start
```

---

## 📝 Notes

- All passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- CORS is enabled for cross-origin requests
- The frontend is fully responsive and works on mobile devices

---

## 🎉 You're All Set!

Your Eventra website is ready to use. Visit **http://localhost:3000** to get started!

For any issues or questions, refer to the API documentation above.
