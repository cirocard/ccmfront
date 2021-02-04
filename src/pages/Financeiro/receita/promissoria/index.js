import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { MdClose } from 'react-icons/md';
import {
  FaSearch,
  FaUserTie,
  FaPrint,
  FaHandHoldingUsd,
  FaRegCheckSquare,
} from 'react-icons/fa';
import moment from 'moment';
import { format } from 'date-fns';
import Popup from '~/componentes/Popup';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import {
  GridCurrencyFormatter,
  maskDecimal,
  toDecimal,
} from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerItens,
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

export default function FINA10() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmPesquisa = useRef(null);
  const frmBaixar = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridItens, setGridItens] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-1, 'day'));
  const [dataFin, setDataFin] = useState(moment().add(30, 'day'));
  const [dataBaixa, setDataBaixa] = useState(moment());
  const [cliente, setCliente] = useState([]);
  const [openDlgBaixar, setOpenDlgBaixar] = useState(false);
  const [parcela, setParcela] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optSituacao = [
    { value: '1', label: 'TITULOS EM ABERTO' },
    { value: '2', label: 'TITULOS BAIXADO' },
    { value: '3', label: 'TITULOS CANCELADOS' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE EMISSAO' },
    { value: '2', label: 'DATA VENCIMENTO' },
    { value: '3', label: 'DATA BAIXA' },
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

  // #endregion

  function handleDashboard() {
    history.push('/fina1');
    history.go(0);
  }

  // listar contas a receber
  async function listarCtaRec() {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();

      const url = `v1/fina/ctarec/listar?cli_id=${
        formPesq.pesq_rec_cli_id || ''
      }&situacao=${formPesq.pesq_rec_situacao}&data_ini=${moment(
        dataIni
      ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
        'YYYY-MM-DD'
      )}&rec_id=${formPesq.pesq_rec_id}&tpData=${
        formPesq.pesq_data || '1'
      }&fpgto=10`;

      const response = await api.get(url);

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

  // grid pesquisa
  const handleSelectGridPesquisa = async (prmGridPesq) => {
    try {
      setLoading(true);
      const gridApi = prmGridPesq.api;
      const selectedRows = gridApi.getSelectedRows();
      setDataGridPesqSelected(selectedRows);

      const response = await api.get(
        `v1/fina/ctarec/listar_parcelas?rec_id=${selectedRows[0].rec_id}`
      );
      if (response.data.success) {
        setGridItens(response.data.retorno);
      } else {
        toast.error(
          `Erro ao consultar parcelas\n${response.data.errors}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar parcelas\n${error}`);
    }
  };

  async function handleImpressao() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);

        const response = await api.get(
          `v1/fina/report/promissoria?rec_id=${dataGridPesqSelected[0].rec_id}`
        );
        const link = response.data;
        setLoading(false);
        window.open(link, '_blank');
      } else {
        toast.info('Selecione uma fatura para imprimir', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao imprimir promissória \n${error}`, toastOptions);
    }
  }

  async function handleBaixar() {
    try {
      const formData = frmBaixar.current.getData();
      if (!formData.reci_valor_pago) {
        toast.error('INFORME O VALOR RECEBIDO PARA CONTINUAR...', toastOptions);
        return;
      }
      setLoading(true);
      const item = {
        reci_rec_emp_id: null,
        reci_rec_id: parcela.reci_rec_id,
        reci_id: parcela.reci_id,
        reci_data_baixa: format(dataBaixa, 'yyyy-MM-dd HH:mm:ss'),
        reci_situacao: '2',
        reci_valor_pago: toDecimal(formData.reci_valor_pago),
        reci_saldo:
          toDecimal(parcela.reci_valor) - toDecimal(formData.reci_valor_pago),
      };
      const retorno = await api.post('v1/fina/ctarec/baixar_parcela', item);

      if (retorno.data.success) {
        await listarCtaRec();
        const response = await api.get(
          `v1/fina/ctarec/listar_parcelas?rec_id=${dataGridPesqSelected[0].rec_id}`
        );
        if (response.data.success) {
          setGridItens(response.data.retorno);
        } else {
          toast.error(
            `Erro ao consultar parcelas\n${response.data.errors}`,
            toastOptions
          );
        }
        setOpenDlgBaixar(false);
        toast.info('Promissória Baixada', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.errors}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao baixar promissória \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    frmPesquisa.current.setFieldValue('pesq_data', '1');
    listarCtaRec();
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'rec_id',
      headerName: 'Nº TITULO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'rec_documento',
      headerName: 'DOCUMENTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
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
      field: 'rec_data_emissao',
      headerName: 'DATA EMISSÃO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_data_baixa',
      headerName: 'DATA BAIXA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_situacao',
      headerName: 'SITUAÇÃO',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },

    {
      field: 'rec_vlr_bruto',
      headerName: 'VLR TITULO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'rec_saldo',
      headerName: 'SALDO',
      width: 130,
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

  // #region GRID ITENS  =========================
  const gridColunaItens = [
    {
      field: 'prode_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip
              title="BAIXAR PARCELA/PROMISSÓRIA"
              placement="top"
            >
              <button
                type="button"
                disabled={false}
                onClick={() => {
                  frmBaixar.current.setFieldValue('reci_valor_pago', '');
                  setParcela(prm.data);
                  setDataBaixa(new Date());
                  setOpenDlgBaixar(true);
                }}
              >
                <FaRegCheckSquare size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'reci_parcela',
      headerName: 'PARCELA',
      width: 100,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      field: 'reci_valor',
      headerName: 'VALOR',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'reci_data_vencimento',
      headerName: 'VENCIMENTO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      field: 'forma_pgto',
      headerName: 'FORMA PAGAMENTO',
      width: 170,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      field: 'reci_data_baixa',
      headerName: 'DATA BAIXA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      field: 'reci_situacao',
      headerName: 'SITUAÇÃO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      field: 'reci_juros',
      headerName: 'JUROS',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },

    {
      field: 'reci_desconto',
      headerName: 'DESCONTO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'reci_saldo',
      headerName: 'SALDO',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#d81e00', fontWeight: 'bold' },
    },
    {
      flex: 1,
    },
  ];

  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="EXECUTAR PESQUISA" placement="left">
          <button type="button" onClick={async () => listarCtaRec()}>
            <FaSearch size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="IMPRESSÃO DE PROMISSÓRIAS" placement="left">
          <button type="button" onClick={handleImpressao}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="20px" />
        <Linha />
        <DivLimitador hg="10px" />
        <BootstrapTooltip
          title="ABRIR CADASTRO DE CONTAS A RECEBER"
          placement="left"
        >
          <button type="button" onClick={() => window.open('/fina9', '_blank')}>
            <FaHandHoldingUsd size={25} color="#fff" />
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
            <h1>IMPRESSÃO DE NOTA PROMISSÓRIA</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Panel
            lefth1="left"
            bckgnd="#dae2e5"
            mtop="1px"
            pdding="5px 7px 7px 10px"
          >
            <Form id="frmPesquisa" ref={frmPesquisa}>
              <BoxItemCad fr="2fr 1fr 1fr 1fr 1fr 1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="pesq_rec_cli_id"
                    label="CLIENTE"
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    value={cliente}
                    onChange={(c) => setCliente(c || [])}
                    loadOptions={loadOptionsCliente}
                    isClearable
                    zindex="153"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Nº LANÇAMENTO</label>
                  <Input
                    type="text"
                    name="pesq_rec_id"
                    placeholder="Nº Lanc."
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="situacao"
                    name="pesq_rec_situacao"
                    optionsList={optSituacao}
                    placeholder="NÃO INFORMADO"
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
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100" txtAlign="center">
                  <h1>PARCELAS GERADA</h1>
                  <GridContainerItens className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColunaItens}
                      rowData={gridItens}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridContainerItens>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>
          </Panel>
        </Scroll>
      </Container>

      {/* popup GERENCIAR CHEQUE... */}
      <Popup
        isOpen={openDlgBaixar}
        closeDialogFn={() => setOpenDlgBaixar(false)}
        title="BAIXAR PROMISSÓRIA"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmBaixar" ref={frmBaixar}>
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <label>Valor Recebido</label>
                <Input
                  type="text"
                  name="reci_valor_pago"
                  className="input_cad"
                  onChange={maskDecimal}
                />
              </AreaComp>
              <AreaComp wd="100">
                <DatePickerInput
                  onChangeDate={(date) => setDataBaixa(new Date(date))}
                  value={dataBaixa}
                  label="Data Baixa"
                />
              </AreaComp>
            </BoxItemCad>

            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleBaixar}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>

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
