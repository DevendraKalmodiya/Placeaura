import { topRecruiters } from '../data/demoData';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Placement Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Mock Chart Blocks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Students Registered</h3>
            <p className="text-3xl font-bold text-blue-600">1,240</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Placed</h3>
            <p className="text-3xl font-bold text-green-600">892</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">Platform Activity</h3>
            <div className="h-8 bg-gray-100 rounded mt-2 flex items-end justify-between px-2 pb-1">
              {/* Fake bars for a chart */}
              <div className="w-4 h-4 bg-indigo-400 rounded-t"></div>
              <div className="w-4 h-6 bg-indigo-400 rounded-t"></div>
              <div className="w-4 h-3 bg-indigo-400 rounded-t"></div>
              <div className="w-4 h-7 bg-indigo-400 rounded-t"></div>
              <div className="w-4 h-5 bg-indigo-400 rounded-t"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Hiring Companies</h2>
          <div className="divide-y divide-gray-100">
            {topRecruiters.map((recruiter) => (
              <div key={recruiter.id} className="py-3 flex justify-between items-center">
                <span className="font-medium text-gray-800">{recruiter.name}</span>
                <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">{recruiter.hires} Offers</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}