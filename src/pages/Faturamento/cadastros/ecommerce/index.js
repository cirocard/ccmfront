import React, { useEffect, useState, useRef } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Form } from '@unform/web';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { AgGridReact } from 'ag-grid-react';
import { MdClose, MdShoppingCart } from 'react-icons/md';
import { format } from 'date-fns';
import DialogInfo from '~/componentes/DialogInfo';
import { Container, Content, ToolBar, TitleInput } from './styles';
import {
  FormataMoeda,
  GridCurrencyFormatter,
  RetirarMascara,
  toDecimal,
  formataCNPJCPF,
} from '~/services/func.uteis';
import { gridTraducoes } from '~/services/gridTraducoes';
import FormSelect from '~/componentes/Select';
import Input from '~/componentes/Input';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Scroll,
  GridContainer,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';

export default function FAT3() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const apiGeral = axios.create();
  const frmImp = useRef(null);
  const [optOperFat, setOptOperFat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gridItens, setGridItens] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [infoPed1, setInfoPed1] = useState('');
  const [infoPed2, setInfoPed2] = useState('');
  const [remumoItens, setRemumoItens] = useState('');
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optTpConsumidor = [
    { value: '0', label: 'NORMAL' },
    { value: '1', label: 'CONSUMIDOR FINAL' },
  ];

  const schema = Yup.object().shape({
    cp_oper_id: Yup.string().required('(??)'),
    cp_consumidor: Yup.string().required('(??)'),
  });

  function handleDashboard() {
    history.push('/crm1', '_blank');
  }

  async function getComboOperFat() {
    try {
      const response = await api.get(`v1/combos/operfat/2`);
      const dados = response.data.retorno;
      if (dados) {
        setOptOperFat(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Operaçao de faturamento \n${error}`);
    }
  }

  async function handlePedido() {
    try {
      const ped_id = document.getElementsByName('cod_pedido')[0].value;
      if (ped_id) {
        setLoading(true);
        const response = await apiGeral.get(
          `https://lojaadala.com.br/wp-json/wc/v3/orders/${ped_id}`
        );

        const dados = response.data;

        setPedido(dados);
        const dtaPed = format(
          new Date(dados.date_created),
          'dd/MM/yyyy HH:mm:ss'
        );
        const info1 = `PEDIDO Nº:  ${
          dados.number
        }   ::  EMITIDO EM: ${dtaPed}  ::  VALOR TOTAL: ${FormataMoeda(
          dados.total
        )}`;

        const nomecli =
          dados.billing.persontype === 'J'
            ? dados.billing.company
            : `${dados.billing.first_name.toUpperCase()} ${dados.billing.last_name.toUpperCase()}`;

        const info2 = `CLIENTE: ${nomecli}  ::  CIDADE: 
                       ${dados.billing.city.toUpperCase()} - ${dados.billing.state.toUpperCase()}`;

        setInfoPed1(info1);
        setInfoPed2(info2);
        setGridItens(dados.line_items);

        const resumo = `TOTAL DE ITENS DO PEDIDO: ${
          dados.line_items.length
        }   ::   VALOR TOTAL DO PEDIDO:  ${FormataMoeda(dados.total)}`;

        setRemumoItens(resumo);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        'ATENÇÃO!! NÃO FOI ENCONTRADO NENHUM PEDIDO COM ESTE CÓDIGO...',
        toastOptions
      );
    }
  }

  async function handleCliente() {
    try {
      if (pedido.billing) {
        const datacli = pedido.billing;

        const nomecli =
          datacli.persontype === 'J'
            ? datacli.company
            : `${datacli.first_name.toUpperCase()} ${datacli.last_name.toUpperCase()}`;

        const cnpj_cpf =
          datacli.persontype === 'J' ? datacli.cnpj : datacli.cpf;

        // verificar se o cliente existe
        const retCli = await api.get(
          `v1/combos/combo_cliente?perfil=1&nome=${cnpj_cpf}`
        );

        if (retCli.data.retorno.length > 0) {
          return retCli.data.retorno[0].value;
        }

        const cepVaidar = RetirarMascara(datacli.postcode, '.-');
        const cep = await apiGeral.get(
          `https://viacep.com.br/ws/${cepVaidar}/json`
        );

        const cliente = {
          cli_emp_id: null,
          cli_id: null,
          cli_razao_social: nomecli,
          cli_fantasia: nomecli,
          cli_cnpj_cpf: formataCNPJCPF(cnpj_cpf),
          cli_insc_estad: datacli.ie,
          cli_status: '1',
          cli_email: datacli.email,
          cli_celular: datacli.cellphone,
          cli_fone_residencial: null,
          cli_observacao: 'IMPORTADO DO E-COMMERCE',
          cli_datacad: new Date(),
          cli_contribuinte_isento: 'N',
          cli_idestrangeiro: '',
          cli_limite_credito: '0.00',
          cli_perfil: '1',
          cli_cota: '0.00',
          cli_credito: null,
          cli_contrato: null,
        };

        const endereco = {
          clie_cli_id: null,
          clie_id: null,
          clie_cep: datacli.postcode,
          clie_logradouro: datacli.address_1.toUpperCase(),
          clie_bairro: datacli.neighborhood.toUpperCase(),
          clie_cidade: datacli.city.toUpperCase(),
          clie_estado: datacli.state,
          clie_numero: datacli.number,
          clie_complemento: datacli.address_2.toUpperCase(),
          clie_pais: datacli.country === 'BR' ? 'BRASIL' : datacli.country,
          clie_pais_codigo: '1058',
          clie_tipo: '2',
          clie_ibge: cep.data.ibge,
        };

        const cadastro = {
          cliente,
          endereco,
        };

        const retorno = await api.post('v1/crm/cad/cliente_crm', cadastro);

        if (retorno.data.success) {
          return retorno.data.retorno[0].cli_id;
        }
        toast.error('Erro ao cadastrar pedido... nao há cliente', toastOptions);
        return null;
      }
      toast.error('Erro ao cadastrar pedido... nao há cliente', toastOptions);
      return null;
    } catch (err) {
      toast.error(`Erro ao cadastrar cliente: ${err}`, toastOptions);
      return null;
    }
  }

  async function handleSubmitNFe() {
    const formCapa = frmImp.current.getData();
    try {
      frmImp.current.setErrors({});

      await schema.validate(formCapa, {
        abortEarly: false,
      });

      setLoading(true);

      const prm = {
        emp_id: null,
        perfil: '1',
        cp_id_origem: pedido.number,
        cp_origem: '3',
      };

      const consultaPedido = await api.post('v1/fat/lista_pedido', prm);

      if (consultaPedido.data.retorno.length === 0) {
        const cli_id = await handleCliente();

        const capa = {
          cp_origem: '3', // importacao ecommerce
          cp_id_origem: pedido.number, // num do ped no ecommerce
          cp_base_icms: null,
          cp_base_ipi: null,
          cp_base_subst: null,
          cp_chave_complementar: null,
          cp_cli_emp_id: null,
          cp_cli_id: cli_id,
          cp_contingencia: '1', // normal
          cp_cvto_emp_id: null,
          cp_cvto_id: 1,
          cp_data_emis: format(
            new Date(pedido.date_created),
            'yyyy-MM-dd HH:mm:ss'
          ),
          cp_data_saida: format(
            new Date(pedido.date_created),
            'yyyy-MM-dd HH:mm:ss'
          ),
          cp_emp_id: null,
          cp_finnfe: '1',
          cp_fpgto_id: 3, // cartao
          cp_fpgto_tab_id: '6',
          cp_id: null,
          cp_indfinal: formCapa.cp_consumidor,
          cp_indpres: '9',
          cp_local_exporta: null,
          cp_num_nf: null,
          cp_num_nf_dev: null,
          cp_observacao: `PEDIDO E-COMMERCE Nº ${pedido.number}`,
          cp_oper_emp_id: null,
          cp_oper_id: formCapa.cp_oper_id,
          cp_serie_nf: null,
          cp_serie_nf_dev: null,
          cp_situacao: '1',
          cp_status_sefaz: '1', // aguardando transmissão
          cp_perfil: '1',
          cp_tpamb: '1',
          cp_tpemis: '1',
          cp_tpnf: null,
          cp_modfrete: '1',
          cp_transp_emp_id: null,
          cp_transp_id: null,
          cp_vlr_cofins: null,
          cp_vlr_frete: null,
          cp_vlr_icms: null,
          cp_vlr_ipi: null,
          cp_vlr_nf: null,
          cp_vlr_outros: null,
          cp_vlr_pis: null,
          cp_vlr_subst: null,
          cp_credito_cli: null,
          cp_vlr_total: toDecimal(pedido.total),
          cp_qvol: null,
          cp_usr_id: null,
          cp_tipo_doc: '1',
        };

        let referencias = '';
        pedido.line_items.map((i) => {
          referencias += `'${i.meta_data._id_exportacao}',`;
        });

        referencias = referencias.substring(0, referencias.length - 1);

        const refs = await api.get(
          `v1/fat/produto_referencia?referencias=${referencias}`
        );

        const itens = [];

        pedido.line_items.map((i) => {
          const p = refs.data.retorno.find(
            (op) => op.prod_referencia.toString() === i.meta_data._id_exportacao
          );
          if (p) {
            const item = {
              item_cp_id: null,
              item_tab_preco_id: null,
              item_prod_id: p.prod_id,
              item_prode_id: p.prode_id,
              item_prod_unidade: p.prod_unidade_venda,
              item_qtd_bonificada: null,
              item_vlr_unit: toDecimal(i.price),
              item_quantidade: toDecimal(i.quantity),
              item_perc_desc: null,
              item_vlr_desc: null,
              item_valor_total: toDecimal(i.total),
              item_tab_preco_vigencia: null,
              item_cfop: null,
              item_cst: null,
              item_id: null,
              item_aliq_cofins: null,
              item_aliq_icms: null,
              item_aliq_icms_red: null,
              item_aliq_ipi: null,
              item_aliq_pis: null,
              item_aliq_subst: null,
              item_base_cofins: null,
              item_base_icms: null,
              item_base_icms_red: null,
              item_base_ipi: null,
              item_base_pis: null,
              item_base_subst: null,
              item_vlr_cofins: null,
              item_vlr_frete: null,
              item_vlr_icms: null,
              item_vlr_icms_red: null,
              item_vlr_ipi: null,
              item_vlr_outros: null,
              item_vlr_pis: null,
              item_vlr_subst: null,
            };

            itens.push(item);
          } else {
            throw new Error(`ATENÇÃO!! O PEDIDO NÃO PODE SER IMPORTADO.
             A REFERÊNCIA:  ${i.meta_data._id_exportacao} NÃO FOI ENCONTRADA NO SISTEMA DE GESTÃO`);
          }
        });

        const obj = {
          emp_id: null,
          usr_id: null,
          capa,
          itens,
        };

        const retorno = await api.post('v1/fat/pedido', obj);

        if (retorno.data.success) {
          toast.info('PEDIDO IMPORTADO COM SUCESSO...', toastOptions);
        } else {
          toast.error(
            `Houve erro no processamento!! ${retorno.data.message}`,
            toastOptions
          );
        }
      } else {
        toast.info('ESTE PEDIDO JÁ FOI IMPORTADO!!!', toastOptions);
      }
      setLoading(false);
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`ERRO AO IMPORTAR PEDIDO:  ${err}`, toastOptions);
      }

      frmImp.current.setFieldError('cp_oper_id', validationErrors.cp_oper_id);
      frmImp.current.setFieldError(
        'cp_consumidor',
        validationErrors.cp_consumidor
      );
    }
  }

  const [gridPrincipalInstance, setGridPrincipalInstance] = useState({
    api: {},
    columnApi: {},
  });

  const onGridPrincipalReady = (params) => {
    setGridPrincipalInstance({
      api: params.api,
      columnApi: params.columnApi,
    });
    params.api.sizeColumnsToFit();
  };

  const colGridItens = [
    {
      field: 'meta_data._id_exportacao',
      headerName: 'REFERÊNCIA',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'name',
      headerName: 'PRODUTO',
      width: 350,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
    },
    {
      field: 'quantity',
      headerName: 'QUANTIDADE',
      width: 110,
      sortable: true,
      resizable: true,
      lockVisible: true,
    },
    {
      field: 'price',
      headerName: 'VLR. UNITÁRIO',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      valueFormatter: GridCurrencyFormatter,
    },
    {
      field: 'total',
      headerName: 'VLR. TOTAL',
      width: 110,
      sortable: true,
      resizable: true,
      filter: true,
      lockVisible: true,
      valueFormatter: GridCurrencyFormatter,
      flex: 1,
    },
  ];

  useEffect(() => {
    getComboOperFat();
    setInfoPed1('AGUARDANDO SELEÇÃO DE PEDIDO...');
    setInfoPed2(' ');
  }, []);

  return (
    <>
      <ToolBar hg="100%" wd="40px" />
      <Container id="pgImpPedido">
        <Scroll>
          <TitleBar bckgnd="#dae2e5" lefth1="left">
            <TitleInput wd="50%">
              <h1>IMPORTAÇAO DE PEDIDOS DO E-COMMERCE</h1>
            </TitleInput>
            <BootstrapTooltip title="Voltar para Dashboard" placement="top">
              <button type="button" onClick={handleDashboard}>
                <MdClose size={30} color="#244448" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Content>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp
                wd="100"
                bckcomp={infoPed1 ? '#000' : '#fff'}
                pleft="10px"
                txtAlign="center"
                lblFontSize="14px"
                lblColor="#DFE1F3"
                radius="4px"
              >
                <label>{infoPed1}</label>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp
                wd="100"
                bckcomp={infoPed2 ? '#000' : '#fff'}
                txtAlign="center"
                pleft="10px"
                lblFontSize="14px"
                lblColor="#DFE1F3"
                radius="4px"
              >
                <label>{infoPed2}</label>
              </AreaComp>
            </BoxItemCadNoQuery>

            <BoxItemCadNoQuery fr="1fr">
              <GridContainer className="ag-theme-balham">
                <AgGridReact
                  columnDefs={colGridItens}
                  rowData={gridItens}
                  rowSelection="single"
                  animateRows
                  gridOptions={{ localeText: gridTraducoes }}
                  onGridReady={onGridPrincipalReady}
                />
              </GridContainer>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100" h3talign="center" bckgndh3="#fff" ptop="7px">
                <h3>{remumoItens}</h3>
              </AreaComp>
            </BoxItemCadNoQuery>
            <Form id="frmImp" ref={frmImp}>
              <BoxItemCadNoQuery fr="1fr 1fr 1fr">
                <AreaComp wd="100" ptop="0px">
                  <KeyboardEventHandler
                    handleKeys={['enter', 'tab']}
                    onKeyEvent={() => handlePedido()}
                  >
                    <Input
                      type="text"
                      className="input_cad"
                      name="cod_pedido"
                      placeholder="INFORME O Nº DO PEDIDO E PRESSIONE (ENTER)"
                    />
                  </KeyboardEventHandler>
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    name="cp_oper_id"
                    optionsList={optOperFat}
                    isClearable
                    placeholder="OPERAÇÃO DE FATURAMENTO"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    name="cp_consumidor"
                    optionsList={optTpConsumidor}
                    isClearable
                    placeholder="TIPO DE CONSUMIDOR"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100" h3talign="center" bckgndh3="#fff" ptop="7px">
                  <button
                    type="button"
                    onClick={handleSubmitNFe}
                    className="btnGeralCenter"
                  >
                    <label>CONFIRMAR IMPORTAÇÃO</label>

                    <MdShoppingCart size={30} color="#EEEFF8" />
                  </button>
                </AreaComp>
              </BoxItemCadNoQuery>
            </Form>
          </Content>
        </Scroll>
      </Container>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="IMPORTAÇÃO DE PEDIDO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
