import React from 'react';
import { Users, Calendar, MessageSquare, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Patients',
      value: '',
      icon: Users,
      color: 'border-blue-500',
      onClick: () => navigate('/total-patients')
    },
    
    {
      title: 'Pending Feedback',
      value: '',
      icon: MessageSquare,
      color: 'border-yellow-500',
      onClick: () => navigate('/feedback')
    },
   
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            onClick={stat.onClick}
            className={stat.onClick ? 'cursor-pointer' : ''}
          >
            <DashboardCard {...stat} />
          </div>
        ))}
      </div>
      
    
    </div>
  );
};

export default Dashboard;