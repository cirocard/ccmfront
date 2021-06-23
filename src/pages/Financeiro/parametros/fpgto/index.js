import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';
import { AgGridReact } from 'ag-grid-react';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import Input from '~/componentes/Input';
import { Container, ToolBar, GridContainerMain, Panel } from './styles';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  BoxItemCad,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';

export default function FINA11() {
  const frmCadastro = useRef(null);
  const api = ApiService.getInstance(ApiTypes.API1);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [optConta, setOptConta] = useState([]);
  const [optFpgtoGlobal, setOptFpgtoGlobal] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    ger_descricao: Yup.string().required('campo obrigatório'),
    ger_numerico1: Yup.string().required('??'),
    ger_numerico2: Yup.string().required('??'),
  });

  function handleDashboard() {
    history.push('/fina1', '_blank');
    history.go(0);
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

  async function handleComboFpgtoGlobal() {
    try {
      const response = await api.get(`v1/combos/geral/6`);
      const dados = response.data.retorno;
      if (dados) {
        setOptFpgtoGlobal(dados);
      }
    } catch (error) {
      toast.error(`Erro ao forma de pagamento global \n${error}`);
    }
  }

  async function listarGeral() {
    try {
      const response = await api.get(
        `v1/shared/consulta/geral_by_param?ger_tab_id=35&ger_descricao=&ger_numerico3=`
      );
      const dados = response.data.retorno;
      if (dados.length > 0) {
        setGridPesquisa(dados);
      } else {
        const fpg = await api.post('/v1/shared/cad/fpgto_emp');
        if (fpg.data.success) await listarGeral();
      }
    } catch (error) {
      toast.error(`Erro ao Grupos \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('ger_descricao', '');
    frmCadastro.current.setFieldValue('ger_numerico1', '');
    frmCadastro.current.setFieldValue('ger_numerico2', '');
    frmCadastro.current.setFieldValue('ger_id', '');
    setGridPesquisa([]);
  };

  async function handleSubmit() {
    try {
      const formData = frmCadastro.current.getData();

      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);
      const geral = {
        ger_tab_id: 35,
        ger_emp_id: '',
        ger_id: formData.ger_id || null,
        ger_descricao: formData.ger_descricao.toUpperCase(),
        ger_numerico1: formData.ger_numerico1,
        ger_numerico2: formData.ger_numerico2,
        ger_numerico3: 0,
      };

      let retorno = null;
      if (formData.ger_id)
        retorno = await api.put('/v1/shared/cad/geral', geral);
      else retorno = await api.post('/v1/shared/cad/geral', geral);

      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        limpaForm();
        await listarGeral();
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        toast.error(`Erro salvar parametros: ${err}`, toastOptions);
      }
      frmCadastro.current.setFieldError(
        'ger_descricao',
        validationErrors.ger_descricao
      );
      frmCadastro.current.setFieldError(
        'ger_numerico1',
        validationErrors.ger_numerico1
      );
      frmCadastro.current.setFieldError(
        'ger_numerico2',
        validationErrors.ger_numerico2
      );
    }
  }

  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();

    frmCadastro.current.setFieldValue('ger_id', selectedRows[0].ger_id);
    frmCadastro.current.setFieldValue(
      'ger_descricao',
      selectedRows[0].ger_descricao
    );
    frmCadastro.current.setFieldValue(
      'ger_numerico1',
      optFpgtoGlobal.find(
        (op) => op.value.toString() === selectedRows[0].ger_numerico1.toString()
      )
    );
    frmCadastro.current.setFieldValue(
      'ger_numerico2',
      optConta.find(
        (op) => op.value.toString() === selectedRows[0].ger_numerico2.toString()
      )
    );
  };

  useEffect(() => {
    handleComboContas();
    handleComboFpgtoGlobal();
    listarGeral();
  }, []);

  const gridListaCadastro = [
    {
      field: 'ger_id',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: true,
      resizable: false,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'ger_descricao',
      headerName: 'DESCRIÇÃO',
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <DivLimitador hg="50px" />
        <BootstrapTooltip title="SALVAR CADASTRO" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
      </ToolBar>
      <Container id="fpgto">
        <Scroll>
          <TitleBar bckgnd="#dae2e5" lefth1="left">
            <h1>FORMAS DE PAGAMENTO</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Panel>
            <Form id="frmCadastro" ref={frmCadastro}>
              <BoxItemCad fr="1fr 2fr 3fr 2fr">
                <AreaComp wd="100">
                  <label>Código</label>
                  <Input
                    type="number"
                    name="ger_id"
                    readOnly
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="referência global"
                    name="ger_numerico1"
                    optionsList={optFpgtoGlobal}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Descriçao</label>
                  <Input
                    type="text"
                    name="ger_descricao"
                    className="input_cad"
                  />
                </AreaComp>

                <AreaComp wd="100">
                  <FormSelect
                    label="conta contabilizadora"
                    name="ger_numerico2"
                    optionsList={optConta}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCad>
            </Form>

            <BoxItemCadNoQuery fr="1fr">
              <GridContainerMain className="ag-theme-balham">
                <AgGridReact
                  columnDefs={gridListaCadastro}
                  rowData={gridPesquisa}
                  rowSelection="single"
                  animateRows
                  gridOptions={{ localeText: gridTraducoes }}
                  onSelectionChanged={handleSelectGridPesquisa}
                />
              </GridContainerMain>
            </BoxItemCadNoQuery>
          </Panel>
        </Scroll>
      </Container>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="FORMAS DE PAGAMENTO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
