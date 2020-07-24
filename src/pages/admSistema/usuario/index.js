import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdSave,
  MdDelete,
  MdSearch,
  MdLock,
} from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import * as Yup from 'yup';
import Input from '~/componentes/Input';
import FormSelect from '~/componentes/Select';
import {
  Container,
  Content,
  ToolBar,
  ListaEmpresa,
  ToolBarGrid,
} from './styles';
import { gridTraducoes } from '~/services/gridTraducoes';
import { store } from '~/store';
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
import api from '~/services/api';
import DialogInfo from '~/componentes/DialogInfo';

export default function Adm5() {
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [optGrupo, setOptGrupo] = useState([]);
  const [optEpmresa, setOptEmpresa] = useState([]);
  const [optEmpAutorizada, setOptEmpautorizada] = useState([]);
  const [listaEmpAccess, setListaEmpAccess] = useState('');
  const { usr_id, usr_tipo } = store.getState().auth;
  let optSelectedEmp = [];
  const frmCadastro = useRef(null);

  const schemaCad = Yup.object().shape({
    usr_nome: Yup.string().required('campo obrigatório'),
    usr_email: Yup.string().email().required('campo obrigatório'),
    situacao: Yup.string().required('??'),
    grupo: Yup.string().required('??'),
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

  async function comboGrupo() {
    try {
      const response = await api.get('v1/combos/grupo_user');
      const dados = response.data.retorno;
      if (dados) {
        setOptGrupo(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar grupos usuários \n${error}`);
    }
  }
  async function comboEmpresaUsuario(usuario, tipo) {
    try {
      const response = await api.get(
        `v1/combos/empresa_user/${usuario}/${tipo}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setOptEmpresa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar empresas do usuários \n${error}`);
    }
  }

  function validaEmpAutorizada(valor) {
    setOptEmpautorizada(valor);
  }

  async function handleReset(data) {
    try {
      setLoading(true);
      const usuario = {
        usr_id: data.usr_id,
        usr_password: '000',
      };

      const retorno = await api.post('v1/users/usuario', usuario);

      if (retorno.data.success) {
        toast.info('Senha resetada com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao resetar senha do usuário \n${error}`, toastOptions);
    }
  }

  async function handleEdit(data) {
    try {
      setLoading(true);
      const response = await api.get(`v1/users/users_by_id/${data.usr_id}`);
      const dados = response.data.retorno;

      // empresas que o usuario tem acesso
      const emp = await api.get(`v1/combos/empresa_user/${dados.usr_id}/2`);
      if (emp.data.retorno) {
        optSelectedEmp = emp.data.retorno;
      }
      validaEmpAutorizada(optSelectedEmp); // gerar lista de empresas autorizadas

      setListaEmpAccess(dados.usr_emp_acesso);
      frmCadastro.current.setFieldValue('usr_id', dados.usr_id);
      frmCadastro.current.setFieldValue('usr_nome', dados.usr_nome);
      frmCadastro.current.setFieldValue('usr_email', dados.usr_email);

      frmCadastro.current.setFieldValue('grupo', {
        label: data.grupo,
        value: data.grupo_id,
      });

      frmCadastro.current.setFieldValue(
        'situacao',
        optSituacao.find((op) => op.value === dados.usr_situacao)
      );
      document.getElementById('usr_restricao_venda').checked =
        dados.usr_restricao_venda === 'S';
      setLoading(false);
      setOpenCadastro(true);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar usuário \n${error}`, toastOptions);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('usr_id', '');
    frmCadastro.current.setFieldValue('usr_nome', '');
    frmCadastro.current.setFieldValue('usr_email', '');

    frmCadastro.current.setFieldValue('grupo', '');
    frmCadastro.current.setFieldValue('empresa', '');
    frmCadastro.current.setFieldValue('situacao', '');
    document.getElementById('usr_restricao_venda').checked = false;
    setOptEmpautorizada([]);
  };

  async function listarUsers() {
    try {
      setLoading(true);
      const response = await api.get('v1/users/users_by_emp_grid');
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar usuários \n${error}`);
    }
  }

  async function handleSubmit(formData) {
    try {
      if (listaEmpAccess.length < 1) {
        toast.warning(
          'INFORME UMA EMPRESA AUTORIZADA PARA CONTINUAR...',
          toastOptions
        );
        return;
      }
      setLoading(true);
      const usuario = {
        usr_id: formData.usr_id,
        usr_nome: formData.usr_nome,
        usr_email: formData.usr_email,
        usr_tipo: '2', // usuario padrao
        usr_emp_acesso: listaEmpAccess,
        usr_situacao: formData.situacao,
        usr_grp_id: '3', // temporario
        usr_restricao_venda: document.getElementById('usr_restricao_venda')
          .checked
          ? 'S'
          : 'N',
        usr_grupo_id: formData.grupo,
      };

      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      const retorno = await api.post('v1/users/usuario', usuario);

      if (retorno.data.success) {
        frmCadastro.current.setFieldValue(
          'usr_id',
          retorno.data.retorno.usr_id
        );
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      await listarUsers();
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
      frmCadastro.current.setFieldError('usr_nome', validationErrors.usr_nome);
      frmCadastro.current.setFieldError(
        'usr_email',
        validationErrors.usr_email
      );
      frmCadastro.current.setFieldError('grupo', validationErrors.grupo);
      frmCadastro.current.setFieldError('situacao', validationErrors.situacao);
    }
  }

  async function handleNovo() {
    limpaForm();
    setOpenCadastro(true);
  }

  const handleEmpresa = async (e) => {
    if (e) {
      const obj = [];
      let lista = '';
      optEmpAutorizada.forEach((a) => {
        if (a.value !== e.value) {
          // nao adicionar uma empresa ja adicionada
          obj.push(a);
        }
      });
      obj.push(e);

      obj.forEach((y) => {
        lista += `${y.value}, `;
      });
      lista = lista.trim();
      if (lista.indexOf(',') > 0) {
        lista = lista.substring(0, lista.length - 1);
      }
      setListaEmpAccess(lista);
      validaEmpAutorizada(obj);
    }
  };

  const handleDeleteEmp = async (emp) => {
    const x = [];
    let lista = '';
    optEmpAutorizada.splice(optEmpAutorizada.indexOf(emp), 1);
    optEmpAutorizada.forEach((y) => {
      lista += `${y.value}, `;
      x.push(y);
    });

    if (lista.indexOf(',') > 0) {
      lista = lista.substring(0, lista.length - 1);
    }
    setListaEmpAccess(lista);
    setOptEmpautorizada(x);
  };

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
      width: 60,
      lockVisible: true,
      cellRendererFramework(params) {
        return (
          <ToolBarGrid>
            <BootstrapTooltip
              title="Abre o cadastro para edição"
              placement="top"
            >
              <button
                className="grid-button"
                type="button"
                onClick={() => handleEdit(params.data)}
              >
                <MdEdit size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
            <BootstrapTooltip title="Resetar senha do usuário" placement="top">
              <button
                className="grid-button"
                type="button"
                onClick={() => handleReset(params.data)}
              >
                <MdLock size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
          </ToolBarGrid>
        );
      },
    },

    {
      field: 'usr_nome',
      headerName: 'Nome',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'usr_email',
      headerName: 'E-mail (login de acesso)',
      width: 240,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'Situacao',
      width: 120,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'grupo',
      headerName: 'Grupo de Usuário',
      width: 250,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  useEffect(() => {
    listarUsers();
    comboGrupo();
    comboEmpresaUsuario(usr_id, usr_tipo);
  }, []);

  return (
    <>
      <ToolBar>
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovo}>
            <MdAdd size={35} color="#fff" />
          </button>
        </BootstrapTooltip>
        <BootstrapTooltip title="Atualizar lista de cadastro" placement="right">
          <button type="button" onClick={() => listarUsers()}>
            <MdSearch size={30} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>
      <Container id="pgUser">
        <TitleBar wd="100%">
          <h1>CADASTRO DE USUÁRIOS DO SISTEMA</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <h1>Usuários Cadastrados</h1>
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <ScrollGrid>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: '69vh',
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
            <h1>Cadastro de Usuários do Sistema</h1>
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
                  <label>Código</label>
                  <Input
                    type="text"
                    name="usr_id"
                    className="input_cad"
                    readOnly
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Nome</label>
                  <Input type="text" name="usr_nome" className="input_cad" />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>E-mail</label>
                  <Input
                    type="text"
                    name="usr_email"
                    placeholder="e-mail válido"
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
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>Grupo de Acesso</label>
                  <FormSelect
                    name="grupo"
                    optionsList={optGrupo}
                    placeholder="Informe"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <CCheck>
                    <label>Restrição</label>
                    <input type="checkbox" id="usr_restricao_venda" value="S" />
                    <label htmlFor="usr_restricao_venda">
                      Exibir somente vendas do usuário
                    </label>
                  </CCheck>
                </AreaComp>
              </BoxItemCad>
              <h1>EMPRESAS AUTORIZADAS</h1>
              <BoxItemCadNoQuery fr="1fr" ptop="3px">
                <AreaComp wd="100" alself="start">
                  <FormSelect
                    name="empresa"
                    optionsList={optEpmresa}
                    placeholder="Informe"
                    onChange={handleEmpresa}
                  />
                  <ListaEmpresa>
                    {optEmpAutorizada.map((e) =>
                      e.value ? (
                        <ul>
                          <li key={e.value}>
                            {e.label}
                            <BootstrapTooltip
                              title="Excluir do grupo"
                              placement="top"
                            >
                              <button type="button">
                                <MdDelete
                                  size={20}
                                  color="#244448"
                                  onClick={() => handleDeleteEmp(e)}
                                />
                              </button>
                            </BootstrapTooltip>
                          </li>
                        </ul>
                      ) : (
                        <ListaEmpresa />
                      )
                    )}
                  </ListaEmpresa>
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

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO DE USUÁRIOS"
        message="Aguarde Processamento..."
      />
    </>
  );
}
