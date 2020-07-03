/* eslint-disable radix */
import React, { useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import JoditEditor from 'jodit-react';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MdClose,
  MdSave,
  MdPlaylistAdd,
  MdSettingsBackupRestore,
} from 'react-icons/md';
import { FaRegAddressCard, FaEdit, FaCheckCircle } from 'react-icons/fa';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import Input from '~/componentes/Input';
import FormSelect from '~/componentes/Select';
import {
  Container,
  Content,
  ToolBar,
  Raia,
  BoxRaia,
  Oportunidade,
  Atividade,
  Fluxoatv,
  ToolbarAtv,
  ColunaAtv,
  BtnFiltroAtv,
} from './styles';
import { maskFone } from '~/services/func.uteis';
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
  ToolBarItem,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import api from '~/services/api';

registerLocale('pt', pt);

export default function Crm6() {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const neg_id = query.get('neg_id');
  const neg_nome = query.get('neg_nome');
  const [loading, setLoading] = useState(false);
  const [openCadPessoa, setOpenCadPessoa] = useState(false);
  const [openCadAtv, setOpenCadAtv] = useState(false);
  const [openFimAtv, setOpenFimAtv] = useState(false);
  const [atividade, setAtivdade] = useState([]);
  const [pessoa, setPessoa] = useState([]);
  const [optTipoAtv, setOptTipoAtv] = useState([]);
  const [optResponsavel, setOptResponsavel] = useState([]);
  const [optPessoa, setOptPessoa] = useState([]);
  const [dataIni, setDataIni] = useState(new Date());
  const [dataFin, setDataFin] = useState(new Date());
  const [pes_id, setPes_id] = useState();
  const [indFimAtv, setIndFimAtv] = useState(0);
  const frmCadPessoa = useRef(null);
  const frmCadAtv = useRef(null);
  const editor = useRef(null);

  const configEditor = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/
    toolbar: true,
    language: 'pt_br',
    // theme: 'dark',
    toolbarButtonSize: 'small',
    buttons:
      'bold,strikethrough,underline,eraser,brush,ul,ol,outdent,indent,font,fontsize,,image,video,table,link,align,undo,redo,selectall,hr,fullsize',
    height: 285,
    allowResizeY: false,
    uploader: {
      insertImageAsBase64URI: true,
    },
  };

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const schemaCadPessoa = Yup.object().shape({
    pes_nome: Yup.string().required('(??)'),
    pes_email: Yup.string().email().required('(??)'),
    pes_fone: Yup.string().required('(??)'),
    pes_funcao: Yup.string().required('(??)'),
  });

  const schemaCadAtv = Yup.object().shape({
    atv_tipo: Yup.string().required('(??)'),
    atv_descricao: Yup.string().required('(??)'),
  });

  const optIndicadorAtv = [
    { value: 1, label: 'AGENDADA' },
    { value: 2, label: 'EM ANDAMENTO' },
    { value: 3, label: 'CONCLUÍDA COM SUCESSO' },
    { value: 4, label: 'PARCIALMENTE CONCLUÍDA' },
    { value: 5, label: 'CONCLUÍDA SEM SUCESSO' },
    { value: 6, label: 'NÃO EXECUTADA' },
  ];

  const optIndicadorFimAtv = [
    { value: 3, label: 'CONCLUÍDA COM SUCESSO' },
    { value: 4, label: 'PARCIALMENTE CONCLUÍDA' },
    { value: 5, label: 'CONCLUÍDA SEM SUCESSO' },
    { value: 6, label: 'NÃO EXECUTADA' },
  ];

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

  async function comboPessoa() {
    try {
      const response = await api.get(`v1/combos/pessoa_crm/${neg_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptPessoa(dados);
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
        if (tab_id === 29) {
          setOptTipoAtv(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  function handleOportunidade() {
    history.push('/crm5', '_blank');
  }

  async function handleContato(id) {
    let obj;
    if (pes_id) {
      obj = document.getElementById(pes_id);
      obj.style.border = 'none';
    }

    obj = document.getElementById(id);
    obj.style.border = 'solid 2px #49FF43';
    setPes_id(id);
  }

  async function listaPessoa() {
    try {
      const prm = {
        pes_neg_id: neg_id,
      };
      const response = await api.post(`v1/crm/consulta/consulta_pessoa`, prm);
      const dados = response.data.retorno;
      if (dados) {
        setPessoa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  async function listaAtividade(prm) {
    try {
      const response = await api.get(
        `v1/crm/consulta/atividade/${neg_id}/${prm}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setAtivdade(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  const limpaFormPessoa = () => {
    frmCadPessoa.current.setFieldValue('pes_id', '');
    frmCadPessoa.current.setFieldValue('pes_nome', '');
    frmCadPessoa.current.setFieldValue('pes_email', '');
    frmCadPessoa.current.setFieldValue('pes_fone', '');
    frmCadPessoa.current.setFieldValue('pes_funcao', '');
  };

  async function handleNovoPessoa() {
    limpaFormPessoa();
    setOpenCadPessoa(true);
  }

  async function handleNovoAtividade() {
    if (pessoa.length > 0) {
      setOpenCadAtv(true);
    } else {
      toast.warn(
        'Cadastre a pessoa de contato antes de iniciar uma atividade!!!',
        toastOptions
      );
    }
  }

  async function handleSubmitAtv(formData) {
    try {
      frmCadAtv.current.setErrors({});
      await schemaCadAtv.validate(formData, {
        abortEarly: false,
      });

      if (formData.atv_data_conclusao) {
        toast.error(
          `Atividade concluída... Não pode mais ser alterada`,
          toastOptions
        );
        return;
      }

      setLoading(true);
      let objAtividade;
      if (formData.atv_id) {
        objAtividade = {
          atv_id: formData.atv_id,
          atv_neg_id: neg_id,
          atv_tipo: parseInt(formData.atv_tipo),
          atv_inicio: format(dataIni, 'yyyy-MM-dd HH:mm:ss'),
          atv_fim: format(dataFin, 'yyyy-MM-dd HH:mm:ss'),
          atv_descricao: formData.atv_descricao.toUpperCase(),
          atv_indicador: parseInt(formData.atv_indicador),
          atv_pes_id: formData.atv_pes_id,
          atv_responsavel_id: parseInt(formData.atv_responsavel_id),
        };
      } else {
        objAtividade = {
          atv_neg_id: neg_id,
          atv_tipo: parseInt(formData.atv_tipo),
          atv_inicio: format(dataIni, 'yyyy-MM-dd HH:mm:ss'),
          atv_fim: format(dataFin, 'yyyy-MM-dd HH:mm:ss'),
          atv_descricao: formData.atv_descricao.toUpperCase(),
          atv_indicador: parseInt(formData.atv_indicador),
          atv_pes_id: formData.atv_pes_id,
          atv_responsavel_id: parseInt(formData.atv_responsavel_id),
        };
      }

      const retorno = await api.post('v1/crm/cad/atividade', objAtividade);
      if (retorno.data.success) {
        await listaAtividade();
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
      frmCadAtv.current.setFieldError('atv_tipo', validationErrors.atv_tipo);
      frmCadAtv.current.setFieldError(
        'atv_descricao',
        validationErrors.atv_descricao
      );
    }
  }

  async function handleSubmitPessoa(formData) {
    try {
      frmCadPessoa.current.setErrors({});
      await schemaCadPessoa.validate(formData, {
        abortEarly: false,
      });

      setLoading(true);
      let objPessoa;
      if (formData.pes_id) {
        objPessoa = {
          pes_id: formData.pes_id,
          pes_neg_id: neg_id,
          pes_nome: formData.pes_nome.toUpperCase(),
          pes_email: formData.pes_email,
          pes_fone: formData.pes_fone,
          pes_funcao: formData.pes_funcao,
        };
      } else {
        objPessoa = {
          pes_neg_id: neg_id,
          pes_nome: formData.pes_nome.toUpperCase(),
          pes_email: formData.pes_email,
          pes_fone: formData.pes_fone,
          pes_funcao: formData.pes_funcao,
        };
      }

      const retorno = await api.post('v1/crm/cad/pessoa', objPessoa);
      if (retorno.data.success) {
        await listaPessoa();
        await comboPessoa();
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

      frmCadPessoa.current.setFieldError('pes_nome', validationErrors.pes_nome);
      frmCadPessoa.current.setFieldError(
        'pes_email',
        validationErrors.pes_email
      );
      frmCadPessoa.current.setFieldError('pes_fone', validationErrors.pes_fone);
      frmCadPessoa.current.setFieldError(
        'pes_funcao',
        validationErrors.pes_funcao
      );
    }
  }

  async function handleEditPessoa(pid) {
    try {
      if (pid) {
        setLoading(true);
        const prm = {
          pes_id: pid,
        };
        const response = await api.post(`v1/crm/consulta/consulta_pessoa`, prm);
        const dados = response.data.retorno[0];

        frmCadPessoa.current.setFieldValue('pes_id', dados.pes_id);
        frmCadPessoa.current.setFieldValue('pes_nome', dados.pes_nome);
        frmCadPessoa.current.setFieldValue('pes_email', dados.pes_email);
        frmCadPessoa.current.setFieldValue('pes_fone', dados.pes_fone);
        frmCadPessoa.current.setFieldValue('pes_funcao', dados.pes_funcao);

        setOpenCadPessoa(true);
        setLoading(false);
      } else {
        toast.info(`Selecione um contato para continuar... `, toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cadastro \n${error}`, toastOptions);
    }
  }

  async function handleFinishAtv(id) {
    if (id) {
      document.getElementById('atvid').value = id;
      setOpenFimAtv(true);
    }
  }

  async function handleFinalizar() {
    try {
      setLoading(true);
      const atv = document.getElementById('atvid').value;
      const response = await api.put(
        `v1/crm/cad/atividade/${atv}/${indFimAtv}`
      );
      toast.info(response.data.message, toastOptions);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao finalizar atividade \n${error}`, toastOptions);
    }
  }

  async function handleEditAtv(id) {
    try {
      if (id) {
        setLoading(true);
        const response = await api.get(`v1/crm/consulta/atividade_id/${id}`);
        const dados = response.data.retorno[0];

        frmCadAtv.current.setFieldValue('atv_id', dados.atv_id);
        let x = optTipoAtv.find(
          (op) => op.value.toString() === dados.atv_tipo.toString()
        );
        if (x) {
          frmCadAtv.current.setFieldValue('atv_tipo', {
            value: x.value,
            label: x.label,
          });
        }

        setDataIni(Date.parse(dados.atv_inicio.substring(0, 19)));
        setDataFin(Date.parse(dados.atv_fim.substring(0, 19)));
        frmCadAtv.current.setFieldValue('atv_descricao', dados.atv_descricao);
        frmCadAtv.current.setFieldValue(
          'atv_data_conclusao',
          dados.atv_data_conclusao
            ? format(
                Date.parse(dados.atv_data_conclusao.substring(0, 19)),
                'dd/MM/yyy HH:mm:ss'
              )
            : ''
        );
        frmCadAtv.current.setFieldValue(
          'atv_indicador',
          optIndicadorAtv.find((op) => op.value === dados.atv_indicador)
        );

        x = optPessoa.find(
          (op) => op.value.toString() === dados.atv_pes_id.toString()
        );
        if (x) {
          frmCadAtv.current.setFieldValue('atv_pes_id', {
            value: x.value,
            label: x.label,
          });
        }

        x = optResponsavel.find(
          (op) => op.value.toString() === dados.atv_responsavel_id.toString()
        );
        if (x) {
          frmCadAtv.current.setFieldValue('atv_responsavel_id', {
            value: x.value,
            label: x.label,
          });
        }

        setOpenCadAtv(true);
        setLoading(false);
      } else {
        toast.info(`Selecione uma atividade para continuar... `, toastOptions);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao carregar cadastro \n${error}`, toastOptions);
    }
  }

  async function handleEditor(content, atv_id) {
    const reg = {
      atv_id,
      atv_neg_id: neg_id,
      atv_registros: content,
    };
    const response = await api.post(`v1/crm/cad/atividade`, reg);
    if (response.data.success) {
      await listaAtividade();
    }
  }

  useEffect(() => {
    listaPessoa();
    listaAtividade(0);
    comboResponsavel();
    comboPessoa();
    comboGeral(29); // tipo atividade
  }, []);

  return (
    <>
      <ToolBar>
        <ToolBarItem>
          <BootstrapTooltip title="Voltar para Painel" placement="left">
            <button type="button" onClick={handleOportunidade}>
              <MdSettingsBackupRestore size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
        <BootstrapTooltip title="Cadastrar novo contato" placement="left">
          <button type="button" onClick={handleNovoPessoa}>
            <FaRegAddressCard size={28} color="#fff" />
          </button>
        </BootstrapTooltip>

        <ToolBarItem>
          <BootstrapTooltip title="Cadastrar Atividade" placement="left">
            <button type="button" onClick={handleNovoAtividade}>
              <MdPlaylistAdd size={30} color="#fff" />
            </button>
          </BootstrapTooltip>
        </ToolBarItem>
      </ToolBar>
      <Container id="pgAtividade">
        <TitleBar wd="100%" bckgnd="#dae2e5" lefth1="left">
          <h1>{`GERENCIAR ATIVIDADES - ${neg_nome}`}</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleOportunidade}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>

        <Content>
          <Scroll>
            <BoxRaia>
              <Raia wd="250px">
                <h1>LISTA DE CONTATOS</h1>
                {pessoa.map((p) => (
                  <Oportunidade id={p.pes_id} key={p.pes_id}>
                    <button
                      type="button"
                      onClick={() => handleContato(p.pes_id)}
                    >
                      <h1>{p.pes_nome}</h1>
                      <h3>{`E-mail.: ${p.pes_email}`}</h3>
                      <h3>{`Fone...: ${p.pes_fone}`}</h3>
                      <h2>{p.pes_funcao}</h2>
                    </button>
                    <Linha />
                    <BootstrapTooltip
                      title="Editar Cadastro"
                      placement="bottom"
                    >
                      <button
                        type="button"
                        onClick={() => handleEditPessoa(p.pes_id)}
                      >
                        <FaEdit size={20} color="#325797" />
                      </button>
                    </BootstrapTooltip>
                  </Oportunidade>
                ))}
              </Raia>

              <Raia wd="calc(100% - 240px)">
                <h1>ATIVIDADES CADASTRADAS</h1>
                <BtnFiltroAtv>
                  <button type="button" onClick={() => listaAtividade(0)}>
                    TODAS ATIVIDADES
                  </button>
                  <button type="button" onClick={() => listaAtividade(1)}>
                    ATIVIDADES EM ATRASO
                  </button>
                  <button type="button" onClick={() => listaAtividade(2)}>
                    ATIVIDADES DE HOJE
                  </button>
                  <button type="button" onClick={() => listaAtividade(3)}>
                    ATIVIDADES FUTURA
                  </button>
                  <button type="button" onClick={() => listaAtividade(4)}>
                    ATIVIDADES CONCLUÍDAS
                  </button>
                </BtnFiltroAtv>
                <Scroll>
                  {atividade.map((at) => (
                    <Atividade key={at.atv_id}>
                      <ToolbarAtv>
                        <h1>{at.tipo_atv}</h1>
                        <BootstrapTooltip
                          title="Editar Atividae"
                          placement="bottom"
                        >
                          <button
                            type="button"
                            onClick={() => handleEditAtv(at.atv_id)}
                          >
                            <FaEdit size={20} color="#325797" />
                          </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip
                          title="Finalizar Atividade"
                          placement="bottom"
                        >
                          <button
                            type="button"
                            onClick={() => handleFinishAtv(at.atv_id)}
                          >
                            <FaCheckCircle size={20} color="#325797" />
                          </button>
                        </BootstrapTooltip>
                      </ToolbarAtv>

                      <Linha />

                      <BoxItemCad fr="1fr 3fr">
                        <ColunaAtv>
                          <AreaComp wd="100">
                            <span>Descrição da Atividade:</span>
                            <label>{at.atv_descricao}</label>
                          </AreaComp>
                          <AreaComp wd="100">
                            <span>Responsável</span>
                            <label>{at.responsavel}</label>
                          </AreaComp>
                          <AreaComp wd="100">
                            <span>Data Início</span>
                            <label>
                              {format(
                                Date.parse(at.atv_inicio),
                                'dd/MM/yyy HH:mm:ss'
                              )}
                            </label>
                          </AreaComp>
                          <AreaComp wd="100">
                            <span>Previsão Término</span>
                            <label>
                              {format(
                                Date.parse(at.atv_fim),
                                'dd/MM/yyy HH:mm:ss'
                              )}
                            </label>
                          </AreaComp>

                          <AreaComp wd="100" fontcor="#007EF5">
                            <span>Status Atividade</span>
                            <h2>{at.indicador}</h2>
                          </AreaComp>
                          <AreaComp wd="100">
                            <span>Data de Conclusão</span>
                            <label>
                              {at.atv_data_conclusao
                                ? format(
                                    Date.parse(at.atv_data_conclusao),
                                    'dd/MM/yyy HH:mm:ss'
                                  )
                                : ''}
                            </label>
                          </AreaComp>
                        </ColunaAtv>

                        <ColunaAtv bleft="solid 1px #80583B">
                          <AreaComp wd="100">
                            <span>REGISTROS DA ATIVIDADE</span>
                            <JoditEditor
                              ref={editor}
                              value={
                                at.atv_registros || 'Nenhum evento registrado!!'
                              }
                              config={configEditor}
                              onBlur={(newContent) =>
                                handleEditor(newContent, at.atv_id)
                              }
                            />
                          </AreaComp>
                        </ColunaAtv>
                      </BoxItemCad>
                    </Atividade>
                  ))}
                </Scroll>
              </Raia>
            </BoxRaia>
          </Scroll>
        </Content>
      </Container>

      {/* popup tela de cadastro pessoa (contato negocio) */}
      <Slide direction="down" in={openCadPessoa}>
        <Dialog
          open={openCadPessoa}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenCadPessoa(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Cadastrar pessoa de contato</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadPessoa(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <Form ref={frmCadPessoa} onSubmit={handleSubmitPessoa}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Código:</label>
                  <Input
                    type="text"
                    readOnly
                    name="pes_id"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Nome:</label>
                  <Input type="text" name="pes_nome" className="input_cad" />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>E-mail:</label>
                  <Input type="text" name="pes_email" className="input_cad" />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Fone</label>
                  <Input
                    type="text"
                    name="pes_fone"
                    maxlength="15"
                    onChange={maskFone}
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Função/Cargo:</label>
                  <Input type="text" name="pes_funcao" className="input_cad" />
                </AreaComp>
              </BoxItemCadNoQuery>

              <Linha />
              <BoxItemCadNoQuery fr="1fr" ptop="20px" just="center">
                <DivLimitadorRow>
                  <DivLimitador wd="160px">
                    <button type="submit" className="btn2">
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
      {/* fim popup cadastro pessoa */}

      {/* popup tela de cadastro atividades */}
      <Slide direction="down" in={openCadAtv}>
        <Dialog
          open={openCadAtv}
          keepMounted
          fullWidth
          maxWidth="md"
          onClose={() => setOpenCadAtv(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Cadastro de Atividades</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenCadAtv(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <Form ref={frmCadAtv} onSubmit={handleSubmitAtv}>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <label>Código</label>
                  <Input
                    type="text"
                    readOnly
                    name="atv_id"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Classificaçao da atividade</label>
                  <FormSelect
                    name="atv_tipo"
                    optionsList={optTipoAtv}
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <label>Inicio Atividade</label>
                  <DatePicker
                    selected={dataIni}
                    className="input_cad"
                    locale="pt"
                    name="atv_inicio"
                    onChange={(date) => setDataIni(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Hora"
                    dateFormat="dd/MM/yyy HH:mm:ss"
                    todayButton="Hoje"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Previsão Término</label>
                  <DatePicker
                    selected={dataFin}
                    className="input_cad"
                    locale="pt"
                    name="atv_fim"
                    onChange={(date) => setDataFin(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Hora"
                    dateFormat="dd/MM/yyy HH:mm:ss"
                    todayButton="Hoje"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Data Conclusão</label>
                  <Input
                    type="text"
                    name="atv_data_conclusao"
                    className="input_cad"
                    readOnly
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Descrição da Atividade</label>
                  <Input
                    type="text"
                    name="atv_descricao"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCadNoQuery>
              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <label>Responsável pela Atividade</label>
                  <FormSelect
                    name="atv_responsavel_id"
                    optionsList={optResponsavel}
                    placeholder="Informe"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Contato Envolvido</label>
                  <FormSelect
                    name="atv_pes_id"
                    optionsList={optPessoa}
                    placeholder="Informe se houver"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>Indicador</label>
                  <FormSelect
                    name="atv_indicador"
                    optionsList={optIndicadorAtv}
                    placeholder="Informe"
                  />
                </AreaComp>
              </BoxItemCad>

              <Linha />
              <BoxItemCadNoQuery fr="1fr" ptop="150px" just="center">
                <DivLimitadorRow>
                  <DivLimitador wd="160px">
                    <button type="submit" className="btn2">
                      {loading ? 'Aguarde Processando...' : 'Salvar Atividade'}
                      <MdSave size={20} color="#fff" />
                    </button>
                  </DivLimitador>
                </DivLimitadorRow>
              </BoxItemCadNoQuery>
            </Form>
          </CModal>
        </Dialog>
      </Slide>
      {/* fim popup cadastro atividade */}

      {/* popup finalizar atividade */}
      <Slide direction="down" in={openFimAtv}>
        <Dialog
          open={openFimAtv}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenFimAtv(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>Finalizar Atividade</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenFimAtv(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal wd="100%" hd="50%">
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Código</label>
                <input type="text" readOnly id="atvid" className="input_cad" />
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery>
              <AreaComp wd="100">
                <label>Indicador de Conclusão</label>
                <Select
                  id="atvindicador"
                  options={optIndicadorFimAtv}
                  onChange={(e) => setIndFimAtv(e.value)}
                  placeholder="INFORME O INDICADOR..."
                />
              </AreaComp>
            </BoxItemCadNoQuery>

            <Linha />
            <BoxItemCadNoQuery fr="1fr" ptop="150px" just="center">
              <DivLimitadorRow>
                <DivLimitador wd="190px">
                  <button
                    type="button"
                    className="btn2"
                    onClick={handleFinalizar}
                  >
                    {loading ? 'Aguarde Processando...' : 'Finalizar Atividade'}
                    <MdSave size={20} color="#fff" />
                  </button>
                </DivLimitador>
              </DivLimitadorRow>
            </BoxItemCadNoQuery>
          </CModal>
        </Dialog>
      </Slide>
      {/* fim popup cadastro atividade */}
    </>
  );
}
