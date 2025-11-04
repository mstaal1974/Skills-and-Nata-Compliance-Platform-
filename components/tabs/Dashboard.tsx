
import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Metric from '../ui/Metric';
import { Person } from '../../types';

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a9 9 0 00-9-9" /></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

interface DashboardProps {
  onHeatmapClick: (skillId: number, group: string, viewBy: 'By Job' | 'By Department') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onHeatmapClick }) => {
    const { people, skills, occupations, developmentPlans, departments } = useSkillsData();
    const [viewBy, setViewBy] = useState<'By Job' | 'By Department'>('By Job');
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number } | null>(null);

    const departmentMap = useMemo(() => new Map(departments.map(d => [d.department_id, d.name])), [departments]);

    const heatmapData = useMemo(() => {
        const topSkills = skills.slice(0, 15);
        
        let groups: string[];
        if (viewBy === 'By Job') {
            groups = Array.from(new Set(occupations.map(o => o.title)));
        } else { 
            const assignedDeptNames = new Set<string>(people.map(p => departmentMap.get(p.department_id) || 'Unassigned'));
            const allDeptNames = new Set<string>(departments.map(d => d.name));
            // FIX: Explicitly specify the type for `new Set` to help TypeScript's type inference,
            // which was incorrectly inferring `unknown[]` for the combined array.
            groups = Array.from(new Set([...allDeptNames, ...assignedDeptNames]));
        }
        
        const matrix = new Map<string, Map<number, number>>();
        groups.forEach(group => {
            const skillMap = new Map<number, number>();
            topSkills.forEach(skill => skillMap.set(skill.skill_id, 0));
            matrix.set(group, skillMap);
        });

        let maxValue = 0;
        people.forEach((person: Person) => {
            const groupKey = viewBy === 'By Job' ? person.job : (departmentMap.get(person.department_id) || 'Unassigned');
            const personSkills = matrix.get(groupKey);
            if (personSkills) {
                person.skills.forEach(pSkill => {
                    if (personSkills.has(pSkill.skill_id)) {
                        const newCount = (personSkills.get(pSkill.skill_id) || 0) + 1;
                        personSkills.set(pSkill.skill_id, newCount);
                        if (newCount > maxValue) maxValue = newCount;
                    }
                });
            }
        });

        return { skills: topSkills, groups, matrix, maxValue: maxValue > 0 ? maxValue : 1 };
    }, [people, skills, occupations, viewBy, departmentMap, departments]);
    
    const getCellColor = (value: number) => {
        if (value === 0) return 'rgba(238, 242, 255, 0.5)';
        const opacity = value / heatmapData.maxValue;
        return `rgba(99, 102, 241, ${Math.max(0.1, opacity)})`;
    };
    
    const handleMouseOver = (e: React.MouseEvent, content: string) => {
        setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Metric label="Total Employees" value={people.length} icon={<UsersIcon />} />
                <Metric label="Total Skills" value={skills.length} icon={<WrenchIcon />} />
                <Metric label="Total Occupations" value={occupations.length} icon={<BriefcaseIcon />} />
                <Metric label="Active Development Plans" value={developmentPlans.filter(dp => dp.status === 'In Progress').length} icon={<PathIcon />} />
            </div>

            <div className="bg-white/50 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-white/30">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-semibold text-dark">Skills Heat Map</h3>
                        <div className="bg-slate-200/60 p-1 rounded-xl flex w-full sm:w-auto">
                            <button onClick={() => setViewBy('By Job')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg w-full transition-colors ${viewBy === 'By Job' ? 'bg-white shadow-md text-primary' : 'text-medium hover:bg-white/50'}`}>By Job</button>
                            <button onClick={() => setViewBy('By Department')} className={`px-4 py-1.5 text-sm font-semibold rounded-lg w-full transition-colors ${viewBy === 'By Department' ? 'bg-white shadow-md text-primary' : 'text-medium hover:bg-white/50'}`}>By Department</button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            <div className="flex pl-40">
                                {heatmapData.skills.map(skill => (
                                    <div key={skill.skill_id} className="w-16 h-20 flex-shrink-0 relative">
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -rotate-45 origin-bottom-left text-xs font-medium text-medium whitespace-nowrap">{skill.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1">
                                {heatmapData.groups.map(group => (
                                    <div key={group} className="flex items-center">
                                        <div className="w-40 flex-shrink-0 px-2 py-2 text-sm font-medium text-dark truncate" title={group}>
                                            {group}
                                        </div>
                                        <div className="flex">
                                            {heatmapData.skills.map(skill => {
                                                const value = heatmapData.matrix.get(group)?.get(skill.skill_id) || 0;
                                                return (
                                                    <button
                                                        key={`${group}-${skill.skill_id}`}
                                                        className="w-16 h-8 rounded-md border border-white/20 transition-transform duration-200 hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:z-20"
                                                        style={{ backgroundColor: getCellColor(value) }}
                                                        onClick={() => onHeatmapClick(skill.skill_id, group, viewBy)}
                                                        onMouseMove={(e) => handleMouseOver(e, `${value} employee(s) in ${group} with ${skill.name}`)}
                                                        onMouseLeave={handleMouseOut}
                                                        aria-label={`Filter by ${skill.name} in ${group}`}
                                                    ></button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-4 space-x-2 text-xs text-medium">
                        <span>Low</span>
                        <div className="flex rounded-md overflow-hidden border border-white/30">
                            <div className="w-4 h-4" style={{ backgroundColor: getCellColor(0) }}></div>
                            <div className="w-4 h-4" style={{ backgroundColor: getCellColor(heatmapData.maxValue * 0.25) }}></div>
                            <div className="w-4 h-4" style={{ backgroundColor: getCellColor(heatmapData.maxValue * 0.5) }}></div>
                            <div className="w-4 h-4" style={{ backgroundColor: getCellColor(heatmapData.maxValue * 0.75) }}></div>
                            <div className="w-4 h-4" style={{ backgroundColor: getCellColor(heatmapData.maxValue) }}></div>
                        </div>
                        <span>High</span>
                    </div>

                    {tooltip && tooltip.visible && (
                        <div
                            className="fixed p-2 text-sm bg-gray-800/80 backdrop-blur-sm text-white rounded-md z-50 pointer-events-none shadow-lg"
                            style={{ top: tooltip.y + 15, left: tooltip.x + 15, transition: 'top 0.1s, left 0.1s' }}
                        >
                            {tooltip.content}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;