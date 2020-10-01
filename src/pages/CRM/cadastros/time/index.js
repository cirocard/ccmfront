import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { MdClose, MdAdd, MdEdit, MdSave } from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import * as Yup from 'yup';
import Input from '~/componentes/Input';
import FormSelect from '~/componentes/Select';
import { Container, Content, ToolBar } from './styles';
import { GridDateFormatter, maskFone } from '~/services/func.uteis';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  TitleBar,
  AreaComp,
  CCheck,
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
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';

export default function Crm2() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [optUsuario, setOptUsuario] = useState([]);
  const frmCadastro = useRef(null);
  const schemaCad = Yup.object().shape({
    nome: Yup.string().required('campo obrigatório'),
    email: Yup.string().email().required('campo obrigatório'),
    fone: Yup.string().required('campo obrigatório'),
    situacao: Yup.string().required('??'),
  });

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  async function handleEdit(id) {
    try {
      const response = await api.get(`v1/crm/consulta/equipe/${id}`);
      const dados = response.data.retorno;
      frmCadastro.current.setFieldValue('nome', {
        value: dados.usr_id,
        label: dados.nome,
      });
      frmCadastro.current.setFieldValue('email', dados.email);
      frmCadastro.current.setFieldValue('fone', dados.telefone);
      frmCadastro.current.setFieldValue(
        'situacao',
        optSituacao.find((op) => op.value === dados.situacao)
      );
      document.getElementById('rbEquipe').checked = dados.perfil === '2';
      document.getElementById('rbGestor').checked = dados.perfil === '1';
      setOpenCadastro(true);
    } catch (error) {
      toast.error(`Erro ao carregar equipe \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('nome', '');
    frmCadastro.current.setFieldValue('email', '');
    frmCadastro.current.setFieldValue('fone', '');
    frmCadastro.current.setFieldValue('situacao', '');
    document.getElementById('rbEquipe').checked = true;
  };

  async function listarEqupe() {
    try {
      const response = await api.get('v1/crm/consulta/equipe');
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar equipe \n${error}`);
    }
  }

  async function handleSubmit(formData) {
    try {
      setLoading(true);

      const nomeuser = optUsuario.filter(
        ({ value }) => value === formData.nome.toString()
      );

      const equipe = {
        emp_id: '',
        usr_id: nomeuser[0].value,
        nome: nomeuser[0].label,
        email: formData.email,
        telefone: formData.fone,
        situacao: formData.situacao,
        perfil: document.getElementById('rbGestor').checked ? '1' : '2',
      };
      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      const retorno = await api.post('v1/crm/cad/equipe', equipe);
      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      await listarEqupe();
      setLoading(false);
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro salvar parametros: ${err}`, toastOptions);
      }
      frmCadastro.current.setFieldError('nome', validationErrors.nome);
      frmCadastro.current.setFieldError('email', validationErrors.email);
      frmCadastro.current.setFieldError('fone', validationErrors.fone);
      frmCadastro.current.setFieldError('situacao', validationErrors.situacao);
    }
  }

  async function handleNovo() {
    limpaForm();
    setOpenCadastro(true);
  }

  // ======= Colunas e APIs das grids ========
  const [gridPrincipalInstance, setGridPrincipalInstance] = useState({
    api: {},
    columnApi: {},
  });

  const onGridPrincipalReady = (params) => {
    /* obtem acesso às APIs da Ag-grid */
    setGridPrincipalInstance({ api: params.api, columnApi: params.columnApi });
    /* ajusta as colunas da grid para preencher todo o espaço disponível */
    params.api.sizeColumnsToFit();
  };

  /* definição das colunas da grid principal.
   * A propriedade cellRendererFramework permite passar um componente'
   * customizado para ser renderizado em uma coluna
   */
  const gridListaCadastro = [
    {
      field: 'usr_id',
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
      field: 'nome',
      headerName: 'Nome',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'email',
      headerName: 'E-mail',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'telefone',
      headerName: 'Fone',
      width: 180,
      sortable: true,
      resizable: true,
      lockVisible: true,
      valueFormatter: GridDateFormatter,
    },
    {
      field: 'perfil',
      headerName: 'Perfil',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'Situação do cadastro',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  useEffect(() => {
    async function getComboUser() {
      try {
        const response = await api.get('v1/combos/usuarios');
        const dados = response.data.retorno;
        if (dados) {
          setOptUsuario(dados);
        }
      } catch (error) {
        toast.error(`Erro ao carregar combo usuario \n${error}`);
      }
    }

    listarEqupe();
    getComboUser();
  }, []);

  return (
    <>
      <ToolBar>
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovo}>
            <MdAdd size={35} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>
      <Container id="pgTime">
        <TitleBar wd="100%">
          <h1>CRM - CADASTRO DO TIME</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <h1>Equipe Cadastrada</h1>
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <ScrollGrid>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: '75vh',
                    maxHeight: '80vh',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <AgGridReact
                    columnDefs={gridListaCadastro}
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
          maxWidth="md"
          onClose={() => setOpenCadastro(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Cadastro Time CRM</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadastro(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <Form ref={frmCadastro} onSubmit={handleSubmit}>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>Nome</label>
                  <FormSelect
                    name="nome"
                    optionsList={optUsuario}
                    placeholder="Informe"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>E-mail</label>
                  <Input
                    type="text"
                    name="email"
                    placeholder="e-mail válido"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
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
                  <label>Situação</label>
                  <FormSelect
                    name="situacao"
                    optionsList={optSituacao}
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>
              <h1>Perfil do Cadastro...</h1>
              <BoxItemCadNoQuery fr="1fr 1fr" ptop="10px">
                <AreaComp wd="100">
                  <CCheck>
                    <input type="radio" id="rbGestor" name="radio" value="1" />
                    <label htmlFor="rbGestor">Perfil Gestor</label>
                  </CCheck>
                </AreaComp>
                <AreaComp wd="100">
                  <CCheck>
                    <input
                      type="radio"
                      id="rbEquipe"
                      name="radio"
                      value="2"
                      checked
                    />
                    <label htmlFor="rbEquipe">Perfil Equipe</label>
                  </CCheck>
                </AreaComp>
              </BoxItemCadNoQuery>
              <Linha />
              <BoxItemCadNoQuery fr="1fr" ptop="10px" just="center">
                <DivLimitadorRow>
                  <DivLimitador wd="160px">
                    <button type="submit" className="btn2">
                      {loading ? 'Aguarde Processando...' : 'Salvar Cadastro'}
                      <MdSave size={20} color="#fff" />
                    </button>
                  </DivLimitador>
                </DivLimitadorRow>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Dialog>
      </Slide>
    </>
  );
}
