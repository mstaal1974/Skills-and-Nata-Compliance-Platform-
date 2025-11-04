import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white/60 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] border border-white/20 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-black/10">
          <h3 className="text-lg font-semibold text-dark">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
