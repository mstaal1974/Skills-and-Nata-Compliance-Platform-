
import React, { useMemo, useState } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import Metric from '../ui/Metric';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;


const VerifiedCompetency: React.FC = () => {
    const { people, skills, openBadges } = useSkillsData();
    const [categoryFilter, setCategoryFilter] = useState('All');

    const competencyData = useMemo(() => {
        const verifiedSkillMap = new Map<string, Set<number>>(); // "personId-skillId"
        openBadges.forEach(badge => {
            const key = `${badge.person_id}-${badge.skill_id}`;
            if (!verifiedSkillMap.has(key)) {
                verifiedSkillMap.set(key, new Set());
            }
            verifiedSkillMap.get(key)!.add(badge.skill_id);
        });

        const skillCompetency: { [key: string]: { name: string, category: string, verified: number, assessed: number } } = {};

        people.forEach(person => {
            person.skills.forEach(pSkill => {
                const skillInfo = skills.find(s => s.skill_id === pSkill.skill_id);
                if (!skillInfo) return;

                if (!skillCompetency[skillInfo.name]) {
                    skillCompetency[skillInfo.name] = { name: skillInfo.name, category: skillInfo.category, verified: 0, assessed: 0 };
                }

                const isVerified = verifiedSkillMap.has(`${person.person_id}-${pSkill.skill_id}`);
                if (isVerified) {
                    skillCompetency[skillInfo.name].verified++;
                } else {
                    skillCompetency[skillInfo.name].assessed++;
                }
            });
        });

        return Object.values(skillCompetency);
    }, [people, skills, openBadges]);

    const kpis = useMemo(() => {
        let totalSkillsPossessed = 0;
        let totalVerifiedInstances = 0;
        const employeeVerificationCounts = new Map<number, number>();

        competencyData.forEach(skill => {
            totalSkillsPossessed += skill.verified + skill.assessed;
            totalVerifiedInstances += skill.verified;
        });
        
        openBadges.forEach(badge => {
            employeeVerificationCounts.set(badge.person_id, (employeeVerificationCounts.get(badge.person_id) || 0) + 1);
        });
        
        let topEmployee = { name: 'N/A', count: 0 };
        if (employeeVerificationCounts.size > 0) {
            const topEmployeeId = [...employeeVerificationCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
            const topPerson = people.find(p => p.person_id === topEmployeeId);
            if (topPerson) {
                topEmployee = { name: topPerson.name, count: employeeVerificationCounts.get(topEmployeeId)! };
            }
        }

        return {
            verificationRate: totalSkillsPossessed > 0 ? Math.round((totalVerifiedInstances / totalSkillsPossessed) * 100) : 0,
            totalVerifiedSkills: new Set(openBadges.map(b => b.skill_id)).size,
            topEmployeeName: topEmployee.name,
        };
    }, [competencyData, openBadges, people]);

    const skillCategories = ['All', ...Array.from(new Set(skills.map(s => s.category)))];

    const filteredData = useMemo(() => {
        if (categoryFilter === 'All') {
            return competencyData;
        }
        return competencyData.filter(d => d.category === categoryFilter);
    }, [competencyData, categoryFilter]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Metric label="Overall Verification Rate" value={`${kpis.verificationRate}%`} icon={<ChartBarIcon />} />
                <Metric label="Total Unique Verified Skills" value={kpis.totalVerifiedSkills} icon={<CheckBadgeIcon />} />
                <Metric label="Top Verified Employee" value={kpis.topEmployeeName} icon={<UserIcon />} />
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-dark">Workforce Competency: Verified vs. Assessed</h3>
                    <div>
                        <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl"
                        >
                            {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ width: '100%', height: 500 }}>
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={filteredData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(200, 200, 200, 0.5)',
                                    borderRadius: '1rem',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="assessed" stackId="a" fill="#D1D5DB" name="Assessed" />
                            <Bar dataKey="verified" stackId="a" fill="#4338CA" name="Verified" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default VerifiedCompetency;
