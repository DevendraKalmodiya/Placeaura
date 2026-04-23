import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // These hooks help us track URL changes and redirect the user
  const location = useLocation();
  const navigate = useNavigate();

  // Every time the URL changes, check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    // If a token exists, they are authenticated
    setIsAuthenticated(!!token); 
  }, [location]);

  // Handle the logout process
  const handleLogout = () => {
    // 1. Wipe all user data from the browser's memory
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('resumeUrl');
    
    // 2. Update the navbar state immediately
    setIsAuthenticated(false);
    setIsMenuOpen(false); // Close mobile menu if open
    
    // 3. Send them back to the public home page
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">Placeaura</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Jobs</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Profile</Link>
            <Link to="/recruiter" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Recruiters</Link>
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Admins</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 rounded-md pl-3 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48 lg:w-64 transition-all"
              />
            </div>
            
            {/* CONDITIONAL RENDERING: Show Logout if authenticated, otherwise Login/Signup */}
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-gray-100 shadow-lg px-4 pt-4 pb-6 space-y-2 transition-all">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Link to="/" className="block text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/jobs" className="block text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
          <Link to="/profile" className="block text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>Profile</Link>
          <Link to="/recruiter" className="block text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>Recruiters</Link>
          <Link to="/admin" className="block text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>Admins</Link>
          
          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-3">
            {/* CONDITIONAL RENDERING FOR MOBILE MENU */}
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="w-full text-center text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-md font-medium border border-red-200 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="w-full text-center text-gray-700 hover:bg-gray-50 px-3 py-2.5 rounded-md font-medium border border-gray-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="w-full text-center bg-blue-600 text-white px-3 py-2.5 rounded-md font-medium hover:bg-blue-700 shadow-sm" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}