import React, { useEffect, useState, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { MdClose, MdDelete } from 'react-icons/md';
import {
  FaBorderAll,
  FaImages,
  FaMapMarkedAlt,
  FaUserTie,
} from 'react-icons/fa';
import { AgGridReact } from 'ag-grid-react';

import KeyboardEventHandler from 'react-keyboard-event-handler';
import DialogInfo from '~/componentes/DialogInfo';
import Input from '~/componentes/Input';
import { Container, ToolBar, GridContainerMain, Panel } from './styles';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';
// parametros crm: tipo oportunidade; motivo de perda; classificaçao de atividade
export default function Crm8() {
  const { params } = useRouteMatch();
  const frmCadastro = useRef(null);
  const api = ApiService.getInstance(ApiTypes.API1);
  const [tabId, setTabId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tituloCadastro, setTituloCadastro] = useState('');
  const [gridPesquisa, setGridPesquisa] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    ger_descricao: Yup.string().required('campo obrigatório'),
  });

  function handleDashboard() {
    history.push('/crm1', '_blank');
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
    frmCadastro.current.setFieldValue('ger_descricao', '');
  };

  const handleEdit = async (prm) => {
    try {
      setLoading(true);

      let tab = '';
      setTabId((prevState) => {
        tab = prevState;
        return prevState;
      });

      const geral = {
        ger_tab_id: tab,
        ger_emp_id: '',
        ger_id: prm.data.ger_id,
        ger_descricao: prm.data.ger_descricao.toUpperCase(),
      };

      const retorno = await api.put('/v1/shared/cad/geral', geral);
      setLoading(false);
      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        await listarGeral(tab);
      } else {
        toast.info(
          `Erro ao atualizar cadastro ${retorno.data.errors}`,
          toastOptions
        );
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro salvar parametros: ${err}`, toastOptions);
    }
  };

  async function handleSubmit(codigo) {
    try {
      const formData = frmCadastro.current.getData();
      setLoading(true);
      const geral = {
        ger_tab_id: tabId,
        ger_emp_id: '',
        ger_id: codigo || null,
        ger_descricao: formData.ger_descricao.toUpperCase(),
      };

      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      const retorno = await api.post('/v1/shared/cad/geral', geral);

      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        limpaForm();
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
      frmCadastro.current.setFieldError(
        'ger_descricao',
        validationErrors.ger_descricao
      );
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

  const gridValidations = (newValue) => {
    if (!newValue) {
      toast.info('Informe uma descrição válida', toastOptions);
      return false;
    }
    return true;
  };

  function handleParametros(prm) {
    history.push(`/crm8/${prm}`);
    window.location.reload(false);
  }

  useEffect(() => {
    if (params.tipo === '31') {
      setTituloCadastro('SEGMENTAÇÃO DE MERCADO');
      setTabId(31);
      listarGeral(31);
    } else if (params.tipo === '32') {
      setTituloCadastro('RAMO DE ATIVIDADE');
      setTabId(32);
      listarGeral(32);
    } else if (params.tipo === '33') {
      setTituloCadastro('TIPO DE CLIENTE');
      setTabId(33);
      listarGeral(33);
    }
  }, []);

  const gridListaCadastro = [
    {
      field: 'ger_id',
      headerName: 'DEL',
      width: 80,
      lockVisible: true,
      cellRendererFramework(prms) {
        return (
          <>
            <BootstrapTooltip title="Excluir Registro" placement="top">
              <button
                className="grid-button"
                type="button"
                onClick={() => handleDelete(prms.data)}
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
      width: 100,
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
      flex: 1,
      editable: true,
      onCellValueChanged: handleEdit,
      cellEditorParams: {
        validacoes: gridValidations,
      },
    },
  ];

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Cadastro de Cliente" placement="left">
          <button type="button" onClick={() => history.push(`/crm9/`)}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Segmentação de Mercado" placement="left">
          <button type="button" onClick={() => handleParametros('31')}>
            <FaBorderAll size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Ramo de Atividade" placement="left">
          <button type="button" onClick={() => handleParametros('32')}>
            <FaImages size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Tipo de Cliente" placement="left">
          <button type="button" onClick={() => handleParametros('33')}>
            <FaMapMarkedAlt size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>
      <Container id="pgClassific">
        <Scroll>
          <TitleBar bckgnd="#dae2e5" lefth1="left">
            <h1>{tituloCadastro}</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Panel>
            <Form id="frmCapa" ref={frmCadastro}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <KeyboardEventHandler
                    handleKeys={['enter', 'tab']}
                    onKeyEvent={() => handleSubmit()}
                  >
                    <Input
                      type="text"
                      name="ger_descricao"
                      placeholder="INFORME A DESCRIÇÃO E PRESSIONE <ENTER>"
                      className="input_cad"
                    />
                  </KeyboardEventHandler>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>

            <BoxItemCadNoQuery fr="1fr">
              <GridContainerMain className="ag-theme-balham">
                <AgGridReact
                  columnDefs={gridListaCadastro}
                  rowData={gridPesquisa}
                  rowSelection="single"
                  animateRows
                  gridOptions={{ localeText: gridTraducoes }}
                />
              </GridContainerMain>
            </BoxItemCadNoQuery>
          </Panel>
        </Scroll>
      </Container>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title={tituloCadastro}
        message="Aguarde Processamento..."
      />
    </>
  );
}
