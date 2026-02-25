const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'eventra-frontend', 'dist')));

// In-memory database
const db = {
  users: [],
  companies: [],
  organizers: [],
  requests: [],
  messages: []
};

// Helper functions
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = decoded;
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: db.users.length + 1,
      email,
      passwordHash: hashedPassword,
      name,
      role,
      createdAt: new Date()
    };
    
    db.users.push(user);
    const token = generateToken(user.id, user.role);
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
      expiresIn: 86400000
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = generateToken(user.id, user.role);
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
      expiresIn: 86400000
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Company Routes
app.post('/api/companies', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'COMPANY') {
      return res.status(403).json({ error: 'Only companies can create profiles' });
    }
    
    const company = {
      id: db.companies.length + 1,
      userId: req.user.userId,
      ...req.body,
      verified: false,
      createdAt: new Date()
    };
    
    db.companies.push(company);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/companies', (req, res) => {
  try {
    const verified = db.companies.filter(c => c.verified);
    res.json(verified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/companies/:id', (req, res) => {
  try {
    const company = db.companies.find(c => c.id === parseInt(req.params.id));
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/companies/:id', authMiddleware, (req, res) => {
  try {
    const company = db.companies.find(c => c.id === parseInt(req.params.id));
    if (!company) return res.status(404).json({ error: 'Company not found' });
    if (company.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    Object.assign(company, req.body);
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Organizer Routes
app.post('/api/organizers', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ error: 'Only organizers can create profiles' });
    }
    
    const organizer = {
      id: db.organizers.length + 1,
      userId: req.user.userId,
      ...req.body,
      verified: false,
      createdAt: new Date()
    };
    
    db.organizers.push(organizer);
    res.status(201).json(organizer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/organizers/:id', (req, res) => {
  try {
    const organizer = db.organizers.find(o => o.id === parseInt(req.params.id));
    if (!organizer) return res.status(404).json({ error: 'Organizer not found' });
    res.json(organizer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sponsorship Request Routes
app.post('/api/requests', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ error: 'Only organizers can create requests' });
    }
    
    const request = {
      id: db.requests.length + 1,
      organizerId: req.user.userId,
      ...req.body,
      status: 'PENDING',
      createdAt: new Date()
    };
    
    db.requests.push(request);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/requests/company/:companyId', authMiddleware, (req, res) => {
  try {
    const requests = db.requests.filter(r => r.companyId === parseInt(req.params.companyId));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/requests/organizer/:organizerId', authMiddleware, (req, res) => {
  try {
    const requests = db.requests.filter(r => r.organizerId === parseInt(req.params.organizerId));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/requests/:id/status', authMiddleware, (req, res) => {
  try {
    const request = db.requests.find(r => r.id === parseInt(req.params.id));
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    request.status = req.body.status;
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Message Routes
app.post('/api/messages', authMiddleware, (req, res) => {
  try {
    const message = {
      id: db.messages.length + 1,
      senderId: req.user.userId,
      ...req.body,
      createdAt: new Date()
    };
    
    db.messages.push(message);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/request/:requestId', authMiddleware, (req, res) => {
  try {
    const messages = db.messages.filter(m => m.requestId === parseInt(req.params.requestId));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Eventra-frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Eventra running at http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
});
