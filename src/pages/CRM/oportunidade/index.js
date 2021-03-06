/* eslint-disable radix */
import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { MdClose, MdAdd, MdSave } from 'react-icons/md';
import { FaEdit, FaTasks, FaUserTie, FaPrint } from 'react-icons/fa';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import Select from 'react-select';
import DialogInfo from '~/componentes/DialogInfo';
import Input from '~/componentes/Input';
import Popup from '~/componentes/Popup';
import FormSelect from '~/componentes/Select';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import {
  Container,
  Content,
  ToolBar,
  Raia,
  BoxRaia,
  Oportunidade,
  BoxControles,
  Controles,
  Space,
  Panel,
} from './styles';
import { maskDecimal, FormataMoeda, toDecimal } from '~/services/func.uteis';
import {
  TitleBar,
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  Linha,
  CModal,
  Scroll,
  DivLimitador,
  DivLimitadorRow,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';

export default function Crm5() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [loading, setLoading] = useState(false);
  const [openCadastro, setOpenCadastro] = useState(false);
  const [openDlgImpressao, setOpenDlgImpressao] = useState(false);
  const [sitNegocio, setSitNegocio] = useState([]);
  const [oportunityPanel, setOportunityPanel] = useState([]);
  const [pesqCli_id, setPesqCliId] = useState([]);
  const [optSituacao, setOptSituacao] = useState([]);
  const [optClassificacao, setOptClassificacao] = useState([]);
  const [optPerda, setOptPerda] = useState([]);
  const [optResponsavel, setOptResponsavel] = useState([]);
  const [filtroClassific, setFiltroClassific] = useState('');
  const [filtroSitNeg, setFiltroSitNeg] = useState('');
  const frmCadastro = useRef(null);
  const frmImpressao = useRef(null);

  let oportunityRaia = [];
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCad = Yup.object().shape({
    neg_nome: Yup.string().required('(??)'),
    neg_entidade: Yup.string().required('(??)'),
    neg_responsavel: Yup.string().required('(??)'),
    neg_situacao: Yup.string().required('(??)'),
  });

  const optExibeGrade = [
    { value: 'S', label: 'SIM' },
    { value: 'N', label: 'NÃO' },
  ];

  function limpaRaia() {
    oportunityRaia = [];
  }
  function handleDashboard() {
    history.push('/crm1', '_blank');
    history.go(0);
  }

  async function listaOpPainel(classific, sitNeg, nome) {
    try {
      const response = await api.get(
        `v1/crm/consulta/oportunity_panel?classific=${classific}&sitNeg=${sitNeg}&nome=${nome}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setOportunityPanel(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`, toastOptions);
    }
  }

  const limpaForm = () => {
    frmCadastro.current.setFieldValue('neg_id', '');
    frmCadastro.current.setFieldValue('neg_nome', '');
    frmCadastro.current.setFieldValue('neg_descricao', '');
    frmCadastro.current.setFieldValue('neg_entidade', '');
    frmCadastro.current.setFieldValue('neg_valor', '');
    frmCadastro.current.setFieldValue('neg_responsavel', '');
    frmCadastro.current.setFieldValue('neg_situacao', '');
    frmCadastro.current.setFieldValue('neg_classificacao', '');
    frmCadastro.current.setFieldValue('neg_motivo_perda', '');
    frmCadastro.current.setFieldValue('neg_ativo', '');
  };

  async function handleNovo() {
    limpaForm();
    setOpenCadastro(true);
  }

  async function handleEdit(id) {
    try {
      if (id) {
        setLoading(true);
        const param = {
          neg_id: id,
        };
        const response = await api.post(
          `v1/crm/consulta/oportunity_param`,
          param
        );
        const dados = response.data.retorno[0];

        frmCadastro.current.setFieldValue('neg_id', dados.neg_id);
        frmCadastro.current.setFieldValue('neg_nome', dados.neg_nome);
        frmCadastro.current.setFieldValue('neg_descricao', dados.neg_descricao);

        let x = {
          value: dados.neg_entidade,
          label: dados.cli_razao_social,
        };

        if (x) {
          frmCadastro.current.setFieldValue('neg_entidade', x);
        }

        frmCadastro.current.setFieldValue(
          'neg_valor',
          FormataMoeda(dados.neg_valor).replace('R$', '').trim()
        );

        x = optResponsavel.find(
          (op) => op.value.toString() === dados.neg_responsavel.toString()
        );
        frmCadastro.current.setFieldValue('neg_responsavel', {
          value: x.value,
          label: x.label,
        });

        x = optSituacao.find(
          (op) => op.value.toString() === dados.neg_situacao.toString()
        );
        frmCadastro.current.setFieldValue('neg_situacao', {
          value: x.value,
          label: x.label,
        });

        if (dados.neg_classificacao) {
          x = optClassificacao.find(
            (op) => op.value.toString() === dados.neg_classificacao.toString()
          );
          frmCadastro.current.setFieldValue('neg_classificacao', {
            value: x.value,
            label: x.label,
          });
        }

        if (dados.neg_motivo_perda) {
          x = optPerda.find(
            (op) => op.value.toString() === dados.neg_motivo_perda.toString()
          );
          frmCadastro.current.setFieldValue('neg_motivo_perda', {
            value: x.value,
            label: x.label,
          });
        }

        frmCadastro.current.setFieldValue(
          'neg_ativo',
          optExibeGrade.find((op) => op.value === dados.neg_ativo)
        );

        setOpenCadastro(true);
        setLoading(false);
      } else {
        toast.info(
          `Selecione uma oportunidade para continuar... `,
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar oportunidade \n${error}`, toastOptions);
    }
  }

  async function handleActivity(id, nome) {
    if (id) {
      history.push(`/crm6?neg_id=${id}&neg_nome=${nome}`, '_blank');
      history.go(0);
    } else {
      toast.info(`Selecione uma oportunidade para continuar... `, toastOptions);
    }
  }

  async function handleSubmit() {
    try {
      const formData = frmCadastro.current.getData();
      frmCadastro.current.setErrors({});
      await schemaCad.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);

      const oportunity = {
        neg_id: formData.neg_id,
        neg_nome: formData.neg_nome,
        neg_descricao: formData.neg_descricao,
        neg_entidade: parseInt(formData.neg_entidade, 10),
        neg_valor: toDecimal(formData.neg_valor || 0),
        neg_responsavel: parseInt(formData.neg_responsavel),
        neg_situacao: formData.neg_situacao,
        neg_classificacao: parseInt(formData.neg_classificacao),
        neg_motivo_perda: formData.neg_motivo_perda || null,
        neg_ativo: formData.neg_ativo,
      };

      if (!formData.neg_id) delete oportunity.neg_id;

      const retorno = await api.post('v1/crm/cad/negocio', oportunity);
      if (retorno.data.success) {
        await listaOpPainel('', '', '');
        toast.info('Cadastro realizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
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
        toast.error(`Erro salvar cadastro: ${err}`, toastOptions);
      }

      frmCadastro.current.setFieldError('neg_nome', validationErrors.neg_nome);
      frmCadastro.current.setFieldError(
        'neg_responsavel',
        validationErrors.neg_responsavel
      );
      frmCadastro.current.setFieldError(
        'neg_entidade',
        validationErrors.neg_entidade
      );
      frmCadastro.current.setFieldError(
        'neg_situacao',
        validationErrors.neg_situacao
      );
    }
  }

  /*
  async function handleOportunity(id) {
    let obj;
    if (neg_id) {
      obj = document.getElementById(neg_id);
      obj.style.border = 'none';
    }

    obj = document.getElementById(id);
    obj.style.border = 'solid 2px #49FF43';
    setNeg_id(id);
  }
  */
  async function listaGeral(tab_id) {
    try {
      const response = await api.get(`v1/shared/consulta/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 30) {
          setSitNegocio(dados);
          setFiltroSitNeg(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 30) {
          setOptSituacao(dados);
        } else if (tab_id === 27) {
          setOptClassificacao(dados);
        } else if (tab_id === 28) {
          setOptPerda(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  const loadOptionsEntidade = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();
      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=10&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=10&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function comboResponsavel() {
    try {
      const response = await api.get(`v1/combos/resp_crm`);
      const dados = response.data.retorno;
      if (dados) {
        setOptResponsavel(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function handleFiltrarFunil(situacao) {
    if (situacao) {
      const x = filtroSitNeg.find(
        (op) => op.ger_id.toString() === situacao.value.toString()
      );
      const sn = [];
      sn.push(x);
      setSitNegocio(sn);
    } else {
      setSitNegocio(filtroSitNeg);
    }
  }

  async function handleImpressao() {
    try {
      setLoading(true);
      const frm = frmImpressao.current.getData();
      const url = `v1/crm/report/rel_oportunidade?neg_situacao=${frm.imp_situacao}&mot_perda=${frm.imp_motivo_perda}&neg_responsavel=${frm.imp_responsavel}`;

      const response = await api.get(url);
      const link = response.data;
      setLoading(false);
      window.open(link, '_blank');
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao gerar impressão \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    listaGeral(30); // situação do negocio
    listaOpPainel('', '', '');
    comboResponsavel();
    comboGeral(30);
    comboGeral(27);
    comboGeral(28);
  }, []);

  useEffect(() => {
    listaOpPainel(filtroClassific, filtroSitNeg, '');
  }, [filtroClassific, filtroSitNeg]);

  return (
    <>
      <ToolBar>
        <BootstrapTooltip title="Cadastrar nova oportunidade" placement="left">
          <button type="button" onClick={handleNovo}>
            <MdAdd size={38} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="10px" />

        <BootstrapTooltip title="CADASTRO GERAL DE CLIENTES" placement="left">
          <button type="button" onClick={() => window.open('/crm4', '_blank')}>
            <FaUserTie size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador hg="15px" />

        <BootstrapTooltip
          title="RELATÓRIO DE CLIENTES EM NEGOCIAÇÃO"
          placement="left"
        >
          <button type="button" onClick={() => setOpenDlgImpressao(true)}>
            <FaPrint size={25} color="#fff" />
          </button>
        </BootstrapTooltip>
      </ToolBar>
      <Container id="pgEntidade">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>CRM - GERENCIAR OPORTUNIDADES</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <BoxItemCad fr="1fr 1fr 1fr">
            <AreaComp wd="100">
              <Select
                id="filtroClass"
                onChange={(e) => setFiltroClassific(e ? e.value : '')}
                options={optClassificacao}
                isClearable
                placeholder="FILTRAR POR CLASSIFICAÇÃO"
              />
            </AreaComp>
            <AreaComp wd="100">
              <Select
                id="filtroSitNeg"
                onChange={(e) => handleFiltrarFunil(e || null)}
                options={optSituacao}
                isClearable
                placeholder="FILTRAR POR SITUAÇÃO DO NEGÓCIO"
              />
            </AreaComp>
            <AreaComp wd="100">
              <input
                type="text"
                name="filtroNegNome"
                placeholder="PESQUISAR NOME"
                onChange={async (e) => {
                  if (e.target.value) {
                    if (e.target.value.length > 2)
                      listaOpPainel(
                        filtroClassific,
                        filtroSitNeg,
                        e.target.value
                      );
                  } else {
                    listaOpPainel(filtroClassific, filtroSitNeg, '');
                  }
                }}
                className="input_cad"
              />
            </AreaComp>
          </BoxItemCad>

          <Scroll>
            <BoxRaia hg="97%">
              {sitNegocio.map((sit) => (
                <>
                  {limpaRaia()}
                  {oportunityPanel.forEach((o) => {
                    if (o.neg_situacao.toString() === sit.ger_id.toString()) {
                      oportunityRaia.push(o);
                    }
                  })}

                  <Raia>
                    <h1>{sit.ger_descricao}</h1>
                    <Scroll>
                      {oportunityRaia.map((op) => (
                        <Oportunidade id={op.neg_id}>
                          <button type="button">
                            <h1>{op.neg_nome}</h1>
                            <h3>{`Responsável.: ${op.responsavel}`}</h3>
                            <h3>{`Empresa......: ${op.entidade}`}</h3>
                            <h2>{`Valor Estimado: ${FormataMoeda(
                              op.neg_valor
                            )}`}</h2>

                            <BoxControles>
                              <Controles>
                                <Space pddin="0px 7px 0px 0px">
                                  <BootstrapTooltip
                                    title="Editar oportunidade selecionada"
                                    placement="down"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(op.neg_id)}
                                    >
                                      <FaEdit size={22} color="#49584C" />
                                    </button>
                                  </BootstrapTooltip>
                                </Space>
                                <BootstrapTooltip
                                  title="Gerenciar Atividade"
                                  placement="down"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleActivity(op.neg_id, op.neg_nome)
                                    }
                                  >
                                    <FaTasks size={22} color="#49584C" />
                                  </button>
                                </BootstrapTooltip>
                              </Controles>
                              <Controles cor={op.cor}>
                                <BootstrapTooltip
                                  title={op.sinalizador}
                                  placement="left"
                                >
                                  <span>.</span>
                                </BootstrapTooltip>
                              </Controles>
                            </BoxControles>
                          </button>
                        </Oportunidade>
                      ))}
                    </Scroll>
                  </Raia>
                </>
              ))}
            </BoxRaia>
          </Scroll>
        </Content>
      </Container>

      {/* popup tela de cadastro oportunidade */}
      <Slide direction="down" in={openCadastro}>
        <Dialog
          open={openCadastro}
          keepMounted
          fullWidth
          maxWidth="md"
          onClose={() => setOpenCadastro(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Cadastro de Oportunidades</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadastro(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <Form ref={frmCadastro}>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>Código</label>
                  <Input
                    type="text"
                    readOnly
                    name="neg_id"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Nome/Titulo</label>
                  <Input
                    type="text"
                    name="neg_nome"
                    className="input_cad"
                    maxlength="30"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Descrição</label>
                  <Input
                    type="text"
                    name="neg_descricao"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="neg_entidade"
                    label="Entidade Vinculada"
                    value={pesqCli_id}
                    placeholder="PESQUISA POR CLIENTE"
                    onChange={(e) => setPesqCliId(e || [])}
                    loadOptions={loadOptionsEntidade}
                    zindex="153"
                    isClearable
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Responsável pelo acompanhamento"
                    name="neg_responsavel"
                    optionsList={optResponsavel}
                    zindex="153"
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="Situação"
                    name="neg_situacao"
                    zindex="152"
                    optionsList={optSituacao}
                    placeholder="Informe"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Classificação"
                    name="neg_classificacao"
                    zindex="151"
                    optionsList={optClassificacao}
                    placeholder="Informe"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Motivo de Perda"
                    name="neg_motivo_perda"
                    optionsList={optPerda}
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <label>Valor Estimado</label>
                  <Input
                    type="text"
                    name="neg_valor"
                    className="input_cad"
                    onChange={maskDecimal}
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="Exibir na grade"
                    name="neg_ativo"
                    optionsList={optExibeGrade}
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>
              <Linha />
              <BoxItemCadNoQuery fr="1fr" ptop="20px" just="center">
                <DivLimitadorRow>
                  <DivLimitador wd="160px">
                    <button
                      type="button"
                      className="btn2"
                      onClick={handleSubmit}
                    >
                      {loading ? 'Aguarde Processando...' : 'Salvar Cadastro'}
                      <MdSave size={20} color="#fff" />
                    </button>
                  </DivLimitador>
                </DivLimitadorRow>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Dialog>
      </Slide>
      {/* fim popup cadastro */}

      {/* popup para impressao... */}
      <Popup
        isOpen={openDlgImpressao}
        closeDialogFn={() => setOpenDlgImpressao(false)}
        title="RELATÓRIO DE CLIENTES EM NEGOCIAÇÃO"
        size="sm"
      >
        <Panel
          lefth1="left"
          bckgnd="#dae2e5"
          mtop="1px"
          pdding="5px 7px 7px 10px"
        >
          <Form id="frmImpressao" ref={frmImpressao}>
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="Atendente/vendedor(a)"
                  name="imp_responsavel"
                  optionsList={optResponsavel}
                  zindex="153"
                  placeholder="Informe"
                />
              </AreaComp>
              <AreaComp wd="100">
                <FormSelect
                  label="Motivo de Perda"
                  name="imp_motivo_perda"
                  optionsList={optPerda}
                  placeholder="Informe"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCad fr="1fr 1fr">
              <AreaComp wd="100">
                <FormSelect
                  label="Situação"
                  name="imp_situacao"
                  zindex="152"
                  optionsList={optSituacao}
                  placeholder="Informe"
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr" ptop="15px">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeralForm"
                  onClick={handleImpressao}
                >
                  GERAR IMPRESSÃO
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
        title="CRM - GESTÃO DE CLIENTES"
        message="Aguarde Processamento..."
      />
    </>
  );
}
