import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { 
  Skill, RichSkill, Occupation, Person, IssuedBadge, 
  ComputedBadge, BadgeStatus, Department, EscoSkill, Competency, Evidence,
  Course, DevelopmentPlan, OpenBadge, DevelopmentPlanCourse, GapAnalysisResult, CoursePriority
} from '../types';
import { initializeData } from '../data/mockData';

// Declare global Fuse type from CDN
declare const Fuse: any;

interface DataContextState {
  skills: Skill[];
  richSkills: RichSkill[];
  occupations: Occupation[];
  people: Person[];
  departments: Department[];
  issuedBadges: IssuedBadge[];
  escoSkills: EscoSkill[];
  competencies: Competency[];
  evidence: Evidence[];
  courses: Course[];
  developmentPlans: DevelopmentPlan[];
  openBadges: OpenBadge[];
  productivityBenchmarks: Record<string, number>;
  matrixSkills: Skill[];
  complianceMatrix: ComputedBadge[][];
  addPerson: (personData: Omit<Person, 'person_id'>) => void;
  addSkillsAndOccupation: (occupationData: { title: string; description: string; }, selectedEscoSkills: EscoSkill[], selectedInternalSkillIds: number[]) => void;
  updateOccupation: (occupationId: number, updates: Partial<Occupation>) => void;
  deleteOccupation: (occupationId: number) => void;
  addDepartment: (departmentName: string) => void;
  updateDepartment: (departmentId: number, name: string) => void;
  deleteDepartment: (departmentId: number) => void;
  updatePersonDepartment: (personId: number, departmentId: number) => void;
  updateCompetency: (competencyId: number, updates: Partial<Omit<Competency, 'competency_id' | 'person_id' | 'skill_id'>>) => void;
  addEvidence: (competencyId: number, record: string, author: string) => void;
  createDevelopmentPlan: (personId: number, courseIds: number[]) => void;
  updateDevelopmentPlanCourse: (planId: number, courseId: number, updates: { priority?: CoursePriority, dueDate?: string, managerNotes?: string }) => void;
  syncBadges: () => void;
  autoCreateDevelopmentPlan: (personId: number) => { createdCourses: number };
  analyzeJobDescriptionForGaps: (jobDescriptionText: string, personId: number) => GapAnalysisResult | null;
  extractSkillsFromPlan: (planText: string) => Skill[];
  updateProductivityBenchmarks: (newBenchmarks: Record<string, number>) => void;
}

export const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState] = useState(() => initializeData());
  const { _pendingBadges, productivityBenchmarks: initialBenchmarks, ...restOfData } = initialState;
  const [data, setData] = useState(restOfData);
  const [pendingBadges, setPendingBadges] = useState(_pendingBadges);
  const [productivityBenchmarks, setProductivityBenchmarks] = useState(initialBenchmarks);

  const addPerson = (personData: Omit<Person, 'person_id'>) => {
    setData(prevData => {
        const newPerson: Person = {
            ...personData,
            person_id: Math.max(0, ...prevData.people.map(p => p.person_id)) + 1,
        };
        return {
            ...prevData,
            people: [...prevData.people, newPerson]
        };
    });
  };

  const addSkillsAndOccupation = (occupationData: { title: string; description: string; }, selectedEscoSkills: EscoSkill[], selectedInternalSkillIds: number[]) => {
    setData(prevData => {
      let nextSkillId = Math.max(0, ...prevData.skills.map(s => s.skill_id)) + 1;
      const existingSkillsMap = new Map<string, Skill>(prevData.skills.map(s => [s.name.toLowerCase(), s]));
      const newInternalSkills: Skill[] = [];
      const requiredSkillIds = new Set<number>(selectedInternalSkillIds);

      for (const escoSkill of selectedEscoSkills) {
        const escoSkillNameLower = escoSkill.preferredLabel.toLowerCase();
        if (existingSkillsMap.has(escoSkillNameLower)) {
          requiredSkillIds.add(existingSkillsMap.get(escoSkillNameLower)!.skill_id);
        } else {
          const newSkill: Skill = {
            skill_id: nextSkillId,
            name: escoSkill.preferredLabel,
            category: 'Uncategorized',
          };
          newInternalSkills.push(newSkill);
          requiredSkillIds.add(nextSkillId);
          existingSkillsMap.set(escoSkillNameLower, newSkill);
          nextSkillId++;
        }
      }
      
      const newOccupation: Occupation = {
        occupation_id: Math.max(0, ...prevData.occupations.map(o => o.occupation_id)) + 1,
        title: occupationData.title,
        description: occupationData.description,
        required_skills: Array.from(requiredSkillIds),
      };
      
      return {
        ...prevData,
        skills: [...prevData.skills, ...newInternalSkills],
        occupations: [...prevData.occupations, newOccupation],
      };
    });
  };

  const updateOccupation = (occupationId: number, updates: Partial<Occupation>) => {
    setData(prevData => ({
      ...prevData,
      occupations: prevData.occupations.map(o =>
        o.occupation_id === occupationId ? { ...o, ...updates } : o
      ),
    }));
  };

  const deleteOccupation = (occupationId: number) => {
    setData(prevData => ({
      ...prevData,
      occupations: prevData.occupations.filter(o => o.occupation_id !== occupationId),
    }));
  };
  
  const addDepartment = (departmentName: string) => {
    if (!departmentName.trim()) return;
    setData(prevData => {
      const newDepartment: Department = {
        name: departmentName,
        department_id: Math.max(0, ...prevData.departments.map(d => d.department_id)) + 1,
      };
      return { ...prevData, departments: [...prevData.departments, newDepartment] };
    });
  };

  const updateDepartment = (departmentId: number, name: string) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(d =>
        d.department_id === departmentId ? { ...d, name } : d
      ),
    }));
  };

  const deleteDepartment = (departmentId: number) => {
    // Cannot delete the "Unassigned" department
    if (departmentId === 0) return;
    setData(prevData => {
      // Reassign people from the deleted department to "Unassigned" (ID 0)
      const updatedPeople = prevData.people.map(p =>
        p.department_id === departmentId ? { ...p, department_id: 0 } : p
      );
      return {
        ...prevData,
        departments: prevData.departments.filter(d => d.department_id !== departmentId),
        people: updatedPeople,
      };
    });
  };

  const updatePersonDepartment = (personId: number, departmentId: number) => {
    setData(prevData => ({
      ...prevData,
      people: prevData.people.map(p =>
        p.person_id === personId ? { ...p, department_id: departmentId } : p
      ),
    }));
  };
  
  const updateCompetency = (competencyId: number, updates: Partial<Omit<Competency, 'competency_id' | 'person_id' | 'skill_id'>>) => {
    setData(prevData => ({
      ...prevData,
      competencies: prevData.competencies.map(c => 
        c.competency_id === competencyId ? { ...c, ...updates } : c
      ),
    }));
  };

  const addEvidence = (competencyId: number, record: string, author: string) => {
    setData(prevData => {
        const newEvidence: Evidence = {
            evidence_id: Math.max(0, ...prevData.evidence.map(e => e.evidence_id)) + 1,
            competency_id: competencyId,
            date: new Date().toISOString().split('T')[0],
            record,
            author,
        };
        return { ...prevData, evidence: [...prevData.evidence, newEvidence] };
    });
  };

  const createDevelopmentPlan = (personId: number, courseIds: number[]) => {
    if (courseIds.length === 0) return;

    setData(prevData => {
        const existingPlan = prevData.developmentPlans.find(p => p.person_id === personId && p.status !== 'Completed');

        if (existingPlan) {
            // Add to existing plan
            const existingCourseIds = new Set(existingPlan.courses.map(c => c.course_id));
            const newCoursesToAdd = courseIds
                .filter(id => !existingCourseIds.has(id))
                .map((id): DevelopmentPlanCourse => ({ course_id: id, status: 'Assigned' }));

            if (newCoursesToAdd.length === 0) return prevData;

            const updatedPlans = prevData.developmentPlans.map(p =>
                p.plan_id === existingPlan.plan_id
                    ? { ...p, courses: [...p.courses, ...newCoursesToAdd], status: 'Assigned' as const }
                    : p
            );
            return { ...prevData, developmentPlans: updatedPlans };
        } else {
            // Create a new plan
            const newPlan: DevelopmentPlan = {
                plan_id: Math.max(0, ...prevData.developmentPlans.map(p => p.plan_id)) + 1,
                person_id: personId,
                courses: courseIds.map(id => ({ course_id: id, status: 'Assigned' })),
                status: 'Assigned',
                createdDate: new Date().toISOString().split('T')[0],
            };
            return { ...prevData, developmentPlans: [...prevData.developmentPlans, newPlan] };
        }
    });
  };

  const updateDevelopmentPlanCourse = (planId: number, courseId: number, updates: Partial<Omit<DevelopmentPlanCourse, 'course_id' | 'status'>>) => {
    setData(prevData => ({
        ...prevData,
        developmentPlans: prevData.developmentPlans.map(plan => {
            if (plan.plan_id === planId) {
                return {
                    ...plan,
                    courses: plan.courses.map(course =>
                        course.course_id === courseId ? { ...course, ...updates } : course
                    ),
                };
            }
            return plan;
        }),
    }));
  };
  
  const autoCreateDevelopmentPlan = (personId: number) => {
      let createdCoursesCount = 0;
      setData(prevData => {
          const person = prevData.people.find(p => p.person_id === personId);
          const occupation = prevData.occupations.find(o => o.title === person?.job);

          if (!person || !occupation) return prevData;

          const personSkillIds = new Set(person.skills.map(s => s.skill_id));
          const missingSkillIds = occupation.required_skills.filter(id => !personSkillIds.has(id));

          if (missingSkillIds.length === 0) return prevData;
          
          const personPlans = prevData.developmentPlans.filter(p => p.person_id === personId);
          const assignedCourseIds = new Set(personPlans.flatMap(p => p.courses.map(c => c.course_id)));
          
          const coursesForMissingSkills = prevData.courses
            .filter(course => missingSkillIds.includes(course.provides_skill_id))
            .filter(course => !assignedCourseIds.has(course.course_id));
          
          const uniqueCourseIds = Array.from(new Set<number>(coursesForMissingSkills.map(c => c.course_id)));
          
          if (uniqueCourseIds.length === 0) return prevData;
          
          createdCoursesCount = uniqueCourseIds.length;
          
          const existingPlan = prevData.developmentPlans.find(p => p.person_id === personId && p.status !== 'Completed');

          if (existingPlan) {
              const newCoursesToAdd = uniqueCourseIds
                  .filter(id => !existingPlan.courses.some(c => c.course_id === id))
                  .map((id): DevelopmentPlanCourse => ({ course_id: id, status: 'Assigned' }));
              
              if(newCoursesToAdd.length === 0) {
                createdCoursesCount = 0;
                return prevData;
              }

              createdCoursesCount = newCoursesToAdd.length;
              const updatedPlans = prevData.developmentPlans.map(p =>
                  p.plan_id === existingPlan.plan_id
                      ? { ...p, courses: [...p.courses, ...newCoursesToAdd], status: 'Assigned' as const }
                      : p
              );
              return { ...prevData, developmentPlans: updatedPlans };
          } else {
              const newPlan: DevelopmentPlan = {
                  plan_id: Math.max(0, ...prevData.developmentPlans.map(p => p.plan_id)) + 1,
                  person_id: personId,
                  courses: uniqueCourseIds.map((id): DevelopmentPlanCourse => ({ course_id: id, status: 'Assigned' })),
                  status: 'Assigned',
                  createdDate: new Date().toISOString().split('T')[0],
              };

              return { ...prevData, developmentPlans: [...prevData.developmentPlans, newPlan] };
          }
      });
      return { createdCourses: createdCoursesCount };
  };

  const analyzeJobDescriptionForGaps = (jobDescriptionText: string, personId: number): GapAnalysisResult | null => {
    const person = data.people.find(p => p.person_id === personId);
    if (!person) return null;

    const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'a', 'of', 'for', 'on', 'with', 'as', 'at', 'by', 'to', 'from', 'an', 'that', 'this', 'we', 'are', 'be', 'will', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'so', 'then', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'experience', 'requirements', 'responsibilities', 'skills', 'qualifications', 'education', 'work', 'team', 'project', 'client', 'role', 'position', 'company', 'develop', 'manage', 'design', 'implement', 'test', 'ensure', 'provide', 'support', 'ability', 'knowledge']);
    
    const keywords = Array.from(new Set(jobDescriptionText.toLowerCase().match(/\b[\w-]{3,}\b/g) || []))
        .filter(word => !stopWords.has(word));

    const fuse = new Fuse(data.skills, {
        keys: [
            { name: 'name', weight: 0.7 },
            { name: 'category', weight: 0.3 },
        ],
        threshold: 0.3,
        includeScore: true,
    });
    
    const matchedSkills = new Map<number, Skill>();
    keywords.forEach(keyword => {
        const results = fuse.search(keyword);
        if (results.length > 0 && results[0].score! < 0.2) { // high confidence match
            const skill = results[0].item;
            if (!matchedSkills.has(skill.skill_id)) {
                matchedSkills.set(skill.skill_id, skill);
            }
        }
    });

    const requiredSkills = Array.from(matchedSkills.values());
    const requiredSkillIds = new Set(requiredSkills.map(s => s.skill_id));

    const personSkillIds = new Set(person.skills.map(s => s.skill_id));

    const matchingSkills = requiredSkills.filter(s => personSkillIds.has(s.skill_id));
    const skillGaps = requiredSkills.filter(s => !personSkillIds.has(s.skill_id));
    
    const matchPercentage = requiredSkillIds.size > 0 ? Math.round((matchingSkills.length / requiredSkillIds.size) * 100) : 100;

    return { matchingSkills, skillGaps, matchPercentage };
  };

  const extractSkillsFromPlan = (planText: string): Skill[] => {
    const stopWords = new Set(['and', 'the', 'is', 'in', 'it', 'a', 'of', 'for', 'on', 'with', 'as', 'at', 'by', 'to', 'from', 'an', 'that', 'this', 'we', 'are', 'be', 'will', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'so', 'then', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'experience', 'requirements', 'responsibilities', 'skills', 'qualifications', 'education', 'work', 'team', 'project', 'client', 'role', 'position', 'company', 'develop', 'manage', 'design', 'implement', 'test', 'ensure', 'provide', 'support', 'ability', 'knowledge']);
    
    const keywords = Array.from(new Set(planText.toLowerCase().match(/\b[\w-]{3,}\b/g) || []))
        .filter(word => !stopWords.has(word));

    const fuse = new Fuse(data.skills, {
        keys: [ { name: 'name', weight: 0.7 }, { name: 'category', weight: 0.3 } ],
        threshold: 0.3, includeScore: true,
    });
    
    const matchedSkills = new Map<number, Skill>();
    keywords.forEach(keyword => {
        const results = fuse.search(keyword);
        if (results.length > 0 && results[0].score! < 0.2) {
            const skill = results[0].item;
            if (!matchedSkills.has(skill.skill_id)) matchedSkills.set(skill.skill_id, skill);
        }
    });

    return Array.from(matchedSkills.values()).sort((a,b) => a.name.localeCompare(b.name));
  };

  const syncBadges = () => {
    if (pendingBadges.length === 0) return;

    setData(prevData => {
        const newBadges = [...pendingBadges];
        const updatedPeople = JSON.parse(JSON.stringify(prevData.people));
        const updatedPlans = JSON.parse(JSON.stringify(prevData.developmentPlans));

        newBadges.forEach(badge => {
            const plan = updatedPlans.find((p: DevelopmentPlan) => p.person_id === badge.person_id);
            if (plan) {
                const course = plan.courses.find((c: any) => c.course_id === badge.course_id);
                if (course) {
                    course.status = 'Completed';
                }
                
                const allCoursesComplete = plan.courses.every((c: any) => c.status === 'Completed');
                if (allCoursesComplete) {
                    plan.status = 'Completed';
                } else {
                    plan.status = 'In Progress';
                }
            }

            const person = updatedPeople.find((p: Person) => p.person_id === badge.person_id);
            if (person) {
                const skillIndex = person.skills.findIndex(s => s.skill_id === badge.skill_id);
                if (skillIndex !== -1) {
                    person.skills[skillIndex].level = badge.levelAchieved;
                } else {
                    person.skills.push({ skill_id: badge.skill_id, level: badge.levelAchieved });
                }
            }
        });
        
        return {
            ...prevData,
            openBadges: [...prevData.openBadges, ...newBadges],
            people: updatedPeople,
            developmentPlans: updatedPlans,
        };
    });
    setPendingBadges([]);
  };

  const updateProductivityBenchmarks = (newBenchmarks: Record<string, number>) => {
    setProductivityBenchmarks(newBenchmarks);
  };

  const { matrixSkills, complianceMatrix } = useMemo(() => {
    const today = new Date();
    const expiryWarningDate = new Date();
    expiryWarningDate.setDate(today.getDate() + 30);

    const badgesByPersonAndSkill = new Map<string, IssuedBadge>();
    data.issuedBadges.forEach(badge => {
        badgesByPersonAndSkill.set(`${badge.person_id}-${badge.skill_id}`, badge);
    });

    const requiredSkillsByPerson = new Map<number, Set<number>>();
    data.people.forEach(person => {
        const occupation = data.occupations.find(o => o.title === person.job);
        if (occupation) {
            const nonNataSkills = occupation.required_skills.filter(skillId => {
                const skill = data.skills.find(s => s.skill_id === skillId);
                return skill && !skill.isNataTestMethod;
            });
            requiredSkillsByPerson.set(person.person_id, new Set(nonNataSkills));
        }
    });

    const labStaffDept = data.departments.find(d => d.name === 'Lab Staff');
    const relevantPeople = data.people.filter(p => p.department_id === labStaffDept?.department_id);
    
    const allRequiredSkillIds = new Set<number>();
    relevantPeople.forEach(p => {
        const required = requiredSkillsByPerson.get(p.person_id);
        if (required) {
            required.forEach(id => allRequiredSkillIds.add(id));
        }
    });

    const matrixSkills = data.skills
        .filter(s => allRequiredSkillIds.has(s.skill_id))
        .sort((a, b) => {
            if (a.isAiSkill) return -1;
            if (b.isAiSkill) return 1;
            return a.name.localeCompare(b.name);
        });

    const complianceMatrix = relevantPeople.map(person => {
        return matrixSkills.map(skill => {
            const requiredSkills = requiredSkillsByPerson.get(person.person_id);
            const isRequired = requiredSkills ? requiredSkills.has(skill.skill_id) : false;
            const badge = badgesByPersonAndSkill.get(`${person.person_id}-${skill.skill_id}`);
            let status: BadgeStatus = 'N/A';

            if (isRequired) {
                const expiryDate = badge ? new Date(badge.expiryDate) : null;
                if (!badge || !expiryDate || expiryDate < today) {
                    status = 'Missing';
                } else if (expiryDate < expiryWarningDate) {
                    status = 'Expiring';
                } else {
                    status = 'Compliant';
                }
            }

            return { person, skill, status, badge };
        });
    });
    
    return { matrixSkills, complianceMatrix };
  }, [data.people, data.skills, data.occupations, data.issuedBadges, data.departments]);


  const contextValue = useMemo(() => ({
    ...data,
    matrixSkills,
    complianceMatrix,
    productivityBenchmarks,
    addPerson,
    addSkillsAndOccupation,
    updateOccupation,
    deleteOccupation,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updatePersonDepartment,
    updateCompetency,
    addEvidence,
    createDevelopmentPlan,
    updateDevelopmentPlanCourse,
    syncBadges,
    autoCreateDevelopmentPlan,
    analyzeJobDescriptionForGaps,
    extractSkillsFromPlan,
    updateProductivityBenchmarks,
  }), [data, matrixSkills, complianceMatrix, productivityBenchmarks]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};