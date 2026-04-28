import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Grab the user's role and token
  const role = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  // If they are on the login or signup page, hide the Navbar completely
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear(); // Wipe the security badge
    navigate('/login');   // Kick them out to login
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to={role === 'student' ? '/student-dashboard' : `/${role}-dashboard`} className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-extrabold text-xl text-blue-600 tracking-tight">Placeaura</span>
            </Link>
          </div>

          {/* Dynamic Links Section */}
          <div className="flex items-center space-x-8">
            
            {/* 🎓 STUDENT LINKS */}
            {role === 'student' && (
              <>
                <Link to="/student-dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Jobs Board</Link>
                
                {/* --- NEW ATS OPTIMIZER LINK --- */}
                <Link to="/ats" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase">New</span>
                  ATS Optimizer
                </Link>

                <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Profile</Link>
              </>
            )}

           {/* 🏢 RECRUITER LINKS */}
            {role === 'recruiter' && (
              <>
                <Link to="/recruiter/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Jobs</Link>
                <Link to="/recruiter/profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Profile</Link>
                <Link to="/recruiter/applications" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Applications
                </Link>              
              </>
            )}

            {/* 👑 ADMIN LINKS */}
            {role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Platform Analytics</Link>
              </>
            )}

            {/* Logout Button (Shows for everyone logged in) */}
            {token && (
              <button 
                onClick={handleLogout}
                className="ml-4 bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                Log Out
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}