import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaPowerOff, FaUserEdit, FaWindowClose } from 'react-icons/fa';
import { Form } from '@unform/web';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Dialog from '@material-ui/core/Dialog';
import { Slide } from '@material-ui/core';
import DialogInfo from '~/componentes/DialogInfo';
import { Container, Content, Profile, Grupo, Nav, Actions } from './styles';
import Input from '~/componentes/Input';
import { Menu } from '../Menu';
import { logOut } from '~/store/modules/auth/actions';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import { BotaoEmpresa } from '../SelectEmpresa';
import { ApiService, ApiTypes } from '~/services/api';
import {
  TitleBar,
  AreaComp,
  BoxItemCadNoQuery,
  CModal,
  Scroll,
  Linha,
} from '~/pages/general.styles';

export default function Header() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const profile = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const frmUser = useRef(null);
  const [loading, setLoading] = useState(false);
  const [openDlgUser, setOpenDlgUser] = useState(false);
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };
  const date = new Date();
  const dateFormatted = format(date, "d 'de' MMMM 'de' YYY", { locale: pt });

  const schema = Yup.object().shape({
    novasenha: Yup.string()
      .required('campo obrigatório')
      .min(6, 'informe pelo menos 5 digitos'),
  });

  function handleLogoff() {
    dispatch(logOut());
  }

  async function handleUser(formData) {
    try {
      frmUser.current.setErrors({});
      await schema.validate(formData, {
        abortEarly: false,
      });

      if (formData.novasenha === formData.confirmarsenha) {
        setLoading(true);
        const url = `v1/users/passwd/${formData.novasenha}`;
        const response = await api.put(url);
        setLoading(false);

        if (response.data.success) {
          toast.info('Perfil alterado com sucesso!!!', toastOptions);
        }
      } else {
        toast.error('A confirmação da senha falhou!!!', toastOptions);
      }
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        setLoading(false);
        toast.error(`Erro Atualizar perfil: ${err}`, toastOptions);
      }

      frmUser.current.setFieldError('novasenha', validationErrors.novasenha);
    }
  }

  return (
    <>
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
            </Profile>
            <Actions>
              <BootstrapTooltip
                title="Editar meu login de acesso"
                placement="top-start"
              >
                <button type="button" onClick={() => setOpenDlgUser(true)}>
                  <FaUserEdit size={22} color="#fafafa" />
                </button>
              </BootstrapTooltip>
              <BootstrapTooltip
                title="Sair do Sistema com segurança"
                placement="top-start"
              >
                <button type="button" onClick={handleLogoff}>
                  <FaPowerOff size={22} color="#fafafa" />
                </button>
              </BootstrapTooltip>
            </Actions>
          </aside>
        </Content>
      </Container>

      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="CONFIGURAÇÕES DO USUÁRIO"
        message="Aguarde Processamento..."
      />

      {/* popup para USUARIO */}
      <Slide direction="down" in={openDlgUser}>
        <Dialog
          open={openDlgUser}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgUser(false)}
        >
          <TitleBar wd="100%" bckgnd="#244448" fontcolor="#fff" lefth1="left">
            <h1>ALTERAR PERFIL USUARIO</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgUser(false)}>
                <FaWindowClose size={30} color="#fff" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <Scroll>
            <CModal wd="100%" hd="90%">
              <Form ref={frmUser} onSubmit={handleUser}>
                <BoxItemCadNoQuery fr="1fr 1fr">
                  <AreaComp wd="100">
                    <label>Nova Senha</label>
                    <Input type="text" name="novasenha" className="input_cad" />
                  </AreaComp>
                  <AreaComp wd="100">
                    <label>Confirmar Senha</label>
                    <Input
                      type="text"
                      name="confirmarsenha"
                      className="input_cad"
                    />
                  </AreaComp>
                </BoxItemCadNoQuery>
                <Linha />
                <BoxItemCadNoQuery>
                  <AreaComp wd="100" ptop="30px">
                    <button type="submit" className="btnGeralForm">
                      ATUALIZAR SENHA
                    </button>
                  </AreaComp>
                </BoxItemCadNoQuery>
              </Form>
            </CModal>
          </Scroll>
        </Dialog>
      </Slide>
    </>
  );
}
