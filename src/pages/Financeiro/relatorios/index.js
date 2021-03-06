import React, { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useRouteMatch } from 'react-router-dom';
import Popup from '~/componentes/Popup';
import { Container, Content, ToolBar } from './styles';
import { TitleBar } from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import REL_CHEQUE from '~/pages/Financeiro/relatorios/cheque/cheque';
import REL_CTAREC from '~/pages/Financeiro/relatorios/titulos';

export default function FINA7() {
  const { params } = useRouteMatch();
  const [dlgCheque, setDlgCheque] = useState(false);
  const [dlgCtarec, setDlgCtarec] = useState(false);
  function handleDashboard() {
    history.push('/fina1', '_blank');
    history.go(0);
  }

  useEffect(() => {
    if (params.tipo === 'cheque') {
      setDlgCheque(true);
    } else if (params.tipo === 'receber') {
      setDlgCtarec(true);
    }
  }, []);

  return (
    <>
      <ToolBar />
      <Container id="pgReport">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>FINANCEIRO - RELATÓRIOS</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content />
      </Container>

      {/* popup RELATÓRIO DE CHEQUE... */}
      <Popup
        isOpen={dlgCheque}
        closeDialogFn={() => {
          history.push('/fina1', '_blank');
          history.go(0);
        }}
        title="RELATÓRIO DE CHEQUES CADASTRADO"
        size="md"
      >
        <REL_CHEQUE />
      </Popup>

      {/* popup RELATÓRIO TITULOS CONTAS A RECEBER... */}
      <Popup
        isOpen={dlgCtarec}
        closeDialogFn={() => {
          history.push('/fina1', '_blank');
          history.go(0);
        }}
        title="RELATÓRIO TITULOS DO CONTAS A RECEBER"
        size="sm"
      >
        <REL_CTAREC tipo="R" />
      </Popup>
    </>
  );
}
