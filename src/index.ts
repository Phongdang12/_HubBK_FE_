import express from 'express';
import route from './Routes/index';
import cors from 'cors';
import pool from './Config/db.config';
import { seedUser } from './Services/auth.service'; //thêm

const app = express();
app.use(cors());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

route(app);

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL');
    conn.release();
    
    // Seed default manager user
    await seedUser();
  } catch (err) {
    console.error('❌ Cannot connect to MySQL:', err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
