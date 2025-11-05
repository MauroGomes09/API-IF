import express from 'express';
import connectDB from './src/config/database.js';
import apiRoutes from './src/routes/api.routes.js';
import 'dotenv/config'; 

const app = express();

connectDB();

app.use(express.json());

app.use('/openfinance', apiRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server already running in port: ${PORT}`);
});