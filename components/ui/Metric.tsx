import React, { ReactNode } from 'react';
import Card from './Card';

interface MetricProps {
  label: string;
  value: string | number;
  icon: ReactNode;
}

const Metric: React.FC<MetricProps> = ({ label, value, icon }) => {
  return (
    <Card className="!p-0">
      <div className="flex items-center p-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/0 text-primary mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-medium">{label}</p>
          <p className="text-2xl font-bold text-dark">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default Metric;