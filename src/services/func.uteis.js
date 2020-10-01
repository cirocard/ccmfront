exports.getSiglaUf = (cUf) => {
  switch (cUf) {
    case '12':
      return 'AC';

    case '27':
      return 'AL';

    case '13':
      return 'AM';

    case '16':
      return 'AP';

    case '29':
      return 'BA';

    case '23':
      return 'CE';

    case '53':
      return 'DF';

    case '32':
      return 'ES';

    case '52':
      return 'GO';

    case '21':
      return 'MA';

    case '31':
      return 'MG';

    case '50':
      return 'MS';

    case '51':
      return 'MT';

    case '15':
      return 'PA';

    case '25':
      return 'PB';

    case '26':
      return 'PE';

    case '22':
      return 'PI';

    case '41':
      return 'PR';

    case '33':
      return 'RJ';

    case '24':
      return 'RN';

    case '11':
      return 'RO';

    case '14':
      return 'RR';

    case '43':
      return 'RS';

    case '42':
      return 'SC';

    case '28':
      return 'SE';

    case '35':
      return 'SP';

    case '17':
      return 'TO';

    default:
      return 'EX';
  }
};

// 1 completa;  2 parcial 2019-12-05T15:45:33-03:00
exports.FormataData = (valor, tipo) => {
  if (valor) {
    if (valor.length > 2) {
      if (tipo === 1)
        return `${valor.substring(8, 10)}/${valor.substring(
          5,
          7
        )}/${valor.substring(0, 4)} ${valor.substring(11, 19)}`;
      return `${valor.substring(8, 10)}/${valor.substring(
        5,
        7
      )}/${valor.substring(0, 4)}`;
    }
    return '';
  }
};

exports.RetirarMascara = (texto, caracter) => {
  for (let i = 0; i < caracter.length; i++) {
    while (texto.indexOf(caracter[i]) > 0) {
      texto = texto.replace(caracter[i], '');
    }
  }
  return texto;
};

exports.FillTextLeft = (conteudo, caractere, tamanho) => {
  let aux = '';
  if (tamanho - conteudo.Length > 0) {
    for (let i = 1; i <= tamanho - conteudo.Length; i++) {
      aux += caractere;
    }
    return aux + conteudo;
  }
  return conteudo.Substring(0, tamanho);
};

exports.GridDateFormatter = (params) => {
  const { value } = params;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.000Z$/.test(value)) {
    const datePart = value.split('T')[0];
    const timePart = value.split('T')[1];
    const dateArray = datePart.split('-');
    const timeArray = timePart.split(':');

    return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]} ${timeArray[0]}:${timeArray[1]}`;
  }

  return value;
};

exports.a11yProps = (index) => {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
};

exports.maskFone = (fone) => {
  document.getElementsByName(fone.target.name)[0].value = fone.target.value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses em volta dos dois primeiros dígitos
    .replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen entre o quarto e o quinto dígitos
};

exports.maskDecimal = (valor) => {
  document.getElementsByName(valor.target.name)[0].value = valor.target.value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{1})(\d{1,2})$/, '$1,$2')
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    .replace(/^(\d)/g, '$1');
};

exports.maskCNPJCPF = (valor) => {
  if (valor.target.value.length > 14) {
    document.getElementsByName(
      valor.target.name
    )[0].value = valor.target.value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, '$1.$2.$3/$4-$5');
  } else {
    document.getElementsByName(valor.target.name)[0].value = valor.target.value
      .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
      .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    // .replace(/(-\d{2})\d+?$/, '$1'); // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
  }
};

exports.formataCNPJCPF = (valor) => {
  if (valor.length > 11) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, '$1.$2.$3/$4-$5');
  }
  return valor
    .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
    .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  // .replace(/(-\d{2})\d+?$/, '$1'); // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
};

exports.FormataMoeda = (valor) => {
  return `${parseFloat(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`;
};

exports.FormataNumeroBd = (valor) => {
  const v = valor.replace('.', '');
  return v.replace(',', '.');
};

exports.ApiBaseUrl = (apiType) => {
  let baseUrl = '';
  switch (apiType) {
    case 'API1':
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        baseUrl = process.env.REACT_APP_URL_API_LOCAL;
      } else {
        baseUrl = process.env.REACT_APP_URL_API_HONMOLOG;
      }
      break;

    case 'API2':
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        baseUrl = process.env.REACT_APP_URL_API_LOCAL;
      } else {
        baseUrl = process.env.REACT_APP_URL_API_LOCAL;
      }
      break;

    case 'GERAL':
      baseUrl = '';
      break;

    default:
      break;
  }

  return baseUrl;
};

exports.SeNull = (entrada, saida) => {
  if (entrada === '') {
    return saida;
  }
  return entrada;
};

exports.ArredondaValorDecimal = (valor) => {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
};

exports.toDecimal = (valor) => {
  if (valor) {
    valor = valor.toString();
    if (valor.indexOf('.') > 0 && valor.indexOf(',') > 0) {
      return parseFloat(valor.replace(/\./gi, '').replace(/,/gi, '.'));
    }
    if (valor.indexOf(',') < 0) {
      return parseFloat(valor);
    }
    if (valor.indexOf('.') > 0 && valor.indexOf(',') < 0) {
      return parseFloat(valor);
    }

    if (valor.indexOf('.') < 0 && valor.indexOf(',') > 0) {
      return parseFloat(valor.replace(/\./gi, '').replace(/,/gi, '.'));
    }
  } else {
    return 0;
  }
};

exports.GridCurrencyFormatter = (params) => {
  return `R$ ${parseFloat(params.value).toLocaleString('pt')}`;
};
