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
  FaCheckSquare,
  FaUniversity,
} from 'react-icons/fa';
import moment from 'moment';
import DatePickerInput from '~/componentes/DatePickerInput';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import TextArea from '~/componentes/TextArea';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import {
  a11yProps,
  maskDecimal,
  GridCurrencyFormatter,
  toDecimal,
  FormataData,
} from '~/services/func.uteis';
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
  CCheck,
} from '~/pages/general.styles';

export default function FINA13() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment());
  const [optFpgto, setOptFpgto] = useState([]);
  const [optGrprecDesp, setOptGrprecDesp] = useState([]);
  const [tipoMov, setTipoMov] = useState('');
  const [optConta, setOptConta] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optOperacao = [
    { value: 'T', label: 'TODAS' },
    { value: 'E', label: 'ENTRADA' },
    { value: 'S', label: 'SAÍDA' },
  ];

  const optOrigem = [
    { value: '1', label: 'CONTAS A RECEBER' },
    { value: '2', label: 'CONTAS A PAGAR' },
    { value: '3', label: 'PEDIDO VENDA' },
    { value: '4', label: 'CAD. DESPESAS' },
    { value: '5', label: 'MOVIMENTAÇÃO MANUAL' },
    { value: '6', label: 'TRANSFERÊNCIA ENTRE CONTAS' },
    { value: '7', label: 'TAXAS BANCÁRIAS' },
    { value: '0', label: 'TODAS AS MOVIMENTAÇÕES' },
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
        if (dataGridPesqSelected.length > 0) {
          if (dataGridPesqSelected[0].mov_grupo_id) {
            frmCadastro.current.setFieldValue(
              'mov_grupo_id',
              dados.find(
                (op) =>
                  op.value.toString() ===
                  dataGridPesqSelected[0].mov_grupo_id.toString()
              )
            );
          } else frmCadastro.current.setFieldValue('mov_grupo_id', '');
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao gerar referencia agrupadora \n${error}`,
        toastOptions
      );
    }
  }

  async function comboContas() {
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
    mov_operacao: Yup.string().required('(??)'),
    mov_ct_id: Yup.string().required('(??)'),
    mov_valor: Yup.string().required('(??)'),
    mov_descricao: Yup.string().required('(??)'),
    mov_fpgto_id: Yup.string().required('(??)'),
    mov_grupo_id: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/fina1');
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('mov_id', '');
    frmCadastro.current.setFieldValue('mov_operacao', '');
    frmCadastro.current.setFieldValue('mov_origem', '');
    frmCadastro.current.setFieldValue('mov_ct_id', '');
    frmCadastro.current.setFieldValue('mov_datamov', '');
    frmCadastro.current.setFieldValue('mov_valor', '');
    frmCadastro.current.setFieldValue('mov_descricao', '');
    frmCadastro.current.setFieldValue('mov_usr_id', '');
    frmCadastro.current.setFieldValue('mov_fpgto_id', '');
    frmCadastro.current.setFieldValue('mov_grupo_id', '');
    setOptGrprecDesp([]);
  };

  async function handleNovoCadastro() {
    limpaForm();
    setValueTab(1);
  }

  async function listarMovimentacoes() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      let contabilizadas = '';
      if (document.getElementById('pesq_mov_contabilizado').checked)
        contabilizadas = 'N';
      else contabilizadas = 'S';

      const d1 = moment(dataIni).format('YYYY-MM-DD');
      const d2 = moment(dataFin).format('YYYY-MM-DD');
      const response = await api.get(
        `v1/fina/mov/listar_movimentacoes?data_ini=${d1}&data_fin=${d2}&operacao=${formPesq.pesq_mov_operacao}&origem=${formPesq.pesq_mov_origem}&contabilizadas=${contabilizadas}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar movimentacoes\n${error}`);
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

        if (dataGridPesqSelected[0].mov_contabilizado.toString() === 'S') {
          toast.error(
            `Movimentação contabilizada não pode mais ser alterada...`,
            toastOptions
          );
          return;
        }
        setLoading(true);

        const objCad = {
          mov_emp_id: null,
          mov_id: formData.mov_id ? parseInt(formData.mov_id, 10) : null,
          mov_operacao: formData.mov_operacao,
          mov_ct_id: formData.mov_ct_id,
          mov_valor: toDecimal(formData.mov_valor),
          mov_descricao: formData.mov_descricao,
          mov_usr_id: null,
          mov_origem: '5', // cadastro manual
          mov_id_origem: 0,
          mov_contabilizado: 'N',
          mov_fpgto_id: formData.mov_fpgto_id,
          mov_grupo_id: formData.mov_grupo_id,
        };

        const retorno = await api.post('v1/fina/mov/cadastrar', objCad);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'mov_id',
            retorno.data.retorno.mov_id
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
        'mov_operacao',
        validationErrors.mov_operacao
      );
      frmCadastro.current.setFieldError(
        'mov_ct_id',
        validationErrors.mov_ct_id
      );
      frmCadastro.current.setFieldError(
        'mov_valor',
        validationErrors.mov_valor
      );
      frmCadastro.current.setFieldError(
        'mov_descricao',
        validationErrors.mov_descricao
      );
      frmCadastro.current.setFieldError(
        'mov_fpgto_id',
        validationErrors.mov_fpgto_id
      );
      frmCadastro.current.setFieldError(
        'mov_grupo_id',
        validationErrors.mov_grupo_id
      );
    }
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        frmCadastro.current.setFieldValue(
          'mov_operacao',
          optOperacao.find(
            (op) => op.value.toString() === dataGridPesqSelected[0].mov_operacao
          )
        );

        frmCadastro.current.setFieldValue(
          'mov_id',
          dataGridPesqSelected[0].mov_id
        );

        frmCadastro.current.setFieldValue(
          'mov_origem',
          optOrigem.find(
            (op) => op.value.toString() === dataGridPesqSelected[0].mov_origem
          )
        );

        frmCadastro.current.setFieldValue(
          'mov_datamov',
          FormataData(dataGridPesqSelected[0].mov_datamov, 2)
        );
        frmCadastro.current.setFieldValue(
          'mov_valor',
          dataGridPesqSelected[0].mov_valor
        );
        frmCadastro.current.setFieldValue(
          'mov_descricao',
          dataGridPesqSelected[0].mov_descricao
        );
        frmCadastro.current.setFieldValue(
          'mov_usr_id',
          dataGridPesqSelected[0].username
        );

        frmCadastro.current.setFieldValue(
          'mov_fpgto_id',
          optFpgto.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].mov_fpgto_id.toString()
          )
        );

        frmCadastro.current.setFieldValue(
          'mov_ct_id',
          optConta.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].mov_ct_id.toString()
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

  async function handleContabilizar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        const prm = [];
        dataGridPesqSelected.forEach((g) => {
          if (g.mov_contabilizado === 'S') {
            toast.error(`ESTA MOVIMENTAÇÃO JÁ FOI CONTABILIZADA`, toastOptions);
          }

          prm.push({
            mov_id: g.mov_id,
          });
        });

        setLoading(true);
        const response = await api.put(`v1/fina/mov/contabilizar`, prm);
        if (response.data.success) {
          toast.success(response.data.retorno, toastOptions);
          await listarMovimentacoes();
        } else toast.error(response.data.errors, toastOptions);
      } else {
        toast.error(
          `SELECIONE UMA MOVIMENTAÇÃO PARA CONTABILIZAR...`,
          toastOptions
        );
        return;
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao contabilizar movimentação \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      await listarMovimentacoes();
      setValueTab(newValue);
    } else if (newValue === 1) {
      const cadastro = frmCadastro.current.getData();
      if (cadastro.mov_id) {
        setValueTab(newValue);
      } else {
        await handleEdit();
      }
    }
  };

  useEffect(() => {
    frmPesquisa.current.setFieldValue(
      'pesq_mov_origem',
      optOrigem.find((op) => op.value.toString() === '5')
    );
    frmPesquisa.current.setFieldValue(
      'pesq_mov_operacao',
      optOperacao.find((op) => op.value.toString() === 'E')
    );
    comboGeral(6);
    comboContas();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'mov_id',
      headerName: 'Nº MOV.',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'datamov',
      headerName: 'DATA MOV.',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'operacao',
      headerName: 'OPERAÇÃO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'conta',
      headerName: 'CONTA (CAIXA/BANCO)',
      width: 250,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'mov_valor',
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
      field: 'contabilizado',
      headerName: 'CONTABILIZADO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'mov_descricao',
      headerName: 'DESCRIÇÃO',
      width: 500,
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
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="CONTABILIZAR MOVIMENTAÇÃO" placement="left">
          <button type="button" onClick={handleContabilizar}>
            <FaCheckSquare size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <BootstrapTooltip title="CADASTRO DE CONTAS" placement="left">
          <button type="button" onClick={() => window.open('/fina4', '_blank')}>
            <FaUniversity size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO MOVIMENTAÇÕES FINANCEIRA</h1>
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
                title="Consultar Movimentações Cadastradas"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR MOVIMENTAÇOES"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="GERENCIAR MOVIMENTAÇÕES"
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
                <h1>CONSULTAR MOVIMENTAÇÕES FINANCEIRA</h1>
                <BoxItemCad fr="1fr 1fr 1fr 2fr 3fr">
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataIni(new Date(date))}
                      value={dataIni}
                      label="Data Inicial"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataFin(new Date(date))}
                      value={dataFin}
                      label="Data Final"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="tipo de movimento"
                      name="pesq_mov_operacao"
                      optionsList={optOperacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="origem movimento"
                      name="pesq_mov_origem"
                      optionsList={optOrigem}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100" ptop="25px">
                    <CCheck>
                      <input
                        type="checkbox"
                        id="pesq_mov_contabilizado"
                        name="pesq_mov_contabilizado"
                        value="S"
                      />
                      <label htmlFor="pesq_mov_contabilizado">
                        SOMENTE MOVIMENTAÇÕES NÃO CONTABILIZADAS
                      </label>
                    </CCheck>
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnPesquisa}
                      rowData={gridPesquisa}
                      rowSelection="multiple"
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
                <h1>CADASTRO DE MOVIMENTAÇÃO FINANCEIRA</h1>
                <BoxItemCad fr="1fr 1fr 4fr 1fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="mov_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Tipo de movimentação"
                      name="mov_operacao"
                      optionsList={optOperacao}
                      isClearable
                      onChange={async (p) => {
                        if (p) {
                          setTipoMov(p.value);
                          if (p.value.toString() === 'E')
                            await handleGrupoRecDesp('1');
                          else if (p.value.toString() === 'S')
                            await handleGrupoRecDesp('2');
                          else {
                            handleNovoCadastro();
                            toast.error('TIPO INVÁLIDO', toastOptions);
                          }
                        }
                      }}
                      placeholder="TIPO MOVIMENTAÇÃO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="conta contabilizadora (caixa/banco)"
                      name="mov_ct_id"
                      optionsList={optConta}
                      isClearable
                      placeholder="CONTA"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Data Movimentação</label>
                    <Input
                      type="text"
                      name="mov_datamov"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 3fr 3fr">
                  <AreaComp wd="100">
                    <label>valor movimentado</label>
                    <Input
                      type="text"
                      name="mov_valor"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="forma pagamento"
                      name="mov_fpgto_id"
                      optionsList={optFpgto}
                      isClearable
                      placeholder="FORMA PAGAMENTO"
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label={
                        tipoMov === 'E'
                          ? 'grupo de receita'
                          : 'grupo de despesa'
                      }
                      name="mov_grupo_id"
                      optionsList={optGrprecDesp}
                      isClearable
                      placeholder="INFORME O GRUPO"
                      zindex="152"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr">
                  <AreaComp wd="100">
                    <label>descrição</label>
                    <TextArea type="text" name="mov_descricao" rows="3" />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>autor movimentação</label>
                    <Input
                      type="text"
                      name="mov_usr_id"
                      readOnly
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
        title="MOVIMENTAÇÃO FINANANCEIRA"
        message="Aguarde Processamento..."
      />
    </>
  );
}
