export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 h-32"></div>
        <div className="px-6 py-8 relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white absolute -top-12 flex items-center justify-center text-gray-500 text-3xl font-bold">
            JD
          </div>
          <div className="mt-12">
            <h1 className="text-2xl font-bold text-gray-900">Devendra kalmodiya</h1>
            <p className="text-gray-600">Computer Science Undergraduate</p>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Completeness</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-sm text-gray-500">75% Complete - Upload your resume to boost matches.</p>
            </div>
            
            <div className="mt-8">
              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition-colors">
                Upload Resume (PDF/DOCX)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}