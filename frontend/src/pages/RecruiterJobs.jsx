import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecruiterJobs() {
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  // The comprehensive form state
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', employment_type: 'Full-time', salary: '',
    summary: '', responsibilities: '', required_skills: '', qualifications: '', preferred_skills: ''
  });

  const fetchMyJobs = async () => {
    try {
      const recruiterId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/api/recruiter-jobs/${recruiterId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg('🤖 Gemini AI is mapping this highly detailed role...');

    try {
      const recruiterId = localStorage.getItem('userId');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recruiterId })
      });

      if (!response.ok) throw new Error('Failed to post job');

      setStatusMsg('✅ Comprehensive Job successfully posted and vectorized!');
      
      setFormData({ 
        title: '', company: '', location: '', employment_type: 'Full-time', salary: '',
        summary: '', responsibilities: '', required_skills: '', qualifications: '', preferred_skills: '' 
      });
      
      fetchMyJobs(); 

      setTimeout(() => {
        setStatusMsg('');
        setShowForm(false);
      }, 3000);

    } catch (error) {
      console.error(error);
      setStatusMsg('❌ Error posting job. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm("Are you sure? This will permanently remove the job and all associated student applications.");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setJobs(jobs.filter(job => job.id !== jobId));
          alert("🗑️ Job deleted successfully.");
        } else {
          alert("❌ Failed to delete job.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-500 mt-1">Post roles and let our AI engine match the perfect candidates.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {showForm ? 'Cancel Posting' : '+ Post New AI Role'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 animation-fade-in">
          <form onSubmit={handlePostJob} className="space-y-8">
            
            {/* SECTION 1: THE BASICS */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">1. The Basics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input required name="title" type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.title} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input required name="company" type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.company} onChange={handleChange} placeholder="e.g. Placeaura Tech" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input required name="location" type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.location} onChange={handleChange} placeholder="e.g. Remote" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 outline-none bg-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary / Stipend</label>
                  <input name="salary" type="text" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.salary} onChange={handleChange} placeholder="e.g. ₹5–8 LPA" />
                </div>
              </div>
            </div>

            {/* SECTION 2: THE ROLE */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">2. The Role</h3>
              <div className="space-y-4">
                <textarea required name="summary" rows="2" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.summary} onChange={handleChange} placeholder="Job Summary..." />
                <textarea required name="responsibilities" rows="4" className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.responsibilities} onChange={handleChange} placeholder="Key Responsibilities..." />
              </div>
            </div>

            {/* SECTION 3: SKILLS */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">3. Qualifications & Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea required name="required_skills" rows="3" className="w-full border border-gray-300 rounded-md p-2.5 outline-none" 
                  value={formData.required_skills} onChange={handleChange} placeholder="Required Skills..." />
                <textarea required name="qualifications" rows="3" className="w-full border border-gray-300 rounded-md p-2.5 outline-none" 
                  value={formData.qualifications} onChange={handleChange} placeholder="Qualifications..." />
              </div>
            </div>

            <button disabled={isProcessing} type="submit" 
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-md">
              {isProcessing ? 'Generating AI Vector...' : 'Launch Role to AI Match Engine'}
            </button>

            {statusMsg && (
              <p className={`text-center font-bold mt-4 p-3 rounded bg-gray-50 ${statusMsg.includes('❌') ? 'text-red-600 border border-red-200' : 'text-green-600 border border-green-200'}`}>
                {statusMsg}
              </p>
            )}
          </form>
        </div>
      )}

      {/* --- THE DYNAMIC JOBS LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {jobs.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Job Title</th>
                <th className="p-4 font-semibold text-gray-600">Details</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Applicants</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">
                    {job.title}
                    <div className="text-xs font-normal text-gray-500 mt-1">ID: #{job.id}</div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{job.location}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold shadow-sm">
                      {job.applicant_count || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-6">
                      <button onClick={() => navigate(`/recruiter/applications?jobId=${job.id}`)} className="text-blue-600 font-bold hover:underline whitespace-nowrap">View Matches</button>
                      <button onClick={() => navigate(`/recruiter/post-job?editId=${job.id}`)} className="text-amber-600 font-bold hover:underline whitespace-nowrap">Edit</button>
                      <button onClick={() => handleDelete(job.id)} className="text-red-600 font-bold hover:underline whitespace-nowrap">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium text-lg">You haven't posted any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}