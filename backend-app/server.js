import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { connectDB } from './mongodb.js';
import { ObjectId } from 'mongodb';

dotenv.config(); // Load .env FIRST

// Validate env variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  console.error('❌ ERROR: Missing Supabase environment variables');
  process.exit(1);
}

// Quick JWT validation (basic check: starts with 'eyJ' and has 3 segments separated by '.')
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const segments = token.split('.');
  return (
    token.startsWith('eyJ') &&
    segments.length === 3 &&
    segments.every((s) => s.length > 0)
  );
};

if (!isValidJWT(process.env.SUPABASE_SERVICE_ROLE)) {
  console.error(
    '❌ ERROR: SUPABASE_SERVICE_ROLE is not a valid JWT. Check your .env file.'
  );
  process.exit(1);
}

console.log('✅ SUPABASE_URL loaded');
console.log(
  '✅ SERVICE_ROLE JWT validated (first 20 chars):',
  process.env.SUPABASE_SERVICE_ROLE.substring(0, 20)
);

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const app = express();
app.use(express.json());
app.use(cors());

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
      console.log('📤 Uploading file:', fileName); // Debug log
      const { data, error } = await supabase.storage
        .from('files') // Bucket name
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) {
        console.error('Supabase Upload Error Details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
          details: error,
        });
        return res.status(500).json({
          error: 'Supabase upload failed',
          details: error.message, // Expose for debugging; remove in prod
        });
      }
      console.log('✅ Upload successful, generating public URL'); // Debug log
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
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

app.post('/api/timesheet/update', async (req, res) => {
  try {
    const db = await connectDB();
    const { id, data } = req.body;
    console.log('_id*******', id);
    console.log('reqdata*******', req.body);

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid timesheet ID format' });
    }

    const record = await db.collection('timesheets').findOne({
      _id: new ObjectId(id),
    });

    const update = await db.collection('timesheets').updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: data }
    );

    if (!record) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    res.json(record);
  } catch (err) {
    console.error('Get Single Timesheet Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   DELETE TIMESHEET RECORD (Clean & Safe)
============================================================ */
app.post('/api/timesheet/delete', async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.body;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid timesheet ID format' });
    }

    // Find the record first (to get fileUrl for cleanup)
    const record = await db
      .collection('timesheets')
      .findOne({ _id: new ObjectId(id) });

    if (!record) {
      return res.status(404).json({ error: 'Timesheet record not found' });
    }

    // Delete from MongoDB
    await db.collection('timesheets').deleteOne({ _id: new ObjectId(id) });

    // Optional: Delete associated file from Supabase Storage
    if (record.fileUrl) {
      try {
        // Extract filename from public URL
        const fileName = record.fileUrl.split('/').pop();
        await supabase.storage.from('files').remove([fileName]);
        console.log('Deleted file from Supabase:', fileName);
      } catch (err) {
        console.warn(
          'Could not delete file from Supabase (non-blocking):',
          err.message
        );
      }
    }

    res.json({ message: 'Timesheet deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: 'Server error during deletion' });
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
