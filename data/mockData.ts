import { Skill, RichSkill, Occupation, Person, IssuedBadge, Department, EscoSkill, Competency, Evidence, Course, DevelopmentPlan, OpenBadge } from '../types';

export const initializeData = () => {
    const skills: Skill[] = [
        { skill_id: 1, name: 'React', category: 'Frontend Development' },
        { skill_id: 2, name: 'Python', category: 'Backend Development' },
        { skill_id: 3, name: 'SQL', category: 'Database Management' },
        { skill_id: 4, name: 'Project Management', category: 'Management' },
        { skill_id: 5, name: 'Communication', category: 'Soft Skills' },
        { skill_id: 6, name: 'Data Analysis', category: 'Analytics' },
        { skill_id: 7, name: 'UI/UX Design', category: 'Design' },
        { skill_id: 8, name: 'Node.js', category: 'Backend Development' },
        { skill_id: 9, name: 'Cloud Computing (AWS)', category: 'Infrastructure' },
        { skill_id: 10, name: 'AI for Labs', category: 'AI/ML', isAiSkill: true },
        { skill_id: 11, name: 'Agile Methodologies', category: 'Management' },
        { skill_id: 12, name: 'Salesforce', category: 'Sales' },
        { skill_id: 13, name: 'Digital Marketing', category: 'Marketing' },
        { skill_id: 14, name: 'TypeScript', category: 'Frontend Development' },
        { skill_id: 15, name: 'Docker', category: 'Infrastructure' },
        { skill_id: 16, name: 'Data Security', category: 'Compliance' },
        // NATA Test Methods start here
        { skill_id: 101, name: 'Standard Compaction', category: 'Soils & Aggregates', isNataTestMethod: true, methodCode: 'AS 1289.5.1.1' },
        { skill_id: 102, name: 'Sieve Analysis', category: 'Soils & Aggregates', isNataTestMethod: true, methodCode: 'AS 1289.3.6.1' },
        { skill_id: 103, name: 'Compressive Strength', category: 'Concrete (PCC)', isNataTestMethod: true, methodCode: 'AS 1012.9' },
        { skill_id: 104, name: 'Atterberg Limits', category: 'Soils & Aggregates', isNataTestMethod: true, methodCode: 'AS 1289.3.1.2' },
        { skill_id: 105, name: 'Concrete Slump Test', category: 'Concrete (PCC)', isNataTestMethod: true, methodCode: 'AS 1012.3.1' },
        { skill_id: 106, name: 'Field Density Testing', category: 'Field & NDT', isNataTestMethod: true, methodCode: 'AS 1289.5.7.1' },
        { skill_id: 107, name: 'Karl Fischer Titration', category: 'Titration Methods', isNataTestMethod: true, methodCode: 'ISO 29796' },
    ];

    const richSkills: RichSkill[] = [
        { skill_id: 1, description: 'Building user interfaces with React.', type: 'Technical', related_occupations: [101, 102], certifications: ['Meta Certified'] },
        { skill_id: 2, description: 'General-purpose programming with Python.', type: 'Technical', related_occupations: [101, 103, 104], certifications: ['PCEP'] },
    ];

    const occupations: Occupation[] = [
        { occupation_id: 101, title: 'Software Engineer', description: 'Builds and maintains software applications.', required_skills: [1, 2, 3, 8, 14, 15] },
        { occupation_id: 102, title: 'Frontend Developer', description: 'Specializes in the user interface.', required_skills: [1, 7, 14] },
        { occupation_id: 103, title: 'Data Scientist', description: 'Analyzes data to extract insights.', required_skills: [2, 3, 6, 10] },
        { occupation_id: 105, title: 'Product Manager', description: 'Manages the product lifecycle.', required_skills: [4, 5, 7, 11] },
        { occupation_id: 107, title: 'Lab Technician', description: 'Performs laboratory tests and analyses.', required_skills: [10, 16, 101, 102, 103, 104, 105, 106] },
        { occupation_id: 108, title: 'Senior Lab Technician', description: 'Performs advanced lab tests and supervises technicians.', required_skills: [10, 16, 101, 102, 103, 104, 105, 106] },
    ];

    const departments: Department[] = [
        { department_id: 0, name: 'Unassigned' }, // Default department
        { department_id: 1, name: 'Engineering' },
        { department_id: 5, name: 'Product' },
        { department_id: 6, name: 'Lab Staff' },
    ];

    const people: Person[] = [
        { person_id: 1, name: 'Alice Johnson', job: 'Software Engineer', department_id: 1, skills: [{ skill_id: 1, level: 5 }, { skill_id: 2, level: 4 }, { skill_id: 3, level: 3 }, { skill_id: 5, level: 4 }] },
        { 
            person_id: 2, 
            name: 'Ben Carter', 
            job: 'Lab Technician', 
            department_id: 6, 
            skills: [{ skill_id: 16, level: 5 }, { skill_id: 101, level: 4 }, { skill_id: 102, level: 3 }],
            isTechnician: true,
            technicianId: 'T-8561',
            qualifications: ['Cert III in Laboratory Technology', 'Main Roads WA Basic'],
            experience: '2 years experience in soils and aggregates testing.'
        },
        { person_id: 3, name: 'Charlie Brown', job: 'Product Manager', department_id: 5, skills: [{ skill_id: 4, level: 5 }, { skill_id: 5, level: 5 }, { skill_id: 7, level: 3 }, { skill_id: 11, level: 4 }] },
        { 
            person_id: 5, 
            name: 'Aisha Khan', 
            job: 'Senior Lab Technician', 
            department_id: 6, 
            skills: [{ skill_id: 16, level: 4 }, { skill_id: 10, level: 5 }, { skill_id: 101, level: 5 }, { skill_id: 102, level: 5 }, { skill_id: 103, level: 4 }],
            isTechnician: true,
            technicianId: 'T-7304',
            qualifications: ['Cert IV in Laboratory Technology', 'VicRoads Certified'],
            experience: '5 years experience across CMT, specializing in concrete testing. Acts as a team lead.'
        },
        { 
            person_id: 7, 
            name: 'Marcus Cole', 
            job: 'Lab Technician', 
            department_id: 6, 
            skills: [{ skill_id: 10, level: 3 }, { skill_id: 105, level: 4 }, { skill_id: 106, level: 3 }],
            isTechnician: true,
            technicianId: 'T-9122',
            qualifications: ['Cert III in Laboratory Technology'],
            experience: '1 year experience, primary focus on field testing.'
        },
    ];

    const issuedBadges: IssuedBadge[] = [
        { badge_id: 'b004', person_id: 7, skill_id: 10, issueDate: '2023-11-01T00:00:00Z', expiryDate: '2025-11-01T00:00:00Z', verificationId: 'verify-marcus-ai' },
    ];
    
    const competencies: Competency[] = [
        { competency_id: 1, person_id: 2, skill_id: 101, trainingCompleteDate: '2023-01-15', competencyAssessedDate: '2023-01-29', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 2, person_id: 2, skill_id: 102, trainingCompleteDate: '2023-01-15', competencyAssessedDate: '2023-01-29', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 3, person_id: 2, skill_id: 103, trainingCompleteDate: null, competencyAssessedDate: null, assessedBy: null, authorizationStatus: 'Not Authorized' },
        { competency_id: 4, person_id: 2, skill_id: 104, trainingCompleteDate: '2024-02-01', competencyAssessedDate: null, assessedBy: 'A. Khan', authorizationStatus: 'In Training' },
        { competency_id: 5, person_id: 5, skill_id: 101, trainingCompleteDate: '2020-03-10', competencyAssessedDate: '2020-03-24', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 6, person_id: 5, skill_id: 102, trainingCompleteDate: '2020-03-10', competencyAssessedDate: '2020-03-24', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 7, person_id: 5, skill_id: 103, trainingCompleteDate: '2021-05-18', competencyAssessedDate: '2021-06-01', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 8, person_id: 5, skill_id: 105, trainingCompleteDate: '2021-05-18', competencyAssessedDate: '2021-06-01', assessedBy: 'J. Smith (Lab Mgr)', authorizationStatus: 'Authorized' },
        { competency_id: 9, person_id: 5, skill_id: 106, trainingCompleteDate: '2023-08-11', competencyAssessedDate: '2023-08-25', assessedBy: 'Self', authorizationStatus: 'Authorized' },
        { competency_id: 10, person_id: 7, skill_id: 105, trainingCompleteDate: '2023-09-01', competencyAssessedDate: '2023-09-15', assessedBy: 'A. Khan', authorizationStatus: 'Authorized' },
        { competency_id: 11, person_id: 7, skill_id: 106, trainingCompleteDate: '2023-09-01', competencyAssessedDate: null, assessedBy: null, authorizationStatus: 'In Training' },
        { competency_id: 12, person_id: 7, skill_id: 101, trainingCompleteDate: null, competencyAssessedDate: null, assessedBy: null, authorizationStatus: 'Not Authorized' },
    ];
    
    const evidence: Evidence[] = [
        { evidence_id: 1, competency_id: 1, date: '2023-01-15', record: 'Read and understood AS 1289.5.1.1.', author: 'B. Carter' },
        { evidence_id: 2, competency_id: 1, date: '2023-01-20', record: 'Attended internal workshop on soil compaction.', author: 'J. Smith' },
        { evidence_id: 3, competency_id: 1, date: '2023-01-29', record: 'Observed performing entire test correctly and safely.', author: 'J. Smith' },
        { evidence_id: 4, competency_id: 7, date: '2021-06-01', record: 'Passed proficiency test (Sample ID #12345).', author: 'A. Khan' },
        { evidence_id: 5, competency_id: 4, date: '2024-02-01', record: 'Started training under supervision of A. Khan.', author: 'B. Carter' },
    ];

    const escoSkills: EscoSkill[] = [
      { uri: 'esco-cmt-1', preferredLabel: 'Sieve Analysis (Gradation)', description: 'Domain: Construction Materials Testing, Cluster: Soils & Aggregates. Covers determining the particle size distribution of granular materials in accordance with AS 1289.3.6.1.', skillType: 'skill/competence' },
      { uri: 'esco-cmt-2', preferredLabel: 'Concrete Compressive Strength Testing', description: 'Domain: Construction Materials Testing, Cluster: Concrete (PCC). Covers determining the maximum compressive load a concrete specimen can bear as per AS 1012.9.', skillType: 'skill/competence' },
    ];
    
    // --- New Automated Talent Development Data ---
    const courses: Course[] = [
        { course_id: 1, title: 'CMT-101: Fundamentals of Soil Compaction', provider: 'microcredentials.io', provides_skill_id: 101 },
        { course_id: 2, title: 'CMT-201: Advanced Sieve Analysis Techniques', provider: 'microcredentials.io', provides_skill_id: 102 },
        { course_id: 3, title: 'CMT-205: Advanced Concrete Strength Analysis', provider: 'microcredentials.io', provides_skill_id: 103 },
        { course_id: 4, title: 'CMT-102: Soil Properties & Atterberg Limits', provider: 'microcredentials.io', provides_skill_id: 104 },
        { course_id: 5, title: 'CMT-103: Field Practice for Slump Testing', provider: 'microcredentials.io', provides_skill_id: 105 },
        { course_id: 6, title: 'CMT-301: Nuclear Gauge Operations', provider: 'microcredentials.io', provides_skill_id: 106 },
        { course_id: 7, title: 'AI-101: Introduction to AI in a Lab Setting', provider: 'microcredentials.io', provides_skill_id: 10 },
        // Added courses for Software Engineer role
        { course_id: 8, title: 'SE-101: Modern Frontend with React', provider: 'microcredentials.io', provides_skill_id: 1 },
        { course_id: 9, title: 'SE-201: Advanced SQL for Developers', provider: 'microcredentials.io', provides_skill_id: 3 },
        { course_id: 10, title: 'SE-202: Building APIs with Node.js', provider: 'microcredentials.io', provides_skill_id: 8 },
        { course_id: 11, title: 'SE-102: Enterprise TypeScript', provider: 'microcredentials.io', provides_skill_id: 14 },
        { course_id: 12, title: 'SE-301: Containerization with Docker', provider: 'microcredentials.io', provides_skill_id: 15 },
        // Added based on user feedback
        { course_id: 13, title: 'Project Management Essentials (ID-1369)', provider: 'microcredentials.io', provides_skill_id: 4 },
    ];

    const developmentPlans: DevelopmentPlan[] = [
        {
            plan_id: 1,
            person_id: 2, // Ben Carter
            courses: [
                {
                    course_id: 4,
                    status: 'Assigned',
                    priority: 'High',
                    dueDate: '2024-08-31',
                    managerNotes: 'Crucial for upcoming NATA audit. Please prioritize.'
                },
                {
                    course_id: 3,
                    status: 'Assigned',
                    priority: 'Medium',
                    // This course is overdue to demonstrate the new dashboard feature
                    dueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0],
                }
            ],
            status: 'Assigned',
            createdDate: '2024-03-01',
        }
    ];

    const openBadges: OpenBadge[] = []; // Initially empty

    // This simulates new badges earned but not yet synced.
    const _pendingBadges: OpenBadge[] = [
        {
            badge_id: 'badge-comp-001',
            person_id: 2, // Ben Carter
            course_id: 4, // Course for Atterberg Limits
            skill_id: 104,
            levelAchieved: 4,
            issueDate: '2024-03-15',
            evidenceUrl: 'https://app.microcredentials.io/courses/author/ABC%20Training'
        }
    ];
    
    const productivityBenchmarks: Record<string, number> = {
      'Earthworks': 10,
      'Pavement': 8,
      'Concrete': 10,
      'Asphalt': 8,
      'Drainage': 10
    };

    return {
        skills,
        richSkills,
        occupations,
        people,
        issuedBadges,
        departments,
        escoSkills,
        competencies,
        evidence,
        // New data
        courses,
        developmentPlans,
        openBadges,
        _pendingBadges,
        productivityBenchmarks,
    };
};