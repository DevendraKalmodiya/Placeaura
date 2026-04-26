import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // --- NEW: URL PARAM LOGIC ---
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const jobIdFromUrl = queryParams.get('jobId');

  const fetchApplications = async () => {
    try {
      const recruiterId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/api/recruiter/applications/${recruiterId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch('http://localhost:5000/api/applications/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, status: newStatus })
      });
      if (response.ok) {
        fetchApplications();
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  // --- UPDATED FILTER LOGIC ---
  const filteredApps = applications.filter(app => {
    // 1. Check Job ID Match (if jobId exists in URL)
    const matchesJob = jobIdFromUrl ? app.job_id.toString() === jobIdFromUrl : true;
    
    // 2. Check Status Match
    const matchesStatus = filterStatus === 'all' ? true : app.status === filterStatus;
    
    return matchesJob && matchesStatus;
  });

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Applications</h1>
            <p className="text-gray-500 mt-1">Review AI-matched candidates and take action.</p>
            
            {/* --- NEW: VISUAL INDICATOR FOR JOB FILTER --- */}
            {jobIdFromUrl && filteredApps.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                  Showing matches for: {filteredApps[0].job_title}
                </span>
                <button 
                  onClick={() => navigate('/recruiter/applications')}
                  className="text-xs text-gray-400 hover:text-red-500 font-bold underline"
                >
                  Clear Job Filter
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <span className="text-sm font-bold text-gray-500 ml-2">Filter by Status:</span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Candidates</option>
              <option value="accepted">Accepted (Shortlisted)</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 text-xs font-black uppercase text-gray-400">Student</th>
                <th className="p-5 text-xs font-black uppercase text-gray-400">Job Role</th>
                <th className="p-5 text-xs font-black uppercase text-gray-400">AI Match</th>
                <th className="p-5 text-xs font-black uppercase text-gray-400">Documents</th>
                <th className="p-5 text-xs font-black uppercase text-gray-400">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <tr key={app.application_id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-gray-900">{app.student_name}</p>
                    <p className="text-sm text-gray-400">{app.student_email}</p>
                  </td>
                  <td className="p-5 text-gray-700 font-medium">{app.job_title}</td>
                  <td className="p-5">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black border border-blue-100">
                      {app.match_score}
                    </span>
                  </td>
                  <td className="p-5">
                    <a 
                      href={`http://localhost:5000/uploads/${app.resume_url}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      Resume
                    </a>
                  </td>
                  <td className="p-5">
                    {app.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(app.application_id, 'accepted')}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.application_id, 'rejected')}
                          className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-md border ${
                        app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApps.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold">No candidates found for this specific filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}