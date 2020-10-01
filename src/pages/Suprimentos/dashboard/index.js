import React, { useEffect } from 'react';

// import { Container } from './styles';

export default function SUPR1() {
  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>DASHBOARD SUPRIMENTOS</h1>
    </div>
  );
}
