import React, { useEffect, useState } from 'react';
import { FaPagelines, FaCubes } from 'react-icons/fa';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { Container, ToolBar } from './styles';
import { Scroll, DivLimitador } from '~/pages/general.styles';
import Popup from '~/componentes/Popup';
import CONSULTA_PRODUTO from '~/pages/Suprimentos/cadastros/produto/consulta';

export default function SUPR1() {
  const [dlgConsProduto, setDlgConsProduto] = useState(false);

  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="CONSULTA RÁPIDA DE PRODUTOS" placement="right">
          <button type="button" onClick={() => setDlgConsProduto(true)}>
            <FaPagelines size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip
          title="ACESSAR CADASTRO DE PRODUTOS"
          placement="right"
        >
          <button type="button" onClick={() => window.open('/supr4', '_blank')}>
            <FaCubes size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
      </ToolBar>
      <Container>
        <Scroll />
      </Container>

      {/* popup para consulta de produtos... */}
      <Popup
        isOpen={dlgConsProduto}
        closeDialogFn={() => {
          setDlgConsProduto(false);
        }}
        title="CONSULTA RÁPIDA DE PRODUTOS"
        size="lg"
      >
        <CONSULTA_PRODUTO />
      </Popup>
    </>
  );
}
