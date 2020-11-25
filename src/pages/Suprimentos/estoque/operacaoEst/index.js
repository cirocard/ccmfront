import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { MdClose } from 'react-icons/md';
import { FaSave, FaSearch, FaPlusCircle, FaFolderPlus } from 'react-icons/fa';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  CCheck,
} from '~/pages/general.styles';

export default function SUPR7() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [cfop, setCfop] = useState([]);
  const [cfopEst, setCfopEst] = useState([]);
  const [cfopImp, setCfopImp] = useState([]);
  const [optLocalEst, setOptLocalEst] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

  const optTipo = [
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
  ];

  const loadOptionsCfopEst = async (inputText, callback) => {
    if (inputText) {
      const valor = inputText.toUpperCase();
      if (valor.length > 2) {
        const response = await api.get(`v1/combos/cfop?descricao=${valor}`);
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
        if (tab_id === 16) {
          setOptLocalEst(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    oper_descricao: Yup.string().required('(??)'),
    oper_tipo: Yup.string().required('(??)'),
    oper_local_est: Yup.string().required('(??)'),
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
  };

  // fazer consulta das operaçoes
  async function listaOperacao() {
    try {
      setLoading(true);
      const response = await api.get(`v1/supr/operest`);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar operação de estoque\n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('oper_id', '');
    frmCadastro.current.setFieldValue('oper_descricao', '');
    frmCadastro.current.setFieldValue('oper_situacao', '');
    frmCadastro.current.setFieldValue('oper_tipo', '');
    frmCadastro.current.setFieldValue('oper_cfop_interestadual', '');
    frmCadastro.current.setFieldValue('oper_cfop_estadual', '');
    frmCadastro.current.setFieldValue('oper_cfop_import', '');
    frmCadastro.current.setFieldValue('oper_local_est', '');

    document.getElementById('oper_gera_financeiro').checked = false;
    document.getElementById('oper_movimenta_estoque').checked = false;
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'oper_id',
          dataGridPesqSelected[0].oper_id
        );
        frmCadastro.current.setFieldValue(
          'oper_descricao',
          dataGridPesqSelected[0].oper_descricao
        );

        frmCadastro.current.setFieldValue(
          'oper_situacao',
          optSituacao.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].oper_situacao.toString()
          )
        );

        frmCadastro.current.setFieldValue(
          'oper_tipo',
          optTipo.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].oper_tipo.toString()
          )
        );
        frmCadastro.current.setFieldValue(
          'oper_local_est',
          optLocalEst.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].oper_local_est.toString()
          )
        );

        await loadOptionsCfopEst(
          dataGridPesqSelected[0].oper_cfop_interestadual,
          setCfopEst
        );

        await loadOptionsCfopEst(
          dataGridPesqSelected[0].oper_cfop_estadual,
          setCfop
        );

        await loadOptionsCfopEst(
          dataGridPesqSelected[0].oper_cfop_import,
          setCfopImp
        );

        document.getElementById('oper_gera_financeiro').checked =
          dataGridPesqSelected[0].oper_gera_financeiro === 'S';
        document.getElementById('oper_movimenta_estoque').checked =
          dataGridPesqSelected[0].oper_movimenta_estoque === 'S';

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
    limpaForm();
    setValueTab(1);
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

        const objCad = {
          oper_emp_id: null,
          oper_id: formData.oper_id ? parseInt(formData.oper_id, 10) : null,
          oper_descricao: formData.oper_descricao.toUpperCase(),
          oper_situacao: formData.oper_situacao,
          oper_tipo: formData.oper_tipo,
          oper_gera_financeiro: document.getElementById('oper_gera_financeiro')
            .checked
            ? 'S'
            : 'N',
          oper_movimenta_estoque: document.getElementById(
            'oper_movimenta_estoque'
          ).checked
            ? 'S'
            : 'N',
          oper_cfop_interestadual: formData.oper_cfop_interestadual,
          oper_cfop_estadual: formData.oper_cfop_estadual,
          oper_cfop_import: formData.oper_cfop_import,
          oper_local_est: parseInt(formData.oper_local_est, 10),
        };

        const retorno = await api.post('v1/supr/operest', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'oper_id',
            retorno.data.retorno.oper_id
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
        'oper_descricao',
        validationErrors.oper_descricao
      );
      frmCadastro.current.setFieldError(
        'oper_tipo',
        validationErrors.oper_tipo
      );
      frmCadastro.current.setFieldError(
        'oper_local_est',
        validationErrors.oper_local_est
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
      await listaOperacao();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.oper_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    }
  };

  useEffect(() => {
    listaOperacao();
    comboGeral(16);
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'oper_id',
      headerName: 'COD. OPERAÇÀO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'oper_descricao',
      headerName: 'DESCRIÇÃO',
      width: 500,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tipo',
      headerName: 'TIPO DE OPERAÇÃO',
      width: 170,
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
        <BootstrapTooltip title="Consultar Operaçòes" placement="right">
          <button type="button" onClick={listaOperacao}>
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
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE OPERAÇÃO DE ESTOQUE</h1>
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
                title="Consultar Operações Cadastradas"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR OPERAÇÃO"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="ABRE O CADASTRO DA OPERAÇÃO"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR OPERAÇÃO"
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
                <h1>OPERAÇÕES DE ESTOQUE CADASTRADAS</h1>

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
                <h1>OPERAÇÃO DE ESTOQUE</h1>
                <BoxItemCad fr="1fr 3fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="oper_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Descrição</label>
                    <Input
                      type="text"
                      name="oper_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="SITUAÇÃO"
                      name="oper_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 3fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="TIPO DE OPERAÇÃO"
                      name="oper_tipo"
                      optionsList={optTipo}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="oper_cfop_estadual"
                      label="CFOP PARA COMPRA NO ESTADO"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      loadOptions={loadOptionsCfopEst}
                      isClearable
                      value={cfop}
                      onChange={(c) => setCfop(c || [])}
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 3fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="LOCAL DE ESTOQUE"
                      name="oper_local_est"
                      optionsList={optLocalEst}
                      placeholder="NÃO INFORMADO"
                      zindex="151"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="oper_cfop_interestadual"
                      label="CFOP PARA COMPRA FORA DO ESTADO"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      loadOptions={loadOptionsCfopEst}
                      isClearable
                      value={cfopEst}
                      onChange={(c) => setCfopEst(c || [])}
                      zindex="151"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 3fr">
                  <AreaComp wd="100">
                    <CCheck>
                      <input
                        type="checkbox"
                        id="oper_gera_financeiro"
                        name="oper_gera_financeiro"
                        value="S"
                      />
                      <label htmlFor="oper_gera_financeiro">
                        Gera Financeiro
                      </label>

                      <input
                        type="checkbox"
                        id="oper_movimenta_estoque"
                        name="oper_movimenta_estoque"
                        value="S"
                      />
                      <label htmlFor="oper_movimenta_estoque">
                        Movimenta Estoque
                      </label>
                    </CCheck>
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="oper_cfop_import"
                      label="CFOP PARA IMPORTAÇÃO"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      loadOptions={loadOptionsCfopEst}
                      isClearable
                      value={cfopImp}
                      onChange={(c) => setCfopImp(c || [])}
                      zindex="150"
                    />
                  </AreaComp>
                </BoxItemCad>
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
        title="OPERAÇÃO DE ESTOQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
