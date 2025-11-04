export interface Skill {
  skill_id: number;
  name: string;
  category: string;
  isAiSkill?: boolean;
  // NATA Test Method Fields
  isNataTestMethod?: boolean;
  methodCode?: string;
}

export interface RichSkill {
  skill_id: number;
  description: string;
  type: 'Technical' | 'Soft' | 'Domain';
  related_occupations: number[];
  certifications: string[];
}

export interface Occupation {
  occupation_id: number;
  title: string;
  description: string;
  required_skills: number[];
}

export interface PersonSkill {
  skill_id: number;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface Department {
  department_id: number;
  name: string;
}

export interface Person {
  person_id: number;
  name: string;
  job: string;
  department_id: number;
  skills: PersonSkill[];
  // NATA Technician Fields
  isTechnician?: boolean;
  technicianId?: string;
  qualifications?: string[];
  experience?: string;
}

// General Compliance Types
export type BadgeStatus = 'Compliant' | 'Expiring' | 'Missing' | 'N/A';

export interface IssuedBadge {
  badge_id: string;
  person_id: number;
  skill_id: number;
  issueDate: string; // ISO string e.g., "2023-10-26T10:00:00Z"
  expiryDate: string; // ISO string
  verificationId: string;
}

export interface ComputedBadge {
  person: Person;
  skill: Skill;
  status: BadgeStatus;
  badge?: IssuedBadge;
}

// ESCO skills Type
export interface EscoSkill {
  uri: string;
  preferredLabel: string;
  description: string;
  skillType: 'skill/competence' | 'knowledge';
}

// Interactive dashboard filter Type
export interface PersonFilter {
  skillId: number;
  group: string;
  viewBy: 'By Job' | 'By Department';
}

// Gap Analysis Type
export interface GapAnalysisResult {
  matchingSkills: Skill[];
  skillGaps: Skill[];
  matchPercentage: number;
}

// Project Readiness Type
export interface ProjectAnalysisResult {
  projectName: string;
  totalStaffRequired: number;
  readinessScore: number;
  requiredSkills: {
    skill: Skill;
    requiredUnits: number;
    headcountNeeded: number;
    availableCount: number;
    gap: number;
    avgProficiency: number;
  }[];
  criticalGaps: Skill[];
  resourceGaps: { skill: Skill; gap: number }[];
}


// --- NATA-Specific Types ---

export type AuthorizationStatus = 'Authorized' | 'In Training' | 'Not Authorized' | 'Supervised Use Only';

export interface Evidence {
  evidence_id: number;
  competency_id: number;
  date: string; // ISO Date string
  record: string; // e.g., "Attended internal workshop on soil compaction."
  author: string; // Name of person who added the record
}

export interface Competency {
  competency_id: number;
  person_id: number;
  skill_id: number; // Links to a skill where isNataTestMethod = true
  trainingCompleteDate: string | null; // ISO Date string
  competencyAssessedDate: string | null; // ISO Date string
  assessedBy: string | null;
  authorizationStatus: AuthorizationStatus;
}

// --- Automated Talent Development Types ---

export interface Course {
  course_id: number;
  title: string;
  provider: string;
  provides_skill_id: number;
}

export type DevelopmentPlanStatus = 'Assigned' | 'In Progress' | 'Completed';
export type CoursePriority = 'High' | 'Medium' | 'Low';

export interface DevelopmentPlanCourse {
  course_id: number;
  status: 'Assigned' | 'Completed';
  priority?: CoursePriority;
  dueDate?: string; // ISO Date string
  managerNotes?: string;
}

export interface DevelopmentPlan {
  plan_id: number;
  person_id: number;
  courses: DevelopmentPlanCourse[];
  status: DevelopmentPlanStatus;
  createdDate: string; // ISO Date string
}

export interface OpenBadge {
  badge_id: string;
  person_id: number;
  course_id: number;
  skill_id: number;
  levelAchieved: 1 | 2 | 3 | 4 | 5;
  issueDate: string; // ISO Date string
  evidenceUrl: string;
}