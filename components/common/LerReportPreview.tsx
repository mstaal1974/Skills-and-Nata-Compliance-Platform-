
import React from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';

const LerReportPreview: React.FC<{ targetId: string }> = ({ targetId }) => {
    const { people, departments, skills, developmentPlans, courses } = useSkillsData();

    const isDepartmentReport = targetId.startsWith('dept-');
    
    if (isDepartmentReport) {
        const departmentId = parseInt(targetId.replace('dept-', ''), 10);
        const department = departments.find(d => d.department_id === departmentId);
        if (!department) return <div className="p-4 text-red-600">Department not found.</div>;
        
        const departmentMembers = people.filter(p => p.department_id === departmentId);
        
        return (
            <div className="bg-white p-8 rounded-lg shadow-inner space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <header className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-dark">LER Export: Department Report</h1>
                    <p className="text-xl text-primary">{department.name}</p>
                </header>
                
                <section>
                    <h2 className="text-lg font-semibold text-dark mb-3">Members ({departmentMembers.length})</h2>
                    <ul className="list-disc list-inside space-y-1">
                        {departmentMembers.map(p => (
                            <li key={p.person_id}>{p.name} - <span className="text-medium">{p.job}</span></li>
                        ))}
                    </ul>
                </section>
            </div>
        );
    }
    
    // Individual Report
    const personId = parseInt(targetId, 10);
    const person = people.find(p => p.person_id === personId);
    if (!person) return <div className="p-4 text-red-600">Person not found.</div>;
    
    const personSkills = person.skills.map(ps => {
        const skill = skills.find(s => s.skill_id === ps.skill_id);
        return { ...ps, name: skill?.name || 'Unknown' };
    });

    const personDevelopmentPlan = developmentPlans.find(dp => dp.person_id === personId);
    const planCourses = (personDevelopmentPlan?.courses || []).map(pc => {
        const course = courses.find(c => c.course_id === pc.course_id);
        return { ...pc, name: course?.title || 'Unknown' };
    });

    return (
        <div className="bg-white p-8 rounded-lg shadow-inner space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <header className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-dark">LER Export: Individual Report</h1>
                <p className="text-xl text-primary">{person.name}</p>
                <p className="text-medium">{person.job}</p>
            </header>
            
            <section>
                <h2 className="text-lg font-semibold text-dark mb-3">Skills & Proficiency</h2>
                <ul className="space-y-2">
                    {personSkills.map(s => (
                        <li key={s.skill_id} className="flex justify-between items-center text-sm">
                            <span>{s.name}</span>
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className={`w-3.5 h-3.5 rounded-full ml-1 ${i < s.level ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
            
            <section>
                <h2 className="text-lg font-semibold text-dark mb-3">Development Plan</h2>
                {planCourses.length > 0 ? (
                    <ul className="space-y-2">
                        {planCourses.map(pc => (
                            <li key={pc.course_id} className="flex justify-between items-center text-sm">
                                <span>{pc.name}</span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pc.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{pc.status}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-medium">No development plans assigned.</p>}
            </section>
        </div>
    );
};

export default LerReportPreview;
