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
} from 'react-icons/fa';
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
  maskCNPJCPF,
  maskFone,
  RetirarMascara,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import { getComboUf } from '~/services/arrays';
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

export default function ADM3() {
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
  const optUf = getComboUf();

  const optSitTrib = [
    { value: '1', label: 'SIMPLES NACIONAL' },
    {
      value: '2',
      label: 'SIMPLES NACIONAL EXCESSO DE SUBLIMITE DE RECEITA BRUTA',
    },
    { value: '3', label: 'REGIME NORMAL' },
  ];

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    {
      value: '2',
      label: 'INATIVO',
    },
    { value: '3', label: 'ACESSO BLOQUEADO' },
  ];

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    emp_razao_social: Yup.string().required('(??)'),
    emp_cnpj: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/');
    history.go(0);
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('emp_id', '');
    frmCadastro.current.setFieldValue('emp_razao_social', '');
    frmCadastro.current.setFieldValue('emp_nome_fantasia', '');
    frmCadastro.current.setFieldValue('emp_cnpj', '');
    frmCadastro.current.setFieldValue('emp_insc_estadual', '');
    frmCadastro.current.setFieldValue('emp_insc_municipal', '');
    frmCadastro.current.setFieldValue('emp_cep', '');
    frmCadastro.current.setFieldValue('emp_logradouro', '');
    frmCadastro.current.setFieldValue('emp_bairro', '');
    frmCadastro.current.setFieldValue('emp_cidade', '');
    frmCadastro.current.setFieldValue('emp_estado', '');
    frmCadastro.current.setFieldValue('emp_telefone', '');
    frmCadastro.current.setFieldValue('emp_email', '');
    frmCadastro.current.setFieldValue('emp_sit_tributaria', '');
    frmCadastro.current.setFieldValue('emp_atividade', '');
    frmCadastro.current.setFieldValue('emp_situacao', '');
    frmCadastro.current.setFieldValue('emp_numero', '');
    frmCadastro.current.setFieldValue('emp_complemento', '');
    document.getElementById('emp_financeiro').checked = false;
  };

  async function handleCep(cep) {
    if (cep.target.value.length > 7) {
      const cepVaidar = RetirarMascara(cep.target.value, '.-');
      const response = await api.get(`v1/shared/consulta/cep?cep=${cepVaidar}`);
      const dados = response.data.retorno;
      frmCadastro.current.setFieldValue('emp_logradouro', dados.logradouro);
      frmCadastro.current.setFieldValue('emp_bairro', dados.bairro);
      frmCadastro.current.setFieldValue('emp_cidade', dados.localidade);
      frmCadastro.current.setFieldValue('emp_estado', dados.uf);
    }
  }

  async function listarEmpresa() {
    try {
      setLoading(true);
      const frmPesq = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/cadastros/empresa?emp_id=${frmPesq.pesq_emp_id}&emp_cnpj=${frmPesq.pesq_emp_cnpj}&emp_razao_social=${frmPesq.pesq_emp_razao_social}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cliente CRM \n${error}`, toastOptions);
    }
  }

  async function handleNovoCadastro() {
    limpaForm();
    setValueTab(1);
    document.getElementsByName('emp_razao_social')[0].focus();
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        frmCadastro.current.setFieldValue(
          'emp_id',
          dataGridPesqSelected[0].emp_id
        );
        frmCadastro.current.setFieldValue(
          'emp_razao_social',
          dataGridPesqSelected[0].emp_razao_social
        );
        frmCadastro.current.setFieldValue(
          'emp_nome_fantasia',
          dataGridPesqSelected[0].emp_nome_fantasia
        );
        frmCadastro.current.setFieldValue(
          'emp_cnpj',
          dataGridPesqSelected[0].emp_cnpj
        );
        frmCadastro.current.setFieldValue(
          'emp_insc_estadual',
          dataGridPesqSelected[0].emp_insc_estadual
        );
        frmCadastro.current.setFieldValue(
          'emp_insc_municipal',
          dataGridPesqSelected[0].emp_insc_municipal
        );
        frmCadastro.current.setFieldValue(
          'emp_cep',
          dataGridPesqSelected[0].emp_cep
        );
        frmCadastro.current.setFieldValue(
          'emp_logradouro',
          dataGridPesqSelected[0].emp_logradouro
        );
        frmCadastro.current.setFieldValue(
          'emp_bairro',
          dataGridPesqSelected[0].emp_bairro
        );
        frmCadastro.current.setFieldValue(
          'emp_cidade',
          dataGridPesqSelected[0].emp_cidade
        );
        frmCadastro.current.setFieldValue(
          'emp_estado',
          dataGridPesqSelected[0].emp_estado
        );
        frmCadastro.current.setFieldValue(
          'emp_numero',
          dataGridPesqSelected[0].emp_numero
        );
        frmCadastro.current.setFieldValue(
          'emp_complemento',
          dataGridPesqSelected[0].emp_complemento
        );

        frmCadastro.current.setFieldValue(
          'emp_situacao',
          optSituacao.find(
            (op) => op.value === dataGridPesqSelected[0].emp_situacao
          )
        );
        frmCadastro.current.setFieldValue(
          'emp_sit_tributaria',
          optSitTrib.find(
            (op) => op.value === dataGridPesqSelected[0].emp_sit_tributaria
          )
        );
        frmCadastro.current.setFieldValue(
          'emp_telefone',
          dataGridPesqSelected[0].emp_telefone
        );
        frmCadastro.current.setFieldValue(
          'emp_email',
          dataGridPesqSelected[0].emp_email
        );
        frmCadastro.current.setFieldValue(
          'emp_atividade',
          dataGridPesqSelected[0].emp_atividade
        );

        document.getElementById('emp_financeiro').checked =
          dataGridPesqSelected[0].emp_financeiro === 'S';

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
      if (parseInt(valueTab, 10) === 1) {
        const formData = frmCadastro.current.getData();

        frmCadastro.current.setErrors({});
        await schemaCad.validate(formData, {
          abortEarly: false,
        });

        setLoading(true);

        const empresa = {
          emp_id: formData.emp_id ? formData.emp_id : null,
          emp_razao_social: formData.emp_razao_social.toUpperCase(),
          emp_nome_fantasia: formData.emp_nome_fantasia.toUpperCase(),
          emp_cnpj: formData.emp_cnpj,
          emp_insc_estadual: formData.emp_insc_estadual || null,
          emp_insc_municipal: formData.emp_insc_municipal || null,
          emp_cep: formData.emp_cep,
          emp_logradouro: formData.emp_logradouro,
          emp_bairro: formData.emp_bairro,
          emp_cidade: formData.emp_cidade,
          emp_estado: formData.emp_estado,
          emp_numero: formData.emp_numero,
          emp_complemento: formData.emp_complemento,
          emp_telefone: formData.emp_telefone,
          emp_email: formData.emp_email,
          emp_sit_tributaria: formData.emp_sit_tributaria,
          emp_atividade: formData.emp_atividade || null,
          emp_situacao: formData.emp_situacao,
          emp_financeiro: document.getElementById('emp_financeiro').checked
            ? 'S'
            : 'N',
        };

        const retorno = await api.post('v1/cadastros/empresa', empresa);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue(
            'emp_id',
            retorno.data.retorno[0].emp_id
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
        'emp_razao_social',
        validationErrors.emp_razao_social
      );

      frmCadastro.current.setFieldError('emp_cnpj', validationErrors.emp_cnpj);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      limpaForm();
      await listarEmpresa();
      setValueTab(newValue);
    } else if (newValue === 1) {
      if (frmCadastro.current.getData().emp_id) setValueTab(newValue);
      else {
        await handleEdit();
        setValueTab(newValue);
      }
    }
  };

  useEffect(() => {
    listarEmpresa();
    setValueTab(0);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'emp_id',
      headerName: 'CÓDIGO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'emp_razao_social',
      headerName: 'RAZÃO SOCIAL',
      width: 370,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cmp_cnpj',
      headerName: 'CNPJ',
      width: 180,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'emp_insc_estadual',
      headerName: 'INSC. ESTADUAL',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'situacao_trib',
      headerName: 'SIT. TRIBUTÁRIA',
      width: 250,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'situacao',
      headerName: 'SIT. SISTEMA',
      width: 230,
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
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>GERENCIAR EMPRESAS</h1>
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
                title="Consultar Empresas Cadastrada"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR EMPRESA"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip title="CADASTRO DE EMPRESA" placement="top-end">
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
                <h1>CONSULTAR EMPRESAS CADASTRADOS</h1>
                <BoxItemCad fr="1fr 1fr 3fr">
                  <AreaComp wd="100">
                    <label>CÓDIGO EMPRESA</label>
                    <Input
                      type="text"
                      name="pesq_emp_id"
                      placeholder="Nº bloco"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CNPJ</label>
                    <Input
                      type="text"
                      name="pesq_emp_cnpj"
                      maxlength="18"
                      className="input_cad"
                      onChange={maskCNPJCPF}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>RAZÃO SOCIAL</label>
                    <Input
                      type="text"
                      name="pesq_emp_razao_social"
                      className="input_cad"
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
                <h1>CADASTRO DE EMPRESA</h1>
                <BoxItemCad fr="1fr 2fr 4fr 4fr 2fr">
                  <AreaComp wd="100">
                    <label>Código</label>
                    <Input
                      type="number"
                      name="emp_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CNPJ</label>
                    <Input
                      type="text"
                      name="emp_cnpj"
                      maxlength="18"
                      className="input_cad"
                      onChange={maskCNPJCPF}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Razão Social</label>
                    <Input
                      type="text"
                      name="emp_razao_social"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Nome Fantasia</label>
                    <Input
                      type="text"
                      name="emp_nome_fantasia"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação"
                      name="emp_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 2fr 1fr 2fr">
                  <AreaComp wd="100">
                    <label>Inscrição Estadual</label>
                    <Input
                      type="text"
                      name="emp_insc_estadual"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Inscrição Municipal</label>
                    <Input
                      type="text"
                      name="emp_insc_municipal"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="situação tributária"
                      name="emp_sit_tributaria"
                      optionsList={optSitTrib}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Telefone</label>
                    <Input
                      type="text"
                      name="emp_telefone"
                      className="input_cad"
                      maxlength="15"
                      onChange={maskFone}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>E-mail</label>
                    <Input type="text" name="emp_email" className="input_cad" />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <label>Resumo das atividades da empresa</label>
                    <TextArea type="text" name="emp_atividade" rows="3" />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <h1>ENDEREÇO DA EMPRESA</h1>
                <BoxItemCad fr="1fr 3fr 2fr 2fr">
                  <AreaComp wd="100">
                    <label>CEP</label>
                    <Input
                      type="text"
                      name="emp_cep"
                      onKeyPress={(event) => {
                        if (event.key === 'Enter' || event.key === 'Tab') {
                          document.getElementsByName('emp_numero')[0].focus();
                        }
                      }}
                      onBlur={handleCep}
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Logradouro</label>
                    <Input
                      type="text"
                      name="emp_logradouro"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Bairro</label>
                    <Input
                      type="text"
                      name="emp_bairro"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CIDADE</label>
                    <Input
                      type="text"
                      name="emp_cidade"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="2fr 1fr 3fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="UF"
                      name="emp_estado"
                      optionsList={optUf}
                      placeholder="Informe"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>NÚMERO</label>
                    <Input
                      type="text"
                      name="emp_numero"
                      className="input_cad"
                      maxlength="15"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>COMPLEMENTO</label>
                    <Input
                      type="text"
                      name="emp_complemento"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <h1>MÓDULOS DE ACESSO</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <CCheck>
                    <input
                      type="checkbox"
                      id="emp_financeiro"
                      name="emp_financeiro"
                      value="S"
                    />
                    <label htmlFor="emp_financeiro">CONTROLA FINANCEIRO</label>
                  </CCheck>
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
