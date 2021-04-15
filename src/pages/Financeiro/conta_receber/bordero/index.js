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
  FaMoneyCheckAlt,
  FaFileSignature,
  FaCheckCircle,
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
import CONULTA_TITULOS from '~/pages/Financeiro/conta_receber/bordero/titulos';

export default function FINA12() {
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
  const [cliente, setCliente] = useState([]);
  const [dlgTitulos, setDlgTitulos] = useState(false);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    br_descricao: Yup.string().required('(??)'),
  });

  // #region COMBO ========================

  const optSituacao = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'ABERTO' },
    { value: '2', label: 'BAIXADO' },
    { value: '3', label: 'CANCELADOS' },
  ];

  const loadOptionsCliente = async (inputText, callback) => {
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
    frmCadastro.current.setFieldValue('br_id', '');
    frmCadastro.current.setFieldValue('br_descricao', '');
    frmCadastro.current.setFieldValue('br_datacad', '');
    frmCadastro.current.setFieldValue('br_databaixa', '');
    frmCadastro.current.setFieldValue('br_valor', '');
    frmCadastro.current.setFieldValue('br_situacao', '');
    frmCadastro.current.setFieldValue('br_valor_recebido', '');
    document.getElementsByName('br_descricao')[0].focus();
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

      const url = `v1/fina/ctarec/listar_bordero?cli_id=${
        formPesq.pesq_cli_id || ''
      }&situacao=${formPesq.pesq_br_situacao || '1'}&br_id=${
        formPesq.pesq_br_id
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
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);
        const itens = [];

        gridTitulos.forEach((t) => {
          const titulos = {
            bri_br_emp_id: null,
            bri_br_id: null,
            bri_id: null,
            bri_ctarec_id: t.bri_ctarec_id,
            bri_ctarec_parc_id: t.bri_ctarec_parc_id,
            bri_vlr_juro: toDecimal(t.bri_vlr_juro),
            bri_vlr_desconto: toDecimal(t.bri_vlr_desconto),
            bri_valor_pago: toDecimal(t.bri_valor_pago),
            bri_valor_titulo: toDecimal(t.bri_valor_pago),
          };
          itens.push(titulos);
        });

        const bordero = {
          br_emp_id: null,
          br_id: formData.br_id ? parseInt(formData.br_id, 10) : null,
          br_descricao: formData.br_descricao.toUpperCase(),
          br_valor: 0,
          br_situacao: '1',
          br_valor_recebido: 0,
          br_usr_id: null,
          br_itens: itens,
        };

        const retorno = await api.post('v1/fina/ctarec/bordero', bordero);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'br_id',
            retorno.data.retorno.br_id
          );
          frmCadastro.current.setFieldValue(
            'br_datacad',
            FormataData(retorno.data.retorno.br_datacad)
          );
          frmCadastro.current.setFieldValue(
            'br_valor',
            FormataMoeda(retorno.data.retorno.br_valor)
          );
          frmCadastro.current.setFieldValue(
            'br_valor_recebido',
            FormataMoeda(retorno.data.retorno.br_valor_recebido)
          );
          frmCadastro.current.setFieldValue(
            'br_situacao',
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
        'br_descricao',
        validationErrors.br_descricao
      );
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setGridTitulos([]);

        const url = `v1/fina/ctarec/get_bordero?br_id=${dataGridPesqSelected[0].br_id}`;
        const response = await api.get(url);

        const dados = response.data.retorno;
        if (dados) {
          console.warn(dados);
          setGridTitulos(dados.itens);

          frmCadastro.current.setFieldValue('br_id', dados.capa.br_id);
          frmCadastro.current.setFieldValue(
            'br_descricao',
            dados.capa.br_descricao
          );
          frmCadastro.current.setFieldValue(
            'br_datacad',
            FormataData(dados.capa.br_datacad)
          );
          frmCadastro.current.setFieldValue(
            'br_databaixa',
            FormataData(dados.capa.br_databaixa)
          );
          frmCadastro.current.setFieldValue('br_valor', dados.capa.br_valor);
          frmCadastro.current.setFieldValue('br_situacao', dados.capa.situacao);
          frmCadastro.current.setFieldValue(
            'br_valor_recebido',
            dados.capa.br_valor_recebido
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
          if (dataGridPesqSelected[0].br_situacao === '1') {
            setLoading(true);
            const url = `v1/fina/ctarec/baixar_bordero?br_id=${dataGridPesqSelected[0].br_id}`;
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
        cli_razao_social: t.cli_razao_social,
        bri_ctarec_id: t.rec_id,
        bri_ctarec_parc_id: t.reci_id,
        parcela: t.reci_parcela,
        vencimento: t.vencimento,
        bri_valor_titulo: t.reci_valor,
        bri_vlr_juro: 0,
        bri_vlr_desconto: 0,
        bri_valor_pago: t.reci_valor,
        forma_pgto: t.forma_pgto,
      };
      aux.push(item);
    });

    setGridTitulos(aux);
    setDlgTitulos(false);
  }

  const handleEditarValor = async (prm) => {
    try {
      if (Number.isNaN(Number(prm.newValue))) {
        prm.data.bri_valor_pago = prm.oldValue;
      } else if (
        toDecimal(prm.data.bri_valor_pago) >
        toDecimal(prm.data.bri_valor_titulo)
      ) {
        prm.data.bri_vlr_juro =
          toDecimal(prm.data.bri_valor_pago) -
          toDecimal(prm.data.bri_valor_titulo);
      } else {
        prm.data.bri_vlr_desconto =
          toDecimal(prm.data.bri_valor_titulo) -
          toDecimal(prm.data.bri_valor_pago);
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
      field: 'br_id',
      headerName: 'Nº BORDERÔ',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'br_descricao',
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
      field: 'br_valor',
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
      field: 'br_valor_recebido',
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
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bri_ctarec_id',
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
      field: 'bri_valor_titulo',
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
      field: 'bri_valor_pago',
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
      field: 'bri_vlr_juro',
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
      field: 'bri_vlr_desconto',
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
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={handleSalvar}>
            <FaSave size={25} color="#fff" />
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
        <BootstrapTooltip title="CONFIRMAR BAIXA DO BORDERÔ" placement="left">
          <button type="button" onClick={handleBaixar}>
            <FaCheckCircle size={25} color="#fff" />
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
            <h1>BORDERÔ CONTAS A RECEBER (BAIXA DE TITULOS)</h1>
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
                      name="pesq_br_id"
                      placeholder="Nº borderô"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="pesq_br_situacao"
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
                      name="pesq_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={cliente}
                      onChange={(c) => setCliente(c || [])}
                      loadOptions={loadOptionsCliente}
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
                      name="br_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>descricão (identificaçào do borerô)</label>
                    <Input
                      type="text"
                      name="br_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>valor borderô</label>
                    <Input
                      type="text"
                      name="br_valor"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor recebido</label>
                    <Input
                      type="text"
                      name="br_valor_recebido"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>situação</label>
                    <Input
                      type="text"
                      name="br_situacao"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data cadastro</label>
                    <Input
                      type="text"
                      name="br_datacad"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Baixa</label>
                    <Input
                      type="text"
                      name="br_databaixa"
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
        title="CONSULTAR TITULOS DO CONTAS A RECEBER"
        size="xl"
      >
        <CONULTA_TITULOS getTitulos={getTitulos} />
      </Popup>
    </>
  );
}
