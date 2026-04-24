export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recruiter Portal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Post a Job Form (Left Side) */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Post New AI Role</h2>
            {/* You will put your job posting form inputs here */}
            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded mt-4">
              Generate Job Vector
            </button>
          </div>

          {/* Manage Active Postings (Right Side) */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Your Active Listings</h2>
            <div className="text-gray-500 border-2 border-dashed border-gray-200 p-8 text-center rounded-lg">
              You haven't posted any jobs yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}