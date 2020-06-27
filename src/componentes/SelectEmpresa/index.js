import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { AreaComp, BoxMenu } from './styles';
import { store } from '~/store';
import { selectEmpRequest } from '~/store/modules/auth/actions';
import history from '~/services/history';

export function BotaoEmpresa() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth);
  const [options, setOptions] = useState([]);
  const { optionsEmp } = store.getState().auth;

  useEffect(() => {
    const opt = [];
    optionsEmp.map((op) => {
      opt.push({ value: op.emp_id, label: op.emp_nome });
    });
    setOptions(opt);
  }, []);

  const handleEmpresa = (event) => {
    dispatch(selectEmpRequest(profile.usr_email, profile.usr_id, event.value));
    toast.success(`Empresa selecionada: ${event.label}`);
    history.push('/');
  };

  return (
    <BoxMenu>
      <AreaComp wd="100%">
        <Select
          options={options}
          value={options.filter(({ value }) => value === profile.emp_id)}
          onChange={handleEmpresa}
          placeholder="INFORME A EMPRESA ATIVA..."
          selectedValue="1"
        />
      </AreaComp>
    </BoxMenu>
  );
}
