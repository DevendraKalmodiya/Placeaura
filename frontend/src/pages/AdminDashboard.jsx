import { useState, useEffect } from 'react';
import { API_URL } from '../config';
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    recentJobs: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        
        const response = await fetch(`${API_URL}/api/admin/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-20 font-bold text-gray-500">Loading Platform Analytics...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Analytics</h1>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Students</p>
          <p className="text-4xl font-extrabold text-gray-900">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Recruiters</p>
          <p className="text-4xl font-extrabold text-gray-900">{stats.totalRecruiters}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Jobs Posted</p>
          <p className="text-4xl font-extrabold text-gray-900">{stats.totalJobs}</p>
        </div>
      </div>

      {/* RECRUITER ACTIVITY FEED */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Recent Recruiter Activity</h2>
          <p className="text-sm text-gray-500">Live feed of the latest roles processed by the Gemini AI Engine.</p>
        </div>
        
        {stats.recentJobs.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Job Title</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Company</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Posted By (Recruiter)</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{job.title}</td>
                  <td className="p-4 text-gray-700">{job.company}</td>
                  <td className="p-4 text-gray-700">
                    <span className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-xs font-bold">
                      {job.recruiter_name}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{job.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">No jobs have been posted by recruiters yet.</div>
        )}
      </div>
    </div>
  );
}