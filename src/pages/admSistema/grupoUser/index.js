/* eslint-disable radix */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MdClose, MdDelete, MdSave, MdAddCircleOutline } from 'react-icons/md';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import { Container, Content, ToolBar } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Linha,
  DivLimitador,
  Scroll,
  CModal,
  DivLimitadorRow,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { ApiService, ApiTypes } from '~/services/api';
import history from '~/services/history';
import DialogInfo from '~/componentes/DialogInfo';

export default function Adm4() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const { emp_id } = useSelector((state) => state.auth);
  const [checked, setChecked] = useState([]);
  const [checkedGrupo, setCheckedGrupo] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [expandedGrupo, setExpandedGrupo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openGrupo, setOpenGrupo] = useState(false);
  const [menuGerado, setMenuGerado] = useState([]);
  const [menuGroup, setMenuGroup] = useState([]);
  const [optGrupo, setOptGrupo] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState(0);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  async function getComboGrupo() {
    try {
      const response = await api.get('v1/combos/grupo_user');
      const dados = response.data.retorno;
      if (dados) {
        setOptGrupo(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar grupos de usuario \n${error}`);
    }
  }

  const getSubMenu = async (item, grupo) => {
    let response;
    if (grupo) {
      response = await api.get(
        `/v1/users/listar_itens_nivel_group/${grupo}/${item}`
      );
    } else {
      response = await api.get(
        `/v1/accounts/listar_itens_nivel_emp_logada/${item}`
      );
    }

    if (response.data.success) {
      const { retorno } = response.data;
      const subNivel = [];
      retorno.map(async (n) => {
        subNivel.push({
          value: n.item_id,
          label: n.nome,
        });
      });
      return subNivel;
    }
    return [];
  };

  const getMenu = async (m, grupo) => {
    let auxNivel = {};
    const arr = [];
    // gerar um novo array sem os itens de submenu q virao da api depois

    m.forEach((i) => {
      if (!i.codigo_pai) {
        arr.push(i);
      }
    });

    const menuMod = await Promise.all(
      arr.map(async (it) => {
        if (!it.rota) {
          const auxSubNivel = await getSubMenu(it.item_id, grupo);
          auxNivel = {
            value: it.item_id,
            label: it.nome,
            children: auxSubNivel,
          };
        } else if (!it.codigo_pai) {
          auxNivel = { value: it.item_id, label: it.nome };
        }

        return auxNivel;
      })
    );

    return menuMod;
  };
  // monta o treeview
  async function montaTreeMenu(dados, grupo) {
    let tree = {};

    const modulo = await Promise.all(
      dados.map(async (d) => {
        const itensMenu = await getMenu(d.modulo_itens, grupo);

        tree = {
          value: d.modulo_id,
          label: d.nome,
          children: itensMenu,
        };
        return tree;
      })
    );
    if (grupo) {
      setMenuGroup(modulo);
    } else {
      setMenuGerado(modulo);
    }
  }

  async function getFullMenu(grupo) {
    try {
      setLoading(true);
      let response;
      if (grupo) {
        response = await api.get(`/v1/users/grupo_user/${grupo}`);
      } else {
        response = await api.get(`/v1/accounts/menu_empresa/${emp_id}`);
      }

      const dados = response.data.retorno;
      if (dados) {
        await montaTreeMenu(dados, grupo);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Houve um erro ao carregar menu \n${error}`);
    }
  }

  function onCheck(chk) {
    setChecked(chk);
  }

  function onCheckGrupo(chk) {
    setCheckedGrupo(chk);
  }

  function onExpand(exp) {
    setExpanded(exp);
  }
  function onExpandGrupo(exp) {
    setExpandedGrupo(exp);
  }

  const handleGrupo = async (e) => {
    if (e) {
      setSelectedGrupo(e);
      if (e.value) {
        await getFullMenu(e.value);
      } else {
        setMenuGroup([]);
      }
    }
  };

  function handleDashboard() {
    history.push('/', '_blank');
  }

  // novo grupo
  function handleNovoGrupo() {
    document.getElementById('nomeGrupo').value = '';
    setOpenGrupo(true);
  }

  function handleConfirmarGrupo() {
    const grp = {
      value: '',
      label: document.getElementById('nomeGrupo').value.toUpperCase(),
    };
    optGrupo.push(grp);
    setSelectedGrupo(grp);
    setMenuGroup([]);
    setOpenGrupo(false);
  }

  // salvar cadastro
  async function handleSalvar() {
    try {
      if (selectedGrupo.label && checked.length > 0) {
        setLoading(true);
        const menuGravar = [];

        checked.forEach((c) => {
          menuGravar.push({
            grupo_id: selectedGrupo.value,
            emp_id,
            item_id: c,
            descricao: selectedGrupo.label,
          });
        });
        const retorno = await api.post('v1/users/grupo_user', menuGravar);
        if (retorno.data.success) {
          montaTreeMenu(retorno.data.retorno, retorno.data.message);
          toast.info('Menu salvo com sucesso!!!', toastOptions);
        } else {
          toast.error(retorno.data.message, toastOptions);
        }
        setLoading(false);
      } else {
        setLoading(false);
        toast.warn(
          'INFORME O GRUPO, E SELECIONE OS ITENS PARA CONFIGURAR...',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro salvar menu: ${error}`, toastOptions);
    }
  }

  async function handleExcluir() {
    try {
      if (selectedGrupo && checkedGrupo.length > 0) {
        setLoading(true);
        const menuExcluir = [];

        checkedGrupo.forEach((c) => {
          menuExcluir.push({
            grupo_id: selectedGrupo.value,
            emp_id,
            item_id: c,
          });
        });

        const retorno = await api.post(
          'v1/users/delete_grupo_user',
          menuExcluir
        );

        if (retorno.data.success) {
          montaTreeMenu(retorno.data.retorno, selectedGrupo);
          toast.info('Permissão excluída com sucesso!!!', toastOptions);
        } else {
          toast.error(retorno.data.message, toastOptions);
        }
        setLoading(false);
      } else {
        setLoading(false);
        toast.warn(
          'INFORME O GRUPO, E SELECIONE OS ITENS PARA CONTINUAR...',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir menu: ${error}`, toastOptions);
    }
  }

  useEffect(() => {
    window.loadMenu();
    getComboGrupo();
    getFullMenu(null);
  }, []);

  return (
    <>
      <ToolBar hg="100%" wd="40px" mleft="-2px">
        <DivLimitador wd="100%" hd="10px">
          <BootstrapTooltip title="Cadastrar Novo Grupo" placement="right">
            <button type="button" onClick={handleNovoGrupo}>
              <MdAddCircleOutline size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
        <DivLimitador wd="100%" hd="10px">
          <BootstrapTooltip title="Salvar Cadastro" placement="left">
            <button type="button" onClick={handleSalvar}>
              <MdSave size={28} color="#fff" />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
        <DivLimitador wd="100%" hd="10px">
          <BootstrapTooltip title="Excluir item" placement="right">
            <button type="button" onClick={handleExcluir}>
              <MdDelete size={30} color="#fff" />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
      </ToolBar>
      <Container id="pgCadMenuEmpresa">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>CADASTRO GRUPO DE USUÁRIOS</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <Linha />

            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Grupos Cadastrados</label>
                <Select
                  id="grupoUser"
                  options={optGrupo}
                  value={optGrupo.filter(
                    (obj) => obj.value === selectedGrupo.value
                  )}
                  isClearable
                  placeholder="INFORME O GRUPO DE USUÁRIO"
                  onChange={handleGrupo}
                />
              </AreaComp>
            </BoxItemCadNoQuery>

            <Linha />
            <BoxItemCadNoQuery
              fr="1fr 1fr"
              just="center"
              ptop="15px"
              pbotton="20px"
            >
              <AreaComp wd="100">
                <h1>PERMISSÕES DE ACESSO DA EMPRESA</h1>
                <CheckboxTree
                  nodes={menuGerado}
                  checked={checked}
                  expanded={expanded}
                  iconsClass="fa5"
                  onCheck={(chk) => onCheck(chk)}
                  onExpand={(exp) => onExpand(exp)}
                  showExpandAll
                  showNodeIcon={false}
                  icons={{
                    expandClose: (
                      <span
                        className="fas fa-chevron-circle-right"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    expandOpen: (
                      <span
                        className="fas fa-chevron-circle-down"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    expandAll: (
                      <span
                        className="fas fa-plus-circle"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    collapseAll: (
                      <span
                        className="fas fa-minus-circle"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                  }}
                />
              </AreaComp>
              <AreaComp wd="100" alself="start">
                <h1>PERMISSÕES DE ACESSO DO GRUPO</h1>
                <CheckboxTree
                  nodes={menuGroup}
                  expanded={expandedGrupo}
                  checked={checkedGrupo}
                  iconsClass="fa5"
                  showExpandAll
                  // noCascade
                  showNodeIcon={false}
                  onCheck={(chk) => onCheckGrupo(chk)}
                  onExpand={(exp) => onExpandGrupo(exp)}
                  icons={{
                    expandClose: (
                      <span
                        className="fas fa-chevron-circle-right"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    expandOpen: (
                      <span
                        className="fas fa-chevron-circle-down"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    expandAll: (
                      <span
                        className="fas fa-plus-circle"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                    collapseAll: (
                      <span
                        className="fas fa-minus-circle"
                        style={{ color: '#244448', fontSize: '16px' }}
                      />
                    ),
                  }}
                />
              </AreaComp>
            </BoxItemCadNoQuery>
          </Scroll>
        </Content>
      </Container>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="GRUPO DE USUÁRIOS"
        message="Aguarde Processamento..."
      />

      {/* popup novo grupo */}
      <Slide direction="down" in={openGrupo}>
        <Dialog
          open={openGrupo}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenGrupo(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>CADASTRAR NOVO GRUPO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenGrupo(false)}>
                <MdClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>
          <Scroll>
            <CModal wd="100%" hd="98%">
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <label>Nome do Grupo</label>
                  <input type="text" id="nomeGrupo" className="input_cad" />
                </AreaComp>
              </BoxItemCadNoQuery>

              <BoxItemCadNoQuery fr="1fr" ptop="50px" just="center">
                <DivLimitadorRow>
                  <DivLimitador wd="160px">
                    <button
                      type="button"
                      className="btn2"
                      onClick={handleConfirmarGrupo}
                    >
                      Confirmar Grupo
                      <MdSave size={20} color="#fff" />
                    </button>
                  </DivLimitador>
                </DivLimitadorRow>
              </BoxItemCadNoQuery>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>
      {/* fim popup cadastro */}
    </>
  );
}
