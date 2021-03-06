import produce from 'immer';

const INITIAL_STATE = {
  token: null,
  signed: false,
  loading: false,
  usr_id: '',
  usr_tipo: '',
  usr_grupo: '',
  usr_email: '',
  emp_id: '',
  emp_razao_social: '',
  emp_financeiro: '',
  optionsEmp: [],
  menu: [],
};

export default function auth(state = INITIAL_STATE, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case '@auth/SIGN_IN_REQUEST': {
        draft.loading = true;
        break;
      }
      case '@auth/SIGN_IN_SUCCESS': {
        draft.token = action.payload.token;
        draft.signed = true;
        draft.loading = false;
        draft.emp_id = action.payload.emp_id;
        draft.emp_razao_social = action.payload.emp_razao_social;
        draft.usr_id = action.payload.usr_id;
        draft.usr_tipo = action.payload.usr_tipo;
        draft.usr_grupo_id = action.payload.usr_grupo_id;
        draft.usr_email = action.payload.usr_email;
        draft.emp_financeiro = action.payload.emp_financeiro;
        if (action.payload.optionsEmp) {
          draft.optionsEmp = action.payload.optionsEmp;
        }
        if (action.payload.menu) {
          draft.menu = action.payload.menu;
        }
        break;
      }
      case '@auth/LOAD_MENU': {
        draft.menu = action.payload.menu;
        break;
      }

      case '@auth/SELECT_EMP_REQUEST': {
        break;
      }

      case '@auth/SELECT_EMP_SUCCESS': {
        draft.emp_id = action.payload.emp_id;
        draft.emp_razao_social = action.payload.emp_razao_social;
        draft.menu = action.payload.menu;
        draft.emp_financeiro = action.payload.emp_financeiro;
        break;
      }
      case '@auth/SIGN_FAILURE': {
        draft.loading = false;
        draft.token = null;
        draft.signed = false;
        draft.menu = [];
        draft.usr_id = '';
        draft.usr_tipo = '';
        draft.usr_grupo = '';
        draft.usr_email = '';
        break;
      }
      case '@auth/SIGN_OUT': {
        draft.token = null;
        draft.signed = false;
        draft.menu = [];
        draft.usr_id = '';
        draft.usr_tipo = '';
        draft.usr_grupo = '';
        draft.usr_email = '';
        break;
      }
      default:
    }
  });
}
