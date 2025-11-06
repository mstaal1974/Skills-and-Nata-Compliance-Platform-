
import React, { useState } from 'react';
import Card from '../ui/Card';
import { useSkillsData } from '../../hooks/useSkillsData';
import { ProjectRiskAnalysisResult, StaffingFTE, ProjectRisk } from '../../types';

// Declare global types from CDNs
declare const pdfjsLib: any;

// --- Helper Components & Icons ---
const UploadIcon = () => <svg className="w-8 h-8 mr-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 16a6 6 0 005.657-4H4.343A6 6 0 0010 16zM3.93 3.93a1 1 0 001.414 1.414l.707-.707A1 1 0 004.636 3.223L3.93 3.93z" /></svg>;

const RiskLevelIcon: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const iconMap = {
        High: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'High' },
        Medium: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, text: 'Medium' },
        Low: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Low' },
    };
    const { icon, text } = iconMap[level];
    return <div className="flex items-center space-x-2 font-bold">{icon}<span>{text}</span></div>;
};

// --- Main Component ---
const ProjectReadiness: React.FC = () => {
    const { updateProductivityBenchmarks, people, skills, competencies } = useSkillsData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [currentAnalysis, setCurrentAnalysis] = useState<ProjectRiskAnalysisResult | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    const WORK_DAYS = 4 * 20; // 4 months * 20 work days/month

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (!uploadedFile) return;

        setIsLoading(true);
        setError(null);
        setFile(uploadedFile);
        event.target.value = '';

        try {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            await pdfjsLib.getDocument(arrayBuffer).promise;
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // --- AI SIMULATION LOGIC ---

            // 1. Static project data extraction (as before)
            const staffingTable: StaffingFTE[] = [
                { category: 'Earthworks', estTests: 955, mainTests: 'Field Density, CBR', staffType: 'Field Tech', productivity: 10, staffRequiredFTE: 955 / (10 * WORK_DAYS) },
                { category: 'Pavement', estTests: 940, mainTests: 'Density, PSD, Abrasion', staffType: 'Lab + Field', productivity: 8, staffRequiredFTE: 940 / (8 * WORK_DAYS) },
                { category: 'Concrete', estTests: 420, mainTests: 'Slump, Cylinders', staffType: 'Concrete Tech', productivity: 10, staffRequiredFTE: 420 / (10 * WORK_DAYS) },
                { category: 'Asphalt', estTests: 642, mainTests: 'Cores, Binder, Voids', staffType: 'Asphalt Tech', productivity: 8, staffRequiredFTE: 642 / (8 * WORK_DAYS) },
                { category: 'Drainage', estTests: 215, mainTests: 'Trench Density', staffType: 'Field Tech', productivity: 10, staffRequiredFTE: 215 / (10 * WORK_DAYS) },
            ];

            // 2. Map project tests to NATA skill IDs
            const testMethodToSkillIdMap: Record<string, number> = {
                'Compressive Strength': 103,
                'Field Density Testing': 106,
                'Sieve Analysis': 102,
                'Standard Compaction': 101,
                'Concrete Slump Test': 105
            };
            const criticalTestMethods = ['Compressive Strength', 'Field Density Testing', 'Sieve Analysis'];

            // 3. Analyze risks against live competency data
            const risks: ProjectRisk[] = [];
            const technicians = people.filter(p => p.isTechnician);

            criticalTestMethods.forEach(methodName => {
                const skillId = testMethodToSkillIdMap[methodName];
                const skill = skills.find(s => s.skill_id === skillId);
                if (!skill) return;

                const relevantCompetencies = competencies.filter(c => c.skill_id === skillId);
                const authorized = relevantCompetencies.filter(c => c.authorizationStatus === 'Authorized');
                const inTraining = relevantCompetencies.filter(c => c.authorizationStatus === 'In Training');

                let risk: ProjectRisk | null = null;

                if (authorized.length === 0) {
                    const trainee = inTraining.length > 0 ? people.find(p => p.person_id === inTraining[0].person_id) : null;
                    risk = {
                        level: 'High',
                        testMethod: skill.name,
                        details: `There are no technicians currently authorized for this critical test method.`,
                        mitigation: trainee ? `Prioritize and fast-track the assessment for ${trainee.name}, who is already in training.` : 'Immediately assign a senior technician to begin training at least two team members.'
                    };
                } else if (authorized.length === 1) {
                    const authorizedPerson = people.find(p => p.person_id === authorized[0].person_id);
                    const bestCandidateForTraining = technicians.find(t => t.person_id !== authorizedPerson?.person_id);
                    risk = {
                        level: 'Medium',
                        testMethod: skill.name,
                        details: `Only one technician (${authorizedPerson?.name}) is authorized, creating a single point of failure risk.`,
                        mitigation: bestCandidateForTraining ? `Begin cross-training ${bestCandidateForTraining.name} on this method to provide backup coverage.` : 'Hire an additional technician with this skill.'
                    };
                } else {
                     risk = {
                        level: 'Low',
                        testMethod: skill.name,
                        details: `${authorized.length} technicians are authorized, providing adequate coverage.`,
                        mitigation: 'No immediate action required. Monitor project workload to ensure availability.'
                    };
                }
                risks.push(risk);
            });
            
            const overallRiskLevel = risks.some(r => r.level === 'High') ? 'High' : risks.some(r => r.level === 'Medium') ? 'Medium' : 'Low';

            const result: ProjectRiskAnalysisResult = {
              projectName: '10km Highway Upgrade (CMT & Civil)',
              executiveSummary: "This project requires ~7.5 technical FTEs over 4 months. The staffing plan is generally robust, but the AI analysis has identified a critical 'single point of failure' risk for Compressive Strength testing and a lack of depth in Field Density testing. Proactive cross-training is recommended to mitigate potential delays.",
              staffingTable,
              overallRisk: overallRiskLevel,
              risks,
              recommendations: ['Resource peaks are anticipated during simultaneous asphalt and concrete placement weeks, requiring careful scheduling.', 'Batching material tests (e.g., PSDs, Atterbergs) is recommended to balance laboratory workload.', 'An on-site lab setup should be evaluated against sample transport times and costs for efficiency.', 'Total labour costs can be estimated by applying hourly rates to the total FTE requirement.']
            };
            setCurrentAnalysis(result);
        } catch (e) {
            setError("Failed to process the PDF. It may be corrupted or in an unsupported format.");
        } finally {
            setIsLoading(false);
        }
    };

    const startOver = () => {
      setFile(null);
      setCurrentAnalysis(null);
      setError(null);
    };

    const handleProductivityChange = (category: string, value: string) => {
        const newRate = Number(value);
        if (isNaN(newRate) || !currentAnalysis) return;

        const newStaffingTable = currentAnalysis.staffingTable.map(row => {
            if (row.category === category) {
                const updatedRow = { ...row, productivity: newRate };
                if (newRate > 0) {
                    updatedRow.staffRequiredFTE = updatedRow.estTests / (newRate * WORK_DAYS);
                } else {
                    updatedRow.staffRequiredFTE = 0;
                }
                return updatedRow;
            }
            return row;
        });
        
        setCurrentAnalysis({ ...currentAnalysis, staffingTable: newStaffingTable });
    };

    const handleSaveBenchmarks = () => {
        if (!currentAnalysis) return;
        const newBenchmarks = currentAnalysis.staffingTable.reduce((acc, row) => {
            acc[row.category] = row.productivity;
            return acc;
        }, {} as Record<string, number>);
        
        updateProductivityBenchmarks(newBenchmarks);
        setToastMessage('Productivity benchmarks saved successfully!');
        setTimeout(() => setToastMessage(null), 3000);
    };

    if (currentAnalysis) {
        const totalFTE = currentAnalysis.staffingTable.reduce((sum, row) => sum + row.staffRequiredFTE, 0);
        return (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-primary">Project Readiness & Risk Analysis: {currentAnalysis.projectName}</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveBenchmarks} className="text-sm font-semibold text-white bg-secondary hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5">Save as Team Benchmarks</button>
                      <button onClick={startOver} className="text-sm font-semibold text-medium hover:text-primary px-4 py-2 bg-white/50 rounded-lg shadow-sm">Analyze New Project</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Executive Summary">
                            <p className="text-medium leading-relaxed">{currentAnalysis.executiveSummary}</p>
                        </Card>
                        <Card title="AI-Powered Risk Assessment">
                             <div className="space-y-4">
                                {currentAnalysis.risks.map(risk => (
                                    <div key={risk.testMethod} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-dark">{risk.testMethod}</h4>
                                            <RiskLevelIcon level={risk.level} />
                                        </div>
                                        <p className="text-sm text-medium mt-2">{risk.details}</p>
                                        <p className="text-sm mt-2 flex items-start">
                                          <span className="text-secondary font-semibold mr-2 mt-px">&#10140;</span>
                                          <span>{risk.mitigation}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                     <div className="lg:col-span-1 space-y-8">
                        <Card title="Key Recommendations">
                            <ul className="space-y-3">
                                {currentAnalysis.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start">
                                        <LightbulbIcon className="flex-shrink-0 mt-0.5" />
                                        <span className="text-medium text-sm">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>

                <Card title="Staffing Requirement Summary (4-Month Project)">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-medium">Category</th>
                                    <th className="px-4 py-2 text-center font-medium text-medium">Est. Tests</th>
                                    <th className="px-4 py-2 text-left font-medium text-medium">Main Tests</th>
                                    <th className="px-4 py-2 text-left font-medium text-medium">Staff Type</th>
                                    <th className="px-4 py-2 text-center font-medium text-medium">Productivity (tests/day)</th>
                                    <th className="px-4 py-2 text-center font-medium text-medium">Staff Required (FTE)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {currentAnalysis.staffingTable.map(row => (
                                    <tr key={row.category} className="hover:bg-indigo-50/50">
                                        <td className="px-4 py-3 font-bold text-dark">{row.category}</td>
                                        <td className="px-4 py-3 text-center">{row.estTests}</td>
                                        <td className="px-4 py-3 text-medium">{row.mainTests}</td>
                                        <td className="px-4 py-3 text-medium">{row.staffType}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input 
                                                type="number" 
                                                value={row.productivity}
                                                onChange={(e) => handleProductivityChange(row.category, e.target.value)}
                                                className="w-20 p-1 text-center bg-white/50 border border-gray-300/50 rounded-md shadow-inner-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-lg text-primary">{row.staffRequiredFTE.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-200/70 border-t-2 border-gray-300">
                                    <td colSpan={5} className="px-4 py-2 text-right font-bold text-dark">Total Technical Staff (FTE)</td>
                                    <td className="px-4 py-2 text-center font-bold text-lg text-primary">{totalFTE.toFixed(1)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <p className="text-xs text-right mt-2 text-gray-500">*FTE calculation excludes QA Manager & Admin support roles.</p>
                </Card>

                 {toastMessage && (
                    <div className="fixed bottom-5 right-5 bg-secondary text-white py-2 px-4 rounded-lg shadow-lg animate-[fadeIn_0.5s_ease-out] z-50">
                        {toastMessage}
                    </div>
                )}
            </div>
        );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <Card title="Project Readiness & Risk Simulator">
            <div className="text-center">
                <p className="text-medium mb-6">Upload a project testing plan (PDF) to automatically generate a detailed staffing, skills, and NATA competency risk assessment.</p>
                <label className={`w-full inline-flex items-center justify-center px-4 py-4 bg-white text-primary rounded-xl shadow-md tracking-wide uppercase border border-primary/50 cursor-pointer hover:bg-primary hover:text-white hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5`}>
                    <UploadIcon />
                    <span className="text-base leading-normal font-semibold">{isLoading ? 'Analyzing Project...' : 'Upload Project Plan'}</span>
                    <input type='file' className="hidden" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
                </label>
                {isLoading && (
                    <div className="mt-4 flex items-center justify-center text-medium">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Simulating AI analysis, please wait...
                    </div>
                )}
                {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                {file && !isLoading && !currentAnalysis && <p className="text-sm text-gray-500 mt-4">File ready: {file.name}</p>}
            </div>
        </Card>
      </div>
    );
};

export default ProjectReadiness;