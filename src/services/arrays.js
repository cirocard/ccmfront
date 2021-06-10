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

exports.getColors = () => {
  const colors = [
    '#0088FE',
    '#1A3234',
    '#FFBB28',
    '#FF8042',
    '#1A3428',
    '#858AA0',
    '#9FB0F7',
    '#F18503',
    '#F6FB27',
    '#696B06',
    '#2D7252',
    '#17DE82',
    '#173BDE',
    '#F79FBF',
    '#DA3873',
    '#FA045E',
    '#D80E04',
    '#ADB046',
    '#80830F',
    '#99BD9E',
    '#55C1FF',
    '#2A546D',
    '#7C7F80',
    '#E0A9E7',
    '#E233F8',
  ];
  return colors;
};
