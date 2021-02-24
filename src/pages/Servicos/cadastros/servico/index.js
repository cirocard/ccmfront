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

import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import TextArea from '~/componentes/TextArea';
import { BootstrapTooltip } from '~/componentes/ToolTip';

import {
  a11yProps,
  maskDecimal,
  GridCurrencyFormatter,
  toDecimal,
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
} from '~/pages/general.styles';

export default function SERV2() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

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
    frmCadastro.current.setFieldValue(
      'serv_situacao',
      optSituacao.find((op) => op.value.toString() === '1')
    );
    document.getElementsByName('serv_codigo')[0].focus();
    setValueTab(1);
  };

  async function listarServico() {
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
          optSituacao.find(
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
      await listarServico();
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
    listarServico();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'serv_id',
      headerName: 'Nº SERVIÇO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_codigo',
      headerName: 'REFERÊNCIA',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_titulo',
      headerName: 'IDENTIFICAÇÃO',
      width: 400,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'serv_valor',
      headerName: 'VALOR',
      width: 160,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
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
            <h1>CADASTRO DE SERVIÇOS</h1>
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
                title="Consultar Serviços Cadastrado"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR SERVIÇOS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="CADASTRAR/EDITAR SERVIÇOS"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR/EDITAR"
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
                <h1>CONSULTAR SERVIÇOS CADASTRADOS</h1>
                <BoxItemCad fr="1fr 1fr 3fr 1fr">
                  <AreaComp wd="100">
                    <label>código</label>
                    <Input
                      type="text"
                      name="pesq_serv_id"
                      placeholder="Nº serviço"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Referência</label>
                    <Input
                      type="text"
                      name="pesq_serv_codigo"
                      placeholder="Referência"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Identificação</label>
                    <Input
                      type="text"
                      name="pesq_serv_titulo"
                      placeholder="IDENTIFICAÇÃO DO SERVIÇO"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do cadastro"
                      name="pesq_serv_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
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

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>CADASTRO DE SERVIÇOS</h1>
                <BoxItemCad fr="1fr 1fr 3fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="serv_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>referência</label>
                    <Input
                      type="text"
                      name="serv_codigo"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>identificação</label>
                    <Input
                      type="text"
                      name="serv_titulo"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <label>descrição detalhada</label>
                    <TextArea type="text" name="serv_descricao" rows="4" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>Tempo Exec (Hs)</label>
                    <Input
                      type="number"
                      name="serv_horas"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Anterior</label>
                    <Input
                      type="text"
                      name="serv_valor_ant"
                      className="input_cad"
                      readOnly
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Valor Serviço</label>
                    <Input
                      type="text"
                      name="serv_valor"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação do cadastro"
                      name="serv_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
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
        title="CADASTRO DE CHEQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
