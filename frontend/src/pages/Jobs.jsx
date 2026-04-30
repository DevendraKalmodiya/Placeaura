import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard'; // Ensure this path is correct

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:5000/api/jobs${userId ? `?userId=${userId}` : ''}`);
        
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId, matchScore) => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) {
      alert("Please log in to apply.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/applications/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId, 
          studentId, 
          matchScore: matchScore || '0%' 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Application submitted successfully!");
        // Close modal if it was open
        if (selectedJob) setSelectedJob(null);
      } else {
        alert(`Notice: ${data.message}`); 
      }
    } catch (error) {
      console.error("Apply error:", error);
      alert("❌ Connection error. Check if your server is running.");
    }
  };

  // Prevent scrolling on the background when modal is open
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedJob]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center font-bold text-blue-600 text-xl animate-pulse">
          🤖 AI is analyzing and ranking the job market...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Recommended Roles</h1>
          <p className="text-gray-600 mt-2 text-lg">Jobs ranked by our Gemini Semantic Matching engine based on your profile.</p>
        </div>

        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* --- MAIN JOB CARD --- */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                      <p className="text-blue-600 font-bold text-lg">{job.company}</p>
                    </div>
                    {job.match_percentage && job.match_percentage !== '0%' && (
                      <div className="bg-green-50 text-green-700 text-sm font-extrabold px-4 py-2 rounded-full shadow-sm border border-green-200 whitespace-nowrap">
                        {job.match_percentage} Match
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="bg-white text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">📍 {job.location}</span>
                    {job.employment_type && (
                      <span className="bg-white text-purple-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">💼 {job.employment_type}</span>
                    )}
                    {job.salary && (
                      <span className="bg-white text-yellow-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">💰 {job.salary}</span>
                    )}
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed mb-6 line-clamp-2">
                    {job.summary || job.description || "No summary provided."}
                  </p>

                  <div className="flex gap-4 border-t border-gray-100 pt-6">
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    >
                      View Full Details
                    </button>
                    <button 
                      onClick={() => handleApply(job.id, job.match_percentage)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
                    >
                      Quick Apply
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">No jobs found.</p>
              <p className="text-gray-500">Check back later when recruiters post new roles!</p>
            </div>
          )}
        </div>
      </div>

      {/* --- FLOATING MODAL CARD --- */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white bg-opacity-80 backdrop-blur-md animation-fade-in">
          
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            
            <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-white z-10">
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">{selectedJob.title}</h2>
                  {selectedJob.match_percentage && selectedJob.match_percentage !== '0%' && (
                    <span className="bg-green-50 text-green-700 text-xs font-extrabold px-3 py-1 rounded-full border border-green-200">
                      {selectedJob.match_percentage} Match
                    </span>
                  )}
                </div>
                <p className="text-blue-600 font-bold text-xl">{selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-white text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">📍 {selectedJob.location}</span>
                {selectedJob.employment_type && (
                  <span className="bg-white text-purple-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">💼 {selectedJob.employment_type}</span>
                )}
                {selectedJob.salary && (
                  <span className="bg-white text-yellow-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200">💰 {selectedJob.salary}</span>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">About the Role</h3>
                <p className="text-gray-700 leading-relaxed">{selectedJob.summary || selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4">Key Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {selectedJob.responsibilities.split('\n').map((item, index) => 
                      item.trim() ? <li key={index}>{item.replace(/^-/, '').trim()}</li> : null
                    )}
                  </ul>
                </div>
              )}

              {selectedJob.required_skills && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4">Required Technical Skills</h3>
                  <div className="text-gray-700 whitespace-pre-line">{selectedJob.required_skills}</div>
                </div>
              )}

              {selectedJob.qualifications && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4">Qualifications</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {selectedJob.qualifications.split('\n').map((item, index) => 
                      item.trim() ? <li key={index}>{item.replace(/^-/, '').trim()}</li> : null
                    )}
                  </ul>
                </div>
              )}

              {selectedJob.preferred_skills && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Bonus / Preferred Skills</h3>
                  <p className="text-gray-600 italic">{selectedJob.preferred_skills}</p>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-gray-200 bg-white z-10">
              <button 
                onClick={() => handleApply(selectedJob.id, selectedJob.match_percentage)} 
                className="w-full bg-blue-600 text-white text-lg py-4 rounded-xl font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
              >
                Apply Now 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}