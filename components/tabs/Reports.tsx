import React, { useState, useMemo } from 'react';
import { useSkillsData } from '../../hooks/useSkillsData';
import Card from '../ui/Card';
import NataReportPreview from '../common/NataReportPreview';
import LerReportPreview from '../common/LerReportPreview';
import NataAuditDossierPreview from '../common/NataAuditDossierPreview';

type ExportType = 'LER Export' | 'NATA Skills Profile' | 'NATA Audit Dossier' | '';

const Reports: React.FC = () => {
  const { people, departments } = useSkillsData();
  const [exportType, setExportType] = useState<ExportType>('');
  const [target, setTarget] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const targetOptions = useMemo(() => {
    if (exportType === 'LER Export') {
        return [
            { label: '--- Individuals ---', value: '', disabled: true },
            ...people.map(p => ({ value: p.person_id.toString(), label: p.name })),
            { label: '--- Departments ---', value: '', disabled: true },
            ...departments.map(d => ({ value: `dept-${d.department_id}`, label: d.name }))
        ];
    }
    if (exportType === 'NATA Skills Profile' || exportType === 'NATA Audit Dossier') {
        const technicians = people.filter(p => p.isTechnician);
        return technicians.map(p => ({ value: p.person_id.toString(), label: p.name }));
    }
    return [];
  }, [exportType, people, departments]);
  

  const handleGenerate = () => {
    if (!target) return;
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card title="Generate Reports">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="export-type" className="block text-sm font-medium text-medium mb-1">Select Report Type</label>
                        <select 
                            id="export-type" 
                            value={exportType}
                            onChange={e => {
                                setExportType(e.target.value as ExportType);
                                setTarget('');
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl"
                        >
                            <option value="" disabled>-- Select a report type --</option>
                            <option>LER Export</option>
                            <option>NATA Skills Profile</option>
                            <option>NATA Audit Dossier</option>
                        </select>
                    </div>
                    {exportType && (
                        <div>
                            <label htmlFor="target" className="block text-sm font-medium text-medium mb-1">Select Target</label>
                            <select 
                                id="target" 
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300/50 bg-white/50 shadow-inner-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl"
                            >
                                <option value="" disabled>-- Select a target --</option>
                                {targetOptions.map(opt => <option key={opt.label + opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <button 
                            onClick={handleGenerate} 
                            disabled={!target}
                            className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all hover:shadow-primary-glow"
                        >
                            Generate Export
                        </button>
                    </div>
                    {showSuccess && (
                        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-[fadeIn_0.5s_ease-out]">
                            <p className="font-semibold">Success!</p>
                            <p className="text-sm">{exportType} for {targetOptions.find(t=>t.value === target)?.label} has been generated.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="Report Preview">
                <div className="min-h-[60vh]">
                    {!target || !exportType ? (
                        <div className="flex items-center justify-center h-full text-center text-medium">
                            <p>Select a report type and target to see a preview.</p>
                        </div>
                    ) : exportType === 'NATA Skills Profile' ? (
                        <NataReportPreview technicianId={parseInt(target)} />
                    ) : exportType === 'NATA Audit Dossier' ? (
                        <NataAuditDossierPreview technicianId={parseInt(target)} />
                    ) : (
                        <LerReportPreview targetId={target} />
                    )}
                </div>
            </Card>
        </div>
    </div>
  );
};

export default Reports;