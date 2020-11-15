import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import moment from 'moment';
import { MdClose } from 'react-icons/md';
import { FaSave, FaSearch, FaPlusCircle, FaFolderPlus } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, RetirarMascara, toDecimal } from '~/services/func.uteis';
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

export default function SUPR8() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [fornecedor, setFornecedor] = useState([]);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'CADASTRADO' },
    { value: '2', label: 'ATUALIZADOS' },
    { value: '3', label: 'CANCELADO' },
  ];

  const optTipo = [
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
  ];

  const loadOptionsFornec = async (inputText, callback) => {
    if (inputText) {
      const valor = inputText.toUpperCase();
      if (valor.length > 2) {
        const response = await api.get(
          `v1/combos/combo_fornecedor?valor=${valor}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    forn_razao_social: Yup.string().required('(??)'),
    forn_cnpj: Yup.string().required('(??)'),
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

  // listar movimentaçoes cadastradas
  async function listaMovimentacoes() {
    try {
      setLoading(true);
      const dados = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/supr/estoque/entrada_estoque?ent_id=${dados.pesq_ent_id}&forn_id=${
          fornecedor.value || ''
        }&data_ini=${moment(pesqDataIni).format(
          'YYYY-MM-DD'
        )}&data_fin=${moment(pesqDataFin).format('YYYY-MM-DD')}&tipo=${
          dados.pesq_ent_tipo
        }&situacao=${dados.pesq_ent_situacao}`
      );
      const { retorno } = response.data;
      if (retorno) {
        setGridPesquisa(retorno);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar movimentação de estoque\n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('forn_id', '');
    frmCadastro.current.setFieldValue('forn_razao_social', '');
    frmCadastro.current.setFieldValue('forn_cnpj', '');
    frmCadastro.current.setFieldValue('forn_telefone', '');
    frmCadastro.current.setFieldValue('forn_email', '');
    frmCadastro.current.setFieldValue('forn_cep', '');
    frmCadastro.current.setFieldValue('forn_logradouro', '');
    frmCadastro.current.setFieldValue('forn_bairro', '');
    frmCadastro.current.setFieldValue('forn_cidade', '');
    frmCadastro.current.setFieldValue('forn_complemento', '');
    frmCadastro.current.setFieldValue('forn_ie', '');
    frmCadastro.current.setFieldValue('forn_numero', '');
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'forn_id',
          dataGridPesqSelected[0].forn_id
        );
        frmCadastro.current.setFieldValue(
          'forn_razao_social',
          dataGridPesqSelected[0].forn_razao_social
        );
        frmCadastro.current.setFieldValue(
          'forn_cnpj',
          dataGridPesqSelected[0].forn_cnpj
        );
        frmCadastro.current.setFieldValue(
          'forn_telefone',
          dataGridPesqSelected[0].forn_telefone
        );
        frmCadastro.current.setFieldValue(
          'forn_email',
          dataGridPesqSelected[0].forn_email
        );
        frmCadastro.current.setFieldValue(
          'forn_cep',
          dataGridPesqSelected[0].forn_cep
        );
        frmCadastro.current.setFieldValue(
          'forn_logradouro',
          dataGridPesqSelected[0].forn_logradouro
        );
        frmCadastro.current.setFieldValue(
          'forn_bairro',
          dataGridPesqSelected[0].forn_bairro
        );
        frmCadastro.current.setFieldValue(
          'forn_cidade',
          dataGridPesqSelected[0].forn_cidade
        );
        frmCadastro.current.setFieldValue(
          'forn_numero',
          dataGridPesqSelected[0].forn_numero
        );
        frmCadastro.current.setFieldValue(
          'forn_complemento',
          dataGridPesqSelected[0].forn_complemento
        );
        frmCadastro.current.setFieldValue(
          'forn_ie',
          dataGridPesqSelected[0].forn_ie
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
    limpaForm();
    setValueTab(1);
  }

  async function handleSubmit() {
    try {
      if (parseInt(valueTab) > 0) {
        const formData = frmCadastro.current.getData();
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const fornec = {
          forn_emp_id: null,
          forn_id: formData.forn_id ? formData.forn_id : null,
          forn_razao_social: formData.forn_razao_social.toUpperCase(),
          forn_cnpj: formData.forn_cnpj,
          forn_telefone: formData.forn_telefone,
          forn_email: formData.forn_email,
          forn_cep: formData.forn_cep,
          forn_logradouro: formData.forn_logradouro.toUpperCase(),
          forn_bairro: formData.forn_bairro.toUpperCase(),
          forn_cidade: formData.forn_cidade.toUpperCase(),
          forn_estado: formData.forn_estado,
          forn_numero: formData.forn_numero,
          forn_complemento: formData.forn_complemento.toUpperCase(),
          forn_ie: formData.forn_ie,
        };

        const retorno = await api.post('v1/supr/fornec', fornec);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'forn_id',
            retorno.data.retorno.forn_id
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
        'forn_razao_social',
        validationErrors.forn_razao_social
      );
      frmCadastro.current.setFieldError(
        'forn_cnpj',
        validationErrors.forn_cnpj
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      frmCadastro.current.setFieldValue('forn_id', '');
      setValueTab(newValue);
      await listaMovimentacoes();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.forn_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    }
  };

  useEffect(() => {
    listaMovimentacoes();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'ent_id',
      headerName: 'CÓDIGO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ent_datacad',
      headerName: 'DATA CADASTRO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ent_observacao',
      headerName: 'IDENTIFICAÇÃO DA MOVIMENTAÇÃO',
      width: 600,
      sortable: false,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'ent_situacao',
      headerName: 'SITUAÇÃO',
      width: 130,
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
        <BootstrapTooltip title="CONSULTAR MOVIMENTAÇÕES" placement="right">
          <button type="button" onClick={listaMovimentacoes}>
            <FaSearch size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="NOVO CADASTRO" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="SALVAR CADASTRO" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRAR ENTRADA/SAÍDA DE ESTOQUE</h1>
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
                title="CONSULTAR MOVIMENTAÇÕES DE ENTRADA/SAÍDA"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR MOVIMENTAÇÕES"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR NOVA MOVIMENTAÇÃO DE ENTRADA OU SAÍDA"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR MOVIMENTAÇÕES"
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
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCadNoQuery fr="3fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter', 'tab']}
                      onKeyEvent={() => null}
                    >
                      <AsyncSelectForm
                        name="pesq_ent_forn_id"
                        label="Informe CNPJ ou Razão Social do fornecedor para pesquisar"
                        value={fornecedor}
                        placeholder="PESQUISAR FORNECEDOR"
                        onChange={(f) => setFornecedor(f || [])}
                        loadOptions={loadOptionsFornec}
                        isClearable
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="TIPO MOVIMENTAÇÀO"
                      name="pesq_ent_tipo"
                      optionsList={optTipo}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="pesq_ent_id"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataIni(new Date(date))}
                      value={pesqDataIni}
                      label="Data Iniial:"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataFin(new Date(date))}
                      value={pesqDataFin}
                      label="Data Final:"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="pesq_ent_situacao"
                      optionsList={optSituacao}
                      isClearable
                      placeholder="INFORME"
                      zindex="153"
                    />
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
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>IDENTIFICAÇÃO DO FORNECEDOR</h1>
                <BoxItemCad fr="1fr 2fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="forn_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Razão Social</label>
                    <Input
                      type="text"
                      name="forn_razao_social"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CNPJ</label>
                    <Input
                      type="text"
                      name="forn_cnpj"
                      maxlength="18"
                      className="input_cad"
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
        title="ENTRADA/SAÍDA DE ESTOQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
