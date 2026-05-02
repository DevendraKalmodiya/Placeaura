import { useState, useEffect } from 'react';

export default function RecruiterProfile() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Get logged-in user from LocalStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser.id;

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: storedUser.company_name || 'TechCorp Industries',
    website: storedUser.website || 'https://techcorp.example.com',
    description: storedUser.bio || 'We are a leading AI-driven software company specializing in campus recruitment solutions.'
  });

  // Sync state if LocalStorage changes
  useEffect(() => {
    if (storedUser.id) {
      setCompanyInfo({
        companyName: storedUser.company_name || '',
        website: storedUser.website || '',
        description: storedUser.bio || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/recruiter/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyInfo.companyName,
          website: companyInfo.website,
          bio: companyInfo.description
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
        setIsEditing(false);

        // Update LocalStorage session data
        const updatedUserSession = { 
          ...storedUser, 
          company_name: data.user.company_name, 
          website: data.user.website, 
          bio: data.user.bio 
        };
        localStorage.setItem('user', JSON.stringify(updatedUserSession));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md font-medium text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              type="text" 
              name="companyName"
              className={`w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isEditing && 'bg-gray-50 text-gray-600 cursor-not-allowed'}`}
              value={companyInfo.companyName}
              onChange={handleInputChange}
              readOnly={!isEditing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
            <input 
              type="url" 
              name="website"
              className={`w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isEditing && 'bg-gray-50 text-gray-600 cursor-not-allowed'}`}
              value={companyInfo.website}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
            <textarea 
              name="description"
              rows="5"
              className={`w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${!isEditing && 'bg-gray-50 text-gray-600 cursor-not-allowed'}`}
              value={companyInfo.description}
              onChange={handleInputChange}
              readOnly={!isEditing}
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-2">This description will be shown to students when they view your job postings.</p>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                  // Revert changes to cached values
                  setCompanyInfo({
                    companyName: storedUser.company_name || '',
                    website: storedUser.website || '',
                    description: storedUser.bio || ''
                  });
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}