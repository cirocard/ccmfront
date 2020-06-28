import React, { useEffect } from 'react';

// import { Container } from './styles';

export default function Crm1() {
  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>DASHBOARD CRM</h1>
    </div>
  );
}
