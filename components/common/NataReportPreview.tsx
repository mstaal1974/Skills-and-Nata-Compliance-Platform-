import React from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';

const NataReportPreview: React.FC<{ technicianId: number }> = ({ technicianId }) => {
    const { people, skills, competencies, evidence } = useSkillsData();

    const technician = people.find(p => p.person_id === technicianId);
    
    if (!technician || !technician.isTechnician) {
        return <div className="p-4 text-red-600">Selected person is not a valid NATA Technician.</div>;
    }

    const technicianCompetencies = competencies
        .filter(c => c.person_id === technicianId)
        .map(comp => {
            const testMethod = skills.find(s => s.skill_id === comp.skill_id);
            return {
                ...comp,
                name: testMethod?.name || 'Unknown',
                methodCode: testMethod?.methodCode || 'N/A',
                evidence: evidence.filter(e => e.competency_id === comp.competency_id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            };
        })
        .sort((a, b) => (a.methodCode || '').localeCompare(b.methodCode || ''));

    return (
        <div className="bg-white p-8 rounded-lg shadow-inner space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <header className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-dark">NATA-Compliant Skills Profile</h1>
                <p className="text-medium">A documented, verifiable, and dynamic record of competence.</p>
            </header>

            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">1. Foundational Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-semibold text-medium">Full Name:</div>
                    <div>{technician.name}</div>
                    <div className="font-semibold text-medium">Technician ID:</div>
                    <div>{technician.technicianId}</div>
                    <div className="font-semibold text-medium">Role/Position:</div>
                    <div>{technician.job}</div>
                    <div className="font-semibold text-medium">Qualifications:</div>
                    <div>{technician.qualifications?.join(', ')}</div>
                    <div className="font-semibold text-medium col-span-2">Experience Summary:</div>
                    <div className="col-span-2 text-gray-700 italic border-l-4 pl-4">{technician.experience}</div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">2. The Skills & Test Method Matrix</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-3 font-semibold border">Test Method</th>
                                <th className="p-3 font-semibold border">Training Complete</th>
                                <th className="p-3 font-semibold border">Competency Assessed</th>
                                <th className="p-3 font-semibold border">Assessed By</th>
                                <th className="p-3 font-semibold border">Authorization Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {technicianCompetencies.map(c => (
                                <tr key={c.competency_id}>
                                    <td className="p-3 border font-medium">{c.name} ({c.methodCode})</td>
                                    <td className="p-3 border">{c.trainingCompleteDate || '---'}</td>
                                    <td className="p-3 border">{c.competencyAssessedDate || '---'}</td>
                                    <td className="p-3 border">{c.assessedBy || '---'}</td>
                                    <td className="p-3 border font-semibold">{c.authorizationStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">3. Evidence of Competency</h2>
                <div className="space-y-6">
                    {technicianCompetencies.filter(c => c.evidence.length > 0).map(c => (
                        <div key={`evidence-${c.competency_id}`}>
                            <h3 className="font-bold text-dark">{c.name} ({c.methodCode})</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700 pl-4">
                                {c.evidence.map(e => (
                                    <li key={e.evidence_id}>
                                        {e.record} <span className="text-xs text-gray-500">({new Date(e.date).toLocaleDateString()} - {e.author})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

             <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">4. Authorization Records</h2>
                <div className="space-y-2 text-sm italic text-gray-600">
                    <p>This document formally declares that {technician.name} has been trained and assessed for the test methods marked as "Authorized" and is deemed competent to perform these tests unsupervised and report the results for this laboratory.</p>
                    <div className="pt-8">
                        <div className="flex justify-between">
                             <div className="w-1/3 border-t pt-2">Laboratory Manager Signature</div>
                             <div className="w-1/3 border-t pt-2 text-center">Date</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NataReportPreview;
