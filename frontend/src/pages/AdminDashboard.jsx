export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>
        
        {/* Top Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 font-medium">Total Students</h3>
            <p className="text-4xl font-bold mt-2">1,204</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 font-medium">Active Jobs</h3>
            <p className="text-4xl font-bold mt-2 text-blue-400">89</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 font-medium">AI Matches Made</h3>
            <p className="text-4xl font-bold mt-2 text-purple-400">14,302</p>
          </div>
        </div>

        {/* Charts & Graphs Placeholder */}
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 h-96 flex items-center justify-center">
          <p className="text-gray-500 text-lg">[ Chart.js / Recharts Graph will go here ]</p>
        </div>
      </div>
    </div>
  );
}