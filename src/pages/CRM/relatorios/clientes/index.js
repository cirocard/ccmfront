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
import { ApiService, ApiTypes } from '~/services/api';

registerLocale('pt', pt);

export default function Crm7() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const { params } = useRouteMatch();
  const [loading, setLoading] = useState(false);
  const [openRelCliente, setOpenRelCliente] = useState(false);
  const [openRelClienteSemVenda, setOpenRelClienteSemVenda] = useState(false);
  const [titleRel, setTitleRel] = useState('');
  const [dataIni, setDataIni] = useState(new Date());
  const [dataFin, setDataFin] = useState(new Date());
  const [ordem, setOrdem] = useState('mx.cp_datacad desc');

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

  const optOrdemRelClienteSemVenda = [
    {
      value: 'c.cli_datacad desc',
      label: 'Cadastro do Cliente (descrescente)',
    },
    { value: 'c.cli_datacad asc', label: 'Cadastro do Cliente (crescente)' },
    { value: 'c.cli_razao_social', label: 'Cliente - Ordem alfabética' },
    { value: 'mx.cp_datacad desc', label: 'Data do Pedido (descrescente)' },
    { value: 'mx.cp_datacad asc', label: 'Data do Pedido (crescente)' },
    { value: 'mx.cp_vlr_nf desc', label: 'Valor do Pedido (decrescente)' },
  ];

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }
  // listagem de clientes
  async function handlePrint() {
    try {
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
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao alterar quantidade: ${err}`, toastOptions);
    }
  }

  // clientes sem venda
  async function handlePrintRel2() {
    try {
      setLoading(true);
      let perfil = `'2', '3'`;
      if (document.getElementById('r2rbTodos').checked) perfil = `'2', '3'`;
      if (document.getElementById('r2rbConsignado').checked) perfil = `'3'`;
      if (document.getElementById('r2rbPrevenda').checked) perfil = `'2'`;

      const response = await api.get(
        `v1/crm/report/rel_cliente_sem_venda?database=${format(
          dataIni,
          'yyyy-MM-dd'
        )}&ordem=${ordem}&perfil=${perfil}`
      );
      const link = response.data;
      setLoading(false);
      window.open(link, '_blank');
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao alterar quantidade: ${err}`, toastOptions);
    }
  }

  useEffect(() => {
    if (params.tipo === 'clientes') {
      setTitleRel('RELATÓRIO GERENCIAL DE CLIENTES');
      setOpenRelCliente(true);
    } else if (params.tipo === 'semvenda') {
      setTitleRel('RELATÓRIO CLIENTES VS ULTIMA COMPRA');
      setOpenRelClienteSemVenda(true);
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

      {/* relatorio listagem de clientes */}
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

      {/* relatorio clientes sem venda */}
      <Slide direction="down" in={openRelClienteSemVenda}>
        <Dialog
          open={openRelClienteSemVenda}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenRelClienteSemVenda(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>{titleRel}</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button
                type="button"
                onClick={() => setOpenRelClienteSemVenda(false)}
              >
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <label>Data Base</label>
                <DatePicker
                  selected={dataIni}
                  className="input_cad"
                  locale="pt"
                  name="r2DataBase"
                  onChange={(date) => setDataIni(date)}
                  dateFormat="dd/MM/yyy"
                  todayButton="Hoje"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Ordenar Por</label>
                <Select
                  id="r2Ordenar"
                  options={optOrdemRelClienteSemVenda}
                  value={optOrdemRelClienteSemVenda.filter(
                    (obj) => obj.value === ordem
                  )}
                  onChange={(e) => setOrdem(e ? e.value : 'c.cli_razao_social')}
                  placeholder="Informe"
                />
              </AreaComp>
            </BoxItemCad>

            <h1>Filtros adicionais</h1>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input type="radio" id="r2rbTodos" name="radio" value="1" />
                  <label htmlFor="r2rbTodos">Considerar todos os pedidos</label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="radio"
                    id="r2rbConsignado"
                    name="radio"
                    value="2"
                  />
                  <label htmlFor="r2rbConsignado">Pedidos Consignados</label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="10px">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="radio"
                    id="r2rbPrevenda"
                    name="radio"
                    value="3"
                  />
                  <label htmlFor="r2rbPrevenda">Pedidos Pré Venda</label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <Linha />
            <BoxItemCadNoQuery fr="1fr" ptop="10px" just="center">
              <DivLimitadorRow>
                <DivLimitador wd="170px">
                  <button
                    type="button"
                    className="btn2"
                    onClick={handlePrintRel2}
                  >
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
