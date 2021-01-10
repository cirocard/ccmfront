import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';

import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import moment from 'moment';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { GridCurrencyFormatter } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  ContentConsulta,
  Panel,
  ToolBar,
  GridContainerMain,
  ContainerConsulta,
} from './styles';
import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitador,
} from '~/pages/general.styles';

export default function CONSULTA_CHEQUE({ getCheque, cli_id, bordero_id }) {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmPesquisa = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  // const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  // const [optBanco, setOptBanco] = useState([]);
  const [sacado, setSacado] = useState([]);
  const [optSituacao, setOptSituacao] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment().add(60, 'day'));

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipoCheque = [
    { value: '1', label: 'CHEQUE PRÓPRIO' },
    { value: '2', label: 'CHEQUE RECEBIDO' },
    { value: '3', label: 'CHEQUE RECEBIDO DE TERCEIROS' },
  ];

  const loadOptionsRepresentante = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=23&nome=${descricao}`
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

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 24) {
          // setOptBanco(dados);
        } else if (tab_id === 25) {
          setOptSituacao(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #endregion

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta das operaçoes
  async function listarCheque() {
    try {
      setLoading(true);

      const formPesq = frmPesquisa.current.getData();
      const objPesq = {
        chq_emp_id: null,
        chq_numero: formPesq.pesq_chq_numero,
        chq_emitente: formPesq.pesq_emitente,
        chq_tipo: formPesq.pesq_chq_tipo,
        chq_situacao_id: formPesq.pesq_chq_situacao_id,
        chq_sacado_id: cli_id || formPesq.pesq_chq_sacado_id,
        chq_datacad: moment(dataIni).format('YYYY-MM-DD'),
        chq_vencimento: moment(dataFin).format('YYYY-MM-DD'),
        chq_bordero_id: bordero_id,
      };
      const response = await api.post('v1/fina/cheque/listar_cheque', objPesq);
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

  function handleConfirmar() {
    try {
      if (dataGridPesqSelected.length > 0) {
        getCheque(dataGridPesqSelected);
        setDataGridPesqSelected([]);
        setGridPesquisa([]);
      } else {
        toast.info('Selecione um cheque para confirmar', toastOptions);
      }
    } catch (error) {
      toast.error(`Erro ao confirmar \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    comboGeral(24);
    comboGeral(25);
  }, []);

  // #region GRID CONSULTA  =========================

  const gridColumnPesquisa = [
    {
      field: 'chq_numero',
      headerName: 'Nº CHEQUE',
      width: 130,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'sacado',
      headerName: 'SACADO/RECEBEDOR',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#D32210', fontWeight: 'bold' },
    },
    {
      field: 'chq_valor',
      headerName: 'VALOR',
      width: 140,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },
    {
      field: 'vencimento',
      headerName: 'VENCIMENTO',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'banco',
      headerName: 'BANCO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'chq_emitente',
      headerName: 'EMITENTE',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#000', fontWeight: 'bold' },
    },

    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];

  // #endregion

  return (
    <>
      <ContentConsulta>
        <ToolBar hg="67vh" wd="35px" mleft="5px" ptop="40px">
          <BootstrapTooltip title="CONSULTAR CHEQUE" placement="right">
            <button type="button" onClick={listarCheque}>
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
              <BoxItemCad fr="2fr 2fr 1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="pesq_chq_sacado_id"
                    label="SACADO/RECEBEDOR"
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    value={sacado}
                    onChange={(c) => setSacado(c || [])}
                    loadOptions={loadOptionsRepresentante}
                    isClearable
                    zindex="153"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>emitente de cheque</label>
                  <Input
                    type="text"
                    name="pesq_emitente"
                    placeholder="INFORME NOME OU CPF/CNPJ DO EMITENTE"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="situação do cheque"
                    name="pesq_chq_situacao_id"
                    optionsList={optSituacao}
                    placeholder="NÃO INFORMADO"
                    zindex="153"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr 1fr 1fr">
                <AreaComp wd="100">
                  <label>Nº Cheque</label>
                  <Input
                    type="text"
                    name="pesq_chq_numero"
                    placeholder="Nº CHEQUE"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="tipo de cheque"
                    name="pesq_chq_tipo"
                    optionsList={optTipoCheque}
                    placeholder="NÃO INFORMADO"
                    zindex="153"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataIni(new Date(date))}
                    value={dataIni}
                    label="Vencimento Inicial"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataFin(new Date(date))}
                    value={dataFin}
                    label="Vencimento Final"
                  />
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
        </ContainerConsulta>
      </ContentConsulta>
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

CONSULTA_CHEQUE.propTypes = {
  getCheque: PropTypes.func.isRequired,
  bordero_id: PropTypes.number.isRequired,
  cli_id: PropTypes.string,
};

CONSULTA_CHEQUE.defaultProps = {
  cli_id: '',
};
