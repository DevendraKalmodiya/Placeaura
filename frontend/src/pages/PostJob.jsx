import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PostJob() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we are in "Edit Mode"
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('editId');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    summary: '',
    responsibilities: '',
    required_skills: '',
    qualifications: '',
    preferred_skills: '',
    salary: '',
    employment_type: 'Full-time'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA IF EDITING ---
  useEffect(() => {
    if (editId) {
      const fetchJobDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/jobs/details/${editId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData(data);
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
        }
      };
      fetchJobDetails();
    }
  }, [editId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recruiterId = localStorage.getItem('userId');
    const url = editId 
      ? `http://localhost:5000/api/jobs/${editId}` 
      : 'http://localhost:5000/api/jobs';
    
    const method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recruiterId })
      });

      if (response.ok) {
        alert(editId ? "✅ Job updated successfully!" : "🚀 Job posted successfully!");
        navigate('/recruiter/jobs');
      } else {
        alert("❌ Failed to save job. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {editId ? 'Edit Job Posting' : 'Post a New Job'}
        </h1>
        <p className="text-gray-500 mb-8">
          {editId ? 'Update the details below to re-index this role with AI.' : 'Fill in the details to find your perfect AI-matched candidate.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Frontend Developer" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Indore / Remote" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Salary/Stipend</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange} required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. ₹50k - ₹70k" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">About the Role (Summary)</label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} required rows="3" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief overview of the role..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Key Responsibilities (One per line)</label>
            <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} required rows="4" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="- Build UI components&#10;- Collaborate with teams"></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Required Technical Skills</label>
            <textarea name="required_skills" value={formData.required_skills} onChange={handleChange} required rows="2" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="React, Node.js, Tailwind CSS..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Qualifications</label>
              <textarea name="qualifications" value={formData.qualifications} onChange={handleChange} rows="3" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="B.Tech in CS..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Skills (Optional)</label>
              <textarea name="preferred_skills" value={formData.preferred_skills} onChange={handleChange} rows="3" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Docker, AWS experience..."></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'AI is processing...' : (editId ? 'Update Job Posting' : 'Post Job Now')}
          </button>
        </form>
      </div>
    </div>
  );
}