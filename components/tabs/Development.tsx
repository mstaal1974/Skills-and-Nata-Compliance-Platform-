import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import { DevelopmentPlan, Person, Course, DevelopmentPlanCourse, CoursePriority } from '../../types';
import EditPlanCourseModal from '../common/EditPlanCourseModal';
import Metric from '../ui/Metric';

const SyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18.5L20 20M20 4l-1.5 1.5A9 9 0 003.5 18.5L4 20" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const PriorityBadge: React.FC<{ priority?: CoursePriority }> = ({ priority }) => {
    if (!priority) return null;
    const colors = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority]}`}>{priority}</span>;
}

const Development: React.FC = () => {
    const { people, developmentPlans, courses, skills, syncBadges } = useSkillsData();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingCourse, setEditingCourse] = useState<{planId: number, course: DevelopmentPlanCourse} | null>(null);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            syncBadges();
            setIsSyncing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };
    
    const hubStats = useMemo(() => {
        const activePlans = developmentPlans.filter(p => p.status !== 'Completed');
        const totalCourses = activePlans.reduce((sum, plan) => sum + plan.courses.length, 0);
        const completedCourses = activePlans.reduce((sum, plan) => sum + plan.courses.filter(c => c.status === 'Completed').length, 0);
        const overdueCourses = activePlans.reduce((sum, plan) => {
            return sum + plan.courses.filter(c => c.status === 'Assigned' && c.dueDate && new Date(c.dueDate) < new Date()).length;
        }, 0);

        const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
        
        return {
            activePlans: activePlans.length,
            completionRate: `${completionRate}%`,
            totalCourses,
            overdueCourses
        };
    }, [developmentPlans]);

    const plansWithDetails = useMemo(() => {
        return people
            .map(person => {
                const personPlans = developmentPlans.filter(dp => dp.person_id === person.person_id && dp.status !== 'Completed');
                if (personPlans.length === 0) return null;

                return {
                    person,
                    plans: personPlans.map(plan => ({
                        ...plan,
                        courseDetails: plan.courses.map(pc => {
                            const courseInfo = courses.find(c => c.course_id === pc.course_id);
                            const isOverdue = pc.status === 'Assigned' && pc.dueDate && new Date(pc.dueDate) < new Date();
                            return {
                                ...pc,
                                title: courseInfo?.title || 'Unknown Course',
                                skillName: skills.find(s => s.skill_id === courseInfo?.provides_skill_id)?.name || 'Unknown Skill',
                                isOverdue,
                            };
                        })
                    }))
                };
            })
            .filter((p): p is { person: Person, plans: any[] } => p !== null);
    }, [people, developmentPlans, courses, skills]);

    return (
        <>
            <div className="space-y-8">
                <Card title="Talent Development Hub Overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Metric label="Active Plans" value={hubStats.activePlans} icon={<ListIcon />} />
                        <Metric label="Overall Completion" value={hubStats.completionRate} icon={<CheckCircleIcon />} />
                        <Metric label="Total Courses Assigned" value={hubStats.totalCourses} icon={<ListIcon />} />
                        <Metric label="Overdue Courses" value={hubStats.overdueCourses} icon={<ExclamationIcon />} />
                    </div>
                </Card>
                
                <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                    <h3 className="text-lg font-bold text-primary">Automated Progress Tracking</h3>
                    <p className="mt-2 text-medium text-sm">Sync with the microcredentials platform to automatically update employee profiles and development plans based on newly earned Open Badges.</p>
                    <button 
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className="mt-4 inline-flex items-center px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
                    >
                        <SyncIcon />
                        {isSyncing ? 'Syncing...' : 'Sync Employee Badges'}
                    </button>
                    {showSuccess && <p className="text-green-600 font-semibold mt-2 text-sm">Sync successful! Profiles updated.</p>}
                </div>

                <Card title="Individual Development Timelines">
                    <div className="space-y-6">
                        {plansWithDetails.length > 0 ? plansWithDetails.map(({ person, plans }) => (
                            <div key={person.person_id}>
                                <h4 className="font-bold text-dark text-lg">{person.name}'s Development Plan</h4>
                                {plans.map(plan => (
                                    <div key={plan.plan_id} className="mt-2 w-full overflow-x-auto pb-4">
                                        <div className="inline-flex space-x-4 p-2">
                                            {plan.courseDetails.map((course: any) => {
                                                const isCompleted = course.status === 'Completed';
                                                const cardBase = "w-64 flex-shrink-0 p-4 rounded-xl shadow-lg border-b-4 transition-all duration-300 transform hover:-translate-y-1";
                                                const cardColor = isCompleted
                                                    ? "bg-green-500 border-green-700 text-white"
                                                    : "bg-white border-gray-300";
                                                const overdueStyle = course.isOverdue ? '!border-red-500 ring-2 ring-red-500/50' : '';
                                                
                                                return (
                                                <div key={course.course_id} className={`${cardBase} ${cardColor} ${overdueStyle}`}>
                                                    <div className="flex justify-between items-start">
                                                        <h5 className={`font-bold ${isCompleted ? 'text-white' : 'text-dark'}`}>{course.title}</h5>
                                                        <button onClick={() => setEditingCourse({ planId: plan.plan_id, course })} className={`p-1 rounded-md ${isCompleted ? 'text-white/70 hover:bg-white/20' : 'text-gray-400 hover:bg-gray-200/50'}`} title="Edit course details">
                                                          <EditIcon />
                                                        </button>
                                                    </div>
                                                    <p className={`text-xs mt-1 ${isCompleted ? 'text-green-100' : 'text-medium'}`}>Provides: {course.skillName}</p>
                                                    
                                                    <div className="mt-3 space-y-2 text-xs">
                                                        <div className="flex items-center space-x-2">
                                                          <PriorityBadge priority={course.priority} />
                                                          {course.dueDate && <span className={`flex items-center ${isCompleted ? 'text-green-100' : 'text-medium'} ${course.isOverdue ? 'font-bold text-red-600' : ''}`}><ClockIcon className="mr-1" /> Due: {new Date(course.dueDate).toLocaleDateString()}</span>}
                                                        </div>
                                                        {course.managerNotes && <p className={`italic border-l-2 pl-2 ${isCompleted ? 'text-green-100 border-green-300' : 'text-gray-600 border-gray-300'}`}>Note: {course.managerNotes}</p>}
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )) : <p className="text-center text-medium p-8">No active development plans found.</p>}
                    </div>
                </Card>
            </div>
            <EditPlanCourseModal
                editingInfo={editingCourse}
                onClose={() => setEditingCourse(null)}
            />
        </>
    );
};

export default Development;