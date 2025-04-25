import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  MessageSquare, 
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [expanded, setExpanded] = useState(true);
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Command Center', path: '/' },
    { icon: Users, label: 'Doctors', path: '/doctors' },
    { icon: MessageSquare, label: 'Patient Comms.', path: '/feedback' },
    // { icon: Store, label: 'Shop Edits', path: '/shop' },
    { icon: Store, label: 'Doctor Schedule', path: '/doctor-schedule' },
    { icon: Store, label: 'Shop Gallery', path: '/shop/gallery' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`h-screen ${expanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-4 fixed left-0 top-0 transition-all duration-300 border-r border-indigo-400`}>
      <div className="relative mb-12 flex items-center justify-between">
        {expanded && <h1 className="text-2xl font-bold text-cyan-300">JD<span className="text-purple-300"> Medicose</span></h1>}
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="rounded-full p-1 bg-indigo-800 hover:bg-indigo-700 absolute -right-3"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center ${expanded ? 'justify-start space-x-3' : 'justify-center'} p-3 rounded-lg transition-all ${
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
                {expanded && <span className="text-sm font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className={`flex items-center ${expanded ? 'justify-start space-x-3' : 'justify-center'} p-3 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 mt-auto absolute bottom-4 ${expanded ? 'w-[calc(100%-2rem)]' : 'w-12'}`}
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-red-500/10"></div>
          <LogOut size={20} />
        </div>
        {expanded && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;