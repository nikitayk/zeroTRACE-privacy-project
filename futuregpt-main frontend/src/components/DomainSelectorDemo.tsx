import React from 'react';
import DomainSelector from './DomainSelector';

const DomainSelectorDemo: React.FC = () => {
  const handleDomainSelect = (domainId: string) => {
    console.log('Selected domain:', domainId);
    // In a real app, this would navigate to the learning interface
    alert(`Starting learning session for ${domainId}!`);
  };

  const handleBack = () => {
    console.log('Going back...');
    // In a real app, this would navigate back
    alert('Going back to previous screen');
  };

  return (
    <div className="w-full h-full">
      <DomainSelector 
        onDomainSelect={handleDomainSelect}
        onBack={handleBack}
      />
    </div>
  );
};

export default DomainSelectorDemo;
