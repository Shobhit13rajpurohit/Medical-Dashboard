import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  MessageSquare, 
  Store,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Close sidebar when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Command Center', path: '/' },
    { icon: Users, label: 'Doctors', path: '/doctors' },
    { icon: MessageSquare, label: 'Patient Comms.', path: '/feedback' },
    { icon: Store, label: 'Doctor Schedule', path: '/doctor-schedule' },
    { icon: Store, label: 'Shop Gallery', path: '/shop/gallery' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Create the sidebar content to reuse in both mobile and desktop versions
  const sidebarContent = (
    <>
      <div className="mb-12 flex items-center">
        <h1 className="text-2xl font-bold text-cyan-300">JD<span className="text-purple-300"> Medicose</span></h1>
      </div>

      <div className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)} // Close mobile menu when clicking a link
            className={({ isActive }) => 
              `flex items-center justify-start space-x-3 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-800 text-white shadow-lg shadow-blue-900/50'
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-cyan-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <div className={`${isActive ? 'animate-pulse' : ''} absolute -inset-1 rounded-full bg-cyan-500/20`}></div>
                  <item.icon size={20} className={isActive ? 'text-cyan-300' : ''} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center justify-start space-x-3 p-3 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 mt-auto absolute bottom-4 w-[calc(100%-2rem)]"
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-red-500/10"></div>
          <LogOut size={20} />
        </div>
        <span className="text-sm font-medium">Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-indigo-900 text-white shadow-lg"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div 
          className={`w-64 h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-4 transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-4 fixed left-0 top-0 border-r border-indigo-400">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
