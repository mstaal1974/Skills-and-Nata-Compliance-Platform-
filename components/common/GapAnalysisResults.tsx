import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Skill, Person } from '../../types';
import { useSkillsData } from '../../hooks/useSkillsData';

interface GapAnalysisResultsProps {
  analysis: {
    matchingSkills: Skill[];
    skillGaps: Skill[];
    matchPercentage: number;
  };
  personId: number;
  onAssignAll: (personId: number, skillGaps: Skill[]) => void;
  setToastMessage: (message: string) => void;
}

const COLORS = ['#6366F1', '#E5E7EB'];

const GapAnalysisResults: React.FC<GapAnalysisResultsProps> = ({ analysis, personId, onAssignAll, setToastMessage }) => {
  const { matchingSkills, skillGaps, matchPercentage } = analysis;
  const { courses, createDevelopmentPlan, people } = useSkillsData();
  const person = people.find(p => p.person_id === personId);

  const chartData = [
    { name: 'Match', value: matchPercentage },
    { name: 'Gap', value: 100 - matchPercentage },
  ];

  const handleAssignCourse = (courseId: number) => {
    if (person) {
      createDevelopmentPlan(person.person_id, [courseId]);
      setToastMessage(`Development plan updated for ${person.name}.`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mt-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-full md:w-1/3 h-48 relative">
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
              </filter>
            </defs>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              filter="url(#shadow)"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(200, 200, 200, 0.5)',
                borderRadius: '1rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">{matchPercentage}%</div>
      </div>
      <div className="w-full md:w-2/3 space-y-4">
        <div>
          <h4 className="font-semibold text-green-600">Matching Skills ({matchingSkills.length})</h4>
          {matchingSkills.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-medium">{matchingSkills.map(s => <li key={s.skill_id}>{s.name}</li>)}</ul>
          ) : (
            <p className="text-sm text-medium">No matching skills found.</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-red-600">Skill Gaps ({skillGaps.length})</h4>
            {skillGaps.length > 0 && (
              <button
                onClick={() => onAssignAll(personId, skillGaps)}
                className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-md hover:bg-secondary/20 transition-colors font-semibold"
              >
                Assign All to Plan
              </button>
            )}
          </div>
          {skillGaps.length > 0 ? (
            <div className="space-y-3 mt-2">
              {skillGaps.map(s => {
                const recommendedCourse = courses.find(c => c.provides_skill_id === s.skill_id);
                return (
                  <div key={s.skill_id} className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">{s.name}</span>
                        {recommendedCourse && (
                             <button onClick={() => handleAssignCourse(recommendedCourse.course_id)} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors font-semibold">Assign</button>
                        )}
                    </div>
                    {recommendedCourse ? (
                        <p className="text-xs text-medium mt-1">
                            Recommended Training: <span className="font-semibold">{recommendedCourse.title}</span>
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">No training course found for this skill.</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-medium mt-2">No skill gaps identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GapAnalysisResults;