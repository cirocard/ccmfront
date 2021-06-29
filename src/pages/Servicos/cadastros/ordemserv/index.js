import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
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
  FaFileSignature,
  FaTools,
  FaUserTie,
  FaCheckCircle,
  FaTrashAlt,
  FaPrint,
  FaHammer,
  FaBan,
} from 'react-icons/fa';
import moment from 'moment';
import { format } from 'date-fns';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import TextEditor from '~/componentes/Editor';
import {
  a11yProps,
  // maskDecimal,
  GridCurrencyFormatter,
  toDecimal,
  FormataMoeda,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerItens,
  EditorContainer,
  EditorFechamento,
  DivGeral,
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

export default function SERV3() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridServico, setGridServico] = useState([]);
  const [PesqCliente, setPesqCliente] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [dataIni, setDataIni] = useState();
  const [dataFin, setDataFin] = useState();
  const [dataEmiss, setDataEmiss] = useState(new Date());
  const [dataBaixa, setDataBaixa] = useState(new Date());
  const [optUsers, setOptUsers] = useState([]); // usuarios de uma empresa
  const [solicitacaoCliente, setSolicitacaoCliente] = useState('');
  const [servRealizado, setServRealizado] = useState('');
  const [optClassific, setOptClassific] = useState([]); // classificacao da ordem de serviço
  const [optServicos, setOptServicos] = useState([]);
  const [remumoItens, setResumoItens] = useState('');
  const [totalServ, setTotalServ] = useState(0);
  const [totalDesc, setTotalDesc] = useState(0);
  const [optGrupoRec, setOptGrupoRec] = useState([]);
  const [optCvto, setOptCvto] = useState([]);
  const [optFpgto, setOptFpgto] = useState([]);
  const { emp_financeiro } = useSelector((state) => state.auth);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipo = [
    { value: 'O', label: 'ORÇAMENTO' },
    { value: 'S', label: 'ORDEM DE SERVIÇO' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE EMISSAO' },
    { value: '2', label: 'DATA BAIXA' },
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

  async function getComboUsers(emp_id) {
    try {
      const response = await api.get(`v1/combos/user_empresa/${emp_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUsers(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo usuarios \n${error}`);
    }
  }

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 34) {
          setOptClassific(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function getComboServicos() {
    try {
      const response = await api.get(`v1/combos/servicos`);
      const dados = response.data.retorno;
      if (dados) {
        setOptServicos(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo serviços \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    os_tecnico_id: Yup.string().required('(??)'),
    os_cli_id: Yup.string().required('(??)'),
    os_classificacao: Yup.string().required('(??)'),
    os_tipo: Yup.string().required('(??)'),
  });

  const schemaClose = Yup.object().shape({
    os_fpgto_id: Yup.string().required('(??)'),
    os_condvcto_id: Yup.string().required('(??)'),
    os_grprec_id: Yup.string().required('(??)'),
  });
  // #endregion

  function handleDashboard() {
    window.history.forward('/serv1');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    setTotalServ(0);
    setTotalDesc(0);
    setGridServico([]);
    setDataGridPesqSelected([]);
    setDataBaixa(new Date());
    setDataEmiss(new Date());
    setResumoItens(`Valor total O.S: ${FormataMoeda(0)}`);
    frmCadastro.current.setFieldValue('os_id', '');
    frmCadastro.current.setFieldValue('os_tecnico_id', '');
    frmCadastro.current.setFieldValue('os_cli_id', '');
    frmCadastro.current.setFieldValue('os_classificacao', '');
    frmCadastro.current.setFieldValue('os_fpgto_id', '');
    frmCadastro.current.setFieldValue('os_condvcto_id', '');
    frmCadastro.current.setFieldValue('os_valor', '');
    frmCadastro.current.setFieldValue('os_tipo', '');
    frmCadastro.current.setFieldValue('os_situacao', '');
    frmCadastro.current.setFieldValue('os_grprec_id', '');
    frmCadastro.current.setFieldValue('servico_solicitado', '');
    frmCadastro.current.setFieldValue('valorOS', 'R$0,00');
    setSolicitacaoCliente('');
    setServRealizado('');
    setValueTab(1);
  };

  async function listarOS() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/serv/os?os_id=${formPesq.pesq_os_id}&cli_id=${
          formPesq.pesq_cli_id || ''
        }&tecnico_id=&tpData=${formPesq.pesq_tpData || '1'}&dataIni=${moment(
          dataIni
        ).format('YYYY-MM-DD')}&dataFin=${moment(dataFin).format('YYYY-MM-DD')}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar servicos\n${error}`);
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        const response = await api.get(
          `v1/serv/os/os_by_id?os_id=${dataGridPesqSelected[0].os_id}`
        );
        if (response.data.success) {
          const { capa, itens } = response.data.retorno;
          frmCadastro.current.setFieldValue('os_id', capa.os_id);
          setDataEmiss(Date.parse(capa.os_data_emissao.substring(0, 19)));
          setDataBaixa(Date.parse(capa.os_data_baixa.substring(0, 19)));
          setSolicitacaoCliente(capa.os_solicitacao_cli || '');
          setServRealizado(capa.os_atividade || '');
          frmCadastro.current.setFieldValue(
            'os_tipo',
            optTipo.find((op) => op.value.toString() === capa.os_tipo)
          );
          frmCadastro.current.setFieldValue(
            'os_classificacao',
            optClassific.find(
              (op) => op.value.toString() === capa.os_classificacao.toString()
            )
          );
          frmCadastro.current.setFieldValue(
            'os_tecnico_id',
            optUsers.find(
              (op) => op.value.toString() === capa.os_tecnico_id.toString()
            )
          );

          if (capa.os_grprec_id) {
            frmCadastro.current.setFieldValue(
              'os_grprec_id',
              optGrupoRec.find(
                (op) => op.value.toString() === capa.os_grprec_id.toString()
              )
            );
          }

          if (capa.os_fpgto_id) {
            frmCadastro.current.setFieldValue(
              'os_fpgto_id',
              optFpgto.find(
                (op) => op.value.toString() === capa.os_fpgto_id.toString()
              )
            );
          }
          if (capa.os_condvcto_id) {
            frmCadastro.current.setFieldValue(
              'os_condvcto_id',
              optCvto.find(
                (op) => op.value.toString() === capa.os_condvcto_id.toString()
              )
            );
          }
          await loadOptionsCliente(capa.os_cli_id, setCliente);

          frmCadastro.current.setFieldValue('os_cli_id', {
            value: capa.os_cli_id,
            label: capa.cli_razao_social,
          });
          frmCadastro.current.setFieldValue(
            'valorOS',
            FormataMoeda(capa.os_valor)
          );
          setTotalServ(toDecimal(capa.os_valor));
          setTotalDesc(toDecimal(capa.os_vlr_desc));
          setResumoItens(`Valor total O.S: ${FormataMoeda(capa.os_valor)}`);
          setGridServico(itens);
        }

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

        setLoading(true);
        const itens = [];
        let index = 0;
        gridServico.forEach((g) => {
          if (g.persistido) index = parseInt(g.osi_id, 10);
          const it = {
            osi_os_emp_id: null,
            osi_os_id: null,
            osi_id: (index += 1),
            osi_serv_id: g.osi_serv_id,
            osi_valor_bruto: toDecimal(g.osi_valor_bruto),
            osi_quantidade: toDecimal(g.osi_quantidade),
            osi_perc_desc: toDecimal(g.osi_perc_desc),
            osi_valor_liquido:
              toDecimal(g.osi_valor_bruto) *
              toDecimal(g.osi_quantidade) *
              (1 - toDecimal(g.osi_perc_desc) / 100),
          };
          itens.push(it);
        });

        const objCad = {
          os_emp_id: null,
          os_id: formData.os_id ? parseInt(formData.os_id, 10) : null,
          os_tecnico_id: formData.os_tecnico_id,
          os_cli_id: formData.os_cli_id,
          os_data_emissao: format(dataEmiss, 'yyyy-MM-dd HH:mm:ss'),
          os_data_baixa: format(dataBaixa, 'yyyy-MM-dd HH:mm:ss'),
          os_classificacao: formData.os_classificacao,
          os_solicitacao_cli: solicitacaoCliente,
          os_atividade: servRealizado,
          os_fpgto_id: formData.os_fpgto_id || null,
          os_condvcto_id: formData.os_condvcto_id || null,
          os_grprec_id: formData.os_grprec_id || null,
          os_valor: toDecimal(totalServ.toFixed(2)),
          os_vlr_desc: toDecimal(totalDesc),
          os_vinculada_id: null,
          os_tipo: formData.os_tipo,
          os_situacao: '1',
          itens,
        };

        const retorno = await api.post('v1/serv/os', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue('os_id', retorno.data.retorno);
          toast.info('Cadastro concluído com sucesso!!!', toastOptions);
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
        'os_tecnico_id',
        validationErrors.os_tecnico_id
      );
      frmCadastro.current.setFieldError(
        'os_cli_id',
        validationErrors.os_cli_id
      );
      frmCadastro.current.setFieldError(
        'os_classificacao',
        validationErrors.os_classificacao
      );
      frmCadastro.current.setFieldError('os_tipo', validationErrors.os_tipo);
    }
  }

  async function handleImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        const url = `v1/servico/report/os?os_id=${dataGridPesqSelected[0].os_id}`;

        const response = await api.get(url);
        const link = response.data;
        setLoading(false);
        window.open(link, '_blank');
      } else {
        toast.info('Selecione uma O.S para imprimir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir O.S \n${error}`, toastOptions);
    }
  }

  async function handleFecharOS() {
    try {
      const formData = frmCadastro.current.getData();
      frmCadastro.current.setErrors({});
      await schemaClose.validate(formData, {
        abortEarly: false,
      });
      setLoading(true);
      const objCad = {
        os_emp_id: null,
        os_id: formData.os_id ? parseInt(formData.os_id, 10) : null,
        os_cli_id: formData.os_cli_id,
        os_data_emissao: format(dataEmiss, 'yyyy-MM-dd HH:mm:ss'),
        os_data_baixa: format(dataBaixa, 'yyyy-MM-dd HH:mm:ss'),
        os_classificacao: formData.os_classificacao,
        os_solicitacao_cli: solicitacaoCliente,
        os_atividade: servRealizado,
        os_fpgto_id: formData.os_fpgto_id || null,
        os_condvcto_id: formData.os_condvcto_id || null,
        os_grprec_id: formData.os_grprec_id || null,
        os_valor: toDecimal(totalServ.toFixed(2)),
        os_vlr_desc: toDecimal(totalDesc),
        os_tipo: formData.os_tipo,
        os_situacao: '3',
      };

      const retorno = await api.put(
        `v1/serv/os?gera_fina=${emp_financeiro}`,
        objCad
      );
      if (retorno.data.success) {
        await listarOS();
        toast.success('O.S concluída com Sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.errors}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro Fechar O.S: ${err}`, toastOptions);
      }
      frmCadastro.current.setFieldError(
        'os_fpgto_id',
        validationErrors.os_fpgto_id
      );
      frmCadastro.current.setFieldError(
        'os_condvcto_id',
        validationErrors.os_condvcto_id
      );
      frmCadastro.current.setFieldError(
        'os_grprec_id',
        validationErrors.os_grprec_id
      );
    }
  }

  async function handleCancelar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        const objCad = {
          os_emp_id: null,
          os_id: dataGridPesqSelected[0].os_id,
          os_situacao: '2',
        };

        const retorno = await api.put('v1/serv/os/cancelar', objCad);
        if (retorno.data.success) {
          await listarOS();
          toast.success('O.S cancelada com Sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.errors}`,
            toastOptions
          );
        }
        setLoading(false);
      } else {
        toast.error('Selecione a O.S que deseja cancelar', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir O.S \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    let cadastro = frmCadastro.current.getData();
    if (newValue === 0) {
      frmCadastro.current.setFieldValue('os_id', '');
      setDataGridPesqSelected([]);
      setGridPesquisa([]);
      setValueTab(newValue);
      await listarOS();
    } else if (newValue === 1) {
      if (dataGridPesqSelected.length > 0) {
        cadastro = frmCadastro.current.getData();
        if (cadastro.os_id) {
          setValueTab(newValue);
        } else {
          await handleEdit();
          setValueTab(newValue);
        }
      } else {
        setValueTab(0);
      }
    } else if (newValue === 2) {
      cadastro = frmCadastro.current.getData();
      if (dataGridPesqSelected.length > 0 || cadastro.os_id) {
        if (cadastro.os_id) {
          setValueTab(newValue);
        } else {
          await handleEdit();
          setValueTab(newValue);
        }
      } else {
        setValueTab(0);
      }
    }
  };

  const onChangeEditorSolicit = (vlr) => {
    setSolicitacaoCliente(vlr);
  };

  const onChangeEditorRealizado = (vlr) => {
    setServRealizado(vlr);
  };

  function handleSelectServico(s) {
    if (s) {
      const found = gridServico.filter((f) => s.serv_codigo === f.serv_codigo);
      if (found.length > 0) {
        toast.error(
          'ESTE SERVIÇO JÁ FOI LANÇADO... SE NECESSÁRIO ALTERE A QUANTIDADE',
          toastOptions
        );
        return;
      }
      const grid = [];
      const obj = {
        osi_os_emp_id: null,
        osi_os_id: frmCadastro.current.getData().os_id || null,
        osi_id: null,
        osi_serv_id: s.serv_id,
        serv_titulo: s.serv_titulo,
        serv_codigo: s.serv_codigo,
        osi_valor_bruto: s.serv_valor,
        osi_quantidade: 1,
        osi_perc_desc: 0,
        osi_valor_liquido: s.serv_valor,
        persistido: false,
      };

      gridServico.forEach((g) => {
        grid.push(g);
      });
      grid.push(obj);
      setGridServico(grid);

      let valor = totalServ;
      valor += toDecimal(s.serv_valor);
      setTotalServ(valor);

      setResumoItens(`Valor total O.S: ${FormataMoeda(valor)}`);
    }
  }

  const gridValidationsQtd = (newValue) => {
    if (!newValue) {
      toast.info('Informe uma quantidade válida', toastOptions);
      return false;
    }
    return true;
  };

  const handleEditarQuantidade = async () => {
    try {
      let vliq = 0;
      let valor = 0; // valor do pedido atualizado
      let vlrDesc = 0; // valor do desconto

      setGridServico((gprev) => {
        gprev.forEach((g) => {
          vliq =
            toDecimal(g.osi_quantidade) *
            toDecimal(g.osi_valor_bruto) *
            (1 - toDecimal(g.osi_perc_desc) / 100);

          valor += vliq;
          g.osi_valor_liquido = vliq;
          vlrDesc +=
            toDecimal(g.osi_quantidade) *
            toDecimal(g.osi_valor_bruto) *
            (toDecimal(g.osi_perc_desc) / 100);
        });
        return gprev;
      });

      setTotalDesc((desc) => {
        desc = vlrDesc;
        return desc;
      });

      // atualizar total do serviço
      setTotalServ((ts) => {
        ts = valor;
        return ts;
      });

      // atualizar mensagem resumo
      setResumoItens((res) => {
        res = `Valor total O.S: ${FormataMoeda(valor)}`;
        return res;
      });
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao alterar quantidade: ${err}`, toastOptions);
    }
  };

  async function handleDeleteItem(param) {
    try {
      setGridServico((prev) => prev.filter((f) => f !== param));

      setTotalServ((prev) => {
        let valor = prev;

        valor -= toDecimal(param.osi_valor_liquido);
        setResumoItens((res) => {
          res = `Valor total O.S: ${FormataMoeda(valor)}`;
          return res;
        });

        return valor;
      });

      // desconto
      setTotalDesc((desc) => {
        let vdesc = desc;
        vdesc -=
          toDecimal(param.osi_valor_bruto) *
          toDecimal(param.osi_quantidade) *
          (toDecimal(param.osi_perc_desc) / 100);
        return vdesc;
      });
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir serviço: ${error}`);
    }
  }

  useEffect(() => {
    frmPesquisa.current.setFieldValue('pesq_tpData', optDATA[0]);
    getComboUsers(0);
    comboGeral(34);
    getComboServicos();
    getComboCondVcto();
    handleGrupoRec();
    getComboFpgto();
    listarOS();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'os_id',
      headerName: 'Nº O.S',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'emissao',
      headerName: 'DATA EMISSÃO',
      width: 160,
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
      field: 'tecnico',
      headerName: 'TECNICO/ATENDENTE',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'os_tipo',
      headerName: 'TIPO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'os_situacao',
      headerName: 'SITUAÇÃO',
      width: 180,
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

  // #region GRID SERVIÇOS  =========================

  const gridColumnServico = [
    {
      field: 'osi_serv_id',
      headerName: 'DEL',
      width: 55,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="Excluir Serviço" placement="top">
              <button type="button" onClick={() => handleDeleteItem(prm.data)}>
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'serv_codigo',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_titulo',
      headerName: 'IDENTIFICAÇÃO SERVIÇO',
      width: 270,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'osi_quantidade',
      headerName: 'QTDE',
      width: 65,
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
      field: 'osi_valor_bruto',
      headerName: 'VLR UNIT',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'osi_perc_desc',
      headerName: '% Desc',
      width: 75,
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
      field: 'osi_valor_liquido',
      headerName: 'VLR TOTAL',
      width: 100,
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
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={() => limpaForm()}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={() => handleSubmit()}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Imprimir O.S" placement="left">
          <button type="button" onClick={handleImpressao}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Cancelar O.S" placement="left">
          <button type="button" onClick={handleCancelar}>
            <FaBan size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ABRIR CADASTRO SERVIÇOS" placement="left">
          <button type="button" onClick={() => window.open('/serv2', '_blank')}>
            <FaHammer size={25} color="#fff" />
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
            <h1>CERENCIAMENTO DE ORDENS DE SERVIÇO</h1>
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
                title="Consultar O.S cadastrada"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR O.S"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR/EDITAR O.S"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR/EDITAR"
                  {...a11yProps(1)}
                  icon={<FaFileSignature size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip title="FECHAMENTO O.S" placement="top-end">
                <Tab
                  disabled={false}
                  label="FECHAR O.S"
                  {...a11yProps(2)}
                  icon={<FaTools size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>CONSULTAR O.S CADASTRADOS</h1>
                <BoxItemCad fr="1fr 3fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Nº O.S</label>
                    <Input
                      type="text"
                      name="pesq_os_id"
                      placeholder="Nº O.S"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_os_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={PesqCliente}
                      onChange={(c) => setPesqCliente(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="filtrar por"
                      name="pesq_tpData"
                      optionsList={optDATA}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
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
                      rowClassRules={{
                        'warn-finalizado': function (p) {
                          const finalizado = p.data.os_situacao;
                          return finalizado === 'O.S FINALIZADA';
                        },
                        'warn-cancelado': function (p) {
                          const cancelado = p.data.os_situacao;
                          return cancelado === 'O.S CANCELADA';
                        },
                      }}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          <Form id="frmCadastro" ref={frmCadastro}>
            {/* ABA CADASTRO */}
            <TabPanel value={valueTab} index={1}>
              <Panel lefth1="left" bckgnd="#dae2e5">
                <h1>CADASTRO DE O.S</h1>
                <BoxItemCad fr="1fr 1fr 1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>Nº O.S</label>
                    <Input
                      type="number"
                      name="os_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataEmiss(new Date(date))}
                      value={dataEmiss}
                      label="Data Emissão"
                      dateAndTime
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataBaixa(new Date(date))}
                      value={dataBaixa}
                      label="Previsão Baixa"
                      dateAndTime
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo cadastro"
                      name="os_tipo"
                      optionsList={optTipo}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Classificação"
                      name="os_classificacao"
                      optionsList={optClassific}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="os_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={cliente}
                      onChange={(c) => setCliente(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="técnico/atendente"
                      name="os_tecnico_id"
                      optionsList={optUsers}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                      clearable={false}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="2fr 3fr">
                  <AreaComp wd="100" lblWeight="700">
                    <EditorContainer>
                      <label>SOLICITAÇÃO DO CLIENTE</label>
                      <TextEditor
                        onChangeFn={onChangeEditorSolicit}
                        value={solicitacaoCliente}
                      />
                    </EditorContainer>
                  </AreaComp>
                  <AreaComp wd="100" ptop="6px" lblWeight="700">
                    <FormSelect
                      label="servicos solicitados"
                      name="servico_solicitado"
                      optionsList={optServicos}
                      placeholder="NÃO INFORMADO"
                      onChange={(s) => {
                        if (s) handleSelectServico(s);
                      }}
                      zindex="151"
                    />
                    <GridContainerItens className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnServico}
                        rowData={gridServico}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                      />
                    </GridContainerItens>
                  </AreaComp>
                </BoxItemCad>
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
              </Panel>
            </TabPanel>

            {/* ABA FECHAMENTO */}
            <TabPanel value={valueTab} index={2}>
              <Panel lefth1="left" bckgnd="#dae2e5">
                <h1>FECHAMENTO DA O.S</h1>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100" lblWeight="700">
                    <EditorFechamento>
                      <label>
                        INFORMAÇÕES ADICIONAIS / PARECER TÉCNICO DA LOJA
                      </label>
                      <TextEditor
                        onChangeFn={onChangeEditorRealizado}
                        value={servRealizado}
                      />
                    </EditorFechamento>
                  </AreaComp>
                </BoxItemCadNoQuery>
                <h1>FECHAMENTO FINANCEIRO DA O.S</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100" lblWeight="700">
                    <label>VALOR TOTAL DA O.S</label>
                    <Input
                      type="text"
                      name="valorOS"
                      readOnly
                      className="input_destaque"
                    />
                  </AreaComp>
                  <AreaComp wd="100" lblWeight="700">
                    <FormSelect
                      name="os_fpgto_id"
                      label="Forma de Pagamento"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="INFORME"
                      zindex="151"
                    />
                  </AreaComp>
                  <AreaComp wd="100" lblWeight="700">
                    <FormSelect
                      name="os_condvcto_id"
                      label="Condição de Vencimento"
                      optionsList={optCvto}
                      isClearable
                      placeholder="INFORME"
                      zindex="151"
                    />
                  </AreaComp>
                  <AreaComp wd="100" lblWeight="700">
                    <FormSelect
                      label="Grupo de Receita"
                      name="os_grprec_id"
                      optionsList={optGrupoRec}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr" ptop="40px" just="center">
                  <DivGeral wd="230px">
                    <button
                      type="button"
                      className="btn2"
                      onClick={handleFecharOS}
                    >
                      {loading ? 'Aguarde Processando...' : 'Fechar O.S'}
                      <FaCheckCircle size={22} color="#fff" />
                    </button>
                  </DivGeral>
                </BoxItemCadNoQuery>
              </Panel>
            </TabPanel>
          </Form>
        </Scroll>
      </Container>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO DE ORDENS DE SERVIÇO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
