import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaSearchPlus,
  FaUserTie,
  FaFileSignature,
  FaCheckCircle,
  FaTrashAlt,
  FaColumns,
  FaTags,
} from 'react-icons/fa';
import moment from 'moment';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import Popup from '~/componentes/Popup';
import {
  a11yProps,
  GridCurrencyFormatter,
  toDecimal,
  FormataData,
  sleep,
  FormataMoeda,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerItens,
} from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  Linha,
} from '~/pages/general.styles';
import CONULTA_TITULOS from '~/pages/Financeiro/conta_pagar/bordero/titulos';
import REL_TITULOS from '~/pages/Financeiro/relatorios/titulos';

export default function FINA15() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridTitulos, setGridTitulos] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment());
  const [fornecedor, setFornecedor] = useState([]);
  const [dlgTitulos, setDlgTitulos] = useState(false);
  const [dlgRelCtarec, setDlgRelCtarec] = useState(false);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    bp_descricao: Yup.string().required('(??)'),
  });

  // #region COMBO ========================

  const optSituacao = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'ABERTO' },
    { value: '2', label: 'BAIXADO' },
    { value: '3', label: 'CANCELADOS' },
  ];

  const loadOptionsFornec = async (inputText, callback) => {
    if (inputText) {
      const valor = inputText.toUpperCase();
      if (valor.length > 2) {
        const response = await api.get(
          `v1/combos/combo_fornecedor?valor=${valor}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

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
    frmCadastro.current.setFieldValue('bp_id', '');
    frmCadastro.current.setFieldValue('bp_descricao', '');
    frmCadastro.current.setFieldValue('bp_datacad', '');
    frmCadastro.current.setFieldValue('bp_databaixa', '');
    frmCadastro.current.setFieldValue('bp_valor', '');
    frmCadastro.current.setFieldValue('bp_situacao', '');
    frmCadastro.current.setFieldValue('bp_valor_recebido', '');
    document.getElementsByName('bp_descricao')[0].focus();
    setGridTitulos([]);
  };

  async function handleNovoCadastro() {
    setValueTab(1);
    limpaForm();
  }

  async function listarBordero() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();

      const url = `v1/fina/ctapag/listar_bordero?forn_id=${
        formPesq.pesq_cli_id || ''
      }&situacao=${formPesq.pesq_bp_situacao || '1'}&bp_id=${
        formPesq.pesq_bp_id
      }&data_ini=${moment(dataIni).format('YYYY-MM-DD')}&data_fin=${moment(
        dataFin
      ).format('YYYY-MM-DD')}`;

      const response = await api.get(url);

      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar Borderô${error}`);
    }
  }

  async function handleSalvar() {
    try {
      if (parseInt(valueTab, 10) > 0) {
        if (gridTitulos.length < 1) {
          toast.warning(
            'INFORME PELO MENOS UM TITULOS PARA CADASTRAR O BORDERÔ',
            toastOptions
          );
          return;
        }

        const formData = frmCadastro.current.getData();
        if (formData.bp_situacao === 'BORDERÔ BAIXADO') {
          toast.error(
            'BORDERÔ BAIXADO!! NÃO PODE MAIS SER ALTERADO',
            toastOptions
          );
          return;
        }
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);
        const itens = [];

        gridTitulos.forEach((t) => {
          const titulos = {
            bpi_bp_emp_id: null,
            bpi_bp_id: null,
            bpi_id: null,
            bpi_ctapag_id: t.bpi_ctapag_id,
            bpi_ctapag_parc_id: t.bpi_ctapag_parc_id,
            bpi_vlr_juro: toDecimal(t.bpi_vlr_juro),
            bpi_vlr_desconto: toDecimal(t.bpi_vlr_desconto),
            bpi_valor_pago: toDecimal(t.bpi_valor_pago),
            bpi_valor_titulo: toDecimal(t.bpi_valor_titulo),
          };
          itens.push(titulos);
        });

        const bordero = {
          bp_emp_id: null,
          bp_id: formData.bp_id ? parseInt(formData.bp_id, 10) : null,
          bp_descricao: formData.bp_descricao.toUpperCase(),
          bp_valor: 0,
          bp_situacao: '1',
          bp_valor_recebido: 0,
          bp_usr_id: null,
          bp_itens: itens,
        };

        const retorno = await api.post('v1/fina/ctapag/bordero', bordero);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'bp_id',
            retorno.data.retorno.bp_id
          );
          frmCadastro.current.setFieldValue(
            'bp_datacad',
            FormataData(retorno.data.retorno.bp_datacad)
          );
          frmCadastro.current.setFieldValue(
            'bp_valor',
            FormataMoeda(retorno.data.retorno.bp_valor)
          );
          frmCadastro.current.setFieldValue(
            'bp_valor_recebido',
            FormataMoeda(retorno.data.retorno.bp_valor_recebido)
          );
          frmCadastro.current.setFieldValue(
            'bp_situacao',
            retorno.data.retorno.situacao
          );
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
      } else {
        toast.info(`VOCÊ ESTÁ NA ABA DE PESQUISAS...`, toastOptions);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
      }

      frmCadastro.current.setFieldError(
        'bp_descricao',
        validationErrors.bp_descricao
      );
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setGridTitulos([]);

        const url = `v1/fina/ctapag/get_bordero?bp_id=${dataGridPesqSelected[0].bp_id}`;
        const response = await api.get(url);

        const dados = response.data.retorno;
        if (dados) {
          setGridTitulos(dados.itens);

          frmCadastro.current.setFieldValue('bp_id', dados.capa.bp_id);
          frmCadastro.current.setFieldValue(
            'bp_descricao',
            dados.capa.bp_descricao
          );
          frmCadastro.current.setFieldValue(
            'bp_datacad',
            FormataData(dados.capa.bp_datacad)
          );
          frmCadastro.current.setFieldValue(
            'bp_databaixa',
            FormataData(dados.capa.bp_databaixa)
          );
          frmCadastro.current.setFieldValue('bp_valor', dados.capa.bp_valor);
          frmCadastro.current.setFieldValue('bp_situacao', dados.capa.situacao);
          frmCadastro.current.setFieldValue(
            'bp_valor_recebido',
            dados.capa.bp_valor_recebido
          );

          setValueTab(1);
        } else
          toast.error(
            'NAO FOI POSSIVEL RECUPERAR OS DADOS CADASTRADOS',
            toastOptions
          );

        setLoading(false);
      } else {
        setValueTab(0);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar cadastro \n${error}`, toastOptions);
    }
  }

  async function handleBaixar() {
    try {
      if (valueTab.toString() === '0') {
        if (dataGridPesqSelected.length > 0) {
          if (dataGridPesqSelected[0].bp_situacao === '1') {
            setLoading(true);
            const url = `v1/fina/ctapag/baixar_bordero?bp_id=${dataGridPesqSelected[0].bp_id}`;
            const response = await api.put(url);
            if (response.data.success) {
              toast.success(response.data.retorno, toastOptions);
              await listarBordero();
            } else {
              toast.success(response.data.errors, toastOptions);
            }

            setLoading(false);
          } else {
            toast.error(
              'ESTE BORDERÔ NÃO PODE SER BAIXADO. VERIFIQUE A SITUAÇÃO',
              toastOptions
            );
            return;
          }
        } else {
          toast.error('SELECIONE UM BORDERÔ PARA BAIXAR', toastOptions);
          setValueTab(0);
        }
      } else {
        setValueTab(0);
        toast.error('SELECIONE UM BORDERÔ PARA BAIXAR', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar cadastro \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      await listarBordero();
      setValueTab(newValue);
    } else if (newValue === 1) {
      await handleEdit();
    }
  };

  function getTitulos(titulos) {
    const aux = [];

    if (gridTitulos.length > 0) {
      gridTitulos.forEach((g) => {
        aux.push(g);
      });
    }

    titulos.forEach((t) => {
      const item = {
        forn_razao_social: t.forn_razao_social,
        bpi_ctapag_id: t.cta_id,
        bpi_ctapag_parc_id: t.ctap_id,
        parcela: t.ctap_parcela,
        vencimento: t.vencimento,
        bpi_valor_titulo: t.ctap_valor,
        bpi_vlr_juro: 0,
        bpi_vlr_desconto: 0,
        bpi_valor_pago: t.ctap_valor,
        forma_pgto: t.forma_pgto,
      };
      aux.push(item);
    });

    setGridTitulos(aux);
    setDlgTitulos(false);
  }

  async function handleDeleteItem(prm) {
    const formData = frmCadastro.current.getData();
    if (formData.bp_situacao === 'BORDERÔ BAIXADO') {
      toast.error('BORDERÔ BAIXADO!! NÃO PODE MAIS SER ALTERADO', toastOptions);
      return;
    }
    setGridTitulos((prev) => {
      prev = prev.filter((item) => item !== prm);
      return prev;
    });
    await sleep(100);
    toast.warning(`SALVE O BORDERÔ PARA CONFIRMAR A EXCLUSÃO!!!`, toastOptions);
  }

  const handleEditarValor = async (prm) => {
    try {
      const formData = frmCadastro.current.getData();
      if (formData.bp_situacao === 'BORDERÔ BAIXADO') {
        toast.error(
          'BORDERÔ BAIXADO!! NÃO PODE MAIS SER ALTERADO',
          toastOptions
        );
        return;
      }
      if (Number.isNaN(Number(prm.newValue))) {
        prm.data.bpi_valor_pago = prm.oldValue;
      } else if (
        toDecimal(prm.data.bpi_valor_pago) >
        toDecimal(prm.data.bpi_valor_titulo)
      ) {
        prm.data.bpi_vlr_juro =
          toDecimal(prm.data.bpi_valor_pago) -
          toDecimal(prm.data.bpi_valor_titulo);
      } else {
        prm.data.bpi_vlr_desconto =
          toDecimal(prm.data.bpi_valor_titulo) -
          toDecimal(prm.data.bpi_valor_pago);
      }
      let auxGrid = [];

      setGridTitulos((t) => {
        auxGrid = t;
        return [];
      });
      await sleep(100);
      setGridTitulos(() => auxGrid);
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao alterar quantidade: ${err}`, toastOptions);
    }
  };

  useEffect(() => {
    listarBordero();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'bp_id',
      headerName: 'Nº BORDERÔ',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bp_descricao',
      headerName: 'DESCRIÇÃO',
      width: 400,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'datacad',
      headerName: 'DATA EMISSÃO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'data_baixa',
      headerName: 'DATA BAIXA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bp_valor',
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
      field: 'bp_valor_recebido',
      headerName: 'VALOR RECEBIDO',
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
      headerName: 'SITUAÇÀO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID ITENS  =========================
  const gridColunaItens = [
    {
      field: 'bpi_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="EXCLUIR TITULO DO BORDERÔ" placement="top">
              <button
                type="button"
                onClick={async () => {
                  await handleDeleteItem(prm.data);
                }}
              >
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'forn_razao_social',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bpi_ctapag_id',
      headerName: 'Nº TITULO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'parcela',
      headerName: 'PARCELA',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bpi_valor_titulo',
      headerName: 'VLR. TITULO',
      width: 125,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'bpi_valor_pago',
      headerName: 'VLR. RECEBIDO',
      width: 140,
      sortable: true,
      editable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      onCellValueChanged: handleEditarValor,
      cellStyle: { color: '#148A26', fontWeight: 'bold' },
    },
    {
      field: 'bpi_vlr_juro',
      headerName: 'VLR. JURO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
    },
    {
      field: 'bpi_vlr_desconto',
      headerName: 'VLR. DESCONTO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
    },
    {
      field: 'forma_pgto',
      headerName: 'FORMA PAGAMENTO',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
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
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
        <BootstrapTooltip title="LOCALIZAR TITULOS PARA BAIXA" placement="left">
          <button
            type="button"
            onClick={() => {
              if (valueTab === 1) setDlgTitulos(true);
            }}
          >
            <FaSearchPlus size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={handleSalvar}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="CONFIRMAR BAIXA DO BORDERÔ" placement="left">
          <button type="button" onClick={handleBaixar}>
            <FaCheckCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="CADASTRO DE TITULOS A PAGAR" placement="left">
          <button
            type="button"
            onClick={() => window.open('/fina14', '_blank')}
          >
            <FaTags size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="ABRIR RELATÓRIO DE TITULOS" placement="left">
          <button type="button" onClick={() => setDlgRelCtarec(true)}>
            <FaColumns size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="ABRIR CADASTRO DE CLIENTES" placement="left">
          <button type="button" onClick={() => window.open('/crm9', '_blank')}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>BORDERÔ CONTAS A PAGAR (BAIXA DE TITULOS)</h1>
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
                title="Consultar e gerenciar borderô cadastrado"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR BORDERÔ"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Editar o cadastrar novo borderô"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR/EDITAR"
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
                <h1>CONSULTAR BORDERÔ CADASTRADO</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 3fr">
                  <AreaComp wd="100">
                    <label>Nº BORDERÔ</label>
                    <Input
                      type="text"
                      name="pesq_bp_id"
                      placeholder="Nº borderô"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="pesq_bp_situacao"
                      optionsList={optSituacao}
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
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_forn_id"
                      label="FORNECEDOR"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={fornecedor}
                      onChange={(c) => setFornecedor(c || [])}
                      loadOptions={loadOptionsFornec}
                      isClearable
                      zindex="153"
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
                      rowClassRules={{
                        'warn-baixado': function (p) {
                          const baixado = p.data.situacao;
                          return baixado === 'BORDERÔ BAIXADO';
                        },
                        'warn-aberto': function (p) {
                          const aberto = p.data.situacao;
                          return aberto === 'BORDERÔ ABERTO';
                        },
                        'warn-cancelado': function (p) {
                          const cancelado = p.data.situacao;
                          return cancelado === 'BORDERÔ CANCELADO';
                        },
                      }}
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
                <h1>IDENTIFICAÇÃO DO BORDERÔ</h1>
                <BoxItemCad fr="1fr 5fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="bp_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>descricão (identificaçào do borerô)</label>
                    <Input
                      type="text"
                      name="bp_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>valor borderô</label>
                    <Input
                      type="text"
                      name="bp_valor"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor recebido</label>
                    <Input
                      type="text"
                      name="bp_valor_recebido"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>situação</label>
                    <Input
                      type="text"
                      name="bp_situacao"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data cadastro</label>
                    <Input
                      type="text"
                      name="bp_datacad"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Baixa</label>
                    <Input
                      type="text"
                      name="bp_databaixa"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <h1>TITULOS DO BORDERÔ</h1>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColunaItens}
                      rowData={gridTitulos}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </BoxItemCadNoQuery>
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

      {/* popup carregar titulos do bordero... */}
      <Popup
        isOpen={dlgTitulos}
        closeDialogFn={() => setDlgTitulos(false)}
        title="CONSULTAR TITULOS DO CONTAS A PAGAR"
        size="xl"
      >
        <CONULTA_TITULOS getTitulos={getTitulos} />
      </Popup>

      {/* popup RELATÓRIO TITULOS CONTAS A PAGAR.. */}
      <Popup
        isOpen={dlgRelCtarec}
        closeDialogFn={() => {
          setDlgRelCtarec(false);
        }}
        title="RELATÓRIO TITULOS DO CONTAS A PAGAR"
        size="sm"
      >
        <REL_TITULOS tipo="P" />
      </Popup>
    </>
  );
}
