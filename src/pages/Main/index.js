import React, { useEffect } from 'react';

// import { Container } from './styles';

export default function Main() {
  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>pagina main</h1>
    </div>
  );
}
