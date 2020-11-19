import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import { MdClose } from 'react-icons/md';
import {
  FaSave,
  FaSearch,
  FaPlusCircle,
  FaFolderPlus,
  FaPencilAlt,
  FaUserEdit,
  FaExchangeAlt,
  FaCubes,
  FaListAlt,
  FaMoneyBill,
  FaTrash,
  FaEdit,
} from 'react-icons/fa';
import moment from 'moment';
import { format } from 'date-fns';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DatePickerInput from '~/componentes/DatePickerInput';
import DialogInfo from '~/componentes/DialogInfo';
import { gridTraducoes } from '~/services/gridTraducoes';
import TabPanel from '~/componentes/TabPanel';
import Input from '~/componentes/Input';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { a11yProps, maskDecimal, toDecimal } from '~/services/func.uteis';
import { ApiService, ApiTypes } from '~/services/api';
import {
  Container,
  Panel,
  ToolBar,
  GridContainerMain,
  GridContainerForn,
  GridContainerClassific,
  GridContainerEstoque,
} from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  DivLimitador,
  ToolBarGrid,
  CModal,
} from '~/pages/general.styles';

export default function SUPR4() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [valueTab, setValueTab] = useState(0);
  const frmPesquisa = useRef(null);
  const frmCadastro = useRef(null);
  const frmClassificacao = useRef(null);
  const frmChanceForn = useRef(null);
  const frmTrocaForn = useRef(null);
  const frmTabPreco = useRef(null);
  const frmEstoque = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gridPesquisa, setGridPesquisa] = useState([]);
  const [gridFornec, setGridFornec] = useState([]);
  const [gridTabPreco, setGridTabPreco] = useState([]);
  const [gridEstoque, setGridEstoque] = useState([]);
  const [gridClassific1, setGridClassific1] = useState([]);
  const [gridClassific2, setGridClassific2] = useState([]);
  const [gridClassific3, setGridClassific3] = useState([]);
  const [dataGridPesqSelected, setDataGridPesqSelected] = useState([]);
  const [gridApiPesquisa, setGridApiPesquisa] = useState([]);
  const [openDlgEditaFornec, setOpenDlgEditaFornec] = useState(false);
  const [openDlgTrocaFornec, setOpenDlgTrocaFornec] = useState(false);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [optCategoria, setOptCategoria] = useState([]);
  const [optEspecie, setOptEspecie] = useState([]);
  const [optUnidade, setOptUnidade] = useState([]);
  const [optMarca, setOptMarca] = useState([]);
  const [optClassific1, setOptClassific1] = useState([]);
  const [optClassific2, setOptClassific2] = useState([]);
  const [optClassific3, setOptClassific3] = useState([]);
  const [fornecedor, setFornecedor] = useState([]);
  const [changeFornec, setChangeFornec] = useState([]);
  const [fornProduto, setFornProduto] = useState([]);
  const [infProd, setInfProd] = useState('');
  const [dataVigencia, setDataVigencia] = useState(new Date());
  const [dataValidade, setDataValidade] = useState(new Date());

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optSituacao = [
    { value: '1', label: 'ATIVO' },
    { value: '2', label: 'INATIVO' },
  ];

  const optOrigem = [
    { value: '0', label: 'NACIONAL' },
    { value: '1', label: 'ESTRANGEIRA IMPORTAÇÃO DIRETA' },
    { value: '2', label: 'ESTRANGEIRA ADQUIRIDA NO MERCADO INTERNO' },
    { value: '3', label: 'NACIONAL C/ CONTEUDO DE IMP ENTRE 40% E 70%' },
    { value: '4', label: 'NACIONAL C/ AJUSTES' },
    { value: '5', label: 'NACIONAL C/ CONTEUDO DE IMPORTAÇÃO INFERIOR A 40%' },
    { value: '6', label: 'ESTRANGEIRA IMP DIRETA SEM SIMILAR NACIONAL' },
  ];

  const optTpProduto = [
    { value: '1', label: 'MATÉRIA PRIMA' },
    { value: '2', label: 'PRODUTO ACABADO' },
  ];

  const optIndEscala = [
    { value: '0', label: 'SEM OCORRÊNCIA' },
    { value: 'S', label: 'PRODUZIDO EM ESCALA RELEVANTE' },
    { value: 'N', label: 'PRODUZIDO EM ESCALA NÃO RELEVANTE' },
  ];

  // #region COMBO ========================

  // tabela de preços
  async function getComboTabPreco() {
    try {
      const response = await api.get('v1/combos/tabpreco');
      const dados = response.data.retorno;
      if (dados) {
        setOptTabPreco(dados);
      }
    } catch (error) {
      toast.error(`Houve um erro ao buscar tabelas de preço \n${error}`);
    }
  }

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 15) {
          setOptCategoria(dados);
        } else if (tab_id === 10) {
          setOptEspecie(dados);
        } else if (tab_id === 9) {
          setOptMarca(dados);
        } else if (tab_id === 12) {
          setOptClassific1(dados);
        } else if (tab_id === 13) {
          setOptClassific2(dados);
        } else if (tab_id === 14) {
          setOptClassific3(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // combo unidades
  async function comboUnidade() {
    try {
      const response = await api.get(`v1/combos/unidades`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUnidade(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // combo fornecedor
  const loadOptionsFornec = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();
      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_fornecedor?valor=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // #endregion

  // #region SCHEMA VALIDATIONS =====================
  const schemaCad = Yup.object().shape({
    prod_descricao: Yup.string().required('(??)'),
    prod_especie_id: Yup.string().required('(??)'),
    prod_ncm: Yup.string().required('(??)'),
    prod_unidade_venda: Yup.string().required('(??)'),
    prod_origem_merc: Yup.string().required('(??)'),
    prod_categoria_id: Yup.string().required('(??)'),
    prod_un_trib: Yup.string().required('(??)'),
    prod_situacao: Yup.string().required('(??)'),
    prod_tipo: Yup.string().required('(??)'),
    prod_ind_escala: Yup.string().required('(??)'),
  });

  const schemaClassific = Yup.object().shape({
    prode_forn_id: Yup.string().required('(??)'),
    prode_marca_id: Yup.string().required('(??)'),
  });

  // #endregion

  function handleDashboard() {
    history.push('/supr1', '_blank');
  }

  // grid pesquisa
  const handleSelectGridPesquisa = (prmGridPesq) => {
    const gridApi = prmGridPesq.api;
    const selectedRows = gridApi.getSelectedRows();
    setDataGridPesqSelected(selectedRows);
  };

  // fazer consulta produto
  async function listarProduto(limit) {
    try {
      setLoading(true);
      const formPesq = frmPesquisa.current.getData();
      const response = await api.get(
        `v1/supr/produto/listagem?prod_descricao=${
          formPesq.pesq_prod_descricao
        }&prode_forn_id=${fornecedor.value || ''}&prod_categoria_id=${
          formPesq.pesq_prod_categoria_id
        }&prod_situacao=${formPesq.pesq_prod_situacao || '1'}&prod_referencia=${
          formPesq.pesq_prod_referencia
        }&limit=${limit || 200}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridPesquisa(dados);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cliente CRM \n${error}`);
    }
  }

  // consulta grid fornecedor aba classificacao
  async function getGridFornec(prod_id) {
    try {
      const response = await api.get(
        `v1/supr/produto/grid_fornec?prod_id=${prod_id}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridFornec(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // grid inf estoque
  async function getGridInfEstoque(prod_id) {
    try {
      const response = await api.get(
        `v1/supr/produto/inf_estoque?prod_id=${prod_id}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridEstoque(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // grid tabela de preços
  async function getGridTabPreco(prod_id) {
    try {
      const response = await api.get(
        `v1/supr/produto/tab_preco?prod_id=${prod_id}&tab_ativo=S&tab_id=`
      );
      const dados = response.data.retorno;
      if (dados) {
        setGridTabPreco(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // grid classificação na aba classificacao
  async function getGridClassific(prod_id, classific) {
    try {
      const response = await api.get(
        `v1/supr/produto/grid_classific?prod_id=${prod_id}&classific=${classific}`
      );
      const dados = response.data.retorno;
      if (dados) {
        if (classific.toString() === '1') setGridClassific1(dados);
        else if (classific.toString() === '2') setGridClassific2(dados);
        else if (classific.toString() === '3') setGridClassific3(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('prod_id', '');
    frmCadastro.current.setFieldValue('prod_descricao', '');
    frmCadastro.current.setFieldValue('prod_referencia', '');
    frmCadastro.current.setFieldValue('prod_especie_id', '');
    frmCadastro.current.setFieldValue('prod_cod_ean', '');
    frmCadastro.current.setFieldValue('prod_ncm', '');
    frmCadastro.current.setFieldValue('prod_unidade_venda', '');
    frmCadastro.current.setFieldValue('prod_origem_merc', '');
    frmCadastro.current.setFieldValue('prod_cest', '');
    frmCadastro.current.setFieldValue('prod_peso_b', '');
    frmCadastro.current.setFieldValue('prod_peso_l', '');
    frmCadastro.current.setFieldValue('prod_fator_conv', '');
    frmCadastro.current.setFieldValue('prod_conv_litragem', '');
    frmCadastro.current.setFieldValue('prod_conv_caixa', '');
    frmCadastro.current.setFieldValue('prod_aliq_icms', '');
    frmCadastro.current.setFieldValue('prod_aliq_icms_interestadual', '');
    frmCadastro.current.setFieldValue('prod_aliq_icms_red', '');
    frmCadastro.current.setFieldValue('prod_aliq_icms_import', '');
    frmCadastro.current.setFieldValue('prod_aliq_subst', '');
    frmCadastro.current.setFieldValue('prod_base_subst', '');
    frmCadastro.current.setFieldValue('prod_pauta_subst', '');
    frmCadastro.current.setFieldValue('prod_aliq_red_subst', '');
    frmCadastro.current.setFieldValue('prod_mva', '');
    frmCadastro.current.setFieldValue('prod_aliq_ipi', '');
    frmCadastro.current.setFieldValue('prod_pauta_ipi', '');
    frmCadastro.current.setFieldValue('prod_pauta_pis', '');
    frmCadastro.current.setFieldValue('prod_pauta_cofins', '');
    frmCadastro.current.setFieldValue('prod_ex_tipi', '');
    frmCadastro.current.setFieldValue('prod_ind_escala', '0');
    frmCadastro.current.setFieldValue('prod_cbnef', '');
    frmCadastro.current.setFieldValue('prod_tipo', '2');
    frmCadastro.current.setFieldValue('prod_estoque_minimo', '');
    frmCadastro.current.setFieldValue('prod_categoria_id', '');
    frmCadastro.current.setFieldValue('prod_un_trib', '');
    frmCadastro.current.setFieldValue('prod_situacao', '1');

    // classificação

    frmClassificacao.current.setFieldValue('prode_forn_id', '');
    frmClassificacao.current.setFieldValue('prode_forn_referencia', '');
    frmClassificacao.current.setFieldValue('prode_desc_fornec', '');
    frmClassificacao.current.setFieldValue('prode_marca_id', '');
    setGridFornec([]);
    setGridClassific1([]);
    setGridClassific2([]);
    setGridClassific3([]);

    setDataGridPesqSelected([]);
  };

  async function handleNovoCadastro() {
    setValueTab(1);
    limpaForm();
    document.getElementsByName('prod_referencia')[0].focus();
  }

  async function handleEdit() {
    try {
      if (dataGridPesqSelected.length > 0) {
        setLoading(true);
        let x;
        frmCadastro.current.setFieldValue(
          'prod_id',
          dataGridPesqSelected[0].prod_id
        );
        frmCadastro.current.setFieldValue(
          'prod_referencia',
          dataGridPesqSelected[0].prod_referencia
        );
        setInfProd(
          `PRODUTO: ${dataGridPesqSelected[0].prod_descricao} :: REF.: ${dataGridPesqSelected[0].prod_referencia}`
        );
        frmCadastro.current.setFieldValue(
          'prod_descricao',
          dataGridPesqSelected[0].prod_descricao
        );
        if (dataGridPesqSelected[0].prod_especie_id) {
          x = optEspecie.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].prod_especie_id.toString()
          );

          frmCadastro.current.setFieldValue('prod_especie_id', x);
        } else frmCadastro.current.setFieldValue('prod_especie_id', '');

        if (dataGridPesqSelected[0].prod_categoria_id) {
          x = optCategoria.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].prod_categoria_id.toString()
          );

          frmCadastro.current.setFieldValue('prod_categoria_id', x);
        } else frmCadastro.current.setFieldValue('prod_categoria_id', '');

        frmCadastro.current.setFieldValue(
          'prod_origem_merc',
          dataGridPesqSelected[0].prod_origem_merc
        );

        if (dataGridPesqSelected[0].prod_unidade_venda) {
          x = optUnidade.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].prod_unidade_venda.toString()
          );

          frmCadastro.current.setFieldValue('prod_unidade_venda', x);
        } else frmCadastro.current.setFieldValue('prod_unidade_venda', '');

        if (dataGridPesqSelected[0].prod_un_trib) {
          x = optUnidade.find(
            (op) =>
              op.value.toString() ===
              dataGridPesqSelected[0].prod_un_trib.toString()
          );

          frmCadastro.current.setFieldValue('prod_un_trib', x);
        } else frmCadastro.current.setFieldValue('prod_un_trib', '');

        frmCadastro.current.setFieldValue(
          'prod_cod_ean',
          dataGridPesqSelected[0].prod_cod_ean
        );
        frmCadastro.current.setFieldValue(
          'prod_ncm',
          dataGridPesqSelected[0].prod_ncm
        );
        frmCadastro.current.setFieldValue(
          'prod_estoque_minimo',
          dataGridPesqSelected[0].prod_estoque_minimo
        );
        frmCadastro.current.setFieldValue(
          'prod_tipo',
          dataGridPesqSelected[0].prod_tipo
        );
        frmCadastro.current.setFieldValue(
          'prod_peso_b',
          dataGridPesqSelected[0].prod_peso_b
        );
        frmCadastro.current.setFieldValue(
          'prod_peso_l',
          dataGridPesqSelected[0].prod_peso_l
        );

        frmCadastro.current.setFieldValue(
          'prod_fator_conv',
          dataGridPesqSelected[0].prod_fator_conv
        );
        frmCadastro.current.setFieldValue(
          'prod_conv_litragem',
          dataGridPesqSelected[0].prod_conv_litragem
        );
        frmCadastro.current.setFieldValue(
          'prod_conv_caixa',
          dataGridPesqSelected[0].prod_conv_caixa
        );
        frmCadastro.current.setFieldValue(
          'prod_cest',
          dataGridPesqSelected[0].prod_cest
        );
        frmCadastro.current.setFieldValue(
          'prod_cbnef',
          dataGridPesqSelected[0].prod_cbnef
        );

        frmCadastro.current.setFieldValue(
          'prod_ind_escala',
          dataGridPesqSelected[0].prod_ind_escala
        );
        frmCadastro.current.setFieldValue(
          'prod_ex_tipi',
          dataGridPesqSelected[0].prod_ex_tipi
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_icms',
          dataGridPesqSelected[0].prod_aliq_icms
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_icms_interestadual',
          dataGridPesqSelected[0].prod_aliq_icms_interestadual
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_icms_red',
          dataGridPesqSelected[0].prod_aliq_icms_red
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_icms_import',
          dataGridPesqSelected[0].prod_aliq_icms_import
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_subst',
          dataGridPesqSelected[0].prod_aliq_subst
        );

        frmCadastro.current.setFieldValue(
          'prod_base_subst',
          dataGridPesqSelected[0].prod_base_subst
        );

        frmCadastro.current.setFieldValue(
          'prod_pauta_subst',
          dataGridPesqSelected[0].prod_pauta_subst
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_red_subst',
          dataGridPesqSelected[0].prod_aliq_red_subst
        );

        frmCadastro.current.setFieldValue(
          'prod_mva',
          dataGridPesqSelected[0].prod_mva
        );

        frmCadastro.current.setFieldValue(
          'prod_aliq_ipi',
          dataGridPesqSelected[0].prod_aliq_ipi
        );

        frmCadastro.current.setFieldValue(
          'prod_pauta_ipi',
          dataGridPesqSelected[0].prod_pauta_ipi
        );

        frmCadastro.current.setFieldValue(
          'prod_pauta_pis',
          dataGridPesqSelected[0].prod_pauta_pis
        );

        frmCadastro.current.setFieldValue(
          'prod_pauta_cofins',
          dataGridPesqSelected[0].prod_pauta_cofins
        );

        frmCadastro.current.setFieldValue(
          'prod_situacao',
          dataGridPesqSelected[0].prod_situacao
        );

        if (dataGridPesqSelected[0].prod_id) {
          await getGridFornec(dataGridPesqSelected[0].prod_id);
          await getGridClassific(dataGridPesqSelected[0].prod_id, '1');
          await getGridClassific(dataGridPesqSelected[0].prod_id, '2');
          await getGridClassific(dataGridPesqSelected[0].prod_id, '3');
          await getGridInfEstoque(dataGridPesqSelected[0].prod_id);
          await getGridTabPreco(dataGridPesqSelected[0].prod_id);
        }
        setValueTab(1);
        setLoading(false);
      } else if (valueTab === 0) {
        setValueTab(0);
        toast.info(
          `Selecione um produto para consultar o cadastro ou Adicionar novo para um novo cadastro`,
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao listar cadastro \n${error}`, toastOptions);
    }
  }

  function getProdEstoque() {
    try {
      const cadastro = frmCadastro.current.getData();
      const estoque = [];
      let objEst;
      if (gridFornec.length > 0) {
        gridFornec.forEach((f) => {
          if (gridClassific1.length > 0) {
            gridClassific1.forEach((c1) => {
              if (gridClassific2.length > 0) {
                gridClassific2.forEach((c2) => {
                  if (gridClassific3.length > 0) {
                    gridClassific3.forEach((c3) => {
                      objEst = {
                        prode_prod_id: cadastro.prod_id,
                        prode_forn_id: f.prode_forn_id,
                        prode_forn_referencia: f.prode_forn_referencia,
                        prode_desc_fornec: toDecimal(f.prode_desc_fornec),
                        prode_marca_id: f.prode_marca_id,
                        prode_classific1_id: c1.value,
                        prode_classific2_id: c2.value,
                        prode_classific3_id: c3.value,
                        prode_prod_emp_id: c3.prode_prod_emp_id || null,
                      };

                      estoque.push(objEst);
                    });
                  } else {
                    objEst = {
                      prode_prod_id: cadastro.prod_id,

                      prode_forn_id: f.prode_forn_id,
                      prode_forn_referencia: f.prode_forn_referencia,
                      prode_desc_fornec: toDecimal(f.prode_desc_fornec),
                      prode_marca_id: f.prode_marca_id,
                      prode_classific1_id: c1.value,
                      prode_classific2_id: c2.value,
                      prode_prod_emp_id: c2.prode_prod_emp_id || null,
                    };

                    estoque.push(objEst);
                  }
                });
              } else {
                objEst = {
                  prode_prod_id: cadastro.prod_id,

                  prode_forn_id: f.prode_forn_id,
                  prode_forn_referencia: f.prode_forn_referencia,
                  prode_desc_fornec: toDecimal(f.prode_desc_fornec),
                  prode_marca_id: f.prode_marca_id,
                  prode_classific1_id: c1.value,
                  prode_prod_emp_id: c1.prode_prod_emp_id || null,
                };

                estoque.push(objEst);
              }
            });
          } else {
            objEst = {
              prode_prod_id: cadastro.prod_id,
              prode_prod_emp_id: f.prode_prod_emp_id || null,
              prode_forn_id: f.prode_forn_id,
              prode_forn_referencia: f.prode_forn_referencia,
              prode_desc_fornec: toDecimal(f.prode_desc_fornec),
              prode_marca_id: f.prode_marca_id,
            };

            estoque.push(objEst);
          }
        });
        return estoque;
      }
      return [];
      // throw new Error('INFORME O FORNECEDOR PARA CADASTRAR O PRODUTO');
    } catch (error) {
      toast.error(`Erro ao gerar objeto produto_estoque \n${error}`);
    }
  }

  async function handleSubmit() {
    try {
      if (parseInt(valueTab, 10) > 0) {
        const dataProd = frmCadastro.current.getData();

        frmCadastro.current.setErrors({});
        await schemaCad.validate(dataProd, {
          abortEarly: false,
        });

        setLoading(true);

        const produto = {
          prod_id: dataProd.prod_id ? dataProd.prod_id : null,
          prod_descricao: dataProd.prod_descricao.toUpperCase(),
          prod_referencia: dataProd.prod_referencia
            ? dataProd.prod_referencia.toUpperCase()
            : null,
          prod_especie_id: dataProd.prod_especie_id,
          prod_cod_ean: dataProd.prod_cod_ean,
          prod_ncm: dataProd.prod_ncm,
          prod_unidade_venda: dataProd.prod_unidade_venda,
          prod_origem_merc: dataProd.prod_origem_merc,
          prod_cest: dataProd.prod_cest,
          prod_peso_b: dataProd.prod_peso_b
            ? toDecimal(dataProd.prod_peso_b)
            : '0',
          prod_peso_l: dataProd.prod_peso_l
            ? toDecimal(dataProd.prod_peso_l)
            : '0',
          prod_fator_conv: dataProd.prod_fator_conv
            ? toDecimal(dataProd.prod_fator_conv)
            : '1',
          prod_conv_litragem: dataProd.prod_conf_litragem || null,
          prod_conv_caixa: dataProd.prod_conv_caixa || null,
          prod_aliq_icms: toDecimal(dataProd.prod_aliq_icms),
          prod_aliq_icms_interestadual: toDecimal(
            dataProd.prod_aliq_icms_interestadual
          ),
          prod_aliq_icms_red: toDecimal(dataProd.prod_aliq_icms_red),
          prod_aliq_icms_import: toDecimal(dataProd.prod_aliq_icms_import),
          prod_aliq_subst: toDecimal(dataProd.prod_aliq_subst),
          prod_base_subst: toDecimal(dataProd.prod_base_subst),
          prod_pauta_subst: toDecimal(dataProd.prod_pauta_subst),
          prod_aliq_red_subst: toDecimal(dataProd.prod_aliq_red_subst),
          prod_mva: toDecimal(dataProd.prod_mva),
          prod_aliq_ipi: toDecimal(dataProd.prod_aliq_ipi),
          prod_pauta_ipi: toDecimal(dataProd.prod_pauta_ipi),
          prod_pauta_pis: toDecimal(dataProd.prod_pauta_pis),
          prod_pauta_cofins: toDecimal(dataProd.prod_pauta_cofins),
          prod_ex_tipi: dataProd.prod_ex_tipi,
          prod_ind_escala: dataProd.prod_ind_escala,
          prod_cbnef: dataProd.prod_cbenef,
          prod_tipo: dataProd.prod_tipo,
          prod_codbarra_interno: null,
          prod_controla_estoque: 'S',
          prod_estoque_minimo: toDecimal(dataProd.prod_estoque_minimo),
          prod_categoria_id: dataProd.prod_categoria_id,
          prod_un_trib: dataProd.prod_un_trib,
          prod_situacao: dataProd.prod_situacao,
        };

        const estoque = getProdEstoque();

        const cadastro = {
          emp_id: null,
          usr_id: null,
          produto,
          estoque,
        };
        const retorno = await api.post('v1/supr/produto', cadastro);
        if (retorno.data.success) {
          frmCadastro.current.setFieldValue('prod_id', retorno.data.retorno);
          await getGridFornec(retorno.data.retorno);
          await getGridClassific(retorno.data.retorno, '1');
          await getGridClassific(retorno.data.retorno, '2');
          await getGridClassific(retorno.data.retorno, '3');
          await getGridInfEstoque(retorno.data.retorno);
          await getGridTabPreco(retorno.data.retorno);
          toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
          setLoading(false);
          return;
        }
        setLoading(false);
      } else {
        toast.info(`Altere ou inicie um cadastro para salvar...`, toastOptions);
      }
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
      }

      frmCadastro.current.setFieldError(
        'prod_categoria_id',
        validationErrors.prod_categoria_id
      );
      frmCadastro.current.setFieldError(
        'prod_un_trib',
        validationErrors.prod_un_trib
      );
      frmCadastro.current.setFieldError(
        'prod_situacao',
        validationErrors.prod_situacao
      );
      frmCadastro.current.setFieldError(
        'prod_tipo',
        validationErrors.prod_tipo
      );
      frmCadastro.current.setFieldError(
        'prod_ind_escala',
        validationErrors.prod_ind_escala
      );

      frmCadastro.current.setFieldError(
        'prod_descricao',
        validationErrors.prod_descricao
      );

      frmCadastro.current.setFieldError(
        'prod_especie_id',
        validationErrors.prod_especie_id
      );
      frmCadastro.current.setFieldError('prod_ncm', validationErrors.prod_ncm);
      frmCadastro.current.setFieldError(
        'prod_unidade_venda',
        validationErrors.prod_unidade_venda
      );
      frmCadastro.current.setFieldError(
        'prod_origem_merc',
        validationErrors.prod_origem_merc
      );
    }
  }

  const handleChangeTab = async (event, newValue) => {
    try {
      let cadastro = frmCadastro.current.getData();
      if (newValue === 0) {
        await listarProduto(50);
        setValueTab(newValue);
        frmCadastro.current.setFieldValue('prod_id', '');
      } else if (newValue === 1) {
        if (cadastro.prod_id) setValueTab(newValue);
        else await handleEdit();
      } else if (newValue === 2) {
        if (valueTab !== 2) {
          if (cadastro.prod_id) {
            setValueTab(newValue);
          } else {
            if (cadastro.prod_descricao) {
              await handleSubmit();
            }
            await handleEdit();
            cadastro = frmCadastro.current.getData();
            if (cadastro.prod_id) setValueTab(newValue);
          }
        }
      } else if (newValue === 3) {
        if (valueTab !== 3) {
          if (cadastro.prod_id) {
            setValueTab(newValue);
          } else {
            if (cadastro.prod_descricao) {
              await handleSubmit();
            }
            await handleEdit();
            cadastro = frmCadastro.current.getData();
            if (cadastro.prod_id) setValueTab(newValue);
          }
        }
      } else if (newValue === 4) {
        if (valueTab !== 4) {
          setDataValidade(moment(new Date()).add(1, 'years'));
          if (cadastro.prod_id) {
            setValueTab(newValue);
          } else {
            if (cadastro.prod_descricao) {
              await handleSubmit();
            }
            await handleEdit();
            cadastro = frmCadastro.current.getData();
            if (cadastro.prod_id) setValueTab(newValue);
          }
        }
      } else setValueTab(newValue);
    } catch (error) {
      toast.error(`${error}`, toastOptions);
    }
  };

  async function handleExcluirClassific(prm) {
    try {
      setLoading(true);
      const cadastro = frmCadastro.current.getData();

      const response = await api.delete(
        `v1/supr/produto/classificacao?prod_id=${cadastro.prod_id}&classific_id=${prm.value}&tab_id=${prm.tab_id}`
      );
      setLoading(false);

      if (response.data.success) {
        if (prm.tab_id.toString() === '12') {
          setGridClassific1((prevState) => {
            prevState = prevState.filter((item) => item !== prm);
            return prevState;
          });
        } else if (prm.tab_id.toString() === '13') {
          setGridClassific2((prevState) => {
            prevState = prevState.filter((item) => item !== prm);
            return prevState;
          });
        } else if (prm.tab_id.toString() === '14') {
          setGridClassific3((prevState) => {
            prevState = prevState.filter((item) => item !== prm);
            return prevState;
          });
        }
      } else {
        toast.error(
          `Erro ao excluir classificação \n${response.data.error}`,
          toastOptions
        );
      }
      toast.info(`Classificação Excluída!!!`, toastOptions);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir classificação \n${error}`, toastOptions);
    }
  }

  async function handleTrocaForn() {
    try {
      setLoading(true);
      const cadastro = frmCadastro.current.getData();
      const retorno = await api.put(
        `v1/supr/produto/trocar?prod_id=${cadastro.prod_id}&old_forn=${fornProduto.prode_forn_id}&new_forn=${changeFornec.value}`
      );
      setGridFornec(retorno.data.retorno);
      setLoading(false);
      setOpenDlgTrocaFornec(false);
      toast.info('Fornecedor atualizado com sucesso!!!', toastOptions);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao atualizar fornecedor \n${error}`, toastOptions);
    }
  }

  async function handleChangeFornec() {
    try {
      setLoading(true);
      const cadastro = frmCadastro.current.getData();
      const dados = frmChanceForn.current.getData();
      const estoque = {
        prode_prod_emp_id: null,
        prode_prod_id: cadastro.prod_id,
        prode_desc_fornec: toDecimal(dados.update_prode_desc_fornec),
        prode_forn_referencia: dados.update_prode_forn_referencia,
        prode_marca_id: dados.update_prode_marca_id,
        prode_forn_id: fornProduto.prode_forn_id,
      };

      const retorno = await api.put('v1/supr/produto', estoque);
      setGridFornec(retorno.data.retorno);
      setLoading(false);
      setOpenDlgEditaFornec(false);
      toast.info('Fornecedor atualizado com sucesso!!!', toastOptions);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao atualizar fornecedor \n${error}`, toastOptions);
    }
  }

  // F10 adiciona o fornecedor a grid
  async function handleAddFornec() {
    try {
      const cadastro = frmCadastro.current.getData();
      const dados = frmClassificacao.current.getData();

      frmClassificacao.current.setErrors({});
      await schemaClassific.validate(dados, {
        abortEarly: false,
      });

      const x = optMarca.find(
        (op) => op.value.toString() === dados.prode_marca_id.toString()
      );

      const obj = {
        prode_prod_emp_id: null,
        prode_id: null,
        prode_prod_id: cadastro.prod_id,
        prode_forn_id: fornProduto.value,
        prode_forn_referencia: dados.prode_forn_referencia
          ? dados.prode_forn_referencia.toUpperCase()
          : null,
        prode_desc_fornec: dados.prode_desc_fornec
          ? toDecimal(dados.prode_desc_fornec)
          : '0.00',
        prode_marca_id: dados.prode_marca_id,
        forn_razao_social: fornProduto.label.toUpperCase(),
        marca: x.label,
      };
      const grid = [];

      gridFornec.forEach((g) => {
        grid.push(g);
      });
      grid.push(obj);
      setGridFornec(grid);
    } catch (err) {
      setLoading(false);
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        toast.error(`Erro ao adicionar fornecedor: ${err}`, toastOptions);
      }

      frmClassificacao.current.setFieldError(
        'prode_forn_id',
        validationErrors.prode_forn_id
      );
      frmClassificacao.current.setFieldError(
        'prode_marca_id',
        validationErrors.prode_marca_id
      );
    }
  }

  async function handleAddClassfic(obj, class_id) {
    try {
      if (class_id && obj) {
        const grid = [];
        let found = false;
        if (class_id === '1') {
          gridClassific1.forEach((g) => {
            grid.push(g);
            if (!found) found = g.value === obj.value;
          });
          if (!found)
            grid.push({
              value: obj.value,
              label: obj.label,
              tab_id: '12',
              prode_prod_emp_id: null,
            });
          setGridClassific1(grid);
          frmClassificacao.current.setFieldValue('prode_classific1_id', '');
        } else if (class_id === '2') {
          gridClassific2.forEach((g) => {
            grid.push(g);
            if (!found) found = g.value === obj.value;
          });
          if (!found)
            grid.push({
              value: obj.value,
              label: obj.label,
              tab_id: '13',
              prode_prod_emp_id: null,
            }); // so adiciona o novo se nao estiver ja lista dos adicionados
          setGridClassific2(grid);
          frmClassificacao.current.setFieldValue('prode_classific2_id', '');
        } else if (class_id === '3') {
          gridClassific3.forEach((g) => {
            grid.push(g);
            if (!found) found = g.value === obj.value;
          });
          if (!found)
            grid.push({
              value: obj.value,
              label: obj.label,
              tab_id: '14',
              prode_prod_emp_id: null,
            });
          setGridClassific3(grid);
          frmClassificacao.current.setFieldValue('prode_classific3_id', '');
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao adicionar classficação: ${err}`, toastOptions);
    }
  }

  async function handleNewPreco(dados) {
    try {
      let vigencia;
      let validade;
      setDataVigencia((prevState) => {
        vigencia = new Date(prevState);
        return prevState;
      });
      setDataValidade((prevState) => {
        validade = new Date(prevState);
        return prevState;
      });

      if (validade) {
        setLoading(true);
        const tabela = {
          tab_sequence: null,
          tab_id: dados.tab_id,
          tab_descricao: dados.tab_descricao,
          tab_prod_id: dados.tab_prod_id,
          tab_data_vigencia: format(new Date(vigencia), 'yyyy-MM-dd HH:mm:ss'),
          tab_data_validade: format(new Date(validade), 'yyyy-MM-dd HH:mm:ss'),
          tab_preco_fabrica: '0',
          tab_margem: '0',
          tab_preco_final: '0',
          tab_preco_promo: '0',
          tab_base_subst_dem: '0',
          tab_pauta_subst_dem: '0',
          tab_aliq_subst_dem: '0',
          tab_ativo: 'S',
        };

        const retorno = await api.post('v1/supr/tabpreco', tabela);
        if (retorno.data.success) {
          await getGridTabPreco(dados.tab_prod_id);
          toast.info('Vigência adicionada com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }

        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        `Erro ao adicionar nova vigência de preço: ${err}`,
        toastOptions
      );
    }
  }

  const handleChangePreco = async (prm) => {
    try {
      if (
        toDecimal(prm.data.tab_preco_fabrica) > 0 &&
        (toDecimal(prm.data.tab_margem) > 0 ||
          toDecimal(prm.data.tab_preco_final) > 0)
      ) {
        setLoading(true);
        const tabela = {
          tab_sequence: prm.data.tab_sequence,
          tab_id: prm.data.tab_id,
          tab_prod_id: prm.data.tab_prod_id,
          tab_preco_fabrica: toDecimal(prm.data.tab_preco_fabrica),
          tab_margem: toDecimal(prm.data.tab_margem),
          tab_preco_final: toDecimal(prm.data.tab_preco_final),
          tab_preco_promo: toDecimal(prm.data.tab_preco_promo),
          tab_ativo: 'S',
        };

        const retorno = await api.put('v1/supr/tabpreco', tabela);

        if (retorno.data.success) {
          await getGridTabPreco(prm.data.tab_prod_id);
          toast.info('Tabela Atualizada com sucesso!!!', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }

        setLoading(false);
      }
    } catch (err) {
      await getGridTabPreco(prm.data.tab_prod_id);
      setLoading(false);
      toast.error(`Erro ao atualizar preço: ${err}`, toastOptions);
    }
  };

  useEffect(() => {
    listarProduto(100);
    getComboTabPreco();
    comboGeral(9);
    comboGeral(10);
    comboGeral(12);
    comboGeral(13);
    comboGeral(14);
    comboGeral(15);
    comboUnidade();
    setValueTab(0);
  }, []);

  // #region DEFINIÇOES DAS GRIDS  =========================

  const gridColumnPesquisa = [
    {
      field: 'prod_id',
      headerName: 'CÓDIGO',
      width: 100,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_descricao',
      headerName: 'DESCRIÇÃO',
      width: 400,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_referencia',
      headerName: 'REFERÊNCIA',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prod_unidade_venda',
      headerName: 'UNID',
      width: 80,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'prod_categoria',
      headerName: 'CATEGORIA',
      width: 200,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'situacao',
      headerName: 'SITUAÇÃO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'forn_razao_social',
      headerName: 'FORNECEDOR',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const gridColumnForn = [
    {
      field: 'prode_forn_id',
      headerName: 'AÇÕES',
      width: 100,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <ToolBarGrid>
              <BootstrapTooltip title="Trocar Fornecedor" placement="top">
                <button
                  className="grid-button"
                  type="button"
                  onClick={() => {
                    setFornProduto(prm.data);
                    setOpenDlgTrocaFornec(true);
                  }}
                >
                  <FaExchangeAlt size={20} color="#253739" />
                </button>
              </BootstrapTooltip>
              <BootstrapTooltip title="Editar Fornecedor Atual" placement="top">
                <button
                  className="grid-button"
                  type="button"
                  onClick={() => {
                    setFornProduto(prm.data);
                    frmChanceForn.current.setFieldValue(
                      'update_cod_forn',
                      prm.data.prode_forn_id
                    );
                    frmChanceForn.current.setFieldValue(
                      'update_razao_forn',
                      prm.data.forn_razao_social
                    );
                    frmChanceForn.current.setFieldValue(
                      'update_prode_desc_fornec',
                      prm.data.prode_desc_fornec
                    );
                    frmChanceForn.current.setFieldValue(
                      'update_prode_forn_referencia',
                      prm.data.prode_forn_referencia
                    );

                    if (prm.data.prode_marca_id) {
                      const x = {
                        value: prm.data.prode_marca_id,
                        label: prm.data.marca,
                      };
                      frmChanceForn.current.setFieldValue(
                        'update_prode_marca_id',
                        x
                      );
                    } else
                      frmChanceForn.current.setFieldValue(
                        'update_prode_marca_id',
                        ''
                      );
                    setOpenDlgEditaFornec(true);
                  }}
                >
                  <FaUserEdit size={20} color="#253739" />
                </button>
              </BootstrapTooltip>
            </ToolBarGrid>
          </>
        );
      },
    },

    {
      field: 'forn_razao_social',
      headerName: 'RAZÃO SOCIAL',
      width: 450,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prode_forn_referencia',
      headerName: 'REFERÊNCIA FORN.',
      width: 180,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'prode_desc_fornec',
      headerName: 'DESC. FORN',
      width: 140,
      lockVisible: true,
      type: 'rightAligned',
    },
    {
      field: 'marca',
      headerName: 'MARCA',
      width: 200,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const gridColumnClassific = [
    {
      field: 'value',
      headerName: 'AÇÕES',
      width: 80,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip title="Excluir Item" placement="top">
              <button
                className="grid-button"
                type="button"
                onClick={() => handleExcluirClassific(prm.data)}
              >
                <FaTrash size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },

    {
      field: 'value',
      headerName: 'CÓDIGO',
      width: 90,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'label',
      headerName: 'DESCRIÇÃO',
      width: 250,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      flex: 1,
    },
  ];

  const gridColumnEstoque = [
    {
      field: 'forn_razao_social',
      headerName: 'FORNECEDOR',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'marca',
      headerName: 'MARCA',
      width: 220,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific1',
      headerName: 'CLASSIFICAÇÃO 1',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific2',
      headerName: 'CLASSIFICAÇÃO 2',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'classific3',
      headerName: 'CLASSIFICAÇÃO 3',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'prode_saldo',
      headerName: 'SALDO EM ESTOQUE',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      flex: 1,
    },
  ];

  const gridColumnTabPreco = [
    {
      field: 'tab_sequence',
      headerName: 'AÇÕES',
      width: 80,
      lockVisible: true,
      cellRendererFramework(prm) {
        return (
          <>
            <BootstrapTooltip
              title="CADASTRAR NOVA VIGÊNCIA E PREÇO"
              placement="top"
            >
              <button
                className="grid-button"
                type="button"
                onClick={() => handleNewPreco(prm.data)}
              >
                <FaEdit size={18} color="#253739" />
              </button>
            </BootstrapTooltip>
          </>
        );
      },
    },
    {
      field: 'tab_descricao',
      headerName: 'TABELA DE PREÇO',
      width: 210,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_destaque',
    },
    {
      field: 'prod_referencia',
      headerName: 'REF. PRODUTO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tab_preco_fabrica',
      headerName: 'PREÇO FAB.',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'desc_fornec',
      headerName: 'DESC. FORN (%)',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
    },
    {
      field: 'preco_fabrica_ajustado',
      headerName: 'PREÇO FAB. AJUSTADO',
      width: 170,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
    },
    {
      field: 'tab_margem',
      headerName: 'MARGEM (%)',
      width: 140,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'tab_preco_final',
      headerName: 'PREÇO FINAL',
      width: 150,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      cellClass: 'cell_total',
      editable: true,
      onCellValueChanged: handleChangePreco,
    },
    {
      field: 'tab_data_vigencia',
      headerName: 'DATA VIGÊNCIA',
      width: 180,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'tab_data_validade',
      headerName: 'DATA VALIDADE',
      width: 180,
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
        <BootstrapTooltip title="CONSULTAR PRODUTO" placement="right">
          <button type="button" onClick={() => listarProduto(800)}>
            <FaSearch size={28} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="Novo Cadastro" placement="left">
          <button type="button" onClick={handleNovoCadastro}>
            <FaPlusCircle size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />
        <BootstrapTooltip title="SALVAR CADASTRO" placement="left">
          <button type="button" onClick={handleSubmit}>
            <FaSave size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>
      <Container>
        <Scroll>
          <TitleBar bckgnd="#dae2e5">
            <h1>CADASTRO DE PRODUTOS</h1>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

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
                title="Consultar Produtos Cadastrados"
                placement="top-start"
              >
                <Tab
                  label="CONSULTAR"
                  {...a11yProps(0)}
                  icon={<FaSearch size={29} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Tela de cadastro de produtos"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CADASTRAR PRODUTO"
                  {...a11yProps(1)}
                  icon={<FaFolderPlus size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Classificar detalhadamento o produto"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="CLASSIFICAR PRODUTO"
                  {...a11yProps(2)}
                  icon={<FaListAlt size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Exibe informações e saldo de estoque"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="INF. ESTOQUE"
                  {...a11yProps(3)}
                  icon={<FaCubes size={26} color="#244448" />}
                />
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Consultar e Configurar Tabelas de Preço"
                placement="top-end"
              >
                <Tab
                  disabled={false}
                  label="TABELA DE PREÇOS"
                  {...a11yProps(4)}
                  icon={<FaMoneyBill size={26} color="#244448" />}
                />
              </BootstrapTooltip>
            </Tabs>
          </AppBar>

          {/* ABA PESQUISA */}
          <TabPanel value={valueTab} index={0}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmPesquisa" ref={frmPesquisa}>
                <h1>PARÂMETROS DE PESQUISA</h1>
                <BoxItemCad fr="1fr 1fr">
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={listarProduto}
                    >
                      <Input
                        type="text"
                        name="pesq_prod_descricao"
                        className="input_cad"
                        placeholder="PESQUISAR POR DESCRIÇÃO"
                      />
                    </KeyboardEventHandler>
                  </AreaComp>

                  <AreaComp wd="100">
                    <AsyncSelectForm
                      name="pesq_prod_forn_id"
                      placeholder="PESQUISAR POR FORNECEDOR"
                      defaultOptions
                      cacheOptions
                      loadOptions={loadOptionsFornec}
                      isClearable
                      value={fornecedor}
                      onChange={(f) => setFornecedor(f || [])}
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <KeyboardEventHandler
                      handleKeys={['enter']}
                      onKeyEvent={listarProduto}
                    >
                      <Input
                        type="text"
                        name="pesq_prod_referencia"
                        className="input_cad"
                        placeholder="PESQUISAR REFERÊNCIA"
                      />
                    </KeyboardEventHandler>
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="pesq_prod_categoria_id"
                      optionsList={optCategoria}
                      placeholder="PESQUISAR POR CATEGORIA"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      name="pesq_prod_situacao"
                      optionsList={optSituacao}
                      placeholder="SITUAÇÃO DO PRODUTO"
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
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
                      onSelectionChanged={handleSelectGridPesquisa}
                    />
                  </GridContainerMain>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CADASTRO */}
          <TabPanel value={valueTab} index={1}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmCadastro" ref={frmCadastro}>
                <h1>IDENTIFICAÇÃO DO PRODUTO</h1>
                <BoxItemCad fr="1fr 1fr 3fr 2fr">
                  <AreaComp wd="100">
                    <label>código</label>
                    <Input
                      type="number"
                      name="prod_id"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>REFERÊNCIA</label>
                    <Input
                      type="text"
                      name="prod_referencia"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>DESCRIÇÃO</label>
                    <Input
                      type="text"
                      name="prod_descricao"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="ESPÉCIE"
                      name="prod_especie_id"
                      optionsList={optEspecie}
                      placeholder="NÃO INFORMADO"
                      zindex="153"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="2fr 3fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <FormSelect
                      label="CATEGORIA"
                      name="prod_categoria_id"
                      optionsList={optCategoria}
                      zindex="152"
                      placeholder="NÃO INFORMADO"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="ORIGEM PRODUTO"
                      name="prod_origem_merc"
                      optionsList={optOrigem}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="UND. VENDA"
                      name="prod_unidade_venda"
                      optionsList={optUnidade}
                      placeholder="NÃO INFORMADO"
                      zindex="152"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="UND. TRIB."
                      name="prod_un_trib"
                      zindex="152"
                      optionsList={optUnidade}
                      placeholder="NÃO INFORMADO"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>EAN</label>
                    <Input
                      type="text"
                      name="prod_cod_ean"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCad fr="1fr 1fr 2fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>NCM</label>
                    <Input
                      type="number"
                      name="prod_ncm"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>EST. MÍNIMO</label>
                    <Input
                      type="text"
                      name="prod_estoque_minimo"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="TIPO PROD."
                      name="prod_tipo"
                      optionsList={optTpProduto}
                      placeholder="NÃO INFORMADO"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PESO BRUTO</label>
                    <Input
                      type="number"
                      name="prod_peso_b"
                      className="input_cad"
                      step="any"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PESO LIQ.</label>
                    <Input
                      type="number"
                      name="prod_peso_l"
                      className="input_cad"
                      step="any"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>FATOR CONV.</label>
                    <Input
                      type="number"
                      step="any"
                      name="prod_fator_conf"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 2fr 1fr">
                  <AreaComp wd="100">
                    <label>FATOR LITRAGEM</label>
                    <Input
                      type="number"
                      step="any"
                      name="prod_conv_litragem"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>FATOR CAIXA</label>
                    <Input
                      type="number"
                      step="any"
                      name="prod_conv_caixa"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>CEST</label>
                    <Input
                      type="number"
                      name="prod_cest"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>COD. BENEF. FISCAL</label>
                    <Input
                      type="number"
                      name="prod_cbenef"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="INDICADOR DE ESCALA"
                      name="prod_ind_escala"
                      optionsList={optIndEscala}
                      placeholder="NÃO INFORMADO"
                      clearable={false}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="SITUAÇÃO"
                      name="prod_situacao"
                      optionsList={optSituacao}
                      placeholder="NÃO INFORMADO"
                      clearable={false}
                    />
                  </AreaComp>
                </BoxItemCad>
                <h1>PARÂMETROS FISCAIS</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>EX. TIPI</label>
                    <Input
                      type="text"
                      name="prod_ex_tipi"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ ICMS</label>
                    <Input
                      type="text"
                      name="prod_aliq_icms"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ ICMS INT.</label>
                    <Input
                      type="text"
                      name="prod_aliq_icms_interestadual"
                      className="input_cad"
                      placeholder="0,00"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ ICMS RED.</label>
                    <Input
                      type="text"
                      name="prod_aliq_icms_red"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ ICMS IMP.</label>
                    <Input
                      type="text"
                      name="prod_aliq_icms_import"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ RED. SUBST</label>
                    <Input
                      type="text"
                      name="prod_aliq_red_subst"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>ALIQ SUBST.</label>
                    <Input
                      type="text"
                      name="prod_aliq_subst"
                      onChange={maskDecimal}
                      className="input_cad"
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>MVA SUBST</label>
                    <Input
                      type="text"
                      name="prod_mva"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>BASE SUBST.</label>
                    <Input
                      type="text"
                      name="prod_base_subst"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PAUTA SUBST.</label>
                    <Input
                      type="text"
                      name="prod_pauta_subst"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>ALIQ IPI</label>
                    <Input
                      type="text"
                      name="prod_aliq_ipi"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PAUTA IPI</label>
                    <Input
                      type="text"
                      name="prod_pauta_ipi"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <label>PAUTA/ALIQ. PIS</label>
                    <Input
                      type="text"
                      name="prod_pauta_pis"
                      className="input_cad"
                      onChange={maskDecimal}
                      placeholder="0,00"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>PAUTA/ALIQ. COFINS</label>
                    <Input
                      type="text"
                      name="prod_pauta_cofins"
                      className="input_cad"
                      placeholder="0,00"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>

          {/* ABA CLASSIFICAÇAO */}
          <TabPanel value={valueTab} index={2}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmClassificacao" ref={frmClassificacao}>
                <h1>{`FORNECEDORES ${infProd} -- (F10 PARA ADICIONAR)`}</h1>
                <KeyboardEventHandler
                  handleKeys={['F10']}
                  onKeyEvent={handleAddFornec}
                >
                  <BoxItemCad fr="3fr 1fr 1fr 2fr">
                    <AreaComp wd="100">
                      <AsyncSelectForm
                        name="prode_forn_id"
                        label="FORNECEDOR DO PRODUTO"
                        placeholder="NÃO INFORMADO"
                        defaultOptions
                        cacheOptions
                        loadOptions={loadOptionsFornec}
                        isClearable
                        value={fornProduto}
                        onChange={(f) => setFornProduto(f || [])}
                        zindex="151"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>referência Forn.</label>
                      <Input
                        type="text"
                        name="prode_forn_referencia"
                        className="input_cad"
                      />
                    </AreaComp>
                    <AreaComp wd="100">
                      <label>desc. forn</label>
                      <BootstrapTooltip
                        title="Desconto (opcional) que o fornecedor pode oferecer. Esse desconto é usado no cálculo do preço final do produto"
                        placement="top-end"
                      >
                        <Input
                          type="text"
                          name="prode_desc_fornec"
                          className="input_cad"
                          placeholder="0,00"
                          onChange={maskDecimal}
                        />
                      </BootstrapTooltip>
                    </AreaComp>
                    <AreaComp wd="100">
                      <FormSelect
                        label="MARCA RELACIONADA"
                        name="prode_marca_id"
                        optionsList={optMarca}
                        zindex="152"
                        placeholder="NÃO INFORMADO"
                      />
                    </AreaComp>
                  </BoxItemCad>
                </KeyboardEventHandler>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerForn className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnForn}
                      rowData={gridFornec}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
                    />
                  </GridContainerForn>
                </BoxItemCadNoQuery>
                <BoxItemCad fr="1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <h1>CLASSIFICAÇÃO 1 - (F2 ADICIONA TUDO)</h1>
                    <KeyboardEventHandler
                      handleKeys={['F2']}
                      onKeyEvent={() => {
                        setGridClassific1(optClassific1);
                        frmClassificacao.current.setFieldValue(
                          'prode_classific1_id',
                          ''
                        );
                      }}
                    >
                      <FormSelect
                        name="prode_classific1_id"
                        optionsList={optClassific1}
                        zindex="152"
                        position="top"
                        placeholder="NÃO INFORMADO"
                        onChange={(c) => handleAddClassfic(c, '1')}
                      />
                    </KeyboardEventHandler>
                    <GridContainerClassific className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnClassific}
                        rowData={gridClassific1}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onGridReady={(params) => {
                          setGridApiPesquisa(params.api);
                        }}
                      />
                    </GridContainerClassific>
                  </AreaComp>
                  <AreaComp wd="100">
                    <h1>CLASSIFICAÇÃO 2 - (F2 ADICIONA TUDO)</h1>
                    <KeyboardEventHandler
                      handleKeys={['F2']}
                      onKeyEvent={() => {
                        setGridClassific2(optClassific2);
                        frmClassificacao.current.setFieldValue(
                          'prode_classific2_id',
                          ''
                        );
                      }}
                    >
                      <FormSelect
                        name="prode_classific2_id"
                        optionsList={optClassific2}
                        zindex="152"
                        position="top"
                        placeholder="NÃO INFORMADO"
                        onChange={(c) => handleAddClassfic(c, '2')}
                      />
                    </KeyboardEventHandler>
                    <GridContainerClassific className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnClassific}
                        rowData={gridClassific2}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onGridReady={(params) => {
                          setGridApiPesquisa(params.api);
                        }}
                      />
                    </GridContainerClassific>
                  </AreaComp>
                  <AreaComp wd="100">
                    <h1>CLASSIFICAÇÃO 3 - (F2 ADICIONA TUDO)</h1>
                    <KeyboardEventHandler
                      handleKeys={['F2']}
                      onKeyEvent={() => {
                        setGridClassific3(optClassific3);
                        frmClassificacao.current.setFieldValue(
                          'prode_classific3_id',
                          ''
                        );
                      }}
                    >
                      <FormSelect
                        name="prode_classific3_id"
                        optionsList={optClassific3}
                        zindex="152"
                        position="top"
                        placeholder="NÃO INFORMADO"
                        onChange={(c) => handleAddClassfic(c, '3')}
                      />
                    </KeyboardEventHandler>
                    <GridContainerClassific className="ag-theme-balham">
                      <AgGridReact
                        columnDefs={gridColumnClassific}
                        rowData={gridClassific3}
                        rowSelection="single"
                        animateRows
                        gridOptions={{ localeText: gridTraducoes }}
                        onGridReady={(params) => {
                          setGridApiPesquisa(params.api);
                        }}
                      />
                    </GridContainerClassific>
                  </AreaComp>
                </BoxItemCad>
              </Form>
            </Panel>
          </TabPanel>

          {/* INF. ESTOQUE */}
          <TabPanel value={valueTab} index={3}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmEstoque" ref={frmEstoque}>
                <h1>{`ESTOQUE DETALHADO ${infProd}`}</h1>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerEstoque className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnEstoque}
                      rowData={gridEstoque}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
                    />
                  </GridContainerEstoque>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>

          {/* TABELA DE PREÇOS */}
          <TabPanel value={valueTab} index={4}>
            <Panel lefth1="left" bckgnd="#dae2e5">
              <Form id="frmTabPreco" ref={frmTabPreco}>
                <h1>{`TABELA DE PREÇOS ${infProd}`}</h1>
                <BoxItemCad fr="1fr 1fr 1fr 1fr">
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => setDataVigencia(new Date(date))}
                      value={dataVigencia}
                      dateAndTime
                      label="Data Vigência"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <DatePickerInput
                      onChangeDate={(date) => {
                        setDataValidade(new Date(date));
                      }}
                      dateAndTime
                      value={dataValidade}
                      label="Data Validade"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCadNoQuery fr="1fr">
                  <GridContainerEstoque className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnTabPreco}
                      rowData={gridTabPreco}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                      onGridReady={(params) => {
                        setGridApiPesquisa(params.api);
                      }}
                    />
                  </GridContainerEstoque>
                </BoxItemCadNoQuery>
              </Form>
            </Panel>
          </TabPanel>
        </Scroll>
      </Container>

      {/* popup para editar fornecedor */}
      <Slide direction="down" in={openDlgEditaFornec}>
        <Dialog
          open={openDlgEditaFornec}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgEditaFornec(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>EDITAR INFORMAÇÕES DO FORNECEDOR</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button
                type="button"
                onClick={() => setOpenDlgEditaFornec(false)}
              >
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <Form
                id="frmChanceForn"
                ref={frmChanceForn}
                onSubmit={handleChangeFornec}
              >
                <BoxItemCad fr="1fr 3fr">
                  <AreaComp wd="100">
                    <label>cód. Forn.</label>
                    <Input
                      type="text"
                      name="update_cod_forn"
                      readOnly
                      className="input_cad"
                    />
                  </AreaComp>

                  <AreaComp wd="100">
                    <label>Razão Social</label>
                    <Input
                      type="text"
                      readOnly
                      name="update_razao_forn"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCad>
                <BoxItemCad fr="1fr 1fr 2fr">
                  <AreaComp wd="100">
                    <label>Desconto em (%)</label>
                    <Input
                      type="text"
                      name="update_prode_desc_fornec"
                      className="input_cad"
                      onChange={maskDecimal}
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Referência Forn.</label>
                    <Input
                      type="text"
                      name="update_prode_forn_referencia"
                      className="input_cad"
                    />
                  </AreaComp>
                  <AreaComp wd="100">
                    <FormSelect
                      label="MARCA RELACIONADA"
                      name="update_prode_marca_id"
                      optionsList={optMarca}
                      zindex="152"
                      placeholder="NÃO INFORMADO"
                    />
                  </AreaComp>
                </BoxItemCad>

                <BoxItemCadNoQuery>
                  <AreaComp wd="100" ptop="60px">
                    <button type="submit" className="btnGeralForm">
                      CONFIRMAR
                    </button>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>

      {/* popup para trocar fornecedor */}
      <Slide direction="down" in={openDlgTrocaFornec}>
        <Dialog
          open={openDlgTrocaFornec}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgTrocaFornec(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>TROCAR FORNECEDOR DO PRODUTO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button
                type="button"
                onClick={() => setOpenDlgTrocaFornec(false)}
              >
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="90%">
            <Form id="frmTrocaForn" ref={frmTrocaForn}>
              <Scroll>
                <BoxItemCadNoQuery fr="1fr">
                  <AreaComp wd="98">
                    <AsyncSelectForm
                      name="change_prod_forn_id"
                      placeholder="LOCALIZAR FORNECEDOR"
                      defaultOptions
                      cacheOptions
                      loadOptions={loadOptionsFornec}
                      isClearable
                      value={changeFornec}
                      onChange={(f) => setChangeFornec(f || [])}
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>

                <BoxItemCadNoQuery>
                  <AreaComp wd="100" ptop="60px">
                    <button
                      type="button"
                      className="btnGeralForm"
                      onClick={handleTrocaForn}
                    >
                      CONFIRMAR
                    </button>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Scroll>
            </Form>
          </CModal>
        </Dialog>
      </Slide>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CADASTRO DE PRODUTOS"
        message="Aguarde Processamento..."
      />
    </>
  );
}
