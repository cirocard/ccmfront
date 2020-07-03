/* eslint-disable radix */
import React, { useEffect, useState } from 'react';
import { MdClose, MdDelete, MdSave } from 'react-icons/md';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Container, Content, ToolBar } from './styles';
import {
  TitleBar,
  AreaComp,
  CCheck,
  BoxItemCad,
  BoxItemCadNoQuery,
  Linha,
  DivLimitador,
  DivLimitadorRow,
  Scroll,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import api from '~/services/api';

export default function Adm6() {
  // const [altura, setAltura] = React.useState(0);
  const [checked, setChecked] = useState([]);
  const [checkedEmp, setCheckedEmp] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [expandedEmp, setExpandedEmp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuGerado, setMenuGerado] = useState([]);
  const [menuEmp, setMenuEmp] = useState([]);
  const [optEmpresa, setOptEmpresa] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(0);

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

  const getSubMenu = async (item, tpEmpresa) => {
    let response;
    if (tpEmpresa) {
      response = await api.get(
        `/v1/accounts/listar_itens_nivel/${tpEmpresa}/${item}`
      );
    } else {
      response = await api.get(`/v1/accounts/listar_itens_nivel/${item}`);
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

  const getMenu = async (m, tpEmpresa) => {
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
        const itensMenu = await getMenu(d.modulo_itens, tpEmpresa);
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
      let response;
      if (tpEmpresa > 0) {
        response = await api.get('/v1/accounts/menu_empresa');
      } else {
        response = await api.get('/v1/accounts/listar_modulos_full');
      }

      const dados = response.data.retorno;
      if (dados) {
        montaTreeMenu(dados, tpEmpresa);
      }
    } catch (error) {
      toast.error(`Houve um erro ao carregar menu \n${error}`);
    }
  }

  function onCheck(chk) {
    setChecked(chk);
  }

  function onCheckEmp(chk) {
    setCheckedEmp(chk);
  }

  function onExpand(exp) {
    setExpanded(exp);
  }
  function onExpandEmp(exp) {
    setExpandedEmp(exp);
  }

  const handleEmpresa = async (e) => {
    if (e) {
      setSelectedEmp(e.value);
      await getFullMenu(parseInt(e.value));
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
          montaTreeMenu(retorno.data.retorno);
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

  useEffect(() => {
    window.loadMenu();
    getComboEmrpesa();
    getFullMenu(false);
  }, []);

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
              <MdDelete size={30} color="#fff" />
            </button>
          </BootstrapTooltip>
        </DivLimitador>
      </ToolBar>
      <Container id="pgCadMenuEmpresa">
        <TitleBar wd="100%">
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button">
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <Linha />
            <h1>CADASTRO ESTRUTURA DO MENU - EMPRESA</h1>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <label>Empresa</label>
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
              fr="1fr 1fr"
              just="center"
              ptop="15px"
              pbotton="20px"
            >
              <AreaComp wd="100">
                <h1>MENU DO SISTEMA</h1>
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
                <h1>MENU DA EMPRESA</h1>
                <CheckboxTree
                  nodes={menuEmp}
                  expanded={expandedEmp}
                  iconsClass="fa5"
                  showExpandAll
                  noCascade
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
            </BoxItemCadNoQuery>
          </Scroll>
        </Content>
      </Container>
    </>
  );
}
