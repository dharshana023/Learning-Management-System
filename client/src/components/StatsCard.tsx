import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: ReactNode;
  bgColor: string;
}

const StatsCard = ({ title, value, change, subtext, icon, bgColor }: StatsCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && <p className="ml-2 text-sm text-green-600">{change}</p>}
            {subtext && <p className="ml-2 text-sm text-gray-600">{subtext}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-md ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
