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
  FaCog,
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

export default function FINA5() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmCheque = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [optBanco, setOptBanco] = useState([]);
  const [sacado, setSacado] = useState([]);
  const [optSituacao, setOptSituacao] = useState([]);
  const [dataVencimento, setDataVencimento] = useState(moment());
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment().add(60, 'day'));
  const [dlgGerenciar, setDlgGerenciar] = useState(false);
  const [optSituacaoCheque, setOptSituacaoCheque] = useState([]);
  const [optContas, setOptContas] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipoCheque = [
    { value: '1', label: 'CHEQUE PRÓPRIO' },
    { value: '2', label: 'CHEQUE RECEBIDO' },
    { value: '3', label: 'CHEQUE RECEBIDO DE TERCEIROS' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE LANÇAMENTO' },
    { value: '2', label: 'DATA VENCIMENTO' },
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 24) {
          setOptBanco(dados);
        } else if (tab_id === 25) {
          setOptSituacao(dados);
          setOptSituacaoCheque(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // conta bancaria
  async function handleComboContas() {
    try {
      const response = await api.get(`v1/combos/contas`);
      const dados = response.data.retorno;
      if (dados) {
        setOptContas(dados);
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
    chq_tipo: Yup.string().required('(??)'),
    chq_numero: Yup.number()
      .typeError('Informe um número válido')
      .required('(??)'),
    chq_cnpj_cpf_emit: Yup.string().required('(??)'),
    chq_emitente: Yup.string().required('(??)'),
    chq_valor: Yup.string().required('(??)'),
    chq_situacao_id: Yup.string().required('(??)'),
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
        chq_datacad: moment(dataIni).format('YYYY-MM-DD'),
        chq_vencimento: moment(dataFin).format('YYYY-MM-DD'),
      };
      const response = await api.post(
        `v1/fina/cheque/listar_cheque?tpData=${formPesq.pesq_data || '1'}`,
        objPesq
      );
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
    setDataVencimento(new Date());
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
          'chq_bco_id',
          optBanco.find(
            (op) => op.value.toString() === dataGridPesqSelected[0].chq_bco_id
          )
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
        setDataVencimento(
          parse(dataGridPesqSelected[0].vencimento, 'dd/MM/yyyy', new Date())
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
              op.value.toString() ===
              dataGridPesqSelected[0].chq_situacao_id.toString()
          )
        );
        frmCadastro.current.setFieldValue(
          'chq_observacao',
          dataGridPesqSelected[0].chq_observacao
        );
        await loadOptionsRepresentante(
          dataGridPesqSelected[0].chq_sacado_id,
          setSacado
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
          chq_cnpj_cpf_emit: RetirarMascara(formData.chq_cnpj_cpf_emit, '-./'),
          chq_emitente: formData.chq_emitente.toUpperCase(),
          chq_mc7: formData.chq_mc7,
          chq_valor: toDecimal(formData.chq_valor),
          chq_vencimento: format(dataVencimento, 'yyyy-MM-dd HH:mm:ss'),
          chq_cta_id: null,
          chq_ctap_id: null,
          chq_rec_id: null,
          chq_reci_id: null,
          chq_tipo: formData.chq_tipo,
          chq_situacao_id: formData.chq_situacao_id,
          chq_usr_id: null,
          chq_sacado_id: parseInt(formData.chq_sacado_id, 10) || null,
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
      frmCadastro.current.setFieldError(
        'chq_situacao_id',
        validationErrors.chq_situacao_id
      );
    }
  }

  // confirmar atualizacao da situacao de cheques
  async function handleConfirmarCheque() {
    try {
      const formCheque = frmCheque.current.getData();

      if (formCheque.sit_cheque) {
        setLoading(true);
        const itens = [];

        dataGridPesqSelected.forEach((c) => {
          const cheque = {
            chq_emp_id: null,
            chq_id: c.chq_id,
            chq_situacao_id: formCheque.sit_cheque,
            chq_conta_deposito: formCheque.chq_conta_deposito,
            chq_repassado: formCheque.chq_repassado,
          };
          if (!formCheque.chq_conta_deposito) delete cheque.chq_conta_deposito;
          itens.push(cheque);
        });

        const retorno = await api.put('v1/fina/cheque/cheque', itens);
        if (retorno.data.success) {
          await listarCheque();
          toast.success('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
      } else {
        toast.error('INFORME A SITUAÇÃO PARA CONTINUAR...', toastOptions);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao atualizar cheque: ${error}`, toastOptions);
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
    }
  };

  function handleCliente() {
    window.open('/crm9', '_blank');
  }

  useEffect(() => {
    listarCheque();
    comboGeral(24);
    comboGeral(25);
    handleComboContas();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'chq_numero',
      headerName: 'Nº CHEQUE',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'chq_valor',
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
      field: 'datacad',
      headerName: 'LANÇAMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'banco',
      headerName: 'BANCO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
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
    {
      flex: 1,
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
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="GERENCIAR CHEQUE" placement="left">
          <button
            type="button"
            onClick={() => {
              if (dataGridPesqSelected.length > 0) {
                setDlgGerenciar(true);
              } else {
                toast.warning(
                  'SELECIONE UM OU MAIS CHEQUES PARA CONTINUAR...',
                  toastOptions
                );
              }
            }}
          >
            <FaCog size={25} color="#fff" />
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
          <button type="button" onClick={handleCliente}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE CHEQUES</h1>
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
                title="Consultar Operações Cadastradas"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR CHEQUES"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="ABRE O CADASTRO DE CHEQUE"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="EDITAR/CADASTRAR"
                  {...a11yProps(1)}
                  icon={<FaFolderPlus size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>CHEQUES CADASTRADAS - PESQUISAR</h1>
                <BoxItemCad fr="2fr 2fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_chq_sacado_id"
                      label="SACADO/RECEBEDOR"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={sacado}
                      onChange={(c) => setSacado(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>emitente de cheque</label>
                    <Input
                      type="text"
                      name="pesq_emitente"
                      placeholder="INFORME NOME OU CPF/CNPJ DO EMITENTE"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do cheque"
                      name="pesq_chq_situacao_id"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Nº Cheque</label>
                    <Input
                      type="text"
                      name="pesq_chq_numero"
                      placeholder="Nº CHEQUE"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo de cheque"
                      name="pesq_chq_tipo"
                      optionsList={optTipoCheque}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="filtrar por"
                      name="pesq_data"
                      optionsList={optDATA}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                    />
                  </AreaComp>
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
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnPesquisa}
                      rowData={gridPesquisa}
                      rowSelection="multiple"
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
                <BoxItemCad fr="1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="chq_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="chq_sacado_id"
                      label="SACADO/RECEBEDOR"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={sacado}
                      onChange={(c) => setSacado(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Banco"
                      name="chq_bco_id"
                      optionsList={optBanco}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Agência</label>
                    <Input
                      type="text"
                      name="chq_agencia"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Conta Corrente</label>
                    <Input type="text" name="chq_conta" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nº Cheque</label>
                    <Input
                      type="number"
                      name="chq_numero"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CNPJ/CPF emitente</label>
                    <Input
                      type="text"
                      name="chq_cnpj_cpf_emit"
                      maxlength="18"
                      className="input_cad"
                      onChange={maskCNPJCPF}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <label>Emitente do cheque</label>
                    <Input
                      type="text"
                      name="chq_emitente"
                      className="input_cad"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>código mc7</label>
                    <Input type="text" name="chq_mc7" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataVencimento(new Date(date))}
                      value={dataVencimento}
                      label="Data Vencimento"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor do cheque</label>
                    <Input
                      type="text"
                      name="chq_valor"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo de cheque"
                      name="chq_tipo"
                      optionsList={optTipoCheque}
                      isClearable
                      placeholder="INFORME"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do cheque"
                      name="chq_situacao_id"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Observações do cheque</label>
                    <TextArea type="text" name="chq_observacao" rows="4" />
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup GERENCIAR CHEQUE... */}
      <Popup
        isOpen={dlgGerenciar}
        closeDialogFn={() => setDlgGerenciar(false)}
        title="GERENCIAR SITUAÇAO DO CHEQUE"
        size="md"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmCheque" ref={frmCheque}>
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="definir Situação"
                  name="sit_cheque"
                  optionsList={optSituacaoCheque}
                  isClearable
                  placeholder="INFORME A SITUAÇÃO"
                  zindex="153"
                />
              </AreaComp>
              <AreaComp wd="100">
                <FormSelect
                  label="direcionar para conta bancária"
                  name="chq_conta_deposito"
                  optionsList={optContas}
                  isClearable
                  placeholder="CONTA BANCÁRIA"
                  zindex="153"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>informe caso repasse o cheque a terceiros</label>
                <Input
                  type="text"
                  name="chq_repassado"
                  placeholder="DESCRIÇÃO DO REPASSE"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleConfirmarCheque}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

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
