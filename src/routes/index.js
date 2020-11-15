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
import Adm7 from '~/pages/admSistema/tabGeral';

import Crm1 from '~/pages/CRM/dashboard';
import Crm2 from '~/pages/CRM/cadastros/time';
import Crm3 from '~/pages/CRM/cadastros/parametros';
import Crm4 from '~/pages/CRM/cadastros/entidade';
import Crm5 from '~/pages/CRM/oportunidade';
import Crm6 from '~/pages/CRM/oportunidade/atividade';
import Crm7 from '~/pages/CRM/relatorios/clientes'; // parametros
import Crm8 from '~/pages/CRM/cadastros/clientes/classificacao'; // classificacao de clientes
import Crm9 from '~/pages/CRM/cadastros/clientes'; // cadastro cliente

// FATURAMENTO

import FAT1 from '~/pages/Faturamento/dashboard';
import FAT2 from '~/pages/Faturamento/cadastros/pedidos';
import FAT3 from '~/pages/Faturamento/cadastros/ecommerce';
import FAT4 from '~/pages/Faturamento/cadastros/pedidos/config';

// SUPRIMENTOS
import SUPR1 from '~/pages/Suprimentos/dashboard';
import SUPR2 from '~/pages/Suprimentos/cadastros/fornecedor';
import SUPR3 from '~/pages/Suprimentos/classificacao';
import SUPR4 from '~/pages/Suprimentos/cadastros/produto';
import SUPR5 from '~/pages/Suprimentos/cadastros/tabPreco';
import SUPR6 from '~/pages/Suprimentos/cadastros/etiqueta';
import SUPR7 from '~/pages/Suprimentos/estoque/operacaoEst';
import SUPR8 from '~/pages/Suprimentos/estoque/entrada_saida';

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
      <Route path="/adm7" component={Adm7} isPrivate />

      {/* MÓDULO CRM */}
      <Route path="/crm1" component={Crm1} isPrivate />
      <Route path="/crm2" component={Crm2} isPrivate />
      <Route path="/crm3" component={Crm3} isPrivate />
      <Route path="/crm4" component={Crm4} isPrivate />
      <Route path="/crm5" component={Crm5} isPrivate />
      <Route path="/crm6" component={Crm6} isPrivate />
      <Route path="/crm7/:tipo" component={Crm7} isPrivate />
      <Route path="/crm8/:tipo" component={Crm8} isPrivate />
      <Route path="/crm9" component={Crm9} isPrivate />

      {/* MÓDULO FATURAMENTO */}
      <Route path="/fat1" component={FAT1} isPrivate />
      <Route path="/fat2/:tipo" component={FAT2} isPrivate />
      <Route path="/fat3" component={FAT3} isPrivate />
      <Route path="/fat4" component={FAT4} isPrivate />

      {/* MÓDULO SUPRIMENTOS */}
      <Route path="/supr1" component={SUPR1} isPrivate />
      <Route path="/supr2" component={SUPR2} isPrivate />
      <Route path="/supr3/:geral" component={SUPR3} isPrivate />
      <Route path="/supr4" component={SUPR4} isPrivate />
      <Route path="/supr5" component={SUPR5} isPrivate />
      <Route path="/supr6" component={SUPR6} isPrivate />
      <Route path="/supr7" component={SUPR7} isPrivate />
      <Route path="/supr8" component={SUPR8} isPrivate />
    </Switch>
  );
}
