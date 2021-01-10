import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import FormSelect from '~/componentes/Select';
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
  CCheck,
} from '~/pages/general.styles';

export default function CONULTA_PEDIDO({ getPedido, borderoCheque, cli_id }) {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [cliente, setCliente] = useState([]);
  const frmPesquisa = useRef(null);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [pesqSituacao, setPesqSituacao] = useState();
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toastOptions = {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optSitPedido = [
    { value: '0', label: 'TODOS' },
    { value: '1', label: 'NORMAL' },
    { value: '2', label: 'DEVOLVIDO' },
    { value: '3', label: 'CANCELADO' },
    { value: '4', label: 'DEVOLUÇÕES' },
    { value: '10', label: 'FINALIZADO' },
  ];

  // representante
  const loadOptionsRepresentante = async (inputText, callback) => {
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
  async function listaPedido() {
    try {
      setLoading(true);

      const prm = {
        emp_id: null,
        filtraUsr: null, // TRATAR NA APIN
        usr_id: null,
        numero: document.getElementsByName('pesq_cp_id')[0].value,
        cli_id: cliente.value || cli_id,
        data_ini: moment(pesqDataIni).format('YYYY-MM-DD'),
        data_fin: moment(pesqDataFin).format('YYYY-MM-DD'),
        situacao: pesqSituacao, // situacao pedido
        status: null,
        nfce: 'N', // S/N
        cpf_consumidor: null,
        naovalidado: document.getElementById('chbNaoValidado').checked,
        perfil: '0',
        borderoCheque,
      };

      const response = await api.post('v1/fat/lista_pedido', prm);
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
        getPedido(dataGridPesqSelected);
        setDataGridPesqSelected([]);
        setGridPesquisa([]);
      } else {
        toast.info('Selecione um pedido para confirmar', toastOptions);
      }
    } catch (error) {
      toast.error(`Erro ao confirmar \n${error}`, toastOptions);
    }
  }

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnConsulta = [
    {
      field: 'cp_id',
      headerName: 'Nº PEDIDO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },

    {
      field: 'cli_razao_social',
      headerName: 'CLIENTE',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cp_data_emis',
      headerName: 'DTA. EMISSÃO',
      width: 130,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },

    {
      field: 'cp_vlr_nf',
      headerName: 'VLR. PEDIDO',
      width: 120,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellClass: 'cell_valor',
    },
  ];

  gridColumnConsulta.push({
    field: 'cp_situacao',
    headerName: 'SITUAÇAO SISTEMA',
    width: 280,
    sortable: true,
    resizable: true,
    filter: true,
    lockVisible: true,
    flex: 1,
  });
  // #endregion

  return (
    <>
      <ContentConsulta getPedido={getPedido}>
        <ToolBar hg="65vh" wd="35px" mleft="5px" ptop="40px">
          <BootstrapTooltip title="CONSULTAR PEDIDOS" placement="right">
            <button type="button" onClick={listaPedido}>
              <FaSearch size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
          <DivLimitador hg="10px" />
          <BootstrapTooltip
            title="CONFIRMAR PEDIDO SELECIONADO"
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
              <BoxItemCad fr="2fr 0.8fr 0.8fr 0.8fr 1fr 1.2fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="pesq_cli_id"
                    label="Cliente"
                    value={cliente}
                    placeholder="PESQUISA POR CLIENTE"
                    onChange={(e) => setCliente(e || [])}
                    loadOptions={loadOptionsRepresentante}
                    isClearable
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Num. Pedido</label>
                  <input
                    type="number"
                    name="pesq_cp_id"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <div>
                    <span>
                      <DatePickerInput
                        onChangeDate={(date) => setPesqDataIni(new Date(date))}
                        value={pesqDataIni}
                        label="Data Inicial:"
                      />
                    </span>
                  </div>
                </AreaComp>
                <AreaComp wd="100">
                  <div>
                    <span>
                      <DatePickerInput
                        onChangeDate={(date) => setPesqDataFin(new Date(date))}
                        value={pesqDataFin}
                        label="Data Final:"
                      />
                    </span>
                  </div>
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Situação do Pedido"
                    name="pesq_cp_situacao"
                    optionsList={optSitPedido}
                    isClearable
                    placeholder="INFORME"
                    zindex="153"
                    onChange={(e) => setPesqSituacao(e ? e.value : null)}
                  />
                </AreaComp>
                <AreaComp wd="100" ptop="25px">
                  <CCheck>
                    <input
                      type="checkbox"
                      id="chbNaoValidado"
                      name="chbNaoValidado"
                      value="S"
                    />
                    <label htmlFor="chbNaoValidado">Pedidos não validado</label>
                  </CCheck>
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery fr="1fr">
                <GridContainerMain className="ag-theme-balham">
                  <AgGridReact
                    columnDefs={gridColumnConsulta}
                    rowData={gridPesquisa}
                    rowSelection="single"
                    animateRows
                    gridOptions={{ localeText: gridTraducoes }}
                    rowClassRules={{
                      'warn-finalizado': function (p) {
                        const finalizado = p.data.cp_situacao;
                        return finalizado === 'PEDIDO FINALIZADO';
                      },
                      'warn-cancelado': function (p) {
                        const cancelado = p.data.cp_situacao;
                        return cancelado === 'CANCELADO';
                      },
                    }}
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
        title="CONSULTANDO PEDIDO"
        message="Aguarde Processamento..."
      />
    </>
  );
}

CONULTA_PEDIDO.propTypes = {
  getPedido: PropTypes.func.isRequired,
  borderoCheque: PropTypes.bool,
  cli_id: PropTypes.string,
};

CONULTA_PEDIDO.defaultProps = {
  borderoCheque: false,
  cli_id: '',
};
