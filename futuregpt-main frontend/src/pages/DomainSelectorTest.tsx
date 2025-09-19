import React from 'react';
import DomainSelector from '../components/DomainSelector';

const DomainSelectorTest: React.FC = () => {
  const handleDomainSelect = (domainId: string) => {
    console.log('🎯 Selected domain:', domainId);
    alert(`🚀 Starting learning session for ${domainId}!`);
  };

  const handleBack = () => {
    console.log('⬅️ Going back...');
    alert('⬅️ Going back to previous screen');
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

export default DomainSelectorTest;
