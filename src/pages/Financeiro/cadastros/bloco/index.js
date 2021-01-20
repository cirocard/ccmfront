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
  FaRegCheckSquare,
  FaSearch,
  FaPlusCircle,
  FaBan,
  FaUserTie,
  FaBriefcase,
  FaEdit,
  FaFileSignature,
  FaPrint,
} from 'react-icons/fa';
import moment from 'moment';
import Confirmation from '~/componentes/DialogChoice';
import Popup from '~/componentes/Popup';
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
  toDecimal,
  DataBd,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  BarPesquisa,
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

export default function FINA8() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmBloco = useRef(null);
  const frmFolhas = useRef(null);
  const frmFolha = useRef(null);
  const frmImpressao = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [dlgNovoBloco, setDlgNovoBloco] = useState(false);
  const [dlgFolha, setDlgFolha] = useState(false);
  const [dlgImpressao, setDlgImpressao] = useState(false);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataGridFolhaSelected, setDataGridFolhaSelected] = useState([]);
  const [infoBloco, setInfoBloco] = useState('');
  const [infoFolha, setInfoFolha] = useState('');
  const [dataIni, setDataIni] = useState(moment().add(15, 'day'));
  const [dataFin, setDataFin] = useState(moment());
  const [dataPrevQuit, setDataPrevQuit] = useState(moment());

  const [clienteImp, setClienteImp] = useState([]);
  const [BliCliente, setBliCliente] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSitBloco = [
    { value: '1', label: 'ATIVO CRIADO' },
    { value: '2', label: 'CANCELADO' },
    { value: '3', label: 'FINALIZADO' },
  ];

  const optSitItemBloco = [
    { value: '1', label: 'ABERTO' },
    { value: '2', label: 'BAIXADO' },
    { value: '3', label: 'CANCELADO' },
  ];

  const optTpData = [
    { value: '1', label: 'DATA DE ABERTURA' },
    { value: '2', label: 'PREVISÃO DE QUITAÇÃO' },
    { value: '3', label: 'DATA DE BAIXA' },
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 24) {
          //
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    bl_numero: Yup.string().required('(??)'),
    bl_folha_ini: Yup.string().required('(??)'),
    bl_folha_fin: Yup.string().required('(??)'),
    bl_descricao: Yup.string().required('(??)'),
  });

  const schemaFolha = Yup.object().shape({
    bli_cli_id: Yup.string().required('(??)'),
    bli_pedido_id: Yup.string().required('(??)'),
    bli_valor: Yup.string().required('(??)'),
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

  // grid folha
  const handleSelectGridFolha = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridFolhaSelected(selectedRows);
  };

  async function listarBloco() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/fina/bloco/listar_bloco?bl_numero=${formPesq.pesq_bl_numero}&bl_situacao=${formPesq.pesq_bl_situacao}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // listar itens do bloco
  async function listarItensBloco() {
    try {
      setLoading(true);
      const formPesq = frmFolhas.current.getData();

      const objPesq = {
        bli_bl_emp_id: null,
        bli_numero_bloco: formPesq.pesq_bli_numero_bloco,
        bli_numero_folha: formPesq.pesq_bli_numero_folha,
        bli_data_abertura: moment(dataIni).format('YYYY-MM-DD'),
        bli_data_baixa: moment(dataFin).format('YYYY-MM-DD'),
        bli_cli_id: BliCliente.value || '',
        bli_situacao: formPesq.pesq_bli_situacao,
      };
      const response = await api.post(
        `v1/fina/bloco/listar_itens_bloco?tpData=${formPesq.tpData}`,
        objPesq
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridItens(dados);
      }
      setDataGridFolhaSelected([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  const limpaFormBloco = () => {
    frmBloco.current.setFieldValue('bl_numero', '');
    frmBloco.current.setFieldValue('bl_folha_ini', '');
    frmBloco.current.setFieldValue('bl_folha_fin', '');
    frmBloco.current.setFieldValue('bl_descricao', '');
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setInfoBloco(`GERENCIAR FOLHAS DO BLOCO`);
        frmFolhas.current.setFieldValue(
          'pesq_bli_numero_bloco',
          dataGridPesqSelected[0].bl_numero
        );

        await listarItensBloco();

        setValueTab(1);
        setLoading(false);
      } else {
        toast.warning(`SELECIONE UM BLOCO PARA GERENCIAR...`, toastOptions);
        setValueTab(0);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar cadastro \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      await listarBloco();
      setValueTab(newValue);
    } else if (newValue === 1) {
      await handleEdit();
    }
  };

  async function handleNovoBloco() {
    setValueTab(0);
    limpaFormBloco();
    setDlgNovoBloco(true);
  }

  async function handleBloco() {
    try {
      setLoading(true);
      const formData = frmBloco.current.getData();
      frmBloco.current.setErrors({});

      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      const bloco = {
        bl_emp_id: null,
        bl_id: null,
        bl_situacao: '1',
        bl_datacad: null,
        bl_folha_ini: parseInt(formData.bl_folha_ini, 10),
        bl_folha_fin: parseInt(formData.bl_folha_fin, 10),
        bl_descricao: formData.bl_descricao.toUpperCase(),
        bl_numero: parseInt(formData.bl_numero, 10),
      };

      const retorno = await api.post('v1/fina/bloco/cadastrar', bloco);

      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        setDlgNovoBloco(false);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      await listarBloco();
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

      frmBloco.current.setFieldError('bl_numero', validationErrors.bl_numero);
      frmBloco.current.setFieldError(
        'bl_folha_ini',
        validationErrors.bl_folha_ini
      );
      frmBloco.current.setFieldError(
        'bl_folha_fin',
        validationErrors.bl_folha_fin
      );
      frmBloco.current.setFieldError(
        'bl_descricao',
        validationErrors.bl_descricao
      );
    }
  }

  async function handlePesquisaFolha() {
    await listarItensBloco();
  }

  async function handleEditarFolha() {
    if (dataGridFolhaSelected.length > 0) {
      setInfoFolha(
        `BLOCO Nº ${dataGridFolhaSelected[0].bli_numero_bloco}  ::  FOLHA ${dataGridFolhaSelected[0].bli_numero_folha}`
      );
      if (dataGridFolhaSelected[0].cli_id) {
        frmFolha.current.setFieldValue('bli_cli_id', {
          value: dataGridFolhaSelected[0].cli_id,
          label: dataGridFolhaSelected[0].cli_razao_social,
        });
      } else {
        frmFolha.current.setFieldValue('bli_cli_id', '');
      }

      frmFolha.current.setFieldValue(
        'bli_pedido_id',
        dataGridFolhaSelected[0].bli_pedido_id
      );
      setDataPrevQuit(DataBd(dataGridFolhaSelected[0].previsao_baixa));
      frmFolha.current.setFieldValue(
        'bli_valor',
        dataGridFolhaSelected[0].bli_valor
      );
      frmFolha.current.setFieldValue(
        'bli_valor_recebido',
        dataGridFolhaSelected[0].bli_valor_recebido
      );
      frmFolha.current.setFieldValue(
        'bli_observacao',
        dataGridFolhaSelected[0].bli_observacao
      );
      setDlgFolha(true);
    } else {
      toast.warning(`SELECIONE UMA FOLHA PARA EDITAR...`, toastOptions);
    }
  }

  async function handleSubmitFolha() {
    try {
      if (
        dataGridFolhaSelected[0].situacao !== 'BAIXADO' &&
        dataGridFolhaSelected[0].situacao !== 'CANCELADO'
      ) {
        setLoading(true);
        const formPesq = frmFolha.current.getData();
        frmFolha.current.setErrors({});

        await schemaFolha.validate(formPesq, {
          abortEarly: false,
        });

        const folha = {
          bli_bl_emp_id: null,
          bli_bl_id: dataGridFolhaSelected[0].bli_bl_id,
          bli_numero_bloco: parseInt(
            dataGridFolhaSelected[0].bli_numero_bloco,
            10
          ),
          bli_numero_folha: parseInt(
            dataGridFolhaSelected[0].bli_numero_folha,
            10
          ),
          bli_data_abertura: dataGridFolhaSelected[0].data_abertura
            ? DataBd(dataGridFolhaSelected[0].data_abertura)
            : moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
          bli_data_quitacao: moment(dataPrevQuit).format('YYYY-MM-DD hh:mm:ss'),
          bli_cli_id: formPesq.bli_cli_id,
          bli_situacao: '1',
          bli_valor: toDecimal(formPesq.bli_valor),
          bli_valor_recebido: toDecimal(formPesq.bli_valor_recebido),
          bli_pedido_id: formPesq.bli_pedido_id,
          bli_observacao: formPesq.bli_observacao,
        };

        const response = await api.put(`v1/fina/bloco/folha`, folha);
        const dados = response.data.retorno;
        if (dados) {
          setGridItens(dados);
        }
        // setCliente([]);
        setDataGridFolhaSelected([]);
        setLoading(false);
        toast.success('Registro Atualizado!!!', toastOptions);
      } else
        toast.error(
          'VOCÊ NÃO PODE ALTERAR ESTA FOLHA. VERIFIQUE A SITUAÇÃO',
          toastOptions
        );
    } catch (e) {
      setLoading(false);
      const validationErrors = {};
      if (e instanceof Yup.ValidationError) {
        e.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else toast.error(`Erro ao salvar folha \n${e}`);

      frmFolha.current.setFieldError('bli_valor', validationErrors.bli_valor);
      frmFolha.current.setFieldError('bli_cli_id', validationErrors.bli_cli_id);
      frmFolha.current.setFieldError(
        'bli_pedido_id',
        validationErrors.bli_pedido_id
      );
    }
  }

  // cancealr
  async function handleCancelarFolha() {
    try {
      const confirmation = await Confirmation.show(
        'VOCÊ TEM CERTEZA QUE QUER CANCEALR ESTA FOLHA???'
      );

      if (confirmation) {
        if (
          dataGridFolhaSelected[0].situacao === 'BAIXADO' ||
          dataGridFolhaSelected[0].situacao === 'CANCELADO'
        ) {
          toast.error(
            'ESTA FOLHA NÃO PODE SER CANCELADA. VERIFIQUE A SITUAÇÃO',
            toastOptions
          );
        } else {
          setLoading(true);
          const folha = {
            bli_bl_emp_id: null,
            bli_bl_id: dataGridFolhaSelected[0].bli_bl_id,
            bli_numero_bloco: parseInt(
              dataGridFolhaSelected[0].bli_numero_bloco,
              10
            ),
            bli_numero_folha: parseInt(
              dataGridFolhaSelected[0].bli_numero_folha,
              10
            ),
            bli_situacao: '3',
          };

          const response = await api.put(`v1/fina/bloco/folha`, folha);
          const dados = response.data.retorno;
          if (dados) {
            setGridItens(dados);
          }
          // setCliente([]);
          setDataGridFolhaSelected([]);
          setLoading(false);
          toast.success('Registro Cancelada!!!', toastOptions);
        }
      }
    } catch (e) {
      setLoading(false);
      toast.error(`Erro ao cancelar folha \n${e}`);
    }
  }

  // baixar
  async function handleBaixarFolha() {
    try {
      const confirmation = await Confirmation.show(
        'CONFIRMA A BAIXA DESTA FOLHA??'
      );

      if (confirmation) {
        if (dataGridFolhaSelected[0].situacao === 'ABERTO') {
          setLoading(true);
          const folha = {
            bli_bl_emp_id: null,
            bli_bl_id: dataGridFolhaSelected[0].bli_bl_id,
            bli_numero_bloco: parseInt(
              dataGridFolhaSelected[0].bli_numero_bloco,
              10
            ),
            bli_numero_folha: parseInt(
              dataGridFolhaSelected[0].bli_numero_folha,
              10
            ),
            bli_data_baixa: moment(dataPrevQuit).format('YYYY-MM-DD hh:mm:ss'),
            bli_situacao: '2',
            bli_valor_recebido:
              toDecimal(dataGridFolhaSelected[0].bli_valor_recebido) > 0
                ? toDecimal(dataGridFolhaSelected[0].bli_valor_recebido)
                : toDecimal(dataGridFolhaSelected[0].bli_valor),
          };

          const response = await api.put(`v1/fina/bloco/folha`, folha);
          const dados = response.data.retorno;
          if (dados) {
            setGridItens(dados);
          }
          // setCliente([]);
          setDataGridFolhaSelected([]);
          setLoading(false);
          toast.success('Registro Baixado!!!', toastOptions);
        } else {
          toast.error(
            'ESTA FOLHA NÃO PODE SER BAIXADA. VERIFIQUE A SITUAÇÃO',
            toastOptions
          );
        }
      }
    } catch (e) {
      setLoading(false);
      toast.error(`Erro ao baixar folha \n${e}`);
    }
  }

  async function handleImpressao() {
    try {
      const formImp = frmImpressao.current.getData();

      if (
        !formImp.imp_bli_cli_id &&
        !formImp.imp_bli_numero_bloco &&
        !formImp.imp_bli_numero_folha &&
        !formImp.imp_bli_pedido_id &&
        !formImp.imp_bli_situacao &&
        !formImp.imp_tpData
      )
        toast.error(
          'INFORME PELO MENOS UM PARÂMETRO DE PESQUISA PARA CONTINUAR...',
          toastOptions
        );
      else {
        setLoading(true);

        const objPesq = {
          bli_bl_emp_id: null,
          bli_numero_bloco: formImp.imp_bli_numero_bloco,
          bli_numero_folha: formImp.imp_bli_numero_folha,
          bli_pedido_id: formImp.imp_bli_pedido_id,
          bli_data_abertura: moment(dataIni).format('YYYY-MM-DD'),
          bli_data_baixa: moment(dataFin).format('YYYY-MM-DD'),
          bli_cli_id: clienteImp.value || '',
          bli_situacao: formImp.imp_bli_situacao,
        };

        const response = await api.post(
          `v1/fina/report/bloco?tpData=${formImp.imp_tpData || ''}`,
          objPesq
        );
        const link = response.data;
        setLoading(false);
        window.open(link, '_blank');
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir bloco \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    listarBloco();
    comboGeral(25);
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'bl_numero',
      headerName: 'Nº BLOCO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'datacad',
      headerName: 'DATA CADASTRO',
      width: 160,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bl_folha_ini',
      headerName: '1º FOLHA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'bl_folha_fin',
      headerName: 'ÚLT. FOLHA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'bl_descricao',
      headerName: 'DESCRIÇÃO',
      width: 400,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID ITENS BLOCO ===============================

  const gridColumnItens = [
    {
      field: 'bli_numero_bloco',
      headerName: 'Nº BLOCO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bli_numero_folha',
      headerName: 'Nº FOLHA',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO FOLHA',
      width: 160,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bli_pedido_id',
      headerName: 'Nº PEDIDO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'NOME CLIENTE',
      width: 330,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'data_abertura',
      headerName: 'DATA ABERTURA',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'previsao_baixa',
      headerName: 'PREVISÃO BAIXA',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'data_baixa',
      headerName: 'DATA BAIXA',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'bli_valor',
      headerName: 'VALOR',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'bli_valor_recebido',
      headerName: 'VALOR RECEBIDO',
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
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="CADASTRAR NOVO BLOCO" placement="left">
          <button type="button" onClick={handleNovoBloco}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="IMPRESSÃO DE BLOCOS" placement="left">
          <button type="button" onClick={() => setDlgImpressao(true)}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ABRIR PEDIDO CONSIGNADO" placement="left">
          <button
            type="button"
            onClick={() => window.open('/fat2/3', '_blank')}
          >
            <FaBriefcase size={25} color="#fff" />
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
            <h1>GERENCIAMENTO DE BLOCOS</h1>
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
                  label="CONSULTAR BLOCOS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="GERENCIAMENTO DE BLOCOS CADASTRADO"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="GERENCIAR BLOCO"
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
                <h1>CONSULTAR BLOCOS CADASTRADOS</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Nº BLOCO</label>
                    <Input
                      type="number"
                      name="pesq_bl_numero"
                      placeholder="Nº bloco"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do bloco"
                      name="pesq_bl_situacao"
                      optionsList={optSitBloco}
                      placeholder="NÃO INFORMADO"
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
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmFolhas" ref={frmFolhas}>
                <h1>{infoBloco}</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="filtrar por data:"
                      name="tpData"
                      optionsList={optTpData}
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
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do item"
                      name="pesq_bli_situacao"
                      optionsList={optSitItemBloco}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 2fr">
                  <AreaComp wd="100">
                    <label>Nº BLOCO</label>
                    <Input
                      type="number"
                      name="pesq_bli_numero_bloco"
                      placeholder="Nº DO BLOCO"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nº FOLHA</label>
                    <Input
                      type="number"
                      name="pesq_bli_numero_folha"
                      placeholder="Nº DA FOLHA"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_bli_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={clienteImp}
                      onChange={(c) => setClienteImp(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <BarPesquisa>
                      <h1>RELAÇÃO DE FOLHAS DO BLOCO</h1>
                      <div>
                        <BootstrapTooltip
                          title="CONSULTAR FOLHAS"
                          placement="left"
                        >
                          <button type="button" onClick={handlePesquisaFolha}>
                            <FaSearch size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>

                        <BootstrapTooltip
                          title="EDITAR FOLHA DO BLOCO"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (dataGridFolhaSelected.length > 0) {
                                handleEditarFolha();
                              } else {
                                toast.warning(
                                  'SELECIONE UMA FOLHA PARA CONTINUAR...',
                                  toastOptions
                                );
                              }
                            }}
                          >
                            <FaEdit size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip
                          title="CANCELAR FOLHA"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (dataGridFolhaSelected.length > 0) {
                                handleCancelarFolha();
                              } else {
                                toast.warning(
                                  'SELECIONE UMA FOLHA PARA CONTINUAR...',
                                  toastOptions
                                );
                              }
                            }}
                          >
                            <FaBan size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip
                          title="BAIXAR/QUITAR FOLHA"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (dataGridFolhaSelected.length > 0) {
                                handleBaixarFolha();
                              } else {
                                toast.warning(
                                  'SELECIONE UMA FOLHA PARA CONTINUAR...',
                                  toastOptions
                                );
                              }
                            }}
                          >
                            <FaRegCheckSquare size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                      </div>
                    </BarPesquisa>

                    <GridContainerItens className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnItens}
                        rowData={gridItens}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onSelectionChanged={handleSelectGridFolha}
                        rowClassRules={{
                          'warn-baixado': function (p) {
                            const baixado = p.data.situacao;
                            return baixado === 'BAIXADO';
                          },
                          'warn-cancelado': function (p) {
                            const baixado = p.data.situacao;
                            return baixado === 'CANCELADO';
                          },
                          'warn-aberto': function (p) {
                            const baixado = p.data.situacao;
                            return baixado === 'ABERTO';
                          },
                        }}
                      />
                    </GridContainerItens>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup CADASTRAR BLOCO... */}
      <Popup
        isOpen={dlgNovoBloco}
        closeDialogFn={() => setDlgNovoBloco(false)}
        title="CADASTRAR NOVO BLOCO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmBloco" ref={frmBloco}>
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <label>Nº Bloco</label>
                <Input
                  type="text"
                  name="bl_numero"
                  placeholder=""
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>

            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <label>Nº primeira folha</label>
                <Input
                  type="text"
                  name="bl_folha_ini"
                  placeholder="INFORME O NÚMERO"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Nº última folha</label>
                <Input
                  type="text"
                  name="bl_folha_fin"
                  placeholder="INFORME O NÚMERO"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Descrição</label>
                <Input
                  type="text"
                  name="bl_descricao"
                  placeholder="OBSERVAÇÕES OPCIONAIS DO BLOCO"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleBloco}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

      {/* popup GERENCIAR FOLHA DO BLOCO... */}
      <Popup
        isOpen={dlgFolha}
        closeDialogFn={() => setDlgFolha(false)}
        title={infoFolha}
        size="md"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmFolha" ref={frmFolha}>
            <BoxItemCad fr="3fr 1fr">
              <AreaComp wd="100">
                <AsyncSelectForm
                  name="bli_cli_id"
                  label="CLIENTE"
                  placeholder="NÃO INFORMADO"
                  defaultOptions
                  cacheOptions
                  value={BliCliente}
                  onChange={(c) => setBliCliente(c || [])}
                  loadOptions={loadOptionsRepresentante}
                  isClearable
                  zindex="152"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Nº Pedido</label>
                <Input
                  type="text"
                  name="bli_pedido_id"
                  placeholder=""
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>

            <BoxItemCad fr="1fr 1fr 1fr">
              <AreaComp wd="100">
                <DatePickerInput
                  onChangeDate={(date) => setDataPrevQuit(new Date(date))}
                  value={dataPrevQuit}
                  label="Previsão Recebimento"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Valor</label>
                <Input
                  type="text"
                  name="bli_valor"
                  onChange={maskDecimal}
                  placeholder="0,00"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Valor Recebido</label>
                <Input
                  type="text"
                  name="bli_valor_recebido"
                  onChange={maskDecimal}
                  placeholder="0,00"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Informações Adicionais</label>
                <TextArea type="text" name="bli_observacao" rows="4" />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleSubmitFolha}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

      {/* popup PARA IMPRESSAO DO BLOCO... */}
      <Popup
        isOpen={dlgImpressao}
        closeDialogFn={() => setDlgImpressao(false)}
        title="IMPRESSÃO DE BLOCO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmImpressao" ref={frmImpressao}>
            <BoxItemCad fr="1fr">
              <AreaComp wd="100">
                <AsyncSelectForm
                  name="imp_bli_cli_id"
                  label="CLIENTE"
                  placeholder="NÃO INFORMADO"
                  defaultOptions
                  cacheOptions
                  value={clienteImp}
                  onChange={(c) => setClienteImp(c || [])}
                  loadOptions={loadOptionsRepresentante}
                  isClearable
                  zindex="153"
                />
              </AreaComp>
            </BoxItemCad>

            <BoxItemCad fr="1fr 1fr 1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="filtrar por data:"
                  name="imp_tpData"
                  optionsList={optTpData}
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
            <BoxItemCad fr="1fr 1fr 1fr">
              <AreaComp wd="100">
                <label>Nº BLOCO</label>
                <Input
                  type="number"
                  name="imp_bli_numero_bloco"
                  placeholder="Nº DO BLOCO"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Nº FOLHA</label>
                <Input
                  type="number"
                  name="imp_bli_numero_folha"
                  placeholder="Nº DA FOLHA"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Nº Pedido</label>
                <Input
                  type="text"
                  name="imp_bli_pedido_id"
                  placeholder=""
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCad fr="1fr 1fr 1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="situação do item"
                  name="imp_bli_situacao"
                  optionsList={optSitItemBloco}
                  isClearable
                  placeholder="INFORME"
                  zindex="152"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleImpressao}
                >
                  {loading ? 'Aguarde Processando...' : 'GERAR IMPRESSÃO'}
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
        title="BLOCOS DE RECEBIMENTO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
