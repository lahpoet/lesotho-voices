require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// CORS: only the listed frontend URLs may call this API
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({ origin: allowed }));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Lesotho Blog API is running' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contents', require('./routes/contents'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/viewers', require('./routes/viewers'));

// 404 and error handlers
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
