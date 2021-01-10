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
  FaFolderPlus,
  FaUserTie,
  FaMoneyCheckAlt,
  FaTrashAlt,
  FaCog,
  FaSearchMinus,
  FaSearchPlus,
  FaCheckDouble,
  FaPrint,
} from 'react-icons/fa';
import moment from 'moment';
import Confirmation from '~/componentes/DialogChoice';
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
  GridCurrencyFormatter,
  FormataMoeda,
  toDecimal,
  FormataData,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerCheque,
  BoxPesquisa,
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
import CONULTA_PEDIDO from '~/pages/Financeiro/cadastros/bordero/consulta';
import CONSULTA_CHEQUE from '~/componentes/ConsultaCheque';

export default function FINA6() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmCheque = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridPedido, setGridPedido] = useState([]);
  const [gridCheque, setGridCheque] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataGridPedido, setDataGridPedido] = useState([]);
  const [dataGridCheque, setDataGridCheque] = useState([]);
  const [optGrpRec, setOptGrprec] = useState([]);
  const [optContas, setOptContas] = useState([]);
  const [vendedor, setVendedor] = useState([]);
  const [optSituacaoCheque, setOptSituacaoCheque] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-7, 'day'));
  const [dataFin, setDataFin] = useState(moment());
  const [dlgPedido, setDlgPedido] = useState(false);
  const [dlgCheque, setDlgCheque] = useState(false);
  const [dlgGerenciar, setDlgGerenciar] = useState(false);
  const [valorPedido, setValorPedido] = useState(0);
  const [valorCheque, setValorCheque] = useState(0);

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
        if (tab_id === 25) {
          setOptSituacaoCheque(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // grupo de receita
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
    bc_descricao: Yup.string().required('(??)'),
    bc_grupo_receita: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1', '_blank');
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const handleSelectGridPedido = async (prmGridPed) => {
    const gridApi = prmGridPed.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPedido(selectedRows);
    const formData = frmCadastro.current.getData();
    if (formData.bc_id) {
      const response = await api.get(
        `v1/fina/cheque/cheques_bordero?bc_id=${
          formData.bc_id
        }&cp_id=${selectedRows[0].cp_id.toString()}`
      );
      const dados = response.data.retorno;
      setGridCheque(dados);
    }
  };

  const handleSelectGridCheque = async (prmGridCheque) => {
    const gridApi = prmGridCheque.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridCheque(selectedRows);
  };

  // fazer consulta das operaçoes
  async function listarBordero() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();

      const response = await api.get(
        `v1/fina/cheque/listar_bordero?cli_id=${
          formPesq.pesq_bc_vendedor_id || ''
        }&siuacao=${formPesq.pesq_bc_situacao}&data_ini=${moment(
          dataIni
        ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
          'YYYY-MM-DD'
        )}`
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
    frmCadastro.current.setFieldValue('bc_situacao', '1');
    frmCadastro.current.setFieldValue('bc_id', '');
    frmCadastro.current.setFieldValue('bc_grupo_receita', '');
    frmCadastro.current.setFieldValue('bc_valor_pedido', '');
    frmCadastro.current.setFieldValue('bc_valor_cheque', '');
    frmCadastro.current.setFieldValue('bc_vendedor_id', '');
    frmCadastro.current.setFieldValue('bc_observacao', '');
    frmCadastro.current.setFieldValue('bc_databaixa', '');
    frmCadastro.current.setFieldValue('bc_datacad', '');
    frmCadastro.current.setFieldValue('bc_descricao', '');
    setValorCheque(0);
    setValorPedido(0);
  };

  async function handlePedidosBordero() {
    try {
      if (dataGridPesqSelected[0].bc_id) {
        const response = await api.get(
          `v1/fina/cheque/pedidos_bordero?bc_id=${dataGridPesqSelected[0].bc_id}`
        );
        const dados = response.data.retorno;
        setGridPedido(dados);
      }
    } catch (error) {
      throw new Error(`Erro ao consultar pedido bordero \n${error}`);
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        setDataGridPedido([]);
        frmCadastro.current.setFieldValue(
          'bc_id',
          dataGridPesqSelected[0].bc_id
        );
        frmCadastro.current.setFieldValue(
          'bc_grupo_receita',
          optGrpRec.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].bc_grupo_receita.toString()
          )
        );
        frmCadastro.current.setFieldValue(
          'bc_valor_pedido',
          FormataMoeda(dataGridPesqSelected[0].bc_valor_pedido)
        );

        setValorPedido(toDecimal(dataGridPesqSelected[0].bc_valor_pedido));

        frmCadastro.current.setFieldValue(
          'bc_valor_cheque',
          FormataMoeda(dataGridPesqSelected[0].bc_valor_cheque)
        );

        setValorCheque(toDecimal(dataGridPesqSelected[0].bc_valor_cheque));

        await loadOptionsRepresentante(
          dataGridPesqSelected[0].bc_vendedor_id,
          setVendedor
        );
        frmCadastro.current.setFieldValue(
          'bc_observacao',
          dataGridPesqSelected[0].bc_observacao
        );
        frmCadastro.current.setFieldValue(
          'bc_situacao',
          optSituacao.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].bc_situacao.toString()
          )
        );
        frmCadastro.current.setFieldValue(
          'bc_databaixa',
          FormataData(dataGridPesqSelected[0].bc_databaixa)
        );
        frmCadastro.current.setFieldValue(
          'bc_datacad',
          FormataData(dataGridPesqSelected[0].bc_datacad)
        );
        frmCadastro.current.setFieldValue(
          'bc_descricao',
          dataGridPesqSelected[0].bc_descricao
        );

        // itens do bordero
        await handlePedidosBordero();
        await handleListaCheque('');

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
    setValueTab(1);
    limpaForm();
    setGridCheque([]);
    setGridPedido([]);
    setDataGridPedido([]);
    setDataGridPesqSelected([]);
    document.getElementsByName('bc_descricao')[0].focus();
  }

  async function handleSubmit() {
    try {
      if (parseInt(valueTab, 10) > 0) {
        if (gridPedido.length < 1) {
          toast.warning(
            'INFORME UM PEDIDO PARA O ACERTO DE CHEQUES!!',
            toastOptions
          );
          return;
        }

        if (gridCheque.length < 1) {
          toast.warning(
            'PARA SALVAR O BORDERÔ É NECESSÁRIO INFORMAR PELO MENOS UM CHEQUE!!',
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

        gridCheque.forEach((c) => {
          const cheque = {
            bci_bc_emp_id: null,
            bci_bc_id: null, // formData.bc_id ? parseInt(formData.bc_id, 10) : null,
            bci_cp_id: dataGridPedido[0].cp_id,
            bci_cheque_id: c.chq_id,
            bci_valor_cheque: toDecimal(c.chq_valor),
            bci_sit_cheque: parseInt(c.chq_situacao_id, 10),
            bci_situacao: '1',
            bci_conta: null,
            bci_repassado: null,
          };
          itens.push(cheque);
        });

        const bordero = {
          bc_emp_id: null,
          bc_id: formData.bc_id ? parseInt(formData.bc_id, 10) : null,
          bc_grupo_receita: parseInt(formData.bc_grupo_receita, 10),
          bc_valor_pedido: valorPedido,
          bc_valor_cheque: valorCheque,
          bc_vendedor_id:
            dataGridPesqSelected.length > 0
              ? dataGridPesqSelected[0].bc_vendedor_id
              : parseInt(vendedor.value, 10),
          bc_observacao: formData.bc_observacao.toUpperCase(),
          bc_situacao: formData.bc_situacao,
          bc_descricao: formData.bc_descricao.toUpperCase(),
          bc_itens: itens,
        };

        const retorno = await api.post(
          'v1/fina/cheque/bordero_cheque',
          bordero
        );
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'bc_id',
            retorno.data.retorno.bc_id
          );
          frmCadastro.current.setFieldValue(
            'bc_datacad',
            FormataData(retorno.data.retorno.bc_datacad)
          );
          frmCadastro.current.setFieldValue(
            'bc_valor_pedido',
            FormataMoeda(retorno.data.retorno.bc_valor_pedido)
          );
          frmCadastro.current.setFieldValue(
            'bc_valor_cheque',
            FormataMoeda(retorno.data.retorno.bc_valor_cheque)
          );
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
      } else {
        toast.info(`Altere ou inicie um cadastro para salvar...`, toastOptions);
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
        'bc_grupo_receita',
        validationErrors.bc_grupo_receita
      );
      frmCadastro.current.setFieldError(
        'bc_descricao',
        validationErrors.bc_descricao
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
      await listarBordero();
    } else if (newValue === 1) {
      await handleEdit();
    }
  };

  function handleCliente() {
    window.open('/crm9', '_blank');
  }

  function getPedido(pedido) {
    const aux = [];
    if (gridPedido.length > 0) aux.push(...gridPedido, pedido[0]);
    else aux.push(pedido[0]);

    setGridPedido(aux);
    setGridCheque([]);
    setDataGridPedido([]);
    setDlgPedido(false);
  }

  function getCheque(cheque) {
    const aux = [];
    cheque.forEach((c) => {
      if (gridCheque.length > 0) aux.push(...gridCheque, c);
      else aux.push(c);
    });

    setDataGridCheque(cheque);
    setGridCheque(aux);
    setDlgCheque(false);
  }

  async function handleExcluirPedido() {
    try {
      if (dataGridPedido.length > 0) {
        const formCad = frmCadastro.current.getData();
        if (formCad.bc_id) {
          const confirmation = await Confirmation.show(
            'Ao excluir o pedido, todos os cheques vinculados a ele serão excluídos do borderô.  Deseja Continuar???'
          );

          if (confirmation) {
            setLoading(true);
            const response = await api.delete(
              `v1/fina/cheque/excluir_pedido_bordero?bc_id=${formCad.bc_id}&cp_id=${dataGridPedido[0].cp_id}`
            );
            if (response.data.success) {
              const aux = gridPedido.filter((p) => p !== dataGridPedido[0]);
              setGridPedido(aux);
              toast.success('PEDIDO EXCLUÍDO!!!', toastOptions);
              setGridCheque([]);
              frmCadastro.current.setFieldValue(
                'bc_valor_cheque',
                FormataMoeda(response.data.retorno[0].bc_valor_cheque)
              );
              frmCadastro.current.setFieldValue(
                'bc_valor_pedido',
                FormataMoeda(response.data.retorno[0].bc_valor_pedido)
              );
            } else {
              toast.error(
                `Erro ao excluir pedido: ${response.data.message}`,
                toastOptions
              );
            }
            setLoading(false);
          }
        } else {
          const aux = gridPedido.filter((p) => p !== dataGridPedido[0]);
          setGridPedido(aux);
        }
      } else {
        toast.warning('SELECIONE UM PEDIDO PARA CONTINUAR...', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir pedido: ${error}`);
    }
  }

  async function handleListaCheque(cp_id) {
    const formData = frmCadastro.current.getData();
    if (formData.bc_id) {
      const response = await api.get(
        `v1/fina/cheque/cheques_bordero?bc_id=${formData.bc_id}&cp_id=${cp_id}`
      );
      const dados = response.data.retorno;
      setGridCheque(dados);
    }
  }

  async function handleExcluirCheque() {
    try {
      if (dataGridCheque.length > 0) {
        const formCad = frmCadastro.current.getData();
        if (formCad.bc_id) {
          const confirmation = await Confirmation.show(
            'Confirma a exclusão do cheque para este Borderô???'
          );

          if (confirmation) {
            setLoading(true);
            const response = await api.delete(
              `v1/fina/cheque/excluir_cheque_bordero?bc_id=${formCad.bc_id}&chq_id=${dataGridCheque[0].chq_id}`
            );
            if (response.data.success) {
              const aux = gridCheque.filter((c) => c !== dataGridCheque[0]);
              setGridCheque(aux);
              toast.success('CHEQUE EXCLUÍDO!!!', toastOptions);

              frmCadastro.current.setFieldValue(
                'bc_valor_cheque',
                FormataMoeda(response.data.retorno[0].bc_valor_cheque)
              );
              frmCadastro.current.setFieldValue(
                'bc_valor_pedido',
                FormataMoeda(response.data.retorno[0].bc_valor_pedido)
              );
            } else {
              toast.error(
                `Erro ao excluir pedido: ${response.data.message}`,
                toastOptions
              );
            }
            setLoading(false);
          }
        } else {
          const aux = gridCheque.filter((c) => c !== dataGridCheque[0]);
          setGridCheque(aux);
        }
      } else {
        toast.error('SELECIONE UM  CHEQUE PARA CONTINUAR...', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir pedido: ${error}`);
    }
  }

  async function handleNovoPedido() {
    if (valueTab === 1) {
      if (gridPedido.length > 0 && gridCheque.length > 0) {
        await handleSubmit();
      }
      setDlgPedido(true);
    }
  }

  async function handleNovoCheque() {
    if (valueTab === 1) {
      if (dataGridPedido.length > 0) {
        setDlgCheque(true);
      } else {
        toast.warning(
          'SELECIONE UM PEDIDO ANTES DE LOCALIZAR O CHEQUE',
          toastOptions
        );
      }
    }
  }

  async function handleConfirmarCheque() {
    try {
      const formCheque = frmCheque.current.getData();
      const formData = frmCadastro.current.getData();
      if (formCheque.bci_sit_cheque) {
        setLoading(true);
        const itens = [];

        dataGridCheque.forEach((c) => {
          const cheque = {
            bci_bc_emp_id: null,
            bci_bc_id: formData.bc_id,
            bci_cheque_id: c.chq_id,
            bci_sit_cheque: parseInt(formCheque.bci_sit_cheque, 10),
            bci_conta: formCheque.bci_conta || null,
            bci_repassado: formCheque.bci_repassado,
          };
          itens.push(cheque);
        });

        const retorno = await api.put(
          'v1/fina/cheque/bordero_cheque_itens',
          itens
        );
        if (retorno.data.success) {
          toast.success('OS CHEQUES FORAM ATUALIZADOS...', toastOptions);
          setGridCheque(retorno.data.retorno);
        } else {
          toast.error(retorno.data.message, toastOptions);
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

  async function handleBaixarCheque() {
    try {
      if (dataGridCheque.length > 0) {
        const formData = frmCadastro.current.getData();
        const itens = [];

        dataGridCheque.forEach((c) => {
          const cheque = {
            bci_bc_emp_id: null,
            bci_bc_id: formData.bc_id,
            bci_cheque_id: c.chq_id,
            bci_situacao: '2',
            bci_databaixa: new Date(), // moment(new Date()).format('YYYY-MM-DD'),
          };
          itens.push(cheque);
        });

        const retorno = await api.put(
          'v1/fina/cheque/bordero_cheque_itens',
          itens
        );

        if (retorno.data.success) {
          toast.success('OS CHEQUES FORAM BAIXADOS...', toastOptions);
          setGridCheque(retorno.data.retorno);
        } else {
          toast.error(retorno.data.message, toastOptions);
        }
      } else {
        toast.error('INFORME UM CHEQUE PARA CONTINUAR...', toastOptions);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`${error}`);
    }
  }

  async function handleImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        const url = `v1/fina/report/bordero_cheque?bc_id=${dataGridPesqSelected[0].bc_id}`;

        const response = await api.get(url);
        const link = response.data;
        setLoading(false);

        if (link.toString() === '0')
          toast.info(
            'NÃO HÁ INFORMAÇÕES PARA GERAR O RELATÓRIO!!!',
            toastOptions
          );
        else window.open(link, '_blank');
      } else {
        toast.error(`SELECIONE UM BORDERÔ PARA IMPRIMIR`, toastOptions);
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao gerar relatório: ${err}`, toastOptions);
    }
  }

  useEffect(() => {
    listarBordero();
    comboGeral(25);
    handleGrupoRec();
    handleComboContas();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'bc_id',
      headerName: 'CÓDIGO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'bc_descricao',
      headerName: 'DESCRIÇÃO',
      width: 320,
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
      width: 200,
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
      field: 'grupo_receita',
      headerName: 'GRUPO DE RECEITA',
      width: 250,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
  ];

  // #endregion

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnPedido = [
    {
      field: 'cp_id',
      headerName: 'PEDIDO',
      width: 90,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 230,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cp_data_emis',
      headerName: 'EMISSÃO',
      width: 100,
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
      headerName: 'CHEQUE',
      width: 90,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'chq_valor',
      headerName: 'VALOR',
      width: 105,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'chq_emitente',
      headerName: 'EMITENTE',
      width: 240,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#20467A', fontWeight: 'bold' },
    },
    {
      field: 'ct_descricao',
      headerName: 'CONTA BANCÁRIA',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'bci_repassado',
      headerName: 'REPASSADO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#36373B', fontWeight: 'bold' },
    },
    {
      field: 'bci_situacao',
      headerName: 'BORDERÔ',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'sacado',
      headerName: 'SACADO/RECEBEDOR',
      width: 240,
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
          <button type="button" onClick={listarBordero}>
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
        <BootstrapTooltip title="IMPRESSÃO DO BORDERÔ" placement="left">
          <button type="button" onClick={handleImpressao}>
            <FaPrint size={25} color="#fff" />
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
                      rowClassRules={{
                        'warn-baixado': function (p) {
                          const baixado = p.data.situacao;
                          return baixado === 'BAIXADO';
                        },
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
                <BoxItemCad fr="1fr 3fr 1fr 1fr 1fr">
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
                  <AreaComp wd="100">
                    <label>data baixa</label>
                    <Input
                      type="text"
                      name="bc_databaixa"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="bc_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="EM ABERTO"
                      readOnly
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="2fr 3fr 1fr 1fr">
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
                    <label>valor do borderô</label>
                    <Input
                      type="text"
                      name="bc_valor_pedido"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>total cheque</label>
                    <Input
                      type="text"
                      name="bc_valor_cheque"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Observações adicionais</label>
                    <TextArea type="text" name="bc_observacao" rows="3" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCad fr="2fr 3fr">
                  <AreaComp wd="100">
                    <BoxPesquisa>
                      <h1>PEDIDOS DO BORDERÔ</h1>
                      <div>
                        <BootstrapTooltip
                          title="ADICIONAR NOVO PEDIDO"
                          placement="left"
                        >
                          <button type="button" onClick={handleNovoPedido}>
                            <FaPlusCircle size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip
                          title="EXCLUIR PEDIDO DO BORDERÔ"
                          placement="left"
                        >
                          <button type="button" onClick={handleExcluirPedido}>
                            <FaTrashAlt size={20} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                      </div>
                    </BoxPesquisa>

                    <GridContainerCheque className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnPedido}
                        rowData={gridPedido}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onSelectionChanged={handleSelectGridPedido}
                      />
                    </GridContainerCheque>
                  </AreaComp>
                  <AreaComp wd="100">
                    <BoxPesquisa>
                      <h1>CHEQUES DO BORDERÔ </h1>
                      <div>
                        <BootstrapTooltip
                          title="ADICIONAR NOVO CHEQUE"
                          placement="left"
                        >
                          <button type="button" onClick={handleNovoCheque}>
                            <FaPlusCircle size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>

                        <BootstrapTooltip
                          title="LISTAR TODOS OS CHEQUES DO BORDERÔ"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleListaCheque('');
                            }}
                          >
                            <FaSearchPlus size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>

                        <BootstrapTooltip
                          title="LISTAR CHEQUES DO PEDIDO SELECIONADO"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (dataGridPedido.length > 0) {
                                handleListaCheque(dataGridPedido[0].cp_id);
                              } else {
                                toast.warning(
                                  'SELECIONE UM PEDIDO PARA CONTINUAR...',
                                  toastOptions
                                );
                              }
                            }}
                          >
                            <FaSearchMinus size={21} color="#E15031" />
                          </button>
                        </BootstrapTooltip>

                        <BootstrapTooltip
                          title="EXCLUIR CHEQUE DO BORDERÔ"
                          placement="left"
                        >
                          <button type="button" onClick={handleExcluirCheque}>
                            <FaTrashAlt size={20} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip
                          title="GERENCIAR CHEQUES"
                          placement="left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (dataGridCheque.length > 0) {
                                setDlgGerenciar(true);
                              } else {
                                toast.warning(
                                  'SELECIONE UM PEDIDO PARA CONTINUAR...',
                                  toastOptions
                                );
                              }
                            }}
                          >
                            <FaCog size={20} color="#E15031" />
                          </button>
                        </BootstrapTooltip>

                        <BootstrapTooltip
                          title="BAIXAR CHEQUE"
                          placement="left"
                        >
                          <button type="button" onClick={handleBaixarCheque}>
                            <FaCheckDouble size={20} color="#E15031" />
                          </button>
                        </BootstrapTooltip>
                      </div>
                    </BoxPesquisa>
                    <GridContainerCheque className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnCheque}
                        rowData={gridCheque}
                        rowSelection="multiple"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onSelectionChanged={handleSelectGridCheque}
                        rowClassRules={{
                          'warn-baixado': function (p) {
                            const baixado = p.data.bci_situacao;
                            return baixado === 'BAIXADO';
                          },
                        }}
                      />
                    </GridContainerCheque>
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup CARREGAR PEDIDOS... */}
      <Popup
        isOpen={dlgPedido}
        closeDialogFn={() => setDlgPedido(false)}
        title="CONSULTAR PEDIDOS"
        size="xl"
      >
        <CONULTA_PEDIDO
          getPedido={getPedido}
          borderoCheque
          cli_id={
            dataGridPesqSelected.length > 0
              ? dataGridPesqSelected[0].bc_vendedor_id
              : vendedor.value
          }
        />
      </Popup>

      {/* popup CARREGAR CHEQUE... */}
      <Popup
        isOpen={dlgCheque}
        closeDialogFn={() => setDlgCheque(false)}
        title="CONSULTAR CHEQUES"
        size="xl"
      >
        <CONSULTA_CHEQUE
          getCheque={getCheque}
          cli_id={
            dataGridPesqSelected.length > 0
              ? dataGridPesqSelected[0].bc_vendedor_id
              : vendedor.value
          }
          bordero_id="0"
        />
      </Popup>

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
                  name="bci_sit_cheque"
                  optionsList={optSituacaoCheque}
                  isClearable
                  placeholder="INFORME A SITUAÇÃO"
                  zindex="153"
                />
              </AreaComp>
              <AreaComp wd="100">
                <FormSelect
                  label="direcionar para conta bancária"
                  name="bci_conta"
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
                  name="bci_repassado"
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
        title="BORDERÔ DE CHEQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
