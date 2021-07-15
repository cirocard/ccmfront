/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { format, parse } from 'date-fns';
import moment from 'moment';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { MdClose } from 'react-icons/md';
import {
  FaThList,
  FaSearchDollar,
  FaSave,
  FaPercent,
  FaPlusCircle,
  FaCheck,
  FaTrashAlt,
  FaPrint,
  FaCubes,
  FaUserTie,
  FaPagelines,
  FaWeightHanging,
  FaFileExport,
} from 'react-icons/fa';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Popup from '~/componentes/Popup';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import DatePickerInput from '~/componentes/DatePickerInput';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import TextArea from '~/componentes/TextArea';
import FormSelect from '~/componentes/Select';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import Confirmation from '~/componentes/DialogChoice';
import CONSULTA_PRODUTO from '~/pages/Suprimentos/cadastros/produto/consulta';
import {
  Container,
  Panel,
  GridContainerItens,
  ToolBar,
  GridContainerMain,
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
import history from '~/services/history';
import {
  a11yProps,
  SeNull,
  maskDecimal,
  ArredondaValorDecimal,
  toDecimal,
  GridCurrencyFormatter,
  addMes,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';

export default function FAT6() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [titlePg, setTitlePg] = useState('');
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCapa = useRef(null);
  const frmGrade = useRef(null);
  const frmDesc = useRef(null);
  const frmDespesa = useRef(null);
  const frmOrcamento = useRef(null);
  const [optCvto, setOptCvto] = useState([]);
  const [optFpgto, setOptFpgto] = useState([]);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [optOperFat, setOptOperFat] = useState([]);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [dataEmiss, setDataEmiss] = useState(moment());
  const [minDataEmiss, setMinDataEmiss] = useState(moment());
  const [maxDataEmiss, setMaxDataEmiss] = useState(moment());
  const [dataSaida, setDataSaida] = useState(moment());
  const [pesqCli_id, setPesqCliId] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDlgGrade, setOpenDlgGrade] = useState(false);
  const [openDlgDesconto, setOpenDlgDesconto] = useState(false);
  const [openDlgImpressao, setOpenDlgImpressao] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [gridGrade, setGridGrade] = useState([]);
  const [gridGradeSelected, setGridGradeSelected] = useState([]);
  const [paramSistema, setParamSistema] = useState([]);
  const [remumoItens, setResumoItens] = useState({});
  const [resumoPedido, setResumoPedido] = useState('');
  const [titleDlgGrade, setTitleDlgGrade] = useState('');
  const [selectedProduto, setSelectedProduto] = useState([]);
  const [situacaoPedido, setSituacaoPedido] = useState('');
  const [existeBordero, setExisteBordero] = useState('');
  const [colunaItens, setColunaItens] = useState([]);
  const [desableSave, setDesableSave] = useState(true);
  const [inputDesable, setInputDesable] = useState(true);
  const [dlgConsProduto, setDlgConsProduto] = useState(false);
  const [dlgOrcamento, setDlgOrcamento] = useState(false);
  const [dlgDespesa, setDlgDespesa] = useState(false);
  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region VALIDAÇÕES DO YUP =============================================
  const schemaCapa = Yup.object().shape({
    cp_cli_id: Yup.string().required('(??)'),
    cp_cvto_id: Yup.string().required('(??)'),
    cp_fpgto_id: Yup.string().required('(??)'),
    cp_oper_id: Yup.string().required('(??)'),
  });

  const schemaItem = Yup.object().shape({
    cp_cli_id: Yup.string().required('(??)'),
    cp_cvto_id: Yup.string().required('(??)'),
    cp_fpgto_id: Yup.string().required('(??)'),
    cp_oper_id: Yup.string().required('(??)'),
    item_vlr_unit: Yup.string().required('(??)'),
    item_quantidade: Yup.string().required('(??)'),
  });

  // #endregion

  // #region COMBOS ===========================================================

  // cliente
  const loadOptionsCliente = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=1&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=1&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // produto
  const loadOptions = async (inputText, callback) => {
    if (frmCapa.current) {
      const formData = frmCapa.current.getData();
      if (!formData.cp_cvto_id) {
        toast.error('INFORME A CONDIÇÃO DE VENCIMENTO!!', toastOptions);
        return;
      }
      if (!formData.cp_cli_id) {
        toast.error('INFORME O CLIENTE PARA CONTINUAR...', toastOptions);
        return;
      }
      if (!formData.cp_fpgto_id) {
        toast.error(
          'INFORME A FORMA DE PAGAMENTO PARA CONTINUAR...',
          toastOptions
        );
        return;
      }
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
        toast.error(
          'ATENÇÃO!! INFORME A TABELA DE PREÇOS PARA CONTINUAR...',
          toastOptions
        );
      }
    }
  };

  // forma pagamento
  async function getComboFpgto() {
    try {
      const response = await api.get(`v1/combos/geral/35`);
      const dados = response.data.retorno;
      if (dados) {
        const filtroCard = [4, 3, 13, 14];
        const filtrado = dados.filter((d) => {
          if (
            // se for cartão
            filtroCard.indexOf(parseInt(d.ger_numerico1.toString(), 10)) !== -1
          ) {
            return d.ger_texto1.toString() !== '1'; // retorna somente cartao que nao seja da empresa
          }
          return d; // senao retorna tudo
        });
        setOptFpgto(filtrado);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo forma de pagamento \n${error}`);
    }
  }

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

  // condicao de vencimento
  async function getComboCondVcto() {
    try {
      const response = await api.get(`v1/combos/condvcto`);
      const dados = response.data.retorno;
      if (dados) {
        const cvto = dados.filter((f) => f.value.toString() !== '100');

        setOptCvto(cvto);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Condição de vencimento \n${error}`);
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
    frmCapa.current.setFieldValue('item_quantidade', '');
    frmCapa.current.setFieldValue('item_vlr_unit', '');
    frmCapa.current.setFieldValue('item_vlr_desc', '');
    frmCapa.current.setFieldValue('item_perc_desc', '');
    frmCapa.current.setFieldValue('item_valor_total', '');
    frmCapa.current.setFieldValue('barcode', '');
    frmCapa.current.setFieldValue('item_prod_id', '');
    document.getElementById('chbBonificar').checked = false;
  }

  // fazer consulta dos pedidos
  async function listaPedido() {
    try {
      setLoading(true);
      setValueTab(0);
      const prm = {
        emp_id: null,
        filtraUsr: null, // TRATAR NA APIN
        usr_id: null,
        numero: document.getElementsByName('pesq_cp_id')[0].value,
        cli_id: pesqCli_id.value,
        data_ini: moment(pesqDataIni).format('YYYY-MM-DD'),
        data_fin: moment(pesqDataFin).format('YYYY-MM-DD'),
        situacao: '1', // situacao pedido
        status: null,
        nfce: 'N', // S/N
        cpf_consumidor: null,
        perfil: '6', // orçamento
      };

      const response = await api.post('v1/fat/orc/lista_pedido', prm);
      const dados = response.data.retorno;
      if (dados) {
        setResumoPedido(response.data.message);
        setDataGridPesqSelected([]);
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

      const url = `v1/fat/orc/itens_pedido?cp_id=${
        formData.cp_id
      }&item_id=&limit=${limit || ''}&prod_id=&detalhar=N}`;

      let response = await api.get(url);
      const dados = response.data.retorno;
      if (dados) {
        setGridItens(dados);

        // preencher a tabela de preço
        let x;
        if (dados.length > 0) {
          x = optTabPreco.find(
            (op) =>
              op.value.toString() === dados[0].item_tab_preco_id.toString()
          );
          frmCapa.current.setFieldValue('item_tab_preco_id', x);
        } else {
          x = optTabPreco.find(
            (op) =>
              op.value.toString() ===
              paramSistema[0].par_tab_padrao_prevenda.toString()
          );
          frmCapa.current.setFieldValue('item_tab_preco_id', x);
        }
      }

      // resumo itens
      response = await api.get(
        `v1/fat/orc/resumo_itens_pedido?cp_id=${formData.cp_id}`
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
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = async (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  async function handleNovoPedido() {
    try {
      setSituacaoPedido('1');
      setGridItens([]);
      setDataGridPesqSelected([]);
      setInputDesable(false);
      setDataEmiss(new Date());
      setDataSaida(new Date());
      frmCapa.current.setFieldValue('cp_id', '');
      frmCapa.current.setFieldValue('cp_cli_id', '');
      frmCapa.current.setFieldValue('cp_cvto_id', '');
      frmCapa.current.setFieldValue('cp_fpgto_id', '');
      frmCapa.current.setFieldValue('cp_oper_id', '');

      frmCapa.current.setFieldValue('cp_observacao', '');

      limpaItens();

      const x = optTabPreco.find(
        (op) =>
          op.value.toString() ===
          paramSistema[0].par_tab_padrao_prevenda.toString()
      );
      frmCapa.current.setFieldValue('item_tab_preco_id', x);

      setDesableSave(false);
      setValueTab(1);
    } catch (error) {
      setLoading(false);
    }
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

        const conferencia = document.getElementById('chbShowClassific').checked
          ? 'T'
          : 'N';
        const url = `v1/fat/report/espelho_pedido?cp_id=${dataGridPesqSelected[0].cp_id}
                     &ordenar=${ordem}&conferencia=${conferencia}`;

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
          'vlr_bonificacao',
          dataGridPesqSelected[0].vlr_bonificacao
        );
        frmCapa.current.setFieldValue(
          'cp_vlr_outros',
          dataGridPesqSelected[0].cp_vlr_outros
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

        setValueTab(1);
        setDesableSave(false);
        limpaItens();
        await listaItens();
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

        if (situacaoPedido !== '1') {
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
          cp_perfil: '6',
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
          cp_tipo_doc: '3',
          cp_representante: null,
        };

        // if (toDecimal(formCapa.cp_vlr_outros) === 0) delete capa.cp_vlr_outros;
        const obj = {
          emp_id: null,
          usr_id: null,
          capa,
          itens: [],
        };

        const retorno = await api.post('v1/fat/orc/orcamento', obj);

        if (retorno.data.success) {
          if (retorno.data.retorno.cp_id) {
            frmCapa.current.setFieldValue('cp_id', retorno.data.retorno.cp_id);

            frmCapa.current.setFieldValue(
              'cp_vlr_outros',
              retorno.data.retorno.cp_vlr_outros
            );

            frmCapa.current.setFieldValue(
              'vlr_bonificacao',
              retorno.data.retorno.vlr_bonificacao
            );

            frmCapa.current.setFieldValue(
              'cp_vlr_desc',
              retorno.data.retorno.cp_vlr_desc
            );
            frmCapa.current.setFieldValue(
              'cp_vlr_nf',
              retorno.data.retorno.cp_vlr_nf
            );

            await listaItens();
            if (valueTab.toString() === '3') {
              setValueTab(0);
              await listaPedido();
            }
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
          'cp_cvto_id',
          validationErrors.cp_cvto_id
        );
        frmCapa.current.setFieldError(
          'cp_fpgto_id',
          validationErrors.cp_fpgto_id
        );
        frmCapa.current.setFieldError(
          'cp_oper_id',
          validationErrors.cp_oper_id
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
    const formData = frmCapa.current.getData();
    // se bonificaçao
    if (document.getElementById('chbBonificar').checked) {
      frmCapa.current.setFieldValue(
        'item_vlr_desc',
        ArredondaValorDecimal(
          toDecimal(formData.item_quantidade) *
            toDecimal(formData.item_vlr_unit)
        )
      );
      frmCapa.current.setFieldValue('item_perc_desc', 100);
    } // se informou percentual de desconto (prioridade)
    else if (toDecimal(SeNull(formData.item_perc_desc, '0')) > 0) {
      frmCapa.current.setFieldValue(
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
      frmCapa.current.setFieldValue(
        'item_perc_desc',
        ArredondaValorDecimal(
          (toDecimal(formData.item_vlr_desc) /
            (toDecimal(formData.item_quantidade) *
              toDecimal(formData.item_vlr_unit))) *
            100
        )
      );
    }

    frmCapa.current.setFieldValue(
      'item_valor_total',
      ArredondaValorDecimal(
        toDecimal(formData.item_quantidade) * toDecimal(formData.item_vlr_unit)
      )
    );
  }

  // adiconar itens
  async function handleSubmitItens(gridItensSelected) {
    try {
      setColunaItens(gridColumnItens);
      await totalItem();

      const formCapa = frmCapa.current.getData();

      frmCapa.current.setErrors({});
      await schemaItem.validate(formCapa, {
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
          'Atenção!! Este Pedido não pode mais ser alterado. Verifique a existência de borderô!!!',
          toastOptions
        );
        return;
      }

      setLoading(true);
      setInputDesable(true);

      const itensPedido = [
        {
          item_cp_id: formCapa.cp_id,
          item_tab_preco_id:
            formCapa.item_tab_preco_id || gridItensSelected.item_tab_preco_id,
          item_prod_id:
            gridItensSelected.prod_id || gridItensSelected.item_prod_id,
          item_prode_id: gridItensSelected.prode_id,
          item_prod_unidade: gridItensSelected.prod_unidade_venda,
          item_qtd_bonificada:
            document.getElementById('chbBonificar').checked ||
            toDecimal(formCapa.item_perc_desc) > 99
              ? formCapa.item_quantidade
              : null,
          item_vlr_unit: toDecimal(formCapa.item_vlr_unit),
          item_quantidade: toDecimal(formCapa.item_quantidade),
          item_perc_desc: document.getElementById('chbBonificar').checked
            ? 100
            : toDecimal(formCapa.item_perc_desc),
          item_vlr_desc: toDecimal(formCapa.item_vlr_desc),
          item_valor_total: toDecimal(formCapa.item_valor_total),
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

      const retorno = await api.post('v1/fat/orc/orcamento', obj);
      if (retorno.data.success) {
        // await listaItens(formCapa.cp_id, 30);
        setGridItens(retorno.data.retorno);
        setResumoItens(retorno.data.message);
        limpaItens();

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

      frmCapa.current.setFieldError('cp_cli_id', validationErrors.cp_cli_id);

      frmCapa.current.setFieldError('cp_cvto_id', validationErrors.cp_cvto_id);
      frmCapa.current.setFieldError(
        'cp_fpgto_id',
        validationErrors.cp_fpgto_id
      );

      frmCapa.current.setFieldError(
        'item_vlr_unit',
        validationErrors.item_vlr_unit
      );
      frmCapa.current.setFieldError(
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
        if (situacaoPedido !== '1') {
          toast.warning(
            'ATENÇÃO!! ESTE PEDIDO NÃO PODE MAIS SER ALTERADO. VERIFIQUE A SITUAÇÃO!!!',
            toastOptions
          );
          return;
        }
        setLoading(true);
        const formCapa = frmCapa.current.getData();

        const response = await api.put(
          `v1/fat/orc/aplicar_desconto?cp_id=${formCapa.cp_id}&perc=${formData.perc_desconto}
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

  // excluir item do orçamento
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
              `v1/fat/orc/excluir_item_pedido?cp_id=${formCapa.cp_id}&prode_id=${param.prode_id}`
            );
            if (response.data.success) {
              await listaItens(1000, 'N');
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

  // excluir orçamento
  async function handleDeleteOrcamento() {
    try {
      if (dataGridPesqSelected.length > 0) {
        const confirmation = await Confirmation.show(
          'VOCÊ TEM CERTEZA QUE DESEJA EXCLUIR O ORÇAMENTO??? ESTA AÇÃO É IRREVERSÍVEL'
        );

        if (confirmation) {
          setLoading(true);
          const formCapa = frmCapa.current.getData();
          const response = await api.delete(
            `v1/fat/orc/excluir_orcamento?cp_id=${formCapa.cp_id}`
          );
          if (response.data.success) {
            await listaPedido();
          } else {
            toast.error(`Erro ao excluir orçamento: ${response.data.message}`);
          }
          setLoading(false);
        }
      } else {
        toast.info('SELECIONE UM ORÇAMENTO PARA EXCLUIR', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir cadastro: ${error}`);
    }
  }

  // change select  produto - abrir popup grade
  async function handleChangeSelectProduto(p) {
    try {
      setLoading(true);
      setSelectedProduto(p);
      if (p.value) {
        if (!frmCapa.current.getData().barcode) {
          const tab_id = frmCapa.current.getData().item_tab_preco_id;
          const url = `v1/fat/orc/grade_produto?prod_id=${p.value}&marca_id=&classific1=&classific2=&classific3=&tab_id=${tab_id}`;
          const response = await api.get(url);
          const dados = response.data.retorno;
          if (dados) {
            setGridGrade(dados);
            setTitleDlgGrade(`ITEM SELECIONADO: ${p.label} :: ESCOLHA A GRADE`);
            setOpenDlgGrade(true);
          }
        }
      } else {
        frmCapa.current.setFieldValue('item_quantidade', '');
        frmCapa.current.setFieldValue('item_vlr_unit', '');
        frmCapa.current.setFieldValue('barcode', '');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  // selecionar um produto na grade de produto
  const handleSelectItemGrade = async (prm, pausada) => {
    setOpenDlgGrade(false);
    if (prm) {
      frmCapa.current.setFieldValue('item_vlr_unit', prm.tab_preco_final);
      document.getElementsByName('item_vlr_unit')[0].readOnly =
        toDecimal(prm.tab_preco_final) > 0;

      await totalItem();
      if (pausada !== 'S') {
        frmCapa.current.setFieldValue('item_quantidade', 1);
        if (!frmCapa.current.getData().cp_id) {
          toast.info(
            'SALVE O ORÇAMENTO ANTES DE INCLUIR OS ITENS...',
            toastOptions
          );
          return;
        }
        await handleSubmitItens(prm);
        document.getElementsByName('barcode')[0].focus();
      } else {
        setInputDesable(false);
        setGridGradeSelected(prm);
        frmCapa.current.setFieldValue('item_quantidade', '');
        document.getElementsByName('item_quantidade')[0].focus();
      }
    }
  };

  // evento barcode
  async function exitBarcode() {
    try {
      const { barcode, item_tab_preco_id } = frmCapa.current.getData();
      if (barcode) {
        if (barcode.length === 12) {
          setInputDesable(true);
          let prode = barcode.substring(2, 11);
          prode = parseInt(prode, 10);
          if (item_tab_preco_id) {
            setLoading(true);
            const url = `v1/fat/orc/grade_produto?prod_id=&marca_id=&classific1=&classific2=&classific3=&tab_id=${item_tab_preco_id}&prode_id=${prode}`;
            const response = await api.get(url);
            const dados = response.data.retorno;
            if (dados.length > 0) {
              frmCapa.current.setFieldValue('item_quantidade', 1);
              frmCapa.current.setFieldValue(
                'item_vlr_unit',
                dados[0].tab_preco_final
              );
              document.getElementsByName('item_vlr_unit')[0].readOnly =
                toDecimal(dados[0].tab_preco_final) > 0;

              const x = {
                value: dados[0].prod_id,
                label: dados[0].prod_descricao,
              };
              frmCapa.current.setFieldValue('item_prod_id', x);

              await totalItem();
              await handleSubmitItens(dados[0]); // tratar com parametros
              setInputDesable(false);
              frmCapa.current.setFieldValue('barcode', '');
              document.getElementsByName('barcode')[0].focus();
            } else {
              toast.info('ATENÇÃO!! PRODUTO NÃO ENCONTRADO', toastOptions);
            }
          } else {
            toast.warning(
              'ATENÇÃO!! INFORME A TABELA DE PREÇOS PARA CONTINUAR...',
              toastOptions
            );

            frmCapa.current.setFieldValue('item_quantidade', '');
            frmCapa.current.setFieldValue('item_vlr_unit', '');
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
      if (prm.colDef.field === 'item_vlr_unit') {
        if (parseFloat(prm.oldValue, 10) > 0) {
          toast.warn(
            'O VALOR UNITÁRIO NÃO PODE SER ALTERADO, POIS JÁ EXISTE PREÇO INFORMADO NA TABELA DE PREÇOS',
            toastOptions
          );
          await listaItens(1000, 'N');
          return;
        }
      }
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

        if (situ === '1') {
          if (sitBordero === 'N') {
            setLoading(true);
            const formCapa = frmCapa.current.getData();
            const response = await api.delete(
              `v1/fat/orc/excluir_item_pedido?cp_id=${formCapa.cp_id}&prode_id=${prm.data.prode_id}`
            );
            if (response.data.success) {
              await listaItens(1000, '');
            } else {
              toast.error(
                `Erro ao excluir item do pedido: ${response.data.message}`
              );
            }
            setLoading(false);

            // adicionar nova quantidade

            frmCapa.current.setFieldValue(
              'item_vlr_unit',
              prm.data.item_vlr_unit
            );
            frmCapa.current.setFieldValue(
              'item_quantidade',
              prm.data.item_quantidade
            );
            frmCapa.current.setFieldValue(
              'item_vlr_desc',
              prm.data.item_vlr_desc
            );
            frmCapa.current.setFieldValue(
              'item_perc_desc',
              prm.data.item_perc_desc
            );

            await handleSubmitItens(prm.data);
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
    window.open('/crm9', '_blank');
  }

  // despesas adicionais
  async function handleDespesa() {
    try {
      const formCapa = frmCapa.current.getData();
      const formDesp = frmDespesa.current.getData();
      setLoading(true);
      const response = await api.put(
        `v1/fat/orc/lancar_despesas?cli_id=${pesqCli_id.value}&cp_id=${
          formCapa.cp_id
        }&valor=${toDecimal(formDesp.vlrDespesa)}`
      );

      if (response.data.success) {
        const ret = response.data.retorno;

        frmCapa.current.setFieldValue(
          'cp_vlr_outros',
          toDecimal(ret.cp_vlr_outros)
        );
        frmCapa.current.setFieldValue('cp_vlr_nf', toDecimal(ret.cp_vlr_nf));
      } else {
        toast.error(
          `Erro ao lançar despesas \n${response.data.errors}`,
          toastOptions
        );
      }

      setDlgDespesa(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao lançar despesas\n${error}`, toastOptions);
    }
  }

  function handleValidaDespesa() {
    const formCapa = frmCapa.current.getData();
    if (valueTab == '1' && formCapa.cp_id) {
      frmDespesa.current.setFieldValue('vlrDespesa', '');
      setDlgDespesa(true);
    } else {
      toast.info(
        'ABRA O ORÇAMENTO PARA LANÇAR DESPESAS ADICIONAIS',
        toastOptions
      );
    }
  }

  function exportarOrcamento() {
    const formCapa = frmCapa.current.getData();
    if (valueTab == '1' && formCapa.cp_id) {
      setDlgOrcamento(true);
    } else {
      toast.info('ABRA O ORÇAMENTO PARA PARA GERAR O PEDIDO', toastOptions);
    }
  }

  async function handleOrcamento() {
    try {
      const formCapa = frmCapa.current.getData();
      let response;
      if (document.getElementById('rbPrevenda').checked) {
        setLoading(true);
        response = await api.post(
          `v1/fat/orc/gerar_pedido?cp_perfil=2&cp_id=${formCapa.cp_id}`
        );
      } else if (document.getElementById('rbConsignado').checked) {
        response = await api.post(
          `v1/fat/orc/gerar_pedido?cp_perfil=3&cp_id=${formCapa.cp_id}`
        );
      } else {
        toast.info('INFORME O TIPO DE PEDIDO QUE DESEJA GERAR', toastOptions);
        return;
      }

      if (response.data.success) {
        const confirmation = await Confirmation.show(
          'O PEDIDO FOI GERADO COM SUCESSO!! DESEJA ACESSAR O CADASTRO???'
        );

        if (confirmation) {
          setValueTab(0);
          if (document.getElementById('rbPrevenda').checked) {
            window.open('/fat2/2', '_blank');
          } else {
            window.open('/fat2/3', '_blank');
          }
        } else setValueTab(0);

        await listaPedido();
        setDlgOrcamento(false);
      } else {
        toast.error(
          `Erro converter orçamento\n${response.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro converter orçamento\n${error}`, toastOptions);
    }
  }

  // change TAB
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
    }
  };

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnConsulta = [
    {
      field: 'cp_id',
      headerName: 'Nº ORÇAMENTO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'autor',
      headerName: 'VENDEDOR(A)',
      width: 280,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 400,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cp_data_emis',
      headerName: 'DTA. EMISSÃO',
      width: 140,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'cp_vlr_nf',
      headerName: 'VLR. ORÇAMENTO',
      width: 170,
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
      width: 95,
      sortable: false,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'prod_referencia',
      headerName: 'REFERÊNCIA',
      sortable: true,
      width: 130,
      resizable: true,
      editable: true,
      filter: 'agTextColumnFilter',
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
      width: 110,
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
      editable: true,
      onCellValueChanged: handleEditarQuantidade,
      cellEditorParams: {
        validacoes: gridValidationsQtd,
      },
    },
    {
      field: 'item_quantidade',
      headerName: 'QTD. LANÇADA',
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
      field: 'qtd_pedido',
      headerName: 'QTD. NO PEDIDO',
      width: 110,
      resizable: true,
      lockVisible: true,
      cellStyle: { color: '#006BFD', fontWeight: 'bold' },
    },
    {
      field: 'item_perc_desc',
      headerName: '% DESC.',
      editable: true,
      width: 100,
      sortable: true,
      resizable: true,
      lockVisible: true,
      onCellValueChanged: handleEditarQuantidade,
      cellEditorParams: {
        validacoes: gridValidationsQtd,
      },
    },
    {
      field: 'item_vlr_desc',
      headerName: 'VLR DESC.',
      width: 120,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'valor_final',
      headerName: 'VLR. ITEM',
      width: 130,
      sortable: true,
      resizable: true,
      lockVisible: true,
      cellClass: 'cell_total',
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
                disabled={false}
                onClick={() => {
                  let pausado = '';
                  setParamSistema((prev) => {
                    pausado = prev[0].par_digitacao_pausada;
                    return prev;
                  });

                  if (pausado) {
                    handleSelectItemGrade(prm.data, pausado);
                  } else handleSelectItemGrade(prm.data, 'N'); // N ao escolher o item, o mesmo já é lançado
                }}
              >
                <FaCheck size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'marca',
      headerName: 'MARCA',
      width: 180,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFIC. 2',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFIC. 3',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prode_saldo',
      headerName: 'SALDO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'tab_preco_final',
      headerName: 'PREÇO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'prode_id',
      headerName: 'CÓDIGO',
      width: 130,
      sortable: false,
      resizable: true,
      filter: true,
      flex: 1,
    },
  ];

  // #endregion

  function handleProduto() {
    window.open('/supr4', '_blank');
  }

  const handleChangeTabPreo = async (tab) => {
    try {
      if (tab) {
        if (gridItens.length > 0) {
          if (!gridItens[0].item_tab_preco_id) return;
          if (
            gridItens[0].item_tab_preco_id.toString() === tab.value.toString()
          )
            return;

          const confirmation = await Confirmation.show(
            'Ao trocar a tabela de preços,  todo o pedido será recalculado de acordo com a tabela informada.  Deseja Continuar???'
          );

          if (confirmation) {
            setLoading(true);
            const formCapa = frmCapa.current.getData();
            const response = await api.put(
              `v1/fat/trocar_tabela?cp_id=${formCapa.cp_id}&tab_id=${tab.value}`
            );

            if (response.data.success) {
              await listaItens();
              toast.info('PEDIDO RECALCULADO COM SUCESSO!!!', toastOptions);
            } else {
              toast.error(response.data.errors, toastOptions);
            }
            setLoading(false);
          } else {
            const x = optTabPreco.find(
              (op) =>
                op.value.toString() ===
                gridItens[0].item_tab_preco_id.toString()
            );
            frmCapa.current.setFieldValue('item_tab_preco_id', x);
          }
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao recalcular pedido pela tabela de preço\n${error} `,
        toastOptions
      );
    }
  };

  const handleDataEmis = async (dt) => {
    if (dt > maxDataEmiss || dt < minDataEmiss) {
      toast.error(
        'DATA INVÁLIDA!!! INFOME UMA DATA NO MÊS CORRENTE OU NO PRÓXIMO MÊS',
        toastOptions
      );
      setDataEmiss(new Date());
    } else setDataEmiss(new Date(dt));
  };

  useEffect(() => {
    setColunaItens(gridColumnItens);
    setTitlePg('ORÇAMENTO DE VENDA');
    getComboFpgto();
    listaPedido();
    getComboOperFat();
    getComboCondVcto();
    getComboTabPreco();
    getParamSistema();
    setDesableSave(true);

    const hoje = new Date();
    const mindate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const maxDate = addMes(hoje, 1);

    setMaxDataEmiss(maxDate);
    setMinDataEmiss(mindate);

    setValueTab(0);
  }, []);

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoPedido}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar/Calcular Orçamento" placement="left">
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

        <BootstrapTooltip title="LANÇAR DESPESAS ADICIONAIS" placement="left">
          <button type="button" onClick={handleValidaDespesa}>
            <FaWeightHanging size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="EXCLUIR ORÇAMENTO" placement="left">
          <button type="button" onClick={handleDeleteOrcamento}>
            <FaTrashAlt size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Impressão do Pedido" placement="left">
          <button type="button" onClick={handleDlgImpressao}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />

        <BootstrapTooltip
          title="CONVERTER ORÇAMENTO EM PEDIDO DE VENDA"
          placement="left"
        >
          <button type="button" onClick={exportarOrcamento}>
            <FaFileExport size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="30px" />

        <BootstrapTooltip title="ACESSAR CADASTRO DE PRODUTOS" placement="left">
          <button type="button" onClick={handleProduto}>
            <FaCubes size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="CONSULTA RÁPIDA DE PRODUTOS" placement="right">
          <button type="button" onClick={() => setDlgConsProduto(true)}>
            <FaPagelines size={28} color="#fff" />
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
                title="Consultar Orçamento"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR ORÇAMENTO"
                  {...a11yProps(0)}
                  icon={<FaSearchDollar size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Informções Inciais do Orçamento"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="ORÇAMENTO"
                  {...a11yProps(1)}
                  icon={<FaThList size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCad fr="3fr 1fr 1fr 1fr 1fr">
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
                    <label>Num. Orçamento</label>
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

          {/* ABA ORÇAMENTO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCapa" ref={frmCapa}>
                <BoxItemCad fr="1fr 1fr 3fr 2fr 2fr 2fr">
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
                          onChangeDate={(dt) => handleDataEmis(dt)}
                          value={dataEmiss}
                          label="Data Emissão"
                          minDate={minDataEmiss}
                          maxDate={maxDataEmiss}
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
                  <AreaComp wd="100">
                    <FormSelect
                      name="cp_fpgto_id"
                      label="Forma de Pagamento"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>

                <h1>ITENS DO ORÇAMENTO</h1>

                <BoxItemCad fr="1fr 2fr">
                  <AreaComp wd="100">
                    <label>Observações do orçamento</label>
                    <TextArea
                      type="text"
                      resize="none"
                      name="cp_observacao"
                      rows="4"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <BoxItemCad fr="0.8fr 2fr 3.2fr 2fr">
                      <AreaComp wd="100" ptop="20px">
                        <CCheck>
                          <input
                            type="checkbox"
                            id="chbBonificar"
                            name="chbBonificar"
                            value="S"
                          />
                          <label htmlFor="chbBonificar">brinde</label>
                        </CCheck>
                      </AreaComp>
                      <AreaComp wd="100">
                        <FormSelect
                          name="item_tab_preco_id"
                          label="Tabela de Preços"
                          optionsList={optTabPreco}
                          isClearable={false}
                          onChange={handleChangeTabPreo}
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
                            placeholder="CODIGO DE BARRAS"
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
                          onKeyEvent={async () => {
                            if (paramSistema[0].par_digitacao_pausada === 'S') {
                              await totalItem();
                              if (!frmCapa.current.getData().cp_id)
                                await handleSubmitCapa();
                              await handleSubmitItens(gridGradeSelected);
                              const ref = frmCapa.current.getFieldRef(
                                'item_prod_id'
                              );
                              ref.focus();
                            }
                          }}
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
                          onKeyEvent={async () => {
                            if (paramSistema[0].par_digitacao_pausada === 'S') {
                              await totalItem();
                              if (!frmCapa.current.getData().cp_id)
                                await handleSubmitCapa();
                              await handleSubmitItens(gridGradeSelected);
                              const ref = frmCapa.current.getFieldRef(
                                'item_prod_id'
                              );
                              ref.focus();
                            }
                          }}
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
                          onKeyEvent={async () => {
                            if (paramSistema[0].par_digitacao_pausada === 'S') {
                              await totalItem();
                              if (!frmCapa.current.getData().cp_id)
                                await handleSubmitCapa();
                              await handleSubmitItens(gridGradeSelected);
                              const ref = frmCapa.current.getFieldRef(
                                'item_prod_id'
                              );
                              ref.focus();
                            }
                          }}
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
                        <label>Desconto em (%)</label>
                        <KeyboardEventHandler
                          handleKeys={['enter']}
                          onKeyEvent={async () => {
                            if (paramSistema[0].par_digitacao_pausada === 'S') {
                              await totalItem();
                              if (!frmCapa.current.getData().cp_id)
                                await handleSubmitCapa();
                              await handleSubmitItens(gridGradeSelected);
                              const ref = frmCapa.current.getFieldRef(
                                'item_prod_id'
                              );
                              ref.focus();
                            }
                          }}
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
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={colunaItens}
                      rowData={gridItens}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </BoxItemCadNoQuery>

                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>QTD. produtos</label>
                    <Input
                      type="number"
                      name="qtd_itens"
                      value={remumoItens.quantidade}
                      readOnly
                      className="input_destaque_plus"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor do Produtos</label>
                    <Input
                      type="text"
                      name="valor_itens"
                      value={remumoItens.valor}
                      readOnly
                      className="input_destaque_plus"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Despesas</label>
                    <Input
                      type="text"
                      name="cp_vlr_outros"
                      className="input_destaque_plus"
                      readOnly
                      onChange={maskDecimal}
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>Valor Bonificação</label>
                    <Input
                      type="number"
                      name="vlr_bonificacao"
                      readOnly
                      className="input_destaque_plus"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Desconto</label>
                    <Input
                      type="number"
                      name="cp_vlr_desc"
                      readOnly
                      className="input_destaque_plus"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor do Orçamento</label>
                    <Input
                      type="number"
                      name="cp_vlr_nf"
                      readOnly
                      className="input_destaque"
                    />
                  </AreaComp>
                </BoxItemCad>
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
              <BoxItemCadNoQuery fr="1fr">
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

                    <input
                      type="checkbox"
                      id="chbShowClassific"
                      name="chbShowClassific"
                      value="S"
                    />
                    <label htmlFor="chbShowClassific">
                      Exibir Classificações na descricao do item
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

      {/* popup para consulta de produtos... */}
      <Popup
        isOpen={dlgConsProduto}
        closeDialogFn={() => {
          setDlgConsProduto(false);
        }}
        title="CONSULTA RÁPIDA DE PRODUTOS"
        size="lg"
      >
        <CONSULTA_PRODUTO />
      </Popup>

      {/* popup para despesas adicionais... */}
      <Popup
        isOpen={dlgDespesa}
        closeDialogFn={() => setDlgDespesa(false)}
        title="DESPESAS ADICIONAIS"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmDespesa" ref={frmDespesa}>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>valor (outras despesas)</label>
                <Input
                  type="text"
                  name="vlrDespesa"
                  onChange={maskDecimal}
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCadNoQuery>

            <BoxItemCadNoQuery fr="1fr" ptop="35px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleDespesa}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

      {/* popup para orçamento... */}
      <Popup
        isOpen={dlgOrcamento}
        closeDialogFn={() => setDlgOrcamento(false)}
        title="CONVERTER ORÇAMENTO EM PEDIDO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmOrcamento" ref={frmOrcamento}>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="radio"
                    id="rbPrevenda"
                    name="radioorca"
                    value="S"
                  />
                  <label htmlFor="rbPrevenda">
                    Gerar Pedido de Venda (Prevenda)
                  </label>

                  <input
                    type="radio"
                    id="rbConsignado"
                    name="radioorca"
                    value="S"
                  />
                  <label htmlFor="rbConsignado">Gerar Pedido Consignado</label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>

            <BoxItemCadNoQuery fr="1fr" ptop="35px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleOrcamento}
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
        title={titlePg}
        message="Aguarde Processamento..."
      />
    </>
  );
}
