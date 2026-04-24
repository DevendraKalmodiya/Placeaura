import { useState, useEffect } from 'react';

export default function RecruiterJobs() {
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [jobs, setJobs] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', description: ''
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg('🤖 Gemini is generating 3072-dimension job vector...');

    try {
      const recruiterId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recruiterId })
      });

      if (!response.ok) throw new Error('Failed to post job');

      setStatusMsg('✅ Job successfully posted and mathematically mapped!');
      setFormData({ title: '', company: '', location: '', description: '' });
      
      fetchMyJobs(); // Instantly refresh the list after posting!

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

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : '+ Post New Job'}
        </button>
      </div>

      {/* THE RESTORED AI JOB POSTING FORM */}
      {showForm && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 animation-fade-in">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Job Details</h2>
          <form onSubmit={handlePostJob} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input required type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Senior Node.js Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input required type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} 
                  placeholder="e.g. Placeaura Tech" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input required type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} 
                placeholder="e.g. Remote / Bangalore" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Job Description</label>
              <textarea required rows="5" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Paste the full job requirements. Gemini will read this to match with student resumes." />
            </div>

            <button disabled={isProcessing} type="submit" 
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors">
              {isProcessing ? 'Generating AI Vector...' : 'Launch Job to AI Engine'}
            </button>

            {statusMsg && (
              <p className={`text-center font-medium mt-4 ${statusMsg.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                {statusMsg}
              </p>
            )}
          </form>
        </div>
      )}

      {/* THE DYNAMIC JOBS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {jobs.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Job Title</th>
                <th className="p-4 font-semibold text-gray-600">Location</th>
                <th className="p-4 font-semibold text-gray-600">Applicants</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{job.title}</td>
                  <td className="p-4 text-gray-600">{job.location}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                      {job.applicant_count || 0} Applied
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 font-medium hover:underline">View Applicants</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500 font-medium">
            You haven't posted any jobs yet. Click "+ Post New Job" to get started.
          </div>
        )}
      </div>
    </div>
  );
}