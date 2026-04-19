 import JobCard from '../components/JobCard';
import { jobs } from '../data/demoData';

export default function Jobs() {
  return (
 <div className="container mx-auto px-6 py-12 flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
  );
}