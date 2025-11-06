import React from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';

const NataAuditDossierPreview: React.FC<{ technicianId: number }> = ({ technicianId }) => {
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
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return (
        <div className="bg-white p-8 rounded-lg shadow-inner space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <header className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-dark">NATA Audit Dossier</h1>
                <p className="text-medium">A comprehensive, auditable record of verified competency.</p>
            </header>

            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">1. Technician Information</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="font-semibold text-medium">Full Name:</div>
                    <div>{technician.name}</div>
                    <div className="font-semibold text-medium">Technician ID:</div>
                    <div>{technician.technicianId}</div>
                    <div className="font-semibold text-medium">Role/Position:</div>
                    <div>{technician.job}</div>
                    <div className="font-semibold text-medium">Qualifications:</div>
                    <div>{technician.qualifications?.join(', ')}</div>
                    <div className="font-semibold text-medium col-span-2">Experience Summary:</div>
                    <div className="col-span-2 text-gray-700 italic border-l-4 border-gray-200 pl-4 py-2">{technician.experience}</div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">2. Competency & Authorization Summary</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-3 font-semibold border">Test Method</th>
                                <th className="p-3 font-semibold border">Method Code</th>
                                <th className="p-3 font-semibold border">Authorization Status</th>
                                <th className="p-3 font-semibold border">Last Assessed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {technicianCompetencies.map(c => (
                                <tr key={c.competency_id}>
                                    <td className="p-3 border font-medium">{c.name}</td>
                                    <td className="p-3 border">{c.methodCode}</td>
                                    <td className="p-3 border font-semibold">{c.authorizationStatus}</td>
                                    <td className="p-3 border">{c.competencyAssessedDate ? new Date(c.competencyAssessedDate).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/30 pb-2 mb-4">3. Detailed Evidence Log</h2>
                <div className="space-y-6">
                    {technicianCompetencies.map(c => (
                        <div key={`evidence-${c.competency_id}`} className="p-4 border rounded-lg bg-gray-50/50">
                            <h3 className="font-bold text-dark">{c.name} ({c.methodCode})</h3>
                            <p className="text-xs text-medium mb-2">Status: {c.authorizationStatus} | Assessed by: {c.assessedBy || 'N/A'}</p>
                             {c.evidence.length > 0 ? (
                                <ul className="list-decimal list-inside mt-2 space-y-2 text-sm text-gray-800 pl-4">
                                    {c.evidence.map(e => (
                                        <li key={e.evidence_id} className="border-l-2 pl-3 ml-[-1rem]">
                                            <span className="font-semibold">{new Date(e.date).toLocaleDateString()}:</span> {e.record} <span className="text-xs text-gray-500"> (by {e.author})</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-medium p-4">No evidence records found for this method.</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

             <footer className="pt-8 mt-8 border-t">
                <p className="text-xs text-center text-gray-500">Generated on {new Date().toLocaleString()}. This document is a snapshot of the technician's competency profile at the time of generation.</p>
            </footer>
        </div>
    );
};

export default NataAuditDossierPreview;