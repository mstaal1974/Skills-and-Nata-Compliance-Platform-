import React, { useState, useEffect } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { DevelopmentPlanCourse, CoursePriority } from '../../types';

interface EditPlanCourseModalProps {
  editingInfo: { planId: number; course: DevelopmentPlanCourse } | null;
  onClose: () => void;
}

const PRIORITIES: CoursePriority[] = ['High', 'Medium', 'Low'];

const EditPlanCourseModal: React.FC<EditPlanCourseModalProps> = ({ editingInfo, onClose }) => {
  const { courses, skills, updateDevelopmentPlanCourse } = useSkillsData();
  const [priority, setPriority] = useState<CoursePriority | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => {
    if (editingInfo) {
      const { course } = editingInfo;
      setPriority(course.priority);
      setDueDate(course.dueDate || '');
      setManagerNotes(course.managerNotes || '');
    }
  }, [editingInfo]);

  if (!editingInfo) return null;

  const { planId, course } = editingInfo;
  const courseDetails = courses.find(c => c.course_id === course.course_id);
  const skillDetails = skills.find(s => s.skill_id === courseDetails?.provides_skill_id);

  const handleSave = () => {
    updateDevelopmentPlanCourse(planId, course.course_id, {
      priority,
      dueDate: dueDate || undefined,
      managerNotes: managerNotes || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={!!editingInfo} onClose={onClose} title={`Edit Course: ${courseDetails?.title}`}>
      <div className="space-y-6">
        <div>
          <p className="font-semibold">{courseDetails?.title}</p>
          <p className="text-sm text-medium">Provides Skill: {skillDetails?.name}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-medium mb-1">Priority</label>
            <select
              id="priority"
              value={priority || ''}
              onChange={e => setPriority(e.target.value as CoursePriority)}
              className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"
            >
              <option value="">None</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-medium mb-1">Due Date</label>
            <input
              type="date"
              id="due-date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label htmlFor="manager-notes" className="block text-sm font-medium text-medium mb-1">Manager Notes</label>
          <textarea
            id="manager-notes"
            rows={4}
            value={managerNotes}
            onChange={e => setManagerNotes(e.target.value)}
            className="w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary"
            placeholder="Add specific instructions or context..."
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

export default EditPlanCourseModal;