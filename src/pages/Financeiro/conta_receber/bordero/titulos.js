import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import { GridCurrencyFormatter } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  ContainerConsulta,
  Panel,
  ToolBar,
  GridContainerMain,
  ContentConsulta,
} from './styles';

import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitador,
} from '~/pages/general.styles';

export default function CONULTA_TITULOS({ getTitulos }) {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [cliente, setCliente] = useState([]);
  const frmPesquisa = useRef(null);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
  };

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

  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta dos pedidos
  async function listaTitulos() {
    try {
      setLoading(true);
      const response = await api.get(
        `v1/fina/ctarec/titulos_bordero?cli_id=${
          cliente.value || ''
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

  function handleConfirmar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        getTitulos(dataGridPesqSelected);
        setDataGridPesqSelected([]);
        frmPesquisa.current.setFieldValue('pesq_cli_id', '');
        setGridPesquisa([]);
      } else {
        toast.info('Selecione um titulo para confirmar', toastOptions);
      }
    } catch (error) {
      toast.error(`Erro ao confirmar \n${error}`, toastOptions);
    }
  }

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

  return (
    <>
      <ContentConsulta getTitulos={getTitulos}>
        <ToolBar hg="65vh" wd="35px" mleft="5px" ptop="35">
          <BootstrapTooltip
            title="CONSULTAR TITULOS EM ABERTO"
            placement="right"
          >
            <button type="button" onClick={listaTitulos}>
              <FaSearch size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
          <DivLimitador hg="10px" />
          <BootstrapTooltip
            title="CONFIRMAR TITULOS SELECIONADO"
            placement="right"
          >
            <button type="button" onClick={handleConfirmar}>
              <FaCheckCircle size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBar>
        <ContainerConsulta>
          <Panel
            lefth1="left"
            bckgnd="#dae2e5"
            mtop="5px"
            pdding="1px 2px 1px 7px"
          >
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
        </ContainerConsulta>
      </ContentConsulta>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CONSULTANDO TITULOS"
        message="Aguarde Processamento..."
      />
    </>
  );
}

CONULTA_TITULOS.propTypes = {
  getTitulos: PropTypes.func.isRequired,
};
