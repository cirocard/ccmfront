import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MdSettingsPower } from 'react-icons/md';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Container, Content, Profile, Grupo, Nav } from './styles';
import { Menu } from '../Menu';
import { logOut } from '~/store/modules/auth/actions';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { BotaoEmpresa } from '../SelectEmpresa';

export default function Header() {
  const profile = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  // <Link to="/main">PORTAL DE ENTRADAS</Link>

  const date = new Date();

  const dateFormatted = format(date, "d 'de' MMMM 'de' YYY", { locale: pt });

  function handleLogoff() {
    dispatch(logOut());
  }

  return (
    <Container>
      <Content>
        <Grupo wd="60%">
          <Nav mleft="30px">
            <Menu />
          </Nav>
          <Nav wd="60%">
            <span>Empresa Ativa:</span>
            <BotaoEmpresa />
          </Nav>
        </Grupo>

        <aside>
          <Profile>
            <div>
              <strong>Bem Vindo(a): {profile.usr_email}</strong>
              <span>{dateFormatted}</span>
            </div>
            <BootstrapTooltip
              title="Sair do Sistema com segurança"
              placement="top-start"
            >
              <button type="button" onClick={handleLogoff}>
                <MdSettingsPower size={40} color="#fafafa" />
              </button>
            </BootstrapTooltip>
          </Profile>
        </aside>
      </Content>
    </Container>
  );
}
