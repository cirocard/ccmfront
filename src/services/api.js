import axios from 'axios';
import { ApiBaseUrl } from './func.uteis';
import { store } from '~/store';

export const ApiTypes = {
  API1: 'API1',
  API2: 'API2',
  GERAL: 'GERAL',
};

export class ApiService {
  static getInstance(apiType) {
    /* ====== Obtem base url ====== */
    const baseUrl = ApiBaseUrl(apiType);

    /* ==== Acessa a store e obtem o token ==== */
    const { token } = store.getState().auth;

    const api = axios.create({
      baseURL: baseUrl,
    });

    /* ==== Insere o token nos headers do axios ==== */
    api.defaults.headers.Authorization = `Bearer ${token}`;

    /* ==== Configura interceptor de response para tratar erros da Api ==== */
    api.interceptors.response.use((response) => {
      if (response.data.errors && response.data.errors.message) {
        const { message } = response.data.errors;
        const errorMessage = message.message ? message.message : message;
        throw new Error(errorMessage);
      } else if (
        response.data.message &&
        response.data.message.startsWith('Falha')
      ) {
        throw new Error(response.data.message);
      } else if (response.data.success === false) {
        throw new Error(response.data.message);
      } else {
        return response;
      }
    });

    return api;
  }
}
