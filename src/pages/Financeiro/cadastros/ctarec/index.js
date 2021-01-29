/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { format, parse } from 'date-fns';
import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaFolderPlus,
  FaUserTie,
  FaMoneyCheckAlt,
  FaFileSignature,
} from 'react-icons/fa';
import moment from 'moment';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import TextArea from '~/componentes/TextArea';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import {
  a11yProps,
  maskDecimal,
  GridCurrencyFormatter,
  maskCNPJCPF,
  toDecimal,
  RetirarMascara,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  Linha,
} from '~/pages/general.styles';

export default function FINA9() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-1, 'day'));
  const [dataFin, setDataFin] = useState(moment().add(30, 'day'));
  const [optGrpRec, setOptGrprec] = useState([]);
  const [cliente, setCliente] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'TITULOS EM ABERTO' },
    { value: '2', label: 'TITULOS BAIXADO' },
    { value: '3', label: 'TITULOS CANCELADOS' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE EMISSAO' },
    { value: '2', label: 'DATA VENCIMENTO' },
    { value: '3', label: 'DATA BAIXA' },
  ];

  const loadOptionsRepresentante = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function handleGrupoRec() {
    try {
      const response = await api.get(`v1/combos/agrupador_recdesp/1/2`);
      const dados = response.data.retorno;
      if (dados) {
        setOptGrprec(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao gerar referencia agrupadora \n${error}`,
        toastOptions
      );
    }
  }

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 24) {
          // setOptBanco(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    chq_bco_id: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1');
    history.go(0);
  }

  // listar contas a receber
  async function listarCtaRec() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();

      const url = `v1/fina/ctarec/listar?cli_id=${
        formPesq.pesq_rec_cli_id || ''
      }&situacao=${formPesq.pesq_rec_situacao}&data_ini=${moment(
        dataIni
      ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
        'YYYY-MM-DD'
      )}&rec_id=${formPesq.pesq_rec_id}&tpData=${formPesq.pesq_data || '1'}`;

      const response = await api.get(url);

      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar contas\n${error}`);
    }
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('chq_id', '');
  };

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      setValueTab(newValue);
    } else if (newValue === 1) {
      setValueTab(newValue);
    }
  };

  useEffect(() => {
    frmPesquisa.current.setFieldValue('pesq_data', '1');
    handleGrupoRec();
    comboGeral(24);
    listarCtaRec();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'rec_id',
      headerName: 'Nº TITULO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'rec_documento',
      headerName: 'DOCUMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'rec_data_emissao',
      headerName: 'DATA EMISSÃO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_data_baixa',
      headerName: 'DATA BAIXA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_situacao',
      headerName: 'SITUAÇÃO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },

    {
      field: 'rec_vlr_liquido',
      headerName: 'VLR LIQUIDO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_saldo',
      headerName: 'SALDO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="EXECUTAR PESQUISA" placement="left">
          <button type="button" onClick={async () => listarCtaRec()}>
            <FaSearch size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={null}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={null}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ABRIR BORDERÔ DE CHEQUE" placement="left">
          <button type="button" onClick={() => null}>
            <FaMoneyCheckAlt size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="ABRIR CADASTRO DE CLIENTES" placement="left">
          <button type="button" onClick={null}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO - TITULOS DO CONTAS A RECEBER</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <AppBar position="static" color="default">
            <Tabs
              style={{ marginTop: '0px' }}
              value={valueTab}
              onChange={handleChangeTab}
              variant="scrollable"
              scrollButtons="on"
              indicatorColor="primary"
              textColor="primary"
            >
              <BootstrapTooltip
                title="CONSULTAR TITULOS CADASTRADO"
                placement="top-start"
              >
                <Tab
                  label="TELA DE CONSULTA"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRO DE TITULOS DO CONTAS A RECEBER"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="TELA DE CADASTRO"
                  {...a11yProps(1)}
                  icon={<FaFileSignature size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>CONSULTAR TITULOS CADASTRADOS</h1>
                <BoxItemCad fr="2fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_rec_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={cliente}
                      onChange={(c) => setCliente(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nº LANÇAMENTO</label>
                    <Input
                      type="text"
                      name="pesq_rec_id"
                      placeholder="Nº Lanc."
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situacao"
                      name="pesq_rec_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="filtrar por"
                      name="pesq_data"
                      optionsList={optDATA}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataIni(new Date(date))}
                      value={dataIni}
                      label="Data Inicial:"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataFin(new Date(date))}
                      value={dataFin}
                      label="Data Final:"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnPesquisa}
                      rowData={gridPesquisa}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      onSelectionChanged={handleSelectGridPesquisa}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>CADASTRO DE CHEQUE</h1>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO DE CHEQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
