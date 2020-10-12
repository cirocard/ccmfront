import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { MdClose } from 'react-icons/md';
import { FaSave, FaSearch, FaPlusCircle, FaFolderPlus } from 'react-icons/fa';
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
} from '~/pages/general.styles';

export default function ADM7() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [valuePesquisa, setValuePesquisa] = useState('');

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    tab_id: Yup.string().required('(??)'),
    descricao: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/', '_blank');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // consulta tabelas
  async function listarGeral() {
    try {
      const url = `v1/shared/consulta/geral_definition?descricao=${valuePesquisa}`;
      const response = await api.get(url);
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar tabelas \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('codigo', '');
    frmCadastro.current.setFieldValue('descricao', '');
    frmCadastro.current.setFieldValue('tab_id', '');
    frmCadastro.current.setFieldValue('numerico1', '');
    frmCadastro.current.setFieldValue('numerico2', '');
    frmCadastro.current.setFieldValue('numerico3', '');
    frmCadastro.current.setFieldValue('decimal1', '');
    frmCadastro.current.setFieldValue('decimal2', '');
    frmCadastro.current.setFieldValue('decimal3', '');
    frmCadastro.current.setFieldValue('texto1', '');
    frmCadastro.current.setFieldValue('texto2', '');
    frmCadastro.current.setFieldValue('texto3', '');
    frmCadastro.current.setFieldValue('ger_id', '');
    document.getElementsByName('descricao')[0].focus();
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'codigo',
          dataGridPesqSelected[0].codigo
        );
        frmCadastro.current.setFieldValue(
          'tab_id',
          dataGridPesqSelected[0].tab_id
        );
        frmCadastro.current.setFieldValue(
          'descricao',
          dataGridPesqSelected[0].descricao
        );
        frmCadastro.current.setFieldValue(
          'numerico1',
          dataGridPesqSelected[0].numerico1
        );
        frmCadastro.current.setFieldValue(
          'numerico2',
          dataGridPesqSelected[0].numerico2
        );
        frmCadastro.current.setFieldValue(
          'numerico3',
          dataGridPesqSelected[0].numerico3
        );
        frmCadastro.current.setFieldValue(
          'decimal1',
          dataGridPesqSelected[0].decimal1
        );
        frmCadastro.current.setFieldValue(
          'decimal2',
          dataGridPesqSelected[0].decimal2
        );
        frmCadastro.current.setFieldValue(
          'decimal3',
          dataGridPesqSelected[0].decimal3
        );
        frmCadastro.current.setFieldValue(
          'texto1',
          dataGridPesqSelected[0].texto1
        );
        frmCadastro.current.setFieldValue(
          'texto2',
          dataGridPesqSelected[0].texto2
        );
        frmCadastro.current.setFieldValue(
          'texto3',
          dataGridPesqSelected[0].texto3
        );
        frmCadastro.current.setFieldValue(
          'ger_id',
          dataGridPesqSelected[0].ger_id
        );

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
    setValueTab(1);
    limpaForm();
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

        const obj = {
          codigo: formData.codigo ? formData.codigo : null,
          tab_id: formData.tab_id,
          descricao: formData.descricao.toUpperCase(),
          numerico1: formData.numerico1.toUpperCase(),
          numerico2: formData.numerico2.toUpperCase(),
          numerico3: formData.numerico3.toUpperCase(),
          numerico4: formData.numerico4.toUpperCase(),
          decimal1: formData.decimal1.toUpperCase(),
          decimal2: formData.decimal2.toUpperCase(),
          decimal3: formData.decimal3.toUpperCase(),
          texto1: formData.texto1.toUpperCase(),
          texto2: formData.texto2.toUpperCase(),
          texto3: formData.texto3.toUpperCase(),
          ger_id: formData.ger_id.toUpperCase(),
        };

        const retorno = await api.post('v1/shared/cad/geral_definition', obj);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'codigo',
            retorno.data.retorno.codigo
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

      frmCadastro.current.setFieldError('tab_id', validationErrors.tab_id);
      frmCadastro.current.setFieldError(
        'descricao',
        validationErrors.descricao
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      frmCadastro.current.setFieldValue('codigo', '');
      setValueTab(newValue);
      await listarGeral();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.codigo) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    }
  };

  useEffect(() => {
    listarGeral();
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'tab_id',
      headerName: 'COD. TABELA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'descricao',
      headerName: 'DESCRIÇÃO TABELA',
      width: 450,
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
        <BootstrapTooltip title="Consultar FORNECEDOR" placement="right">
          <button type="button" onClick={listarGeral}>
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
        <BootstrapTooltip title="Salvar/Calcular Pedido" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO TABELA GERAL</h1>
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
              <BootstrapTooltip title="Consultar Tabelas" placement="top-start">
                <Tab
                  label="CONSULTAR TABELAS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Tela de cadastro de tabela geral"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR NOVA TABELA"
                  {...a11yProps(1)}
                  icon={<FaFolderPlus size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <h1>PARÂMETROS DE PESQUISA</h1>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <KeyboardEventHandler
                    handleKeys={['enter', 'tab']}
                    onKeyEvent={listarGeral}
                  >
                    <input
                      type="text"
                      name="pesqDescricao"
                      className="input_cad"
                      placeholder="PESQUISAR POR DESCRIÇÃO"
                      onChange={(e) => setValuePesquisa(e.target.value || '')}
                    />
                  </KeyboardEventHandler>
                </AreaComp>
              </BoxItemCadNoQuery>
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
            </Panel>
          </TabPanel>

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>IDENTIFICAÇÃO DO CADASTRO</h1>
                <BoxItemCad fr="1fr 2fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="text"
                      name="codigo"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Descriçao da tabela</label>
                    <Input type="text" name="descricao" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>COD. TABELA</label>
                    <Input type="number" name="tab_id" className="input_cad" />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>Ger Id</label>
                    <Input type="text" name="ger_id" className="input_cad" />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>Numerico 1</label>
                    <Input type="text" name="numerico1" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Numerico 2</label>
                    <Input type="text" name="numerico2" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Numerico 3</label>
                    <Input type="text" name="numerico3" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Numerico 4</label>
                    <Input type="text" name="numerico4" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Decimal 1</label>
                    <Input type="text" name="decimal1" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Decimal 2</label>
                    <Input type="text" name="decimal2" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Decimal 3</label>
                    <Input type="text" name="decimal3" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Texto 1</label>
                    <Input type="text" name="texto1" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Texto 2</label>
                    <Input type="text" name="texto2" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Texto 3</label>
                    <Input type="text" name="texto3" className="input_cad" />
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
        title="CADASTRO DE FORNECEDOR"
        message="Aguarde Processamento..."
      />
    </>
  );
}
