import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';

import KeyboardEventHandler from 'react-keyboard-event-handler';
import { AgGridReact } from 'ag-grid-react';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import { ApiService, ApiTypes } from '~/services/api';
import Input from '~/componentes/Input';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  ContentConsulta,
  Panel,
  ContainerConsulta,
  GridContainer,
} from './styles';
import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
} from '~/pages/general.styles';

export default function CONSULTA_PRODUTO() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmProduto = useRef(null);
  const [loading, setLoading] = useState(false);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [produto, setProduto] = useState([]);
  const [gridGrade, setGridGrade] = useState([]);
  const [remumoItens, setResumoItens] = useState('');

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  async function getComboTabPreco() {
    try {
      const response = await api.get('v1/combos/tabpreco');
      const dados = response.data.retorno;
      if (dados) {
        setOptTabPreco(dados);
      }
    } catch (error) {
      toast.error(
        `Houve um erro ao buscar tabelas de preço \n${error}`,
        toastOptions
      );
    }
  }

  // produto
  const loadOptionsProduto = async (inputText, callback) => {
    if (frmProduto.current.getData().tab_preco) {
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
        'ATENÇÃO!! INFORME A TABELA DE PREÇO PARA CONTINUAR...',
        toastOptions
      );
    }
  };

  // #endregion

  async function handleChangeSelectProduto(p) {
    try {
      setProduto(p);
      if (p.value) {
        const tab_id = frmProduto.current.getData().tab_preco;
        const url = `v1/fat/grade_produto?prod_id=${p.value}&marca_id=&classific1=&classific2=&classific3=&tab_id=${tab_id}`;

        const response = await api.get(url);
        const dados = response.data.retorno;
        if (dados) {
          setResumoItens(
            `REFERÊNCIA: ${dados[0].prod_referencia}  -  DESCRIÇÃO: ${dados[0].prod_descricao}`
          );
          setGridGrade(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  async function exitBarcode() {
    try {
      const { barcode, tab_preco } = frmProduto.current.getData();
      if (barcode) {
        if (barcode.length === 12) {
          let prode = barcode.substring(2, 11);
          prode = parseInt(prode, 10);
          if (tab_preco) {
            setLoading(true);
            const url = `v1/fat/grade_produto?prod_id=&marca_id=&classific1=&classific2=&classific3=&tab_id=${tab_preco}&prode_id=${prode}`;
            const response = await api.get(url);
            const dados = response.data.retorno;
            if (dados) {
              setResumoItens(
                `REFERÊNCIA: ${dados[0].prod_referencia}  -  DESCRIÇÃO: ${dados[0].prod_descricao}`
              );
              setGridGrade(dados);
            }
            frmProduto.current.setFieldValue('barcode', '');
          } else {
            toast.warning(
              'ATENÇÃO!! INFORME A TABELA DE PREÇOS PARA CONTINUAR...',
              toastOptions
            );
          }

          setLoading(false);
        } else {
          toast.error('O código informado não é valido', toastOptions);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao consultar Itens\n${error}`);
    }
  }

  useEffect(() => {
    getComboTabPreco();
  }, []);

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
      field: 'marca',
      headerName: 'MARCA',
      width: 150,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'prode_saldo',
      headerName: 'SALDO ATUAL',
      width: 130,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#0C3C0D', fontWeight: 'bold' },
    },
    {
      field: 'tab_preco_final',
      headerName: 'PREÇO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellStyle: { color: '#0C3C0D', fontWeight: 'bold' },
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
    {
      flex: 1,
    },
  ];

  return (
    <>
      <ContentConsulta>
        <ContainerConsulta>
          <Panel
            lefth1="left"
            bckgnd="#dae2e5"
            mtop="5px"
            pdding="1px 2px 1px 7px"
          >
            <Form id="frmProduto" ref={frmProduto}>
              <BoxItemCad fr="1fr 2fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    name="tab_preco"
                    label="Tabela de Preços"
                    optionsList={optTabPreco}
                    isClearable
                    placeholder="INFORME A TABELA"
                    zindex="153"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="prod_id"
                    label="Produto"
                    value={produto}
                    placeholder="INFORME O PRODUTO"
                    onChange={(p) => handleChangeSelectProduto(p || [])}
                    loadOptions={loadOptionsProduto}
                    isClearable
                    zindex="152"
                  />
                </AreaComp>

                <AreaComp wd="100">
                  <label>Código de Barras</label>

                  <KeyboardEventHandler
                    handleKeys={['enter', 'tab']}
                    onKeyEvent={() => exitBarcode()}
                  >
                    <Input
                      type="number"
                      name="barcode"
                      className="input_cad"
                      placeholder="LOCALIZAR POR CODIGO DE BARRAS"
                    />
                  </KeyboardEventHandler>
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100" h3talign="center" bckgndh3="#fff" ptop="7px">
                  <h3>{remumoItens}</h3>
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <GridContainer className="ag-theme-balham">
                  <AgGridReact
                    columnDefs={gridColumnGrade}
                    rowData={gridGrade}
                    rowSelection="single"
                    animateRows
                    gridOptions={{ localeText: gridTraducoes }}
                  />
                </GridContainer>
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
        title="BASE CÁLCULO COMISSÕES"
        message="Aguarde Processamento..."
      />
    </>
  );
}
