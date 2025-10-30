import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import our routes
import performanceRoutes from './routes/performance.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://ourvoiceourrights.vercel.app/",
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/v1/performance', performanceRoutes);

// A simple home route
app.get('/', (req, res) => {
  res.send('<h1>MGNREGA API</h1><p>API is running...</p>');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}...`);
});