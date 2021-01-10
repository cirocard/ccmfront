import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import moment from 'moment';
import { format } from 'date-fns';
import { MdClose } from 'react-icons/md';
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaPlusCircle,
  FaCommentsDollar,
  FaEdit,
  FaPrint,
} from 'react-icons/fa';
import Popup from '~/componentes/Popup';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, toDecimal, maskDecimal } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  CModal,
} from '~/pages/general.styles';

export default function SUPR5() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmNewTable = useRef(null);
  const frmAjustaPreco = useRef(null);
  const frmImpressao = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [produto, setProduto] = useState([]);
  const [infoTabela, setInfoTabela] = useState('');
  const [dataVigencia, setDataVigencia] = useState(new Date());
  const [dataValidade, setDataValidade] = useState(new Date());
  const [openDlgImpressao, setOpenDlgImpressao] = useState(false);
  const [openDlgNewTab, setOpenDlgNewTab] = useState(false);
  const [openDlgAjustaPreco, setOpenDlgAjustaPreco] = useState(false);
  const [optCategoria, setOptCategoria] = useState([]);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [optEspecie, setOptEspecie] = useState([]);
  const [fornecedor, setFornecedor] = useState([]);

  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
    transition: toast.zoom,
  };

  // #region COMBO ========================

  const optTipoImp = [
    { value: '1', label: 'SOMENTE TABELAS ATIVAS' },
    { value: '2', label: 'SOMENTE INATIVAS' },
    { value: '3', label: 'TODAS AS TABELAS' },
  ];

  const loadOptionsProduto = async (inputText, callback) => {
    const descricao = inputText.toUpperCase();
    if (descricao.length > 2) {
      const response = await api.get(
        `v1/combos/produto?descricao=${descricao}`
      );

      callback(
        response.data.retorno.map((i) => ({
          value: i.value,
          label: i.label,
        }))
      );
    }
  };

  // combo fornecedor
  const loadOptionsFornec = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();
      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_fornecedor?valor=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 15) {
          setOptCategoria(dados);
        } else if (tab_id === 10) {
          setOptEspecie(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

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

  // #endregion

  function handleDashboard() {
    history.push('/supr1', '_blank');
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta das tabelas
  async function listaTabelas() {
    try {
      setLoading(true);
      const response = await api.get(`v1/supr/tabpreco/listar_tabelas`);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar tabelas cadastradas\n${error}`);
    }
  }

  async function handleNovoCadastro() {
    setValueTab(0);
    setDataValidade(moment(new Date()).add(1, 'years'));
    setOpenDlgNewTab(true);
  }

  async function getGridTabPreco(prod_id, ativo, tab_id) {
    try {
      setLoading(true);
      const response = await api.get(
        `v1/supr/produto/tab_preco?prod_id=${prod_id}&tab_ativo=${ativo}&tab_id=${tab_id}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridItens(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  const handleChangePreco = async (prm) => {
    try {
      if (
        toDecimal(prm.data.tab_preco_fabrica) > 0 &&
        (toDecimal(prm.data.tab_margem) > 0 ||
          toDecimal(prm.data.tab_preco_final) > 0)
      ) {
        setLoading(true);
        const tabela = {
          tab_sequence: prm.data.tab_sequence,
          tab_id: prm.data.tab_id,
          tab_prod_id: prm.data.tab_prod_id,
          tab_preco_fabrica: toDecimal(prm.data.tab_preco_fabrica),
          tab_margem: toDecimal(prm.data.tab_margem),
          tab_preco_final: toDecimal(prm.data.tab_preco_final),
          tab_preco_promo: toDecimal(prm.data.tab_preco_promo),
          tab_ativo: 'S',
        };

        const retorno = await api.put('v1/supr/tabpreco', tabela);

        if (retorno.data.success) {
          await getGridTabPreco(prm.data.tab_prod_id, 'S', tabela.tab_id);
          toast.info('Tabela Atualizada com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }

        setLoading(false);
      }
    } catch (err) {
      await getGridTabPreco(prm.data.tab_prod_id);
      setLoading(false);
      toast.error(`Erro ao atualizar preço: ${err}`, toastOptions);
    }
  };

  async function handleNewPreco(dados) {
    try {
      let vigencia;
      let validade;
      setDataVigencia((prevState) => {
        vigencia = new Date(prevState);
        return prevState;
      });
      setDataValidade((prevState) => {
        validade = new Date(prevState);
        return prevState;
      });

      if (validade) {
        setLoading(true);
        const tabela = {
          tab_sequence: null,
          tab_id: dados.tab_id,
          tab_descricao: dados.tab_descricao,
          tab_prod_id: dados.tab_prod_id,
          tab_data_vigencia: format(new Date(vigencia), 'yyyy-MM-dd HH:mm:ss'),
          tab_data_validade: format(new Date(validade), 'yyyy-MM-dd HH:mm:ss'),
          tab_preco_fabrica: '0',
          tab_margem: '0',
          tab_preco_final: '0',
          tab_preco_promo: '0',
          tab_base_subst_dem: '0',
          tab_pauta_subst_dem: '0',
          tab_aliq_subst_dem: '0',
          tab_ativo: 'S',
        };

        const retorno = await api.post('v1/supr/tabpreco', tabela);
        if (retorno.data.success) {
          await getGridTabPreco(tabela.tab_prod_id, 'S', tabela.tab_id);
          toast.info('Vigência adicionada com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }

        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        `Erro ao adicionar nova vigência de preço: ${err}`,
        toastOptions
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      await listaTabelas();
      setValueTab(newValue);
      setProduto([]);
    } else if (newValue === 1) {
      if (dataGridPesqSelected.length > 0) {
        await getGridTabPreco('', 'S', dataGridPesqSelected[0].tab_id);
        setInfoTabela(
          `TABELA SELECIONADA: ${dataGridPesqSelected[0].tab_descricao}`
        );
        setDataValidade(moment(new Date()).add(1, 'years'));
        setValueTab(newValue);
      } else {
        toast.info('SELECIONE UMA TABELA VÁLIDA PARA CONSULTAR', toastOptions);
        setValueTab(0);
      }
    }
  };

  async function handleFiltraProduto(p) {
    try {
      if (p) {
        setLoading(true);
        const response = await api.get(
          `v1/supr/produto/tab_preco?prod_id=${p}&tab_ativo=&tab_id=${dataGridPesqSelected[0].tab_id}`
        );
        const dados = response.data.retorno;
        if (dados) {
          setGridItens(dados);
        }
        setLoading(false);
      } else await getGridTabPreco('', 'S', dataGridPesqSelected[0].tab_id);
      setProduto([]);
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao filtrar produto`, toastOptions);
    }
  }

  function limpaFormAjuste() {
    setDataValidade(moment(new Date()).add(1, 'years'));
    frmAjustaPreco.current.setFieldValue('ajust_tab_preco', optTabPreco[0]);
    frmAjustaPreco.current.setFieldValue('ajust_forn_id', '');
    frmAjustaPreco.current.setFieldValue('ajust_especie_id', '');
    frmAjustaPreco.current.setFieldValue('ajust_categoria_id', '');
    frmAjustaPreco.current.setFieldValue('ajust_margem', '');
    frmAjustaPreco.current.setFieldValue('ajust_reajuste', '');
  }

  async function handleSubmitNewTable() {
    try {
      const tb = frmNewTable.current.getData();
      setLoading(true);
      const tabela = {
        tab_sequence: null,
        tab_descricao: tb.new_tab_descricao.toUpperCase(),
        tab_data_vigencia: format(
          new Date(dataVigencia),
          'yyyy-MM-dd HH:mm:ss'
        ),
        tab_data_validade: format(
          new Date(dataValidade),
          'yyyy-MM-dd HH:mm:ss'
        ),
        tab_ativo: 'S',
      };

      const retorno = await api.post('v1/supr/tabpreco/new_table', tabela);
      if (retorno.data.success) {
        await listaTabelas();
        toast.info('Tabela criada com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao cadastrar nova tabela: ${err}`, toastOptions);
    }
  }

  async function handleAjustaTabela() {
    try {
      const dados = frmAjustaPreco.current.getData();
      if (
        (!dados.ajust_reajuste && !dados.ajust_margem) ||
        (dados.ajust_reajuste && dados.ajust_margem)
      ) {
        toast.warn(
          'INFORME A MARGEM OU O PERCENTUAL DE REAJUSTE',
          toastOptions
        );
        return;
      }
      setLoading(true);
      let percent = 0;
      if (dados.ajust_reajuste) {
        percent = 1 + toDecimal(dados.ajust_reajuste) / 100;
      }
      const prm = {
        v_emp_id: null,
        v_forn_id: dados.ajust_forn_id || 0,
        v_categoria_id: dados.ajust_categoria_id || 0,
        v_especie_id: dados.ajust_especie_id || 0,
        v_tab_id: dados.ajust_tab_preco || 0,
        v_margem_origem: dados.ajust_margem ? toDecimal(dados.ajust_margem) : 0,
        v_vigencia: format(new Date(dataVigencia), 'yyyy-MM-dd HH:mm:ss'),
        v_validade: format(new Date(dataValidade), 'yyyy-MM-dd HH:mm:ss'),
        v_percent: percent,
      };
      const retorno = await api.post('v1/supr/tabpreco/reajuste', prm);
      if (retorno.data.success) {
        setOpenDlgAjustaPreco(false);
        toast.info('Tabela reajustada com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao cadastrar nova tabela: ${err}`, toastOptions);
    }
  }

  async function handleImpressao() {
    try {
      setLoading(true);
      const prmImp = frmImpressao.current.getData();
      const parms = {
        v_forn_id: prmImp.imp_forn_id,
        v_categoria_id: prmImp.imp_categoria_id,
        v_tab_id: prmImp.imp_tab_preco,
        v_prod_id: prmImp.imp_prod_id,
        v_tpImp: prmImp.imp_tpImp,
        v_especie_id: prmImp.imp_especie_id,
      };

      const url = `v1/supr/tabpreco/rel_tab_preco`;

      const response = await api.post(url, parms);
      const link = response.data;
      setLoading(false);
      window.open(link, '_blank');
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir tabela de preços \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    listaTabelas();
    setValueTab(0);
    comboGeral(10);
    comboGeral(15);
    getComboTabPreco();
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'tab_id',
      headerName: 'COD. TABELA',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tab_descricao',
      headerName: 'TABELA',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const gridColumnItens = [
    {
      field: 'tab_sequence',
      headerName: 'AÇÕES',
      width: 80,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip
              title="CADASTRAR NOVA VIGÊNCIA E PREÇO"
              placement="top"
            >
              <button
                className="grid-button"
                type="button"
                onClick={() => handleNewPreco(prm.data)}
              >
                <FaEdit size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'tab_sequence',
      headerName: 'CÓDIGO',
      width: 90,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_destaque',
    },
    {
      field: 'prod_descricao',
      headerName: 'PRODUTO',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_destaque',
    },
    {
      field: 'tab_ativo',
      headerName: 'TAB. ATIVA',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_destaque',
    },
    {
      field: 'prod_referencia',
      headerName: 'REF. PRODUTO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tab_preco_fabrica',
      headerName: 'PREÇO FAB.',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'desc_fornec',
      headerName: 'DESC. FORN (%)',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
    },
    {
      field: 'preco_fabrica_ajustado',
      headerName: 'PREÇO FAB. AJUSTADO',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
    },
    {
      field: 'tab_margem',
      headerName: 'MARGEM (%)',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'tab_preco_final',
      headerName: 'PREÇO FINAL',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'tab_data_vigencia',
      headerName: 'DATA VIGÊNCIA',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tab_data_validade',
      headerName: 'DATA VALIDADE',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="Cadastrar nova tabela" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
        <BootstrapTooltip title="REAJUSTAR TABELA" placement="left">
          <button
            type="button"
            onClick={() => {
              limpaFormAjuste();
              setOpenDlgAjustaPreco(true);
            }}
          >
            <FaFileInvoiceDollar size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
        <BootstrapTooltip title="IMPRESSÃO DE TABELAS" placement="left">
          <button
            type="button"
            onClick={() => {
              frmImpressao.current.setFieldValue('imp_tpImp', '1');
              frmImpressao.current.setFieldValue(
                'imp_tab_preco',
                optTabPreco[0]
              );
              frmImpressao.current.setFieldValue('imp_forn_id', '');
              frmImpressao.current.setFieldValue('imp_especie_id', '');
              frmImpressao.current.setFieldValue('imp_categoria_id', '');

              setOpenDlgImpressao(true);
            }}
          >
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE TABELAS DE PREÇO</h1>
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
                title="Consultar Tabelas Cadastradas"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR TABELAS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Permite o gerenciamento das tabelas de preços"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="GERENCIAR TABELAS"
                  {...a11yProps(1)}
                  icon={<FaCommentsDollar size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>TABELAS DE PREÇO CADASTRADAS</h1>
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
                <h1>{infoTabela}</h1>
                <BoxItemCad fr="3fr 1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="tab_prod_id"
                      label="PESQUISAR PRODUTO ESPECÍFICO"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={produto}
                      onChange={(p) => {
                        setProduto(p || []);
                        handleFiltraProduto(p ? p.value : '');
                      }}
                      loadOptions={loadOptionsProduto}
                      isClearable
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataVigencia(new Date(date))}
                      value={dataVigencia}
                      dateAndTime
                      label="Data Vigência"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => {
                        setDataValidade(new Date(date));
                      }}
                      dateAndTime
                      value={dataValidade}
                      label="Data Validade"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnItens}
                      rowData={gridItens}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup para cadastrar nova tabela */}
      <Popup
        isOpen={openDlgNewTab}
        closeDialogFn={() => setOpenDlgNewTab(false)}
        title="CADASTRAR NOVA TABELA DE PREÇOS"
        size="sm"
      >
        <Scroll>
          <CModal wd="100%" hd="90%">
            <Form id="frmNewTable" ref={frmNewTable}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <Input
                    type="text"
                    placeholder="INFORME A DESCRIÇÃO DA TABELA"
                    name="new_tab_descricao"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataVigencia(new Date(date))}
                    value={dataVigencia}
                    dateAndTime
                    label="Data Vigência"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => {
                      setDataValidade(new Date(date));
                    }}
                    dateAndTime
                    value={dataValidade}
                    label="Data Validade"
                  />
                </AreaComp>
              </BoxItemCad>

              <BoxItemCadNoQuery>
                <AreaComp wd="100" ptop="30px">
                  <button
                    type="button"
                    className="btnGeralForm"
                    onClick={handleSubmitNewTable}
                  >
                    CONFIRMAR CADASTRO
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Scroll>
      </Popup>

      {/* popup para ajustar preço */}
      <Popup
        isOpen={openDlgAjustaPreco}
        closeDialogFn={() => setOpenDlgAjustaPreco(false)}
        title="REAJUSTE DE TABELA DE PREÇOS"
        size="sm"
      >
        <Scroll>
          <CModal wd="100%" hd="90%">
            <Form id="frmAjustaPreco" ref={frmAjustaPreco}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <FormSelect
                    name="ajust_tab_preco"
                    label="Tabela de Preços"
                    optionsList={optTabPreco}
                    isClearable
                    placeholder="TODAS AS TABELAS"
                    zindex="153"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="ajust_forn_id"
                    label="FORNECEDOR"
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    loadOptions={loadOptionsFornec}
                    isClearable
                    value={fornecedor}
                    onChange={(f) => setFornecedor(f || [])}
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="ESPÉCIE"
                    name="ajust_especie_id"
                    optionsList={optEspecie}
                    placeholder="NÃO INFORMADO"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="CATEGORIA"
                    name="ajust_categoria_id"
                    optionsList={optCategoria}
                    placeholder="NÃO INFORMADO"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataVigencia(new Date(date))}
                    value={dataVigencia}
                    dateAndTime
                    label="Data Vigência"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => {
                      setDataValidade(new Date(date));
                    }}
                    dateAndTime
                    value={dataValidade}
                    label="Data Validade"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>(%) margem</label>
                  <BootstrapTooltip
                    title="Campo Margem é opcional, se informado, será aplicado a tabela a margem informada sobre o preço de fábrica"
                    placement="top-start"
                  >
                    <Input
                      type="text"
                      name="ajust_margem"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </BootstrapTooltip>
                </AreaComp>
                <AreaComp wd="100">
                  <label>(%) rajuste</label>
                  <BootstrapTooltip
                    title="A tabela será reajustada de acordo com o percentual informado nesse campo. Caso queira dar um desconto, informe o percentual negativo."
                    placement="top-start"
                  >
                    <Input
                      type="text"
                      name="ajust_reajuste"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </BootstrapTooltip>
                </AreaComp>
              </BoxItemCad>

              <BoxItemCadNoQuery>
                <AreaComp wd="100" ptop="30px">
                  <button
                    type="button"
                    className="btnGeralForm"
                    onClick={handleAjustaTabela}
                  >
                    CONFIRMAR REAJUSTE
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Scroll>
      </Popup>

      {/* popup para impressao */}
      <Popup
        isOpen={openDlgImpressao}
        closeDialogFn={() => setOpenDlgImpressao(false)}
        title="IMPRESSÃO DE TABELA DE PREÇO"
        size="sm"
      >
        <Scroll>
          <CModal wd="100%" hd="90%">
            <Form id="frmImpressao" ref={frmImpressao}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <FormSelect
                    name="imp_tab_preco"
                    label="Tabela de Preços"
                    optionsList={optTabPreco}
                    isClearable
                    placeholder="TODAS AS TABELAS"
                    zindex="154"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="imp_forn_id"
                    label="FORNECEDOR"
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    loadOptions={loadOptionsFornec}
                    isClearable
                    value={fornecedor}
                    onChange={(f) => setFornecedor(f || [])}
                    zindex="153"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="ESPÉCIE"
                    name="imp_especie_id"
                    optionsList={optEspecie}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="CATEGORIA"
                    name="imp_categoria_id"
                    optionsList={optCategoria}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="imp_prod_id"
                    label="Produto"
                    value={produto}
                    placeholder="TODOS OS PRODUTO"
                    onChange={(p) => setProduto(p || [])}
                    loadOptions={loadOptionsProduto}
                    isClearable
                    zindex="151"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery>
                <AreaComp wd="100">
                  <FormSelect
                    label="Tipo de Impressão"
                    name="imp_tpImp"
                    optionsList={optTipoImp}
                    placeholder="NÃO INFORMADO"
                    zindex="150"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>

              <BoxItemCadNoQuery>
                <AreaComp wd="100" ptop="40px">
                  <button
                    type="button"
                    className="btnGeralForm"
                    onClick={handleImpressao}
                  >
                    GERAR IMPRESSÃO
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Scroll>
      </Popup>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="TABELAS DE PREÇO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
