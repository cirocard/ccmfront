import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { format } from 'date-fns';
import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaUserTie,
  FaFileSignature,
  FaTrashAlt,
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
import Confirmation from '~/componentes/DialogChoice';
import {
  a11yProps,
  maskDecimal,
  GridCurrencyFormatter,
  toDecimal,
  FormataData,
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

export default function FINA9() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-1, 'day'));
  const [dataFin, setDataFin] = useState(moment().add(30, 'day'));
  const [dataEmissao, setDataEmissao] = useState(moment());
  const [optGrupoRec, setOptGrupoRec] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [cli_id, setCli_id] = useState([]);
  const [optCvto, setOptCvto] = useState([]);
  const [optFpgto, setOptFpgto] = useState([]);
  const [nParcela, setNParcela] = useState(1);

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

  // grupo receita
  async function handleGrupoRec() {
    try {
      const response = await api.get(
        `v1/combos/agrupador_recdesp/1/2` // tipo 1 receita; 2 despesa
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

  async function getComboCondVcto() {
    try {
      const response = await api.get(`v1/combos/condvcto`);
      const dados = response.data.retorno;
      if (dados) {
        setOptCvto(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Condição de vencimento \n${error}`);
    }
  }

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 35) {
          const filtroCard = [4, 3, 13, 14];
          const filtrado = dados.filter((d) => {
            if (
              // se for cartão
              filtroCard.indexOf(parseInt(d.ger_numerico1.toString(), 10)) !==
              -1
            ) {
              return d.ger_texto1.toString() !== '1'; // retorna somente cartao que nao seja da empresa
            }
            return d; // senao retorna tudo
          });
          setOptFpgto(filtrado);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    rec_documento: Yup.string().required('(??)'),
    rec_cli_id: Yup.string().required('(??)'),
    rec_vlr_bruto: Yup.string().required('(??)'),
    rec_vlr_liquido: Yup.string().required('(??)'),
    rec_forma_pgto_id: Yup.string().required('(??)'),
    rec_cvto_id: Yup.string().required('(??)'),
    rec_grupo_rec: Yup.string().required('(??)'),
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
      )}&rec_id=${formPesq.pesq_rec_id}&tpData=${
        formPesq.pesq_data || '1'
      }&fpgto=`;

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
    frmCadastro.current.setFieldValue('rec_id', '');
    setDataEmissao(new Date());
    frmCadastro.current.setFieldValue('rec_documento', '');
    frmCadastro.current.setFieldValue('rec_observacao', '');
    frmCadastro.current.setFieldValue('rec_situacao', '');
    frmCadastro.current.setFieldValue('rec_origem', '');
    frmCadastro.current.setFieldValue('rec_grupo_rec', '');
    frmCadastro.current.setFieldValue('rec_cvto_id', '');
    frmCadastro.current.setFieldValue('rec_forma_pgto_id', '');
    frmCadastro.current.setFieldValue('rec_vlr_liquido', '');
    frmCadastro.current.setFieldValue('rec_vlr_bruto', '');
    frmCadastro.current.setFieldValue('rec_taxas', '');
    frmCadastro.current.setFieldValue('rec_saldo', '');
    setCli_id([]);
    frmCadastro.current.setFieldValue('rec_data_baixa', '');
    setGridItens([]);
    document.getElementsByName('rec_documento')[0].focus();
  };

  async function handleNovoCadastro() {
    setValueTab(1);
    limpaForm();
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setGridItens([]);

        const url = `v1/fina/ctarec/listar_itens?rec_id=${dataGridPesqSelected[0].rec_id}`;
        const response = await api.get(url);

        const dados = response.data.retorno;
        if (dados) {
          setGridItens(dados[0].itens);

          frmCadastro.current.setFieldValue('rec_id', dados[0].capa.rec_id);

          setDataEmissao(
            new Date(
              format(
                Date.parse(dados[0].capa.rec_data_emissao.substring(0, 19)),
                'yyy/MM/dd HH:mm:ss'
              )
            )
          );

          frmCadastro.current.setFieldValue(
            'rec_documento',
            dados[0].capa.rec_documento
          );
          frmCadastro.current.setFieldValue(
            'rec_observacao',
            dados[0].capa.rec_observacao
          );
          frmCadastro.current.setFieldValue(
            'rec_situacao',
            dados[0].capa.situacao
          );
          frmCadastro.current.setFieldValue('rec_origem', dados[0].capa.origem);
          frmCadastro.current.setFieldValue(
            'rec_grupo_rec',
            optGrupoRec.find(
              (op) =>
                op.value.toString() === dados[0].capa.rec_grupo_rec.toString()
            )
          );
          frmCadastro.current.setFieldValue(
            'rec_cvto_id',
            optCvto.find(
              (op) =>
                op.value.toString() === dados[0].capa.rec_cvto_id.toString()
            )
          );
          frmCadastro.current.setFieldValue(
            'rec_forma_pgto_id',
            optFpgto.find(
              (op) =>
                op.value.toString() ===
                dados[0].capa.rec_forma_pgto_id.toString()
            )
          );

          frmCadastro.current.setFieldValue(
            'rec_vlr_liquido',
            dados[0].capa.rec_vlr_liquido
          );
          frmCadastro.current.setFieldValue(
            'rec_vlr_bruto',
            dados[0].capa.rec_vlr_bruto
          );
          frmCadastro.current.setFieldValue(
            'rec_taxas',
            dados[0].capa.rec_taxas
          );
          frmCadastro.current.setFieldValue(
            'rec_saldo',
            dados[0].capa.rec_saldo
          );

          await loadOptionsCliente(dados[0].capa.rec_cli_id, setCli_id);
          frmCadastro.current.setFieldValue('rec_cli_id', {
            value: dados[0].capa.rec_cli_id,
            label: dataGridPesqSelected[0].cli_razao_social,
          });

          frmCadastro.current.setFieldValue(
            'rec_data_baixa',
            FormataData(dados[0].capa.rec_data_baixa)
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

  async function handleSubmit() {
    try {
      if (parseInt(valueTab, 10) > 0) {
        const formData = frmCadastro.current.getData();
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        if (
          (formData.rec_forma_pgto_id.toString() === '3' ||
            formData.rec_forma_pgto_id.toString() === '4') &&
          nParcela > 1
        ) {
          toast.error(
            `A CONDIÇÃO DE VENCIMENTO INFORMADA É INCOMPATÍVEL COM A FORMA DE PAGAMENTO ESCOLHIDA...`,
            toastOptions
          );
          return;
        }

        setLoading(true);

        const objCad = {
          rec_emp_id: null,
          rec_id: formData.rec_id ? parseInt(formData.rec_id, 10) : null,
          rec_documento: formData.rec_documento.toUpperCase(),
          rec_cli_id: parseInt(formData.rec_cli_id, 10) || null,
          rec_vlr_bruto: toDecimal(formData.rec_vlr_bruto),
          rec_vlr_liquido: toDecimal(formData.rec_vlr_liquido),
          rec_observacao: formData.rec_observacao,
          rec_situacao: '1',
          rec_forma_pgto_tab: 35,
          rec_forma_pgto_id: formData.rec_forma_pgto_id,
          rec_cvto_id: formData.rec_cvto_id,
          rec_grupo_rec: formData.rec_grupo_rec,
          rec_origem: '1',
          rec_usr_id: null,
          rec_editavel: 'S',
          rec_saldo: toDecimal(formData.rec_vlr_liquido),
          rec_data_emissao: format(dataEmissao, 'yyyy-MM-dd HH:mm:ss'),
        };

        const retorno = await api.post('v1/fina/ctarec/cadastrar', objCad);

        if (retorno.data.success) {
          const dados = retorno.data.retorno;
          frmCadastro.current.setFieldValue('rec_id', dados[0].capa.rec_id);
          frmCadastro.current.setFieldValue(
            'rec_vlr_liquido',
            dados[0].capa.rec_vlr_liquido
          );
          frmCadastro.current.setFieldValue(
            'rec_vlr_bruto',
            dados[0].capa.rec_vlr_bruto
          );
          frmCadastro.current.setFieldValue(
            'rec_taxas',
            dados[0].capa.rec_taxas
          );
          frmCadastro.current.setFieldValue(
            'rec_saldo',
            dados[0].capa.rec_saldo
          );
          setGridItens(dados[0].itens);
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.errors}`,
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
        'rec_documento',
        validationErrors.rec_documento
      );
      frmCadastro.current.setFieldError(
        'rec_cli_id',
        validationErrors.rec_cli_id
      );
      frmCadastro.current.setFieldError(
        'rec_vlr_bruto',
        validationErrors.rec_vlr_bruto
      );
      frmCadastro.current.setFieldError(
        'rec_vlr_liquido',
        validationErrors.rec_vlr_liquido
      );
      frmCadastro.current.setFieldError(
        'rec_forma_pgto_id',
        validationErrors.rec_forma_pgto_id
      );
      frmCadastro.current.setFieldError(
        'rec_cvto_id',
        validationErrors.rec_cvto_id
      );
      frmCadastro.current.setFieldError(
        'rec_grupo_rec',
        validationErrors.rec_grupo_rec
      );
    }
  }

  async function handleCancelar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        if (
          dataGridPesqSelected[0].situacao === '2' ||
          dataGridPesqSelected[0].situacao === '4'
        ) {
          toast.warning(
            'ATENÇÃO!! ESTE TITULO NÃO PODE SER EXCLUÍDO.  VERIFIQUE A SITUACÃO!!!',
            toastOptions
          );
          return;
        }

        const confirmation = await Confirmation.show(
          'VOCÊ TEM CERTEZA QUE QUER EXCLUIR O TITULO???'
        );

        if (confirmation) {
          setLoading(true);
          const url = `v1/fina/ctarec/excluir?rec_id=${dataGridPesqSelected[0].rec_id}`;
          const response = await api.put(url);
          setLoading(false);
          if (response.data.success) {
            await listarCtaRec();
            toast.info('Título excluído com sucesso!!!', toastOptions);
          }
        }
      } else {
        toast.info('Selecione um título para excluir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir título: \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
    } else if (newValue === 1) {
      await handleEdit();
    }
  };

  useEffect(() => {
    frmPesquisa.current.setFieldValue('pesq_data', '1');
    handleGrupoRec();
    comboGeral(35);
    getComboCondVcto();
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

  // #region GRID ITENS  =========================
  const gridColunaItens = [
    {
      field: 'reci_parcela',
      headerName: 'PARCELA',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },

    {
      field: 'reci_data_vencimento',
      headerName: 'VENCIMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'forma_pgto',
      headerName: 'FORMA PAGAMENTO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'reci_data_baixa',
      headerName: 'DATA BAIXA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'reci_situacao',
      headerName: 'SITUAÇÃO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'reci_valor',
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
      field: 'reci_taxa',
      headerName: 'ABATIMENTO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#d81e00', fontWeight: 'bold' },
    },

    {
      field: 'reci_valor_pago',
      headerName: 'VLR A RECEBER',
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
        <BootstrapTooltip title="Excluir Titulo" placement="left">
          <button type="button" onClick={handleCancelar}>
            <FaTrashAlt size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <Linha />
        <DivLimitador hg="20px" />

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
                      loadOptions={loadOptionsCliente}
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
                <h1>CADASTRO TITULOS - CONTAS A RECEBER</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 3fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="rec_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>documento</label>
                    <Input
                      type="text"
                      name="rec_documento"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataEmissao(new Date(date))}
                      value={dataEmissao}
                      label="Data Emissão"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Baixa</label>
                    <Input
                      type="text"
                      name="rec_data_baixa"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="rec_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={cli_id}
                      onChange={(c) => setCli_id(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="grupo de receita"
                      name="rec_grupo_rec"
                      optionsList={optGrupoRec}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="rec_forma_pgto_id"
                      label="Forma de Pagamento"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="INFORME"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="rec_cvto_id"
                      label="Condição de Vencimento"
                      optionsList={optCvto}
                      isClearable
                      placeholder="INFORME"
                      onChange={(cvto) => {
                        if (cvto) {
                          setNParcela(cvto.parcelas);
                        }
                      }}
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Situacao</label>
                    <Input
                      type="text"
                      name="rec_situacao"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Valor Bruto</label>
                    <Input
                      type="text"
                      name="rec_vlr_bruto"
                      className="input_cad"
                      onChange={maskDecimal}
                      onBlur={(e) => {
                        frmCadastro.current.setFieldValue(
                          'rec_vlr_liquido',
                          e.target.value
                        );
                        frmCadastro.current.setFieldValue(
                          'rec_saldo',
                          e.target.value
                        );
                      }}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Juros (Cartão)</label>
                    <Input
                      type="text"
                      name="rec_taxas"
                      className="input_cad"
                      readOnly
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Liquido</label>
                    <Input
                      type="text"
                      name="rec_vlr_liquido"
                      className="input_cad"
                      readOnly
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Saldo Devedor</label>
                    <Input
                      type="text"
                      name="rec_saldo"
                      className="input_cad"
                      readOnly
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Origem Titulo</label>
                    <Input
                      type="text"
                      name="rec_origem"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Informações Adicionais</label>
                    <TextArea type="text" name="rec_observacao" rows="3" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColunaItens}
                      rowData={gridItens}
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
    </>
  );
}
