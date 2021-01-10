/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable radix */
import React, { useEffect, useState } from 'react';
import { MdClose, MdDelete, MdSave } from 'react-icons/md';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Container, Content, ToolBar, ListaUser } from './styles';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  Linha,
  DivLimitador,
  Scroll,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import DialogInfo from '~/componentes/DialogInfo';
import { ApiService, ApiTypes } from '~/services/api';
import history from '~/services/history';

export default function Adm6() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [checked, setChecked] = useState([]);
  const [checkedEmp, setCheckedEmp] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [expandedEmp, setExpandedEmp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuGerado, setMenuGerado] = useState([]);
  const [menuEmp, setMenuEmp] = useState([]);
  const [optEmpresa, setOptEmpresa] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(0);
  const [optUsers, setOptUsers] = useState([]); // usuarios de uma empresa
  const [optUserGroup, setOptUserGroup] = useState([]); // usuarios de um grupo

  const [grupoAdmId, setGrupoAdmId] = useState('');

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  async function getComboEmrpesa() {
    try {
      const response = await api.get('v1/combos/empresas');
      const dados = response.data.retorno;
      if (dados) {
        setOptEmpresa(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo empresas \n${error}`);
    }
  }

  async function getComboUsers(emp_id) {
    try {
      const response = await api.get(`v1/combos/user_empresa/${emp_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUsers(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo usuarios \n${error}`);
    }
  }

  async function getUserGroup(grupo_id) {
    try {
      const response = await api.get(`v1/combos/user_by_group/${grupo_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUserGroup(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar Usuarios do grupo \n${error}`);
    }
  }

  async function getGrupoAdmin(emp_id) {
    try {
      const response = await api.get(`v1/combos/grupo_user_admin/${emp_id}`);
      const dados = response.data.retorno;
      if (dados.length > 0) {
        setGrupoAdmId(dados[0].value);
      } else {
        // cria o grupo se nao existir
        const grpAdm = await api.get(`v1/users/get_grupo_admin/${emp_id}`);
        setGrupoAdmId(grpAdm.data[0].value);
      }
    } catch (error) {
      toast.error(`Erro ao carregar grupo admin \n${error}`, toastOptions);
    }
  }

  const getSubMenu = async (item, tpEmpresa) => {
    let response;
    if (tpEmpresa) {
      response = await api.get(
        `/v1/accounts/listar_itens_nivel_emp_geral/${tpEmpresa}/${item}`
      );
    } else {
      response = await api.get(`/v1/accounts/listar_itens_nivel_geral/${item}`);
    }

    if (response.data.success) {
      const { retorno } = response.data;
      const subNivel = [];

      for (const n of retorno) {
        if (n.rota) {
          subNivel.push({
            value: n.item_id,
            label: n.nome,
          });
        } else {
          // nesse caso existe outro subnivel
          const sub = await getSubMenu(n.item_id);

          subNivel.push({
            value: n.item_id,
            label: n.nome,
            children: sub,
          });
        }
      }

      return subNivel;
    }
    return [];
  };

  const getMenu = async (m, tpEmpresa) => {
    let auxNivel = {};
    const arr = [];
    // gerar um novo array sem os itens de submenu q virao da api depois
    m.forEach((i) => {
      if (!i.codigo_pai || !i.rota) {
        arr.push(i);
      }
    });

    const menuMod = await Promise.all(
      arr.map(async (it) => {
        if (!it.rota) {
          const auxSubNivel = await getSubMenu(it.item_id, tpEmpresa);
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
  async function montaTreeMenu(dados, tpEmpresa) {
    let tree = {};

    const modulo = await Promise.all(
      dados.map(async (d) => {
        const itens = d.modulo_itens.filter(
          (i) => i.rota || (!i.rota && !i.codigo_pai)
        );

        const itensMenu = await getMenu(itens, tpEmpresa);
        tree = {
          value: d.modulo_id,
          label: d.nome,
          children: itensMenu,
        };
        return tree;
      })
    );
    if (tpEmpresa) {
      setMenuEmp(modulo);
    } else {
      setMenuGerado(modulo);
    }
  }

  async function getFullMenu(tpEmpresa) {
    try {
      setLoading(true);
      let response;
      if (tpEmpresa > 0) {
        response = await api.get(`/v1/accounts/menu_empresa/${tpEmpresa}`);
      } else {
        response = await api.get('/v1/accounts/listar_modulos_full');
      }

      const dados = response.data.retorno;
      if (dados) {
        await montaTreeMenu(dados, tpEmpresa);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Houve um erro ao carregar menu \n${error}`);
    }
  }

  const onCheck = (itens, nodeClicked) => {
    const todos = [];

    if (nodeClicked.children) {
      nodeClicked.children.forEach((e) => {
        todos.push(e.value);
        if (e.children) {
          todos.push(e.value);

          e.children.forEach((f) => {
            todos.push(f.value);
          });
        }
      });
    } else {
      itens.forEach((i) => {
        todos.push(i);
      });
    }

    setChecked(todos);
  };

  function onCheckEmp(chk) {
    setCheckedEmp(chk);
  }

  function onExpand(exp) {
    setExpanded(exp);
  }

  function onExpandEmp(exp) {
    setExpandedEmp(exp);
  }

  function handleDashboard() {
    history.push('/', '_blank');
    history.go(0);
  }

  const handleEmpresa = async (e) => {
    if (e) {
      await getGrupoAdmin(e.value);
      await setSelectedEmp(e.value);
      await getComboUsers(e.value);
      await getFullMenu(parseInt(e.value));
    }
  };

  const handleUsers = async (e) => {
    if (e) {
      // vincular usuario ao grupo
      const grpusr = await api.put(
        `v1/users/update_user_group/${e.value}/${grupoAdmId}`
      );

      setOptUserGroup(grpusr.data.retorno);
    }
  };

  // salvar cadastro
  async function handleSalvar() {
    try {
      if (selectedEmp > 0 && checked.length > 0) {
        setLoading(true);
        const menuGravar = [];

        checked.forEach((c) => {
          menuGravar.push({ emp_id: selectedEmp, item_id: c });
        });

        const retorno = await api.post('v1/accounts/menu_empresa', menuGravar);
        if (retorno.data.success) {
          await montaTreeMenu(retorno.data.retorno, selectedEmp);

          const grpAdm = await api.get(
            `v1/users/get_grupo_admin/${selectedEmp}`
          );

          setGrupoAdmId(grpAdm.data[0].value);

          toast.info('Menu salvo com sucesso!!!', toastOptions);
        }
        setLoading(false);
      } else {
        setLoading(false);
        toast.warn(
          'INFORME A EMPRESA, E SELECIONE OS ITENS PARA CONFIGURAR...',
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
      if (selectedEmp > 0 && checkedEmp.length > 0) {
        setLoading(true);
        const menuExcluir = [];

        checkedEmp.forEach((c) => {
          menuExcluir.push({ emp_id: selectedEmp, item_id: c });
        });

        const retorno = await api.post(
          'v1/accounts/delete_menu_empresa',
          menuExcluir
        );

        if (retorno.data.success) {
          await montaTreeMenu(retorno.data.retorno, selectedEmp);

          const grpAdm = await api.get(
            `v1/users/get_grupo_admin/${selectedEmp}`
          );
          setGrupoAdmId(grpAdm.data[0].value);

          toast.info('Menu excluído com sucesso!!!', toastOptions);
        }
        setLoading(false);
      } else {
        setLoading(false);
        toast.warn(
          'INFORME A EMPRESA, E SELECIONE OS ITENS PARA CONTINUAR...',
          toastOptions
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir menu: ${error}`, toastOptions);
    }
  }

  async function handleExcluirUserGrpoup(g) {
    try {
      setLoading(true);
      const updt = await api.put(`v1/users/update_user_group/${g.value}/null`);
      if (updt.data.success) {
        await getUserGroup(grupoAdmId);
      } else {
        toast.error(
          `Erro ao excluir usuario \n${updt.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro ao excluir usuario \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    window.loadMenu();
    getComboEmrpesa();
    getFullMenu(false);
  }, []);

  useEffect(() => {
    if (grupoAdmId) {
      getUserGroup(grupoAdmId);
    }
  }, [grupoAdmId]);

  return (
    <>
      <ToolBar hg="100%" wd="40px" mleft="-2px">
        <BootstrapTooltip title="Salvar Menu" placement="left">
          <button type="button" onClick={handleSalvar}>
            <MdSave size={30} color="#fff" />
          </button>
        </BootstrapTooltip>
        <DivLimitador wd="100%" hd="10px">
          <BootstrapTooltip title="Excluir Menu" placement="right">
            <button type="button">
              <MdDelete size={30} color="#fff" onClick={handleExcluir} />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
      </ToolBar>
      <Container id="pgCadMenuEmpresa">
        <TitleBar wd="100%" bckgnd="#dae2e5">
          <h1>CADASTRO ESTRUTURA DO MENU - EMPRESA</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handleDashboard}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <Select
                  id="empresa"
                  options={optEmpresa}
                  value={optEmpresa.filter((obj) => obj.value === selectedEmp)}
                  isClearable
                  placeholder="INFORME EMPRESA"
                  onChange={handleEmpresa}
                />
              </AreaComp>
            </BoxItemCadNoQuery>

            <Linha />
            <BoxItemCadNoQuery
              fr="1fr 1fr 1fr"
              just="center"
              ptop="15px"
              pbotton="20px"
            >
              <AreaComp wd="100" alself="start">
                <h1>MENU DO SISTEMA</h1>
                <CheckboxTree
                  nodes={menuGerado}
                  checked={checked}
                  expanded={expanded}
                  iconsClass="fa5"
                  onCheck={onCheck}
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
                <h1>MENU DA EMPRESA</h1>
                <CheckboxTree
                  nodes={menuEmp}
                  expanded={expandedEmp}
                  checked={checkedEmp}
                  iconsClass="fa5"
                  showExpandAll
                  // noCascade
                  showNodeIcon={false}
                  onCheck={(chk) => onCheckEmp(chk)}
                  onExpand={(exp) => onExpandEmp(exp)}
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
                <h1>USUÁRIOS DO GRUPO ADMINISTRADOR</h1>
                <Select
                  id="users"
                  options={optUsers}
                  isClearable
                  placeholder="INFORME O USUÁRIO"
                  onChange={handleUsers}
                />
                {optUserGroup.map((g) =>
                  g.value ? (
                    <ListaUser>
                      <ul>
                        <li key={g.value}>
                          {g.label}
                          <BootstrapTooltip
                            title="Excluir do grupo"
                            placement="top"
                          >
                            <button type="button">
                              <MdDelete
                                size={20}
                                color="#244448"
                                onClick={() => handleExcluirUserGrpoup(g)}
                              />
                            </button>
                          </BootstrapTooltip>
                        </li>
                      </ul>
                    </ListaUser>
                  ) : (
                    <ListaUser />
                  )
                )}
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
        title="PERMISSÃO DE ACESSO"
        message="Aguarde Processamento..."
      />
    </>
  );
}
