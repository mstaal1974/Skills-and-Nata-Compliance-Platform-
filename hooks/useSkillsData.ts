
import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export const useSkillsData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useSkillsData must be used within a DataProvider');
  }
  return context;
};
