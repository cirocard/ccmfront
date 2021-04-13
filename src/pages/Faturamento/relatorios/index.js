import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useRouteMatch } from 'react-router-dom';
import Popup from '~/componentes/Popup';
import { Container, Content, ToolBar } from './styles';
import { TitleBar } from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import BC_COMISSAO from '~/pages/Faturamento/relatorios/comissao';
import VENDA_PRODUTO from '~/pages/Faturamento/relatorios/vendaProduto';

export default function FAT5() {
  const { params } = useRouteMatch();
  const [dlgBcComissao, setDlgBcComissao] = useState(false);
  const [dlgVendProduto, setDlgVendProduto] = useState(false);

  function handleDashboard() {
    history.push('/fat1', '_blank');
    history.go(0);
  }
  /*
   rel1:  relatório entrada por produto
  */
  useEffect(() => {
    if (params.tipo === 'rel1') {
      setDlgBcComissao(true);
    } else if (params.tipo === 'rel2') {
      setDlgVendProduto(true);
    }
  }, []);

  return (
    <>
      <ToolBar />
      <Container id="pgReport">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>RELATÓRIOS MÓDULO FATURAMENTO</h1>
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
        isOpen={dlgBcComissao}
        closeDialogFn={() => {
          history.push('/fat1', '_blank');
          history.go(0);
        }}
        title="RELATÓRIO BASE DE CÁLCULO PARA COMISSÕES"
        size="sm"
      >
        <BC_COMISSAO />
      </Popup>

      {/* popup RELATÓRIO VENDAS POR PRODUTO... */}
      <Popup
        isOpen={dlgVendProduto}
        closeDialogFn={() => {
          history.push('/fat1', '_blank');
          history.go(0);
        }}
        title="RELATÓRIO DE VENDAS POR PRODUTO"
        size="sm"
      >
        <VENDA_PRODUTO />
      </Popup>
    </>
  );
}
