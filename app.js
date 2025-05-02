// In your Express backend
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'], // Add all frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));