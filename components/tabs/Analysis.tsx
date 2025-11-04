import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, Legend } from 'recharts';
import { GapAnalysisResult, Skill } from '../../types';
import GapAnalysisResults from '../common/GapAnalysisResults';

// Declare global types from CDNs
declare const pdfjsLib: any;

const Analysis: React.FC = () => {
    const { people, occupations, skills, courses, createDevelopmentPlan, analyzeJobDescriptionForGaps } = useSkillsData();
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [selectedOccupationId, setSelectedOccupationId] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);


    // State for AI analysis
    const [aiAnalysisResult, setAiAnalysisResult] = useState<GapAnalysisResult | null>(null);
    const [aiSelectedPersonId, setAiSelectedPersonId] = useState<number | null>(null);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !aiSelectedPersonId) return;

        setIsProcessingPdf(true);
        setPdfError(null);
        setAiAnalysisResult(null);
        event.target.value = ''; // Reset file input

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map((s: any) => s.str).join(' ');
            }
            
            const result = analyzeJobDescriptionForGaps(textContent, aiSelectedPersonId);
            setAiAnalysisResult(result);

        } catch (error) {
            console.error("Error processing PDF for gap analysis:", error);
            setPdfError("Failed to process the PDF file. Please try another file.");
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const gapAnalysis = useMemo(() => {
        if (!selectedPersonId || !selectedOccupationId) return null;

        const person = people.find(p => p.person_id === selectedPersonId);
        const occupation = occupations.find(o => o.occupation_id === selectedOccupationId);

        if (!person || !occupation) return null;

        const personSkills = new Set(person.skills.map(s => s.skill_id));
        const requiredSkills = new Set(occupation.required_skills);

        const matchingSkills = skills.filter(s => personSkills.has(s.skill_id) && requiredSkills.has(s.skill_id));
        const skillGaps = skills.filter(s => !personSkills.has(s.skill_id) && requiredSkills.has(s.skill_id));
        
        const matchPercentage = requiredSkills.size > 0 ? Math.round((matchingSkills.length / requiredSkills.size) * 100) : 100;

        return { matchingSkills, skillGaps, matchPercentage };
    }, [selectedPersonId, selectedOccupationId, people, occupations, skills]);
    
    const aggregateSkillsData = useMemo(() => {
        const skillStats: { [key: number]: { count: number, totalLevel: number } } = {};

        people.forEach(person => {
            person.skills.forEach(pSkill => {
                if (!skillStats[pSkill.skill_id]) {
                    skillStats[pSkill.skill_id] = { count: 0, totalLevel: 0 };
                }
                skillStats[pSkill.skill_id].count++;
                skillStats[pSkill.skill_id].totalLevel += pSkill.level;
            });
        });
        
        return skills.map(skill => {
            const stats = skillStats[skill.skill_id];
            if (!stats) return null;
            return {
                name: skill.name,
                employees: stats.count,
                avgProficiency: stats.count > 0 ? (stats.totalLevel / stats.count) : 0,
            };
        }).filter(Boolean);
    }, [skills, people]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const handleAssignAllGaps = (personId: number, skillGaps: Skill[]) => {
        const gapSkillIds = new Set(skillGaps.map(s => s.skill_id));
        const courseIdsToAdd = courses
            .filter(c => gapSkillIds.has(c.provides_skill_id))
            .map(c => c.course_id);

        if (courseIdsToAdd.length > 0) {
            createDevelopmentPlan(personId, courseIdsToAdd);
            const personName = people.find(p => p.person_id === personId)?.name;
            showToast(`Development plan updated for ${personName} with ${courseIdsToAdd.length} course(s).`);
        } else {
            showToast('No suitable courses found for the identified skill gaps.');
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card title="Manual Skill Gap Analysis">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="person" className="block text-sm font-medium text-medium mb-1">Select Person</label>
                                <select id="person" onChange={e => setSelectedPersonId(Number(e.target.value))} defaultValue="" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                                    <option value="" disabled>-- Select a person --</option>
                                    {people.map(p => <option key={p.person_id} value={p.person_id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="occupation" className="block text-sm font-medium text-medium mb-1">Select Occupation to Compare</label>
                                <select id="occupation" onChange={e => setSelectedOccupationId(Number(e.target.value))} defaultValue="" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl">
                                    <option value="" disabled>-- Select an occupation --</option>
                                    {occupations.map(o => <option key={o.occupation_id} value={o.occupation_id}>{o.title}</option>)}
                                </select>
                            </div>
                        </div>

                        {gapAnalysis && selectedPersonId && (
                           <GapAnalysisResults
                               analysis={gapAnalysis}
                               personId={selectedPersonId}
                               onAssignAll={handleAssignAllGaps}
                               setToastMessage={showToast}
                           />
                        )}
                    </Card>
                    <Card title="AI-Powered Gap Analysis from Job Description">
                        <div className="space-y-4">
                            <p className="text-sm text-medium">Upload a job description PDF and select an employee to automatically analyze their skill gaps against the role.</p>
                            <div>
                                <label htmlFor="ai-person" className="block text-sm font-medium text-medium mb-1">1. Select Employee</label>
                                <select 
                                    id="ai-person" 
                                    onChange={e => {
                                        setAiSelectedPersonId(Number(e.target.value));
                                        setAiAnalysisResult(null);
                                        setPdfError(null);
                                    }} 
                                    defaultValue="" 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl"
                                >
                                    <option value="" disabled>-- Select an employee --</option>
                                    {people.map(p => <option key={p.person_id} value={p.person_id}>{p.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className={`w-full flex items-center justify-center px-4 py-3 bg-white text-primary rounded-xl shadow-md tracking-wide uppercase border border-primary/50 transition-all ${!aiSelectedPersonId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-primary hover:text-white hover:shadow-primary-glow transform hover:-translate-y-0.5'}`}>
                                    <svg className="w-8 h-8 mr-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>
                                    <span className="text-base leading-normal font-semibold">{isProcessingPdf ? 'Analyzing...' : '2. Upload Job Description'}</span>
                                    <input type='file' className="hidden" accept=".pdf" onChange={handleFileChange} disabled={!aiSelectedPersonId || isProcessingPdf} />
                                </label>
                            </div>
                            {pdfError && <p className="text-sm text-red-600">{pdfError}</p>}
                        </div>

                        {aiAnalysisResult && aiSelectedPersonId && (
                            <GapAnalysisResults
                                analysis={aiAnalysisResult}
                                personId={aiSelectedPersonId}
                                onAssignAll={handleAssignAllGaps}
                                setToastMessage={showToast}
                            />
                        )}
                    </Card>
                </div>

                <Card title="Aggregate Skills Map">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <defs>
                                    <filter id="scatterShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.3"/>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="employees" name="Employees with Skill" unit="" />
                                <YAxis type="number" dataKey="avgProficiency" name="Avg Proficiency" unit="" />
                                <ZAxis type="number" dataKey="employees" range={[50, 400]} name="employees" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(200, 200, 200, 0.5)',
                                        borderRadius: '1rem',
                                    }}
                                />
                                <Legend />
                                <Scatter name="Skills" data={aggregateSkillsData} fill="#6366F1" style={{filter: 'url(#scatterShadow)'}} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-secondary text-white py-2 px-4 rounded-lg shadow-lg animate-[fadeIn_0.5s_ease-out] z-50">
                    {toastMessage}
                </div>
            )}
        </>
    );
};

export default Analysis;