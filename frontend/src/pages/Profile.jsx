import { useState, useEffect } from 'react';

export default function Profile() {
  const [userName, setUserName] = useState('Loading...');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    // 1. Fetch the logged-in user's name from localStorage
    // (If no one has logged in yet, we provide a fallback for testing)
    const loggedInName = localStorage.getItem('userName') || 'Username';
    setUserName(loggedInName);

    // 2. Dynamically generate the initials (e.g., "Devendra Kalmodiya" -> "DK")
    const nameParts = loggedInName.trim().split(' ');
    if (nameParts.length >= 2) {
      setInitials((nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase());
    } else if (nameParts.length === 1 && nameParts[0] !== "") {
      setInitials(nameParts[0][0].toUpperCase());
    } else {
      setInitials('U'); // Fallback unknown user
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 h-32"></div>
        <div className="px-6 py-8 relative">
          
          {/* Dynamic Initials Display */}
          <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white absolute -top-12 flex items-center justify-center text-gray-500 text-3xl font-bold">
            {initials}
          </div>
          
          <div className="mt-12">
            {/* Dynamic Name Display */}
            <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
            <p className="text-gray-600">Computer Science Undergraduate</p>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Completeness</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-sm text-gray-500">75% Complete - Upload your resume to boost matches.</p>
            </div>
            
            <div className="mt-8">
              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition-colors">
                Upload Resume (PDF/DOCX)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}