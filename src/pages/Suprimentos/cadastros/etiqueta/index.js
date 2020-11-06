import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaTrashAlt,
  FaRegAddressCard,
} from 'react-icons/fa';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import Popup from '~/componentes/Popup';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { RetirarMascara, maskDecimal, toDecimal } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Content,
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
  CModal,
} from '~/pages/general.styles';

export default function SUPR6() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmEtiqueta = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridEtiqueta, setGridEtiqueta] = useState([]);
  const [optTab1, setOptTab1] = useState([]);
  const [optTab2, setOptTab2] = useState([]);
  const [optCondVcto, setOptCondVcto] = useState([]);
  const [produto, setProduto] = useState([]);
  const [openDlgGrade, setOpenDlgGrade] = useState(false);
  const [titleDlgGrade, setTitleDlgGrade] = useState('');
  const [gridGrade, setGridGrade] = useState([]);
  let selectedGrid = [];
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optModelo = [
    { value: '1', label: 'MOD 1 - 1 ETIQUETA POR LINHA' },
    { value: '2', label: 'MOD 2 - 3 COL. 3 X 1.5 CM' },
    { value: '3', label: 'MOD 3 - 3 COL. 3.2 X 1.8 CM' },
    { value: '4', label: 'MOD 4 - 2 COL. C/ INVERSÃO' },
    { value: '5', label: 'MOD 5 - 3 COL. 3.5 X 2 CM' },
    { value: '6', label: 'MOD 6 - 2 COL. C/ 2 PREÇO' },
  ];

  // options combo produto
  const loadOptions = async (inputText, callback) => {
    if (frmEtiqueta.current) {
      const formData = frmEtiqueta.current.getData();
      if (formData.tabPrincipal && formData.tabSecundaria) {
        const descricao = inputText.toUpperCase();
        if (descricao.length > 2) {
          const response = await api.get(
            `v1/combos/produto?descricao=${descricao}`
          );

          callback(
            response.data.retorno.map((i) => ({
              value: i.value,
              label: i.label,
            }))
          );
        }
      } else {
        toast.warning(
          'ATENÇÃO!! INFORME AS TABELAS DE PREÇOS PARA CONTINUAR...',
          toastOptions
        );
      }
    }
  };

  // combo condiçao vencimento
  async function getComboCondVcto() {
    try {
      const response = await api.get(`v1/combos/condvcto`);
      const dados = response.data.retorno;
      if (dados) {
        setOptCondVcto(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Condição de vencimento \n${error}`);
    }
  }

  // combo tabela de preço
  async function getComboTabPreco() {
    try {
      const response = await api.get('v1/combos/tabpreco');
      const dados = response.data.retorno;
      if (dados) {
        setOptTab1(dados);
        setOptTab2(dados);
      }
    } catch (error) {
      toast.error(`Houve um erro ao buscar tabelas de preço \n${error}`);
    }
  }

  function handleDashboard() {
    history.push('/supr1', '_blank');
  }

  async function handleNovoCadastro() {
    setGridEtiqueta([]);
    setGridGrade([]);
  }

  async function handleSubmit() {
    try {
      const formData = frmEtiqueta.current.getData();
      if (!formData.modelo) {
        toast.warning(
          'INFORME O MODELO DE ETIQUETA ANTES DE SALVAR',
          toastOptions
        );
        return;
      }
      if (gridEtiqueta.length > 0) {
        setLoading(true);
        const etiqueta = [];

        gridEtiqueta.forEach((e) => {
          const obj = {
            emp_id: null,
            prod_id: e.prode_id,
            login: null,
            produto: e.prod_descricao,
            descricao: e.descricao,
            tabpreco1: formData.tabPrincipal,
            tabpreco2: formData.tabSecundaria,
            preco1: 0,
            preco2: 0,
            qtd: e.qtd,
            modelo: formData.modelo,
          };
          etiqueta.push(obj);
        });

        const retorno = await api.post(
          `v1/supr/produto/etiqueta?condVcto=${formData.condVcto}`,
          etiqueta
        );

        if (retorno.data.success) {
          toast.success(
            'Etiquetas Cadastradas com sucesso!!! Acesse o impressor de etiquetas',
            toastOptions
          );
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
        setLoading(false);
      } else {
        toast.warning('NÃO NÁ ITENS SELECIONADOS PARA SALVAR', toastOptions);
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
    }
  }

  async function handleAddItens() {
    try {
      const selected = gridGrade.filter((g) => g.etiquet !== 'NÃO INFORMADO');
      selectedGrid = [];

      selected.forEach((s) => {
        const obj = {
          prod_id: s.prod_id,
          prode_id: s.prode_id,
          prod_referencia: s.prod_referencia,
          descricao: s.etiquet.toUpperCase(),
          qtd: s.quantidade,
          classific1: s.classific1,
          classific2: s.classific2,
          classific3: s.classific3,
          prod_descricao: s.prod_descricao,
        };
        selectedGrid.push(...gridEtiqueta, obj);
      });

      setGridEtiqueta(selectedGrid);
      setOpenDlgGrade(false);
      setProduto([]);
    } catch (error) {
      toast.error(`Houve um erro ao confirmar itens \n${error}`);
    }
  }

  const handleExcluirItem = async (prm) => {
    setGridEtiqueta((prev) => {
      prev = prev.filter((item) => item !== prm);
      return prev;
    });
  };

  // change select  produto - abrir popup grade
  async function handleChangeSelectProduto(p) {
    try {
      setProduto(p);
      if (p.value) {
        setOpenDlgGrade(true);
        const tab_id = frmEtiqueta.current.getData().tabPrincipal;
        const url = `v1/fat/grade_produto?prod_id=${p.value}&marca_id=&classific1=&classific2=&classific3=&tab_id=${tab_id}`;
        const response = await api.get(url);
        const dados = response.data.retorno;
        if (dados) {
          setGridGrade(dados);
          setTitleDlgGrade(
            `ITEM SELECIONADO: ${p.label}    ::    (F10 PARA CONFIRMAR) `
          );
        }
      }
    } catch (error) {
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  useEffect(() => {
    getComboCondVcto();
    getComboTabPreco();
  }, []);

  // #region ========= DEFINIÇAO COLUNA DAS GRIDS ======================

  const gridColumnEtiqueta = [
    {
      field: 'prode_id',
      headerName: 'AÇÕES',
      width: 70,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="EXCLUIR PRODUTO" placement="top">
              <button type="button" onClick={() => handleExcluirItem(prm.data)}>
                <FaTrashAlt size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'prod_referencia',
      headerName: 'REFERÊNCIA',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },

    {
      field: 'descricao',
      headerName: 'DESCRIÇÃO',
      width: 330,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'qtd',
      headerName: 'QTD. IMPRESSÃO',
      width: 140,
      sortable: false,
      resizable: true,
      filter: false,
      lockVisible: true,
      cellStyle: { color: '#036302', fontWeight: 'bold' },
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFIC. 2',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFIC. 3',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const autoGroupColumnDef = { minWidth: 200 };
  const gridColumnGrade = [
    {
      field: 'forn_razao_social',
      headerName: 'FORNECEDOR',
      width: 300,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'etiquet',
      headerName: 'DESCRIÇÃO DA ETIQUETA',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      editable: true,
      lockVisible: true,
      cellStyle: { color: '#D56C02', fontWeight: 'bold' },
    },
    {
      field: 'quantidade',
      headerName: 'QTD. IMPRESSÃ0',
      width: 140,
      sortable: true,
      resizable: true,
      editable: true,
      lockVisible: true,
      cellStyle: { color: '#D56C02', fontWeight: 'bold' },
    },
    {
      field: 'marca',
      headerName: 'MARCA',
      width: 150,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFIC. 1',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFIC. 2',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFIC. 3',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
  ];
  // #endregion

  return (
    <>
      <ToolBar hg="100%" wd="40px">
        <BootstrapTooltip title="NOVO CADASTRO" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="SALVAR CADASTRO ETIQUETA" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>

      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE ETIQUETAS</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Content>
            <Form id="frmEtiqueta" ref={frmEtiqueta}>
              <BoxItemCad fr="1fr 1fr 2fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="Tabela Principal"
                    name="tabPrincipal"
                    optionsList={optTab1}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Tabela Secundária"
                    name="tabSecundaria"
                    optionsList={optTab2}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Cond. Vencimento"
                    name="condVcto"
                    optionsList={optCondVcto}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 2fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="Modelo da Etiqueta"
                    name="modelo"
                    optionsList={optModelo}
                    placeholder="NÃO INFORMADO"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="prod_id"
                    label="Informe o Produto"
                    value={produto}
                    placeholder="NÃO INFORMADO"
                    onChange={(p) => handleChangeSelectProduto(p || [])}
                    loadOptions={loadOptions}
                    isClearable
                  />
                </AreaComp>
              </BoxItemCad>
              <h1>ITENS SELECIONADOS</h1>
              <BoxItemCadNoQuery fr="1fr">
                <GridContainerMain className="ag-theme-balham">
                  <AgGridReact
                    columnDefs={gridColumnEtiqueta}
                    rowData={gridEtiqueta}
                    rowSelection="single"
                    animateRows
                    gridOptions={{ localeText: gridTraducoes }}
                  />
                </GridContainerMain>
              </BoxItemCadNoQuery>
            </Form>
          </Content>
        </Scroll>
      </Container>

      {/* popup grade produto */}
      <Popup
        isOpen={openDlgGrade}
        closeDialogFn={() => setOpenDlgGrade(false)}
        title={titleDlgGrade}
        size="lg"
      >
        <Scroll>
          <CModal wd="100%" hd="90%">
            <KeyboardEventHandler
              handleKeys={['F10']}
              onKeyEvent={handleAddItens}
            >
              <BoxItemCadNoQuery fr="1fr">
                <GridContainerItens className="ag-theme-balham">
                  <AgGridReact
                    columnDefs={gridColumnGrade}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowData={gridGrade}
                    rowSelection="single"
                    animateRows
                    gridOptions={{ localeText: gridTraducoes }}
                  />
                </GridContainerItens>
              </BoxItemCadNoQuery>
            </KeyboardEventHandler>
          </CModal>
        </Scroll>
      </Popup>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="GERAÇÃO DE ETIQUETAS"
        message="Aguarde Processamento..."
      />
    </>
  );
}
