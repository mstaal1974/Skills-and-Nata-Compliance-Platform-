

import React, { useMemo, Fragment } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import { Person, Skill, Competency } from '../../types';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// --- Icon Components ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const AlertOctagonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


// --- Icon Components for NATA Status ---
const AuthorizedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const InTrainingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const SupervisedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const NotAuthorizedIcon = () => <div className="w-3 h-0.5 bg-gray-400 rounded-full"></div>;


// --- UI Components ---

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; footer?: string; }> = ({ title, value, icon, footer }) => (
    <Card className="!p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-medium font-medium">{title}</h3>
                <p className="text-3xl font-bold text-dark mt-1">{value}</p>
            </div>
            <div className="text-primary">{icon}</div>
        </div>
        {footer && <p className="text-sm text-gray-400 mt-4">{footer}</p>}
    </Card>
);

interface NataStatusIconProps {
  status: string;
  assessedBy?: string | null;
  competencyAssessedDate?: string | null;
}

const NataStatusIcon: React.FC<NataStatusIconProps> = ({ status, assessedBy, competencyAssessedDate }) => {
    const tooltipText = `${status}${assessedBy ? ` by ${assessedBy}` : ''}${competencyAssessedDate ? ` on ${new Date(competencyAssessedDate).toLocaleDateString()}` : ''}`;
    
    let icon;
    switch(status) {
        case 'Authorized': icon = <AuthorizedIcon />; break;
        case 'In Training': icon = <InTrainingIcon />; break;
        case 'Supervised Use Only': icon = <SupervisedIcon />; break;
        default: icon = <NotAuthorizedIcon />;
    }
    
    return <div className="w-full h-8 flex items-center justify-center" title={tooltipText}>{icon}</div>;
}

// --- Main Dashboard Component ---

const ComplianceDashboard: React.FC<{ onOpenProfile: (personId: number) => void }> = ({ onOpenProfile }) => {
    const { people, skills, competencies, issuedBadges, complianceMatrix, productivityBenchmarks } = useSkillsData();

    const kpiData = useMemo(() => {
        let compliantCount = 0;
        let requiredCount = 0;
        let aiReadyCount = 0;
        let totalAiRequired = 0;
        const atRiskPeople = new Set<string>();

        complianceMatrix.forEach(row => {
            row.forEach(cell => {
                if (cell.status !== 'N/A') {
                    requiredCount++;
                    if (cell.status === 'Compliant') compliantCount++;
                }
                if (cell.skill.isAiSkill && cell.status !== 'N/A') {
                    totalAiRequired++;
                    if (cell.status === 'Compliant') aiReadyCount++;
                }
                if (cell.status === 'Expiring') {
                    atRiskPeople.add(cell.person.name);
                }
            });
        });
        const overallCompliance = requiredCount > 0 ? Math.round((compliantCount / requiredCount) * 100) : 100;

        return {
            overallCompliance: `${overallCompliance}%`,
            aiSkillReady: `${aiReadyCount} / ${totalAiRequired}`,
            atRisk: atRiskPeople.size,
            badgesIssued: issuedBadges.length
        };
    }, [complianceMatrix, issuedBadges.length]);
    
    const atRiskStaff = useMemo(() => {
       const staff = new Map<number, {person_id: number, name: string, skills: string[]}>();
       complianceMatrix.reduce((acc, val) => acc.concat(val), []).filter(c => c.status === 'Expiring').forEach(c => {
           if(!staff.has(c.person.person_id)) {
               staff.set(c.person.person_id, {person_id: c.person.person_id, name: c.person.name, skills: []});
           }
           staff.get(c.person.person_id)!.skills.push(c.skill.name);
       });
       return Array.from(staff.values());
    }, [complianceMatrix]);

    const nataCompetencyData = useMemo(() => {
        const technicians = people.filter(p => p.isTechnician).sort((a, b) => a.name.localeCompare(b.name));
        const nataTestMethods = skills.filter(s => s.isNataTestMethod).sort((a, b) => a.category.localeCompare(b.category) || (a.methodCode || '').localeCompare(b.methodCode || ''));

        const competencyMap = new Map<string, Competency>();
        competencies.forEach(c => {
            competencyMap.set(`${c.person_id}-${c.skill_id}`, c);
        });

        // FIX: Replaced reduce with a forEach loop to prevent a TypeScript type inference issue
        // where the result of reduce was causing Object.entries to return `unknown`.
        const methodsByCategory: Record<string, Skill[]> = {};
        nataTestMethods.forEach(method => {
            const category = method.category || 'Uncategorized';
            if (!methodsByCategory[category]) {
                methodsByCategory[category] = [];
            }
            methodsByCategory[category].push(method);
        });

        const groupedMatrix = Object.entries(methodsByCategory).map(([category, methods]) => {
            return {
                category,
                methods: methods.map(method => {
                    let authorizedCount = 0;
                    const statuses = technicians.map(tech => {
                        const competency = competencyMap.get(`${tech.person_id}-${method.skill_id}`);
                        const status = competency?.authorizationStatus || 'Not Authorized';
                        if (status === 'Authorized') {
                            authorizedCount++;
                        }
                        return {
                            status,
                            assessedBy: competency?.assessedBy,
                            competencyAssessedDate: competency?.competencyAssessedDate,
                        };
                    });
                    return { method, statuses, authorizedCount };
                })
            };
        });
        
        const techSummary = technicians.map(tech => {
            let authorizedCount = 0;
            nataTestMethods.forEach(method => {
                const competency = competencyMap.get(`${tech.person_id}-${method.skill_id}`);
                if (competency?.authorizationStatus === 'Authorized') {
                    authorizedCount++;
                }
            });
            return {
                technicianId: tech.person_id,
                authorizedCount
            };
        });

        return { technicians, groupedMatrix, techSummary };
    }, [people, skills, competencies]);

    const proactiveRisks = useMemo(() => {
        const nataTestMethods = skills.filter(s => s.isNataTestMethod);
        const risks = nataTestMethods.map(method => {
            const authorizedCompetencies = competencies.filter(c => 
                c.skill_id === method.skill_id && c.authorizationStatus === 'Authorized'
            );
            const authorizedCount = authorizedCompetencies.length;
            
            if (authorizedCount === 0) {
                return {
                    level: 'High',
                    methodName: method.name,
                    details: 'No technicians are authorized for this test.'
                };
            } else if (authorizedCount === 1) {
                const person = people.find(p => p.person_id === authorizedCompetencies[0].person_id);
                return {
                    level: 'Medium',
                    methodName: method.name,
                    details: `Single Point of Failure: Only ${person?.name || 'one technician'} is authorized.`
                };
            }
            return null;
        }).filter((risk): risk is {level: 'High' | 'Medium', methodName: string, details: string} => risk !== null);

        return risks.sort((a, b) => {
            if (a.level === 'High' && b.level !== 'High') return -1;
            if (a.level !== 'High' && b.level === 'High') return 1;
            return a.methodName.localeCompare(b.methodName);
        });
    }, [skills, competencies, people]);

    const expiryForecastData = useMemo(() => {
        const VALIDITY_YEARS = 2;
        const now = new Date();
        const threeMonths = new Date(new Date().setMonth(now.getMonth() + 3));
        const sixMonths = new Date(new Date().setMonth(now.getMonth() + 6));
        const twelveMonths = new Date(new Date().setFullYear(now.getFullYear() + 1));

        const buckets = { '0-3 Months': 0, '3-6 Months': 0, '6-12 Months': 0 };

        competencies.forEach(c => {
            if (c.authorizationStatus === 'Authorized' && c.competencyAssessedDate) {
                const assessedDate = new Date(c.competencyAssessedDate);
                const expiryDate = new Date(new Date(assessedDate).setFullYear(assessedDate.getFullYear() + VALIDITY_YEARS));
                
                if (expiryDate > now) {
                    if (expiryDate <= threeMonths) buckets['0-3 Months']++;
                    else if (expiryDate <= sixMonths) buckets['3-6 Months']++;
                    else if (expiryDate <= twelveMonths) buckets['6-12 Months']++;
                }
            }
        });

        return [
            { name: '0-3 Months', expiring: buckets['0-3 Months'] },
            { name: '3-6 Months', expiring: buckets['3-6 Months'] },
            { name: '6-12 Months', expiring: buckets['6-12 Months'] },
        ];
    }, [competencies]);


    if (complianceMatrix.length === 0) {
        return <Card><div className="text-center p-8">No "Lab Staff" found to display in the compliance dashboard.</div></Card>
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Overall Compliance" value={kpiData.overallCompliance} icon={<CheckCircleIcon />} />
                <KpiCard title="AI Skill Ready" value={kpiData.aiSkillReady} icon={<AiIcon />} footer="Team members compliant in 'AI for Labs'" />
                <KpiCard title="At-Risk (Expiring)" value={kpiData.atRisk} icon={<ExclamationIcon />} footer="Staff with credentials expiring in 30 days" />
                <KpiCard title="Badges Issued" value={kpiData.badgesIssued} icon={<BadgeIcon />} footer="Total microcredentials issued to team" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="font-bold text-lg mb-4 text-dark">Enhanced NATA Competency Dashboard</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="p-2 font-semibold text-medium sticky left-0 bg-white/60 z-20 text-left w-48">Test Method</th>
                                        {nataCompetencyData.technicians.map(tech => (
                                            <th key={tech.person_id} className="p-2 w-24 h-24 relative">
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 -rotate-45 origin-bottom-left font-medium text-medium whitespace-nowrap">
                                                     <button onClick={() => onOpenProfile(tech.person_id)} className="text-primary hover:underline text-left">
                                                        {tech.name}
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="p-2 w-16 text-center" title="Total Authorized Technicians">
                                            <div className="-rotate-45 origin-center font-medium text-medium whitespace-nowrap">Total Auth.</div>
                                        </th>
                                    </tr>
                                </thead>
                                {nataCompetencyData.groupedMatrix.map(({ category, methods }) => (
                                    <Fragment key={category}>
                                        <tbody className="bg-gray-100/60">
                                            <tr>
                                                <th className="p-2 font-bold text-primary sticky left-0 bg-gray-100/60 z-20 text-left" colSpan={nataCompetencyData.technicians.length + 2}>
                                                    {category}
                                                </th>
                                            </tr>
                                        </tbody>
                                        <tbody>
                                            {methods.map(({ method, statuses, authorizedCount }) => (
                                                <tr key={method.skill_id} className="border-b border-gray-200/50 hover:bg-indigo-50/50">
                                                    <td className="p-2 font-medium sticky left-0 bg-white/60 hover:bg-indigo-50/50 z-10 w-48 align-top" title={method.name}>
                                                        <div className="font-semibold">{method.name}</div>
                                                        <div className="text-xs text-gray-500">{method.methodCode}</div>
                                                    </td>
                                                    {statuses.map((status, index) => (
                                                        <td key={index} className="p-1.5 text-center">
                                                            <NataStatusIcon status={status.status} assessedBy={status.assessedBy} competencyAssessedDate={status.competencyAssessedDate} />
                                                        </td>
                                                    ))}
                                                    <td className="p-1.5 text-center font-bold text-dark bg-gray-50/50">
                                                        {authorizedCount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Fragment>
                                ))}
                                <tfoot>
                                    <tr className="bg-gray-200/70 border-t-2 border-gray-300">
                                        <th className="p-2 font-bold text-dark sticky left-0 bg-gray-200/70 z-20 text-left">Total Authorized</th>
                                        {nataCompetencyData.techSummary.map(({ technicianId, authorizedCount }) => (
                                            <td key={technicianId} className="p-2 text-center font-bold text-lg text-dark">
                                                {authorizedCount}
                                            </td>
                                        ))}
                                        <td className="bg-gray-200/70"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                     <Card>
                        <h3 className="font-bold text-lg mb-2 text-dark">Proactive Compliance Risks</h3>
                        {proactiveRisks.length > 0 ? (
                            <ul className="space-y-3">
                                {proactiveRisks.map((risk, index) => (
                                    <li key={index} className={`p-3 rounded-lg flex items-start ${risk.level === 'High' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-yellow-50 border-l-4 border-yellow-400'}`}>
                                        {risk.level === 'High' ? <AlertOctagonIcon /> : <AlertTriangleIcon />}
                                        <div>
                                            <p className="font-semibold text-sm">{risk.methodName}</p>
                                            <p className="text-xs text-medium">{risk.details}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-medium">No immediate single-point-of-failure risks detected.</p>}
                    </Card>

                    <Card>
                        <h3 className="font-bold text-lg mb-2 text-dark">Competency Expiry Forecast</h3>
                        <p className="text-sm text-medium mb-4">Based on a 2-year reassessment cycle.</p>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={expiryForecastData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(200, 200, 200, 0.5)',
                                            borderRadius: '1rem',
                                        }}
                                    />
                                    <Bar dataKey="expiring" name="Expiring Competencies" fill="#6366F1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-lg mb-2 text-dark">At-Risk Staff List</h3>
                        {atRiskStaff.length > 0 ? (
                            <ul className="space-y-3">
                                {atRiskStaff.map(person => (
                                    <li key={person.person_id} className="p-3 bg-white/50 rounded-lg shadow-sm">
                                        <button onClick={() => onOpenProfile(person.person_id)} className="font-semibold text-primary hover:underline text-left w-full">
                                            {person.name}
                                        </button>
                                        <p className="text-xs text-medium">Expiring: {person.skills.join(', ')}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-medium">No staff at risk.</p>}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ComplianceDashboard;