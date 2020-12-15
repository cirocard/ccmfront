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
import Popup from '~/componentes/Popup';
import {
  a11yProps,
  maskDecimal,
  GridCurrencyFormatter,
  maskCNPJCPF,
  toDecimal,
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

export default function FINA6() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmPesqCheque = useRef(null);
  const frmPesqPedido = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridPedido, setGridPedido] = useState([]);
  const [gridCheque, setGridCheque] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataGridPedido, setDataGridPedido] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [optGrpRec, setOptGrprec] = useState([]);
  const [optConta, setOptCona] = useState([]);
  const [vendedor, setVendedor] = useState([]);
  const [optSituacaoCheque, setOptSituacaoCheque] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment());
  const [titleCheque, setTitleCheque] = useState(
    'CHEQUES DO BORDERÔ - SELECIONE UM PEDIDO'
  );
  const [dlgPedido, setDlgPedido] = useState(false);
  const [dlgCheque, setDlgCheque] = useState(false);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'EM ABERTO' },
    { value: '2', label: 'BAIXADO' },
    { value: '3', label: 'CANCELADO' },
  ];

  const loadOptionsRepresentante = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=23&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!isNaN(descricao)) {
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 25) {
          setOptSituacaoCheque(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

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

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    chq_bco_id: Yup.string().required('(??)'),
    chq_tipo: Yup.string().required('(??)'),
    chq_numero: Yup.number()
      .typeError('Informe um número válido')
      .required('(??)'),
    chq_cnpj_cpf_emit: Yup.string().required('(??)'),
    chq_emitente: Yup.string().required('(??)'),
    chq_valor: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1', '_blank');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const handleSelectGridPedido = (prmGridPed) => {
    const gridApi = prmGridPed.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPedido(selectedRows);
  };

  // fazer consulta das operaçoes
  async function listarCheque() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      const objPesq = {
        chq_emp_id: null,
        chq_numero: formPesq.pesq_chq_numero,
        chq_emitente: formPesq.pesq_emitente,
        chq_tipo: formPesq.pesq_chq_tipo,
        chq_situacao_id: formPesq.pesq_chq_situacao_id,
        chq_sacado_id: formPesq.pesq_chq_sacado_id,
      };
      const response = await api.post('v1/fina/cheque/listar_cheque', objPesq);
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

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('chq_id', '');
    frmCadastro.current.setFieldValue('chq_bco_id', '');
    frmCadastro.current.setFieldValue('chq_agencia', '');
    frmCadastro.current.setFieldValue('chq_conta', '');
    frmCadastro.current.setFieldValue('chq_numero', '');
    frmCadastro.current.setFieldValue('chq_cnpj_cpf_emit', '');
    frmCadastro.current.setFieldValue('chq_emitente', '');
    frmCadastro.current.setFieldValue('chq_mc7', '');
    frmCadastro.current.setFieldValue('chq_valor', '');
    frmCadastro.current.setFieldValue('chq_vencimento', '');
    frmCadastro.current.setFieldValue('chq_datacad', '');
    frmCadastro.current.setFieldValue('chq_cta_id', '');
    frmCadastro.current.setFieldValue('chq_ctap_id', '');
    frmCadastro.current.setFieldValue('chq_rec_id', '');
    frmCadastro.current.setFieldValue('chq_reci_id', '');
    frmCadastro.current.setFieldValue('chq_tipo', '');
    frmCadastro.current.setFieldValue('chq_situacao_id', '');
    frmCadastro.current.setFieldValue('chq_sacado_id', '');
    frmCadastro.current.setFieldValue('chq_observacao', '');
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'chq_id',
          dataGridPesqSelected[0].chq_id
        );

        frmCadastro.current.setFieldValue(
          'chq_agencia',
          dataGridPesqSelected[0].chq_agencia
        );

        frmCadastro.current.setFieldValue(
          'chq_conta',
          dataGridPesqSelected[0].chq_conta
        );
        frmCadastro.current.setFieldValue(
          'chq_numero',
          dataGridPesqSelected[0].chq_numero
        );
        frmCadastro.current.setFieldValue(
          'chq_cnpj_cpf_emit',
          dataGridPesqSelected[0].chq_cnpj_cpf_emit
        );
        frmCadastro.current.setFieldValue(
          'chq_emitente',
          dataGridPesqSelected[0].chq_emitente
        );
        frmCadastro.current.setFieldValue(
          'chq_mc7',
          dataGridPesqSelected[0].chq_mc7
        );
        frmCadastro.current.setFieldValue(
          'chq_valor',
          dataGridPesqSelected[0].chq_valor
        );

        frmCadastro.current.setFieldValue(
          'chq_cta_id',
          dataGridPesqSelected[0].chq_cta_id
        );
        frmCadastro.current.setFieldValue(
          'chq_ctap_id',
          dataGridPesqSelected[0].chq_ctap_id
        );
        frmCadastro.current.setFieldValue(
          'chq_rec_id',
          dataGridPesqSelected[0].chq_rec_id
        );
        frmCadastro.current.setFieldValue(
          'chq_reci_id',
          dataGridPesqSelected[0].chq_reci_id
        );
        frmCadastro.current.setFieldValue(
          'chq_tipo',
          dataGridPesqSelected[0].chq_tipo
        );
        frmCadastro.current.setFieldValue(
          'chq_situacao_id',
          optSituacao.find(
            (op) =>
              op.value.toString() === dataGridPesqSelected[0].chq_situacao_id
          )
        );
        frmCadastro.current.setFieldValue(
          'chq_observacao',
          dataGridPesqSelected[0].chq_observacao
        );
        await loadOptionsRepresentante(
          dataGridPesqSelected[0].bc_vendedor_id,
          setVendedor
        );
        setValueTab(1);
        setLoading(false);
      } else {
        setValueTab(0);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar cadastro \n${error}`, toastOptions);
    }
  }

  async function handleNovoCadastro() {
    limpaForm();
    setValueTab(1);
  }

  async function handleSubmit() {
    try {
      if (parseInt(valueTab, 10) > 0) {
        const formData = frmCadastro.current.getData();
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const objCad = {
          chq_emp_id: null,
          chq_id: formData.chq_id ? parseInt(formData.chq_id, 10) : null,
          chq_bco_id: formData.chq_bco_id,
          chq_agencia: formData.chq_agencia,
          chq_conta: formData.chq_conta,
          chq_numero: formData.chq_numero,
          chq_cnpj_cpf_emit: formData.chq_cnpj_cpf_emit,
          chq_emitente: formData.chq_emitente.toUpperCase(),
          chq_mc7: formData.chq_mc7,
          chq_valor: toDecimal(formData.chq_valor),

          chq_cta_id: null,
          chq_ctap_id: null,
          chq_rec_id: null,
          chq_reci_id: null,
          chq_tipo: formData.chq_tipo,
          chq_situacao_id: formData.chq_situacao_id,
          chq_usr_id: null,
          chq_sacado_id: formData.chq_sacado_id || null,
          chq_observacao: formData.chq_observacao,
        };

        const retorno = await api.post('v1/fina/cheque/cheque', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'chq_id',
            retorno.data.retorno.chq_id
          );
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
        setLoading(false);
      } else {
        toast.info(`Altere ou inicie um cadastro para salvar...`, toastOptions);
      }
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
      }

      frmCadastro.current.setFieldError(
        'chq_bco_id',
        validationErrors.chq_bco_id
      );
      frmCadastro.current.setFieldError('chq_tipo', validationErrors.chq_tipo);
      frmCadastro.current.setFieldError(
        'chq_cnpj_cpf_emit',
        validationErrors.chq_cnpj_cpf_emit
      );
      frmCadastro.current.setFieldError(
        'chq_emitente',
        validationErrors.chq_emitente
      );
      frmCadastro.current.setFieldError(
        'chq_valor',
        validationErrors.chq_valor
      );
      frmCadastro.current.setFieldError(
        'chq_numero',
        validationErrors.chq_numero
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
      await listarCheque();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.chq_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    } else if (newValue === 2) {
      setValueTab(newValue);
    }
  };

  function handleCliente() {
    window.open('/crm9', '_blank');
  }

  useEffect(() => {
    // listarCheque();

    comboGeral(25);
    handleGrupoRec();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'bc_id',
      headerName: 'CÓDIGO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bc_descricao',
      headerName: 'DESCRIÇÃO',
      width: 340,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'grupo_receita',
      headerName: 'GRUPO DE RECEITA',
      width: 240,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'sacado',
      headerName: 'SACADO/RECEBEDOR',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'bc_cp_dataemis',
      headerName: 'DATA EMISSÃO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'bc_valor_pedido',
      headerName: 'VALOR DO BORDERÔ',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'bc_valor_cheque',
      headerName: 'VALOR EM CHEQUE',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO BORDERÔ',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
  ];

  // #endregion

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnPedido = [
    {
      field: 'cp_id',
      headerName: 'Nº PEDIDO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'DESTINATÁRIO',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cp_data_emis',
      headerName: 'DTA. EMISSÃO',
      width: 130,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },

    {
      field: 'cp_vlr_nf',
      headerName: 'VLR. PEDIDO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellClass: 'cell_valor',
    },
    {
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID CHEQUE  =========================

  const gridColumnCheque = [
    {
      field: 'chq_numero',
      headerName: 'Nº CHEQUE',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'chq_valor',
      headerName: 'VALOR',
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
      field: 'chq_emitente',
      headerName: 'EMITENTE',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'sacado',
      headerName: 'SACADO/RECEBEDOR',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Consultar Operaçòes" placement="right">
          <button type="button" onClick={listarCheque}>
            <FaSearch size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ABRIR CADASTRO DE CHEQUE" placement="left">
          <button type="button" onClick={() => window.open('/fina5', '_blank')}>
            <FaMoneyCheckAlt size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="ABRIR CADASTRO DE CLIENTES" placement="left">
          <button type="button" onClick={handleCliente}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>BORDERÔ DE CHEQUE</h1>
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
                title="Consultar Cadastro"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR BORDERÔ"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="ABRE O CADASTRO DE BORDERÔ"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="EDITAR/CADASTRAR"
                  {...a11yProps(1)}
                  icon={<FaFolderPlus size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="LANÇAMENTO DE CHEQUES NO BORDERÔ"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CHEQUES"
                  {...a11yProps(2)}
                  icon={<FaMoneyCheckAlt size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>REGISTROS CADASTRADOS - PESQUISAR</h1>
                <BoxItemCad fr="3fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_bc_vendedor_id"
                      label="SACADO/RECEBEDOR/VENDEDOR"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={vendedor}
                      onChange={(c) => setVendedor(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Situação Borderô"
                      name="pesq_bc_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataIni(new Date(date))}
                      value={dataIni}
                      label="Emissão Inicial"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataFin(new Date(date))}
                      value={dataFin}
                      label="Emissão Final"
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
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
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
                <BoxItemCad fr="1fr 3fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="bc_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>descrição</label>
                    <Input
                      type="text"
                      name="bc_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>data cadastro</label>
                    <Input
                      type="text"
                      name="bc_datacad"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 2fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="grupo de receita"
                      name="bc_grupo_receita"
                      optionsList={optGrpRec}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="bc_vendedor_id"
                      label="vendedor/representante"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={vendedor}
                      onChange={(c) => setVendedor(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="bc_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>data baixa</label>
                    <Input
                      type="text"
                      name="bc_databaixa"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Observações adicionais</label>
                    <TextArea type="text" name="bc_observacao" rows="4" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>valor do borderô</label>
                    <Input
                      type="text"
                      name="bc_valor_pedido"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor recebido em cheque</label>
                    <Input
                      type="text"
                      name="bc_valor_cheque"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CHEQUES */}
          <TabPanel value={valueTab} index={2}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <h1>INFORME O PEDIDO - PRESSIOINE (F2) PARA LOCALIZAR</h1>
                    <GridContainerMain className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnPedido}
                        rowData={gridPedido}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onSelectionChanged={handleSelectGridPedido}
                      />
                    </GridContainerMain>
                  </AreaComp>
                  <AreaComp wd="100">
                    <h1>{titleCheque}</h1>
                    <GridContainerMain className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnCheque}
                        rowData={gridCheque}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                      />
                    </GridContainerMain>
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup CARREGAR CHEQUE... */}
      <Popup
        isOpen={dlgPedido}
        closeDialogFn={() => setDlgPedido(false)}
        title=""
        size="xl"
      />

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="BORDERÔ DE CHEQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
