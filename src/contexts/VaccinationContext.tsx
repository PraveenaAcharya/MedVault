import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';

interface Vaccination {
  id: string;
  name: string;
  verified: boolean;
  verificationDate?: string;
  issuer?: string;
}

interface VaccinationContextType {
  vaccinations: Vaccination[];
  verifiedCount: number;
  isVerified: boolean;
  verifyVaccination: (vaccinationId: string, issuer?: string) => void;
}

const VaccinationContext = createContext<VaccinationContextType | undefined>(undefined);

const REQUIRED_VACCINES = [
  'Chickenpox (Varicella)',
  'COVID-19',
  'Dengue',
  'Diphtheria',
  'Flu (Influenza)',
  'Hepatitis A',
  'Hepatitis B',
  'Hib',
  'HPV',
  'Measles',
  'Meningococcal',
  'Mpox',
  'Mumps',
  'Pneumococcal',
  'Polio',
  'Rotavirus',
  'RSV',
  'Rubella',
  'Shingles',
  'Tetanus',
  'Whooping Cough'
];

export const VaccinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account } = useWeb3();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);

  useEffect(() => {
    if (account) {
      // Initialize vaccinations list
      const initialVaccinations = REQUIRED_VACCINES.map(name => ({
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        verified: false
      }));
      setVaccinations(initialVaccinations);
    }
  }, [account]);

  const verifyVaccination = (vaccinationId: string, issuer: string = 'Govt. Portal') => {
    setVaccinations(prev => 
      prev.map(vacc => 
        vacc.id === vaccinationId 
          ? { ...vacc, verified: true, verificationDate: new Date().toISOString(), issuer }
          : vacc
      )
    );
  };

  const verifiedCount = vaccinations.filter(v => v.verified).length;
  const isVerified = verifiedCount >= REQUIRED_VACCINES.length;

  return (
    <VaccinationContext.Provider value={{ 
      vaccinations, 
      verifiedCount, 
      isVerified, 
      verifyVaccination 
    }}>
      {children}
    </VaccinationContext.Provider>
  );
};

export const useVaccination = () => {
  const context = useContext(VaccinationContext);
  if (context === undefined) {
    throw new Error('useVaccination must be used within a VaccinationProvider');
  }
  return context;
}; 