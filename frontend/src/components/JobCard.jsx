import { useState } from 'react';

export default function JobCard({ job }) {
  // State to control the visibility of the popup modal
  const onApplyClick = async () => {
    await handleApply(job.id, job.match_percentage);
    if (setSelectedJob) setSelectedJob(null); // <--- Now it exists!
  };

  const [showModal, setShowModal] = useState(false);

  // Parse the match percentage for color coding
  const matchString = job.match_percentage || job.match || "0%";
  const matchNumber = parseInt(matchString.toString().replace('%', ''), 10);

  let colorClasses = "bg-red-100 text-red-800 border-red-200"; 
  if (matchNumber >= 75) {
    colorClasses = "bg-green-100 text-green-800 border-green-200"; 
  } else if (matchNumber >= 50) {
    colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-200"; 
  }

  // Prevent scrolling on the main page when the modal is open
  if (showModal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  const handleApply = async (jobId, matchScore) => {
  const studentId = localStorage.getItem('userId');
  
  if (!studentId) {
    alert("Please log in to apply.");
    return;
  }


  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch('${API_URL}/api/applications/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jobId, 
        studentId, 
        matchScore: matchScore || '0%' // Pass the AI match score
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Success! Your AI-profile has been submitted to the recruiter.");
      setSelectedJob(null); // Close the modal
    } else {
      alert(data.message || "❌ Something went wrong.");
    }
  } catch (error) {
    console.error("Apply error:", error);
    alert("❌ Server error. Check your connection.");
  }
};

  return (
    <>
      {/* 1. THE MAIN JOB CARD */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
            <p className="text-gray-600 text-sm font-medium">{job.company}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded border shadow-sm ${colorClasses}`}>
            {matchString}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-6 flex-grow">{job.location}</p>
        
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-50 text-blue-600 font-medium py-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors mt-auto"
        >
          View Details
        </button>
      </div>

      {/* 2. THE 70% CENTERED MODAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          
          {/* Dark blurred background overlay (clicking this closes the modal) */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Content Box - Covers 70% of desktop screens */}
          <div className="relative bg-white w-[90%] md:w-[70%] max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
            
            {/* Header Area */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">{job.title}</h2>
                <p className="text-lg text-blue-600 font-semibold mt-1">{job.company} • <span className="text-gray-500">{job.location}</span></p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Scrollable Body Area (Description, Skills, Experience) */}
            <div className="px-8 py-6 overflow-y-auto">
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Job Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  We are looking for a highly capable {job.title} to join our engineering team at {job.company}. You will be responsible for building high-quality, scalable applications, participating in code reviews, and collaborating seamlessly with cross-functional teams to deliver outstanding products.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Required Skills</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Proficiency in modern web technologies</li>
                    <li>Experience with React.js and RESTful APIs</li>
                    <li>Strong problem-solving abilities</li>
                    <li>Familiarity with Git and Agile workflows</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Experience & Qualifications</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>B.Tech / B.E in Computer Science or related field</li>
                    <li>0-2 years of relevant industry experience</li>
                    <li>Excellent communication and teamwork skills</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">AI Match Analysis</h4>
                  <p className="text-sm text-gray-600 mt-1">Based on your semantic profile embeddings.</p>
                </div>
                <span className={`text-lg font-extrabold px-4 py-2 rounded-lg border shadow-sm ${colorClasses}`}>
                  {matchString} Match
                </span>
              </div>

            </div>

            {/* Footer Area with Apply Button */}
            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end">
              <button 
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors mr-4" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5"
                onClick={() => {
                  handleApply(job.id, job.match_percentage);
                  alert(`Application for ${job.title} at ${job.company} submitted successfully!`);
                  setShowModal(false);
                }}
              >
                Apply for this Role
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}