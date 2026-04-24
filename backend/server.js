const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// ==========================================
// 1. SETUP & CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Supabase PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase Cloud connections
  }
});

// Test Database Connection on Startup
pool.connect()
  .then(() => console.log('✅ Successfully connected to Supabase PostgreSQL.'))
  .catch(err => console.error('❌ Supabase Connection Error:', err.message));

// PREVENT FATAL DATABASE CRASHES (ECONNRESET FIX)
pool.on('error', (err, client) => {
  console.error('⚠️ Supabase network blip detected (Ignored):', err.message);
});

// ==========================================
// 2. FILE UPLOAD SETUP (MULTER)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  }
});

// ==========================================
// 3. API ROUTES
// ==========================================

// --- A. GET JOBS (With Gemini Semantic Matching) ---
app.get('/api/jobs', async (req, res) => {
  const userId = req.query.userId; 

  try {
    // Scenario 1: User is logged in, attempt AI semantic matching
    if (userId) {
      const userResult = await pool.query('SELECT profile_embedding FROM users WHERE id = $1', [userId]);
      const userVector = userResult.rows[0]?.profile_embedding;

      // If user has a resume embedding, calculate vector distance
      if (userVector) {
        // THE FIX: Check if Supabase returned a string. If yes, use it. If it's an array, format it.
        const formatVector = typeof userVector === 'string' ? userVector : `[${userVector.join(',')}]`;
        
        const matchQuery = `
          SELECT 
            id, title, company, location, description,
            ROUND((1 - (embedding <=> $1)) * 100)::text || '%' AS match_percentage
          FROM jobs 
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1 ASC; -- Sort Highest Match First
        `;
        
        const sortedJobs = await pool.query(matchQuery, [formatVector]);
        return res.json(sortedJobs.rows);
      }
    }

    // Scenario 2: No user logged in OR no resume uploaded yet (Fallback)
    const fallbackResult = await pool.query(`
      SELECT id, title, company, location, description, '0%' AS match_percentage 
      FROM jobs 
      ORDER BY id ASC
    `);
    res.json(fallbackResult.rows);
    
  } catch (err) {
    console.error("Fetch Jobs Error:", err.message);
    res.status(500).send('Server Error fetching jobs');
  }
});


// --- POST NEW JOB (With Gemini Vector Generation) ---
app.post('/api/jobs', async (req, res) => {
  const { title, company, location, description, recruiterId } = req.body;

  try {
    // 1. Initialize Gemini Embedding Model
    // Note: Make sure this matches the exact model name you used for the resume upload!
    
      // Change it to exactly this:
const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    
    // 2. Turn the job description into a 3072-dimension vector
    const result = await model.embedContent(description);
    const embedding = result.embedding.values;
    
    // Format it perfectly for Supabase's pgvector
    const formatVector = `[${embedding.join(',')}]`;

    // 3. Save the job and the vector to the database
    // (We include recruiter_id so we know who posted it)
   // Change this to include recruiter_id
    const insertQuery = `
      INSERT INTO jobs (title, company, location, description, embedding, recruiter_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title;
    `;
    
    const newJob = await pool.query(insertQuery, [title, company, location, description, formatVector, recruiterId]);
    
   

    res.status(201).json({ 
      message: 'Job posted and vectorized successfully!', 
      job: newJob.rows[0] 
    });

  } catch (err) {
    console.error("Job Posting Error:", err.message);
    res.status(500).json({ error: 'Failed to post job and generate AI vector' });
  }
});

// --- GET JOBS FOR SPECIFIC RECRUITER ---
app.get('/api/recruiter-jobs/:recruiterId', async (req, res) => {
  const { recruiterId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, location, (SELECT count(*) FROM applications WHERE applications.job_id = jobs.id) as applicant_count FROM jobs WHERE recruiter_id = $1 ORDER BY id DESC', 
      [recruiterId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Recruiter Jobs Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// --- B. UPLOAD RESUME (Extract Text & Generate Gemini Embeddings) ---
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const userId = req.body.userId; 
    const filename = req.file.filename;
    const filePath = req.file.path;

    // Process AI embeddings if we have a User ID and it's a PDF
    if (userId && req.file.mimetype === 'application/pdf') {
      try {
        // 1. Read the PDF File
        const dataBuffer = fs.readFileSync(filePath);
        
        // 2. Extract the raw text cleanly
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        console.log(`\n📄 PDF Extracted! Text length is: ${resumeText?.length} characters.`);

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error("PDF read successfully, but no text found (Image/Scan).");
        }

        console.log(`🤖 Sending ${resumeText.length} characters to Gemini...`);

        // 3. Ask Gemini for the Semantic Vector (3072 dimensions)
        // Change it to exactly this:
const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
        const result = await model.embedContent(resumeText);
        
        const vectorArray = result.embedding.values;
        const formatVector = `[${vectorArray.join(',')}]`;

        console.log(`✅ Gemini successfully generated the 3072-dimension vector!`);

        // 4. Save file path AND Gemini embedding to Supabase
        await pool.query(
          'UPDATE users SET resume_url = $1, profile_embedding = $2 WHERE id = $3', 
          [filename, formatVector, userId]
        );

        return res.status(200).json({ 
          message: 'Resume analyzed and AI Profile generated successfully!',
          filename: filename
        });

      } catch (aiError) {
        console.error("AI Processing Error:", aiError.message);
        // Fallback: Save file even if AI fails
        await pool.query('UPDATE users SET resume_url = $1 WHERE id = $2', [filename, userId]);
        return res.status(200).json({ 
          message: 'Resume saved, but AI analysis failed temporarily.',
          filename: filename
        });
      }
    } 

    // If it's a DOCX or no User ID, just save the file normally
    if (userId) {
      await pool.query('UPDATE users SET resume_url = $1 WHERE id = $2', [filename, userId]);
    }

    res.status(200).json({ message: 'Resume uploaded successfully!', filename: filename });

  } catch (err) {
    console.error("Upload Route Error:", err.message);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
});

// --- C. USER SIGNUP ---
app.post('/api/signup', async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const role = req.body.role;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- D. USER LOGIN ---
app.post('/api/login', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase(); 
  const password = req.body.password;

  console.log(`\n🕵️ LOGIN ATTEMPT DETECTED!`);
  console.log(`👉 Trying to log in email: "${email}"`);

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log(`❌ FAIL: I looked in Supabase, but the email "${email}" is not there!`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    console.log(`✅ SUCCESS: Found user ${user.name} in the database.`);
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.log(`❌ FAIL: The password provided does not match the saved hash!`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log(`✅ SUCCESS: Password matches! Generating token...`);

    const tokenSecret = process.env.JWT_SECRET || 'super_secret_placeaura_key';
    const token = jwt.sign({ id: user.id, role: user.role }, tokenSecret, { expiresIn: '1h' });

    res.json({
      message: 'Logged in successfully',
      token: token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        resume_url: user.resume_url 
      }
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ==========================================
// 4. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Agentic AI Backend (Gemini Powered) running flawlessly on port ${PORT}`);
});