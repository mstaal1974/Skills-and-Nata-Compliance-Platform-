import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Modal from '../ui/Modal';
import { BadgeStatus, PersonSkill, Competency, CoursePriority } from '../../types';
import EditCompetencyModal from './EditCompetencyModal';

const StatusPill: React.FC<{ status: BadgeStatus }> = ({ status }) => {
    const statusMap = {
        'Compliant': 'bg-green-100 text-green-800',
        'Expiring': 'bg-yellow-100 text-yellow-800',
        'Missing': 'bg-red-100 text-red-800',
        'N/A': 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{status}</span>;
};

const NataStatusPill: React.FC<{ status: string }> = ({ status }) => {
    const statusMap: { [key: string]: string } = {
        'Authorized': 'bg-green-100 text-green-800',
        'In Training': 'bg-yellow-100 text-yellow-800',
        'Not Authorized': 'bg-red-100 text-red-800',
        'Supervised Use Only': 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
}

const PriorityBadge: React.FC<{ priority?: CoursePriority }> = ({ priority }) => {
    if (!priority) return null;
    const colors = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
}


const ProfileModal: React.FC<{ personId: number | null; onClose: () => void; }> = ({ personId, onClose }) => {
    const { people, departments, skills, occupations, issuedBadges, competencies, developmentPlans, openBadges, courses } = useSkillsData();
    const [activeTab, setActiveTab] = useState<'Overview' | 'NATA Profile'>('Overview');
    const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);

    const personData = useMemo(() => {
        if (!personId) return null;
        const person = people.find(p => p.person_id === personId);
        if (!person) return null;

        const department = departments.find(d => d.department_id === person.department_id);
        const occupation = occupations.find(o => o.title === person.job);

        // --- Overview Tab Data ---
        const possessedSkills = person.skills.map((pSkill: PersonSkill) => {
            const skillInfo = skills.find(s => s.skill_id === pSkill.skill_id);
            return { ...pSkill, name: skillInfo?.name || 'Unknown', category: skillInfo?.category || 'N/A' };
        }).sort((a, b) => a.name.localeCompare(b.name));

        const requiredSkillIds = occupation ? new Set(occupation.required_skills) : new Set<number>();
        const complianceDetails = Array.from(requiredSkillIds).map(skillId => {
            const skillInfo = skills.find(s => s.skill_id === skillId && !s.isNataTestMethod);
            if (!skillInfo) return null;
            const badge = issuedBadges.find(b => b.person_id === person.person_id && b.skill_id === skillId);
            let status: BadgeStatus = 'Missing';
            const today = new Date();
            const expiryWarningDate = new Date();
            expiryWarningDate.setDate(today.getDate() + 30);
            if (badge) {
                const expiryDate = new Date(badge.expiryDate);
                if (expiryDate >= today) status = expiryDate < expiryWarningDate ? 'Expiring' : 'Compliant';
            }
            return { skill_id: skillId, name: skillInfo.name, status: status };
            // FIX: The type predicate was too broad. The logic above only produces 'Compliant', 'Expiring', or 'Missing'.
            // Asserting the full `BadgeStatus` (which includes 'N/A') caused a type error.
        }).filter((item): item is { skill_id: number; name: string; status: 'Compliant' | 'Expiring' | 'Missing' } => item !== null);

        const personDevelopmentPlans = developmentPlans.filter(dp => dp.person_id === person.person_id).map(plan => ({
            ...plan,
            courseDetails: plan.courses.map(pc => {
                const courseInfo = courses.find(c => c.course_id === pc.course_id);
                return {
                    ...pc,
                    title: courseInfo?.title || 'Unknown',
                    skillName: skills.find(s => s.skill_id === courseInfo?.provides_skill_id)?.name || 'Unknown'
                };
            })
        }));

        const personBadges = openBadges.filter(b => b.person_id === person.person_id).map(badge => ({
            ...badge,
            courseName: courses.find(c => c.course_id === badge.course_id)?.title || 'Unknown Course',
            skillName: skills.find(s => s.skill_id === badge.skill_id)?.name || 'Unknown Skill'
        }));


        // --- NATA Profile Tab Data ---
        let nataCompetencies = null;
        if (person.isTechnician) {
            nataCompetencies = competencies.filter(c => c.person_id === person.person_id).map(comp => {
                const testMethod = skills.find(s => s.skill_id === comp.skill_id);
                return { ...comp, name: testMethod?.name || 'Unknown', methodCode: testMethod?.methodCode || 'N/A' };
            }).sort((a,b) => a.name.localeCompare(b.name));
        }

        return { person, departmentName: department?.name || 'N/A', possessedSkills, complianceDetails, personDevelopmentPlans, personBadges, nataCompetencies };
    }, [personId, people, departments, skills, occupations, issuedBadges, competencies, developmentPlans, openBadges, courses]);

    if (!personData) return null;

    const { person, departmentName, possessedSkills, complianceDetails, personDevelopmentPlans, personBadges, nataCompetencies } = personData;
    
    if (!person.isTechnician && activeTab === 'NATA Profile') {
        setActiveTab('Overview');
    }

    return (
        <>
            <Modal isOpen={!!personId} onClose={onClose} title={`${person.name}'s Profile`}>
                <div className="flex flex-col space-y-6">
                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-primary">{person.name}</h3>
                                <p className="text-medium">{person.job}</p>
                                <p className="text-sm text-gray-500">{departmentName}</p>
                             </div>
                             {person.isTechnician && <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">NATA Technician</span>}
                        </div>
                    </div>

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('Overview')} className={`${activeTab === 'Overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Overview</button>
                            {person.isTechnician && <button onClick={() => setActiveTab('NATA Profile')} className={`${activeTab === 'NATA Profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>NATA Profile</button>}
                        </nav>
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'Overview' && (
                            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                                <h4 className="font-semibold text-dark">General Skills & Proficiency</h4>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">{possessedSkills.map(skill => <div key={skill.skill_id} className="flex justify-between items-center text-sm"><span className="text-dark">{skill.name}</span><div className="flex items-center">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ml-1 ${i < skill.level ? 'bg-primary' : 'bg-gray-300'}`}></div>)}</div></div>)}</div>
                                
                                <h4 className="font-semibold text-dark mt-4">Development Plans</h4>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                  {personDevelopmentPlans.length > 0 ? personDevelopmentPlans.map(plan => (
                                      <div key={plan.plan_id} className="text-sm p-3 bg-gray-50/50 rounded-lg">
                                        <p className="font-bold">Plan Status: {plan.status}</p>
                                        <ul className="pl-2 mt-2 space-y-2 border-l-2 border-primary/20">
                                            {plan.courseDetails.map(c => 
                                                <li key={c.course_id} className="pl-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{c.title} ({c.status})</p>
                                                            <div className="mt-1 flex items-center space-x-3 text-xs text-medium">
                                                                <PriorityBadge priority={c.priority} />
                                                                {c.dueDate && <span>Due: {new Date(c.dueDate).toLocaleDateString()}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {c.managerNotes && <p className="mt-1 text-xs text-gray-600 italic border-l-2 pl-2">Note: {c.managerNotes}</p>}
                                                </li>
                                            )}
                                        </ul>
                                      </div>
                                  )) : <p className="text-sm text-medium">No development plans assigned.</p>}
                                </div>
                                
                                <h4 className="font-semibold text-dark mt-4">Verifiable Credentials</h4>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                  {personBadges.length > 0 ? personBadges.map(badge => (
                                      <div key={badge.badge_id} className="text-sm p-2 bg-green-50/50 rounded-lg border border-green-200/50">
                                        <p className="font-bold text-green-800">{badge.courseName}</p>
                                        <p className="text-xs">Provides Skill: {badge.skillName} (Level {badge.levelAchieved})</p>
                                        <p className="text-xs">Issued: {new Date(badge.issueDate).toLocaleDateString()}</p>
                                        <a href={badge.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Evidence</a>
                                      </div>
                                  )) : <p className="text-sm text-medium">No verifiable credentials found.</p>}
                                </div>
                            </div>
                        )}
                        {activeTab === 'NATA Profile' && person.isTechnician && (
                            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50/50 p-3 rounded-lg"><strong className="text-medium">Technician ID:</strong> {person.technicianId}</div>
                                    <div className="bg-gray-50/50 p-3 rounded-lg"><strong className="text-medium">Qualifications:</strong> {person.qualifications?.join(', ')}</div>
                                    <div className="bg-gray-50/50 p-3 rounded-lg col-span-1 md:col-span-2"><strong className="text-medium">Experience:</strong> {person.experience}</div>
                                </div>

                                <h4 className="font-semibold text-dark mt-4">Skills & Test Method Matrix</h4>
                                <div className="overflow-x-auto max-h-60">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50/50 sticky top-0">
                                      <tr>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Test Method</th>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Training Complete</th>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Assessed</th>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Assessed By</th>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200/50">
                                      {nataCompetencies?.map(c => (
                                        <tr key={c.competency_id} onClick={() => setEditingCompetency(c)} className="hover:bg-indigo-50/50 cursor-pointer">
                                          <td className="px-4 py-2 font-semibold">{c.name} <span className="font-normal text-gray-500">({c.methodCode})</span></td>
                                          <td className="px-4 py-2">{c.trainingCompleteDate || 'N/A'}</td>
                                          <td className="px-4 py-2">{c.competencyAssessedDate || 'N/A'}</td>
                                          <td className="px-4 py-2">{c.assessedBy || 'N/A'}</td>
                                          <td className="px-4 py-2"><NataStatusPill status={c.authorizationStatus} /></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
            <EditCompetencyModal competency={editingCompetency} onClose={() => setEditingCompetency(null)} />
        </>
    );
};

export default ProfileModal;