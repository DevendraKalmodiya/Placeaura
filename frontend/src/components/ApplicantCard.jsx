export default function ApplicantCard({ applicant }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900">{applicant.name}</h3>
      <p className="text-sm text-blue-600 font-medium mb-2">{applicant.role}</p>
      <p className="text-sm text-gray-700 italic mb-4">"{applicant.summary}"</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {applicant.skills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>
      <button className="w-full bg-indigo-50 text-indigo-600 font-medium py-2 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors">
        Review Profile
      </button>
    </div>
  );
}