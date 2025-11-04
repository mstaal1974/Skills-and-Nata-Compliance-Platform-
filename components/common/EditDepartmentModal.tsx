import React, { useState, useEffect } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { Department } from '../../types';

interface EditDepartmentModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ department, isOpen, onClose }) => {
  const { updateDepartment } = useSkillsData();
  const [name, setName] = useState('');

  useEffect(() => {
    if (department) {
      setName(department.name);
    }
  }, [department]);

  if (!department) return null;
  
  const handleSave = () => {
    if (name.trim()) {
      updateDepartment(department.department_id, name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Department: ${department.name}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-dept-name" className="block text-sm font-medium text-medium mb-1">Department Name</label>
          <input
            id="edit-dept-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditDepartmentModal;