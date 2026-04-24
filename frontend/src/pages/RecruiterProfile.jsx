import { useState } from 'react';

export default function RecruiterProfile() {
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'TechCorp Industries',
    website: 'https://techcorp.example.com',
    description: 'We are a leading AI-driven software company specializing in campus recruitment solutions and data analytics.'
  });

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Profile</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2.5"
              value={companyInfo.companyName}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
            <input 
              type="url" 
              className="w-full border border-gray-300 rounded-md p-2.5"
              value={companyInfo.website}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
            <textarea 
              rows="5"
              className="w-full border border-gray-300 rounded-md p-2.5"
              value={companyInfo.description}
              readOnly
            ></textarea>
            <p className="text-sm text-gray-500 mt-2">This description will be shown to students when they view your job postings.</p>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700">
            Edit Profile
          </button>
        </form>
      </div>
    </div>
  );
}