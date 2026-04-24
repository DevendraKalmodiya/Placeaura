export default function RecruiterApplicants() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Recent Applicants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Applicant Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Alex Sharma</h3>
              <p className="text-blue-600 text-sm font-medium">Applied for: Frontend React Developer</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">92% Match</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">B.Tech Computer Science, 2024 Graduate. Highly skilled in React and Node.js.</p>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-gray-900 text-white py-2 rounded-md font-medium hover:bg-gray-800 text-sm">
              📄 View Resume
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 text-sm">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}