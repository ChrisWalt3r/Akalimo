const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Akalimo Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
