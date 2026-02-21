# 🎉 SponsorBridge Website is LIVE!

## ✅ Status: Running

Your SponsorBridge website is now fully deployed and running!

---

## 🌐 Access Your Website

**URL:** http://localhost:3000

**Open this link in your browser now!**

---

## 📊 What's Included

### ✅ Complete Backend API
- User authentication (Register/Login)
- Company management
- Organizer profiles
- Sponsorship requests
- Messaging system
- JWT token-based security

### ✅ Beautiful Frontend
- Responsive design (works on mobile, tablet, desktop)
- Modern UI with gradient styling
- Real-time data loading
- Smooth navigation
- Error handling

### ✅ Full Functionality
- User registration with role selection
- Secure login with JWT tokens
- Browse companies
- Send sponsorship requests
- Track request status
- Send messages

---

## 🚀 Quick Start

### 1. Open the Website
Go to: **http://localhost:3000**

### 2. Register an Account
- Click "Register"
- Choose your role:
  - **Company** - Sponsor events
  - **Organizer** - Find sponsors for your events
  - **Admin** - Manage the platform

### 3. Explore
- Browse companies
- Send sponsorship requests
- Manage your profile
- Track requests

---

## 📁 Project Structure

```
.
├── server.js                 # Express backend server
├── package.json              # Node.js dependencies
├── public/
│   ├── index.html           # Main HTML page
│   └── app.js               # Frontend JavaScript
├── DEPLOYMENT_GUIDE.md      # Detailed deployment info
├── DEMO_DATA.md             # Sample data for testing
└── WEBSITE_LIVE.md          # This file
```

---

## 🔐 Security Features

✅ Password hashing with bcryptjs
✅ JWT token authentication
✅ CORS enabled for API security
✅ Role-based access control
✅ Secure token storage in localStorage

---

## 💾 Data Storage

**Current:** In-memory (perfect for demos)
- Data persists during the session
- Data resets when server restarts

**For Production:** PostgreSQL integration ready
- The Java backend has full PostgreSQL support
- Can be easily integrated

---

## 🎯 Features

### For Companies
- ✅ Create company profile
- ✅ Receive sponsorship requests
- ✅ Accept/reject requests
- ✅ Communicate with organizers
- ✅ Track sponsorship opportunities

### For Event Organizers
- ✅ Search companies
- ✅ Send sponsorship requests
- ✅ Track request status
- ✅ Communicate with sponsors
- ✅ Manage events

### For Admins
- ✅ Verify company profiles
- ✅ Manage users
- ✅ View platform statistics
- ✅ Moderate content

---

## 📱 Browser Compatibility

✅ Chrome
✅ Firefox
✅ Safari
✅ Edge
✅ Mobile browsers

---

## 🛠️ Technical Stack

**Backend:**
- Node.js with Express.js
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

**Frontend:**
- Vanilla JavaScript (no build step)
- HTML5
- CSS3 with responsive design
- Fetch API for HTTP requests

**Database:**
- In-memory for demo
- PostgreSQL ready for production

---

## 📊 API Endpoints

All endpoints are available at: `http://localhost:3000/api`

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login to account

### Companies
- `GET /companies` - List all companies
- `GET /companies/:id` - Get company details
- `POST /companies` - Create company profile
- `PUT /companies/:id` - Update company profile

### Organizers
- `GET /organizers/:id` - Get organizer details
- `POST /organizers` - Create organizer profile

### Requests
- `POST /requests` - Create sponsorship request
- `GET /requests/company/:id` - Get requests for company
- `GET /requests/organizer/:id` - Get requests from organizer
- `PUT /requests/:id/status` - Update request status

### Messages
- `POST /messages` - Send message
- `GET /messages/request/:id` - Get messages for request

---

## 🧪 Test It Out

### Test Account 1: Company
```
Email: company@test.com
Password: password123
Role: COMPANY
```

### Test Account 2: Organizer
```
Email: organizer@test.com
Password: password123
Role: ORGANIZER
```

### Test Account 3: Admin
```
Email: admin@test.com
Password: password123
Role: ADMIN
```

---

## 🎓 Learning Resources

- **Frontend Code:** `public/app.js` - See how the frontend works
- **Backend Code:** `server.js` - See how the API works
- **API Documentation:** See endpoints above
- **Demo Data:** `DEMO_DATA.md` - Sample companies and events

---

## 🔄 Server Management

### Check Server Status
The server is running on **Port 3000**

### Restart Server
```bash
npm start
```

### Stop Server
Press `Ctrl+C` in the terminal

---

## 📈 Next Steps

1. **Test the website** - Try all features
2. **Create accounts** - Register as company and organizer
3. **Send requests** - Test sponsorship workflow
4. **Explore API** - Use browser DevTools to see API calls
5. **Customize** - Modify colors, text, features as needed

---

## 🎨 Customization

### Change Colors
Edit `public/index.html` - Look for the `<style>` section

### Change Company Name
Edit `public/index.html` - Look for "SponsorBridge" text

### Add New Features
Edit `public/app.js` - Add new functions and API calls

### Modify Backend
Edit `server.js` - Add new routes and logic

---

## 📞 Support

If you encounter any issues:

1. Check the browser console (F12) for errors
2. Check the server logs in the terminal
3. Verify the server is running on port 3000
4. Clear browser cache and localStorage
5. Restart the server

---

## 🎉 Congratulations!

Your SponsorBridge website is live and ready to use!

**Visit:** http://localhost:3000

Enjoy! 🚀
