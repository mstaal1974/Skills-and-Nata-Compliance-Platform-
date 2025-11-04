import React, { useState, useEffect, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { Competency, AuthorizationStatus } from '../../types';

interface EditCompetencyModalProps {
  competency: Competency | null;
  onClose: () => void;
}

const AUTHORIZATION_STATUSES: AuthorizationStatus[] = ['Authorized', 'In Training', 'Not Authorized', 'Supervised Use Only'];

const EditCompetencyModal: React.FC<EditCompetencyModalProps> = ({ competency, onClose }) => {
  const { skills, evidence, updateCompetency, addEvidence } = useSkillsData();
  const [formData, setFormData] = useState<Partial<Competency>>({});
  const [newEvidence, setNewEvidence] = useState('');

  useEffect(() => {
    if (competency) {
      setFormData({
        trainingCompleteDate: competency.trainingCompleteDate,
        competencyAssessedDate: competency.competencyAssessedDate,
        assessedBy: competency.assessedBy,
        authorizationStatus: competency.authorizationStatus,
      });
    }
  }, [competency]);

  const competencyEvidence = useMemo(() => {
    if (!competency) return [];
    return evidence.filter(e => e.competency_id === competency.competency_id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [competency, evidence]);

  if (!competency) return null;

  const testMethod = skills.find(s => s.skill_id === competency.skill_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSave = () => {
    // A real app would have better validation here
    updateCompetency(competency.competency_id, formData);
    onClose();
  };
  
  const handleAddEvidence = () => {
    if (newEvidence.trim()) {
        addEvidence(competency.competency_id, newEvidence.trim(), "Lab Manager"); // Assuming current user is Lab Manager
        setNewEvidence('');
    }
  };

  return (
    <Modal isOpen={!!competency} onClose={onClose} title={`Edit Competency: ${testMethod?.name}`}>
      <div className="space-y-6">
        {/* Form to edit competency details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Training Complete Date</label>
            <input type="date" name="trainingCompleteDate" value={formData.trainingCompleteDate || ''} onChange={handleChange} className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Competency Assessed Date</label>
            <input type="date" name="competencyAssessedDate" value={formData.competencyAssessedDate || ''} onChange={handleChange} className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Assessed By</label>
            <input type="text" name="assessedBy" value={formData.assessedBy || ''} onChange={handleChange} className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Authorization Status</label>
            <select name="authorizationStatus" value={formData.authorizationStatus || ''} onChange={handleChange} className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary">
              {AUTHORIZATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        {/* Evidence Section */}
        <div>
            <h4 className="font-semibold text-dark mb-2">Evidence of Competency</h4>
            <div className="space-y-3">
                <div className="flex gap-2">
                    <input type="text" value={newEvidence} onChange={e => setNewEvidence(e.target.value)} placeholder="Add new evidence record..." className="flex-grow border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary" />
                    <button onClick={handleAddEvidence} className="px-4 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-all">Add</button>
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200/80 rounded-xl p-3 space-y-2 bg-gray-50/50">
                    {competencyEvidence.length > 0 ? competencyEvidence.map(e => (
                        <div key={e.evidence_id} className="text-sm">
                            <p className="text-dark">{e.record}</p>
                            <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()} - by {e.author}</p>
                        </div>
                    )) : <p className="text-sm text-center text-medium p-4">No evidence records found.</p>}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">Save Changes</button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCompetencyModal;
