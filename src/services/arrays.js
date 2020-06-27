exports.getComboUf = () => {
  const comboUf = [
    { value: 'UF', label: 'INFORME A UF' },
    { value: 'AC', label: 'ACRE' },
    { value: 'AL', label: 'ALAGOAS' },
    { value: 'AM', label: 'AMAZONAS' },
    { value: 'AP', label: 'AMAPÁ' },
    { value: 'BA', label: 'BAHIA' },
    { value: 'CE', label: 'CEARÁ' },
    { value: 'DF', label: 'DISTRITO FEDERAL' },
    { value: 'ES', label: 'ESPIRITO SANTO' },
    { value: 'GO', label: 'GOIÁS' },
    { value: 'MA', label: 'MARANHÃO' },
    { value: 'MG', label: 'MINAS GERAIS' },
    { value: 'MS', label: 'MATO GROSSO DO SUL' },
    { value: 'MT', label: 'MATO GROSSO' },
    { value: 'PA', label: 'PARÁ' },
    { value: 'PB', label: 'PARAÍBA' },
    { value: 'PE', label: 'PERNAMBUCO' },
    { value: 'PI', label: 'PIAUÍ' },
    { value: 'PR', label: 'PARANÁ' },
    { value: 'RJ', label: 'RIO DE JANEIRO' },
    { value: 'RN', label: 'RIO GRANDE DO NORTE' },
    { value: 'RO', label: 'RONDONIA' },
    { value: 'RR', label: 'RORAIMA' },
    { value: 'RS', label: 'RIO GRANDE DO SUL' },
    { value: 'SC', label: 'SANTA CATARINA' },
    { value: 'SE', label: 'SERGIPE' },
    { value: 'SP', label: 'SÃO PAULO' },
    { value: 'TO', label: 'TOCANTINS' },
  ];
  return comboUf;
};

exports.getTpAmb = () => {
  const tpAmb = [
    { value: '1', label: 'PRODUÇÃO' },
    { value: '2', label: 'HOMOLOGAÇÃO' },
  ];
  return tpAmb;
};

exports.getTpEmis = () => {
  const tpEmis = [
    { value: '1', label: 'EMISSÃO NORMAL' },
    { value: '10', label: 'EMISSÃO EM CONTINGÊNCIA' },
  ];
  return tpEmis;
};

exports.getModeloDanfe = () => {
  const modelo = [
    { value: '1', label: 'PAISAGEM 1' },
    { value: '2', label: 'PAISAGEM 2' },
    { value: '3', label: 'RETRATO 1' },
    { value: '4', label: 'RETRATO 2' },
    { value: '5', label: 'RETRATO 3' },
  ];
  return modelo;
};
