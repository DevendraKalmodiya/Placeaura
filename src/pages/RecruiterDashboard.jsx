import ApplicantCard from '../components/ApplicantCard';
import { applicants } from '../data/demoData';

export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Command Center</h1>
        <p className="text-gray-600 mb-8">Review AI-summarized candidate profiles tailored for your open roles.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.map((applicant) => (
            <ApplicantCard key={applicant.id} applicant={applicant} />
          ))}
        </div>
      </div>
    </div>
  );
}