import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { Department, Person } from '../../types';
import EditDepartmentModal from '../common/EditDepartmentModal';

const AssignPeopleModal: React.FC<{
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ department, isOpen, onClose }) => {
  const { people, updatePersonDepartment } = useSkillsData();
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);

  if (!department) return null;

  const peopleNotInDepartment = people.filter(p => p.department_id !== department.department_id);

  const handleAssign = () => {
    selectedPeople.forEach(personId => {
      updatePersonDepartment(personId, department.department_id);
    });
    onClose();
    setSelectedPeople([]);
  };

  const handleSelectPerson = (personId: number) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId) 
        : [...prev, personId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign People to ${department.name}`}>
      <div className="space-y-4">
        <p className="text-medium">Select employees to assign to this department.</p>
        <div className="max-h-60 overflow-y-auto border border-gray-200/80 rounded-xl p-3 space-y-2 bg-gray-50/50">
          {peopleNotInDepartment.length > 0 ? peopleNotInDepartment.map(person => (
            <div key={person.person_id} className="flex items-center">
              <input
                id={`person-${person.person_id}`}
                type="checkbox"
                checked={selectedPeople.includes(person.person_id)}
                onChange={() => handleSelectPerson(person.person_id)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor={`person-${person.person_id}`} className="ml-3 block text-sm text-dark">{person.name} ({person.job})</label>
            </div>
          )) : <p className="text-sm text-medium">All employees are already in this department.</p>}
        </div>
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleAssign} 
            disabled={selectedPeople.length === 0}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
          >
            Assign Selected ({selectedPeople.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const Departments: React.FC = () => {
  const { departments, people, addDepartment, deleteDepartment } = useSkillsData();
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartmentName.trim()) {
      addDepartment(newDepartmentName.trim());
      setNewDepartmentName('');
    }
  };
  
  const handleOpenAssignModal = (department: Department) => {
    setSelectedDepartment(department);
    setIsAssignModalOpen(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleDelete = (departmentId: number) => {
    if (departmentId === 0) {
      alert("The 'Unassigned' department cannot be deleted.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this department? Any members will be moved to 'Unassigned'.")) {
      deleteDepartment(departmentId);
    }
  };
  
  const departmentMembers = useMemo(() => {
    const map = new Map<number, Person[]>();
    departments.forEach(dept => map.set(dept.department_id, []));
    people.forEach(person => {
        if (map.has(person.department_id)) {
            map.get(person.department_id)?.push(person);
        } else {
            // This can happen if a person's department was deleted in a previous session
            // For now, let's ensure they at least appear in an "Unassigned" group if it exists
            const unassigned = map.get(0);
            if(unassigned) {
                unassigned.push(person);
            }
        }
    });
    return map;
  }, [departments, people]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card title="Create New Department">
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label htmlFor="department-name" className="block text-sm font-medium text-medium mb-1">Department Name</label>
                <input
                  id="department-name"
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g., Research & Development"
                  className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
              >
                Create Department
              </button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="Existing Departments">
                <div className="space-y-4">
                    {departments.map(dept => (
                        <div key={dept.department_id} className="p-4 bg-white/50 rounded-lg border border-gray-200/50 shadow-sm space-y-3 group">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-dark">{dept.name}</h4>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => handleOpenAssignModal(dept)}
                                        className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-semibold"
                                    >
                                        Assign People
                                    </button>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditModal(dept)} className="p-1.5 rounded-md bg-indigo-100/50 text-indigo-600 hover:bg-indigo-200/50 transition-colors" title="Edit Department">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDelete(dept.department_id)} className="p-1.5 rounded-md bg-red-100/50 text-red-600 hover:bg-red-200/50 transition-colors" title="Delete Department">
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-medium mb-2">Members ({departmentMembers.get(dept.department_id)?.length || 0})</h5>
                                <ul className="text-sm text-dark space-y-1 pl-2">
                                    {departmentMembers.get(dept.department_id)?.map(p => (
                                        <li key={p.person_id} className="flex justify-between">
                                            <span>{p.name}</span>
                                            <span className="text-medium">{p.job}</span>
                                        </li>
                                    ))}
                                </ul>
                                {(departmentMembers.get(dept.department_id)?.length || 0) === 0 && (
                                    <p className="text-sm text-medium pl-2">No members assigned.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
      <AssignPeopleModal 
        department={selectedDepartment}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
      <EditDepartmentModal
        department={selectedDepartment}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default Departments;