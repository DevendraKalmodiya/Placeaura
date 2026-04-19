import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Using react-router-dom for navigation
import JobCard from '../components/JobCard';

export default function Home() {
  const navigate = useNavigate();
  
  // 1. Create state to hold the live database jobs
  const [liveJobs, setLiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch data from your Node.js backend when the page loads
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetching from the Express backend port 5000
        const response = await fetch('http://localhost:5000/api/jobs');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setLiveJobs(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs from PostgreSQL:", err);
        setError("Failed to load jobs. Is the backend running?");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col bg-gray-50 grow">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Match Your True Potential</h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
          Bridge the gap between academia and industry with our intelligent platform where student capabilities are accurately matched with corporate requirements.
        </p>
        <button 
          onClick={() => navigate('/signup')} 
          className="bg-white text-blue-600 px-8 py-3 rounded-md font-bold hover:bg-blue-50 transition-colors shadow-sm"
        >
          Explore Opportunities
        </button>
      </div>

      {/* Live Job Listings */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended for You</h2>
        
        {/* 3. Handle loading, error, and empty states */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500 text-lg font-medium animate-pulse">Loading live jobs from database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-2">Make sure you ran `node server.js` in your backend folder!</p>
          </div>
        ) : liveJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 font-medium text-lg">No jobs available right now.</p>
            <p className="text-gray-500 mt-2">Add some data to your PostgreSQL database to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}