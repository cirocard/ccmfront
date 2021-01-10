import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import axios from 'axios';
import history from '~/services/history';
import { ApiBaseUrl } from '~/services/func.uteis';
import { signInSuccess, signFailure } from './actions';

const baseUrl = ApiBaseUrl('API1');
const api = axios.create({
  baseURL: baseUrl,
});

const toastOptions = {
  autoClose: 4000,
  position: toast.POSITION.TOP_CENTER,
};

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
      usr_grupo_id,
    } = responselogin.data.retorno;

    if (successlogin) {
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const optionsEmp = retorno.map((emp) => emp);

      yield put(
        signInSuccess(
          token,
          emp_id,
          emp_razao_social,
          usr_id,
          usr_tipo,
          usr_grupo_id,
          username,
          optionsEmp
        )
      );

      history.push('/');
      history.go(0);
    }
  } catch (err) {
    toast.error(`Falha na autenticação!! \n${err.message}`, toastOptions);
    yield put(signFailure());
  }
}

export function* setToken({ payload }) {
  try {
    if (!payload) {
      return;
    }
    if (!payload.auth.signed) {
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
    history.go(0);
  }
}

export function* setNewEmp({ payload }) {
  try {
    const { username, usr_id, usr_tipo, emp_id, optionsEmp } = payload;

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

    const { token, emp_razao_social, usr_grupo_id } = retorno;

    if (success) {
      api.defaults.headers.Authorization = `Bearer ${token}`;

      yield put(
        signInSuccess(
          token,
          emp_id,
          emp_razao_social,
          usr_id,
          usr_tipo,
          usr_grupo_id,
          username,
          optionsEmp
        )
      );

      history.push('/');
      history.go(0);
    }
  } catch (err) {
    yield put(signFailure());

    toast.error(`Erro ao localizar empresa. Faça login novamente!!! \n ${err}`);
    history.push('/');
    history.go(0);
  }
}

export function signOut() {
  history.push('/login');
  history.go(0);
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SELECT_EMP_REQUEST', setNewEmp),
  takeLatest('@auth/SIGN_OUT', signOut),
]);
