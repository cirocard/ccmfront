import React, { useEffect } from 'react';

// import { Container } from './styles';

export default function FINA1() {
  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>DASHBOARD FINANCEIRO</h1>
    </div>
  );
}
