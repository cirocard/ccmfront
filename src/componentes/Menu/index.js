import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container } from './styles';
import logo from '~/assets/logo.png';
import { ApiService, ApiTypes } from '~/services/api';
import { loadMenu, logOut } from '~/store/modules/auth/actions';

export function Menu() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const menuModelo = [
    {
      modulo: 'Adm. Sistema',
      name: 'admMenu',
      icon: 'fas fa-tasks pda',
      itens: [
        {
          opcoes: 'ESTRUTURA MENU',
          icon: 'fas fa-bars pda',
          name: 'adm1',
          route: '/adm1',
        },
        {
          opcoes: 'CONFIGURAÇÕES',
          icon: 'fas fa-tools pda',
          name: 'adm2',
          route: '/adm2',
        },
        {
          opcoes: 'AÇÕES',
          icon: 'fas fa-folder pda',
          name: 'acoesMenu',
          valor: [
            {
              route: '/adm3',
              title: 'Cadastro de Empresa',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/adm4',
              title: 'Cadastro de grupo de usuário',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/adm5',
              title: 'Cadastro de usuários',
              icon: 'fas fa-caret-right',
            },
          ],
        },
      ],
    },
    {
      modulo: 'CRM',
      name: 'crmMenu',
      icon: 'fas fa-handshake pda',
      itens: [
        {
          opcoes: 'Dashboard',
          icon: 'fas fa-chart-bar pda',
          name: 'crmDashboard',
          route: '/crm1',
        },
        {
          opcoes: 'Cadastrar Time',
          icon: 'fas fa-users pda',
          name: 'crmTimeMenu',
          route: '/crm2',
        },
        {
          opcoes: 'PARÂMETROS',
          icon: 'fas fa-list-alt pda',
          name: 'crmParamMenu',
          valor: [
            {
              route: '/crm3',
              title: 'Tipos de Oportunidade',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/crm4',
              title: 'Motivos de perda de oportunidade',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/crm5',
              title: 'Tipos de Atividades',
              icon: 'fas fa-caret-right',
            },
          ],
        },
      ],
    },
    {
      modulo: 'Faturamento',
      name: 'fatMenu',
      icon: 'fas fa-address-card pda',
      itens: [
        {
          opcoes: 'PARÂMETROS',
          icon: 'fas fa-list-alt pda',
          name: 'paramMenu',
          valor: [
            {
              route: '/fatpr1',
              title: 'Motivo de Devolução',
              icon: 'fas fa-caret-right',
            },
          ],
        },
        {
          opcoes: 'CADASTROS',
          icon: 'fas fa-file-alt pda',
          name: 'cadastroMenu',
          valor: [
            {
              route: '/fatcad1',
              title: 'Operação de Faturamento',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/fatcad2',
              title: 'Condição de Vencimento',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/fatcad3',
              title: 'Clientes',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/fatcad4',
              title: 'Tabela de Preços',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/fatcad5',
              title: 'Transportadora',
              icon: 'fas fa-caret-right',
            },
          ],
        },
        {
          opcoes: 'NF-e',
          icon: 'fas fa-file-signature pda',
          name: 'nfeMenu',
          valor: [
            {
              route: '/nfe1',
              title: 'Cadastro Manual',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/nfe2',
              title: 'Transmissão de Notas',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/nfe3',
              title: 'Gerenciar XML',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/nfe4',
              title: 'Inutilizar Faixa',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/nfe5',
              title: 'Carta de Correção',
              icon: 'fas fa-caret-right',
            },
            {
              route: '/nfe6',
              title: 'NFC-e Cupom Fiscal',
              icon: 'fas fa-caret-right',
            },
          ],
        },
      ],
    },
    {
      modulo: 'Financeiro',
      name: 'finaMenu',
      icon: 'fas fa-landmark pda',
      itens: [
        {
          opcoes: 'Menu',
          icon: 'fas fa-folder pda',
          name: 'acoesMenu',
          valor: [
            { route: '/fina1', title: 'Teste', icon: 'fas fa-caret-right' },
          ],
        },
      ],
    },
    {
      modulo: 'Suprimentos',
      name: 'suprMenu',
      icon: 'fas fa-shopping-bag pda',
      itens: [
        {
          opcoes: 'Menu',
          icon: 'fas fa-folder pda',
          name: 'acoesMenu',
          valor: [
            { route: '/supr1', title: 'Teste', icon: 'fas fa-caret-right' },
          ],
        },
      ],
    },
  ];

  const { menu, usr_tipo, emp_id, usr_grupo_id } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const [menuGerado, setMenuGerado] = useState([]);
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const getSubMenu = async (item) => {
    let response;
    if (usr_tipo === '1') {
      response = await api.get(`/v1/accounts/listar_itens_nivel/${item}`);
    } else {
      response = await api.get(
        `/v1/accounts/listar_itens_nivel/${emp_id}/${item}`
      );
    }

    if (response.data.success) {
      const { retorno } = response.data;
      const subNivel = [];
      retorno.map(async (n) => {
        subNivel.push({
          route: n.rota,
          title: n.nome,
          icon: n.icone,
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
            opcoes: it.nome,
            icon: it.icone,
            name: it.item_id,
            valor: auxSubNivel,
          };
        } else if (!it.codigo_pai) {
          auxNivel = {
            opcoes: it.nome,
            icon: it.icone,
            name: it.item_id,
            route: it.rota,
          };
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
          modulo: d.nome,
          name: d.modulo_id,
          icon: d.icone,
          itens: itensMenu,
        };
        return tree;
      })
    );
    setMenuGerado(modulo);
    dispatch(loadMenu(modulo));
  }

  useEffect(() => {
    async function getFullMenu() {
      try {
        if (menu.length > 0) {
          setMenuGerado(menu);
        } else {
          let response;
          if (usr_tipo === '1') {
            response = await api.get('/v1/accounts/listar_modulos_full');
          } else {
            response = await api.get(`/v1/users/grupo_user/${usr_grupo_id}`);
          }
          if (response.data.success) {
            const dados = response.data.retorno;
            if (dados) {
              await montaTreeMenu(dados);
            }
          } else {
            toast.error(
              `Usuário sem acesso configurado. Procure o administrador do sistema`,
              toastOptions
            );
            dispatch(logOut());
          }
        }
      } catch (error) {
        toast.error(`Houve um erro ao carregar menu \n${error}`, toastOptions);
      }
    }
    window.loadMenu();
    getFullMenu();
  }, []);

  return (
    <>
      <Container>
        <button type="button" id="sidebarCollapse">
          <img src={logo} alt="www.ccmgestao.com" />
        </button>

        {/* inicio sidebar */}
        <nav id="sidebar">
          <div id="dismiss">
            <i className="fas fa-arrow-left" />
          </div>

          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>

          <ul className="list-unstyled components">
            {menuGerado.map((m) => (
              <li key={m.name}>
                <a
                  href={`#${m.name}`}
                  data-toggle="collapse"
                  aria-expanded="false"
                  className="dropdown-toggle"
                >
                  <i className={`${m.icon}`} />
                  {m.modulo}
                </a>
                <ul className="collapse list-unstyled" id={`${m.name}`}>
                  {m.itens.map((i) =>
                    i.route ? (
                      <li key={i.opcoes}>
                        <a href={i.route}>
                          <i className={`${i.icon}`} />
                          {i.opcoes}
                        </a>
                      </li>
                    ) : (
                      <li key={i.opcoes}>
                        <a
                          href={`#${i.name}`}
                          data-toggle="collapse"
                          aria-expanded="false"
                          className="dropdown-toggle"
                        >
                          <i className={`${i.icon}`} />
                          {i.opcoes}
                        </a>
                        <ul className="collapse list-unstyled" id={`${i.name}`}>
                          {i.valor.map((v) => (
                            <li key={v.route} className="itens_menu">
                              <a href={v.route}>
                                <i className={`${v.icon}`} />
                                <label className="itens_menu_label">
                                  {v.title}
                                </label>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  )}
                </ul>
              </li>
            ))}
          </ul>
          <div className="line" />
        </nav>

        <div className="overlay" />
      </Container>
      {/* popup para configurações gerais */}
    </>
  );
}
