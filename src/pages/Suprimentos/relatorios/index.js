import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useRouteMatch } from 'react-router-dom';
import Popup from '~/componentes/Popup';
import { Container, Content, ToolBar } from './styles';
import { TitleBar } from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import REL_ENTRADA_PRODUTO from '~/pages/Suprimentos/relatorios/entradaproduto';

export default function SUPR9() {
  const { params } = useRouteMatch();
  const [dlgEntProduto, setDlgEntProduto] = useState(false);

  function handleDashboard() {
    history.push('/supr1', '_blank');
    history.go(0);
  }
  /*
   rel1:  relatório entrada por produto
  */
  useEffect(() => {
    if (params.tipo === 'rel1') {
      setDlgEntProduto(true);
    }
  }, []);

  return (
    <>
      <ToolBar />
      <Container id="pgReport">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>SUPRIMENTOS (ESTOQUE) - RELATÓRIOS</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content />
      </Container>

      {/* popup RELATÓRIO ENTRADA POR PRODUTO... */}
      <Popup
        isOpen={dlgEntProduto}
        closeDialogFn={() => {
          history.push('/supr1', '_blank');
          history.go(0);
        }}
        title="RELATÓRIO DE ENTRADA POR PRODUTO"
        size="md"
      >
        <REL_ENTRADA_PRODUTO />
      </Popup>
    </>
  );
}
