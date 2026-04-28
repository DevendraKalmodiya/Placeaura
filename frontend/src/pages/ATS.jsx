import { useState, useEffect } from 'react';

export default function ATS() {
  const [file, setFile] = useState(null);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const studentId = localStorage.getItem('userId');

  const fetchHistory = async () => {
    const res = await fetch(`http://localhost:5000/api/ats/history/${studentId}`);
    if (res.ok) setHistory(await res.json());
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleCalculate = async () => {
    setLoading(true);
    // Note: In a real app, you'd extract text from the PDF here. 
    // For this demo, we'll send a placeholder or the filename to simulate the analysis.
    try {
      const res = await fetch('http://localhost:5000/api/ats/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId, 
          resumeText: "Extracted Resume Text Content...", 
          resumeName: file.name 
        })
      });
      const data = await res.json();
      setScore(data.score);
      setFeedback(data.feedback);
      fetchHistory(); // Refresh history
    } catch (err) {
      alert("Error calculating score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Resume ATS Optimizer</h1>
        <p className="text-gray-500 mb-10">Use our Gemini AI to see how well your resume performs against recruiters.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* UPLOAD & VIEW SECTION */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Resume</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && <p className="text-green-600 font-bold text-sm">Selected: {file.name}</p>}
            </div>

            <button 
              disabled={!file || loading}
              onClick={handleCalculate}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all"
            >
              {loading ? "AI is Analyzing..." : "Calculate ATS Score"}
            </button>
          </div>

          {/* CURRENT SCORE DISPLAY */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            {score !== null ? (
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32">
                    <circle className="text-gray-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                    <circle className="text-blue-600" strokeWidth="10" strokeDasharray={314} strokeDashoffset={score ? (314 - (314 * score) / 100).toString() : "314"} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                  </svg>
                  <span className="absolute text-3xl font-black text-blue-600">{score}%</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-800">Your ATS Score</h3>
                <button 
                  onClick={() => setShowFeedback(true)}
                  className="mt-4 text-blue-600 font-bold underline text-sm"
                >
                  View Improvement Feedback
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <p className="text-5xl mb-2">📊</p>
                <p>Upload a file to see your score</p>
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK MODAL */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">AI Feedback</h2>
                <button onClick={() => setShowFeedback(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <ul className="space-y-4">
                {feedback.map((f, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold">●</span> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowFeedback(false)}
                className="w-full mt-8 bg-gray-900 text-white py-3 rounded-xl font-bold"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* PREVIOUS SCORES HISTORY */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Previous Scores</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-500">Date</th>
                  <th className="p-4 font-bold text-gray-500">Resume</th>
                  <th className="p-4 font-bold text-gray-500">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">{new Date(h.calculated_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-gray-900">{h.resume_name}</td>
                    <td className="p-4 font-black text-blue-600">{h.score}%</td>
                    <td className="p-4">
  <button 
    onClick={() => window.open(`http://localhost:5000/uploads/${h.resume_name}`, '_blank')}
    className="text-gray-400 hover:text-blue-600 transition-colors"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}