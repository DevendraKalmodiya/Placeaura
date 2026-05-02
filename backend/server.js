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
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
// const os = require('os');

// ==========================================
// 2. FILE UPLOAD SETUP (MULTER - VERCEL READY)
// ==========================================

// In production (Vercel), use the OS temp directory. Locally, keep using your uploads folder.
const uploadDir = process.env.NODE_ENV === 'production' 
  ? os.tmpdir() 
  : path.join(__dirname, 'uploads');

// Only try to create the folder locally. Vercel's temp folder already exists.
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
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

// --- A. GET JOBS (With Gemini Semantic Matching & Comprehensive Fields) ---
app.get('/api/jobs', async (req, res) => {
  const userId = req.query.userId; 

  try {
    // Scenario 1: User is logged in, attempt AI semantic matching
    if (userId) {
      const userResult = await pool.query('SELECT profile_embedding FROM users WHERE id = $1', [userId]);
      const userVector = userResult.rows[0]?.profile_embedding;

      // If user has a resume embedding, calculate vector distance
      if (userVector) {
        const formatVector = typeof userVector === 'string' ? userVector : `[${userVector.join(',')}]`;
        
        const matchQuery = `
          SELECT 
            id, title, company, location, description, 
            summary, responsibilities, required_skills, qualifications, preferred_skills, salary, employment_type,
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
      SELECT 
        id, title, company, location, description, 
        summary, responsibilities, required_skills, qualifications, preferred_skills, salary, employment_type,
        '0%' AS match_percentage 
      FROM jobs 
      WHERE embedding IS NOT NULL
      ORDER BY id DESC
    `);
    res.json(fallbackResult.rows);
    
  } catch (err) {
    console.error("Fetch Jobs Error:", err.message);
    res.status(500).send('Server Error fetching jobs');
  }
});

// --- POST NEW JOB (Upgraded with Detailed Fields & Vector Saving) ---
app.post('/api/jobs', async (req, res) => {
  const { 
    title, company, location, summary, responsibilities, 
    required_skills, qualifications, preferred_skills, 
    salary, employment_type, recruiterId 
  } = req.body;

  try {
    // 1. Combine ALL the fields into a rich text prompt for the AI to read
    const aiContextString = `
      Job Title: ${title}
      Company: ${company}
      Location: ${location}
      Employment Type: ${employment_type}
      Salary/Stipend: ${salary}
      Summary: ${summary}
      Key Responsibilities: ${responsibilities}
      Required Skills: ${required_skills}
      Qualifications: ${qualifications}
      Preferred Skills: ${preferred_skills || 'None specified'}
    `;

    // 2. Turn this incredibly detailed string into a 3072-dimension vector
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(aiContextString);
    const embedding = result.embedding.values;
    const formatVector = `[${embedding.join(',')}]`;

    // 3. Save EVERYTHING to the upgraded Supabase table (INCLUDING THE VECTOR)
    const insertQuery = `
      INSERT INTO jobs (
        title, company, location, description, recruiter_id, 
        summary, responsibilities, required_skills, 
        qualifications, preferred_skills, salary, employment_type,
        embedding
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title;
    `;
    
    const newJob = await pool.query(insertQuery, [
      title, company, location, aiContextString, recruiterId,
      summary, responsibilities, required_skills, 
      qualifications, preferred_skills, salary, employment_type,
      formatVector
    ]);

    res.status(201).json({ 
      message: 'Comprehensive Job posted and vectorized successfully!', 
      job: newJob.rows[0] 
    });

  } catch (err) {
    console.error("Job Posting Error:", err.message);
    res.status(500).json({ error: 'Failed to post comprehensive job' });
  }
});

// --- GET ALL APPLICATIONS FOR A RECRUITER ---
app.get('/api/recruiter/applications/:recruiterId', async (req, res) => {
  const { recruiterId } = req.params;

  try {
    const query = `
      SELECT 
        a.id AS application_id,
        a.job_id,
        a.status,
        a.match_score,
        a.applied_at,
        j.title AS job_title,
        u.name AS student_name,
        u.email AS student_email,
        u.resume_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.student_id = u.id
      WHERE j.recruiter_id = $1
      ORDER BY (replace(a.match_score, '%', '')::int) DESC;
    `;

    const result = await pool.query(query, [recruiterId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Inbox Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// --- UPDATE EXISTING JOB ---
app.put('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    title, company, location, summary, responsibilities, 
    required_skills, qualifications, preferred_skills, 
    salary, employment_type 
  } = req.body;

  try {
    // 1. Re-generate AI Context and Vector
    const aiContextString = `Job Title: ${title} Company: ${company} Location: ${location} Summary: ${summary} Skills: ${required_skills}`;
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(aiContextString);
    const formatVector = `[${result.embedding.values.join(',')}]`;

    // 2. Update database
    const updateQuery = `
      UPDATE jobs SET 
        title = $1, company = $2, location = $3, summary = $4, 
        responsibilities = $5, required_skills = $6, qualifications = $7, 
        preferred_skills = $8, salary = $9, employment_type = $10, 
        embedding = $11, description = $12
      WHERE id = $13
    `;

    await pool.query(updateQuery, [
      title, company, location, summary, responsibilities, 
      required_skills, qualifications, preferred_skills, 
      salary, employment_type, formatVector, aiContextString, id
    ]);

    res.json({ message: 'Job updated and re-indexed by AI successfully!' });
  } catch (err) {
    console.error("Update Job Error:", err.message);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// --- UPDATE APPLICATION STATUS (Accepted/Rejected) ---
app.post('/api/applications/update-status', async (req, res) => {
  const { applicationId, status } = req.body; // status: 'accepted' or 'rejected'

  try {
    await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2',
      [status, applicationId]
    );
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.get('/api/jobs/details/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Error fetching job details");
  }
});

// --- DELETE A JOB ---
app.delete('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First, delete associated applications to avoid foreign key constraints
    await pool.query('DELETE FROM applications WHERE job_id = $1', [id]);
    
    // Then delete the job
    const result = await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job and associated applications deleted successfully' });
  } catch (err) {
    console.error("Delete Job Error:", err.message);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// --- STUDENT APPLICATION ROUTE ---
app.post('/api/applications/apply', async (req, res) => {
  const { jobId, studentId, matchScore } = req.body;
  try {
    // Check if the student has already applied (to prevent duplicates)
    const checkDuplicate = await pool.query(
      'SELECT id FROM applications WHERE job_id = $1 AND student_id = $2',
      [jobId, studentId]
    );

    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this position.' });
    }

    // Insert the new application
    const newApp = await pool.query(
      'INSERT INTO applications (job_id, student_id, status, match_score) VALUES ($1, $2, $3, $4) RETURNING id',
      [jobId, studentId, 'pending', matchScore]
    );

    res.status(201).json({ message: 'Application submitted successfully!', applicationId: newApp.rows[0].id });

  } catch (err) {
    console.error("Application Error:", err.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

app.post('/api/ats/calculate', async (req, res) => {
  const { studentId, resumeText, resumeName } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Act as an expert ATS optimizer. 
      Analyze the following resume text and provide:
      1. An overall ATS Score out of 100.
      2. Five specific, actionable feedback points to improve the score.
      
      Format the output STRICTLY as a JSON object:
      { "score": 85, "feedback": ["point 1", "point 2", "..."] }

      Resume Text: ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Safety: Strip markdown backticks if Gemini includes them
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    // Save to history table
    await pool.query(
      'INSERT INTO ats_history (student_id, score, feedback, resume_name) VALUES ($1, $2, $3, $4)',
      [studentId, data.score, JSON.stringify(data.feedback), resumeName]
    );

    res.json(data);
  } catch (err) {
    console.error("ATS Calculation Error:", err);
    res.status(500).json({ error: "Failed to calculate ATS score" });
  }
});

// --- NEW: FETCH ATS HISTORY ROUTE ---
app.get('/api/ats/history/:studentId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ats_history WHERE student_id = $1 ORDER BY calculated_at DESC',
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("History Fetch Error:", err);
    res.status(500).send("Error fetching history");
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
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileName = `${userId}-${Date.now()}.pdf`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2. Get Public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Process AI Embedding (Using local file before cleaning up)
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(resumeText);
    const formatVector = `[${result.embedding.values.join(',')}]`;

    // 4. Update Database with the CLOUD URL instead of filename
    await pool.query(
      'UPDATE users SET resume_url = $1, profile_embedding = $2 WHERE id = $3',
      [publicUrl, formatVector, userId]
    );

    // 5. Clean up: Delete local temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
      message: 'Resume uploaded to cloud and analyzed!', 
      resumeUrl: publicUrl 
    });

  } catch (err) {
    console.error("Cloud Upload Error:", err.message);
    res.status(500).json({ message: 'Cloud storage failed.' });
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

// --- ADMIN DASHBOARD STATS ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    // 1. Get raw counts
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const recruiters = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'recruiter'");
    const jobs = await pool.query("SELECT COUNT(*) FROM jobs");

    // 2. Get the latest recruiter activity (Joining jobs table with users table)
    const recentJobsQuery = `
      SELECT jobs.id, jobs.title, jobs.company, users.name AS recruiter_name, jobs.location
      FROM jobs
      JOIN users ON jobs.recruiter_id = users.id
      ORDER BY jobs.id DESC
      LIMIT 5;
    `;
    const recentJobs = await pool.query(recentJobsQuery);

    // 3. Send it all back to the frontend
    res.json({
      totalStudents: students.rows[0].count,
      totalRecruiters: recruiters.rows[0].count,
      totalJobs: jobs.rows[0].count,
      recentJobs: recentJobs.rows
    });

  } catch (err) {
    console.error("Admin Stats Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// ==========================================
// 4. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Agentic AI Backend (Gemini Powered) running flawlessly on port ${PORT}`);
});

module.exports = app;









