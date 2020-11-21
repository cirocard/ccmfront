import React, { useEffect, useState, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { MdClose, MdDelete } from 'react-icons/md';
import {
  FaArrowUp,
  FaTicketAlt,
  FaArrowDown,
  FaListOl,
  FaBuromobelexperte,
} from 'react-icons/fa';
import { AgGridReact } from 'ag-grid-react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import FormSelect from '~/componentes/Select';
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
  BoxItemCad,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';

export default function FINA3() {
  const { params } = useRouteMatch();
  const frmCadastro = useRef(null);
  const api = ApiService.getInstance(ApiTypes.API1);
  const [tabId, setTabId] = useState(0);
  const [tipoCad, setTipoCad] = useState('');
  const [loading, setLoading] = useState(false);
  const [tituloCadastro, setTituloCadastro] = useState('');
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [optAgrupador, setOptAgrupador] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optTipoCad = [
    { value: '1', label: 'CADASTRO AGRUPADOR' },
    { value: '2', label: 'CADASTRO GERAL' },
  ];

  const schemaCad = Yup.object().shape({
    ger_descricao: Yup.string().required('campo obrigatório'),
    ger_texto1: Yup.string().required('??'),
  });

  function handleDashboard() {
    history.push('/fina1', '_blank');
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
    history.push(`/supr3/${prm}`);
    window.location.reload(false);
  }

  async function handleTipoCad(value) {
    try {
      setLoading(true);
      if (value === '1') {
        const response = await api.get(
          `v1/fina/parametros/referencia?tipo=${value}`
        );
        if (response.data.success) {
          frmCadastro.current.setFieldValue(
            'ger_texto1',
            response.data.retorno
          );
        }
        setOptAgrupador([]);
      } else if (value === '2') {
        frmCadastro.current.setFieldValue('ger_texto1', '');
        const response = await api.get(
          `v1/combos/agrupador_recdesp/${tipoCad}`
        );
        setOptAgrupador(response.data.retorno);
      } else {
        frmCadastro.current.setFieldValue('ger_texto1', '');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao gerar referencia \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    if (params.tipo === 'R') {
      setTituloCadastro('CADASTRO DE GRUPO DE RECEITA');
      setTabId(20);
      setTipoCad('1');
      listarGeral(20);
    } else if (params.tipo === 'D') {
      setTituloCadastro('CADASTRO DE GRUPO DE DESPESAS');
      setTabId(20);
      setTipoCad('2');
      listarGeral(20);
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
      headerName: 'CÓDIGO',
      width: 100,
      sortable: true,
      resizable: false,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ger_texto1',
      headerName: 'REFERÊNCIA',
      width: 140,
      sortable: true,
      resizable: false,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ger_descricao',
      headerName: 'DESCRIÇÃO',
      width: 300,
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
        <BootstrapTooltip title="ACESSAR GRUPO DE RECEITA" placement="left">
          <button type="button" onClick={() => handleParametros('16')}>
            <FaArrowUp size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ACESSAR GRUPO DE DESPESA" placement="left">
          <button type="button" onClick={() => handleParametros('9')}>
            <FaArrowDown size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
      </ToolBar>
      <Container id="pgGupoRecDesp">
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
            <Form id="frmCadastro" ref={frmCadastro}>
              <BoxItemCad fr="1fr 1fr 2fr 2fr">
                <AreaComp wd="100">
                  <label>Código</label>
                  <Input
                    type="number"
                    name="ger_id"
                    readOnly
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>referência</label>
                  <Input
                    type="text"
                    name="ger_texto1"
                    readOnly
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Tipo de Cadastro"
                    name="tipocad"
                    optionsList={optTipoCad}
                    onChange={(p) => handleTipoCad(p ? p.value : '')}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Agrupador do grupo"
                    name="tipocad"
                    optionsList={optAgrupador}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery>
                <AreaComp wd="100">
                  <KeyboardEventHandler
                    handleKeys={['enter', 'tab']}
                    onKeyEvent={() => handleSubmit()}
                  >
                    <label>descriçao do grupo</label>
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
