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
  FaFileSignature,
  FaTools,
  FaUserTie,
} from 'react-icons/fa';
import moment from 'moment';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import TextEditor from '~/componentes/Editor';
import {
  a11yProps,
  // maskDecimal,
  GridCurrencyFormatter,
  toDecimal,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerItens,
  EditorContainer,
  EditorFechamento,
} from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  Linha,
} from '~/pages/general.styles';

export default function SERV3() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridServico, setGridServico] = useState([]);
  const [PesqCliente, setPesqCliente] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-1, 'day'));
  const [dataFin, setDataFin] = useState(moment().add(7, 'day'));
  const [dataEmiss, setDataEmiss] = useState(moment());
  const [dataBaixa, setDataBaixa] = useState(moment());
  const [optUsers, setOptUsers] = useState([]); // usuarios de uma empresa
  const [solicitacaoCliente, setSolicitacaoCliente] = useState('');
  const [servRealizado, setServRealizado] = useState('');
  const [optClassific, setOptClassific] = useState([]); // classificacao da ordem de serviço
  const [optServicos, setOptServicos] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipo = [
    { value: 'O', label: 'ORÇAMENTO' },
    { value: 'S', label: 'ORDEM DE SERVIÇO' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE EMISSAO' },
    { value: '2', label: 'DATA BAIXA' },
  ];

  const loadOptionsCliente = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function getComboUsers(emp_id) {
    try {
      const response = await api.get(`v1/combos/user_empresa/${emp_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUsers(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo usuarios \n${error}`);
    }
  }

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 34) {
          setOptClassific(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function getComboServicos() {
    try {
      const response = await api.get(`v1/combos/servicos`);
      const dados = response.data.retorno;
      if (dados) {
        setOptServicos(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo serviços \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    serv_codigo: Yup.string().required('(??)'),
    serv_titulo: Yup.string().required('(??)'),
    serv_horas: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    window.history.forward('/serv1');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('serv_id', '');
    frmCadastro.current.setFieldValue('serv_codigo', '');
    frmCadastro.current.setFieldValue('serv_titulo', '');
    frmCadastro.current.setFieldValue('serv_descricao', '');
    frmCadastro.current.setFieldValue('serv_horas', '');
    frmCadastro.current.setFieldValue('serv_valor', '');
    frmCadastro.current.setFieldValue('serv_valor_ant', '');
    setSolicitacaoCliente('');
    setValueTab(1);
  };

  async function listarOS() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/serv/servicos?serv_id=${formPesq.pesq_serv_id}&serv_codigo=${formPesq.pesq_serv_codigo}&serv_titulo=${formPesq.pesq_serv_titulo}&serv_situacao=${formPesq.pesq_serv_situacao}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar servicos\n${error}`);
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'serv_id',
          dataGridPesqSelected[0].serv_id
        );
        frmCadastro.current.setFieldValue(
          'serv_codigo',
          dataGridPesqSelected[0].serv_codigo
        );

        frmCadastro.current.setFieldValue(
          'serv_descricao',
          dataGridPesqSelected[0].serv_descricao
        );

        frmCadastro.current.setFieldValue(
          'serv_titulo',
          dataGridPesqSelected[0].serv_titulo
        );

        frmCadastro.current.setFieldValue(
          'serv_situacao',
          optTipo.find(
            (op) =>
              op.value.toString() === dataGridPesqSelected[0].serv_situacao
          )
        );
        frmCadastro.current.setFieldValue(
          'serv_horas',
          dataGridPesqSelected[0].serv_horas
        );
        frmCadastro.current.setFieldValue(
          'serv_valor',
          dataGridPesqSelected[0].serv_valor
        );
        frmCadastro.current.setFieldValue(
          'serv_valor_ant',
          dataGridPesqSelected[0].serv_valor_ant
        );
        frmCadastro.current.setFieldValue(
          'ct_contacorr_dv',
          dataGridPesqSelected[0].ct_contacorr_dv
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
          serv_emp_id: null,
          serv_id: formData.serv_id ? parseInt(formData.serv_id, 10) : null,
          serv_codigo: formData.serv_codigo,
          serv_titulo: formData.serv_titulo,
          serv_descricao: formData.serv_descricao,
          serv_horas: formData.serv_horas,
          serv_valor: toDecimal(formData.serv_valor),

          serv_usr_id: null,
          serv_situacao: formData.serv_situacao,
        };

        const retorno = await api.post('v1/serv/servicos', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'serv_id',
            retorno.data.retorno.serv_id
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
        'serv_codigo',
        validationErrors.serv_codigo
      );
      frmCadastro.current.setFieldError(
        'serv_titulo',
        validationErrors.serv_titulo
      );
      frmCadastro.current.setFieldError(
        'serv_horas',
        validationErrors.serv_horas
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
      await listarOS();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.ct_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    } else setValueTab(newValue);
  };
  const onChangeEditorSolicit = (vlr) => {
    setSolicitacaoCliente(vlr);
  };

  const onChangeEditorRealizado = (vlr) => {
    setServRealizado(vlr);
  };

  function handleSelectServico(s) {
    const aux = gridServico;
    aux.push(s);
    console.warn(aux);
    setGridServico(aux);
  }

  useEffect(() => {
    listarOS();
    getComboUsers(0);
    comboGeral(34);
    getComboServicos();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'os_id',
      headerName: 'Nº O.S',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'data_emissao',
      headerName: 'DATA EMISSÃO',
      width: 160,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cliente',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'tecnico',
      headerName: 'TECNICO/ATENDENTE',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'tipo',
      headerName: 'TIPO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      flex: 1,
    },
  ];

  // #endregion

  // #region GRID SERVIÇOS  =========================

  const gridColumnServico = [
    {
      field: 'serv_codigo',
      headerName: 'CÓDIGO SERVIÇO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_titulo',
      headerName: 'IDENTIFICAÇÃO SERVIÇO',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_valor',
      headerName: 'VALOR',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={() => limpaForm()}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Salvar Cadastro" placement="left">
          <button type="button" onClick={() => handleSubmit()}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="ABRIR ORDEM DE SERVIÇO" placement="left">
          <button type="button" onClick={() => null}>
            <FaTools size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="ABRIR CADASTRO DE CLIENTES" placement="left">
          <button type="button" onClick={() => window.open('/crm9', '_blank')}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CERENCIAMENTO DE ORDENS DE SERVIÇO</h1>
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
                title="Consultar O.S cadastrada"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR O.S"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR/EDITAR O.S"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR/EDITAR"
                  {...a11yProps(1)}
                  icon={<FaFileSignature size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip title="FECHAMENTO O.S" placement="top-end">
                <Tab
                  disabled={false}
                  label="FECHAR O.S"
                  {...a11yProps(1)}
                  icon={<FaTools size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>CONSULTAR O.S CADASTRADOS</h1>
                <BoxItemCad fr="1fr 3fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Nº O.S</label>
                    <Input
                      type="text"
                      name="pesq_os_id"
                      placeholder="Nº O.S"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_os_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={PesqCliente}
                      onChange={(c) => setPesqCliente(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="filtrar por"
                      name="pesq_data"
                      optionsList={optDATA}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataIni(new Date(date))}
                      value={dataIni}
                      label="Data Inicial:"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataFin(new Date(date))}
                      value={dataFin}
                      label="Data Final:"
                    />
                  </AreaComp>
                </BoxItemCad>
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

          <Form id="frmCadastro" ref={frmCadastro}>
            {/* ABA CADASTRO */}
            <TabPanel value={valueTab} index={1}>
              <Panel lefth1="left" bckgnd="#dae2e5">
                <h1>CADASTRO DE O.S</h1>
                <BoxItemCad fr="1fr 1fr 1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>Nº O.S</label>
                    <Input
                      type="number"
                      name="os_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataEmiss(new Date(date))}
                      value={dataEmiss}
                      label="Data Emissão"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataBaixa(new Date(date))}
                      value={dataBaixa}
                      label="Previsão Baixa"
                      dateAndTime
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo cadastro"
                      name="pesq_data"
                      optionsList={optTipo}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Classificação"
                      name="pesq_data"
                      optionsList={optClassific}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="os_cli_id"
                      label="CLIENTE"
                      placeholder="NÃO INFORMADO"
                      defaultOptions
                      cacheOptions
                      value={cliente}
                      onChange={(c) => setCliente(c || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="técnico/atendente"
                      name="pesq_data"
                      optionsList={optUsers}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                      clearable={false}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr 1fr">
                  <AreaComp wd="100" lblWeight="700">
                    <EditorContainer>
                      <label>SOLICITAÇÃO DO CLIENTE</label>
                      <TextEditor
                        onChangeFn={onChangeEditorSolicit}
                        value={solicitacaoCliente}
                      />
                    </EditorContainer>
                  </AreaComp>
                  <AreaComp wd="100" ptop="6px" lblWeight="700">
                    <FormSelect
                      label="servicos solicitados"
                      name="pesq_data"
                      optionsList={optServicos}
                      placeholder="NÃO INFORMADO"
                      onChange={(s) => handleSelectServico(s || [])}
                      zindex="153"
                    />
                    <GridContainerItens className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnServico}
                        rowData={gridServico}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                      />
                    </GridContainerItens>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Panel>
            </TabPanel>

            {/* ABA FECHAMENTO */}
            <TabPanel value={valueTab} index={2}>
              <Panel lefth1="left" bckgnd="#dae2e5">
                <h1>FECHAMENTO DA O.S</h1>

                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100" lblWeight="700">
                    <EditorFechamento>
                      <label>
                        INFORMAÇÕES ADICIONAIS / PARECER TÉCNICO DA LOJA
                      </label>
                      <TextEditor
                        onChangeFn={onChangeEditorRealizado}
                        value={servRealizado}
                      />
                    </EditorFechamento>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Panel>
            </TabPanel>
          </Form>
        </Scroll>
      </Container>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO DE ORDENS DE SERVIÇO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
