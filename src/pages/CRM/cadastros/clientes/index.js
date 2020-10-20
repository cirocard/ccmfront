import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaFolderPlus,
  FaPencilAlt,
  FaEdit,
  FaTrashAlt,
  FaRegAddressCard,
} from 'react-icons/fa';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import TextArea from '~/componentes/TextArea';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import {
  a11yProps,
  maskCNPJCPF,
  maskFone,
  RetirarMascara,
  maskDecimal,
  toDecimal,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { getComboUf } from '~/services/arrays';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerEnd,
} from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
} from '~/pages/general.styles';

export default function Crm9() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmEndereco = useRef(null);
  const frmObservacao = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [gridEndereco, setGridEndereco] = useState([]);
  const [optTipoCliente, setOptTipoCliente] = useState([]);
  const [optSegmento, setOptSegmento] = useState([]);
  const [optRamoAtv, setOptRamoAtv] = useState([]);
  const [optOperFat, setOptOperFat] = useState([]);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [optPais, setOptPais] = useState([]);

  const [perfil, setPerfil] = useState('0');
  const apiGeral = axios.create();

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
    { value: '3', label: 'BLOQUEADO PARA NF' },
    { value: '4', label: 'INADIMPLENTE' },
  ];

  const optContribIsento = [
    { value: 'N', label: 'NÃO' },
    { value: 'S', label: 'SIM' },
  ];

  const optCliPerfil = [
    { value: '1', label: 'CLIENTE' },
    { value: '2', label: 'REPRESENTANTE' },
    { value: '3', label: 'CLIENTE/REPRESENTANTE' },
  ];

  const optEndereco = [
    { value: '1', label: 'RESIDENCIAL' },
    { value: '2', label: 'COMERCIAL' },
    { value: '3', label: 'ENTREGA' },
    { value: '4', label: 'COBRANÇA' },
    { value: '5', label: 'OUTROS' },
  ];

  // #region COMBO ========================
  const optUf = getComboUf();

  // combo país
  async function getComboPaises() {
    try {
      const response = await api.get('v1/combos/paises');
      const dados = response.data.retorno;
      if (dados) {
        setOptPais(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo paises \n${error}`);
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 33) {
          setOptTipoCliente(dados);
        } else if (tab_id === 32) {
          setOptRamoAtv(dados);
        } else if (tab_id === 31) {
          setOptSegmento(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // cliente
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
      } else if (!isNaN(descricao)) {
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

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    cli_razao_social: Yup.string().required('(??)'),
    cli_cnpj_cpf: Yup.string().required('(??)'),
    cli_perfil: Yup.string().required('(??)'),
    cli_celular: Yup.string().required('(??)'),
    cli_email: Yup.string().email('informe um e-mail válido').optional(),
  });

  const schemaEnd = Yup.object().shape({
    clie_tipo: Yup.string().required('(??)'),
    clie_cep: Yup.string().required('(??)'),
    clie_logradouro: Yup.string().required('(??)'),
    clie_bairro: Yup.string().required('(??)'),
    clie_cidade: Yup.string().required('(??)'),
    clie_ibge: Yup.string().required('(??)'),
    clie_pais: Yup.string().required('(??)'),
    clie_estado: Yup.string().required('(??)'),
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
    if (selectedRows.length > 0) setGridEndereco(selectedRows[0].endereco);
  };

  // fazer consulta clientes
  async function listarCliente() {
    try {
      setLoading(true);

      const prm = {
        cli_perfil: perfil || null,
        cli_razao_social: document.getElementsByName('pesqRazaoSocial')[0]
          .value,
        cli_cnpj_cpf: document.getElementsByName('pesqCnpjCpf')[0].value,
      };

      const response = await api.post('v1/crm/consulta/cliente_crm/param', prm);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cliente CRM \n${error}`);
    }
  }

  async function handleCep(cep) {
    if (cep.target.value.length > 7) {
      const cepVaidar = RetirarMascara(cep.target.value, '.-');
      const response = await apiGeral.get(
        `https://viacep.com.br/ws/${cepVaidar}/json`
      );
      const dados = response.data;
      frmEndereco.current.setFieldValue('clie_logradouro', dados.logradouro);
      frmEndereco.current.setFieldValue('clie_bairro', dados.bairro);
      frmEndereco.current.setFieldValue('clie_cidade', dados.localidade);
      frmEndereco.current.setFieldValue('clie_ibge', dados.ibge);
      frmEndereco.current.setFieldValue('clie_estado', dados.uf);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('cli_id', '');
    frmCadastro.current.setFieldValue('cli_razao_social', '');
    frmCadastro.current.setFieldValue('cli_fantasia', '');
    frmCadastro.current.setFieldValue('cli_cnpj_cpf', '');
    frmCadastro.current.setFieldValue('cli_insc_estad', '');
    frmCadastro.current.setFieldValue('cli_status', '');
    frmCadastro.current.setFieldValue('cli_email', '');
    frmCadastro.current.setFieldValue('cli_celular', '');
    frmCadastro.current.setFieldValue('cli_fone_residencial', '');
    frmCadastro.current.setFieldValue('cli_observacao', '');
    frmCadastro.current.setFieldValue('cli_contribuinte_isento', '');
    frmCadastro.current.setFieldValue('cli_idestrangeiro', '');
    frmCadastro.current.setFieldValue('cli_limite_credito', '');
    frmCadastro.current.setFieldValue('cli_perfil', '');
    frmCadastro.current.setFieldValue('cli_cota', '');
    frmCadastro.current.setFieldValue('cli_credito', '');
    frmCadastro.current.setFieldValue('cli_contrato', '');
    frmCadastro.current.setFieldValue('cli_comissao', '');
    frmCadastro.current.setFieldValue('cli_segmentacao_id', '');
    frmCadastro.current.setFieldValue('cli_ramo_atv', '');
    frmCadastro.current.setFieldValue('cli_tipo_cliente', '');
    frmCadastro.current.setFieldValue('cli_oper_fat', '');
    frmCadastro.current.setFieldValue('cli_tab_preco', '');
    frmCadastro.current.setFieldValue('cli_insc_municipal', '');
    frmCadastro.current.setFieldValue('cli_insc_suframa', '');
    setGridEndereco([]);
    setDataGridPesqSelected([]);
  };

  async function handleNovoCadastro() {
    limpaForm();
    setValueTab(1);
    document.getElementsByName('cli_razao_social')[0].focus();
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        let x;
        frmCadastro.current.setFieldValue(
          'cli_id',
          dataGridPesqSelected[0].cli_id
        );
        frmCadastro.current.setFieldValue(
          'cli_razao_social',
          dataGridPesqSelected[0].cli_razao_social
        );
        frmCadastro.current.setFieldValue(
          'cli_fantasia',
          dataGridPesqSelected[0].cli_fantasia
        );
        frmCadastro.current.setFieldValue(
          'cli_cnpj_cpf',
          dataGridPesqSelected[0].cli_cnpj_cpf
        );
        frmCadastro.current.setFieldValue(
          'cli_insc_estad',
          dataGridPesqSelected[0].cli_insc_estad
        );
        frmCadastro.current.setFieldValue(
          'cli_status',
          dataGridPesqSelected[0].cli_status
        );
        frmCadastro.current.setFieldValue(
          'cli_email',
          dataGridPesqSelected[0].cli_email
        );
        frmCadastro.current.setFieldValue(
          'cli_celular',
          dataGridPesqSelected[0].cli_celular
        );
        frmCadastro.current.setFieldValue(
          'cli_fone_residencial',
          dataGridPesqSelected[0].cli_fone_residencial
        );
        frmObservacao.current.setFieldValue(
          'cli_observacao',
          dataGridPesqSelected[0].cli_observacao
        );
        frmCadastro.current.setFieldValue(
          'cli_contribuinte_isento',
          dataGridPesqSelected[0].cli_contribuinte_isento
        );
        frmCadastro.current.setFieldValue(
          'cli_idestrangeiro',
          dataGridPesqSelected[0].cli_idestrangeiro
        );
        frmCadastro.current.setFieldValue(
          'cli_limite_credito',
          dataGridPesqSelected[0].cli_limite_credito
        );

        frmCadastro.current.setFieldValue(
          'cli_perfil',
          optCliPerfil.find(
            (op) => op.value === dataGridPesqSelected[0].cli_perfil
          )
        );
        frmCadastro.current.setFieldValue(
          'cli_cota',
          dataGridPesqSelected[0].cli_cota
        );
        frmCadastro.current.setFieldValue(
          'cli_credito',
          dataGridPesqSelected[0].cli_credito
        );
        frmCadastro.current.setFieldValue(
          'cli_contrato',
          dataGridPesqSelected[0].cli_contrato
        );
        frmCadastro.current.setFieldValue(
          'cli_comissao',
          dataGridPesqSelected[0].cli_comissao
        );
        if (dataGridPesqSelected[0].cli_segmentacao_id) {
          x = optSegmento.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].cli_segmentacao_id.toString()
          );

          frmCadastro.current.setFieldValue('cli_segmentacao_id', x);
        } else frmCadastro.current.setFieldValue('cli_segmentacao_id', '');

        if (dataGridPesqSelected[0].cli_ramo_atv) {
          x = optSegmento.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].cli_ramo_atv.toString()
          );

          frmCadastro.current.setFieldValue('cli_ramo_atv', x);
        } else frmCadastro.current.setFieldValue('cli_segmentacao_id', '');

        if (dataGridPesqSelected[0].cli_tipo_cliente) {
          x = optTipoCliente.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].cli_tipo_cliente.toString()
          );

          frmCadastro.current.setFieldValue('cli_tipo_cliente', x);
        } else frmCadastro.current.setFieldValue('cli_tipo_cliente', '');

        if (dataGridPesqSelected[0].cli_oper_fat) {
          x = optOperFat.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].cli_oper_fat.toString()
          );
          frmCadastro.current.setFieldValue('cli_oper_fat', x);
        } else frmCadastro.current.setFieldValue('cli_oper_fat', '');

        if (dataGridPesqSelected[0].cli_tab_preco) {
          x = optTabPreco.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].cli_tab_preco.toString()
          );
          frmCadastro.current.setFieldValue('cli_tab_preco', x);
        } else frmCadastro.current.setFieldValue('cli_tab_preco', '');

        frmCadastro.current.setFieldValue(
          'cli_insc_municipal',
          dataGridPesqSelected[0].cli_insc_municipal
        );
        frmCadastro.current.setFieldValue(
          'cli_insc_suframa',
          dataGridPesqSelected[0].cli_insc_suframa
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
      if ([1, 3].indexOf(parseInt(valueTab, 10)) > -1) {
        const formData = frmCadastro.current.getData();
        const formDataObs = frmObservacao.current.getData();

        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const cliente = {
          cli_emp_id: null,
          cli_id: formData.cli_id ? formData.cli_id : null,
          cli_razao_social: formData.cli_razao_social.toUpperCase(),
          cli_fantasia: formData.cli_fantasia.toUpperCase(),
          cli_cnpj_cpf: formData.cli_cnpj_cpf,
          cli_insc_estad: formData.cli_insc_estad,
          cli_status: formData.cli_status,
          cli_email: formData.cli_email.toLowerCase(),
          cli_celular: formData.cli_celular || null,
          cli_fone_residencial: formData.cli_fone_residencial || null,
          cli_observacao: formDataObs.cli_observacao || null,
          cli_contribuinte_isento: formData.cli_contribuinte_isento || 'N',
          cli_idestrangeiro: formData.cli_idestrangeiro || null,
          cli_limite_credito: toDecimal(formData.cli_limite_credito),
          cli_perfil: formData.cli_perfil,
          cli_cota: toDecimal(formData.cli_cota),
          cli_credito: toDecimal(formData.cli_credito),
          cli_contrato: formData.cli_contrato || null,
          cli_comissao: toDecimal(formData.cli_comissao),
          cli_segmentacao_id: formData.cli_segmentacao_id || null,
          cli_ramo_atv: formData.cli_ramo_atv || null,
          cli_tipo_cliente: formData.cli_tipo_cliente || null,
          cli_oper_fat: formData.cli_oper_fat || null,
          cli_tab_preco: formData.cli_tab_preco || null,
          cli_insc_municipal: formData.cli_insc_municipal || null,
          cli_insc_suframa: formData.cli_insc_suframa || null,
        };

        const cadastro = { cliente };
        const retorno = await api.post('v1/crm/cad/cliente_crm', cadastro);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'cli_id',
            retorno.data.retorno[0].cli_id
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
        'cli_razao_social',
        validationErrors.cli_razao_social
      );

      frmCadastro.current.setFieldError(
        'cli_cnpj_cpf',
        validationErrors.cli_cnpj_cpf
      );
      frmCadastro.current.setFieldError(
        'cli_perfil',
        validationErrors.cli_perfil
      );
      frmCadastro.current.setFieldError(
        'cli_celular',
        validationErrors.cli_celular
      );
      frmCadastro.current.setFieldError(
        'cli_email',
        validationErrors.cli_email
      );
    }
  }

  // endereço
  async function handleSubmitEndereco() {
    try {
      const formData = frmEndereco.current.getData();
      frmEndereco.current.setErrors({});
      await schemaEnd.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);

      const dataCliente = frmCadastro.current.getData();
      const x = optPais.find(
        (op) => op.value === formData.clie_pais.toString()
      );

      const endereco = {
        clie_cli_id: dataCliente.cli_id,
        clie_id: '',
        clie_cep: formData.clie_cep,
        clie_logradouro: formData.clie_logradouro.toUpperCase(),
        clie_bairro: formData.clie_bairro.toUpperCase(),
        clie_cidade: formData.clie_cidade.toUpperCase(),
        clie_estado: formData.clie_estado,
        clie_numero: formData.clie_numero || 'SN',
        clie_complemento: formData.clie_complemento
          ? formData.clie_complemento.toUpperCase()
          : null,
        clie_pais: x.label,
        clie_pais_codigo: formData.clie_pais,
        clie_tipo: formData.clie_tipo,
        clie_ibge: formData.clie_ibge || null,
      };

      const cadastro = { endereco };

      const retorno = await api.post('v1/crm/cad/cliente_crm', cadastro);
      if (retorno.data.success) {
        setGridEndereco(retorno.data.retorno[0].endereco);
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
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
        toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
      }

      frmEndereco.current.setFieldError(
        'clie_tipo',
        validationErrors.clie_tipo
      );
      frmEndereco.current.setFieldError('clie_cep', validationErrors.clie_cep);
      frmEndereco.current.setFieldError(
        'clie_logradouro',
        validationErrors.clie_logradouro
      );
      frmEndereco.current.setFieldError(
        'clie_bairro',
        validationErrors.clie_bairro
      );
      frmEndereco.current.setFieldError(
        'clie_cidade',
        validationErrors.clie_cidade
      );
      frmEndereco.current.setFieldError(
        'clie_estado',
        validationErrors.clie_estado
      );
      frmEndereco.current.setFieldError(
        'clie_numero',
        validationErrors.clie_numero
      );
      frmEndereco.current.setFieldError(
        'clie_ibge',
        validationErrors.clie_ibge
      );
      frmEndereco.current.setFieldError(
        'clie_pais',
        validationErrors.clie_pais
      );
    }
  }

  // EXCLUIR ENDEREÇO
  async function handleDelete(param) {
    try {
      setLoading(true);
      const response = await api.delete(
        `v1/crm/cad/cliente_crm/end/${param.clie_cli_id}/${param.clie_id}`
      );
      if (response.data.success) {
        setGridEndereco(response.data.retorno);
      } else {
        toast.error(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir cadastro: ${error}`);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    const cadastro = frmCadastro.current.getData();
    if (newValue === 0) {
      frmCadastro.current.setFieldValue('cli_id', '');
      await listarCliente();
      setValueTab(newValue);
    } else if (cadastro.cli_id) {
      setValueTab(newValue);
    } else {
      await handleEdit();
      setValueTab(newValue);
    }
  };

  useEffect(() => {
    listarCliente();
    getComboOperFat();
    getComboTabPreco();
    comboGeral(31);
    getComboPaises();
    comboGeral(32);
    comboGeral(33);
    setValueTab(0);
  }, []);

  // #region DEFINIÇOES DAS GRIDS  =========================

  const gridColumnPesquisa = [
    {
      field: 'cli_id',
      headerName: 'Código',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'Razão Social',
      width: 400,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_cnpj_cpf',
      headerName: 'CNPJ/CPF',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cli_celular',
      headerName: 'Fone',
      width: 130,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'cli_email',
      headerName: 'E-mail',
      width: 250,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const gridColumnEndereco = [
    {
      field: 'clie_id',
      headerName: 'AÇÕES',
      width: 80,
      lockVisible: true,
      cellRendererFramework(params) {
        return (
          <>
            <BootstrapTooltip title="Excluir Endereço" placement="top">
              <button
                className="grid-button"
                type="button"
                onClick={() => handleDelete(params.data)}
              >
                <FaTrashAlt size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },

    {
      field: 'tipoend',
      headerName: 'TIPO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'clie_cep',
      headerName: 'CEP',
      width: 100,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'clie_logradouro',
      headerName: 'LOGRADOURO',
      width: 250,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'clie_bairro',
      headerName: 'BAIRRO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'clie_cidade',
      headerName: 'CIDADE',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'clie_estado',
      headerName: 'UF',
      width: 60,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'clie_numero',
      headerName: 'Número',
      width: 80,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'clie_complemento',
      headerName: 'COMPLEMENTO',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Consultar FORNECEDOR" placement="right">
          <button type="button" onClick={listarCliente}>
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
        <BootstrapTooltip title="Salvar/Calcular Pedido" placement="left">
          <button
            type="button"
            onClick={() => {
              if (parseInt(valueTab, 10) === 2) {
                handleSubmitEndereco();
              } else {
                handleSubmit();
              }
            }}
          >
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE CLIENTES</h1>
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
                title="Consultar Clientes Cadastrados"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Tela de cadastro de clientes"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR CLIENTE"
                  {...a11yProps(1)}
                  icon={<FaFolderPlus size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Opções de cadastro de endereço"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="ENDEREÇO"
                  {...a11yProps(2)}
                  icon={<FaRegAddressCard size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Anotações gerais sobre o cliente"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="OBSERVAÇÕES"
                  {...a11yProps(3)}
                  icon={<FaPencilAlt size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCadNoQuery fr="2fr 1fr 1fr">
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={listarCliente}
                    >
                      <input
                        type="text"
                        name="pesqRazaoSocial"
                        className="input_cad"
                        placeholder="PESQUISAR POR RAZÃO SOCIAL"
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={listarCliente}
                    >
                      <input
                        type="text"
                        name="pesqCnpjCpf"
                        className="input_cad"
                        placeholder="PESQUISAR CNPJ/CPF"
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="cli_perfil"
                      optionsList={optCliPerfil}
                      onChange={(p) =>
                        p ? setPerfil(p.value) : setPerfil('0')
                      }
                      placeholder="FILTRAR PERFIL"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
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
                <h1>IDENTIFICAÇÃO DO CLIENTE</h1>
                <BoxItemCad fr="1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="cli_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Razão Social</label>
                    <Input
                      type="text"
                      name="cli_razao_social"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nome Fantasia</label>
                    <Input
                      type="text"
                      name="cli_fantasia"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Perfil Cadastro"
                      name="cli_perfil"
                      optionsList={optCliPerfil}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Situação"
                      name="cli_status"
                      optionsList={optSituacao}
                      placeholder="Informe"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CNPJ/CPF</label>
                    <Input
                      type="text"
                      name="cli_cnpj_cpf"
                      maxlength="18"
                      className="input_cad"
                      onChange={maskCNPJCPF}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Inscrição Estadual</label>
                    <Input
                      type="text"
                      name="cli_insc_estad"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Inscrição Municipal</label>
                    <Input
                      type="text"
                      name="cli_insc_municipal"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 2fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Inscrição Suframa</label>
                    <Input
                      type="text"
                      name="cli_insc_suframa"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Id Estrangeiro</label>
                    <Input
                      type="text"
                      name="cli_idestrangeiro"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>E-mail</label>
                    <Input type="text" name="cli_email" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Fone Cel</label>
                    <Input
                      type="text"
                      name="cli_celular"
                      className="input_cad"
                      onChange={maskFone}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Fone Comercial</label>
                    <Input
                      type="text"
                      name="cli_fone_residencial"
                      className="input_cad"
                      onChange={maskFone}
                    />
                  </AreaComp>
                </BoxItemCad>
                <h1>PARÂMETROS COMERCIAL/FISCAL</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Tipo de Cliente"
                      name="cli_tipo_cliente"
                      optionsList={optTipoCliente}
                      placeholder="Informe"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Segmento de Mercado"
                      name="cli_segmentacao_id"
                      optionsList={optSegmento}
                      placeholder="Informe"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Ramo de Atividade"
                      name="cli_ramo_atv"
                      optionsList={optRamoAtv}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <BootstrapTooltip
                      title="Válido somente para Estados que permitem contribuinte isento de inscrição estadual"
                      placement="top-end"
                    >
                      <FormSelect
                        label="Contribuinte Isento"
                        name="cli_contribuinte_isento"
                        optionsList={optContribIsento}
                        placeholder="Informe"
                      />
                    </BootstrapTooltip>
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Operação Fat para NFe"
                      name="cli_oper_fat"
                      optionsList={optOperFat}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Tab. Preço Padrão"
                      name="cli_tab_preco"
                      optionsList={optTabPreco}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Cota Mínima</label>
                    <BootstrapTooltip
                      title="Percentual que indica cota mínima a ser vendida no caso de venda consignada."
                      placement="top-end"
                    >
                      <Input
                        type="text"
                        name="cli_cota"
                        className="input_cad"
                        onChange={maskDecimal}
                      />
                    </BootstrapTooltip>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Limite Crédito</label>
                    <Input
                      type="text"
                      name="cli_limite_credito"
                      readOnly
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Crédito do Cliente</label>
                    <Input
                      type="text"
                      name="cli_credito"
                      readOnly
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nº Contrato</label>
                    <BootstrapTooltip
                      title="Campo Opcional - Número de contrato de clientes consignado"
                      placement="top-end"
                    >
                      <Input
                        type="text"
                        name="cli_contrato"
                        className="input_cad"
                      />
                    </BootstrapTooltip>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Comissão Consignado</label>
                    <BootstrapTooltip
                      title="Percentual de comissão para consignado. Válido para cliente com perfil REPRESENTANTE"
                      placement="top-end"
                    >
                      <Input
                        type="text"
                        name="cli_cota"
                        className="input_cad"
                        onChange={maskDecimal}
                      />
                    </BootstrapTooltip>
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA ENDEREÇO */}
          <TabPanel value={valueTab} index={2}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmEndereco" ref={frmEndereco}>
                <h1>OPÇÕES DE ENDEREÇO DO CLIENTE</h1>
                <BoxItemCad fr="1fr 1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Tipo de Endereço"
                      name="clie_tipo"
                      optionsList={optEndereco}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CEP</label>
                    <Input
                      type="text"
                      name="clie_cep"
                      onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === 'Tab') {
                          document.getElementsByName('clie_numero')[0].focus();
                        }
                      }}
                      onBlur={handleCep}
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Logradouro</label>
                    <Input
                      type="text"
                      name="clie_logradouro"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Bairro</label>
                    <Input
                      type="text"
                      name="clie_bairro"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>CIDADE</label>
                    <Input
                      type="text"
                      name="clie_cidade"
                      className="input_cad"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <FormSelect
                      label="UF"
                      name="clie_estado"
                      optionsList={optUf}
                      placeholder="Informe"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>NÚMERO</label>
                    <Input
                      type="text"
                      name="clie_numero"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>IBGE</label>
                    <Input type="text" name="clie_ibge" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="3fr 1fr">
                  <AreaComp wd="100">
                    <label>COMPLEMENTO</label>
                    <Input
                      type="text"
                      name="clie_complemento"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="PAÍS"
                      name="clie_pais"
                      optionsList={optPais}
                      placeholder="Informe"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerEnd className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnEndereco}
                      rowData={gridEndereco}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerEnd>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* OBSERVAÇÕES DO CLIENTE */}
          <TabPanel value={valueTab} index={3}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmObservacao" ref={frmObservacao}>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <label>Anotações do Cliente</label>
                    <TextArea type="text" name="cli_observacao" rows="20" />
                  </AreaComp>
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
        title="CADASTRO DE CLIENTES"
        message="Aguarde Processamento..."
      />
    </>
  );
}
