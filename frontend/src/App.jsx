import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // 👈 THE RETURN OF THE FOOTER
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import StudentDashboard from './pages/Home'; 
import Jobs from './pages/Jobs'; 
import Profile from './pages/Profile'; 
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterProfile from './pages/RecruiterProfile';
import Applications from './pages/Applications';
import PostJob from './pages/PostJob';
import ATS from './pages/ATS';


// 🛡️ THE SECURITY GUARD COMPONENT
const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children; 
};

export default function App() {
  return (
    <BrowserRouter>
      
      {/* Navbar sits at the very top */}
      <Navbar /> 
      
      {/* This div ensures the main content stretches and pushes the footer to the bottom */}
      <div className="flex-grow min-h-screen flex flex-col">
        <Routes>
          
          {/* 🚦 BASE URL FIX */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 🎓 STUDENT WORLD */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute allowedRole="student">
              <Jobs />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/jobs" element={<Jobs />} />
          <Route path="/ats" element={<ATS />} />

         {/* 🏢 RECRUITER WORLD */}
          {/* Redirect the old login path to the new Jobs page */}
          <Route path="/recruiter-dashboard" element={<Navigate to="/recruiter/jobs" replace />} />
          
          <Route path="/recruiter/jobs" element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterJobs />
            </ProtectedRoute>
          } />
         

          <Route path="/recruiter/profile" element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterProfile />
            </ProtectedRoute>
          } />

          {/* Recruiter Private Routes */}
<Route path="/recruiter/applications" element={<Applications />} />
<Route path="/recruiter/post-job" element={<PostJob />} />
          {/* 👑 ADMIN WORLD */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
        </Routes>
      </div>

      {/* Footer sits at the very bottom */}
      <Footer />

    </BrowserRouter>
  );
}