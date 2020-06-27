import React from 'react';
import { Switch } from 'react-router-dom';
import Route from './BaseRotas';

import Main from '~/pages/Main';
import Login from '~/pages/Login';
import Parametros from '~/pages/admSistema/Parametros';
import Adm1 from '~/pages/admSistema/cadMenu';
import Crm1 from '~/pages/CRM/dashboard';
import Crm2 from '~/pages/CRM/cadastros/time';
import Crm3 from '~/pages/CRM/cadastros/parametros';
import Crm4 from '~/pages/CRM/cadastros/entidade';
import Crm5 from '~/pages/CRM/oportunidade';
import Crm6 from '~/pages/CRM/oportunidade/atividade';

export default function Routes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" exact component={Main} isPrivate />
      <Route path="/adm1" component={Adm1} isPrivate />
      <Route path="/adm2" component={Parametros} isPrivate />

      {/* MÓDULO CRM */}
      <Route path="/crm1" component={Crm1} isPrivate />
      <Route path="/crm2" component={Crm2} isPrivate />
      <Route path="/crm3" component={Crm3} isPrivate />
      <Route path="/crm4" component={Crm4} isPrivate />
      <Route path="/crm5" component={Crm5} isPrivate />
      <Route path="/crm6" component={Crm6} isPrivate />
    </Switch>
  );
}
