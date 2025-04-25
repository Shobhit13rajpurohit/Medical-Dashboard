import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}) => {
  return (
    <div 
      className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${color} ${
        onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`${color.replace('border', 'text')} opacity-80`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;