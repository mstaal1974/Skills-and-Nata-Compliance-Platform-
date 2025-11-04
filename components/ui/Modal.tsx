import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20 animate-[scaleIn_0.3s_ease-out_forwards]">
        <div className="flex justify-between items-center p-5 border-b border-black/10">
          <h2 className="text-xl font-semibold text-dark">{title}</h2>
          <button onClick={onClose} className="text-medium hover:text-dark transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
