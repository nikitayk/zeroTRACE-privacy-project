import React, { useEffect } from 'react';
import './studyStyles.css';

type Props = { onClose?: () => void };

const StudyPlan: React.FC<Props> = () => {
  useEffect(() => {
    let cleanup = () => {};

    (async () => {
      try {
        await import('./studyInterface.js');
        cleanup = () => {
          const el = document.getElementById('study-interface');
          if (el && el.parentElement) {
            el.parentElement.removeChild(el);
          }
        };
      } catch (e) {
        console.error('Failed to initialize Study Interface:', e);
      }
    })();

    return () => {
      try { cleanup(); } catch {}
    };
  }, []);

  return <div id="zt-study-host" style={{ display: 'contents' }} />;
};

export default StudyPlan;


