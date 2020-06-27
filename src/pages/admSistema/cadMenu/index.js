import React, { useEffect, useState } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import { MdClose, MdAddCircle, MdSave } from 'react-icons/md';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { toast } from 'react-toastify';
import { Container, Content } from './styles';
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

export default function Adm1() {
  const [altura, setAltura] = React.useState(0);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [clicked, setClicked] = useState({});
  const [loading, setLoading] = useState(false);
  const [menuGerado, setMenuGerado] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const getSubMenu = async (item) => {
    const response = await api.get(`/v1/accounts/listar_itens_nivel/${item}`);
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

  const getMenu = async (m) => {
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
          const auxSubNivel = await getSubMenu(it.item_id);
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
  async function montaTreeMenu(dados) {
    let tree = {};
    const modulo = await Promise.all(
      dados.map(async (d) => {
        const itensMenu = await getMenu(d.modulo_itens);
        tree = {
          value: d.modulo_id,
          label: d.nome,
          children: itensMenu,
        };
        return tree;
      })
    );
    setMenuGerado(modulo);
  }

  function onCheck(chk) {
    setChecked(chk);
  }

  function onExpand(exp) {
    setExpanded(exp);
  }

  async function onClick(ck) {
    if (!ck.isChild) {
      // modulo
      const response = await api.get(
        `/v1/accounts/listar_modulos_id/${ck.value}`
      );
      if (response.data.success) {
        const ret = response.data.retorno;
        document.getElementsByName('modulo_id')[0].value = ret.modulo_id;
        document.getElementsByName('modulo')[0].value = ret.nome;
        document.getElementsByName('identificador')[0].value =
          ret.identificador;
        document.getElementsByName('icon')[0].value = ret.icone;
      }
    } else {
      const response = await api.get(
        `/v1/accounts/listar_modulo_itens/${ck.value}`
      );

      if (response.data.success) {
        const ret = response.data.retorno;
        document.getElementsByName('modulo_id')[0].value = ret.modulo_id;
        document.getElementsByName('codigoPai')[0].value = ret.codigo_pai;
        document.getElementsByName('item_id')[0].value = ret.item_id;
        document.getElementsByName('titulo')[0].value = ret.nome;
        document.getElementsByName('nomeTag')[0].value = ret.identificador;
        document.getElementsByName('iconItem')[0].value = ret.icone;
        document.getElementsByName('rotaItem')[0].value = ret.rota;
      }
    }

    setClicked(ck);
  }

  function handleNovoModulo() {
    document.getElementsByName('modulo_id')[0].value = '';
    document.getElementsByName('modulo')[0].value = '';
    document.getElementsByName('identificador')[0].value = '';
    document.getElementsByName('icon')[0].value = '';
  }

  function handleNovoItem() {
    document.getElementsByName('codigoPai')[0].value = '';
    document.getElementsByName('item_id')[0].value = '';
    document.getElementsByName('titulo')[0].value = '';
    document.getElementsByName('nomeTag')[0].value = '';
    document.getElementsByName('iconItem')[0].value = '';
    document.getElementsByName('rotaItem')[0].value = '';
  }

  // salvar cadastro
  async function handleSalvar() {
    try {
      setLoading(true);
      let modulo = {};
      let itens = {};
      let retorno = '';
      // adicionando item
      if (!document.getElementsByName('modulo_id')[0].value) {
        modulo = {
          nome: document.getElementsByName('modulo')[0].value,
          identificador: document.getElementsByName('identificador')[0].value,
          icone: document.getElementsByName('icon')[0].value,
        };
      } else {
        modulo = {
          modulo_id: document.getElementsByName('modulo_id')[0].value,
          nome: document.getElementsByName('modulo')[0].value,
          identificador: document.getElementsByName('identificador')[0].value,
          icone: document.getElementsByName('icon')[0].value,
        };
      }
      if (document.getElementsByName('item_id')[0].value) {
        itens = {
          item_id: document.getElementsByName('item_id')[0].value,
          modulo_id: document.getElementsByName('modulo_id')[0].value,
          nome: document.getElementsByName('titulo')[0].value,
          icone: document.getElementsByName('iconItem')[0].value,
          identificador: document.getElementsByName('nomeTag')[0].value,
          rota: document.getElementsByName('rotaItem')[0].value,
          codigo_pai: document.getElementsByName('codigoPai')[0].value,
        };
      } else {
        itens = {
          modulo_id: document.getElementsByName('modulo_id')[0].value,
          nome: document.getElementsByName('titulo')[0].value,
          icone: document.getElementsByName('iconItem')[0].value,
          identificador: document.getElementsByName('nomeTag')[0].value,
          rota: document.getElementsByName('rotaItem')[0].value,
          codigo_pai: document.getElementsByName('codigoPai')[0].value,
        };
      }

      const dados = { modulo, itens };
      if (!document.getElementsByName('modulo_id')[0].value) {
        retorno = await api.post('v1/accounts/menu', dados);
      } else {
        retorno = await api.put('v1/accounts/menu', dados);
      }

      if (retorno.data.success) {
        montaTreeMenu(retorno.data.retorno);
        toast.info('Menu salvo com sucesso!!!', toastOptions);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro salvar menu: ${error}`, toastOptions);
    }
  }

  useEffect(() => {
    async function getFullMenu() {
      try {
        const response = await api.get('/v1/accounts/listar_modulos_full');
        const dados = response.data.retorno;
        if (dados) {
          montaTreeMenu(dados);
        }
      } catch (error) {
        toast.error(`Houve um erro ao carregar menu \n${error}`);
      }
    }
    window.loadMenu();
    getFullMenu();
  }, []);

  return (
    <>
      <Container id="pgCadMenu">
        <WindowSizeListener
          onResize={(windowSize) => {
            setAltura(windowSize.windowHeight - 6);
          }}
        />
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
            <h1>CADASTRO ESTRUTURA DO MENU.</h1>
            <BoxItemCad fr="1fr 1fr 1fr 1fr">
              <AreaComp wd="100">
                <label>Código Módulo</label>
                <input
                  type="text"
                  name="modulo_id"
                  readOnly="true"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Módulo</label>
                <input
                  type="text"
                  name="modulo"
                  placeholder="Nome Modulo"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Identificaçaão</label>
                <input
                  type="text"
                  name="identificador"
                  placeholder="id modulo"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Icon</label>
                <input
                  type="text"
                  name="icon"
                  placeholder="Icon Awesome"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <h1>ITENS DO MÓDULO</h1>
            <BoxItemCad fr="1fr 1fr 1fr">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="radio"
                    id="rbItem"
                    name="radio"
                    value="S"
                    checked
                  />
                  <label htmlFor="rbItem">Inserir Item</label>
                </CCheck>
                <CCheck>
                  <input type="radio" id="rbSubItem" name="radio" value="S" />
                  <label htmlFor="rbSubItem">Inserir item com sub-item</label>
                </CCheck>
              </AreaComp>

              <AreaComp wd="100">
                <label>Código Item</label>
                <input
                  type="text"
                  name="item_id"
                  readOnly="true"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Código Pai</label>
                <input type="text" name="codigoPai" className="input_cad" />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCad fr="1fr 1fr 1fr 1fr">
              <AreaComp wd="100">
                <label>Titulo</label>
                <input type="text" name="titulo" className="input_cad" />
              </AreaComp>
              <AreaComp wd="100">
                <label>Ícone</label>
                <input type="text" name="iconItem" className="input_cad" />
              </AreaComp>
              <AreaComp wd="100">
                <label>Nome tag</label>
                <input type="text" name="nomeTag" className="input_cad" />
              </AreaComp>
              <AreaComp wd="100">
                <label>Rota item</label>
                <input type="text" name="rotaItem" className="input_cad" />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCadNoQuery fr="1fr" just="right">
              <DivLimitadorRow>
                <DivLimitador wd="200px">
                  <button
                    type="button"
                    className="btn2"
                    onClick={handleNovoModulo}
                  >
                    Adicionar Novo Módulo
                    <MdAddCircle size={20} color="#fff" />
                  </button>
                </DivLimitador>
                <DivLimitador wd="200px">
                  <button
                    type="button"
                    className="btn2"
                    onClick={handleNovoItem}
                  >
                    Adicionar Novo Item
                    <MdAddCircle size={20} color="#fff" />
                  </button>
                </DivLimitador>
                <DivLimitador wd="200px">
                  <button type="button" className="btn2" onClick={handleSalvar}>
                    {loading ? 'Aguarde Processando...' : 'Salvar Menu'}
                    <MdSave size={20} color="#fff" />
                  </button>
                </DivLimitador>
              </DivLimitadorRow>
            </BoxItemCadNoQuery>
            <Linha />
            <BoxItemCadNoQuery
              fr="1fr"
              just="center"
              ptop="15px"
              pbotton="20px"
            >
              <CheckboxTree
                nodes={menuGerado}
                checked={checked}
                expanded={expanded}
                checkModel="leaf"
                expandOnClick
                iconsClass="fa5"
                onClick={(ck) => onClick(ck)}
                onCheck={(chk) => onCheck(chk)}
                onExpand={(exp) => onExpand(exp)}
              />
            </BoxItemCadNoQuery>
          </Scroll>
        </Content>
      </Container>
    </>
  );
}
