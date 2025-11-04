import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { Person, PersonSkill, Skill } from '../../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose }) => {
  const { occupations, departments, skills, addPerson } = useSkillsData();
  
  // Form state
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [isTechnician, setIsTechnician] = useState(false);
  const [technicianId, setTechnicianId] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [assignedSkills, setAssignedSkills] = useState<PersonSkill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setName('');
    setJob('');
    setDepartmentId('');
    setIsTechnician(false);
    setTechnicianId('');
    setQualifications('');
    setExperience('');
    setAssignedSkills([]);
    setSkillSearch('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !job || departmentId === '') return;

    const newPerson: Omit<Person, 'person_id'> = {
      name,
      job,
      department_id: departmentId,
      skills: assignedSkills,
      isTechnician: isTechnician,
      ...(isTechnician && {
        technicianId: technicianId,
        qualifications: qualifications.split(',').map(q => q.trim()).filter(Boolean),
        experience: experience,
      }),
    };
    
    addPerson(newPerson);
    
    setShowSuccess(true);
    setTimeout(() => {
        setShowSuccess(false);
        handleClose();
    }, 2000);
  };
  
  const filteredSkills = useMemo(() => {
    const assignedSkillIds = new Set(assignedSkills.map(s => s.skill_id));
    return skills.filter(skill => 
        !assignedSkillIds.has(skill.skill_id) &&
        (skill.name.toLowerCase().includes(skillSearch.toLowerCase()) || 
         skill.category.toLowerCase().includes(skillSearch.toLowerCase()))
    );
  }, [skills, assignedSkills, skillSearch]);

  const addSkillToPerson = (skill: Skill) => {
    setAssignedSkills(prev => [...prev, { skill_id: skill.skill_id, level: 1 }]);
  };

  const removeSkillFromPerson = (skillId: number) => {
    setAssignedSkills(prev => prev.filter(s => s.skill_id !== skillId));
  };

  const updateSkillLevel = (skillId: number, level: PersonSkill['level']) => {
    setAssignedSkills(prev => prev.map(s => s.skill_id === skillId ? { ...s, level } : s));
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Person">
      {showSuccess ? (
        <div className="text-center p-8">
            <h3 className="text-2xl font-bold text-secondary">Success!</h3>
            <p className="mt-2">{name} has been added to the platform.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full input-style" />
                <select value={job} onChange={e => setJob(e.target.value)} required className="w-full input-style">
                    <option value="" disabled>Select Job/Occupation</option>
                    {occupations.map(o => <option key={o.occupation_id} value={o.title}>{o.title}</option>)}
                </select>
                <select value={departmentId} onChange={e => setDepartmentId(Number(e.target.value))} required className="w-full input-style col-span-1 md:col-span-2">
                    <option value="" disabled>Select Department</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.name}</option>)}
                </select>
            </div>

            {/* NATA Technician Fields */}
            <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <div className="flex items-center">
                    <input type="checkbox" id="isTechnician" checked={isTechnician} onChange={e => setIsTechnician(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="isTechnician" className="ml-3 block text-sm font-bold text-blue-800">Is this person a NATA Technician?</label>
                </div>
                {isTechnician && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.5s_ease-out]">
                        <input type="text" placeholder="Technician ID" value={technicianId} onChange={e => setTechnicianId(e.target.value)} className="input-style" />
                        <input type="text" placeholder="Qualifications (comma-separated)" value={qualifications} onChange={e => setQualifications(e.target.value)} className="input-style" />
                        <textarea placeholder="Experience Summary" value={experience} onChange={e => setExperience(e.target.value)} rows={3} className="input-style col-span-1 md:col-span-2" />
                    </div>
                )}
            </div>

            {/* Skill Assignment */}
            <div className="space-y-4">
                <h4 className="font-semibold">Assign Skills & Proficiency</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Available Skills */}
                    <div className="space-y-2">
                         <input type="text" placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} className="w-full input-style" />
                         <div className="max-h-40 overflow-y-auto border border-gray-200/80 rounded-xl p-2 space-y-1 bg-gray-50/50">
                            {filteredSkills.map(skill => (
                                <button type="button" key={skill.skill_id} onClick={() => addSkillToPerson(skill)} className="w-full text-left text-sm p-2 rounded-md hover:bg-primary/10 transition-colors">
                                    {skill.name} <span className="text-xs text-medium">({skill.category})</span>
                                </button>
                            ))}
                         </div>
                    </div>
                    {/* Assigned Skills */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-medium">Assigned Skills ({assignedSkills.length})</p>
                        <div className="max-h-40 overflow-y-auto border border-gray-200/80 rounded-xl p-2 space-y-2 bg-gray-50/50">
                            {assignedSkills.length > 0 ? assignedSkills.map(pSkill => {
                                const skill = skills.find(s => s.skill_id === pSkill.skill_id);
                                return (
                                    <div key={pSkill.skill_id} className="p-2 bg-white rounded-md shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-semibold">{skill?.name}</p>
                                            <button type="button" onClick={() => removeSkillFromPerson(pSkill.skill_id)} className="text-red-500 hover:text-red-700 text-lg">&times;</button>
                                        </div>
                                        <div className="flex items-center mt-1 space-x-1">
                                            <span className="text-xs mr-2">Level:</span>
                                            {([1,2,3,4,5] as const).map(level => (
                                                <button type="button" key={level} onClick={() => updateSkillLevel(pSkill.skill_id, level)} className={`w-5 h-5 rounded-full ${pSkill.level >= level ? 'bg-primary' : 'bg-gray-300'} transition-colors`}></button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-sm text-center text-medium p-4">No skills assigned yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">Add Person</button>
            </div>
             <style>{`.input-style { border-radius: 0.75rem; border: 1px solid rgba(209, 213, 219, 0.5); background-color: rgba(255, 255, 255, 0.5); box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; } .input-style:focus { outline: none; ring: 2px; ring-color: #6366F1; border-color: #6366F1; }`}</style>
        </form>
      )}
    </Modal>
  );
};

export default AddPersonModal;