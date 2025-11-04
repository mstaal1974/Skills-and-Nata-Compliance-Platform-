
import React, { useState } from 'react';
import Dashboard from './components/tabs/Dashboard';
import People from './components/tabs/People';
import Occupations from './components/tabs/Occupations';
import Development from './components/tabs/Development';
import Analysis from './components/tabs/Analysis';
import Reports from './components/tabs/Reports';
import ComplianceDashboard from './components/tabs/ComplianceDashboard';
import Departments from './components/tabs/Departments';
import NataManagement from './components/tabs/NataManagement';
import ProfileModal from './components/common/ProfileModal';
import { PersonFilter } from './types';
import ProjectReadiness from './components/tabs/ProjectReadiness';
import VerifiedCompetency from './components/tabs/VerifiedCompetency';

type Tab = "Dashboard" | "Compliance" | "People" | "Occupations" | "Departments" | "Development" | "Analysis" | "Reports" | "NATA Management" | "Project Readiness" | "Verified Competency";

const TABS: Tab[] = ["Dashboard", "Compliance", "People", "Occupations", "Departments", "NATA Management", "Development", "Analysis", "Reports", "Project Readiness", "Verified Competency"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [initialPeopleFilter, setInitialPeopleFilter] = useState<PersonFilter | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const handleHeatmapClick = (skillId: number, group: string, viewBy: 'By Job' | 'By Department') => {
    setInitialPeopleFilter({ skillId, group, viewBy });
    setActiveTab("People");
  };

  const clearInitialFilter = () => {
    setInitialPeopleFilter(null);
  };
  
  const openProfile = (personId: number) => {
    setSelectedProfileId(personId);
  };

  return (
    <div className="min-h-screen text-dark">
      <header className="bg-white/60 backdrop-blur-xl sticky top-0 z-40 w-full border-b border-white/30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-primary">Skills & NATA Compliance Platform</h1>
          </div>
          <nav>
            <ul className="flex -mb-px overflow-x-auto">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <li key={tab} className="mr-2 flex-shrink-0">
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={`relative inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-4 transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? 'text-primary border-primary shadow-primary-glow'
                          : 'text-medium border-transparent hover:text-dark hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-screen-xl mx-auto py-10 sm:px-6 lg:px-8">
        {activeTab === 'Dashboard' && <Dashboard onHeatmapClick={handleHeatmapClick} />}
        {activeTab === 'Compliance' && <ComplianceDashboard onOpenProfile={openProfile} />}
        {activeTab === 'People' && <People initialFilter={initialPeopleFilter} onFilterApplied={clearInitialFilter} onOpenProfile={openProfile} />}
        {activeTab === 'Occupations' && <Occupations />}
        {activeTab === 'Departments' && <Departments />}
        {activeTab === 'NATA Management' && <NataManagement onOpenProfile={openProfile}/>}
        {activeTab === 'Development' && <Development />}
        {activeTab === 'Analysis' && <Analysis />}
        {activeTab === 'Reports' && <Reports />}
        {activeTab === 'Project Readiness' && <ProjectReadiness />}
        {activeTab === 'Verified Competency' && <VerifiedCompetency />}
      </main>
      <ProfileModal personId={selectedProfileId} onClose={() => setSelectedProfileId(null)} />
    </div>
  );
};

export default App;
