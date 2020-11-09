import React, { useEffect, useState, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { format, parse } from 'date-fns';
import moment from 'moment';
import Select from 'react-select';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { MdClose } from 'react-icons/md';
import {
  FaThList,
  FaSearchDollar,
  FaClipboardList,
  FaSave,
  FaPercent,
  FaCheckCircle,
  FaSearch,
  FaPlusCircle,
  FaCheck,
  FaTrashAlt,
  FaBan,
  FaBarcode,
  FaPrint,
  FaRegCheckSquare,
  FaCartPlus,
  FaCubes,
  FaDollarSign,
  FaUserTie,
  FaCcAmazonPay,
} from 'react-icons/fa';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import DatePickerInput from '~/componentes/DatePickerInput';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import TextArea from '~/componentes/TextArea';
import FormSelect from '~/componentes/Select';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import {
  Container,
  Panel,
  GridContainerItens,
  ToolBar,
  GridContainerMain,
  dvGeral,
} from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  CModal,
  Scroll,
  DivLimitador,
  CCheck,
  Linha,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import Confirmation from '~/componentes/DialogChoice';
import history from '~/services/history';
import {
  a11yProps,
  SeNull,
  maskDecimal,
  ArredondaValorDecimal,
  toDecimal,
  GridCurrencyFormatter,
  FormataMoeda,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';

export default function FAT2() {
  const api = ApiService.getInstance(ApiTypes.API1);
  // const apiGeral = ApiService.getInstance(ApiTypes.GERAL);
  const { params } = useRouteMatch();
  const [titlePg, setTitlePg] = useState('');
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCapa = useRef(null);
  const frmItens = useRef(null);
  const frmGrade = useRef(null);
  const frmDesc = useRef(null);
  const frmFinanceiro = useRef(null);
  const [optOperFat, setOptOperFat] = useState([]);
  const [optCvto, setOptCvto] = useState([]);
  const [optFpgto, setOptFpgto] = useState([]);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [dataEmiss, setDataEmiss] = useState(moment());
  const [dataSaida, setDataSaida] = useState(moment());
  const [pesqCli_id, setPesqCliId] = useState([]);
  const [pesqSituacao, setPesqSituacao] = useState();
  const [loading, setLoading] = useState(false);
  const [openDlgGrade, setOpenDlgGrade] = useState(false);
  const [openDlgDesconto, setOpenDlgDesconto] = useState(false);
  const [openDlgImpressao, setOpenDlgImpressao] = useState(false);
  const [openDlgNota, setOpenDlgNota] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataGridGradeSelected, setDataGridGradeSelected] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [gridGrade, setGridGrade] = useState([]);
  const [gridFinanceiro, setGridFinanceiro] = useState([]);
  const [paramSistema, setParamSistema] = useState([]);
  const [remumoItens, setResumoItens] = useState('');
  const [resumoPedido, setResumoPedido] = useState('');
  const [valorPedido, setValorPedido] = useState(0);
  const [valorPedidoNegociado, setValorPedidoNegociado] = useState(0);
  const [infoVlrPedido, setInfoVlrPedido] = useState('');
  const [infoVlrPedidoNegociado, setInfoVlrPedidoNegociado] = useState('');
  const [titleDlgGrade, setTitleDlgGrade] = useState('');
  const [labelSaldo, setLabelSaldo] = useState('');
  const [selectedProduto, setSelectedProduto] = useState([]);
  const [situacaoPedido, setSituacaoPedido] = useState('');
  const [existeBordero, setExisteBordero] = useState('');
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [desableSave, setDesableSave] = useState(true);
  const [inputDesable, setInputDesable] = useState(true);
  const [disableBtnGrid, setDisableBtnGrid] = useState(false);
  const [representante, setRepresentante] = useState([]);

  let gridItensSelected = [];

  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region VALIDAÇÕES DO YUP =============================================
  const schemaCapa = Yup.object().shape({
    cp_cli_id: Yup.string().required('(??)'),
    cp_oper_id: Yup.string().required('(??)'),
    cp_cvto_id: Yup.string().required('(??)'),
    cp_fpgto_id: Yup.string().required('(??)'),
  });

  const schemaItens = Yup.object().shape({
    item_vlr_unit: Yup.string().required('(??)'),
    item_quantidade: Yup.string().required('(??)'),
  });
  // #endregion

  const optSitPedido = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'NORMAL' },
    { value: '2', label: 'DEVOLVIDO' },
    { value: '3', label: 'CANCELADO' },
    { value: '4', label: 'DEVOLUÇÕES' },
    { value: '10', label: 'FINALIZADO' },
  ];

  // #region COMBOS ===========================================================

  // cliente
  const loadOptionsCliente = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();
      const tipo = params.tipo === '2' ? '1' : '2';
      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=${tipo}&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=${tipo}&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // representante
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
          `v1/combos/combo_cliente?perfil=23&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // produto
  const loadOptions = async (inputText, callback) => {
    if (frmItens.current) {
      const formData = frmItens.current.getData();
      if (formData.item_tab_preco_id) {
        const descricao = inputText.toUpperCase();
        if (descricao.length > 2) {
          const response = await api.get(
            `v1/combos/produto?descricao=${descricao}`
          );

          callback(
            response.data.retorno.map((i) => ({
              value: i.value,
              label: i.label,
            }))
          );
        }
      } else {
        toast.warning(
          'ATENÇÃO!! INFORME A TABELA DE PREÇOS PARA CONTINUAR...',
          toastOptions
        );
      }
    }
  };

  // forma pagamento
  async function getComboFpgto() {
    try {
      const response = await api.get(`v1/combos/geral/6`);
      const dados = response.data.retorno;
      if (dados) {
        setOptFpgto(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo forma de pagamento \n${error}`);
    }
  }

  // condicao de vencimento
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

  // operacao de faturamento
  async function getComboOperFat() {
    try {
      const response = await api.get(`v1/combos/operfat/1`);
      const dados = response.data.retorno;
      if (dados) {
        setOptOperFat(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Operaçao de faturamento \n${error}`);
    }
  }

  // tabela de preços
  async function getComboTabPreco() {
    try {
      const response = await api.get('v1/combos/tabpreco');
      const dados = response.data.retorno;
      if (dados) {
        setOptTabPreco(dados);
      }
    } catch (error) {
      toast.error(`Houve um erro ao buscar tabelas de preço \n${error}`);
    }
  }

  // #endregion

  // parametros do sistema
  async function getParamSistema() {
    try {
      const response = await api.get(`v1/cadastros/param`);
      const dados = response.data.retorno;
      if (dados) {
        setParamSistema(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar parametros do sistema \n${error}`);
    }
  }

  // limpa tela itens
  function limpaItens() {
    frmItens.current.setFieldValue('item_quantidade', '');
    frmItens.current.setFieldValue('item_vlr_unit', '');
    frmItens.current.setFieldValue('item_vlr_desc', '');
    frmItens.current.setFieldValue('item_perc_desc', '');
    frmItens.current.setFieldValue('item_valor_total', '');
    frmItens.current.setFieldValue('barcode', '');
    frmItens.current.setFieldValue('item_prod_id', '');
    document.getElementById('chbBonificar').checked = false;
  }

  // fazer consulta dos pedidos
  async function listaPedido() {
    try {
      setLoading(true);

      const prm = {
        emp_id: null,
        filtraUsr: null, // TRATAR NA APIN
        usr_id: null,
        numero: document.getElementsByName('pesq_cp_id')[0].value,
        cli_id: pesqCli_id.value,
        data_ini: moment(pesqDataIni).format('YYYY-MM-DD'),
        data_fin: moment(pesqDataFin).format('YYYY-MM-DD'),
        situacao: pesqSituacao, // situacao pedido
        status: null,
        nfce: 'N', // S/N
        cpf_consumidor: null,
        naovalidado: document.getElementById('chbNaoValidado').checked,
        perfil: params.tipo,
      };

      const response = await api.post('v1/fat/lista_pedido', prm);
      const dados = response.data.retorno;
      if (dados) {
        setResumoPedido(response.data.message);
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar pedidos\n${error}`);
    }
  }

  // fazer consulta dos itens
  async function listaItens(limit) {
    try {
      setLoading(true);
      const formData = frmCapa.current.getData();

      const url = `v1/fat/itens_pedido?cp_id=${formData.cp_id}&item_id=&limit=${
        limit || ''
      }&prod_id=`;

      let response = await api.get(url);
      const dados = response.data.retorno;
      if (dados) {
        setGridItens(dados);
      }

      // resumo itens
      response = await api.get(
        `v1/fat/resumo_itens_pedido?cp_id=${formData.cp_id}`
      );
      if (response.data.success) {
        setResumoItens(response.data.retorno);
      } else {
        toast.error(`Erro ao totalizar Itens: \n${response.data.errors}`);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  function handleDashboard() {
    history.push('/fat1', '_blank');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  async function handleNovoPedido() {
    setSituacaoPedido('1');
    setExisteBordero('N');
    setGridItens([]);
    setDataGridPesqSelected([]);
    frmCapa.current.setFieldValue('cp_id', '');
    setDataEmiss(new Date());
    setDataSaida(new Date());
    frmCapa.current.setFieldValue('cp_cli_id', '');
    frmCapa.current.setFieldValue('cp_cvto_id', '');
    frmCapa.current.setFieldValue('cp_fpgto_id', '');
    frmCapa.current.setFieldValue('cp_oper_id', '');
    frmCapa.current.setFieldValue('cp_vlr_total', 0);
    frmCapa.current.setFieldValue('cp_vlr_outros', 0);
    frmCapa.current.setFieldValue('cp_credito_cli', 0);
    frmCapa.current.setFieldValue('cp_vlr_desc', 0);
    frmCapa.current.setFieldValue('cp_vlr_nf', 0);
    frmCapa.current.setFieldValue('cp_observacao', '');
    frmCapa.current.setFieldValue('valor_cota', '');
    frmCapa.current.setFieldValue('cp_representante', '');
    let x;

    if (params.tipo === '2') {
      x = optTabPreco.find(
        (op) =>
          op.value.toString() ===
          paramSistema[0].par_tab_padrao_prevenda.toString()
      );
    } else {
      x = optTabPreco.find(
        (op) =>
          op.value.toString() ===
          paramSistema[0].par_tab_padrao_consignado.toString()
      );
    }
    frmItens.current.setFieldValue('item_tab_preco_id', x);

    setDesableSave(false);
    setValueTab(1);
  }

  async function handleDlgImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setOpenDlgImpressao(true);
      } else {
        toast.info('Selecione um pedido para imprimir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir pedido \n${error}`, toastOptions);
    }
  }

  // impressao do pedido
  async function handleImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        const ordem = document.getElementById('rbOrdemReferencia').checked
          ? '1'
          : '2';
        const url = `v1/fat/report/espelho_pedido?cp_id=${dataGridPesqSelected[0].cp_id}
                     &ordenar=${ordem}&conferencia=N&tipo=${params.tipo}`;

        const response = await api.get(url);
        const link = response.data;
        setLoading(false);
        window.open(link, '_blank');
      } else {
        toast.info('Selecione um pedido para imprimir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir pedido \n${error}`, toastOptions);
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setSituacaoPedido(dataGridPesqSelected[0].situacao);
        setExisteBordero(dataGridPesqSelected[0].cp_status_bordero);
        frmCapa.current.setFieldValue('cp_id', dataGridPesqSelected[0].cp_id);
        setDataEmiss(
          parse(dataGridPesqSelected[0].cp_data_emis, 'dd/MM/yyyy', new Date())
        );
        setDataSaida(
          parse(dataGridPesqSelected[0].cp_data_saida, 'dd/MM/yyyy', new Date())
        );

        let x = {
          value: dataGridPesqSelected[0].cli_id,
          label: dataGridPesqSelected[0].cli_razao_social,
        };
        frmCapa.current.setFieldValue('cp_cli_id', x);

        x = optCvto.find(
          (op) =>
            op.value.toString() ===
            dataGridPesqSelected[0].cp_cvto_id.toString()
        );
        frmCapa.current.setFieldValue('cp_cvto_id', x);

        x = optFpgto.find(
          (op) =>
            op.value.toString() ===
            dataGridPesqSelected[0].cp_fpgto_id.toString()
        );
        frmCapa.current.setFieldValue('cp_fpgto_id', x);

        x = optOperFat.find(
          (op) =>
            op.value.toString() ===
            dataGridPesqSelected[0].cp_oper_id.toString()
        );
        frmCapa.current.setFieldValue('cp_oper_id', x);
        frmCapa.current.setFieldValue(
          'cp_vlr_total',
          dataGridPesqSelected[0].cp_vlr_total
        );
        frmCapa.current.setFieldValue(
          'cp_vlr_outros',
          dataGridPesqSelected[0].cp_vlr_outros
        );
        frmCapa.current.setFieldValue(
          'cp_credito_cli',
          dataGridPesqSelected[0].cp_credito_cli
        );
        frmCapa.current.setFieldValue(
          'cp_vlr_desc',
          dataGridPesqSelected[0].cp_vlr_desc
        );
        frmCapa.current.setFieldValue(
          'cp_vlr_nf',
          dataGridPesqSelected[0].cp_vlr_nf
        );
        frmCapa.current.setFieldValue(
          'cp_observacao',
          dataGridPesqSelected[0].cp_observacao
        );
        frmCapa.current.setFieldValue(
          'valor_cota',
          dataGridPesqSelected[0].valor_cota
        );

        if (params.tipo === '2') {
          x = optTabPreco.find(
            (op) =>
              op.value.toString() ===
              paramSistema[0].par_tab_padrao_prevenda.toString()
          );
        } else {
          x = optTabPreco.find(
            (op) =>
              op.value.toString() ===
              paramSistema[0].par_tab_padrao_consignado.toString()
          );
        }
        frmItens.current.setFieldValue('item_tab_preco_id', x);

        await loadOptionsRepresentante(
          dataGridPesqSelected[0].cp_representante,
          setRepresentante
        );

        setValueTab(1);
        setDesableSave(false);
        setLoading(false);
      } else {
        setValueTab(0);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar pedido \n${error}`, toastOptions);
    }
  }

  async function handleSubmitCapa() {
    if (parseInt(valueTab, 10) > 0) {
      const formCapa = frmCapa.current.getData();
      try {
        frmCapa.current.setErrors({});

        await schemaCapa.validate(formCapa, {
          abortEarly: false,
        });
        // verificar situacao
        if (situacaoPedido !== '1' && valueTab.toString() !== '3') {
          toast.warning(
            'Atenção!! Este Pedido não pode mais ser alterado. Verifique a situaçao!!!',
            toastOptions
          );
          return;
        }

        // verificar bordero
        if (existeBordero === 'S') {
          toast.warning(
            'Atenção!! Este Pedido não pode mais ser alterado. Verifique a situaçao!!!',
            toastOptions
          );
          return;
        }
        setDesableSave(true);
        setLoading(true);

        const capa = {
          cp_base_icms: null,
          cp_base_ipi: null,
          cp_base_subst: null,
          cp_chave_complementar: null,
          cp_cli_emp_id: null,
          cp_cli_id: formCapa.cp_cli_id,
          cp_contingencia: '1', // normal
          cp_cvto_emp_id: null,
          cp_cvto_id: formCapa.cp_cvto_id,
          cp_data_emis: format(dataEmiss, 'yyyy-MM-dd HH:mm:ss'),
          cp_data_saida: format(dataSaida, 'yyyy-MM-dd HH:mm:ss'),
          cp_emp_id: null,
          cp_finnfe: '1',
          cp_fpgto_id: formCapa.cp_fpgto_id,
          cp_fpgto_tab_id: '6',
          cp_id: formCapa.cp_id ? formCapa.cp_id : null,
          cp_indfinal: '0',
          cp_indpres: '9',
          cp_local_exporta: null,
          cp_num_nf: null,
          cp_num_nf_dev: null,
          cp_observacao: formCapa.cp_observacao,
          cp_oper_emp_id: null,
          cp_oper_id: formCapa.cp_oper_id,
          cp_serie_nf: null,
          cp_serie_nf_dev: null,
          cp_situacao: situacaoPedido,
          cp_status_sefaz: '1', // aguardando transmissão
          cp_perfil: params.tipo,
          cp_tpamb: null,
          cp_tpemis: null,
          cp_tpnf: null,
          cp_modfrete: '0',
          cp_transp_emp_id: null,
          cp_transp_id: null,
          cp_vlr_cofins: null,
          cp_vlr_frete: null,
          cp_vlr_icms: null,
          cp_vlr_ipi: null,
          cp_vlr_nf: null,
          cp_vlr_outros: toDecimal(formCapa.cp_vlr_outros),
          cp_vlr_pis: null,
          cp_vlr_subst: null,
          // cp_credito_cli: toDecimal(formCapa.cp_credito_cli),
          cp_vlr_total: toDecimal(formCapa.cp_valor_total),
          cp_qvol: null,
          cp_usr_id: null,
          cp_tipo_doc: '3',
          cp_representante: formCapa.cp_representante || null,
        };

        const obj = {
          emp_id: null,
          usr_id: null,
          capa,
          itens: [],
        };

        const retorno = await api.post('v1/fat/pedido', obj);

        if (retorno.data.success) {
          if (retorno.data.retorno.cp_id) {
            frmCapa.current.setFieldValue('cp_id', retorno.data.retorno.cp_id);
            frmCapa.current.setFieldValue(
              'cp_vlr_total',
              retorno.data.retorno.cp_vlr_total
            );
            frmCapa.current.setFieldValue(
              'cp_vlr_outros',
              retorno.data.retorno.cp_vlr_outros
            );
            frmCapa.current.setFieldValue(
              'cp_credito_cli',
              retorno.data.retorno.cp_credito_cli
            );
            frmCapa.current.setFieldValue(
              'cp_vlr_desc',
              retorno.data.retorno.cp_vlr_desc
            );
            frmCapa.current.setFieldValue(
              'cp_vlr_nf',
              retorno.data.retorno.cp_vlr_nf
            );
          }
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
        setDesableSave(false);
        setLoading(false);
      } catch (err) {
        setDesableSave(false);
        setLoading(false);
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
        } else {
          toast.error(`Erro ao salvar pedido: ${err}`, toastOptions);
        }

        frmCapa.current.setFieldError('cp_cli_id', validationErrors.cp_cli_id);
        frmCapa.current.setFieldError(
          'cp_oper_id',
          validationErrors.cp_oper_id
        );
        frmCapa.current.setFieldError(
          'cp_cvto_id',
          validationErrors.cp_cvto_id
        );
        frmCapa.current.setFieldError(
          'cp_fpgto_id',
          validationErrors.cp_fpgto_id
        );
      }
    } else {
      toast.info(
        `Altere ou inicie o cadastro de um novo pedido para salvar...`,
        toastOptions
      );
    }
  }

  async function totalItem() {
    const formData = frmItens.current.getData();
    // se bonificaçao
    if (document.getElementById('chbBonificar').checked) {
      frmItens.current.setFieldValue(
        'item_vlr_desc',
        ArredondaValorDecimal(
          toDecimal(formData.item_quantidade) *
            toDecimal(formData.item_vlr_unit)
        )
      );
      frmItens.current.setFieldValue('item_perc_desc', 100);
    } // se informou percentual de desconto (prioridade)
    else if (toDecimal(SeNull(formData.item_perc_desc, '0')) > 0) {
      frmItens.current.setFieldValue(
        'item_vlr_desc',
        ArredondaValorDecimal(
          (toDecimal(formData.item_quantidade) *
            toDecimal(formData.item_vlr_unit) *
            toDecimal(formData.item_perc_desc)) /
            100
        )
      );
    } // se informou o valor do desconto
    else if (toDecimal(SeNull(formData.item_vlr_desc, '0')) > 0) {
      frmItens.current.setFieldValue(
        'item_perc_desc',
        ArredondaValorDecimal(
          (toDecimal(formData.item_vlr_desc) /
            (toDecimal(formData.item_quantidade) *
              toDecimal(formData.item_vlr_unit))) *
            100
        )
      );
    }

    frmItens.current.setFieldValue(
      'item_valor_total',
      ArredondaValorDecimal(
        toDecimal(formData.item_quantidade) * toDecimal(formData.item_vlr_unit)
      )
    );
  }

  // cancelar pedido
  async function handleCancelar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        const confirmation = await Confirmation.show(
          'VOCÊ TEM CERTEZA QUE QUER CANCEALR O PEDIDO???'
        );

        if (confirmation) {
          setLoading(true);

          const url = `v1/fat/cancelar_pedido?cp_id=${dataGridPesqSelected[0].cp_id}&cli_id=${dataGridPesqSelected[0].cli_id}`;
          const response = await api.put(url);
          setLoading(false);
          if (response.data.success) {
            await listaPedido();
            toast.info('Pedido Cancelado com sucesso!!!', toastOptions);
          }
        }
      } else {
        toast.info('Selecione um pedido para cancelar', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao cancelar pedido \n${error}`, toastOptions);
    }
  }

  // gerar nota fiscal
  async function handleGerarNota() {
    if (dataGridPesqSelected.length > 0) {
      if (dataGridPesqSelected[0].situacao === '3') {
        toast.warning(
          'Atenção!! Este Pedido está cancelado. A nota não poderá ser gerada',
          toastOptions
        );
      } else {
        setLoading(true);
        const tp_doc = document.getElementById('rbNota').checked ? '1' : '2';
        const response = await api.post(
          `v1/fat/gerar_nota?cp_id=${dataGridPesqSelected[0].cp_id}&tp_doc=${tp_doc}`
        );

        setLoading(false);
        setOpenDlgNota(false);
        if (response.data.success) {
          await listaPedido();
          toast.info(response.data.retorno, toastOptions);
        }
      }
    } else {
      toast.info('Selecione um pedido para gerar a nota', toastOptions);
    }
  }

  // validar pedido
  async function handleValidarPedido() {
    if (dataGridPesqSelected.length > 0) {
      if (
        dataGridPesqSelected[0].situacao === '3' ||
        dataGridPesqSelected[0].situacao === '10'
      ) {
        toast.warning(
          'Atenção!! Este Pedido não pode ser validado. Verifique se não está cancelado ou finalizado',
          toastOptions
        );
      } else {
        setLoading(true);
        const response = await api.put(
          `v1/fat/validar_pedido?cp_id=${dataGridPesqSelected[0].cp_id}`
        );

        if (response.data.success) {
          const url = `v1/fat/report/espelho_pedido?cp_id=${dataGridPesqSelected[0].cp_id}
          &ordenar=2&conferencia=S&tipo=${params.tipo}`;

          const rel = await api.get(url);
          setLoading(false);

          if (rel.data.toString() === '0') {
            toast.info('PEDIDO VALIDADO COM SUCESSO!!!', toastOptions);
          } else {
            const link = rel.data;
            window.open(link, '_blank');
          }
        }
      }
    } else {
      toast.info('Selecione um pedido para validar', toastOptions);
    }
  }

  // finalizar pedido
  async function handleFinalizarPedido() {
    try {
      if (dataGridPesqSelected.length > 0) {
        const confirmation = await Confirmation.show(
          'Deseja realmente FINALIZAR o pedido???'
        );

        if (confirmation) {
          setLoading(true);

          const url = `v1/fat/finalizar_pedido?cp_id=${dataGridPesqSelected[0].cp_id}&situacao=10`;
          const response = await api.put(url);
          setLoading(false);
          if (response.data.success) {
            await listaPedido();
            toast.info('Pedido finalizado com sucesso!!!', toastOptions);
          }
        }
      } else {
        toast.info('Selecione um pedido para finalizar', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao finalizar pedido \n${error}`, toastOptions);
    }
  }

  // adiconar itens
  async function handleSubmitItens() {
    try {
      await totalItem();
      const formItens = frmItens.current.getData();
      const formCapa = frmCapa.current.getData();

      frmItens.current.setErrors({});
      await schemaItens.validate(formItens, {
        abortEarly: false,
      });

      // verificar situacao
      let sit = situacaoPedido;
      if (!sit) sit = '1';

      if (sit !== '1') {
        toast.warning(
          'Atenção!! Este Pedido não pode mais ser alterado. Verifique a situaçao!!!',
          toastOptions
        );
        return;
      }

      // verificar bordero
      if (existeBordero === 'S') {
        toast.warning(
          'Atenção!! Este Pedido não pode mais ser alterado. Verifique a situaçao!!!',
          toastOptions
        );
        return;
      }

      setLoading(true);
      setInputDesable(true);
      if (dataGridGradeSelected.prode_id)
        gridItensSelected = dataGridGradeSelected;

      const itensPedido = [
        {
          item_cp_id: formCapa.cp_id,
          item_tab_preco_id:
            formItens.item_tab_preco_id || gridItensSelected.item_tab_preco_id,
          item_prod_id:
            gridItensSelected.prod_id || gridItensSelected.item_prod_id,
          item_prode_id: gridItensSelected.prode_id,
          item_prod_unidade: gridItensSelected.prod_unidade_venda,
          item_qtd_bonificada: document.getElementById('chbBonificar').checked
            ? formItens.item_quantidade
            : null,
          item_vlr_unit: toDecimal(formItens.item_vlr_unit),
          item_quantidade: toDecimal(formItens.item_quantidade),
          item_perc_desc: document.getElementById('chbBonificar').checked
            ? 100
            : toDecimal(formItens.item_perc_desc),
          item_vlr_desc: toDecimal(formItens.item_vlr_desc),
          item_valor_total: toDecimal(formItens.item_valor_total),
          item_tab_preco_vigencia: format(
            new Date(
              gridItensSelected.tab_data_vigencia ||
                Date.parse(
                  gridItensSelected.item_tab_preco_vigencia.substring(0, 19)
                )
            ),
            'yyyy-MM-dd HH:mm:ss'
          ),
          item_cfop: null,
          item_cst: null,
          item_id: null,
          item_aliq_cofins: null,
          item_aliq_icms: null,
          item_aliq_icms_red: null,
          item_aliq_ipi: null,
          item_aliq_pis: null,
          item_aliq_subst: null,
          item_base_cofins: null,
          item_base_icms: null,
          item_base_icms_red: null,
          item_base_ipi: null,
          item_base_pis: null,
          item_base_subst: null,
          item_vlr_cofins: null,
          item_vlr_frete: null,
          item_vlr_icms: null,
          item_vlr_icms_red: null,
          item_vlr_ipi: null,
          item_vlr_outros: null,
          item_vlr_pis: null,
          item_vlr_subst: null,
        },
      ];

      const obj = {
        emp_id: null,
        usr_id: null,
        capa: null,
        itens: itensPedido,
      };

      const retorno = await api.post('v1/fat/pedido', obj);
      if (retorno.data.success) {
        // await listaItens(formCapa.cp_id, 30);
        setGridItens(retorno.data.retorno);
        setResumoItens(retorno.data.message);
        limpaItens();
        gridItensSelected = [];
        setDataGridGradeSelected([]);
        document.getElementsByName('barcode')[0].focus();
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      setInputDesable(false);
      setLoading(false);
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setInputDesable(false);
        setLoading(false);
        toast.error(`Erro adicionar item: ${err}`, toastOptions);
      }

      frmItens.current.setFieldError(
        'item_vlr_unit',
        validationErrors.item_vlr_unit
      );
      frmItens.current.setFieldError(
        'item_quantidade',
        validationErrors.item_quantidade
      );
    }
  }

  async function handleFormdDesconto() {
    const formCapa = frmCapa.current.getData();
    if (valueTab == '1' && formCapa.cp_id) {
      frmDesc.current.setFieldValue('perc_desconto', '');
      frmDesc.current.setFieldValue('vlr_desconto', '');
      setOpenDlgDesconto(true);
    } else {
      toast.info(
        'Para aplicar desconto, é necessário abrir um pedido',
        toastOptions
      );
    }
  }

  async function handleDesconto(formData) {
    try {
      if (formData.perc_desconto || formData.vlr_desconto) {
        setLoading(true);
        const formCapa = frmCapa.current.getData();
        const response = await api.put(
          `v1/fat/aplicar_desconto?cp_id=${formCapa.cp_id}&perc=${formData.perc_desconto}
        &valor=${formData.vlr_desconto}`
        );

        if (response.data.success) {
          await handleSubmitCapa();
        } else {
          toast.error(`Erro ao aplicar desconto: ${response.data.message}`);
        }
        setLoading(false);
        setOpenDlgDesconto(false);
      } else {
        toast.info(
          'Para aplicar desconto, é necessário informar o valor ou o percentual',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao aplicar desconto: ${error}`);
    }
  }

  async function handleDeleteItem(param) {
    try {
      if (param.prode_id) {
        let situ = '';
        let sitBordero;
        setSituacaoPedido((prevState) => {
          situ = prevState;
          return prevState;
        });

        setExisteBordero((prevState) => {
          sitBordero = prevState;
          return prevState;
        });

        if (situ == '1') {
          if (sitBordero == 'N') {
            setLoading(true);
            const formCapa = frmCapa.current.getData();
            const response = await api.delete(
              `v1/fat/excluir_item_pedido?cp_id=${formCapa.cp_id}&prode_id=${param.prode_id}
              &cli_id=${formCapa.cp_cli_id}&cp_perfil=${params.tipo}`
            );
            if (response.data.success) {
              await listaItens(formCapa.cp_id, '');
            } else {
              toast.error(
                `Erro ao excluir item do pedido: ${response.data.message}`
              );
            }
            setLoading(false);
          } else {
            toast.warning(
              `ATENÇÃO!! ESTE PEDIDO NÃO PODE MAIS SER ALTERADO. EXISTE BORDERÔ ABERTO`,
              toastOptions
            );
          }
        } else {
          toast.warning(
            `ATENÇÃO!! ESTE PEDIDO NÃO PODE MAIS SER ALTERADO.  VERIFIQUE A SITUAÇÃO`,
            toastOptions
          );
        }
      } else {
        toast.error(
          `ATENÇÃO!! ESTE ITEM NÃO PODE SER EXCLUÍDO. NÃO FOI ENCONTRADO CONFIGURAÇÃO DE ESTOQUE PARA ELE`,
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir cadastro: ${error}`);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      setDesableSave(true);
      frmCapa.current.setFieldValue('cp_id', '');
      setDataGridPesqSelected([]);
      setGridPesquisa([]);
      await listaPedido();
      setPesqCliId([]);
      setValueTab(newValue);
    } else if (newValue === 1) {
      // capa do pedido
      const formCapa = frmCapa.current.getData();
      if (formCapa.cp_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    } else if (newValue === 2) {
      // itens
      limpaItens();
      if (dataGridPesqSelected.length > 0) {
        await handleEdit();
        await listaItens();
        setInputDesable(false);
        setValueTab(newValue);
      } else if (valueTab === 1) {
        const formData = frmCapa.current.getData();
        if (formData.cp_id) {
          // se ja existe o pedido
          await listaItens();
          setInputDesable(false);
          setValueTab(newValue);
        } else {
          toast.info(
            `SALVE O PEDIDO ANTES DE INFORMAR OU CONSULTAR OS ITENS...`,
            toastOptions
          );
        }
      } else {
        toast.info('SELECIONE UM PEDIDO PARA CONSULTAR', toastOptions);
      }
    } else if (newValue === 3) {
      if (dataGridPesqSelected.length > 0) {
        if (dataGridPesqSelected[0].situacao === '10') {
          setInfoVlrPedido(
            `VALOR ATUAL DO PEDIDO PEDIDO: ${FormataMoeda(
              dataGridPesqSelected[0].cp_vlr_nf
            )}`
          );
          frmCapa.current.setFieldValue('cp_id', dataGridPesqSelected[0].cp_id);
          setValorPedido(toDecimal(dataGridPesqSelected[0].cp_vlr_nf));
          setValueTab(newValue);
        } else {
          toast.info('SELECIONE UM PEDIDO FINALIZADO', toastOptions);
        }
      } else {
        toast.info('SELECIONE UM PEDIDO FINALIZADO', toastOptions);
      }
    }
  };

  // credito do cliente
  async function handleCreditoCli() {
    try {
      const formCapa = frmCapa.current.getData();
      if (valueTab == '1' && formCapa.cp_id) {
        if (toDecimal(formCapa.cp_credito_cli) === 0) {
          setLoading(true);
          if (pesqCli_id.value) {
            const response = await api.get(
              `v1/fat/credito_cliente/${pesqCli_id.value}/${formCapa.cp_id}`
            );
            const dados = response.data.retorno;
            if (dados) {
              frmCapa.current.setFieldValue('cp_credito_cli', dados[0].credito);
            } else {
              frmCapa.current.setFieldValue('cp_credito_cli', 0);
            }
          } else {
            frmCapa.current.setFieldValue('cp_credito_cli', 0);
          }
          await handleSubmitCapa();
          setLoading(false);
        } else {
          toast.info('Crédito já aplicado!!!', toastOptions);
        }
      } else {
        toast.info(
          'Abra o pedido, para que seja aplicado o crédito do cliente...',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar credito cliente\n${error}`, toastOptions);
    }
  }

  // change select  produto - abrir popup grade
  async function handleChangeSelectProduto(p) {
    try {
      setLoading(true);
      setSelectedProduto(p);
      if (p.value) {
        if (!frmItens.current.getData().barcode) {
          const tab_id = frmItens.current.getData().item_tab_preco_id;
          const url = `v1/fat/grade_produto?prod_id=${p.value}&marca_id=&classific1=&classific2=&classific3=&tab_id=${tab_id}`;
          const response = await api.get(url);
          const dados = response.data.retorno;
          if (dados) {
            setGridGrade(dados);
            setTitleDlgGrade(`ITEM SELECIONADO: ${p.label} :: ESCOLHA A GRADE`);
            setOpenDlgGrade(true);
          }
        }
      } else {
        setLabelSaldo('');
        frmItens.current.setFieldValue('item_quantidade', '');
        frmItens.current.setFieldValue('item_vlr_unit', '');
        frmItens.current.setFieldValue('barcode', '');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  // selecionar um produto na grade de produto
  const handleSelectItemGrade = async (prm) => {
    setOpenDlgGrade(false);
    if (prm) {
      setLabelSaldo(`SALDO ATUAL DO ITEM: ${prm.prode_saldo}`);
      frmItens.current.setFieldValue('item_quantidade', 1);
      frmItens.current.setFieldValue('item_vlr_unit', prm.tab_preco_final);
      gridItensSelected = prm;
      setDataGridGradeSelected(prm);
      document.getElementsByName('item_vlr_unit')[0].readOnly =
        toDecimal(prm.tab_preco_final) > 0;

      await totalItem();
    }
    document.getElementsByName('item_quantidade')[0].focus();
  };

  // evento barcode
  async function exitBarcode() {
    try {
      const { barcode, item_tab_preco_id } = frmItens.current.getData();
      if (barcode) {
        if (barcode.length === 12) {
          setInputDesable(true);
          let prode = barcode.substring(2, 11);
          prode = parseInt(prode, 10);
          if (item_tab_preco_id) {
            setLoading(true);
            const url = `v1/fat/grade_produto?prod_id=&marca_id=&classific1=&classific2=&classific3=&tab_id=${item_tab_preco_id}&prode_id=${prode}`;
            const response = await api.get(url);
            const dados = response.data.retorno;
            if (dados[0]) {
              gridItensSelected = dados[0];
              // setDataGridGradeSelected(dados[0]);
              setLabelSaldo(`SALDO ATUAL DO ITEM: ${dados[0].prode_saldo}`);
              frmItens.current.setFieldValue('item_quantidade', 1);
              frmItens.current.setFieldValue(
                'item_vlr_unit',
                dados[0].tab_preco_final
              );
              document.getElementsByName('item_vlr_unit')[0].readOnly =
                toDecimal(dados[0].tab_preco_final) > 0;

              const x = {
                value: dados[0].prod_id,
                label: dados[0].prod_descricao,
              };
              frmItens.current.setFieldValue('item_prod_id', x);

              await totalItem();
              await handleSubmitItens(); // tratar com parametros
              setInputDesable(false);
              frmItens.current.setFieldValue('barcode', '');
              document.getElementsByName('barcode')[0].focus();
            } else {
              toast.info('ATENÇÃO!! PRODUTO NÃO ENCONTRADO', toastOptions);
            }
          } else {
            toast.warning(
              'ATENÇÃO!! INFORME A TABELA DE PREÇOS PARA CONTINUAR...',
              toastOptions
            );
            setLabelSaldo('');
            frmItens.current.setFieldValue('item_quantidade', '');
            frmItens.current.setFieldValue('item_vlr_unit', '');
          }
          setInputDesable(false);
          setLoading(false);
        } else {
          toast.error('O código informado não é valido', toastOptions);
        }
      }
    } catch (error) {
      setInputDesable(false);
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  const handleEditarQuantidade = async (prm) => {
    try {
      if (prm.data.prode_id) {
        let situ = '';
        let sitBordero;
        setSituacaoPedido((prevState) => {
          situ = prevState;
          return prevState;
        });

        setExisteBordero((prevState) => {
          sitBordero = prevState;
          return prevState;
        });

        if (situ == '1') {
          if (sitBordero == 'N') {
            setLoading(true);
            const formCapa = frmCapa.current.getData();
            const response = await api.delete(
              `v1/fat/excluir_item_pedido?cp_id=${formCapa.cp_id}&prode_id=${prm.data.prode_id}
              &cli_id=${formCapa.cp_cli_id}&cp_perfil=${params.tipo}`
            );
            if (response.data.success) {
              await listaItens(formCapa.cp_id, '');
            } else {
              toast.error(
                `Erro ao excluir item do pedido: ${response.data.message}`
              );
            }
            setLoading(false);

            // adicionar nova quantidade
            gridItensSelected = prm.data;
            frmItens.current.setFieldValue(
              'item_vlr_unit',
              prm.data.item_vlr_unit
            );
            frmItens.current.setFieldValue(
              'item_quantidade',
              prm.data.item_quantidade
            );
            frmItens.current.setFieldValue(
              'item_vlr_desc',
              prm.data.item_vlr_desc
            );
            frmItens.current.setFieldValue(
              'item_perc_desc',
              prm.data.item_perc_desc
            );

            await handleSubmitItens();
          } else {
            toast.warning(
              `ATENÇÃO!! ESTE PEDIDO NÃO PODE MAIS SER ALTERADO. EXISTE BORDERÔ ABERTO`,
              toastOptions
            );
          }
        } else {
          toast.warning(
            `ATENÇÃO!! ESTE PEDIDO NÃO PODE MAIS SER ALTERADO.  VERIFIQUE A SITUAÇÃO`,
            toastOptions
          );
        }
      } else {
        toast.error(
          `ATENÇÃO!! ESTE ITEM NÃO PODE SER EXCLUÍDO. NÃO FOI ENCONTRADO CONFIGURAÇÃO DE ESTOQUE PARA ELE`,
          toastOptions
        );
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao alterar quantidade: ${err}`, toastOptions);
    }
  };

  const gridValidationsQtd = (newValue) => {
    if (!newValue) {
      toast.info('Informe uma quantidade válida', toastOptions);
      return false;
    }
    return true;
  };

  function handleCliente() {
    // history.push('/crm9', '_blank');
    window.open('/crm9', '_blank');
  }

  function handleAddFina() {
    try {
      const formFina = frmFinanceiro.current.getData();
      if (formFina.fina_fpgto_id) {
        if (!formFina.fina_perc_desc) {
          frmFinanceiro.current.setFieldValue('fina_perc_desc', '');
          document.getElementsByName('fina_perc_desc')[0].focus();
        } else if (
          toDecimal(formFina.fina_valor) > 0 &&
          toDecimal(formFina.fina_valor_final) === 0
        ) {
          const valor_final =
            toDecimal(formFina.fina_valor) *
            (1 - toDecimal(formFina.fina_perc_desc) / 100);
          frmFinanceiro.current.setFieldValue(
            'fina_valor_final',
            valor_final.toFixed(2)
          );
        } else {
          // adicionar o item na grid
          const itemGrid = [];
          const objForma = optFpgto.filter(
            (f) => f.value === formFina.fina_fpgto_id
          );

          const grdValidar = gridFinanceiro.filter(
            (f) => f.fina_fpgto_id === formFina.fina_fpgto_id
          );

          if (grdValidar.length > 0) {
            toast.warn(
              `VOCÊ JÁ INFORMOU ESTA FORMA DE PAGAMENTO. SE NECESSÁRIO, EXCLUA O LANÇAMENTO ANTERIOR...`,
              toastOptions
            );
            return;
          }

          const vlr_atualizado = valorPedido - toDecimal(formFina.fina_valor);
          if (vlr_atualizado > -1) {
            setValorPedido(vlr_atualizado.toFixed(2));
            const objFina = {
              fina_fpgto_id: formFina.fina_fpgto_id,
              forma_pgto: objForma[0].label,
              fina_valor: formFina.fina_valor,
              fina_perc_desc: formFina.fina_perc_desc,
              fina_valor_final: formFina.fina_valor_final,
              persistido: 'N',
            };

            itemGrid.push(...gridFinanceiro, objFina);
            setGridFinanceiro(itemGrid);

            const vlrNeg =
              valorPedidoNegociado + toDecimal(formFina.fina_valor_final);
            setValorPedidoNegociado(vlrNeg);

            if (vlr_atualizado === 0) {
              setInfoVlrPedidoNegociado(
                `VALOR DO PEDIDDO APÓS NEGOCIAÇÃ0: ${FormataMoeda(
                  vlrNeg.toString()
                )}`
              );
            } else {
              setInfoVlrPedidoNegociado('');
            }

            // limpar controles
            frmFinanceiro.current.setFieldValue('fina_valor_final', '');
            frmFinanceiro.current.setFieldValue('fina_valor', '');
            frmFinanceiro.current.setFieldValue('fina_perc_desc', '');
            frmFinanceiro.current.setFieldValue('fina_fpgto_id', '');
          } else {
            toast.error(
              `O VALOR INFORMADO É MAIOR QUE O SALDO DO PEDIDO. OPERAÇÃO CANCELADA!!`,
              toastOptions
            );
          }
        }
      } else {
        toast.warn(`INFORME A FORMA DE PAGAMENTO`, toastOptions);
      }
    } catch (err) {
      toast.error(`Erro ao informar forma de pagamento: ${err}`, toastOptions);
    }
  }

  const handleExcluirFina = async (prm) => {
    try {
      if (prm.persistido === 'S') {
        // vem da api
      } else {
        setGridFinanceiro((prev) => {
          prev = prev.filter((item) => item !== prm);
          return prev;
        });
      }

      // tratar valores
      let vlped = 0;

      setValorPedido((prev) => {
        vlped = toDecimal(prev) + toDecimal(prm.fina_valor);
        frmFinanceiro.current.setFieldValue('fina_valor', vlped);
        return vlped;
      });

      let vlneg = 0;
      setValorPedidoNegociado((prev) => {
        vlneg = prev - toDecimal(prm.fina_valor_final);
        setValorPedidoNegociado(vlneg);
      });

      setInfoVlrPedidoNegociado('');
    } catch (err) {
      toast.error(`Erro ao excluir item: ${err}`, toastOptions);
    }
  };

  async function handleConfirmarNeg() {
    try {
      if (gridFinanceiro.length > 0) {
        setLoading(true);
        const formCapa = frmCapa.current.getData();
        const cad = [];
        let obj = {};
        gridFinanceiro.forEach((g) => {
          obj = {
            fina_cp_emp_id: null,
            fina_cp_id: formCapa.cp_id,
            fina_fpgto_id: g.fina_fpgto_id,
            fina_valor: toDecimal(g.fina_valor),
            fina_perc_desc: toDecimal(g.fina_perc_desc),
            fina_valor_final: toDecimal(g.fina_valor_final),
          };

          cad.push(obj);
        });

        const retorno = await api.post('v1/fat/pedido_financeiro', cad);
        if (retorno.data.success) {
          await handleSubmitCapa();
        }
        setLoading(false);
      } else {
        toast.info('Não há itens para confirmar');
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao confirmar negociação: ${err}`, toastOptions);
    }
  }

  useEffect(() => {
    if (params.tipo === '2') {
      setTitlePg('CADASTRO PEDIDOS - PRÉ-VENDA');
    } else {
      setTitlePg('CADASTRO PEDIDOS - CONSIGNADO');
    }
    getComboFpgto();
    getComboOperFat();
    listaPedido();
    getComboCondVcto();
    getComboTabPreco();
    getParamSistema();
    setDesableSave(true);
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnConsulta = [
    {
      field: 'cp_id',
      headerName: 'Nº PEDIDO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'autor',
      headerName: 'VENDEDOR(A)',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
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
      field: 'cp_data_devol',
      headerName: 'DTA. DEVOL',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
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
  ];

  if (params.tipo === '3') {
    gridColumnConsulta.push({
      field: 'valor_cota',
      headerName: 'VLR. COTA',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
    });

    gridColumnConsulta.push({
      field: 'acerto',
      headerName: 'SITUAÇÃO DE ACERTO',
      width: 280,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    });
  }

  gridColumnConsulta.push({
    field: 'cp_situacao',
    headerName: 'SITUAÇAO SISTEMA',
    width: 280,
    sortable: true,
    resizable: true,
    filter: true,
    lockVisible: true,
    flex: 1,
  });
  // #endregion

  // #region GRID ITENS PEDIDO ===========================================

  const gridColumnItens = [
    {
      field: 'prode_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="Excluir Item do pedido" placement="top">
              <button type="button" onClick={() => handleDeleteItem(prm.data)}>
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },

    {
      field: 'prode_id',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: false,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_referencia',
      headerName: 'REFERÊNCIA',
      sortable: true,
      width: 110,
      resizable: true,
      editable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_descricao',
      headerName: 'DESCRIÇÃO ITEM',
      width: 350,
      sortable: true,
      resizable: true,
      editable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'item_vlr_unit',
      headerName: 'VLR. UNIT',
      width: 110,
      resizable: true,
      lockVisible: true,
      type: 'rightAligned',
    },
    {
      field: 'item_quantidade',
      headerName: 'QUANTIDADE',
      width: 110,
      sortable: true,
      editable: true,
      type: 'rightAligned',
      /* metodo para edição na grid  */
      onCellValueChanged: handleEditarQuantidade,
      cellEditorParams: {
        validacoes: gridValidationsQtd,
      },
      resizable: true,
      lockVisible: true,
      cellClass: 'cell_quantity',
    },
    {
      field: 'item_perc_desc',
      headerName: '% DESC.',
      width: 100,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'item_vlr_desc',
      headerName: 'VLR DESC.',
      width: 110,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'valor_final',
      headerName: 'VLR. ITEM',
      width: 110,
      sortable: true,
      resizable: true,
      lockVisible: true,
      cellClass: 'cell_total',
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID GRADE PRODUTOS ===============================================
  const autoGroupColumnDef = { minWidth: 200 };
  const gridColumnGrade = [
    {
      field: 'prode_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="Selecionar Produto" placement="top">
              <button
                type="button"
                disabled={disableBtnGrid}
                onClick={() => handleSelectItemGrade(prm.data)}
              >
                <FaCheck size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'forn_razao_social',
      headerName: 'FORNECEDOR',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },

    {
      field: 'marca',
      headerName: 'MARCA',
      width: 170,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFIC. 2',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFIC. 3',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prode_saldo',
      headerName: 'SALDO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'tab_preco_final',
      headerName: 'PREÇO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'prode_id',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: false,
      resizable: true,
      filter: true,
      flex: 1,
    },
  ];

  const gridColumnFinanceiro = [
    {
      field: 'fina_fpgto_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip
              title="Excluir Forma de Pagamento"
              placement="top"
            >
              <button
                type="button"
                disabled={disableBtnGrid}
                onClick={() => handleExcluirFina(prm.data)}
              >
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'forma_pgto',
      headerName: 'FORMA DE PAGAMENTO',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'fina_valor',
      headerName: 'VALOR INFORMADO',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'fina_perc_desc',
      headerName: '% DESC. CONCEDIDO',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'fina_valor_final',
      headerName: 'VALOR A PAGAR',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Consultar Pedidos" placement="right">
          <button type="button" onClick={listaPedido}>
            <FaSearch size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoPedido}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar/Calcular Pedido" placement="left">
          <button
            disabled={desableSave}
            type="button"
            onClick={handleSubmitCapa}
          >
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Aplicar Desconto" placement="left">
          <button type="button" onClick={handleFormdDesconto}>
            <FaPercent size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Aplicar Crédito do Cliente" placement="left">
          <button type="button" onClick={handleCreditoCli}>
            <FaDollarSign size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Cancelar Pedido" placement="left">
          <button type="button" onClick={handleCancelar}>
            <FaBan size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Gerar Nota Fiscal" placement="left">
          <button type="button" onClick={() => setOpenDlgNota(true)}>
            <FaBarcode size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Impressão do Pedido" placement="left">
          <button type="button" onClick={handleDlgImpressao}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Validar Estoque" placement="left">
          <button type="button" onClick={handleValidarPedido}>
            <FaCartPlus size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Consultar Produto" placement="left">
          <button type="button">
            <FaCubes size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Finalizar Pedido" placement="left">
          <button type="button" onClick={handleFinalizarPedido}>
            <FaRegCheckSquare size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
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
            <h1>{titlePg}</h1>
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
                title="Consultar Pedidos Cadastrado"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR PEDIDOS"
                  {...a11yProps(0)}
                  icon={<FaSearchDollar size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Informções Inciais do Pedido"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CAPA PEDIDO"
                  {...a11yProps(1)}
                  icon={<FaThList size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip title="Itens do pedido" placement="top-end">
                <Tab
                  disabled={false}
                  label="ITENS PEDIDO"
                  {...a11yProps(2)}
                  icon={<FaClipboardList size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Registro de negociação financeira do cliente"
                placement="top-end"
              >
                <Tab
                  disabled
                  label="FINANCEIRO"
                  {...a11yProps(3)}
                  icon={<FaCcAmazonPay size={29} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCapa" ref={frmPesquisa}>
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCad fr="2fr 0.8fr 0.8fr 0.8fr 1fr 1.2fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_cli_id"
                      label="Cliente"
                      value={pesqCli_id}
                      placeholder="PESQUISA POR CLIENTE"
                      onChange={(e) => setPesqCliId(e || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Num. Pedido</label>
                    <input
                      type="number"
                      name="pesq_cp_id"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <div>
                      <span>
                        <DatePickerInput
                          onChangeDate={(date) =>
                            setPesqDataIni(new Date(date))
                          }
                          value={pesqDataIni}
                          label="Data Inicial:"
                        />
                      </span>
                    </div>
                  </AreaComp>
                  <AreaComp wd="100">
                    <div>
                      <span>
                        <DatePickerInput
                          onChangeDate={(date) =>
                            setPesqDataFin(new Date(date))
                          }
                          value={pesqDataFin}
                          label="Data Final:"
                        />
                      </span>
                    </div>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Situação do Pedido</label>
                    <Select
                      id="pesq_cp_situacao"
                      options={optSitPedido}
                      onChange={(e) => setPesqSituacao(e ? e.value : null)}
                      isClearable
                      placeholder="SITUAÇAO PEDIDO"
                    />
                  </AreaComp>
                  <AreaComp wd="100" ptop="25px">
                    <CCheck>
                      <input
                        type="checkbox"
                        id="chbNaoValidado"
                        name="chbNaoValidado"
                        value="S"
                      />
                      <label htmlFor="chbNaoValidado">
                        Pedidos não validado
                      </label>
                    </CCheck>
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnConsulta}
                      rowData={gridPesquisa}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      rowClassRules={{
                        'warn-finalizado': function (p) {
                          const finalizado = p.data.cp_situacao;
                          return finalizado === 'PEDIDO FINALIZADO';
                        },
                        'warn-cancelado': function (p) {
                          const cancelado = p.data.cp_situacao;
                          return cancelado === 'CANCELADO';
                        },
                      }}
                      onGridReady={(prm) => {
                        setGridApiPesquisa(prm.api);
                      }}
                      onSelectionChanged={handleSelectGridPesquisa}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp
                    wd="100"
                    h3talign="center"
                    bckgndh3="#fff"
                    ptop="7px"
                  >
                    <h3>{resumoPedido}</h3>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CAPA DO PEDIDO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCapa" ref={frmCapa}>
                <h1>IDENTIFICAÇÃO DO PEDIDO</h1>
                <BoxItemCad fr="1fr 1fr 1fr 3fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="cp_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <div>
                      <span>
                        <DatePickerInput
                          onChangeDate={(date) => setDataEmiss(new Date(date))}
                          value={dataEmiss}
                          label="Data Emissão"
                        />
                      </span>
                    </div>
                  </AreaComp>
                  <AreaComp wd="100">
                    <div>
                      <span>
                        <DatePickerInput
                          onChangeDate={(date) => setDataSaida(new Date(date))}
                          value={dataSaida}
                          label={
                            params.tipo === '2'
                              ? 'Data Saída'
                              : 'Data Prestação de contas'
                          }
                        />
                      </span>
                    </div>
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="cp_cli_id"
                      label="Cliente"
                      placeholder="INFORME O CLIENTE"
                      defaultOptions
                      cacheOptions
                      value={pesqCli_id}
                      onChange={(c) => setPesqCliId(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="154"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Operação de Faturamento"
                      name="cp_oper_id"
                      optionsList={optOperFat}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="cp_cvto_id"
                      label="Condição de Vencimento"
                      optionsList={optCvto}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      name="cp_fpgto_id"
                      label="Forma de Pagamento"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="INFORME"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="cp_representante"
                      label="REPRESENTANTE/VENDEDOR"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={representante}
                      onChange={(c) => setRepresentante(c || [])}
                      loadOptions={loadOptionsRepresentante}
                      isClearable
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Observações do pedido</label>
                    <TextArea type="text" name="cp_observacao" rows="4" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <h1>TOTAIS DO PEDIDO</h1>
                <BoxItemCad
                  fr={
                    params.tipo === '2'
                      ? '1fr 1fr 1fr 1fr 1fr'
                      : '1fr 1fr 1fr 1fr 1fr 1fr'
                  }
                >
                  <AreaComp wd="100">
                    <label>Valor do Produtos</label>
                    <Input
                      type="number"
                      name="cp_vlr_total"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Despesas</label>
                    <Input
                      type="text"
                      name="cp_vlr_outros"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Crédito Cliente</label>
                    <Input
                      type="number"
                      name="cp_credito_cli"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Desconto</label>
                    <Input
                      type="number"
                      name="cp_vlr_desc"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor do Pedido</label>
                    <Input
                      type="number"
                      name="cp_vlr_nf"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  {params.tipo === '3' ? (
                    <AreaComp wd="100">
                      <label>Cota mínima de venda</label>
                      <Input
                        type="number"
                        name="valor_cota"
                        readOnly
                        className="input_cad"
                      />
                    </AreaComp>
                  ) : (
                    ''
                  )}
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA ITENS DO PEDIDO */}
          <TabPanel value={valueTab} index={2}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <h1>ITENS DO PEDIDO</h1>
              <BoxItemCadNoQuery fr="1fr 1fr">
                <AreaComp wd="100">
                  <CCheck>
                    <input
                      type="checkbox"
                      id="chbBonificar"
                      name="chbBonificar"
                      value="S"
                    />
                    <label htmlFor="chbBonificar">
                      Lançar item como brinde (bonificação)
                    </label>
                  </CCheck>
                </AreaComp>
                <AreaComp wd="100" h3talign="center" bckgndh3="#fff">
                  <h3>{labelSaldo}</h3>
                </AreaComp>
              </BoxItemCadNoQuery>
              <Form id="frmItens" ref={frmItens}>
                <BoxItemCad fr="1fr 2fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      name="item_tab_preco_id"
                      label="Tabela de Preços"
                      optionsList={optTabPreco}
                      isClearable
                      placeholder="INFORME A TABELA"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="item_prod_id"
                      label="Produto"
                      value={selectedProduto}
                      placeholder="INFORME O PRODUTO"
                      onChange={(p) => handleChangeSelectProduto(p || [])}
                      loadOptions={loadOptions}
                      isClearable
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>Código de Barras</label>

                    <KeyboardEventHandler
                      handleKeys={['enter', 'tab']}
                      onKeyEvent={() => exitBarcode()}
                    >
                      <Input
                        type="number"
                        name="barcode"
                        className="input_cad"
                        placeholder="LOCALIZAR POR CODIGO DE BARRAS"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Quantidade</label>
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={() => handleSubmitItens()}
                    >
                      <Input
                        type="text"
                        name="item_quantidade"
                        onBlur={() => totalItem()}
                        placeholder="0,00"
                        className="input_cad"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={() => handleSubmitItens()}
                    >
                      <label>Valor Unitário</label>
                      <Input
                        type="text"
                        name="item_vlr_unit"
                        onBlur={() => totalItem()}
                        placeholder="0,00"
                        onChange={maskDecimal}
                        className="input_cad"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Desconto</label>
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={() => handleSubmitItens()}
                    >
                      <Input
                        type="text"
                        name="item_vlr_desc"
                        onBlur={() => totalItem()}
                        placeholder="0,00"
                        onChange={maskDecimal}
                        className="input_cad"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Desconto em percentual (%)</label>
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={() => handleSubmitItens()}
                    >
                      <Input
                        type="text"
                        name="item_perc_desc"
                        placeholder="0,00"
                        onBlur={() => totalItem()}
                        onChange={maskDecimal}
                        className="input_cad"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Total</label>
                    <Input
                      type="text"
                      name="item_valor_total"
                      readOnly
                      placeholder="0,00"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnItens}
                      rowData={gridItens}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp
                    wd="100"
                    h3talign="center"
                    bckgndh3="#fff"
                    ptop="7px"
                  >
                    <h3>{remumoItens}</h3>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA FINANCEIRO */}
          <TabPanel value={valueTab} index={3}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <h1>NEGOCIAÇÃO FINANCEIRA DO CLIENTE</h1>
              <Form id="frmFinanceiro" ref={frmFinanceiro}>
                <BoxItemCad fr="2fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      name="fina_fpgto_id"
                      label="Forma de Pagamento"
                      optionsList={optFpgto}
                      isClearable
                      onChange={() => {
                        frmFinanceiro.current.setFieldValue(
                          'fina_valor',
                          valorPedido
                        );
                        document.getElementsByName('fina_valor')[0].focus();
                      }}
                      placeholder="INFORME"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <BootstrapTooltip
                      title="Informe o valor que o cliente quer pagar de acordo com a forma de pagamento escolhida"
                      placement="top"
                    >
                      <KeyboardEventHandler
                        handleKeys={['enter', 'tab']}
                        onKeyEvent={() => handleAddFina()}
                      >
                        <label>Valor Desejado</label>
                        <Input
                          type="text"
                          name="fina_valor"
                          placeholder="0,00"
                          onChange={maskDecimal}
                          className="input_cad"
                        />
                      </KeyboardEventHandler>
                    </BootstrapTooltip>
                  </AreaComp>

                  <AreaComp wd="100">
                    <BootstrapTooltip
                      title="Informe o percentual de desconto concedido de acordo com a forma de pagamento"
                      placement="top"
                    >
                      <KeyboardEventHandler
                        handleKeys={['enter', 'tab']}
                        onKeyEvent={() => handleAddFina()}
                      >
                        <label>% Desconto Concedido</label>
                        <Input
                          type="text"
                          name="fina_perc_desc"
                          placeholder="0,00"
                          onChange={maskDecimal}
                          className="input_cad"
                        />
                      </KeyboardEventHandler>
                    </BootstrapTooltip>
                  </AreaComp>
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter', 'tab']}
                      onKeyEvent={() => handleAddFina()}
                    >
                      <label>Valor a Pagar</label>
                      <Input
                        type="text"
                        name="fina_valor_final"
                        placeholder="0,00"
                        onChange={maskDecimal}
                        className="input_cad"
                        readOnly
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnFinanceiro}
                      rowData={gridFinanceiro}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100" h3talign="left" bckgndh3="#fff" ptop="7px">
                    <h3>{infoVlrPedido}</h3>
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100" h3talign="left" bckgndh3="#fff" ptop="7px">
                    <h3>{infoVlrPedidoNegociado}</h3>
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr" ptop="10px" just="center">
                  <dvGeral wd="300px">
                    <button
                      type="button"
                      className="btn2"
                      onClick={handleConfirmarNeg}
                    >
                      {loading
                        ? 'Aguarde Processando...'
                        : 'Confirmar Negociação'}
                      <FaCheckCircle size={20} color="#fff" />
                    </button>
                  </dvGeral>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup grade produto */}
      <Slide direction="down" in={openDlgGrade}>
        <Dialog
          open={openDlgGrade}
          keepMounted
          fullWidth
          maxWidth="lg"
          onClose={() => setOpenDlgGrade(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>{titleDlgGrade}</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgGrade(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <Form id="frmGrade" ref={frmGrade}>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnGrade}
                      autoGroupColumnDef={autoGroupColumnDef}
                      rowData={gridGrade}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </BoxItemCadNoQuery>
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para desconto */}
      <Slide direction="down" in={openDlgDesconto}>
        <Dialog
          open={openDlgDesconto}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgDesconto(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>APLICAR DESCONTO LINEAR NO PEDIDO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgDesconto(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <Form id="frmPrincipal" ref={frmDesc} onSubmit={handleDesconto}>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <label>Desconto em (%)</label>
                    <Input
                      type="text"
                      name="perc_desconto"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor em (R$)</label>
                    <Input
                      type="text"
                      name="vlr_desconto"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                </BoxItemCad>
                <Linha />
                <BoxItemCadNoQuery>
                  <AreaComp wd="100" ptop="30px">
                    <button type="submit" className="btnGeralForm">
                      APLICAR DESCONTO
                    </button>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para impmressao do pedido */}
      <Slide direction="down" in={openDlgImpressao}>
        <Dialog
          open={openDlgImpressao}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgImpressao(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>CONFERÊNCIA/ESPELHO PEDIDO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgImpressao(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <BoxItemCadNoQuery fr="1fr 1fr">
                <AreaComp wd="100">
                  <CCheck>
                    <input
                      type="radio"
                      id="rbOrdemReferencia"
                      name="radio"
                      value="S"
                    />
                    <label htmlFor="rbOrdemReferencia">
                      Ordenar por referência
                    </label>

                    <input
                      type="radio"
                      id="rbOrdemDescricao"
                      name="radio"
                      value="S"
                    />
                    <label htmlFor="rbOrdemDescricao">
                      Ordenar por descrição
                    </label>
                  </CCheck>
                </AreaComp>
              </BoxItemCadNoQuery>
              <Linha />
              <BoxItemCadNoQuery>
                <AreaComp wd="100" ptop="30px">
                  <button
                    type="button"
                    className="btnGeralForm"
                    onClick={handleImpressao}
                  >
                    GERAR IMPRESSÃO
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para getar nota fiscal */}
      <Slide direction="down" in={openDlgNota}>
        <Dialog
          open={openDlgNota}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgNota(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>CONFIRMAR EMISSÃO DE NOTA FISCAL</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgNota(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <BoxItemCadNoQuery fr="1fr 1fr">
                <AreaComp wd="100">
                  <CCheck>
                    <input type="radio" id="rbNota" name="radioNf" value="S" />
                    <label htmlFor="rbNota">Nota Fiscal (NF-e)</label>

                    <input type="radio" id="rbCupom" name="radioNf" value="S" />
                    <label htmlFor="rbCupom">Cupom Fiscal (NFC-e)</label>
                  </CCheck>
                </AreaComp>
              </BoxItemCadNoQuery>
              <Linha />
              <BoxItemCadNoQuery>
                <AreaComp wd="100" ptop="30px">
                  <button
                    type="button"
                    className="btnGeralForm"
                    onClick={handleGerarNota}
                  >
                    CONFIRMAR
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title={titlePg}
        message="Aguarde Processamento..."
      />
    </>
  );
}
