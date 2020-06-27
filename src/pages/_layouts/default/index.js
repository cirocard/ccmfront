import React from 'react';
import PropTypes from 'prop-types';
import WindowSizeListener from 'react-window-size-listener';
import Header from '~/componentes/Header';
import { Content, Wrapper } from './styles';

export default function DefaultLayout({ children }) {
  const [Altura, setAltura] = React.useState(0);
  return (
    <>
      <Wrapper>
        <WindowSizeListener
          onResize={(windowSize) => {
            setAltura(windowSize.windowHeight - 67);
          }}
        />
        <Header />
        <Content altura={Altura}>{children}</Content>
      </Wrapper>
    </>
  );
}

DefaultLayout.propTypes = {
  children: PropTypes.element.isRequired,
};
