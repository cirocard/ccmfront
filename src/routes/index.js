import React from 'react';
import { Switch } from 'react-router-dom';
import Route from './BaseRotas';

import Main from '~/pages/Main';
import Login from '~/pages/Login';
import Parametros from '~/pages/admSistema/Parametros';
import Adm1 from '~/pages/admSistema/cadMenu/index';
import Adm3 from '~/pages/admSistema/empresa';
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
import FAT5 from '~/pages/Faturamento/relatorios';
import FAT6 from '~/pages/Faturamento/cadastros/pedidos/orcamento';

// FINANCEIRO
import FINA1 from '~/pages/Financeiro/dashboard';
import FINA2 from '~/pages/Financeiro/parametros/geral';
import FINA3 from '~/pages/Financeiro/parametros/grupo_recdesp';
import FINA4 from '~/pages/Financeiro/caixaBanco/contas';
import FINA5 from '~/pages/Financeiro/cadastros/cheque';
import FINA6 from '~/pages/Financeiro/cadastros/cheque/bordero';
import FINA7 from '~/pages/Financeiro/relatorios';
import FINA9 from '~/pages/Financeiro/conta_receber/ctarec';
import FINA8 from '~/pages/Financeiro/cadastros/bloco';
import FINA10 from '~/pages/Financeiro/conta_receber/promissoria';
import FINA11 from '~/pages/Financeiro/parametros/fpgto';
import FINA12 from '~/pages/Financeiro/conta_receber/bordero';
import FINA13 from '~/pages/Financeiro/caixaBanco/movcontas';
import FINA14 from '~/pages/Financeiro/conta_pagar/ctapag';
import FINA15 from '~/pages/Financeiro/conta_pagar/bordero';
import FINA16 from '~/pages/Financeiro/parametros/creditcard';

// SUPRIMENTOS
import SUPR1 from '~/pages/Suprimentos/dashboard';
import SUPR2 from '~/pages/Suprimentos/cadastros/fornecedor';
import SUPR3 from '~/pages/Suprimentos/classificacao';
import SUPR4 from '~/pages/Suprimentos/cadastros/produto';
import SUPR5 from '~/pages/Suprimentos/cadastros/tabPreco';
import SUPR6 from '~/pages/Suprimentos/cadastros/etiqueta';
import SUPR7 from '~/pages/Suprimentos/estoque/operacaoEst';
import SUPR8 from '~/pages/Suprimentos/estoque/entrada_saida';
import SUPR9 from '~/pages/Suprimentos/relatorios/';

// SERVIÇOS
import SERV2 from '~/pages/Servicos/cadastros/servico';
import SERV3 from '~/pages/Servicos/cadastros/ordemserv';

export default function Routes() {
  // /:parametro+  o mais é pra pegar tudo certinho q vem depois da barra
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" exact component={Main} isPrivate />
      <Route path="/adm1" component={Adm1} isPrivate />
      <Route path="/adm2" component={Parametros} isPrivate />
      <Route path="/adm3" component={Adm3} isPrivate />
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
      <Route path="/fat5/:tipo" component={FAT5} isPrivate />
      <Route path="/fat6" component={FAT6} isPrivate />

      {/* MÓDULO FINANCEIRO */}
      <Route path="/fina1" component={FINA1} isPrivate />
      <Route path="/fina2/:geral" component={FINA2} isPrivate />
      <Route path="/fina3/:tipo" component={FINA3} isPrivate />
      <Route path="/fina4" component={FINA4} isPrivate />
      <Route path="/fina5" component={FINA5} isPrivate />
      <Route path="/fina6" component={FINA6} isPrivate />
      <Route path="/fina7/:tipo" component={FINA7} isPrivate />
      <Route path="/fina8" component={FINA8} isPrivate />
      <Route path="/fina9" component={FINA9} isPrivate />
      <Route path="/fina10" component={FINA10} isPrivate />
      <Route path="/fina11" component={FINA11} isPrivate />
      <Route path="/fina12" component={FINA12} isPrivate />
      <Route path="/fina13" component={FINA13} isPrivate />
      <Route path="/fina14" component={FINA14} isPrivate />
      <Route path="/fina15" component={FINA15} isPrivate />
      <Route path="/fina16" component={FINA16} isPrivate />

      {/* MÓDULO SUPRIMENTOS */}
      <Route path="/supr1" component={SUPR1} isPrivate />
      <Route path="/supr2" component={SUPR2} isPrivate />
      <Route path="/supr3/:geral" component={SUPR3} isPrivate />
      <Route path="/supr4" component={SUPR4} isPrivate />
      <Route path="/supr5" component={SUPR5} isPrivate />
      <Route path="/supr6" component={SUPR6} isPrivate />
      <Route path="/supr7" component={SUPR7} isPrivate />
      <Route path="/supr8" component={SUPR8} isPrivate />
      <Route path="/supr9/:tipo" component={SUPR9} isPrivate />

      {/* MÓDULO SERVIÇOS */}
      <Route path="/serv2" component={SERV2} isPrivate />
      <Route path="/serv3" component={SERV3} isPrivate />
    </Switch>
  );
}
