import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ name: '', email: '', role: '', resume_url: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Check Auth Status and Load User Data on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to parse user data");
      navigate('/login');
    }
  }, [navigate]);

  // 2. Handle File Selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setMessage({ text: 'Please upload a PDF file.', type: 'error' });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setMessage({ text: '', type: '' }); 
  };

  // 3. Process AI Upload
  const handleFileUpload = async (event) => {
    event.preventDefault();
    
    const userId = localStorage.getItem('userId');

    if (!selectedFile) {
      setMessage({ text: 'Please select a resume to upload first.', type: 'error' });
      return;
    }

    if (!userId) {
      setMessage({ text: 'Session expired. Please log in again.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage({ text: '🤖 Generating 3072-Dimension AI Vector... Please wait.', type: 'info' });

    // Pack the file and the ID for the backend
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('userId', userId); 

    try {
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message || '✅ AI Profile generated successfully!', type: 'success' });
        
        // Update local UI state AND LocalStorage so the "View PDF" button appears instantly
        const updatedUser = { ...user, resume_url: data.filename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Clear input
        setSelectedFile(null);
        document.getElementById('resume-upload-input').value = '';
      } else {
        setMessage({ text: `❌ ${data.message || 'Upload failed.'}`, type: 'error' });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ text: '❌ Server error. Is the backend running?', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Your Placeaura Profile
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Manage your details and AI Match engine resume.</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            
            {/* User Details */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-extrabold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Resume Management */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Match Resume</h3>
              
              {user.resume_url ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl mb-6 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-lg">Active Resume Uploaded</p>
                    <p className="text-sm opacity-90 mt-1 mb-3">Your AI profile is actively ranking jobs.</p>
                    <a 
                      href={`http://localhost:5000/uploads/${user.resume_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-colors inline-block"
                    >
                      View Uploaded PDF ↗
                    </a>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 shadow-sm">
                  <p className="font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    No AI Profile Found
                  </p>
                  <p className="text-sm mt-1 ml-7">Upload your PDF resume to activate the semantic matching engine.</p>
                </div>
              )}

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                  <input 
                    type="file" 
                    id="resume-upload-input"
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                  />
                </div>

                {message.text && (
                  <div className={`p-3 rounded-lg text-sm font-medium border ${
                    message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                    message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
                    'bg-blue-50 text-blue-600 border-blue-100' 
                  }`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={!selectedFile || isUploading}
                  className={`w-full py-3 px-4 rounded-xl font-bold shadow-sm transition-all flex justify-center items-center ${
                    !selectedFile || isUploading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 shadow-md'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating AI Profile...
                    </>
                  ) : user.resume_url ? 'Upload New Resume' : 'Activate AI Match'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}