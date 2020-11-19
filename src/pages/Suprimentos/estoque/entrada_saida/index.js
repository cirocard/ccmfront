import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import moment from 'moment';
import { MdClose } from 'react-icons/md';
import {
  FaPrint,
  FaCubes,
  FaSearch,
  FaPlusCircle,
  FaFolderPlus,
  FaCheck,
  FaTrashAlt,
} from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, FormataData } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerGrade,
} from './styles';
import Popup from '~/componentes/Popup';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  CModal,
} from '~/pages/general.styles';

export default function SUPR8() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmGrade = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [fornecedor, setFornecedor] = useState([]);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [optOperEntrada, setOptOperEntrada] = useState([]);
  const [optOperSaida, setOptOperSaida] = useState([]);
  const [optOperEst, setOptOperEst] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState([]);
  const [gridGrade, setGridGrade] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [openDlgGrade, setOpenDlgGrade] = useState(false);
  const [titleDlgGrade, setTitleDlgGrade] = useState('');
  const [inputDesable, setInputDesable] = useState(true);
  const [prode_id, setProde_id] = useState(null);
  const [forn_id, setForn_id] = useState(null);
  const [prod_id, setProd_id] = useState(null);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'CADASTRADO' },
    { value: '2', label: 'ATUALIZADOS' },
    { value: '3', label: 'CANCELADO' },
  ];

  const optTipo = [
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
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

  const loadOptions = async (inputText, callback) => {
    const { ent_operest_id } = frmCadastro.current.getData();
    if (ent_operest_id) {
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
        'INFORME A OPERAÇÃO DE ESTOQUE PARA CONTINUAR...',
        toastOptions
      );
    }
  };

  // Operação de Estoque
  async function getComboOperEst(tipo) {
    try {
      const response = await api.get(`v1/combos/oper_est/${tipo}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tipo === 'E') setOptOperEntrada(dados);
        else setOptOperSaida(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Operaçao de Estoque \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    ent_operest_id: Yup.string().required('(??)'),
    ent_observacao: Yup.string().required('(??)'),
    ent_prod_id: Yup.string().required('(??)'),
    ent_quantidade: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/supr1', '_blank');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // listar movimentaçoes cadastradas
  async function listaMovimentacoes() {
    try {
      setLoading(true);
      const dados = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/supr/estoque/entrada_estoque?ent_id=${dados.pesq_ent_id}&forn_id=${
          fornecedor.value || ''
        }&data_ini=${moment(pesqDataIni).format(
          'YYYY-MM-DD'
        )}&data_fin=${moment(pesqDataFin).format('YYYY-MM-DD')}&tipo=${
          dados.pesq_ent_tipo
        }&situacao=${dados.pesq_ent_situacao}`
      );
      const { retorno } = response.data;
      if (retorno) {
        setGridPesquisa(retorno);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar movimentação de estoque\n${error}`);
    }
  }

  // listar itens movimentacao
  async function getItensMov() {
    try {
      setLoading(true);
      const { ent_id, ent_tipo } = frmCadastro.current.getData();
      const response = await api.get(
        `v1/supr/estoque/grid_itens_mov?ent_id=${ent_id}&ent_tipo=${ent_tipo}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridItens(dados);
      } else setGridItens([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar itens da movimentação \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('ent_id', '');
    frmCadastro.current.setFieldValue('ent_itens_id', '');
    frmCadastro.current.setFieldValue('ent_operest_id', '');
    frmCadastro.current.setFieldValue('ent_tipo', '');
    frmCadastro.current.setFieldValue('ent_situacao', '');
    frmCadastro.current.setFieldValue('ent_forn_id', '');
    frmCadastro.current.setFieldValue('ent_datacad', '');
    frmCadastro.current.setFieldValue('ent_observacao', '');
    frmCadastro.current.setFieldValue('ent_quantidade', '');
    setGridItens([]);
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'ent_id',
          dataGridPesqSelected[0].ent_id
        );

        frmCadastro.current.setFieldValue(
          'ent_tipo',
          optTipo.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].ent_tipo.toString()
          )
        );

        if (dataGridPesqSelected[0].ent_tipo.toString() === 'E') {
          setOptOperEst(setOptOperEntrada);
          frmCadastro.current.setFieldValue(
            'ent_operest_id',
            optOperEntrada.find(
              (op) =>
                op.value.toString() ===
                dataGridPesqSelected[0].ent_operest_id.toString()
            )
          );
        } else {
          setOptOperEst(setOptOperSaida);
          frmCadastro.current.setFieldValue(
            'ent_operest_id',
            optOperSaida.find(
              (op) =>
                op.value.toString() ===
                dataGridPesqSelected[0].ent_operest_id.toString()
            )
          );
        }

        frmCadastro.current.setFieldValue(
          'ent_datacad',
          dataGridPesqSelected[0].ent_datacad
        );
        frmCadastro.current.setFieldValue(
          'ent_situacao',
          dataGridPesqSelected[0].ent_situacao
        );
        frmCadastro.current.setFieldValue(
          'ent_observacao',
          dataGridPesqSelected[0].ent_observacao
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
        if (formData.ent_situacao === 'ATUALIZADO') {
          toast.info(
            'ESTA MOVIMENTAÇÃO ESTÁ ATUALIZADA, NAO PODE MAIS SER ALTERADA...',
            toastOptions
          );
          return;
        }
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const mov = {
          ent_emp_id: null,
          ent_id: formData.ent_id ? formData.ent_id : null,
          ent_itens_id: null,
          ent_operest_id: formData.ent_operest_id,
          ent_tipo: formData.ent_tipo,
          ent_situacao: '1',
          ent_forn_id: forn_id,
          ent_datacad: null,
          ent_data_prestacao: null,
          ent_observacao: formData.ent_observacao.toUpperCase(),
          ent_prod_id: prod_id,
          ent_prode_id: prode_id,
          ent_quantidade: formData.ent_quantidade,
          ent_usr_id: null,
          ent_acerto: null,
        };

        const retorno = await api.post('v1/supr/estoque/entrada_estoque', mov);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'ent_id',
            retorno.data.retorno[0].capa.ent_id
          );
          frmCadastro.current.setFieldValue('ent_situacao', 'CADASTRADO');
          frmCadastro.current.setFieldValue(
            'ent_datacad',
            FormataData(retorno.data.retorno[0].capa.ent_datacad, 1)
          );
          setGridItens(retorno.data.retorno[0].itens);
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
          frmCadastro.current.setFieldValue('ent_quantidade', '');
          frmCadastro.current.setFieldValue('ent_prod_id', '');
          frmCadastro.current.setFieldValue('barcode', '');
          document.getElementsByName('barcode')[0].focus();
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
        'ent_operest_id',
        validationErrors.ent_operest_id
      );
      frmCadastro.current.setFieldError(
        'ent_observacao',
        validationErrors.ent_observacao
      );
      frmCadastro.current.setFieldError(
        'ent_prod_id',
        validationErrors.ent_prod_id
      );
      frmCadastro.current.setFieldError(
        'ent_quantidade',
        validationErrors.ent_quantidade
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      frmCadastro.current.setFieldValue('ent_id', '');
      setValueTab(newValue);
      await listaMovimentacoes();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.ent_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
        if (dataGridPesqSelected.length > 0) await getItensMov();
      }
    }
  };

  // change select  produto - abrir popup grade
  async function handleChangeSelectProduto(p) {
    try {
      setLoading(true);
      setSelectedProduto(p);
      if (p.value) {
        if (!frmCadastro.current.getData().barcode) {
          const url = `v1/fat/grade_produto?prod_id=${p.value}&marca_id=&classific1=&classific2=&classific3=&tab_id=1`;
          const response = await api.get(url);
          const dados = response.data.retorno;
          if (dados) {
            setGridGrade(dados);
            setTitleDlgGrade(`ITEM SELECIONADO: ${p.label} :: ESCOLHA A GRADE`);
            setOpenDlgGrade(true);
          }
        }
      } else {
        frmCadastro.current.setFieldValue('ent_quantidade', '');
        frmCadastro.current.setFieldValue('barcode', '');
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
      frmCadastro.current.setFieldValue('ent_quantidade', 1);
      setProde_id(prm.prode_id);
      setForn_id(prm.forn_id);
      setProd_id(prm.prod_id);
    }
    setInputDesable(false);
    document.getElementsByName('ent_quantidade')[0].focus();
  };

  // evento barcode
  async function exitBarcode() {
    try {
      const { barcode } = frmCadastro.current.getData();
      if (barcode) {
        if (barcode.length === 12) {
          setInputDesable(true);
          let prode = barcode.substring(2, 11);
          prode = parseInt(prode, 10);

          setLoading(true);
          const url = `v1/fat/grade_produto?prod_id=&marca_id=&classific1=&classific2=&classific3=&tab_id=1&prode_id=${prode}`;
          const response = await api.get(url);
          const dados = response.data.retorno;
          if (dados.length > 0) {
            frmCadastro.current.setFieldValue('ent_quantidade', 1);

            const x = {
              value: dados[0].prod_id,
              label: dados[0].prod_descricao,
            };
            frmCadastro.current.setFieldValue('ent_prod_id', x);

            setProde_id(dados[0].prode_id);
            setForn_id(dados[0].forn_id);
            setProd_id(dados[0].prod_id);

            setInputDesable(false);
            frmCadastro.current.setFieldValue('barcode', '');
            document.getElementsByName('ent_quantidade')[0].focus();
          } else {
            toast.info('ATENÇÃO!! PRODUTO NÃO ENCONTRADO', toastOptions);
            frmCadastro.current.setFieldValue('item_quantidade', '');
          }

          setInputDesable(false);
          setLoading(false);
        } else toast.error('O código informado não é valido', toastOptions);
      } else {
        toast.error('O código informado não é valido', toastOptions);
      }
    } catch (error) {
      setInputDesable(false);
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  // impressao da movimentaçao
  async function handleImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        const url = `/v1/supr/estoque/rel_entrada_saida?ent_id=${dataGridPesqSelected[0].ent_id}`;

        const response = await api.get(url);
        const link = response.data;
        setLoading(false);
        window.open(link, '_blank');
      } else {
        toast.info('Selecione uma movimentação para imprimir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao imprimir movimentação de estoque \n${error}`,
        toastOptions
      );
    }
  }

  // atualizar movimentação
  async function handleAtualizarMov() {
    try {
      if (dataGridPesqSelected.length > 0) {
        if (dataGridPesqSelected[0].ent_situacao === 'CADASTRADO') {
          setLoading(true);

          const url = `/v1/supr/estoque/entrada_estoque?ent_id=${dataGridPesqSelected[0].ent_id}`;
          const response = await api.put(url);
          if (response.data.success) {
            await listaMovimentacoes();
            toast.success(
              'MOVIMENTAÇÃO ATUALIZADA COM SUCESSO!!!',
              toastOptions
            );
          } else
            toast.info(
              'MOVIMENTAÇÃO NÃO ATUALIZADA... VERIFIQUE!!!',
              toastOptions
            );
          setLoading(false);
        } else {
          toast.info(
            'ESTA MOVIMENTAÇÃO NÃO PODE MAIS SER ALTERADA...',
            toastOptions
          );
        }
      } else {
        toast.info(
          'Selecione uma movimentação cadastrada para atualizar',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao atualizar movimentação de estoque \n${error}`,
        toastOptions
      );
    }
  }

  function handleProduto() {
    window.open('/supr4', '_blank');
  }

  async function handleExcluir(prm) {
    try {
      if (prm.ent_situacao === '1') {
        const response = await api.delete(
          `v1/supr/estoque/entrada_estoque?ent_id=${prm.ent_id}&ent_itens_id=${prm.ent_itens_id}`
        );
        if (response.data.success) {
          toast.success('ITEM EXCLUÍDO COM SUCESSO!!!', toastOptions);
          await getItensMov();
        } else {
          toast.error(response.data.message);
        }
      } else {
        toast.warning(
          'ESTA MOVIMENTAÇÃO NAO PODE MAIS SER ALTERADA.  VERIQUE A SITUAÇÃO',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluír item \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    listaMovimentacoes();
    getComboOperEst('E');
    getComboOperEst('S');
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'ent_id',
      headerName: 'CÓDIGO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,

      lockVisible: true,
    },
    {
      field: 'ent_datacad',
      headerName: 'DATA CADASTRO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tipo_mov',
      headerName: 'TIPO MOVIMENTAÇÃO',
      width: 160,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ent_observacao',
      headerName: 'IDENTIFICAÇÃO DA MOVIMENTAÇÃO',
      width: 600,
      sortable: false,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'ent_situacao',
      headerName: 'SITUAÇÃO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
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

  // #endregion

  // #region GRID ITENS  =========================

  const gridColumnItens = [
    {
      field: 'ent_itens_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="EXCLUIR ITEM" placement="top">
              <button type="button" onClick={() => handleExcluir(prm.data)}>
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'ent_itens_id',
      headerName: 'CÓDIGO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_referencia',
      headerName: 'REFERÊNCIA',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_unidade_venda',
      headerName: 'UNIDADE',
      width: 90,
      sortable: false,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'prod_descricao',
      headerName: 'DESCRIÇÃO PRODUTO',
      width: 400,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ent_quantidade',
      headerName: 'QUANTIDADE',
      width: 150,
      sortable: false,
      resizable: true,
      lockVisible: true,
      cellStyle: { color: '#DB0505', fontWeight: 'bold' },
    },

    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 150,
      sortable: false,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFIC. 2',
      width: 150,
      sortable: false,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFIC. 3',
      width: 150,
      sortable: false,
      resizable: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="CONSULTAR MOVIMENTAÇÕES" placement="right">
          <button type="button" onClick={listaMovimentacoes}>
            <FaSearch size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="NOVO CADASTRO" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip
          title="IMPRIMIR CONFERÊNCIA DE MOVIMENTAÇÃO"
          placement="left"
        >
          <button type="button" onClick={handleImpressao}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip
          title="CONFIRMAR E ATUALIZAR MOVIMENTAÇÃO"
          placement="left"
        >
          <button type="button" onClick={handleAtualizarMov}>
            <FaCheck size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="CONSULTAR PRODUTOS" placement="left">
          <button type="button">
            <FaCubes size={25} color="#fff" onClick={handleProduto} />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRAR ENTRADA/SAÍDA DE ESTOQUE</h1>
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
                title="CONSULTAR MOVIMENTAÇÕES DE ENTRADA/SAÍDA"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR MOVIMENTAÇÕES"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR NOVA MOVIMENTAÇÃO DE ENTRADA OU SAÍDA"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR MOVIMENTAÇÕES"
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
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCad fr="3fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter', 'tab']}
                      onKeyEvent={() => null}
                    >
                      <AsyncSelectForm
                        name="pesq_ent_forn_id"
                        label="Informe CNPJ ou Razão Social do fornecedor para pesquisar"
                        value={fornecedor}
                        placeholder="PESQUISAR FORNECEDOR"
                        onChange={(f) => setFornecedor(f || [])}
                        loadOptions={loadOptionsFornec}
                        isClearable
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="TIPO MOVIMENTAÇÀO"
                      name="pesq_ent_tipo"
                      optionsList={optTipo}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="pesq_ent_id"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataIni(new Date(date))}
                      value={pesqDataIni}
                      label="Data Inicial"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataFin(new Date(date))}
                      value={pesqDataFin}
                      label="Data Final"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="pesq_ent_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
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
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
                      onSelectionChanged={handleSelectGridPesquisa}
                      rowClassRules={{
                        'warn-cadastrado': function (p) {
                          const cadastrado = p.data.ent_situacao;
                          return cadastrado === 'CADASTRADO';
                        },
                        'warn-cancelado': function (p) {
                          const cancelado = p.data.ent_situacao;
                          return cancelado === 'CANCELADO';
                        },
                        'warn-atualizado': function (p) {
                          const atualizado = p.data.ent_situacao;
                          return atualizado === 'ATUALIZADO';
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
                <BoxItemCad fr="1fr 1fr 3fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="ent_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="TIPO MOVIMENTAÇÀO"
                      name="ent_tipo"
                      optionsList={optTipo}
                      isClearable
                      onChange={async (o) => {
                        if (o) {
                          if (o.value === 'E') setOptOperEst(optOperEntrada);
                          else setOptOperEst(optOperSaida);
                        } else setOptOperEst([]);
                      }}
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="OPERAÇÃO DE ESTOQUE"
                      name="ent_operest_id"
                      optionsList={optOperEst}
                      onChange={async (o) =>
                        o ? setInputDesable(false) : setInputDesable(true)
                      }
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Cadastro</label>
                    <Input
                      type="text"
                      name="ent_datacad"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Situação</label>
                    <Input
                      type="text"
                      name="ent_situacao"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <label>identificação da Movimentação</label>
                    <Input
                      type="text"
                      name="ent_observacao"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <h1>ITENS DA MOVIMENTAÇÃO</h1>
                <BoxItemCad fr="3fr 2fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="ent_prod_id"
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
                  <AreaComp wd="100">
                    <label>Quantidade</label>
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={() => handleSubmit()}
                    >
                      <Input
                        type="text"
                        name="ent_quantidade"
                        placeholder="0,00"
                        className="input_cad"
                        disabled={inputDesable}
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerGrade className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnItens}
                      autoGroupColumnDef={autoGroupColumnDef}
                      rowData={gridItens}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerGrade>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup grade produto */}

      <Popup
        isOpen={openDlgGrade}
        closeDialogFn={() => setOpenDlgGrade(false)}
        title={titleDlgGrade}
        size="lg"
      >
        <Scroll>
          <CModal wd="100%" hd="90%">
            <Form id="frmGrade" ref={frmGrade}>
              <BoxItemCadNoQuery fr="1fr">
                <GridContainerGrade className="ag-theme-balham">
                  <AgGridReact
                    columnDefs={gridColumnGrade}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowData={gridGrade}
                    rowSelection="single"
                    animateRows
                    gridOptions={{ localeText: gridTraducoes }}
                  />
                </GridContainerGrade>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Scroll>
      </Popup>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="ENTRADA/SAÍDA DE ESTOQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
