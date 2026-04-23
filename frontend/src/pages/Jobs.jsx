import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';

export default function Jobs() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Grab the logged-in user's ID
        const userId = localStorage.getItem('userId');
        
        // Attach it to the URL so the backend knows to run the AI math
        const url = userId 
          ? `http://localhost:5000/api/jobs?userId=${userId}` 
          : 'http://localhost:5000/api/jobs';

        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        const data = await response.json();
        
        // Save the jobs to state
        setAllJobs(data); 
        
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        // THIS IS THE MAGIC LINE! Tell React to stop showing the loading text:
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Force sort the jobs highest to lowest based on the match percentage
  const sortedJobs = [...allJobs].sort((a, b) => {
    const matchA = parseInt((a.match_percentage || a.match || "0").toString().replace('%', ''), 10);
    const matchB = parseInt((b.match_percentage || b.match || "0").toString().replace('%', ''), 10);
    return matchB - matchA; // Descending order (Highest first)
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Opportunities</h1>
            <p className="text-gray-600 mt-2">Browse all available roles sorted by your AI Match Score.</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-lg shadow-sm">
            {sortedJobs.length} Roles Found
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500 text-lg font-medium animate-pulse">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : sortedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Map over the fully sorted list, showing ALL jobs */}
            {sortedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 font-medium text-lg">No jobs available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}