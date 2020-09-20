import React, { useEffect } from 'react';

// import { Container } from './styles';

export default function FAT1() {
  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>DASHBOARD FATURAMENTO</h1>
    </div>
  );
}
