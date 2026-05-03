import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function JobCard({ job, handleApply, selectedJob, setSelectedJob }) {
  const [showModal, setShowModal] = useState(false);

  // --- Parse the match percentage for color coding ---
  const matchString = job.match_percentage || job.match || "0%";
  const matchNumber = parseInt(matchString.toString().replace('%', ''), 10);

  // Set colors based on score (Matching image's 72% green)
  let colorClasses = "bg-green-50 text-green-700 border-green-200"; 
  if (matchNumber < 50) {
    colorClasses = "bg-red-50 text-red-700 border-red-200"; 
  } else if (matchNumber < 75) {
    // Standard green-ish yellow for 50-74%
    colorClasses = "bg-yellow-50 text-yellow-700 border-yellow-200"; 
  }

  // --- Apply Scroll Locking ---
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup to prevent lingering styles on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // --- Unified Apply Logic ---
  const onApplyClick = async () => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) {
      alert("Please log in to apply.");
      return;
    }

    // Call the application logic from parent
    if (handleApply) {
      await handleApply(job.id, job.match_percentage);
    }
    
    // Close parent details modal if it's open
    if (setSelectedJob) {
      setSelectedJob(null);
    }
    
    // Close this Job Card's details modal
    setShowModal(false);
  };

  return (
    <>
      {/* =======================================================
          1. THE MAIN JOB CARD (RESTORING THE ORIGINAL LAYOUT)
          ======================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        
        {/* Main Content Area */}
        <div className="p-6">
          
          {/* ✅ FIXED LAYOUT: Top row containing Title/Company on left, Badge on right */}
          <div className="flex justify-between items-start mb-4 gap-4">
            
            {/* 👈 Grouping Title & Company on the left */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">{job.title}</h2>
              <p className="text-blue-600 font-bold text-xl mt-1.5">{job.company}</p>
            </div>

            {/* 👉 Grouping the Match Percentage Badge on the right */}
            {job.match_percentage && job.match_percentage !== '0%' && (
              <div className={`text-sm font-extrabold px-5 py-2.5 rounded-full border shadow-sm flex items-center justify-center whitespace-nowrap ${colorClasses}`}>
                {job.match_percentage} Match
              </div>
            )}
          </div>

          {/* Metadata Row (Location, Type, Salary) */}
          <div className="flex flex-wrap gap-3.5 mb-7">
            <span className="bg-white text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-100">
              📍 {job.location}
            </span>
            {job.employment_type && (
              <span className="bg-white text-purple-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-100">
                💼 {job.employment_type}
              </span>
            )}
            {job.salary && (
              <span className="bg-white text-yellow-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-100">
                💰 {job.salary}
              </span>
            )}
          </div>

          {/* Short Description or Summary */}
          <p className="text-gray-700 text-base leading-relaxed mb-8 line-clamp-2">
            {job.summary || job.description || "No job summary provided."}
          </p>

          {/* ✅ FIXED LAYOUT: Side-by-Side Horizontal Buttons in Footer */}
          <div className="flex flex-row gap-5 border-t border-gray-100 pt-6">
            
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 bg-white text-blue-600 border-2 border-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              View Full Details
            </button>

            {job.is_external ? (
              <a
                href={job.external_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors text-center"
              >
                Apply on External Site
              </a>
            ) : (
              <button 
                onClick={onApplyClick}
                className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
              >
                Quick Apply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
          2. THE 70% CENTERED MODAL POPUP (PREVIOUSLY COMPLETED FIX)
          ======================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          
          {/* Dark blurred background overlay */}
          <div 
            className="absolute inset-0 bg-gray-950/60 transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Content Box - Covers 70% of desktop screens */}
          <div className="relative bg-white w-[95%] md:w-[75%] max-w-6xl max-h-[92vh] rounded-2xl shadow-3xl flex flex-col z-10 overflow-hidden border border-gray-100">
            
            {/* Header Area */}
            <div className="px-9 py-7 border-b border-gray-100 flex justify-between items-start bg-gray-50 z-10">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-4xl font-extrabold text-gray-950 tracking-tight">{job.title}</h2>
                  {job.match_percentage && job.match_percentage !== '0%' && (
                    <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap bg-green-50 text-green-700`}>
                      {job.match_percentage} Match
                    </span>
                  )}
                </div>
                <p className="text-xl text-blue-600 font-bold">{job.company} • <span className="text-gray-500">{job.location}</span></p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-colors focus:outline-none border border-gray-100 bg-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Scrollable Body Area (Fixed & Full) */}
            <div className="px-9 py-8 overflow-y-auto bg-white flex-1 space-y-9">
              
              <div className="flex flex-wrap gap-4">
                <span className="bg-white text-gray-700 text-sm font-bold px-4 py-2 rounded-lg border border-gray-100 shadow-sm">📍 {job.location}</span>
                {job.employment_type && (
                  <span className="bg-white text-purple-700 text-sm font-bold px-4 py-2 rounded-lg border border-gray-100 shadow-sm">💼 {job.employment_type}</span>
                )}
                {job.salary && (
                  <span className="bg-white text-yellow-700 text-sm font-bold px-4 py-2 rounded-lg border border-gray-100 shadow-sm">💰 {job.salary}</span>
                )}
              </div>

              <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-extrabold text-gray-950 mb-4 border-b border-gray-100 pb-3">About the Role</h3>
                <p className="text-gray-700 text-base leading-relaxed">{job.summary || job.description}</p>
              </div>

              {job.responsibilities && (
                <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-5 border-b border-gray-100 pb-3">Key Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700 text-base">
                    {job.responsibilities.split('\n').map((item, index) => 
                      item.trim() ? <li key={index}>{item.replace(/^-/, '').trim()}</li> : null
                    )}
                  </ul>
                </div>
              )}

              {job.required_skills && (
                <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-5 border-b border-gray-100 pb-3">Required Technical Skills</h3>
                  <div className="text-gray-700 text-base whitespace-pre-line leading-relaxed">{job.required_skills}</div>
                </div>
              )}

              {job.preferred_skills && (
                <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3">Preferred Skills / Bonus</h3>
                  <p className="text-gray-600 text-base italic leading-relaxed">{job.preferred_skills}</p>
                </div>
              )}

              <div className="bg-blue-50 p-7 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-extrabold text-gray-950 text-xl">AI Match Analysis</h4>
                  <p className="text-gray-600 text-base mt-1.5">Based on your semantic profile embeddings matching the job profile.</p>
                </div>
                <div className={`text-lg font-extrabold px-5 py-3 rounded-xl border shadow-sm ${colorClasses}`}>
                  {matchString} Match
                </div>
              </div>

            </div>

            {/* Footer Area with Centered Apply Button */}
            <div className="px-9 py-6 border-t border-gray-100 bg-white z-10 flex flex-row justify-center gap-5">
              <button 
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors" 
                onClick={() => setShowModal(false)}
              >
                Close Details
              </button>
              
              {job.is_external ? (
                <a
                  href={job.external_apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 shadow-md transition-all hover:-translate-y-0.5 text-center"
                >
                  Apply Now
                </a>
              ) : (
                <button 
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5"
                  onClick={onApplyClick}
                >
                  Quick Apply
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}