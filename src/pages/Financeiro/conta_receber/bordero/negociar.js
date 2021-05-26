import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  FaSearch,
  FaHandsHelping,
  FaSave,
  FaFunnelDollar,
  FaEraser,
} from 'react-icons/fa';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Input from '~/componentes/Input';
import TabPanel from '~/componentes/TabPanel';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  GridCurrencyFormatter,
  a11yProps,
  maskDecimal,
  toDecimal,
  ArredondaValorDecimal,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  ContentConsulta,
  GridContainerTitulos,
} from './styles';

import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitador,
  Linha,
} from '~/pages/general.styles';

export default function NEGOCIAR_CTAREC({ tabAtiva }) {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [cliente, setCliente] = useState([]);
  const frmPesquisa = useRef(null);
  const frmNegociar = useRef(null);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [vencimento, setVencimento] = useState(new Date());
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridNeg, setGridNeg] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optCvto, setOptCvto] = useState([]);
  const [valueTab, setValueTab] = useState(0);
  const [tpLivre, setTpLivre] = useState(false);
  const [visible, setVisible] = useState(false);

  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optTipoNegociacao = [
    { value: '1', label: 'LIVRE' },
    { value: '2', label: 'CONDIÇÃO DE VENCIMENTO' },
  ];

  /*
    - titulo renegociado tera documento = RENEGOCIADO
    - a origem será 2 - gerado pelo sistema
    - o titulo original será cancelado
    - a observacao terá a identificaçao da origem
    - deve ser criado uma condiçao de vencimento codigo 100  personalizado
  */

  // cliente
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
          `v1/combos/combo_cliente?perfil=23&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function getComboCondVcto() {
    try {
      const response = await api.get(`v1/combos/condvcto`);
      const dados = response.data.retorno;
      if (dados) {
        setOptCvto(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Condição de vencimento \n${error}`);
    }
  }

  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta dos pedidos
  async function listaTitulos() {
    try {
      if (!cliente.value) {
        toast.warn(`INFORME O CLIENTE PARA CONSULTA...`, toastOptions);
        return;
      }
      setLoading(true);
      const response = await api.get(
        `v1/fina/ctarec/titulos_bordero?cli_id=${
          cliente.value || '0'
        }&data_ini=${moment(pesqDataIni).format(
          'YYYY-MM-DD'
        )}&data_fin=${moment(pesqDataFin).format('YYYY-MM-DD')}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar pedidos\n${error}`);
    }
  }

  function setParametros() {
    let vlr = 0;
    dataGridPesqSelected.forEach((g) => {
      vlr += toDecimal(g.reci_valor);
    });

    frmNegociar.current.setFieldValue(
      'cliente',
      dataGridPesqSelected[0].cli_razao_social
    );
    frmNegociar.current.setFieldValue('total_neg', ArredondaValorDecimal(vlr));
    frmNegociar.current.setFieldValue('juro', 0);
    frmNegociar.current.setFieldValue('desconto', 0);
    frmNegociar.current.setFieldValue('total_negociado', '0');
  }

  async function handleSimularNeg() {
    try {
      if (valueTab === 0) {
        toast.error(
          `INFORME OS PARÂMETROS DE NEGOCIAÇÃO PARA PODER SIMULAR`,
          toastOptions
        );
        return;
      }

      const frmData = frmNegociar.current.getData();
      const gridAux = [];

      if (toDecimal(frmData.valor_neg) === 0) {
        toast.error(`O VALOR DA NEGOCIAÇÃO NÃO FOI INFORMADO`, toastOptions);
        return;
      }

      let vtot = toDecimal(frmData.valor_neg);
      if (toDecimal(frmData.juro) > 0) {
        vtot *= 1 + toDecimal(frmData.juro) / 100;
      } else if (toDecimal(frmData.desconto) > 0) {
        vtot *= 1 - toDecimal(frmData.juro) / 100;
      }

      if (frmData.tipo_neg.toString() === '1') {
        // livre
        frmNegociar.current.setFieldValue(
          'total_negociado',
          ArredondaValorDecimal(toDecimal(frmData.total_negociado) + vtot)
        );

        const valorNeg = {
          vencimento: format(vencimento, 'dd/MM/yyyy'),
          valor: ArredondaValorDecimal(vtot),
          cvto_id: 100,
        };
        gridAux.push(...gridNeg, valorNeg);
        setGridNeg(gridAux);
        frmNegociar.current.setFieldValue('valor_neg', '');
        document.getElementsByName('valor_neg')[0].focus();
      } else if (frmData.tipo_neg.toString() === '2') {
        // cond vcto
        if (!frmData.cvto_id) {
          toast.error(
            'VOCÊ NÃO INFORMOU A CONDIÇÃO DE VENCIMENTO',
            toastOptions
          );
          return;
        }

        const retorno = await api.get(
          `v1/fina/ctarec/simular_parcela?cvto_id=${
            frmData.cvto_id
          }&valor=${vtot}&database=${format(vencimento, 'yyyy-MM-dd HH:mm:ss')}`
        );

        if (retorno.data.success) {
          setGridNeg(retorno.data.retorno);
          frmNegociar.current.setFieldValue(
            'total_negociado',
            ArredondaValorDecimal(vtot)
          );
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.errors}`,
            toastOptions
          );
        }
      } else
        toast.error('INFORME O TIPO DE PRAZO PARA NEGOCIAÇÃO', toastOptions);
    } catch (error) {
      toast.error(`Erro ao simular negociação \n${error}`, toastOptions);
    }
  }

  function handleReset() {
    setGridNeg([]);
    setTpLivre(false);
    setVisible(false);
    frmNegociar.current.setFieldValue('valor_neg', '');
    frmNegociar.current.setFieldValue('tipo_neg', '');
    frmNegociar.current.setFieldValue('total_negociado', '0');
  }

  const handleChangePrazo = (c) => {
    setGridNeg([]);
    if (c) {
      setTpLivre(c.value.toString() === '1');
      if (c.value.toString() === '2') {
        frmNegociar.current.setFieldValue(
          'valor_neg',
          frmNegociar.current.getData().total_neg
        );
        setVisible(false);
      } else {
        setVisible(true);
        setVencimento(new Date());
        frmNegociar.current.setFieldValue('cvto_id', '');
      }
    } else {
      setTpLivre(false);
      setVisible(false);
      frmNegociar.current.setFieldValue('valor_neg', '');
      frmNegociar.current.setFieldValue('total_negociado', '0');
    }
  };

  async function handleConfirmar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        const frmData = frmNegociar.current.getData();

        const obj = [
          {
            valor: toDecimal(frmData.total_negociado),
            negociado: dataGridPesqSelected,
            parcelas: gridNeg,
          },
        ];
        const retorno = await api.post('v1/fina/ctarec/negociar_titulos', obj);
        if (retorno.data.success) {
          toast.success(retorno.data.retorno, toastOptions);
          setValueTab(0);
          setGridPesquisa([]);
        } else toast.error(retorno.data.message, toastOptions);
      } else {
        toast.error(
          'Selecione pelo menos um titulo para confirmar',
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao confirmar \n${error}`, toastOptions);
    }
  }

  const handleChangeTab = async (event, newValue) => {
    if (newValue === 0) {
      await listaTitulos();
      setValueTab(newValue);
    } else if (newValue === 1) {
      if (dataGridPesqSelected.length > 0) {
        await getComboCondVcto();
        setParametros();
        handleReset();
        setValueTab(newValue);
      } else {
        toast.error(
          'Selecione pelo menos um titulo para confirmar',
          toastOptions
        );
      }
    }
  };

  // #region GRID CONSULTA TITULOS =========================

  const gridColumnConsulta = [
    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'rec_id',
      headerName: 'Nº TITULO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'rec_documento',
      headerName: 'DOCUMENTO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'reci_parcela',
      headerName: 'PARCELA',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'reci_valor',
      headerName: 'VALOR',
      width: 125,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'forma_pgto',
      headerName: 'FORMA PAGAMENTO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      flex: 1,
    },
  ];
  // #endregion

  // #region GRID NEGOCIAÇAO TITULOS =========================

  const gridColumnNeg = [
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'valor',
      headerName: 'VALOR',
      width: 175,
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

  useEffect(() => {
    setValueTab(0);
    setGridPesquisa([]);
    frmPesquisa.current.setFieldValue('pesq_cli_id', '');
  }, [tabAtiva]);

  return (
    <>
      <ContentConsulta>
        <ToolBar hg="77vh" wd="40px" mleft="5px" ptop="35">
          <DivLimitador hg="160px" />
          <BootstrapTooltip title="GERAR SIMULAÇÃO" placement="left">
            <button type="button" onClick={handleSimularNeg}>
              <FaFunnelDollar size={25} color="#fff" />
            </button>
          </BootstrapTooltip>
          <DivLimitador hg="10px" />
          <BootstrapTooltip title="LIMPAR SIMULAÇÃO" placement="left">
            <button type="button" onClick={handleReset}>
              <FaEraser size={25} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBar>

        <Container mleft="5px">
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
                title="Selecionar Titulos para Negociação"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR TITULOS"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Editar o cadastrar novo borderô"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="NEGOCIAÇÃO"
                  {...a11yProps(1)}
                  icon={<FaHandsHelping size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <BoxItemCad fr="3fr 1fr 1fr">
                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_cli_id"
                      label="Cliente"
                      value={cliente}
                      placeholder="PESQUISA POR CLIENTE"
                      onChange={(e) => setCliente(e || [])}
                      loadOptions={loadOptionsCliente}
                      isClearable
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataIni(new Date(date))}
                      value={pesqDataIni}
                      label="Data Inicial:"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setPesqDataFin(new Date(date))}
                      value={pesqDataFin}
                      label="Data Final:"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerMain className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnConsulta}
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

          {/* ABA NEGOCIAÇÃO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmNegociar" ref={frmNegociar}>
                <BoxItemCad fr="3fr 1fr 1fr 2fr">
                  <AreaComp wd="100">
                    <label>cliente selecionado</label>
                    <Input
                      type="text"
                      name="cliente"
                      readOnly
                      className="input_destaque"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor a negociar</label>
                    <Input
                      type="text"
                      name="total_neg"
                      onChange={maskDecimal}
                      readOnly
                      className="input_destaque"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor negociado</label>
                    <Input
                      type="text"
                      name="total_negociado"
                      onChange={maskDecimal}
                      readOnly
                      className="input_destaque_plus"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="Prazo pagamento"
                      name="tipo_neg"
                      optionsList={optTipoNegociacao}
                      isClearable
                      onChange={(c) => handleChangePrazo(c)}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <Linha />
                <h1>PARÂMETROS DE NEGOCIAÇÃO</h1>
                <BoxItemCad fr="3fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      name="cvto_id"
                      label="Condição de Vencimento"
                      optionsList={optCvto}
                      isClearable
                      placeholder="INFORME"
                      readOnly={tpLivre}
                      zindex="152"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>(%) juro</label>
                    <Input
                      type="text"
                      name="juro"
                      onChange={maskDecimal}
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>(%) desconto`</label>
                    <Input
                      type="text"
                      name="desconto"
                      onChange={maskDecimal}
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>valor</label>
                    <Input
                      type="text"
                      name="valor_neg"
                      onChange={maskDecimal}
                      readOnly={!tpLivre}
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    {visible ? (
                      <DatePickerInput
                        onChangeDate={(date) => setVencimento(new Date(date))}
                        value={vencimento}
                        label="vencimento"
                      />
                    ) : (
                      <div />
                    )}
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerTitulos className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnNeg}
                      rowData={gridNeg}
                      rowSelection="multiple"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      onSelectionChanged={handleSelectGridPesquisa}
                    />
                  </GridContainerTitulos>
                </BoxItemCadNoQuery>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp
                    wd="100"
                    h3talign="center"
                    bckgndh3="#fff"
                    ptop="7px"
                  >
                    <button
                      type="button"
                      onClick={handleConfirmar}
                      className="btnGeralCenter"
                    >
                      <label>CONFIRMAR NEGOCIAÇÃO DE TITULOS</label>
                      <FaSave size={30} color="#EEEFF8" />
                    </button>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Container>
      </ContentConsulta>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="NEGOCIAÇÃO DE TITULOS"
        message="Aguarde Processamento..."
      />
    </>
  );
}

NEGOCIAR_CTAREC.propTypes = {
  tabAtiva: PropTypes.number.isRequired,
};
