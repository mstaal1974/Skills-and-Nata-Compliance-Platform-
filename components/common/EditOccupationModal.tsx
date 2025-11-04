import React, { useState, useEffect } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { Occupation, Skill } from '../../types';

interface EditOccupationModalProps {
  occupation: Occupation | null;
  onClose: () => void;
}

const EditOccupationModal: React.FC<EditOccupationModalProps> = ({ occupation, onClose }) => {
  const { skills, updateOccupation } = useSkillsData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkillIds, setRequiredSkillIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (occupation) {
      setTitle(occupation.title);
      setDescription(occupation.description);
      setRequiredSkillIds(new Set(occupation.required_skills));
    }
  }, [occupation]);

  if (!occupation) return null;

  const handleSkillToggle = (skillId: number) => {
    setRequiredSkillIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = () => {
    updateOccupation(occupation.occupation_id, {
      title,
      description,
      required_skills: Array.from(requiredSkillIds),
    });
    onClose();
  };

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={!!occupation} onClose={onClose} title={`Edit Occupation: ${occupation.title}`}>
      <div className="space-y-6">
        <div>
          <label htmlFor="edit-role-title" className="block text-sm font-medium text-medium mb-1">Role Title</label>
          <input
            type="text"
            id="edit-role-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="edit-role-desc" className="block text-sm font-medium text-medium mb-1">Description</label>
          <textarea
            id="edit-role-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Required Skills</h4>
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-3 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          />
          <div className="max-h-60 overflow-y-auto border border-gray-200/80 rounded-xl p-3 space-y-2 bg-gray-50/50">
            {filteredSkills.map(skill => (
              <div key={skill.skill_id} className="flex items-center">
                <input
                  id={`edit-skill-${skill.skill_id}`}
                  type="checkbox"
                  checked={requiredSkillIds.has(skill.skill_id)}
                  onChange={() => handleSkillToggle(skill.skill_id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`edit-skill-${skill.skill_id}`} className="ml-3 block text-sm text-dark">{skill.name} <span className="text-xs text-medium">({skill.category})</span></label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveChanges}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditOccupationModal;