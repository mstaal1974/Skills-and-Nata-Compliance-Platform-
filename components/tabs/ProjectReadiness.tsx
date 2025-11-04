import React, { useState } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import Metric from '../ui/Metric';
import { ProjectAnalysisResult, Skill } from '../../types';

// Declare global types from CDNs
declare const pdfjsLib: any;

const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;


const ProjectReadiness: React.FC = () => {
    const { extractSkillsFromPlan, calculateProjectReadiness } = useSkillsData();
    
    const [analysisStep, setAnalysisStep] = useState<'upload' | 'define' | 'dashboard'>('upload');
    const [projectName, setProjectName] = useState('');
    const [totalStaff, setTotalStaff] = useState<number | ''>(1);
    const [unitsPerPerson, setUnitsPerPerson] = useState<number | ''>(100);
    const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
    const [skillRequirements, setSkillRequirements] = useState<{ [key: number]: number }>({});
    const [analysisResult, setAnalysisResult] = useState<ProjectAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !projectName.trim()) {
            setError("Please provide a project name before uploading a file.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        event.target.value = '';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map((s: any) => s.str).join(' ');
            }
            
            const skills = extractSkillsFromPlan(textContent);
            setExtractedSkills(skills);
            setSkillRequirements(skills.reduce((acc, skill) => ({...acc, [skill.skill_id]: 10}), {}));
            setAnalysisStep('define');

        } catch (e) {
            console.error("Error processing project plan:", e);
            setError("Failed to process the PDF file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeReadiness = () => {
        const requirements = Object.entries(skillRequirements).map(([skillId, requiredUnits]) => ({
            skillId: parseInt(skillId),
            requiredUnits: requiredUnits || 0,
        }));
        const result = calculateProjectReadiness(projectName, Number(totalStaff) || 0, Number(unitsPerPerson) || 1, requirements);
        setAnalysisResult(result);
        setAnalysisStep('dashboard');
    };
    
    const handleRequirementChange = (skillId: number, count: string) => {
        const numCount = parseInt(count, 10);
        setSkillRequirements(prev => ({...prev, [skillId]: isNaN(numCount) || numCount < 0 ? 0 : numCount}));
    };

    const startOver = () => {
        setProjectName('');
        setTotalStaff(1);
        setUnitsPerPerson(100);
        setExtractedSkills([]);
        setSkillRequirements({});
        setAnalysisResult(null);
        setError(null);
        setAnalysisStep('upload');
    };

    return (
        <div className="space-y-8">
            {analysisStep === 'upload' && (
                <Card title="Step 1: Analyze Project Plan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label htmlFor="project-name" className="block text-sm font-medium text-medium mb-1">Project Name / Work Order</label>
                            <input
                                id="project-name"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g., Highway 7 Expansion Project"
                                className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className={`w-full flex items-center justify-center px-4 py-3 bg-white text-primary rounded-xl shadow-md tracking-wide uppercase border border-primary/50 transition-all ${!projectName.trim() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-primary hover:text-white hover:shadow-primary-glow transform hover:-translate-y-0.5'}`}>
                                <svg className="w-8 h-8 mr-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>
                                <span className="text-base leading-normal font-semibold">{isLoading ? 'Analyzing...' : 'Upload & Extract Skills'}</span>
                                <input type='file' className="hidden" accept=".pdf" onChange={handleFileChange} disabled={!projectName.trim() || isLoading} />
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </Card>
            )}

            {analysisStep === 'define' && (
                 <Card title="Step 2: Define Project Workload">
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-lg">
                            <h3 className="text-lg font-bold text-primary">{projectName}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label htmlFor="total-staff" className="block text-sm font-medium text-medium mb-1">Total Estimated Staff for Project</label>
                                    <input
                                        id="total-staff"
                                        type="number"
                                        min="1"
                                        value={totalStaff}
                                        onChange={(e) => setTotalStaff(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                                        className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="units-per-person" className="flex items-center text-sm font-medium text-medium mb-1">
                                        Work Units per Person
                                        <div className="relative group ml-1">
                                            <InfoIcon />
                                            <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                Define the capacity of one qualified person. E.g., one person can perform 100 tests during this project.
                                            </div>
                                        </div>
                                    </label>
                                    <input
                                        id="units-per-person"
                                        type="number"
                                        min="1"
                                        value={unitsPerPerson}
                                        onChange={(e) => setUnitsPerPerson(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                                        className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <h4 className="font-semibold">Define Workload for AI-Extracted Skills:</h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                             {extractedSkills.map(skill => (
                                <div key={skill.skill_id} className="grid grid-cols-3 items-center p-2 bg-gray-50/50 rounded-lg gap-4">
                                    <label htmlFor={`skill-${skill.skill_id}`} className="font-semibold text-dark col-span-2">{skill.name}</label>
                                    <div className="col-span-1">
                                        <label htmlFor={`skill-units-${skill.skill_id}`} className="block text-xs text-medium mb-1">Total Tests / Work Units</label>
                                        <input
                                            id={`skill-units-${skill.skill_id}`}
                                            type="number"
                                            min="0"
                                            value={skillRequirements[skill.skill_id] || 0}
                                            onChange={(e) => handleRequirementChange(skill.skill_id, e.target.value)}
                                            className="w-full text-center border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button onClick={startOver} className="text-sm font-semibold text-medium hover:text-primary">Start Over</button>
                            <button onClick={handleAnalyzeReadiness} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">Analyze Readiness</button>
                        </div>
                    </div>
                 </Card>
            )}

            {analysisStep === 'dashboard' && analysisResult && (
                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                    <Card>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-primary">Capacity Analysis: {analysisResult.projectName}</h2>
                            <button onClick={startOver} className="text-sm font-semibold text-medium hover:text-primary">Analyze New Project</button>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <Metric label="Overall Readiness Score" value={`${analysisResult.readinessScore}%`} icon={<CheckBadgeIcon />} />
                            <Metric label="Critical Skill Gaps" value={analysisResult.criticalGaps.length} icon={<ExclamationIcon />} />
                        </div>
                    </Card>

                    <Card title="Workforce Capacity Analysis">
                        <div className="max-h-[70vh] overflow-y-auto">
                           <table className="min-w-full text-sm">
                                <thead className="bg-gray-50/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-medium">Required Skill</th>
                                        <th className="px-4 py-2 text-center font-medium text-medium">Tests Required</th>
                                        <th className="px-4 py-2 text-center font-medium text-medium">Staff Needed</th>
                                        <th className="px-4 py-2 text-center font-medium text-medium">Staff Available</th>
                                        <th className="px-4 py-2 text-center font-medium text-medium">Staff Gap</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50">
                                    {analysisResult.requiredSkills.map(({ skill, requiredUnits, headcountNeeded, availableCount, gap }) => (
                                        <tr key={skill.skill_id} className={gap < 0 ? 'bg-red-50/50' : 'bg-green-50/50'}>
                                            <td className="px-4 py-3 font-bold text-dark">{skill.name}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{requiredUnits}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{headcountNeeded}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{availableCount}</td>
                                            <td className={`px-4 py-3 text-center font-bold text-lg ${gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {gap > 0 ? `+${gap}` : gap}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ProjectReadiness;