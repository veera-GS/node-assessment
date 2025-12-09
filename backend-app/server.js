import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { connectDB } from './mongodb.js';

dotenv.config(); // Load .env FIRST

// Validate env variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  console.error('❌ ERROR: Missing Supabase environment variables');
  process.exit(1);
}

// if (!process.env.MONGO_URI) {
//   console.error('❌ ERROR: Missing MongoDB URI');
//   process.exit(1);
// }

const app = express();
app.use(express.json());
app.use(cors());

// Display env status
console.log('SUPABASE_URL =', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE exists =', !!process.env.SUPABASE_SERVICE_ROLE);

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Multer for file handling (buffer)
const upload = multer({ storage: multer.memoryStorage() });

/* ============================================================
   CREATE TIMESHEET RECORD
============================================================ */
app.post('/api/timesheet/create', upload.single('file'), async (req, res) => {
  try {
    const db = await connectDB();

    // Parse rows sent from frontend
    const rows = JSON.parse(req.body.rows);

    // Validate hours
    for (const row of rows) {
      if (row.totalHours < 5 || row.totalHours > 8) {
        return res.status(400).json({
          error: 'Hours must be between 5 and 8',
        });
      }
    }

    let fileUrl = null;

    /* -----------------------------
       Upload file to Supabase
    ----------------------------- */
    if (req.file) {
      const fileName = `timesheet_${Date.now()}_${req.file.originalname}`;

      const { data, error } = await supabase.storage
        .from('files') // Bucket name
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error('Supabase Upload Error:', error);
        return res.status(500).json({ error: 'Supabase upload failed' });
      }

      const publicUrl = supabase.storage.from('files').getPublicUrl(fileName)
        .data.publicUrl;

      fileUrl = publicUrl;
    }

    /* -----------------------------
       Save rows into MongoDB
    ----------------------------- */
    const saveData = rows.map((r) => ({
      ...r,
      fileUrl,
      createdAt: new Date(),
    }));

    await db.collection('timesheets').insertMany(saveData);

    return res.json({
      message: 'Timesheet saved successfully',
      fileUrl,
    });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   READ Timesheets (Filters + Pagination)
============================================================ */
app.get('/api/timesheet', async (req, res) => {
  try {
    const db = await connectDB();

    const { name, companyName, from, to, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) query.name = name;
    if (companyName) query.companyName = companyName;
    if (from && to) query.date = { $gte: from, $lte: to };

    const skip = (Number(page) - 1) * Number(limit);

    const records = await db
      .collection('timesheets')
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   UTILITY
============================================================ */
function calculateHours(pIn, pOut) {
  return (new Date(pOut) - new Date(pIn)) / (1000 * 60 * 60);
}

/* ============================================================
   START SERVER
============================================================ */
app.listen(5000, () => {
  console.log('✔ Server running at http://localhost:5000');
});
