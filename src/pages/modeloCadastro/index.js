import React, { useEffect, useState, useRef } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import Select from 'react-select';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { MdClose, MdAdd, MdEdit, MdSave } from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import Input from '~/componentes/Input';
import FormSelect from '~/componentes/Select';
import { Container, Content, ToolBar } from './styles';
import { maskFone } from '~/services/func.uteis';
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
import api from '~/services/api';

export default function Crm4() {
  const [loading, setLoading] = useState(false);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [prmConsuta, setPrmConsulta] = useState({});
  const frmCadastro = useRef(null);
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  async function handleNovo() {
    // limpaForm();
    setOpenCadastro(true);
  }

  async function handleEdit(id) {
    try {
      console.log(id);
    } catch (error) {
      toast.error(`Erro ao carregar cadastro \n${error}`);
    }
  }

  async function handleSubmit(formData) {
    try {
      setLoading(true);
    } catch (err) {}
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

  const gridListaCadastro = [
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

  async function listarEntidade() {
    try {
      const response = await api.post(
        'v1/crm/consulta/cliente_crm/param',
        prmConsuta
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar equipe \n${error}`);
    }
  }

  useEffect(() => {
    listarEntidade();
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
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <ScrollGrid>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: '70vh',
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
            <h1>Cadastro de Entidade (Cliente CRM)</h1>
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
      {/* fim popup cadastro */}
    </>
  );
}
