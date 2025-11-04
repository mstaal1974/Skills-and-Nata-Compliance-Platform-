import React, { useMemo, useState } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import { ComputedBadge, BadgeStatus, Skill } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import ProfileModal from '../common/ProfileModal';

// --- Icon Components ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;


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

const BadgeCell: React.FC<{ status: BadgeStatus; onClick: () => void }> = ({ status, onClick }) => {
    const baseClasses = "w-9 h-9 rounded-lg flex items-center justify-center text-white/90 font-bold cursor-pointer transition-all duration-200 shadow-md border-b-4 hover:scale-110 active:border-b-0 active:translate-y-1";
    const statusMap = {
        'Compliant': { class: "bg-gradient-to-br from-green-500 to-green-600 border-green-700 hover:from-green-600 hover:to-green-700 hover:shadow-lg", content: '✓' },
        'Expiring': { class: "bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg", content: '!' },
        'Missing': { class: "bg-gradient-to-br from-red-500 to-red-600 border-red-700 hover:from-red-600 hover:to-red-700 hover:shadow-lg", content: '✕' },
        'N/A': { class: "bg-gradient-to-br from-gray-400 to-gray-500 border-gray-600 hover:from-gray-500 hover:to-gray-600", content: '-' },
    };
    const { class: styleClass, content } = statusMap[status] || statusMap['N/A'];

    return (
        <div className={`${baseClasses} ${styleClass}`} onClick={onClick}>
            {content}
        </div>
    );
};

// --- Modal Components ---

const VerificationModal: React.FC<{ data: ComputedBadge | null; onClose: () => void; }> = ({ data, onClose }) => {
    if (!data || !data.badge) return null;
    return (
        <Modal isOpen={true} onClose={onClose} title="Badge Verification">
            <div className="space-y-4">
                <p><strong>Employee:</strong> {data.person.name}</p>
                <p><strong>Skill:</strong> {data.skill.name}</p>
                <p className="font-bold text-lg text-green-600">Status: VERIFIED</p>
                <div className="p-4 bg-gray-100/50 rounded-lg space-y-2 border border-gray-200/50">
                    <p><strong>Issue Date:</strong> {new Date(data.badge.issueDate).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> {new Date(data.badge.expiryDate).toLocaleDateString()}</p>
                    <p><strong>Verification ID:</strong> <code className="text-sm bg-gray-200 p-1 rounded">{data.badge.verificationId}</code></p>
                </div>
            </div>
        </Modal>
    );
};

const AssignmentModal: React.FC<{ data: ComputedBadge | null; onClose: () => void; }> = ({ data, onClose }) => {
    if (!data) return null;
    const isExpiring = data.status === 'Expiring';
    return (
        <Modal isOpen={true} onClose={onClose} title="Assign Microcredential">
            <div className="space-y-6 text-center">
                <p className="text-lg">Assign <strong>{data.skill.name}</strong> training to <strong>{data.person.name}</strong>?</p>
                {isExpiring && <p className="text-yellow-700 bg-yellow-100 p-3 rounded-lg">This skill expires on {new Date(data.badge!.expiryDate).toLocaleDateString()}. Assign re-training to maintain compliance.</p>}
                {!isExpiring && data.status !== 'N/A' && <p className="text-red-700 bg-red-100 p-3 rounded-lg">This skill is required and currently missing.</p>}

                <a
                    href="https://app.microcredentials.io/courses/author/ABC%20Training"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5 hover:shadow-primary-glow"
                >
                    Confirm & Assign Training
                </a>
            </div>
        </Modal>
    );
};

const SkillStatsModal: React.FC<{
    data: { skill: Skill; stats: { Compliant: number; Expiring: number; Missing: number } } | null;
    onClose: () => void;
}> = ({ data, onClose }) => {
    if (!data) return null;

    const chartData = [
        { name: 'Compliant', value: data.stats.Compliant },
        { name: 'Expiring', value: data.stats.Expiring },
        { name: 'Missing', value: data.stats.Missing },
    ];
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Compliance Stats for: ${data.skill.name}`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/3 h-48">
                     <ResponsiveContainer>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                <Cell fill="#4ade80" /><Cell fill="#fbbf24" /><Cell fill="#f87171" />
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(200, 200, 200, 0.5)',
                                    borderRadius: '1rem',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-2/3 space-y-2">
                    <h4 className="font-bold text-lg text-dark">Overall Status ({total} required)</h4>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <span className="font-semibold text-green-800">Compliant</span>
                        <span className="font-bold text-green-800">{data.stats.Compliant} ({total > 0 ? Math.round(data.stats.Compliant/total * 100) : 0}%)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50">
                        <span className="font-semibold text-yellow-800">Expiring</span>
                        <span className="font-bold text-yellow-800">{data.stats.Expiring} ({total > 0 ? Math.round(data.stats.Expiring/total * 100) : 0}%)</span>
                    </div>
                     <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                        <span className="font-semibold text-red-800">Missing</span>
                        <span className="font-bold text-red-800">{data.stats.Missing} ({total > 0 ? Math.round(data.stats.Missing/total * 100) : 0}%)</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


// --- Main Dashboard Component ---

const ComplianceDashboard: React.FC = () => {
    const { issuedBadges, matrixSkills, complianceMatrix } = useSkillsData();
    const [selectedBadge, setSelectedBadge] = useState<ComputedBadge | null>(null);
    const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
    const [isAssignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [skillStats, setSkillStats] = useState<{ skill: Skill; stats: { Compliant: number; Expiring: number; Missing: number; } } | null>(null);


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
       const staff = new Map<number, {name: string, skills: string[]}>();
       complianceMatrix.reduce((acc, val) => acc.concat(val), []).filter(c => c.status === 'Expiring').forEach(c => {
           if(!staff.has(c.person.person_id)) {
               staff.set(c.person.person_id, {name: c.person.name, skills: []});
           }
           staff.get(c.person.person_id)!.skills.push(c.skill.name);
       });
       return Array.from(staff.values());
    }, [complianceMatrix]);

    const handleBadgeClick = (badgeData: ComputedBadge) => {
        setSelectedBadge(badgeData);
        if ((badgeData.status === 'Compliant' || badgeData.status === 'Expiring') && badgeData.badge) {
            setVerificationModalOpen(true);
        } else if (badgeData.status === 'Missing' || (badgeData.status === 'Expiring' && !badgeData.badge) || (badgeData.status !== 'Compliant' && badgeData.status !=='N/A')) {
            setAssignmentModalOpen(true);
        }
    };
    
    const handleExport = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }
    
    const aiSkillChartData = useMemo(() => {
        const stats = { Compliant: 0, Expiring: 0, Missing: 0 };
        const aiSkill = matrixSkills.find(s => s.isAiSkill);
        if(!aiSkill) return [];

        complianceMatrix.forEach(row => {
            const cell = row.find(c => c.skill.skill_id === aiSkill.skill_id);
            if(cell && cell.status !== 'N/A') {
                stats[cell.status]++;
            }
        });
        return [{name: 'Compliant', value: stats.Compliant}, {name: 'Expiring', value: stats.Expiring}, {name: 'Missing', value: stats.Missing}];
    }, [complianceMatrix, matrixSkills]);

    const handleHeaderClick = (skill: Skill) => {
        const stats = { Compliant: 0, Expiring: 0, Missing: 0 };
        complianceMatrix.forEach(row => {
            const cell = row.find(c => c.skill.skill_id === skill.skill_id);
            if (cell && cell.status !== 'N/A') {
                stats[cell.status]++;
            }
        });
        setSkillStats({ skill, stats });
    };

    if (complianceMatrix.length === 0) {
        return <Card><div className="text-center p-8">No "Lab Staff" found to display in the compliance dashboard.</div></Card>
    }

    return (
        <>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Overall Compliance" value={kpiData.overallCompliance} icon={<CheckCircleIcon />} />
                    <KpiCard title="AI Skill Ready" value={kpiData.aiSkillReady} icon={<AiIcon />} footer="Team members compliant in 'AI for Labs'" />
                    <KpiCard title="At-Risk (Expiring)" value={kpiData.atRisk} icon={<ExclamationIcon />} footer="Staff with credentials expiring in 30 days" />
                    <KpiCard title="Badges Issued" value={kpiData.badgesIssued} icon={<BadgeIcon />} footer="Total microcredentials issued to team" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-dark">Team Skills Matrix</h2>
                                <button onClick={handleExport} className="px-5 py-2.5 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all">Export Audit Report</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200/80">
                                            <th className="p-3 font-semibold text-medium">Employee</th>
                                            {matrixSkills.map(skill => (
                                                <th key={skill.skill_id} className={`p-3 text-center ${skill.isAiSkill ? 'bg-indigo-50/50 text-primary rounded-t-lg' : 'text-medium'}`}>
                                                    <button onClick={() => handleHeaderClick(skill)} className="font-semibold w-full h-full text-center hover:text-primary transition-colors">
                                                        {skill.name}
                                                    </button>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complianceMatrix.map((row) => (
                                            <tr key={row[0].person.person_id} className="border-b border-gray-200/50">
                                                <td className="p-3 font-medium">
                                                    <button onClick={() => setSelectedProfileId(row[0].person.person_id)} className="text-primary hover:underline text-left font-semibold">
                                                        {row[0].person.name}
                                                    </button>
                                                </td>
                                                {row.map(cell => (
                                                    <td key={cell.skill.skill_id} className={`p-3 ${cell.skill.isAiSkill ? 'bg-indigo-50/50' : ''}`}>
                                                        <div className="flex justify-center">
                                                            <BadgeCell status={cell.status} onClick={() => handleBadgeClick(cell)} />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <h3 className="font-bold text-lg mb-2 text-dark">AI Skill Chart</h3>
                            <div style={{width: '100%', height: 200}}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <defs>
                                            <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
                                            </filter>
                                        </defs>
                                        <Pie data={aiSkillChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} filter="url(#pieShadow)">
                                            <Cell fill="#4ade80" /><Cell fill="#fbbf24" /><Cell fill="#f87171" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(200, 200, 200, 0.5)',
                                                borderRadius: '1rem',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center space-x-4 text-sm mt-2 text-medium">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Compliant</span>
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Expiring</span>
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Missing</span>
                            </div>
                        </Card>
                        <Card>
                            <h3 className="font-bold text-lg mb-2 text-dark">At-Risk Staff List</h3>
                            {atRiskStaff.length > 0 ? (
                                <ul className="space-y-3">
                                    {atRiskStaff.map(person => (
                                        <li key={person.name} className="p-3 bg-white/50 rounded-lg shadow-sm">
                                            <p className="font-semibold text-dark">{person.name}</p>
                                            <p className="text-xs text-medium">Expiring: {person.skills.join(', ')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-medium">No staff at risk.</p>}
                        </Card>
                    </div>
                </div>
                
                {isVerificationModalOpen && <VerificationModal data={selectedBadge} onClose={() => setVerificationModalOpen(false)} />}
                {isAssignmentModalOpen && <AssignmentModal data={selectedBadge} onClose={() => setAssignmentModalOpen(false)} />}
                <SkillStatsModal data={skillStats} onClose={() => setSkillStats(null)} />

                {showToast && <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">Audit Report export started!</div>}
            </div>
            <ProfileModal personId={selectedProfileId} onClose={() => setSelectedProfileId(null)} />
        </>
    );
};

export default ComplianceDashboard;