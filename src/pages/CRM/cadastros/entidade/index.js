import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdSave,
  MdDelete,
  MdAddCircleOutline,
  MdSearch,
} from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import Select from 'react-select';
import Input from '~/componentes/Input';
import FormSelect from '~/componentes/Select';
import { Container, ContentBar, Content, ToolBar, BoxPesquisa } from './styles';
import { maskFone, maskCNPJCPF, RetirarMascara } from '~/services/func.uteis';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Linha,
  CModal,
  Scroll,
  ScrollGrid,
  DivLimitador,
  DivLimitadorRow,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { getComboUf } from '~/services/arrays';
import history from '~/services/history';
import api from '~/services/api';
import DialogInfo from '~/componentes/DialogInfo';

export default function Crm4() {
  const [loading, setLoading] = useState(false);
  const [codigoCliente, setCodigoCliente] = useState('');
  const [uf, setUf] = useState([]);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [openEndereco, setOpenEndereco] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridEndereco, setGridEndereco] = useState([]);
  const [optPais, setOptPais] = useState([]);
  const frmCadastro = useRef(null);
  const frmEndereco = useRef(null);
  const apiGeral = axios.create();
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    cnpjCpf: Yup.string().required('(??)'),
    email: Yup.string().email().required('(??)'),
    fone: Yup.string().required('(??)'),
    razaoSocial: Yup.string().required('(??)'),
    perfil: Yup.string().required('(??)'),
  });

  const schemaEnd = Yup.object().shape({
    tipoEndereco: Yup.string().required('(??)'),
    cep: Yup.string().required('(??)'),
    logradouro: Yup.string().required('(??)'),
    bairro: Yup.string().required('(??)'),
    cidade: Yup.string().required('(??)'),
    ibge: Yup.string().required('(??)'),
    pais: Yup.string().required('(??)'),
  });

  const optUf = getComboUf();

  const optEndereco = [
    { value: '1', label: 'RESIDENCIAL' },
    { value: '2', label: 'COMERCIAL' },
    { value: '3', label: 'ENTREGA' },
    { value: '4', label: 'COBRANÇA' },
    { value: '5', label: 'OUTROS' },
  ];

  const optPerfil = [
    { value: '1', label: 'CLIENTE' },
    { value: '2', label: 'REPRESENTANTE' },
    { value: '3', label: 'CLIENTE/REPRESENTANTE' },
    { value: '4', label: 'PROSPECÇÃO' },
  ];

  async function listarEntidade(perfil) {
    try {
      setLoading(true);
      let prm;
      if (perfil) {
        prm = {
          cli_perfil: perfil,
        };
      } else {
        prm = {};
      }
      const response = await api.post('v1/crm/consulta/cliente_crm/param', prm);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
        setGridEndereco(dados[0].endereco);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cliente CRM \n${error}`);
    }
  }

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  async function handleCep(cep) {
    if (cep.target.value.length > 7) {
      const cepVaidar = RetirarMascara(cep.target.value, '.-');
      const response = await apiGeral.get(
        `https://viacep.com.br/ws/${cepVaidar}/json`
      );
      const dados = response.data;
      frmEndereco.current.setFieldValue('logradouro', dados.logradouro);
      frmEndereco.current.setFieldValue('bairro', dados.bairro);
      frmEndereco.current.setFieldValue('cidade', dados.localidade);
      frmEndereco.current.setFieldValue('ibge', dados.ibge);
      setUf(optUf.find((op) => op.value === dados.uf));
    }
  }

  const limpaFormCadastro = () => {
    setCodigoCliente('');
    frmCadastro.current.setFieldValue('cnpjCpf', '');
    frmCadastro.current.setFieldValue('razaoSocial', '');
    frmCadastro.current.setFieldValue('fone', '');
    frmCadastro.current.setFieldValue('email', '');
    frmCadastro.current.setFieldValue('observacao', '');
    frmCadastro.current.setFieldValue('perfil', '');
  };

  const limpaFormEndereco = () => {
    frmEndereco.current.setFieldValue('tipoEndereco', '');
    frmEndereco.current.setFieldValue('cep', '');
    frmEndereco.current.setFieldValue('logradouro', '');
    frmEndereco.current.setFieldValue('bairro', '');
    frmEndereco.current.setFieldValue('cidade', '');
    setUf([]);
    frmEndereco.current.setFieldValue('pais', '');
    frmEndereco.current.setFieldValue('numero', '');
    frmEndereco.current.setFieldValue('complemento', '');
    frmEndereco.current.setFieldValue('ibge', '');
  };

  async function handleNovo() {
    limpaFormCadastro();
    setGridEndereco([]);
    setOpenCadastro(true);
  }

  async function handleNovoEndereco() {
    if (!frmCadastro.current.getFieldValue('codigo')) {
      toast.error(
        `Atenção!! Salve o cadastro antes de informar endereço`,
        toastOptions
      );
    } else {
      limpaFormEndereco();
      setOpenEndereco(true);
    }
  }

  async function handleEdit(id) {
    try {
      setLoading(true);
      const param = {
        cli_id: id,
      };
      const response = await api.post(
        `v1/crm/consulta/cliente_crm/param`,
        param
      );
      const dados = response.data.retorno[0];
      setCodigoCliente(dados.cli_id);
      frmCadastro.current.setFieldValue('cnpjCpf', dados.cli_cnpj_cpf);
      frmCadastro.current.setFieldValue('razaoSocial', dados.cli_razao_social);
      frmCadastro.current.setFieldValue('fone', dados.cli_celular);
      frmCadastro.current.setFieldValue('email', dados.cli_email);
      frmCadastro.current.setFieldValue('observacao', dados.cli_observacao);

      const x = optPerfil.find(
        (op) => op.value.toString() === dados.cli_perfil.toString()
      );
      if (x) {
        frmCadastro.current.setFieldValue('perfil', {
          value: x.value,
          label: x.label,
        });
      }

      setGridEndereco(dados.endereco);
      setOpenCadastro(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar equipe \n${error}`);
    }
  }

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

  async function handleSubmit(formData) {
    try {
      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);

      const cliente = {
        cli_emp_id: null,
        cli_id: formData.codigo || null,
        cli_razao_social: formData.razaoSocial.toUpperCase(),
        cli_fantasia: formData.razaoSocial.toUpperCase(),
        cli_cnpj_cpf: formData.cnpjCpf,
        cli_insc_estad: '',
        cli_status: '1',
        cli_email: formData.email,
        cli_celular: formData.fone,
        cli_fone_residencial: formData.fone,
        cli_observacao: formData.observacao.toUpperCase(),
        cli_datacad: new Date(),
        cli_contribuinte_isento: 'N',
        cli_idestrangeiro: '',
        cli_limite_credito: '0.00',
        cli_perfil: formData.perfil,
        cli_cota: '0.00',
        cli_credito: null,
        cli_contrato: null,
      };

      const cadastro = { cliente };

      const retorno = await api.post('v1/crm/cad/cliente_crm', cadastro);
      if (retorno.data.success) {
        setCodigoCliente(retorno.data.retorno[0].cli_id);
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

      frmCadastro.current.setFieldError('cnpjCpf', validationErrors.cnpjCpf);
      frmCadastro.current.setFieldError(
        'razaoSocial',
        validationErrors.razaoSocial
      );
      frmCadastro.current.setFieldError('email', validationErrors.email);
      frmCadastro.current.setFieldError('fone', validationErrors.fone);
      frmCadastro.current.setFieldError('perfil', validationErrors.perfil);
    }
  }

  // endereço
  async function handleSubmitEndereco(formData) {
    try {
      frmEndereco.current.setErrors({});
      await schemaEnd.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);

      const pais = optPais.filter(
        ({ value }) => value === formData.pais.toString()
      );
      const endereco = {
        clie_cli_id: codigoCliente,
        clie_id: '',
        clie_cep: formData.cep,
        clie_logradouro: formData.logradouro.toUpperCase(),
        clie_bairro: formData.bairro.toUpperCase(),
        clie_cidade: formData.cidade.toUpperCase(),
        clie_estado: uf.value,
        clie_numero: formData.numero,
        clie_complemento: formData.complemento.toUpperCase(),
        clie_pais: pais.label,
        clie_pais_codigo: pais.value,
        clie_tipo: formData.tipoEndereco,
        clie_ibge: formData.ibge,
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
      setOpenEndereco(false);
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
        'tipoEndereco',
        validationErrors.tipoEndereco
      );
      frmEndereco.current.setFieldError('cep', validationErrors.cep);
      frmEndereco.current.setFieldError(
        'logradouro',
        validationErrors.logradouro
      );
      frmEndereco.current.setFieldError('bairro', validationErrors.bairro);
      frmEndereco.current.setFieldError('cidade', validationErrors.cidade);
      frmEndereco.current.setFieldError('numero', validationErrors.numero);
      frmEndereco.current.setFieldError('ibge', validationErrors.ibge);
      frmEndereco.current.setFieldError('pais', validationErrors.pais);
    }
  }

  const [gridPrincipalInstance, setGridPrincipalInstance] = useState({
    api: {},
    columnApi: {},
  });

  const onGridPrincipalReady = (params) => {
    setGridPrincipalInstance({
      api: params.api,
      columnApi: params.columnApi,
    });
    params.api.sizeColumnsToFit();
  };

  const gridColumnCadastro = [
    {
      field: 'cli_id',
      headerName: 'AÇÕES',
      width: 100,
      lockVisible: true,
      cellRendererFramework(params) {
        return (
          <>
            <BootstrapTooltip
              title="Abre o cadastro para edição"
              placement="top"
            >
              <button
                className="grid-button"
                type="button"
                onClick={() => handleEdit(params.value)}
              >
                <MdEdit size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },

    {
      field: 'cli_razao_social',
      headerName: 'Razão Social',
      width: 350,
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
      width: 280,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
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
                <MdDelete size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },

    {
      field: 'tipoend',
      headerName: 'TIPO ENDEREÇO',
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
      field: 'clie_complemento',
      headerName: 'COMPLEMENTO',
      width: 280,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  useEffect(() => {
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
    listarEntidade();
    getComboPaises();
  }, []);

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovo}>
            <MdAdd size={35} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador wd="100%" hd="10px">
          <BootstrapTooltip
            title="Atualizar lista de cadastro"
            placement="right"
          >
            <button type="button" onClick={() => listarEntidade('')}>
              <MdSearch size={30} color="#fff" />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
      </ToolBar>
      <Container id="pgEntidade">
        <TitleBar wd="100%">
          <h1>CRM - CADASTRO DE ENTIDADE (CLIENTE) CRM</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <h1>RELAÇÃO DE CADASTROS</h1>
            <BoxPesquisa>
              <div style={{ width: '350px' }}>
                <Select
                  id="filtroClass"
                  onChange={(e) => listarEntidade(e ? e.value : 0)}
                  options={optPerfil}
                  isClearable
                  placeholder="TODOS OS PERFIS"
                />
              </div>
            </BoxPesquisa>
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <ScrollGrid>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: '65vh',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <AgGridReact
                    columnDefs={gridColumnCadastro}
                    rowData={gridPesquisa}
                    rowSelection="single"
                    animateRows
                    onGridReady={onGridPrincipalReady}
                    gridOptions={{ localeText: gridTraducoes }}
                  />
                </div>
              </ScrollGrid>
            </BoxItemCadNoQuery>
          </Scroll>
        </Content>
      </Container>

      {/* popup tela de cadastro */}
      <Slide direction="down" in={openCadastro}>
        <Dialog
          open={openCadastro}
          keepMounted
          fullWidth
          maxWidth="lg"
          onClose={() => setOpenCadastro(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Cadastro de Entidade (Cliente CRM)</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadastro(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <ContentBar>
              <ToolBar hg="60vh" wd="35px" mleft="-1">
                <DivLimitador wd="100%" hd="10px">
                  <BootstrapTooltip title="Novo Cadastro" placement="right">
                    <button type="button" onClick={handleNovo}>
                      <MdAdd size={30} color="#fff" />
                    </button>
                  </BootstrapTooltip>
                </DivLimitador>
                <DivLimitador wd="100%">
                  <BootstrapTooltip
                    title="Adicionar Endereço"
                    placement="right"
                  >
                    <button type="button" onClick={handleNovoEndereco}>
                      <MdAddCircleOutline size={28} color="#fff" />
                    </button>
                  </BootstrapTooltip>
                </DivLimitador>
                <DivLimitador wd="100%" hg="25px">
                  <BootstrapTooltip title="Salvar Cadastro" placement="right">
                    <button form="frmPrincipal" type="submit">
                      <MdSave size={28} color="#fff" />
                    </button>
                  </BootstrapTooltip>
                </DivLimitador>
              </ToolBar>
              <CModal wd="100%" hd="90%">
                <Form
                  id="frmPrincipal"
                  ref={frmCadastro}
                  onSubmit={handleSubmit}
                >
                  <BoxItemCad fr="1fr 1fr 2fr">
                    <AreaComp wd="100">
                      <label>Código</label>
                      <Input
                        type="text"
                        name="codigo"
                        value={codigoCliente}
                        readOnly
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>CNPJ/CPF</label>
                      <Input
                        type="text"
                        name="cnpjCpf"
                        maxlength="18"
                        onChange={maskCNPJCPF}
                        placeholder="somente números"
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>Razão Social</label>
                      <Input
                        type="text"
                        name="razaoSocial"
                        className="input_cad"
                      />
                    </AreaComp>
                  </BoxItemCad>
                  <BoxItemCad fr="2fr 1fr 1fr">
                    <AreaComp wd="100">
                      <label>E-mail</label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="e-mail válido"
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>Fone</label>
                      <Input
                        type="text"
                        name="fone"
                        maxlength="15"
                        onChange={maskFone}
                        placeholder="somente números"
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>Perfil Cadastro</label>
                      <FormSelect
                        name="perfil"
                        optionsList={optPerfil}
                        placeholder="Informe"
                      />
                    </AreaComp>
                  </BoxItemCad>
                  <BoxItemCadNoQuery fr="1fr">
                    <AreaComp wd="100">
                      <label>Observação</label>
                      <Input
                        type="text"
                        name="observacao"
                        multiline="true"
                        className="input_cad"
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <Linha />
                  <h1>RELAÇÃO DE ENDEREÇOS</h1>
                  <BoxItemCadNoQuery fr="1fr">
                    <ScrollGrid>
                      <div
                        className="ag-theme-balham"
                        style={{
                          height: '22vh',
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        <AgGridReact
                          columnDefs={gridColumnEndereco}
                          rowData={gridEndereco}
                          rowSelection="single"
                          animateRows
                          onGridReady={onGridPrincipalReady}
                          gridOptions={{ localeText: gridTraducoes }}
                        />
                      </div>
                    </ScrollGrid>
                  </BoxItemCadNoQuery>
                </Form>
              </CModal>
            </ContentBar>
          </Scroll>
        </Dialog>
      </Slide>
      {/* fim popup cadastro */}

      {/* popup tela de endereco */}
      <Slide direction="down" in={openEndereco}>
        <Dialog
          open={openEndereco}
          keepMounted
          fullWidth
          maxWidth="md"
          onClose={() => setOpenEndereco(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>ENDEREÇO DO CLIENTE</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenEndereco(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Scroll>
            <CModal wd="100%" hd="98%">
              <Form ref={frmEndereco} onSubmit={handleSubmitEndereco}>
                <BoxItemCad fr="1fr 1fr 2fr">
                  <AreaComp wd="100">
                    <label>Tipo de Endereço</label>
                    <FormSelect
                      name="tipoEndereco"
                      optionsList={optEndereco}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CEP</label>
                    <Input
                      type="text"
                      name="cep"
                      onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                          document.getElementsByName('complemento')[0].focus();
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
                      name="logradouro"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Bairro</label>
                    <Input type="text" name="bairro" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CIDADE</label>
                    <Input type="text" name="cidade" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>COD. IBGE</label>
                    <Input type="text" name="ibge" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>UF</label>
                    <FormSelect
                      name="uf"
                      optionsList={optUf}
                      value={uf}
                      onChange={(u) => setUf([u])}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PAÍS</label>
                    <FormSelect
                      name="pais"
                      optionsList={optPais}
                      placeholder="Informe"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>NÚMERO</label>
                    <Input type="text" name="numero" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <label>COMPLEMENTO</label>
                    <Input
                      type="text"
                      name="complemento"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>

                <BoxItemCadNoQuery fr="1fr" ptop="50px" just="center">
                  <DivLimitadorRow>
                    <DivLimitador wd="160px">
                      <button type="submit" className="btn2">
                        Salvar Endereço
                        <MdSave size={20} color="#fff" />
                      </button>
                    </DivLimitador>
                  </DivLimitadorRow>
                </BoxItemCadNoQuery>
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>
      {/* fim popup cadastro */}

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO ENTIDADE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
