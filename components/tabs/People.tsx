import React, { useState, useMemo, useEffect } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import { Person, PersonFilter } from '../../types';
import AddPersonModal from '../common/AddPersonModal';

interface PeopleProps {
    initialFilter: PersonFilter | null;
    onFilterApplied: () => void;
    onOpenProfile: (personId: number) => void;
}

const MagicWandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046a1 1 0 01-1.414.903l-.707-.707a1 1 0 01.903-1.414l.217.217zM4 5.75A2.75 2.75 0 016.75 3h6.5A2.75 2.75 0 0116 5.75v8.5A2.75 2.75 0 0113.25 17h-6.5A2.75 2.75 0 014 14.25v-8.5zM6.75 4a1.25 1.25 0 00-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25h-6.5z" clipRule="evenodd" /><path d="M10 12a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 100-2 1 1 0 000 2zM12 8a1 1 0 100-2 1 1 0 000 2zM8 12a1 1 0 100-2 1 1 0 000 2zM12 12a1 1 0 100-2 1 1 0 000 2zM6 10a1 1 0 11-2 0 1 1 0 012 0zM16 10a1 1 0 11-2 0 1 1 0 012 0zM11 18a1 1 0 100-2 1 1 0 000 2z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

const People: React.FC<PeopleProps> = ({ initialFilter, onFilterApplied, onOpenProfile }) => {
    const { people, occupations, skills, departments, autoCreateDevelopmentPlan } = useSkillsData();
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [jobFilter, setJobFilter] = useState('All');
    const [skillFilter, setSkillFilter] = useState<string | null>(null);
    const [selectedPeople, setSelectedPeople] = useState<number[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
    
    useEffect(() => {
        if (initialFilter) {
            const { skillId, group, viewBy } = initialFilter;
            const skill = skills.find(s => s.skill_id === skillId);
            
            if (skill) {
                setSkillFilter(skill.name);
            }
            if (viewBy === 'By Job') {
                setJobFilter(group);
                setDepartmentFilter('All');
            } else {
                setDepartmentFilter(group);
                setJobFilter('All');
            }
            onFilterApplied(); // Clear the filter in App state so it doesn't re-apply
        }
    }, [initialFilter, onFilterApplied, skills, departments]);


    const departmentOptions = ['All', ...departments.map(d => d.name)];
    const jobs = ['All', ...Array.from(new Set(people.map(p => p.job)))];

    const filteredPeople = useMemo(() => {
        return people.filter(person => {
            const department = departments.find(d => d.department_id === person.department_id);
            const departmentMatch = departmentFilter === 'All' || (department && department.name === departmentFilter);
            const jobMatch = jobFilter === 'All' || person.job === jobFilter;
            const skillMatch = !skillFilter || person.skills.some(s => {
                const skillInfo = skills.find(sk => sk.skill_id === s.skill_id);
                return skillInfo?.name === skillFilter;
            });
            return departmentMatch && jobMatch && skillMatch;
        });
    }, [people, departmentFilter, jobFilter, skillFilter, departments, skills]);

    const calculateSkillMatch = (person: Person): number => {
        const occupation = occupations.find(o => o.title === person.job);
        if (!occupation) return 0;

        const requiredSkills = occupation.required_skills;
        if (requiredSkills.length === 0) return 100;

        const personSkills = new Set(person.skills.map(s => s.skill_id));
        const matchingSkills = requiredSkills.filter(id => personSkills.has(id));

        return Math.round((matchingSkills.length / requiredSkills.length) * 100);
    };

    const handleSelectPerson = (personId: number) => {
        setSelectedPeople(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    const getSkillNames = (skillIds: {skill_id: number, level: number}[]) => {
      return skillIds.map(ps => skills.find(s => s.skill_id === ps.skill_id)?.name).filter(Boolean).join(', ');
    };

    const clearAllFilters = () => {
        setDepartmentFilter('All');
        setJobFilter('All');
        setSkillFilter(null);
    }

    const handleAutoDevelop = (person: Person) => {
        const { createdCourses } = autoCreateDevelopmentPlan(person.person_id);
        const message = createdCourses > 0 
            ? `Development plan created for ${person.name} with ${createdCourses} course(s).`
            : `No new courses found for ${person.name}'s skill gaps.`;
        
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 4000);
    };

    return (
        <>
            <div className="space-y-8">
                <Card title="Filter Employees">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-medium mb-1">Filter by Department</label>
                            <select id="department" value={departmentFilter} onChange={e => { setDepartmentFilter(e.target.value); setSkillFilter(null); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                                {departmentOptions.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="job" className="block text-sm font-medium text-medium mb-1">Filter by Job</label>
                            <select id="job" value={jobFilter} onChange={e => { setJobFilter(e.target.value); setSkillFilter(null); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                                {jobs.map(j => <option key={j}>{j}</option>)}
                            </select>
                        </div>
                    </div>
                    {(skillFilter || departmentFilter !== 'All' || jobFilter !== 'All') && (
                        <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Active filters:</span>
                        {skillFilter && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    Skill: {skillFilter}
                                </span>
                        )}
                        {departmentFilter !== 'All' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Dept: {departmentFilter}
                                </span>
                        )}
                        {jobFilter !== 'All' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Job: {jobFilter}
                                </span>
                        )}
                            <button onClick={clearAllFilters} className="text-sm text-medium hover:text-primary font-semibold">Clear</button>
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                         <button onClick={() => setIsAddPersonModalOpen(true)} className="inline-flex items-center px-5 py-2.5 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">
                            <PlusIcon />
                            Add New Person
                        </button>
                        <button disabled={selectedPeople.length === 0} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">
                            Create Group ({selectedPeople.length})
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Select</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Job</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Department</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Skills</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Job Skill Match</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 divide-y divide-gray-200/50">
                                {filteredPeople.map((person, index) => {
                                    const match = calculateSkillMatch(person);
                                    const departmentName = departments.find(d => d.department_id === person.department_id)?.name || 'N/A';
                                    return (
                                        <tr key={person.person_id} className={`transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'} hover:bg-indigo-50/50`}>
                                            <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedPeople.includes(person.person_id)} onChange={() => handleSelectPerson(person.person_id)} className="h-4 w-4 rounded text-primary border-gray-300 focus:ring-primary"/></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center">
                                                    <button onClick={() => onOpenProfile(person.person_id)} className="text-primary hover:underline text-left font-semibold">
                                                        {person.name}
                                                    </button>
                                                    {person.isTechnician && (
                                                        <span className="ml-2 text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">NATA</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{person.job}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{departmentName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium max-w-xs truncate">{getSkillNames(person.skills)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div className="bg-gradient-to-r from-emerald-400 to-secondary h-2.5 rounded-full" style={{ width: `${match}%` }}></div>
                                                    </div>
                                                    <span className="ml-3 text-sm font-medium text-dark">{match}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {match < 100 && (
                                                    <button onClick={() => handleAutoDevelop(person)} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Auto-create development plan">
                                                        <MagicWandIcon />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {toastMessage && (
                        <div className="fixed bottom-5 right-5 bg-secondary text-white py-2 px-4 rounded-lg shadow-lg animate-[fadeIn_0.5s_ease-out] z-50">
                            {toastMessage}
                        </div>
                    )}
                </Card>
            </div>
            <AddPersonModal 
                isOpen={isAddPersonModalOpen} 
                onClose={() => setIsAddPersonModalOpen(false)} 
            />
        </>
    );
};

export default People;