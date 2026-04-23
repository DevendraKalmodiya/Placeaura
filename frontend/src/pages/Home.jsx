import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';

export default function Home() {
  const navigate = useNavigate();
  
  const [liveJobs, setLiveJobs] = useState([]);
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
        setLiveJobs(data); 
        
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
  const sortedJobs = [...liveJobs].sort((a, b) => {
    const matchA = parseInt((a.match_percentage || a.match || "0").toString().replace('%', ''), 10);
    const matchB = parseInt((b.match_percentage || b.match || "0").toString().replace('%', ''), 10);
    return matchB - matchA; // Descending order (Highest first)
  });

  return (
    <div className="flex flex-col bg-gray-50 flex-grow">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Match Your True Potential</h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
          Bridge the gap between academia and industry with our intelligent platform where student capabilities are accurately matched with corporate requirements.
        </p>
        <button 
          onClick={() => navigate('/jobs')} 
          className="bg-white text-blue-600 px-8 py-3 rounded-md font-bold hover:bg-blue-50 transition-colors shadow-sm"
        >
          Explore Opportunities
        </button>
      </div>

      {/* Live Job Listings */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Top 9 Matches For You</h2>
          <button 
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Jobs &rarr;
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500 text-lg font-medium animate-pulse">Loading live jobs from database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : sortedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Display exactly 9 jobs using .slice(0, 9) */}
            {sortedJobs.slice(0, 9).map((job) => (
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