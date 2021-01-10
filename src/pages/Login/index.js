import React from 'react';
import 'dotenv/config';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import Input from '~/componentes/Input';
import { signInRequest } from '~/store/modules/auth/actions';
import logo from '~/assets/logo.png';

const schema = Yup.object().shape({
  username: Yup.string()
    .required('O login é obrigatório')
    .min(4, 'usuario deve ter no minimo 4 digitos'),
});

export default function Login() {
  const dispatch = useDispatch();

  const { loading, emp_id, emp_razao_social } = useSelector(
    (state) => state.auth
  );

  function handleSubmit({ username, password }) {
    dispatch(signInRequest(username, password, emp_id, emp_razao_social));
  }

  return (
    <>
      <img src={logo} alt="SaibWeb" />

      <Form schema={schema} onSubmit={handleSubmit}>
        <Input name="username" type="text" placeholder="Informe o Login" />
        <Input
          name="password"
          type="password"
          placeholder="Informe sua senha"
        />

        <button type="submit">{loading ? 'Carregando...' : 'Acessar'}</button>
      </Form>
    </>
  );
}
