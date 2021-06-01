import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import Select from 'react-select';
import { MdClose } from 'react-icons/md';
import {
  FaUserEdit,
  FaSearch,
  FaRegCheckSquare,
  FaDollarSign,
} from 'react-icons/fa';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import DialogInfo from '~/componentes/DialogInfo';
import Popup from '~/componentes/Popup';
import { gridTraducoes } from '~/services/gridTraducoes';
import DatePickerInput from '~/componentes/DatePickerInput';
import TextArea from '~/componentes/TextArea';
import FormSelect from '~/componentes/Select';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import { Container, Panel, ToolBar, GridContainerMain } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  CModal,
  Scroll,
  DivLimitador,
  CCheck,
  Linha,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import Confirmation from '~/componentes/DialogChoice';
import history from '~/services/history';
import { GridCurrencyFormatter } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';

export default function FAT4() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmPesquisa = useRef(null);
  const frmUsuario = useRef(null);
  const frmJustificativa = useRef(null);
  const [pesqDataIni, setPesqDataIni] = useState(moment());
  const [pesqDataFin, setPesqDataFin] = useState(moment());
  const [pesqSituacao, setPesqSituacao] = useState();
  const [loading, setLoading] = useState(false);
  const [openDlgUsuario, setOpenDlgUsuario] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [pesqCli_id, setPesqCliId] = useState([]);
  const [optUsuario, setOptUsuario] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [dlgJustificariva, setDlgJustificativa] = useState(false);

  const toastOptions = {
    autoClose: 4000,
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

  // combo cliente
  const loadOptionsCliente = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();
      const tipo = '0'; // todos menos prospecao
      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=${tipo}&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=${tipo}&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // combo usuario
  async function comboUsuario() {
    try {
      const response = await api.get(`v1/combos/usuarios`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUsuario(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar usuario \n${error}`);
    }
  }

  function handleDashboard() {
    history.push('/fat1', '_blank');
    history.go(0);
  }

  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  async function listaPedido() {
    try {
      setLoading(true);

      const prm = {
        emp_id: null,
        filtraUsr: 'N', // S/N
        usr_id: null,
        numero: document.getElementsByName('pesq_cp_id')[0].value,
        cli_id: pesqCli_id.value,
        data_ini: moment(pesqDataIni).format('YYYY-MM-DD'),
        data_fin: moment(pesqDataFin).format('YYYY-MM-DD'),
        situacao: pesqSituacao, // situacao pedido
        status: null,
        nfce: 'N', // S/N
        cpf_consumidor: null,
        naovalidado: document.getElementById('chbNaoValidado').checked,
        perfil: '0',
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

  async function handleUsuario() {
    if (dataGridPesqSelected.length > 0) {
      frmUsuario.current.setFieldValue('cp_usr_id', '');
      setOpenDlgUsuario(true);
    } else {
      toast.info('Selecione um pedido para validar', toastOptions);
    }
  }

  async function handleChangeUser(c) {
    if (c) {
      setLoading(true);
      const url = `v1/fat/altera_usr_pedido?cp_id=${dataGridPesqSelected[0].cp_id}&usr_id=${c.value}`;
      const response = await api.put(url);
      setLoading(false);
      if (response.data.success) {
        await listaPedido();
        toast.info('Pedido alterado com sucesso!!!', toastOptions);
        setOpenDlgUsuario(false);
      } else {
        toast.error(
          `Erro ao alterar pedido: ${response.data.errors}`,
          toastOptions
        );
      }
    }
  }

  async function handleSituacaoPedido() {
    try {
      if (dataGridPesqSelected.length > 0) {
        if (frmJustificativa.current.getData().justificativa_fina.length < 20) {
          toast.error(
            'INFORME UMA JUSTIFICATIVA COM PELO MENOS 20 CARACTERES...',
            toastOptions
          );
          return;
        }
        const confirmation = await Confirmation.show(
          'Deseja realmente reverter a situação do pedido??'
        );

        if (confirmation) {
          setLoading(true);
          const url = `v1/fat/finalizar_pedido?cp_id=${
            dataGridPesqSelected[0].cp_id
          }&situacao=1&justificativa=${
            frmJustificativa.current.getData().justificativa_fina
          }`;
          const response = await api.put(url);
          setLoading(false);
          if (response.data.success) {
            await listaPedido();
            toast.info('Pedido alterado com sucesso!!!', toastOptions);
            setDlgJustificativa(false);
          } else {
            toast.error(response.data.errors, toastOptions);
          }
        }
      } else {
        toast.info('Selecione um pedido para alterar', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao alterar pedido \n${error}`, toastOptions);
    }
  }

  async function handleCreditoCliente() {
    try {
      if (dataGridPesqSelected.length > 0) {
        if (parseFloat(dataGridPesqSelected[0].cp_credito_cli) > 0) {
          const confirmation = await Confirmation.show(
            'Deseja realmente remover o crédito do cliente??'
          );

          if (confirmation) {
            setLoading(true);

            const url = `v1/fat/remover_credito_cliente/${dataGridPesqSelected[0].cp_id}`;
            const response = await api.put(url);
            setLoading(false);
            if (response.data.success) {
              await listaPedido();
              toast.info('Pedido alterado com sucesso!!!', toastOptions);
            } else {
              toast.error(response.data.errors, toastOptions);
            }
          }
        } else {
          toast.info('Não há crédito para ser devolvido', toastOptions);
        }
      } else {
        toast.info('Selecione um pedido para alterar', toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao alterar pedido \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    comboUsuario();
  }, []);

  // #region GRID CONSULTA PEDIDO =========================

  const gridColumnConsulta = [
    {
      field: 'cp_id',
      headerName: 'Nº PEDIDO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'autor',
      headerName: 'AUTOR PEDIDO',
      width: 250,
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
      field: 'cp_data_devol',
      headerName: 'DTA. DEVOL',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'cp_credito_cli',
      headerName: 'CRÉDITO CLIENTE',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
    },
    {
      field: 'cp_vlr_nf',
      headerName: 'VLR. PEDIDO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      type: 'rightAligned',
      valueFormatter: GridCurrencyFormatter,
    },
    {
      field: 'cp_situacao',
      headerName: 'SITUAÇAO SISTEMA',
      width: 280,
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
        <BootstrapTooltip title="Consultar Pedidos" placement="right">
          <button type="button" onClick={listaPedido}>
            <FaSearch size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Alterar Autoria do Pedido" placement="left">
          <button type="button" onClick={handleUsuario}>
            <FaUserEdit size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Reverter Pedido Finalizado" placement="left">
          <button
            type="button"
            onClick={() => {
              frmJustificativa.current.setFieldValue('justificativa_fina', '');
              setDlgJustificativa(true);
            }}
          >
            <FaRegCheckSquare size={25} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />

        <BootstrapTooltip title="Devolver Crédito do Cliente" placement="left">
          <button type="button" onClick={handleCreditoCliente}>
            <FaDollarSign size={27} color="#fff" />
          </button>
        </BootstrapTooltip>

        <DivLimitador hg="10px" />
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>GERENCIAR PEDIDOS</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Panel lefth1="left" bckgnd="#dae2e5">
            <Form id="frmCapa" ref={frmPesquisa}>
              <h1>PARÂMETROS DE PESQUISA</h1>
              <BoxItemCad fr="2fr 0.8fr 0.8fr 0.8fr 1fr 1.2fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="pesq_cli_id"
                    label="Cliente"
                    value={pesqCli_id}
                    placeholder="PESQUISA POR CLIENTE"
                    onChange={(e) => setPesqCliId(e || [])}
                    loadOptions={loadOptionsCliente}
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
                  <label>Situação do Pedido</label>
                  <Select
                    id="pesq_cp_situacao"
                    options={optSitPedido}
                    onChange={(e) => setPesqSituacao(e ? e.value : null)}
                    isClearable
                    placeholder="SITUAÇAO PEDIDO"
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
        </Scroll>
      </Container>

      {/* popup para alterar usuario */}
      <Slide direction="down" in={openDlgUsuario}>
        <Dialog
          open={openDlgUsuario}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgUsuario(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>ALTERAR AUTORIA DO PEDIDO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgUsuario(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hg="300px">
              <Form id="frmUsuario" ref={frmUsuario}>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="Informe o usuário que deseja alterar"
                      name="cp_usr_id"
                      optionsList={optUsuario}
                      onChange={(c) => handleChangeUser(c)}
                      isClearable
                      placeholder="USUÁRIOS DO SISTEMA"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <Linha />
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="GERENCIAR PEDIDOS"
        message="Aguarde Processamento..."
      />

      {/* popup para despesas adicionais... */}
      <Popup
        isOpen={dlgJustificariva}
        closeDialogFn={() => setDlgJustificativa(false)}
        title="JUSTIFIQUE A AÇÃO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmDespesa" ref={frmJustificativa}>
            <BoxItemCadNoQuery>
              <AreaComp wd="100">
                <label>Justifique a necessidade de modificar o pedido</label>
                <TextArea type="text" name="justificativa_fina" rows="4" />
              </AreaComp>
            </BoxItemCadNoQuery>

            <BoxItemCadNoQuery fr="1fr" ptop="35px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleSituacaoPedido}
                >
                  {loading ? 'Aguarde Processando...' : 'Confirmar'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Form>
        </Panel>
      </Popup>
    </>
  );
}
