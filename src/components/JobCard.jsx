export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {job.match} Match
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">{job.location}</p>
      <button className="w-full bg-blue-50 text-blue-600 font-medium py-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
        View Details
      </button>
    </div>
  );
}