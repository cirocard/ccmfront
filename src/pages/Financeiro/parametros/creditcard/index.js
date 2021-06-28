import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { MdClose } from 'react-icons/md';
import { FaSave, FaPlusCircle } from 'react-icons/fa';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { maskDecimal, toDecimal } from '~/services/func.uteis';
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

export default function FINA16() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmCadastro = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [optCredenciadora, setOptCredenciadora] = useState([]);
  const [grupoDesp, SetGrupoDesp] = useState([]);
  const [optTipoCard, SetOptTipoCard] = useState([]);
  const [optConta, setOptConta] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optPlanoRecebimento = [
    { value: '1', label: 'NORMAL/ECONOMICO' },
    { value: '2', label: 'RECEBIMENTO ANTECIPADO' },
  ];

  async function handleGrupoRecDesp() {
    try {
      const response = await api.get(
        `v1/combos/agrupador_recdesp/2/2` // tipo 1 receita; 2 despesa
      );
      const dados = response.data.retorno;
      if (dados) {
        SetGrupoDesp(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao gerar referencia agrupadora \n${error}`,
        toastOptions
      );
    }
  }

  async function handleComboCartoes() {
    try {
      const response = await api.get(`v1/combos/combo_cartoes`);
      const dados = response.data.retorno;
      if (dados) {
        SetOptTipoCard(dados);
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 23) {
          setOptCredenciadora(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    par_credenciadora_id: Yup.string().required('(??)'),
    par_plano: Yup.string().required('(??)'),
    par_fpgto_id: Yup.string().required('(??)'),
    par_prazo: Yup.string().required('(??)'),
    par_taxa: Yup.string().required('(??)'),
    par_grupo_despesa: Yup.string().required('(??)'),
    par_conta_id: Yup.string().required('(??)'),
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

    frmCadastro.current.setFieldValue('par_id', selectedRows[0].par_id);
    frmCadastro.current.setFieldValue(
      'par_credenciadora_id',
      optCredenciadora.find(
        (op) =>
          op.value.toString() ===
          selectedRows[0].par_credenciadora_id.toString()
      )
    );
    if (selectedRows[0].par_grupo_despesa) {
      frmCadastro.current.setFieldValue(
        'par_grupo_despesa',
        grupoDesp.find(
          (op) =>
            op.value.toString() === selectedRows[0].par_grupo_despesa.toString()
        )
      );
    } else frmCadastro.current.setFieldValue('par_grupo_despesa', '');
    frmCadastro.current.setFieldValue('par_plano', selectedRows[0].par_plano);

    frmCadastro.current.setFieldValue(
      'par_fpgto_id',
      optTipoCard.find(
        (op) => op.value.toString() === selectedRows[0].par_fpgto_id.toString()
      )
    );
    frmCadastro.current.setFieldValue(
      'par_conta_id',
      optConta.find(
        (op) => op.value.toString() === selectedRows[0].par_conta_id.toString()
      )
    );
    frmCadastro.current.setFieldValue('par_prazo', selectedRows[0].par_prazo);
    frmCadastro.current.setFieldValue('par_taxa', selectedRows[0].par_taxa);
    frmCadastro.current.setFieldValue(
      'par_taxa_adicional',
      selectedRows[0].par_taxa_adicional
    );
    document.getElementById('par_recebe_parcelado').checked =
      selectedRows[0].par_recebe_parcelado === 'S';
  };

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('par_id', '');
    frmCadastro.current.setFieldValue('par_credenciadora_id', '');
    frmCadastro.current.setFieldValue('par_plano', '');
    frmCadastro.current.setFieldValue('par_tipo_cartao', '');
    frmCadastro.current.setFieldValue('par_prazo', '');
    frmCadastro.current.setFieldValue('par_taxa', '');
    frmCadastro.current.setFieldValue('par_taxa_adicional', '');

    document.getElementById('par_recebe_parcelado').checked = false;
    const ref = frmCadastro.current.getFieldRef('par_credenciadora_id');
    ref.focus();
  };

  async function listarConfig() {
    try {
      setLoading(true);
      const response = await api.get('v1/fina/parametros/param_creditcard');
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar parametros\n${error}`);
    }
  }

  async function handleSalvar() {
    try {
      const frm = frmCadastro.current.getData();
      frmCadastro.current.setErrors({});
      await schemaCad.validate(frm, {
        abortEarly: false,
      });

      setLoading(true);
      const registro = {
        par_emp_id: null,
        par_id: frm.par_id ? parseInt(frm.par_id, 10) : null,
        par_credenciadora_id: frm.par_credenciadora_id,
        par_plano: frm.par_plano,
        par_fpgto_id: frm.par_fpgto_id,
        par_prazo: toDecimal(frm.par_prazo),
        par_recebe_parcelado: document.getElementById('par_recebe_parcelado')
          .checked
          ? 'S'
          : 'N',
        par_taxa: toDecimal(frm.par_taxa),
        par_taxa_adicional: toDecimal(frm.par_taxa_adicional),
        par_datacad: null,
        par_usr_id: null,
        par_grupo_despesa: frm.par_grupo_despesa,
        par_conta_id: frm.par_conta_id,
      };
      const retorno = await api.post(
        'v1/fina/parametros/param_creditcard',
        registro
      );
      if (retorno.data.success) {
        frmCadastro.current.setFieldValue('par_id', retorno.data.retorno);
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        await listarConfig();
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      const validationErrors = {};
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((e) => {
          validationErrors[e.path] = e.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro salvar cadastro: ${error}`, toastOptions);
      }

      frmCadastro.current.setFieldError(
        'par_credenciadora_id',
        validationErrors.par_credenciadora_id
      );
      frmCadastro.current.setFieldError(
        'par_plano',
        validationErrors.par_plano
      );
      frmCadastro.current.setFieldError(
        'par_fpgto_id',
        validationErrors.par_fpgto_id
      );
      frmCadastro.current.setFieldError(
        'par_prazo',
        validationErrors.par_prazo
      );
      frmCadastro.current.setFieldError(
        'par_grupo_despesa',
        validationErrors.par_grupo_despesa
      );
      frmCadastro.current.setFieldError(
        'par_conta_id',
        validationErrors.par_conta_id
      );
      frmCadastro.current.setFieldError('par_taxa', validationErrors.par_taxa);
    }
  }

  useEffect(() => {
    listarConfig();
    comboGeral(23);
    handleGrupoRecDesp();
    handleComboContas();
    handleComboCartoes();
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'par_id',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'credenciadora',
      headerName: 'CREDENCIADORA',
      width: 320,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'tipo_cartao',
      headerName: 'ESPÉCIE DE CARTÃO',
      width: 230,
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
        <BootstrapTooltip title="NOVO CADASTRO" placement="left">
          <button type="button" onClick={() => limpaForm()}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="SALVAR CADASTRO" placement="left">
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
            <h1>CONFIGURAR CREDENCIADORA DE CARTÕES</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Panel lefth1="left" bckgnd="#dae2e5">
            <Form id="frmCadastro" ref={frmCadastro}>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
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
                </AreaComp>
                <AreaComp wd="100">
                  <h1>CADASTRAR PARÂMETROS</h1>
                  <BoxItemCadNoQuery fr="1fr 3fr">
                    <AreaComp wd="100">
                      <label>CÓDIGO</label>
                      <Input
                        type="text"
                        name="par_id"
                        readOnly
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <FormSelect
                        label="credenciadora"
                        name="par_credenciadora_id"
                        optionsList={optCredenciadora}
                        placeholder="NÃO INFORMADO"
                        zindex="152"
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <BoxItemCadNoQuery fr="1fr 1fr">
                    <AreaComp wd="100">
                      <FormSelect
                        label="plano de recebimento"
                        name="par_plano"
                        optionsList={optPlanoRecebimento}
                        placeholder="NÃO INFORMADO"
                        zindex="151"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <FormSelect
                        label="cartão/pagamento"
                        name="par_fpgto_id"
                        optionsList={optTipoCard}
                        placeholder="NÃO INFORMADO"
                        zindex="151"
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <BoxItemCadNoQuery fr="1fr 1fr 1fr">
                    <AreaComp wd="100">
                      <label>dias recebimento</label>
                      <Input
                        type="number"
                        name="par_prazo"
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>taxa de juro</label>
                      <Input
                        type="text"
                        name="par_taxa"
                        className="input_cad"
                        onChange={maskDecimal}
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>taxa adicional pacela</label>
                      <Input
                        type="text"
                        name="par_taxa_adicional"
                        className="input_cad"
                        onChange={maskDecimal}
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <BoxItemCadNoQuery fr="1fr">
                    <AreaComp wd="100">
                      <FormSelect
                        label="grupo de despesa"
                        name="par_grupo_despesa"
                        optionsList={grupoDesp}
                        placeholder="NÃO INFORMADO"
                        zindex="150"
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <BoxItemCadNoQuery fr="1fr">
                    <AreaComp wd="100">
                      <FormSelect
                        label="Conta para débto de taxas"
                        name="par_conta_id"
                        optionsList={optConta}
                        placeholder="NÃO INFORMADO"
                        zindex="149"
                      />
                    </AreaComp>
                  </BoxItemCadNoQuery>
                  <BoxItemCadNoQuery fr="1fr">
                    <AreaComp wd="100">
                      <CCheck>
                        <input
                          type="checkbox"
                          id="par_recebe_parcelado"
                          name="par_recebe_parcelado"
                          value="S"
                        />
                        <label htmlFor="par_recebe_parcelado">
                          RECEBE CRÉDITO PARCELADO NO VENCIMENTO DA PARCELA
                        </label>
                      </CCheck>
                    </AreaComp>
                  </BoxItemCadNoQuery>
                </AreaComp>
              </BoxItemCad>
            </Form>
          </Panel>
        </Scroll>
      </Container>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CREDENCIADORA DE CARTÕES"
        message="Aguarde Processamento..."
      />
    </>
  );
}
