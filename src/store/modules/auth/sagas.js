import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import history from '~/services/history';
import api from '~/services/api';
import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
  try {
    const { username, password, empId } = payload;
    const empr = empId || 0;
    const response = yield call(api.post, 'v1/accounts/authenticate', {
      username,
      password,
      emp_id: empr,
    });

    const { success, retorno, errors } = response.data;

    if (!success) {
      toast.error(`Acesso Negado!! ${errors.response.message}`);
      yield put(signFailure());
      return;
    }

    const responselogin = yield call(api.post, 'v1/accounts/authenticate', {
      username,
      password,
      emp_id: retorno[0].emp_id,
    });

    const successlogin = responselogin.data.success;
    const {
      token,
      emp_id,
      emp_razao_social,
      usr_id,
      usr_tipo,
    } = responselogin.data.retorno;

    if (successlogin) {
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const optionsEmp = retorno.map((emp) => {
        return emp;
      });

      yield put(
        signInSuccess(
          token,
          emp_id,
          emp_razao_social,
          usr_id,
          usr_tipo,
          username,
          optionsEmp
        )
      );

      history.push('/');
    }
  } catch (err) {
    toast.error(`Falha na autenticação!! \n${err.message}`);
    yield put(signFailure());
  }
}

export function* setToken({ payload }) {
  try {
    if (!payload) {
      return;
    }

    const { token } = payload.auth;

    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    yield call(api.get, 'v1/accounts/validarToken');
  } catch (err) {
    yield put(signFailure());

    toast.error(`Sua sessão expirou. Faça login novamente!!!`);
    history.push('/login');
  }
}

export function* setNewEmp({ payload }) {
  try {
    const { username, usr_id, usr_tipo, emp_id } = payload;

    const response = yield call(api.post, 'v1/accounts/changeEmp', {
      username,
      usr_id,
      emp_id,
    });

    const { success, retorno, errors } = response.data;

    if (!success) {
      toast.error(`${errors.response.message}`);
      yield put(signFailure());

      return;
    }

    const { token, emp_razao_social } = retorno;

    if (success) {
      api.defaults.headers.Authorization = `Bearer ${token}`;

      yield put(
        signInSuccess(
          token,
          emp_id,
          emp_razao_social,
          usr_id,
          usr_tipo,
          username,
          ''
        )
      );

      history.push('/');
    }
  } catch (err) {
    yield put(signFailure());

    toast.error(`Erro ao localizar empresa. Faça login novamente!!! \n ${err}`);
    history.push('/');
  }
}

export function signOut() {
  history.push('/');
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SELECT_EMP_REQUEST', setNewEmp),
  takeLatest('@auth/SIGN_OUT', signOut),
]);
