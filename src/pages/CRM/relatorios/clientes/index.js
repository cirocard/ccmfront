import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdClose, MdPrint } from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import { useRouteMatch } from 'react-router-dom';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt';
import { format } from 'date-fns';
import { Container, Content, ToolBar } from './styles';
import DialogInfo from '~/componentes/DialogInfo';

import {
  TitleBar,
  AreaComp,
  CCheck,
  BoxItemCad,
  BoxItemCadNoQuery,
  Linha,
  CModal,
  DivLimitador,
  DivLimitadorRow,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import api from '~/services/api';

registerLocale('pt', pt);

export default function Crm7() {
  const { params } = useRouteMatch();
  const [loading, setLoading] = useState(false);
  const [openRelCliente, setOpenRelCliente] = useState(false);
  const [titleRel, setTitleRel] = useState('');
  const [dataIni, setDataIni] = useState(new Date());
  const [dataFin, setDataFin] = useState(new Date());
  const [ordem, setOrdem] = useState('');

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optOrdemRelCliente = [
    { value: 'cli_razao_social', label: 'Ordem alfabética (Razão Social)' },
    {
      value: 'cli_datacad',
      label: 'Data de Cadastro (mais recente -> mais antigo)',
    },
  ];

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  async function handlePrint() {
    setLoading(true);
    let email = false;
    let fone = false;
    const todos = document.getElementById('rbTodos').checked;
    if (!todos) {
      email = document.getElementById('rbEmail').checked;
      fone = document.getElementById('rbFone').checked;
    }
    const prm = {
      emp_id: '',
      data_ini: format(dataIni, 'yyyy-MM-dd HH:mm:ss'),
      data_fin: format(dataFin, 'yyyy-MM-dd HH:mm:ss'),
      possui_email: email,
      possui_fone: fone,
      ordem,
    };

    const response = await api.post('v1/crm/report/lista_clientes', prm);
    const link = response.data;
    setLoading(false);
    window.open(link, '_blank');
  }

  useEffect(() => {
    if (params.tipo === 'clientes') {
      setTitleRel('RELATÓRIO GERENCIAL DE CLIENTES');

      setOpenRelCliente(true);
    }
  }, []);

  return (
    <>
      <ToolBar />
      <Container id="pgReport">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>CRM - RELATÓRIOS</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content />
      </Container>

      {/* popup tela de cadastro */}
      <Slide direction="down" in={openRelCliente}>
        <Dialog
          open={openRelCliente}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenRelCliente(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>{titleRel}</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenRelCliente(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <label>Data Inicial</label>
                <DatePicker
                  selected={dataIni}
                  className="input_cad"
                  locale="pt"
                  name="data_ini"
                  onChange={(date) => setDataIni(date)}
                  dateFormat="dd/MM/yyy"
                  todayButton="Hoje"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Data Final</label>
                <DatePicker
                  selected={dataFin}
                  className="input_cad"
                  locale="pt"
                  name="data_fin"
                  onChange={(date) => setDataFin(date)}
                  dateFormat="dd/MM/yyy"
                  todayButton="Hoje"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Ordenar Por</label>
                <Select
                  id="ordenar"
                  options={optOrdemRelCliente}
                  onChange={(e) => setOrdem(e ? e.value : '0')}
                  placeholder="Informe"
                />
              </AreaComp>
            </BoxItemCadNoQuery>
            <h1>Filtros adicionais</h1>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input type="radio" id="rbTodos" name="radio" value="1" />
                  <label htmlFor="rbTodos">Exibir todos os cadastros</label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input type="radio" id="rbEmail" name="radio" value="2" />
                  <label htmlFor="rbEmail">
                    Exibir somente cadastros com e-mail informado
                  </label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input type="radio" id="rbFone" name="radio" value="3" />
                  <label htmlFor="rbFone">
                    Exibir somente cadastros com telefone informado
                  </label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <Linha />
            <BoxItemCadNoQuery fr="1fr" ptop="10px" just="center">
              <DivLimitadorRow>
                <DivLimitador wd="170px">
                  <button type="button" className="btn2" onClick={handlePrint}>
                    {loading ? 'Aguarde Processando...' : 'Gerar Relatório'}
                    <MdPrint size={20} color="#fff" />
                  </button>
                </DivLimitador>
              </DivLimitadorRow>
            </BoxItemCadNoQuery>
          </CModal>
        </Dialog>
      </Slide>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="RELATÓRIOS..."
        message="Aguarde Processamento..."
      />
    </>
  );
}
