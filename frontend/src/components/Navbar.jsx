import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-2xl font-bold text-blue-600">Placeaura</Link>
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/Jobs" className="text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
          <Link to="/recruiter" className="text-gray-600 hover:text-blue-600">RecruiterDashboard</Link>
          <Link to="/admin" className="text-gray-600 hover:text-blue-600">AdminDashboard</Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <input 
          type="text" 
          placeholder="Search..." 
          className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
        />
        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
        <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">Sign Up</Link>
      </div>
    </nav>
  );
}