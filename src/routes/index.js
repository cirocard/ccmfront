import React from 'react';
import { Switch } from 'react-router-dom';
import Route from './BaseRotas';

import Main from '~/pages/Main';
import Login from '~/pages/Login';
import Parametros from '~/pages/admSistema/Parametros';
import Adm1 from '~/pages/admSistema/cadMenu/index';
import Adm4 from '~/pages/admSistema/grupoUser/index';
import Adm5 from '~/pages/admSistema/usuario';
import Adm6 from '~/pages/admSistema/cadMenu/empresa';
import Crm1 from '~/pages/CRM/dashboard';
import Crm2 from '~/pages/CRM/cadastros/time';
import Crm3 from '~/pages/CRM/cadastros/parametros';
import Crm4 from '~/pages/CRM/cadastros/entidade';
import Crm5 from '~/pages/CRM/oportunidade';
import Crm6 from '~/pages/CRM/oportunidade/atividade';
import Crm7 from '~/pages/CRM/relatorios/clientes';

import FAT1 from '~/pages/Faturamento/dashboard';
import FAT2 from '~/pages/Faturamento/cadastros/pedidos';
import FAT3 from '~/pages/Faturamento/cadastros/ecommerce';

export default function Routes() {
  // /:parametro+  o mais é pra pegar tudo certinho q vem depois da barra
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" exact component={Main} isPrivate />
      <Route path="/adm1" component={Adm1} isPrivate />
      <Route path="/adm2" component={Parametros} isPrivate />
      <Route path="/adm4" component={Adm4} isPrivate />
      <Route path="/adm5" component={Adm5} isPrivate />
      <Route path="/adm6" component={Adm6} isPrivate />

      {/* MÓDULO CRM */}
      <Route path="/crm1" component={Crm1} isPrivate />
      <Route path="/crm2" component={Crm2} isPrivate />
      <Route path="/crm3" component={Crm3} isPrivate />
      <Route path="/crm4" component={Crm4} isPrivate />
      <Route path="/crm5" component={Crm5} isPrivate />
      <Route path="/crm6" component={Crm6} isPrivate />
      <Route path="/crm7/:tipo" component={Crm7} isPrivate />

      {/* MÓDULO FATURAMENTO */}
      <Route path="/fat1" component={FAT1} isPrivate />
      <Route path="/fat2/:tipo" component={FAT2} isPrivate />
      <Route path="/fat3" component={FAT3} isPrivate />
    </Switch>
  );
}
