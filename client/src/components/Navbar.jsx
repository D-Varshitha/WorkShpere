import { useAuth } from '../contexts/AuthContext';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="h-16 bg-white border-b fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-10">
      <div className="text-gray-600 font-medium">
        Welcome back, <span className="text-blue-600 font-bold capitalize">{user?.name}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium capitalize">{user?.role}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-20">
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
