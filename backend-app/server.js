import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { connectDB } from './mongodb.js';
import { ObjectId } from 'mongodb';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

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
    'SUPABASE_SERVICE_ROLE is not a valid JWT. Check your .env file.'
  );
  process.exit(1);
}

console.log('SUPABASE_URL loaded');
console.log(
  'SERVICE_ROLE JWT validated (first 20 chars):',
  process.env.SUPABASE_SERVICE_ROLE.substring(0, 20)
);

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

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/timesheet/create', upload.single('file'), async (req, res) => {
  try {
    const db = await connectDB();
    const rows = JSON.parse(req.body.rows);
    for (const row of rows) {
      if (row.totalHours < 5 || row.totalHours > 8) {
        return res.status(400).json({
          error: 'Hours must be between 5 and 8',
        });
      }
    }
    let fileUrl = null;

    if (req.file) {
      const fileName = `timesheet_${Date.now()}_${req.file.originalname}`;
      console.log('Uploading file ******', fileName);
      const { data, error } = await supabase.storage
        .from('files')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) {
        console.error('Supabase Upload Error Details*******', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
          details: error,
        });
        return res.status(500).json({
          error: 'Supabase upload failed',
          details: error.message,
        });
      }
      console.log('Upload successful, generating public URL *******');
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }

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

app.post('/api/timesheet/delete', async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid timesheet ID format' });
    }

    const record = await db
      .collection('timesheets')
      .findOne({ _id: new ObjectId(id) });

    if (!record) {
      return res.status(404).json({ error: 'Timesheet record not found' });
    }

    await db.collection('timesheets').deleteOne({ _id: new ObjectId(id) });

    if (record.fileUrl) {
      try {
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

function calculateHours(pIn, pOut) {
  return (new Date(pOut) - new Date(pIn)) / (1000 * 60 * 60);
}

app.listen(5000, () => {
  console.log('✔ Server running at http://localhost:5000');
});
