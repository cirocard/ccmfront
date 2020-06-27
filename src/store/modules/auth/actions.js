export function signInRequest(username, password, emp_id, emp_razao_social) {
  return {
    type: '@auth/SIGN_IN_REQUEST',
    payload: { username, password, emp_id, emp_razao_social },
  };
}

export function signInSuccess(
  token,
  emp_id,
  emp_razao_social,
  usr_id,
  usr_email,
  optionsEmp,
  menu
) {
  return {
    type: '@auth/SIGN_IN_SUCCESS',
    payload: {
      token,
      emp_id,
      emp_razao_social,
      usr_id,
      usr_email,
      optionsEmp,
      menu,
    },
  };
}

export function loadMenu(menu) {
  return {
    type: '@auth/LOAD_MENU',
    payload: { menu },
  };
}

export function selectEmpRequest(username, usr_id, emp_id) {
  return {
    type: '@auth/SELECT_EMP_REQUEST',
    payload: { username, usr_id, emp_id },
  };
}

export function selectEmpSuccess(emp_id, emp_razao_social) {
  return {
    type: '@auth/SELECT_EMP_SUCCESS',
    payload: { emp_id, emp_razao_social },
  };
}

export function signFailure() {
  return {
    type: '@auth/SIGN_FAILURE',
  };
}

export function logOut() {
  return {
    type: '@auth/SIGN_OUT',
  };
}
