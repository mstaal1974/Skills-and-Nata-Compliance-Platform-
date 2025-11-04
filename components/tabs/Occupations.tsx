import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { Occupation, Skill, EscoSkill } from '../../types';
import EditOccupationModal from '../common/EditOccupationModal';

// Declare global types from CDNs
declare const pdfjsLib: any;
declare const Fuse: any;

interface PDFAnalysisResult {
    jobTitle: string;
    bestMatchedOccupation: Occupation | null;
    suggestedEscoSkills: EscoSkill[];
    recommendedInternalSkills: Skill[];
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const Occupations: React.FC = () => {
    const { occupations, skills, escoSkills, addSkillsAndOccupation, deleteOccupation, courses } = useSkillsData();
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PDFAnalysisResult | null>(null);
    const [confirmedEscoSkills, setConfirmedEscoSkills] = useState<EscoSkill[]>([]);
    const [confirmedInternalSkills, setConfirmedInternalSkills] = useState<Skill[]>([]);
    const [newRoleTitle, setNewRoleTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
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
            
            const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'a', 'of', 'for', 'on', 'with', 'as', 'at', 'by', 'to', 'from', 'an', 'that', 'this', 'we', 'are', 'be', 'will', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'so', 'then', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'experience', 'requirements', 'responsibilities', 'skills', 'qualifications', 'education', 'work', 'team', 'project', 'client', 'role', 'position', 'company', 'develop', 'manage', 'design', 'implement', 'test', 'ensure', 'provide', 'support', 'ability', 'knowledge']);
            const keywords = Array.from(new Set(textContent.toLowerCase().match(/\b[\w-]{3,}\b/g) || []))
              .filter(word => !stopWords.has(word));

            const escoFuse = new Fuse(escoSkills, {
                keys: [
                    { name: 'preferredLabel', weight: 0.7 },
                    { name: 'description', weight: 0.3 }
                ],
                threshold: 0.2, // Stricter threshold
                includeScore: true,
            });

            const skillScores = new Map<string, number>();
            const extractedEscoSkillsMap = new Map<string, EscoSkill>();

            keywords.forEach(keyword => {
                const results = escoFuse.search(keyword);
                if (results.length > 0) {
                    const bestMatch = results[0];
                    if (!skillScores.has(bestMatch.item.uri) || bestMatch.score < skillScores.get(bestMatch.item.uri)!) {
                        skillScores.set(bestMatch.item.uri, bestMatch.score);
                        extractedEscoSkillsMap.set(bestMatch.item.uri, bestMatch.item);
                    }
                }
            });
            
            const sortedSkills = Array.from(extractedEscoSkillsMap.values()).sort((a, b) => {
                return (skillScores.get(a.uri) || 1) - (skillScores.get(b.uri) || 1);
            });
            
            const jobTitle = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
            const occupationFuse = new Fuse(occupations, { keys: ['title'], threshold: 0.4 });
            const bestMatchedOccupation = occupationFuse.search(jobTitle)[0]?.item || null;
            
            let recommendedInternalSkills: Skill[] = [];
            if (bestMatchedOccupation) {
                recommendedInternalSkills = skills.filter(s => bestMatchedOccupation.required_skills.includes(s.skill_id));
            }
            
            const highConfidenceSkills = sortedSkills.filter(s => (skillScores.get(s.uri) || 1) < 0.2);

            setAnalysisResult({ 
                jobTitle, 
                bestMatchedOccupation, 
                suggestedEscoSkills: sortedSkills,
                recommendedInternalSkills
            });
            setNewRoleTitle(jobTitle);
            setConfirmedEscoSkills(highConfidenceSkills); // Pre-select high confidence
            setConfirmedInternalSkills(recommendedInternalSkills); // Pre-select all from matched role
            setIsAnalysisModalOpen(true);
        } catch (error) {
            console.error("Error processing PDF:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const relevantCourses = useMemo(() => {
        if (!isAnalysisModalOpen) return [];
        
        const selectedInternalSkillIds = new Set(confirmedInternalSkills.map(s => s.skill_id));
        const confirmedEscoSkillNames = new Set(confirmedEscoSkills.map(s => s.preferredLabel.toLowerCase()));
        
        // Find internal skills that match the selected ESCO skill names
        skills.forEach(skill => {
            if (confirmedEscoSkillNames.has(skill.name.toLowerCase())) {
                selectedInternalSkillIds.add(skill.skill_id);
            }
        });

        return courses.filter(course => selectedInternalSkillIds.has(course.provides_skill_id));

    }, [isAnalysisModalOpen, confirmedEscoSkills, confirmedInternalSkills, skills, courses]);
    
    const handleAddNewRole = () => {
        if (!newRoleTitle || (confirmedEscoSkills.length === 0 && confirmedInternalSkills.length === 0)) return;
        
        addSkillsAndOccupation(
            {
                title: newRoleTitle,
                description: `A new role for ${newRoleTitle} based on uploaded job description.`,
            },
            confirmedEscoSkills,
            confirmedInternalSkills.map(s => s.skill_id)
        );

        setIsAnalysisModalOpen(false);
        setAnalysisResult(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleDelete = (occupationId: number) => {
        if (window.confirm("Are you sure you want to delete this occupation? This action cannot be undone.")) {
            deleteOccupation(occupationId);
        }
    };
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Add New Role">
                    <div className="space-y-4">
                        <p className="text-sm text-medium">Upload a job description to automatically extract skills and create a new role based on the ESCO framework.</p>
                        <div>
                            <label className="w-full flex items-center justify-center px-4 py-3 bg-white text-primary rounded-xl shadow-md tracking-wide uppercase border border-primary/50 cursor-pointer hover:bg-primary hover:text-white hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5">
                                <svg className="w-8 h-8 mr-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>
                                <span className="text-base leading-normal font-semibold">{isLoading ? 'Processing...' : 'Upload Job Description PDF'}</span>
                                <input type='file' className="hidden" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
                            </label>
                        </div>
                    </div>
                </Card>
                <Card title="Current Roles">
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {occupations.map(occ => (
                            <li key={occ.occupation_id} className="p-4 bg-white/50 rounded-lg border border-gray-200/50 shadow-sm group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-dark">{occ.title}</p>
                                        <p className="text-sm text-medium">{occ.description}</p>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingOccupation(occ)} className="p-1.5 rounded-md bg-indigo-100/50 text-indigo-600 hover:bg-indigo-200/50 transition-colors" title="Edit Occupation">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDelete(occ.occupation_id)} className="p-1.5 rounded-md bg-red-100/50 text-red-600 hover:bg-red-200/50 transition-colors" title="Delete Occupation">
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            {showSuccess && <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">New role added successfully!</div>}
            
            <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title="PDF Analysis Results">
                {analysisResult && (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="role-title" className="block text-sm font-medium text-medium mb-1">Role Title</label>
                            <input type="text" id="role-title" value={newRoleTitle} onChange={e => setNewRoleTitle(e.target.value)} className="mt-1 block w-full border-gray-300/50 bg-white/50 shadow-inner-lg rounded-xl py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"/>
                        </div>
                        
                        {analysisResult.suggestedEscoSkills.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Suggested ESCO Skills (from PDF)</h4>
                                <div className="max-h-48 overflow-y-auto border border-gray-200/80 rounded-xl p-3 space-y-2 bg-gray-50/50">
                                    {analysisResult.suggestedEscoSkills.map(escoSkill => (
                                        <div key={escoSkill.uri} className="flex items-center">
                                            <input
                                                id={`esco-skill-${escoSkill.uri}`}
                                                type="checkbox"
                                                checked={confirmedEscoSkills.some(cs => cs.uri === escoSkill.uri)}
                                                onChange={() => {
                                                    setConfirmedEscoSkills(prev => 
                                                        prev.some(cs => cs.uri === escoSkill.uri)
                                                            ? prev.filter(cs => cs.uri !== escoSkill.uri)
                                                            : [...prev, escoSkill]
                                                    )
                                                }}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor={`esco-skill-${escoSkill.uri}`} className="ml-3 block text-sm text-dark">{escoSkill.preferredLabel}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysisResult.bestMatchedOccupation && analysisResult.recommendedInternalSkills.length > 0 && (
                             <div>
                                <h4 className="font-semibold mb-2">Recommended Skills (from '{analysisResult.bestMatchedOccupation.title}')</h4>
                                <div className="max-h-48 overflow-y-auto border border-gray-200/80 rounded-xl p-3 space-y-2 bg-gray-50/50">
                                    {analysisResult.recommendedInternalSkills.map(internalSkill => (
                                        <div key={internalSkill.skill_id} className="flex items-center">
                                            <input
                                                id={`internal-skill-${internalSkill.skill_id}`}
                                                type="checkbox"
                                                checked={confirmedInternalSkills.some(cs => cs.skill_id === internalSkill.skill_id)}
                                                onChange={() => {
                                                    setConfirmedInternalSkills(prev => 
                                                        prev.some(cs => cs.skill_id === internalSkill.skill_id)
                                                            ? prev.filter(cs => cs.skill_id !== internalSkill.skill_id)
                                                            : [...prev, internalSkill]
                                                    )
                                                }}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor={`internal-skill-${internalSkill.skill_id}`} className="ml-3 block text-sm text-dark">{internalSkill.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {relevantCourses.length > 0 && (
                            <div className="pt-4">
                                <h4 className="font-semibold mb-2 text-secondary">Available Training for this New Role</h4>
                                <div className="max-h-48 overflow-y-auto border border-green-200/80 rounded-xl p-3 space-y-1 bg-green-50/50">
                                    {relevantCourses.map(course => (
                                        <p key={course.course_id} className="text-sm text-green-800">{course.title}</p>
                                    ))}
                                </div>
                            </div>
                        )}


                        <div className="flex justify-end pt-4">
                            <button onClick={handleAddNewRole} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow">Add New Role</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <EditOccupationModal 
                occupation={editingOccupation}
                onClose={() => setEditingOccupation(null)}
            />
        </>
    );
};

export default Occupations;