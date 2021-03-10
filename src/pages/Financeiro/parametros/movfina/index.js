/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
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
  FaFolderPlus,
  FaMoneyCheckAlt,
  FaFileSignature,
  FaEdit,
} from 'react-icons/fa';
import Popup from '~/componentes/Popup';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, GridCurrencyFormatter } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  Linha,
} from '~/pages/general.styles';

export default function FINA11() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmConfig = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridParametro, setGridParametro] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [optFpgto, setOptFpgto] = useState([]);
  const [optConta, setOptConta] = useState([]);
  const [rowAlterar, setRowalterar] = useState([]);
  const [optGrpRecDesp, setOptGrprecDesp] = useState([]);
  const [tipoParam, setTipoParam] = useState('');
  const [dlgGerenciar, setDlgGerenciar] = useState(false);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipoParam = [
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
  ];

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 6) {
          setOptFpgto(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function handleGrupoRecDesp(tipoGrupo) {
    try {
      const response = await api.get(
        `v1/combos/agrupador_recdesp/${tipoGrupo}/2` // tipo 1 receita; 2 despesa
      );
      const dados = response.data.retorno;
      if (dados) {
        setOptGrprecDesp(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao gerar referencia agrupadora \n${error}`,
        toastOptions
      );
    }
  }

  async function handleComboContas() {
    try {
      const response = await api.get(`v1/combos/contas`);
      const dados = response.data.retorno;
      if (dados) {
        setOptConta(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar contas \n${error}`, toastOptions);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    prm_tipo: Yup.string().required('informe o tipo'),
    prm_descricao: Yup.string().required('informe a descriçao do parâmetro'),
    prm_situacao: Yup.string().required('informe a situação'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1');
    history.go(0);
  }

  async function getParametrosIniciais() {
    try {
      const response = await api.get(`v1/fina/parametros/parametros_iniciais`);
      const dados = response.data.retorno;
      if (dados) {
        setGridParametro(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function listarParametros() {
    try {
      const response = await api.get(`v1/fina/parametros/listar_parametros`);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function consultaParametro(prm_id) {
    try {
      const response = await api.get(
        `v1/fina/parametros/get_parametro?prm_id=${prm_id}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridParametro(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('prm_id', '');
    frmCadastro.current.setFieldValue('prm_tipo', '');
    frmCadastro.current.setFieldValue('prm_descricao', '');
    frmCadastro.current.setFieldValue('prm_situacao', '');

    frmConfig.current.setFieldValue('grupo_recdesc', '');
    frmConfig.current.setFieldValue('conta_contabil', '');
  };

  async function handleNovoCadastro() {
    await getParametrosIniciais();
    limpaForm();
    setValueTab(1);
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmConfig.current.setFieldValue('grupo_recdesc', '');
        frmConfig.current.setFieldValue('conta_contabil', '');

        frmCadastro.current.setFieldValue(
          'prm_id',
          dataGridPesqSelected[0].prm_id
        );

        frmCadastro.current.setFieldValue(
          'prm_tipo',
          dataGridPesqSelected[0].prm_tipo
        );

        frmCadastro.current.setFieldValue(
          'prm_situacao',
          dataGridPesqSelected[0].prm_situacao
        );
        frmCadastro.current.setFieldValue(
          'prm_descricao',
          dataGridPesqSelected[0].prm_descricao
        );

        await consultaParametro(dataGridPesqSelected[0].prm_id);

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

  async function handleSetParam(param) {
    try {
      const formData = frmCadastro.current.getData();
      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      setRowalterar(param);
      setDlgGerenciar(true);
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        toast.message(err, toastOptions);
      }

      frmCadastro.current.setFieldError('prm_tipo', validationErrors.prm_tipo);
      frmCadastro.current.setFieldError(
        'prm_situacao',
        validationErrors.prm_situacao
      );
      frmCadastro.current.setFieldError(
        'prm_descricao',
        validationErrors.prm_descricao
      );
    }
  }

  const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  const handleConfirmar = async () => {
    const frm = frmConfig.current.getData();
    if (frm.conta_contabil && frm.grupo_recdesc) {
      const conta = optConta.find(
        (op) => op.value.toString() === frm.conta_contabil.toString()
      );
      const grupo = optGrpRecDesp.find(
        (op) => op.value.toString() === frm.grupo_recdesc.toString()
      );

      const grid = [];

      gridParametro.forEach((g) => {
        if (g.prm_fpgto_id === rowAlterar.prm_fpgto_id) {
          g.prm_conta_id = conta.value;
          g.conta = conta.label;
          g.prm_grupo_id = grupo.value;
          g.grupo = grupo.label;
        }
        grid.push(g);
      });

      setGridParametro([]);
      await sleep(100);
      setGridParametro(grid);
      setDlgGerenciar(false);
    } else {
      toast.error(
        'INFORME O GRUPO E A CONTA CONTABIL PARA CONTINUAR...',
        toastOptions
      );
    }
  };

  async function handleSalvar() {
    try {
      setLoading(true);
      const frm = frmCadastro.current.getData();
      const parametros = [];
      let registro = {};
      gridParametro.forEach((g) => {
        registro = {
          prm_emp_id: null,
          prm_id: frm.prm_id ? parseInt(frm.prm_id, 10) : null,
          prm_tipo: frm.prm_tipo,
          prm_fpgto_id: g.prm_fpgto_id,
          prm_conta_id: g.prm_conta_id,
          prm_grupo_id: g.prm_grupo_id,
          prm_descricao: frm.prm_descricao.toUpperCase(),
          prm_usr_id: null,
          prm_situacao: frm.prm_situacao,
        };
        parametros.push(registro);
      });

      const retorno = await api.post(
        'v1/fina/parametros/param_mov_fina',
        parametros
      );
      if (retorno.data.success) {
        frmCadastro.current.setFieldValue('prm_id', retorno.data.retorno);
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao cadastrar parâmetros: ${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      await listarParametros();
      setValueTab(newValue);
    } else if (newValue === 1) {
      await handleEdit();
    }
  };

  useEffect(() => {
    frmCadastro.current.setFieldValue('prm_tipo', optTipoParam[0]);
    comboGeral(6); // fpgto
    handleComboContas();
    listarParametros();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'prm_id',
      headerName: 'CÓDIGO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'tipo',
      headerName: 'TIPO MOVIMENTO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'prm_descricao',
      headerName: 'DESCRIÇÃO',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID PARAMETROS ========================

  // const grupoCellRenderer = (params) => params.value.label;
  const gridColumnParametros = [
    {
      field: 'prm_fpgto_id',
      headerName: 'EDITAR',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="Excluir Item do pedido" placement="top">
              <button type="button" onClick={() => handleSetParam(prm.data)}>
                <FaEdit size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'fpgto',
      headerName: 'FORMA DE PAGAMENTO',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },

    {
      field: 'grupo',
      headerName: tipoParam === 'E' ? 'GRUPO DE RECEITA' : 'GRUPO DE DESPESA',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'conta',
      headerName: 'CONTA CONTABIL',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={handleSalvar}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>PARÂMETROS DE MOVIMENTAÇÃO FINANCEIRA</h1>
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
                title="CONSULTAR PARÂMETROS"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR PARÂMETROS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR/ALTERAR PARÂMETROS"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="GERENCIAR PARÂMETROS"
                  {...a11yProps(1)}
                  icon={<FaFileSignature size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>CONSULTAR PARÂMETROS CADASTRADOS</h1>

                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnPesquisa}
                      rowData={gridPesquisa}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
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
                <h1>CADASTRAR PARÂMETROS DE MOVIMENTÇÃO</h1>
                <BoxItemCad fr="1fr 2fr 5fr 2fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="prm_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo parâmetro"
                      name="prm_tipo"
                      optionsList={optTipoParam}
                      onChange={(p) => {
                        if (p) {
                          setTipoParam(p.value);
                          if (p.value.toString() === 'E')
                            handleGrupoRecDesp('1');
                          else handleGrupoRecDesp('2');
                        }
                      }}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>descrição</label>
                    <Input
                      type="text"
                      name="prm_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="prm_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnParametros}
                      rowData={gridParametro}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      rowClassRules={{
                        'warn-grupo': function (p) {
                          const { grupo } = p.data;
                          return grupo.toString() !== 'NÃO INFORMADO';
                        },
                      }}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup SETAR PARAMETROS... */}
      <Popup
        isOpen={dlgGerenciar}
        closeDialogFn={() => setDlgGerenciar(false)}
        title="CONFIGURAR FORMA DE PAGAMENTO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmConfig" ref={frmConfig}>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <FormSelect
                  label={
                    tipoParam === 'E' ? 'GRUPO DE RECEITA' : 'GRUPO DE DESPESA'
                  }
                  name="grupo_recdesc"
                  optionsList={optGrpRecDesp}
                  isClearable
                  placeholder="INFORME O GRUPO"
                  zindex="153"
                />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="direcionar para conta contabil"
                  name="conta_contabil"
                  optionsList={optConta}
                  isClearable
                  placeholder="CONTA CONTÁBIL"
                  zindex="152"
                />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleConfirmar}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="PARÂMETROS FINANCEIRO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
