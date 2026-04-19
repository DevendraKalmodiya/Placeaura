import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold">Placeaura</h2>
          <p className="text-sm text-gray-400 mt-1">AI-Driven Campus Recruitment Platform</p>
        </div>
        <div className="flex space-x-6">
          <Link to="#" className="hover:text-blue-400">About</Link>
          <Link to="#" className="hover:text-blue-400">Contact</Link>
          <Link to="#" className="hover:text-blue-400">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}