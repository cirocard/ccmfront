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
  CCheck,
} from '~/pages/general.styles';

export default function FINA13() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataVencimento, setDataVencimento] = useState(moment());
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment().add(60, 'day'));
  const [optFpgto, setOptFpgto] = useState([]);
  const [optGrupoRec, setOptGrupoRec] = useState([]);
  const [optConta, setOptConta] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const ORIGEM = '5'; // movimentaçao manual

  const optOperacao = [
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
  ];

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 6) {
          setOptFpgto(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function comboGrupoReceita() {
    try {
      const response = await api.get(
        `v1/combos/agrupador_recdesp/1/2` // tipo 1 receita; 2 despesa || agrupador: 1 agrupador; 2 cadastro
      );
      const dados = response.data.retorno;
      if (dados) {
        setOptGrupoRec(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao gerar referencia agrupadora \n${error}`,
        toastOptions
      );
    }
  }

  async function comboContas() {
    try {
      const response = await api.get(`v1/combos/contas`);
      const dados = response.data.retorno;
      if (dados) {
        setOptConta(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar contas \n${error}`, toastOptions);
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

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('chq_id', '');

    setDataVencimento(new Date());
  };

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      setValueTab(newValue);
    } else if (newValue === 1) {
      setValueTab(newValue);
    }
  };

  useEffect(() => {
    comboGeral(6);
    comboGrupoReceita();
    comboContas();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'mov_id',
      headerName: 'Nº MOV.',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'operacao',
      headerName: 'OPERAÇÃO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'conta',
      headerName: 'CONTA (CAIXA/BANCO)',
      width: 250,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'mov_valor',
      headerName: 'VALOR',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'contabilizado',
      headerName: 'CONTABILIZADO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'mov_descricao',
      headerName: 'DESCRIÇÃO',
      width: 500,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
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
            <h1>CADASTRO MOVIMENTAÇÕES FINANCEIRA</h1>
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
                title="Consultar Movimentações Cadastradas"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR MOVIMENTAÇOES"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="GERENCIAR MOVIMENTAÇÕES"
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
                <h1>CONSULTAR MOVIMENTAÇÕES FINANCEIRA</h1>
                <BoxItemCad fr="1fr 1fr 1fr 2fr">
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataIni(new Date(date))}
                      value={dataIni}
                      label="Data Inicial"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataFin(new Date(date))}
                      value={dataFin}
                      label="Data Final"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo de movimento"
                      name="pesq_mov_operacao"
                      optionsList={optOperacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100" ptop="25px">
                    <CCheck>
                      <input
                        type="checkbox"
                        id="pesq_mov_contabilizado"
                        name="pesq_mov_contabilizado"
                        value="S"
                      />
                      <label htmlFor="pesq_mov_contabilizado">
                        SOMENTE MOVIMENTAÇÕES NÃO CONTABILIZADAS
                      </label>
                    </CCheck>
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
                <h1>CADASTRO DE MOVIMENTAÇÃO FINANCEIRA</h1>
                <BoxItemCad fr="1fr 2fr 4fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="mov_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Tipo de movimentação"
                      name="mov_operacao"
                      optionsList={optOperacao}
                      isClearable
                      placeholder="TIPO MOVIMENTAÇÃO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="conta contabilizadora (caixa/banco)"
                      name="mov_ct_id"
                      optionsList={optConta}
                      isClearable
                      placeholder="CONTA"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Movimentação</label>
                    <Input
                      type="text"
                      name="mov_datamov"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 3fr 3fr">
                  <AreaComp wd="100">
                    <label>valor movimentado</label>
                    <Input
                      type="text"
                      name="mov_valor"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="forma pagamento"
                      name="mov_fpgto_id"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="FORMA PAGAMENTO"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="grupo de receita"
                      name="mov_grupo_id"
                      optionsList={optGrupoRec}
                      isClearable
                      placeholder="GRUPO RECEITA"
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr">
                  <AreaComp wd="100">
                    <label>descrição</label>
                    <TextArea type="text" name="mov_descricao" rows="3" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>autor movimentação</label>
                    <Input
                      type="text"
                      name="mov_usr_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
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
        title="MOVIMENTAÇÃO FINANANCEIRA"
        message="Aguarde Processamento..."
      />
    </>
  );
}
