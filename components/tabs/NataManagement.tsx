import React, { useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import Metric from '../ui/Metric';
import { Person } from '../../types';

const UsersIcon = () => <svg xmlns="http://www.w.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a9 9 0 00-9-9" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4 2.222 4-2.222V20" /></svg>;
const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806l.477-2.387a6 6 0 013.86-.517l.318.158a6 6 0 003.86-.517l2.387-.477a2 2 0 011.806.547a2 2 0 01.547 1.806l-.477 2.387a6 6 0 01-3.86.517l-.318.158a6 6 0 00-3.86.517l-2.387.477a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 003.86.517l.318.158a6 6 0 003.86-.517l2.387-.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86z" /></svg>;

const NataStatusCell: React.FC<{ status: string }> = ({ status }) => {
    const baseClasses = "w-full h-full rounded-md flex items-center justify-center text-white/90 font-bold text-xs shadow-md border-b-2";
    const statusMap: {[key: string]: string} = {
        'Authorized': "bg-green-500 border-green-700",
        'In Training': "bg-yellow-500 border-yellow-700",
        'Not Authorized': "bg-red-500 border-red-700",
        'Supervised Use Only': "bg-blue-500 border-blue-700",
    };
    return <div className={`${baseClasses} ${statusMap[status] || 'bg-gray-400 border-gray-600'}`}>{status.replace(' Use Only', '')}</div>;
};

interface NataManagementProps {
    onOpenProfile: (personId: number) => void;
}

const NataManagement: React.FC<NataManagementProps> = ({ onOpenProfile }) => {
    const { people, skills, competencies } = useSkillsData();

    const { technicians, nataTestMethods, matrix, kpis } = useMemo(() => {
        const technicians = people.filter(p => p.isTechnician);
        const nataTestMethods = skills.filter(s => s.isNataTestMethod).sort((a,b) => (a.methodCode || '').localeCompare(b.methodCode || ''));
        
        const competencyMap = new Map<string, string>();
        competencies.forEach(c => {
            competencyMap.set(`${c.person_id}-${c.skill_id}`, c.authorizationStatus);
        });
        
        const matrix = technicians.map(tech => ({
            technician: tech,
            statuses: nataTestMethods.map(method => competencyMap.get(`${tech.person_id}-${method.skill_id}`) || 'Not Authorized')
        }));
        
        const totalCompetencies = technicians.length * nataTestMethods.length;
        const authorizedCount = Array.from(competencyMap.values()).filter(s => s === 'Authorized').length;
        const inTrainingCount = Array.from(competencyMap.values()).filter(s => s === 'In Training').length;

        const kpis = {
            totalTechnicians: technicians.length,
            totalMethods: nataTestMethods.length,
            authorizationRate: totalCompetencies > 0 ? Math.round((authorizedCount / totalCompetencies) * 100) : 0,
            inTraining: inTrainingCount,
        };

        return { technicians, nataTestMethods, matrix, kpis };
    }, [people, skills, competencies]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Metric label="Total NATA Technicians" value={kpis.totalTechnicians} icon={<UsersIcon />} />
                <Metric label="Total Test Methods" value={kpis.totalMethods} icon={<BeakerIcon />} />
                <Metric label="Overall Authorization" value={`${kpis.authorizationRate}%`} icon={<CheckBadgeIcon />} />
                <Metric label="Technicians In Training" value={kpis.inTraining} icon={<SchoolIcon />} />
            </div>

            <Card title="Lab-Wide NATA Competency Matrix">
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-200/80">
                                <th className="p-3 font-semibold text-medium sticky left-0 bg-white/60 z-10">Technician</th>
                                {nataTestMethods.map(method => (
                                    <th key={method.skill_id} className="p-2 text-center font-semibold text-medium whitespace-nowrap">
                                        {method.name}
                                        <div className="text-xs font-normal text-gray-400">{method.methodCode}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                            {matrix.map(({ technician, statuses }) => (
                                <tr key={technician.person_id} className="hover:bg-indigo-50/50">
                                    <td className="p-3 font-medium sticky left-0 bg-white/60 hover:bg-indigo-50/50 z-10">
                                        <button onClick={() => onOpenProfile(technician.person_id)} className="text-primary hover:underline font-semibold">
                                            {technician.name}
                                        </button>
                                    </td>
                                    {statuses.map((status, index) => (
                                        <td key={index} className="p-1.5 align-middle">
                                            <NataStatusCell status={status} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default NataManagement;
