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
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, maskDecimal, toDecimal } from '~/services/func.uteis';
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

export default function FINA4() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [optBanco, setOptBanco] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

  const optTipoConta = [
    { value: 'B', label: 'CONTA BANCÁRIA' },
    { value: 'C', label: 'CONTA CAIXA' },
  ];

  const optLayout = [
    { value: 'FEBRABAN240', label: 'FEBRABAN240' },
    { value: 'CBR641', label: 'CBR641' },
    { value: 'CNAB240', label: 'CNAB240' },
    { value: 'CNAB242', label: 'CNAB242' },
    { value: 'CNAB400', label: 'CNAB400' },
    { value: 'SIGCB240', label: 'SIGCB240' },
    { value: 'SIGCB400', label: 'SIGCB400' },
  ];

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 24) {
          setOptBanco(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    ct_descricao: Yup.string().required('(??)'),
    ct_tipoconta: Yup.string().required('(??)'),
    ct_situacao: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1', '_blank');
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta das operaçoes
  async function listarContas() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      let tpconta = '';
      if (document.getElementById('pesq_conta_bancaria').checked) tpconta = 'B';
      else if (document.getElementById('pesq_conta_caixa').checked)
        tpconta = 'C';
      const response = await api.get(
        `v1/fina/parametros/contas?tp_conta=${tpconta}&ct_descricao=${formPesq.pesq_ct_descricao}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar contas\n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('ct_id', '');
    frmCadastro.current.setFieldValue('ct_descricao', '');
    frmCadastro.current.setFieldValue('ct_tipoconta', '');
    frmCadastro.current.setFieldValue('ct_banco_id', '');
    frmCadastro.current.setFieldValue('ct_agencia', '');
    frmCadastro.current.setFieldValue('ct_agencia_dv', '');
    frmCadastro.current.setFieldValue('ct_contacorr', '');
    frmCadastro.current.setFieldValue('ct_contacorr_dv', '');
    frmCadastro.current.setFieldValue('ct_cedente', '');
    frmCadastro.current.setFieldValue('ct_cod_cedente', '');
    frmCadastro.current.setFieldValue('ct_carteira', '');
    frmCadastro.current.setFieldValue('ct_taxa_banco', '');
    frmCadastro.current.setFieldValue('ct_nossonum_ini', '');
    frmCadastro.current.setFieldValue('ct_nossonum_fin', '');
    frmCadastro.current.setFieldValue('ct_seq_boleto', '');
    frmCadastro.current.setFieldValue('ct_instrucao1', '');
    frmCadastro.current.setFieldValue('ct_instrucao2', '');
    frmCadastro.current.setFieldValue('ct_dia_limite_vcto', '');
    frmCadastro.current.setFieldValue('ct_percent_multa', '');
    frmCadastro.current.setFieldValue('ct_percent_mora', '');
    frmCadastro.current.setFieldValue('ct_outro_dado_config', '');
    frmCadastro.current.setFieldValue('ct_layout_remessa', '');
    frmCadastro.current.setFieldValue('ct_situacao', '');
  };

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        frmCadastro.current.setFieldValue(
          'ct_id',
          dataGridPesqSelected[0].ct_id
        );
        frmCadastro.current.setFieldValue(
          'ct_descricao',
          dataGridPesqSelected[0].ct_descricao
        );

        frmCadastro.current.setFieldValue(
          'ct_tipoconta',
          optTipoConta.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].ct_tipoconta.toString()
          )
        );

        frmCadastro.current.setFieldValue(
          'ct_banco_id',

          optBanco.find(
            (op) => op.value.toString() === dataGridPesqSelected[0].ct_banco_id
          )
        );
        frmCadastro.current.setFieldValue(
          'ct_agencia',
          dataGridPesqSelected[0].ct_agencia
        );
        frmCadastro.current.setFieldValue(
          'ct_agencia_dv',
          dataGridPesqSelected[0].ct_agencia_dv
        );
        frmCadastro.current.setFieldValue(
          'ct_contacorr',
          dataGridPesqSelected[0].ct_contacorr
        );
        frmCadastro.current.setFieldValue(
          'ct_contacorr_dv',
          dataGridPesqSelected[0].ct_contacorr_dv
        );
        frmCadastro.current.setFieldValue(
          'ct_cedente',
          dataGridPesqSelected[0].ct_cedente
        );
        frmCadastro.current.setFieldValue(
          'ct_cod_cedente',
          dataGridPesqSelected[0].ct_cod_cedente
        );
        frmCadastro.current.setFieldValue(
          'ct_carteira',
          dataGridPesqSelected[0].ct_carteira
        );
        frmCadastro.current.setFieldValue(
          'ct_taxa_banco',
          dataGridPesqSelected[0].ct_taxa_banco
        );
        frmCadastro.current.setFieldValue(
          'ct_nossonum_ini',
          dataGridPesqSelected[0].ct_nossonum_ini
        );
        frmCadastro.current.setFieldValue(
          'ct_nossonum_fin',
          dataGridPesqSelected[0].ct_nossonum_fin
        );
        frmCadastro.current.setFieldValue(
          'ct_seq_boleto',
          dataGridPesqSelected[0].ct_seq_boleto
        );
        frmCadastro.current.setFieldValue(
          'ct_instrucao1',
          dataGridPesqSelected[0].ct_instrucao1
        );
        frmCadastro.current.setFieldValue(
          'ct_instrucao2',
          dataGridPesqSelected[0].ct_instrucao2
        );
        frmCadastro.current.setFieldValue(
          'ct_dia_limite_vcto',
          dataGridPesqSelected[0].ct_dia_limite_vcto
        );
        frmCadastro.current.setFieldValue(
          'ct_percent_multa',
          dataGridPesqSelected[0].ct_percent_multa
        );
        frmCadastro.current.setFieldValue(
          'ct_percent_mora',
          dataGridPesqSelected[0].ct_percent_mora
        );
        frmCadastro.current.setFieldValue(
          'ct_outro_dado_config',
          dataGridPesqSelected[0].ct_outro_dado_config
        );
        frmCadastro.current.setFieldValue(
          'ct_layout_remessa',
          optLayout.find(
            (op) =>
              op.value.toString() === dataGridPesqSelected[0].ct_layout_remessa
          )
        );
        frmCadastro.current.setFieldValue(
          'ct_situacao',
          optSituacao.find(
            (op) => op.value.toString() === dataGridPesqSelected[0].ct_situacao
          )
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
      if (parseInt(valueTab, 10) > 0) {
        const formData = frmCadastro.current.getData();
        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const objCad = {
          ct_emp_id: null,
          ct_id: formData.ct_id ? parseInt(formData.ct_id, 10) : null,
          ct_descricao: formData.ct_descricao.toUpperCase(),
          ct_tipoconta: formData.ct_tipoconta,
          ct_banco_id: formData.ct_banco_id || null,
          ct_agencia: formData.ct_agencia,
          ct_agencia_dv: formData.ct_agencia_dv,
          ct_contacorr: formData.ct_contacorr,
          ct_contacorr_dv: formData.ct_contacorr_dv,
          ct_cedente: formData.ct_cedente,
          ct_cod_cedente: formData.ct_cod_cedente,
          ct_carteira: formData.ct_carteira,
          ct_taxa_banco: formData.ct_taxa_banco || null,
          ct_nossonum_ini: formData.ct_nossonum_ini,
          ct_nossonum_fin: formData.ct_nossonum_fin,
          ct_seq_boleto: formData.ct_seq_boleto,
          ct_instrucao1: formData.ct_instrucao1,
          ct_instrucao2: formData.ct_instrussao2,
          ct_dia_limite_vcto: formData.ct_dia_limite_vcto || null,
          ct_percent_multa: toDecimal(formData.ct_percent_multa),
          ct_percent_mora: toDecimal(formData.ct_percent_mora),
          ct_outro_dado_config: formData.ct_outro_dado_config,
          ct_layout_remessa: formData.ct_layout_retorno,
          ct_layout_retorno: null,
          ct_situacao: formData.ct_situacao,
        };

        const retorno = await api.post('v1/fina/parametros/contas', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'ct_id',
            retorno.data.retorno.ct_id
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
        'ct_descricao',
        validationErrors.ct_descricao
      );
      frmCadastro.current.setFieldError(
        'ct_tipoconta',
        validationErrors.ct_tipoconta
      );
      frmCadastro.current.setFieldError(
        'ct_situacao',
        validationErrors.ct_situacao
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      setValueTab(newValue);
      await listarContas();
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.ct_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    }
  };

  useEffect(() => {
    listarContas();
    comboGeral(24);
    setValueTab(0);
    document.getElementById('pesq_todas').checked = true;
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'ct_id',
      headerName: 'COD. CONTA',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'tipo_conta',
      headerName: 'TIPO CONTA',
      width: 240,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'ct_descricao',
      headerName: 'DESCRIÇÃO',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'ct_saldo',
      headerName: 'SALDO CONTA',
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
        <BootstrapTooltip title="Consultar Operaçòes" placement="right">
          <button type="button" onClick={listarContas}>
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
            <h1>CADASTRO DE CONTAS</h1>
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
                  label="CONSULTAR CONTAS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="ABRE O CADASTRO DE CONTAS"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="EDITAR/CADASTRAR"
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
                <h1>CONTAS CADASTRADAS - PESQUISAR</h1>
                <BoxItemCad fr="2fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <Input
                      type="text"
                      name="pesq_ct_descricao"
                      placeholder="PESQUISAR POR DESCRIÇÃO"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <CCheck>
                      <input
                        type="radio"
                        id="pesq_todas"
                        name="tpconta"
                        value="Z"
                      />
                      <label htmlFor="pesq_todas">TODAS AS CONTAS</label>
                    </CCheck>
                  </AreaComp>
                  <AreaComp wd="100">
                    <CCheck>
                      <input
                        type="radio"
                        id="pesq_conta_bancaria"
                        name="tpconta"
                        value="B"
                      />
                      <label htmlFor="pesq_conta_bancaria">
                        CONTA BANCÁRIA
                      </label>
                    </CCheck>
                  </AreaComp>
                  <AreaComp wd="100">
                    <CCheck>
                      <input
                        type="radio"
                        id="pesq_conta_caixa"
                        name="tpconta"
                        value="C"
                      />
                      <label htmlFor="pesq_conta_caixa">CONTA CAIXA</label>
                    </CCheck>
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

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>CONTAS DE CONTROLE FINANCEIRO</h1>
                <BoxItemCad fr="1fr 4fr 2fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="ct_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Descrição</label>
                    <Input
                      type="text"
                      name="ct_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo de conta"
                      name="ct_tipoconta"
                      optionsList={optTipoConta}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="ct_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="4fr 2fr 1fr 2fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="banco para conta bancária"
                      name="ct_banco_id"
                      optionsList={optBanco}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Agência</label>
                    <Input
                      type="text"
                      name="ct_agencia"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>DV</label>
                    <Input
                      type="text"
                      name="ct_agencia_dv"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Conta Corrente</label>
                    <Input
                      type="text"
                      name="ct_contacorr"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>DV</label>
                    <Input
                      type="text"
                      name="ct_contacorr_dv"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <h1>INFORMAÇÕES PARA EMISSÃO DE BOLETO</h1>
                <BoxItemCad fr="4fr 2fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>cedente</label>
                    <Input
                      type="text"
                      name="ct_cedente"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>cod. cedente</label>
                    <Input
                      type="text"
                      name="ct_cod_cedente"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>carteira</label>
                    <Input
                      type="text"
                      name="ct_carteira"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>taxa banco</label>
                    <Input
                      type="text"
                      name="ct_taxa_banco"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="2fr 2fr 1fr 1fr 1fr 1fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>Nosso Nº Inicial</label>
                    <Input
                      type="text"
                      name="ct_nossonum_ini"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nosso Nº Final</label>
                    <Input
                      type="text"
                      name="ct_nossonum_fin"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Seq. Boleto</label>
                    <Input
                      type="text"
                      name="ct_seq_boleto"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Limite Vcto</label>
                    <BootstrapTooltip
                      title="Número de dias limite após o vencimento"
                      placement="top-start"
                    >
                      <Input
                        type="number"
                        name="ct_dia_limite_vcto"
                        className="input_cad"
                      />
                    </BootstrapTooltip>
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>% Multa</label>
                    <Input
                      type="text"
                      name="ct_percent_multa"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>% Mora</label>
                    <Input
                      type="text"
                      name="ct_percent_mora"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Outras Config.</label>
                    <Input
                      type="text"
                      name="ct_outro_dado_config"
                      className="input_cad"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <FormSelect
                      label="layout Remessa/Retorno"
                      name="ct_layout_remessa"
                      optionsList={optLayout}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Instrução 1</label>
                    <Input
                      type="text"
                      name="ct_instrucao1"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery>
                  <AreaComp wd="100">
                    <label>Instrução 2</label>
                    <Input
                      type="text"
                      name="ct_instrucao2"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
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
