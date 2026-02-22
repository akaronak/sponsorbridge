const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your-secret-key-change-this';

// Mock database
const users = new Map();

app.post('/api/auth/register', (req, res) => {
  const { email, name, password, role } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  const user = { id: Date.now(), email, name, password, role: role || 'organizer' };
  users.set(email, user);
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  
  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
});
