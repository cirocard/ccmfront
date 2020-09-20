import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import {
  MdClose,
  MdAdd,
  MdEdit,
  MdSave,
  MdDelete,
  MdSwapVert,
} from 'react-icons/md';
import { AgGridReact } from 'ag-grid-react';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import Input from '~/componentes/Input';
import { Container, Content, ToolBar } from './styles';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Linha,
  CModal,
  Scroll,
  ScrollGrid,
  DivLimitador,
  DivLimitadorRow,
  ToolBarItem,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';
// parametros crm: tipo oportunidade; motivo de perda; classificaçao de atividade
export default function Crm3() {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const tipo = query.get('tipo');
  const frmCadastro = useRef(null);
  const api = ApiService.getInstance(ApiTypes.API1);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [tabId, setTabId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tituloCadastro, setTituloCadastro] = useState('');
  const [gridPesquisa, setGridPesquisa] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    descricao: Yup.string().required('campo obrigatório'),
  });

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  function handleParametros(prm) {
    history.push(`/crm3?tipo=${prm}`);
    window.location.reload(false);
  }

  async function listarGeral(tab) {
    try {
      const response = await api.get(`v1/shared/consulta/geral/${tab}`);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar equipe \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('codigo', '');
    frmCadastro.current.setFieldValue('descricao', '');
  };

  async function handleNovo() {
    limpaForm();
    setOpenCadastro(true);
  }

  async function handleSubmit(formData) {
    try {
      setLoading(true);
      const geral = {
        ger_tab_id: tabId,
        ger_emp_id: '',
        ger_id: formData.codigo,
        ger_descricao: formData.descricao.toUpperCase(),
      };

      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      let retorno = null;

      if (formData.codigo) {
        retorno = await api.put('/v1/shared/cad/geral', geral);
      } else {
        retorno = await api.post('/v1/shared/cad/geral', geral);
      }

      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      await listarGeral(tabId);
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
      frmCadastro.current.setFieldError('descricao', validationErrors.nome);
    }
  }

  async function handleEdit(registro) {
    try {
      const response = await api.get(
        `v1/shared/consulta/geral/${registro.ger_tab_id}/${registro.ger_id}`
      );
      const dados = response.data.retorno;
      frmCadastro.current.setFieldValue('codigo', dados.ger_id);
      frmCadastro.current.setFieldValue('descricao', dados.ger_descricao);
      setOpenCadastro(true);
    } catch (error) {
      toast.error(`Erro ao carregar cadastro \n${error}`);
    }
  }

  async function handleDelete(registro) {
    try {
      await api.delete(
        `v1/shared/cad/geral/${registro.ger_tab_id}/${registro.ger_id}`
      );
      listarGeral(registro.ger_tab_id);

      // setOpenCadastro(true);
    } catch (error) {
      toast.error(`Erro ao excluir registro \n${error}`);
    }
  }

  useEffect(() => {
    if (tipo === 'crm3') {
      setTituloCadastro('Cadastrar Tipo de Oportunidade');
      setTabId(27);
      listarGeral(27);
    } else if (tipo === 'crm4') {
      setTituloCadastro('Motivo de Perda de Oportunidae');
      setTabId(28);
      listarGeral(28);
    } else if (tipo === 'crm5') {
      setTituloCadastro('Classificação de Atividade');
      setTabId(29);
      listarGeral(29);
    } else if (tipo === 'crm6') {
      setTituloCadastro('Situação do Negócio (Oportunidade)');
      setTabId(30);
      listarGeral(30);
    }
  }, []);

  const onGridPrincipalReady = (params) => {
    /* obtem acesso às APIs da Ag-grid */
    // setGridPrincipalInstance({ api: params.api, columnApi: params.columnApi });
    /* ajusta as colunas da grid para preencher todo o espaço disponível */
    params.api.sizeColumnsToFit();
  };

  const gridListaCadastro = [
    {
      field: 'ger_id',
      headerName: 'EDIT',
      width: 30,
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
                onClick={() => handleEdit(params.data)}
              >
                <MdEdit size={20} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'ger_id',
      headerName: 'DEL',
      width: 30,
      lockVisible: true,
      cellRendererFramework(params) {
        return (
          <>
            <BootstrapTooltip title="Excluir Registro" placement="top">
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
      field: 'ger_id',
      headerName: 'Código',
      width: 50,
      sortable: true,
      resizable: false,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ger_descricao',
      headerName: 'Descrição',
      width: 500,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  return (
    <>
      <ToolBar>
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovo}>
            <MdAdd size={35} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador wd="100%" hg="50px" />
        <Linha />
        <DivLimitador wd="100%" hg="10px" />
        <ToolBarItem>
          <BootstrapTooltip title="Tipo de Oportunidade" placement="left">
            <button type="button" onClick={() => handleParametros('crm3')}>
              <MdSwapVert size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
        <ToolBarItem>
          <BootstrapTooltip
            title="Motivo de Perda de Oportunidade"
            placement="left"
          >
            <button type="button" onClick={() => handleParametros('crm4')}>
              <MdSwapVert size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
        <ToolBarItem>
          <BootstrapTooltip title="Tipo de Atividade" placement="left">
            <button type="button" onClick={() => handleParametros('crm5')}>
              <MdSwapVert size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
        <ToolBarItem>
          <BootstrapTooltip title="Situação do Negócio" placement="left">
            <button type="button" onClick={() => handleParametros('crm6')}>
              <MdSwapVert size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
      </ToolBar>
      <Container id="pgTime">
        <TitleBar wd="100%">
          <h1>{tituloCadastro}</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <h1>Itens Cadastrado</h1>
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <ScrollGrid>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: '73vh',
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
      {/* popup geral */}
      <Slide direction="down" in={openCadastro}>
        <Dialog
          open={openCadastro}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenCadastro(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>{tituloCadastro}</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadastro(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <Form ref={frmCadastro} onSubmit={handleSubmit}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Código</label>
                  <Input
                    type="text"
                    name="codigo"
                    readOnly
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Descrição</label>
                  <Input
                    type="text"
                    name="descricao"
                    placeholder="Descrição"
                    className="input_cad"
                  />
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
