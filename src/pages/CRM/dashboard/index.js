import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { toast } from 'react-toastify';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Container, TitleBar, AreaComp } from './styles';
import {
  BoxItemCad,
  BoxItemCadNoQuery,
  Scroll,
  Linha,
} from '~/pages/general.styles';
import { ApiService, ApiTypes } from '~/services/api';

export default function Crm1() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [dias, setDias] = useState(30);
  const [dadosCard1, setDadosCard1] = useState([
    'X',
    `TOTAL DE CLIENTES INATIVOS`,
  ]);
  const [dadosCard2, setDadosCard2] = useState([
    'CLIENTES CADASTRADOS',
    `TOTAL`,
  ]);
  const [dadosCard3, setDadosCard3] = useState(['RANKING DE VENDA', `TOTAL`]);
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  async function getDataCard1() {
    try {
      const response = await api.get(`v1/crm/consulta/grafico_inativos`);
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard1(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card1 \n${error}`, toastOptions);
    }
  }
  async function getDataCard2() {
    try {
      const response = await api.get(`v1/crm/consulta/grafico_total_clientes`);
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard2(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card1 \n${error}`, toastOptions);
    }
  }

  async function getDataCard3() {
    try {
      const response = await api.get(
        `v1/crm/consulta/cliente_score?days=${dias}`
      );
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard3(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card1 \n${error}`, toastOptions);
    }
  }

  async function handleDias() {
    if (dias > 0 && dias < 121) {
      getDataCard3();
    } else {
      toast.info('Informe um período entre 1 e 120 dias', toastOptions);
    }
  }

  useEffect(() => {
    document.getElementsByName('inputDias')[0].value = 30;
    setDias(30);
    getDataCard1();
    getDataCard2();
    getDataCard3();
  }, []);

  return (
    <>
      <Container>
        <Scroll>
          <TitleBar>
            <h1>VISÃO GERENCIAL DOS CLIENTES</h1>
          </TitleBar>
          <BoxItemCad fr="1fr 1fr">
            <AreaComp>
              <Chart
                width="100%"
                height="100%"
                chartType="LineChart"
                loader={<div>Gerando Gráfico</div>}
                data={dadosCard1}
                options={{
                  hAxis: {
                    title: 'Dias de inatividade',
                    textStyle: {
                      color: '#C80520',
                    },
                    titleTextStyle: {
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },

                  vAxis: {
                    title: 'Quantidade de Clientes',
                    textStyle: {
                      color: '#C80520',
                    },
                    titleTextStyle: {
                      // fontName: 'Oswald',
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },
                  series: {
                    0: { color: '#e2431e', curveType: 'function' },
                  },
                  lineWidth: 10,
                  backgroundColor: '#223536',
                  chartArea: {
                    left: 80,
                    //    top: 30,
                    width: '85%',
                    height: '65%',
                  },
                  legend: {
                    position: 'top',
                    alignment: 'center',
                    maxLines: 4,
                    textStyle: { color: '#fafafa' },
                  },
                }}
                rootProps={{ 'data-testid': '1' }}
              />
            </AreaComp>

            <AreaComp>
              <Chart
                width="100%"
                height="100%"
                chartType="ColumnChart"
                loader={<div>Gerando Gráfico</div>}
                data={dadosCard2}
                options={{
                  chartArea: {
                    left: 100,
                    width: '85%',
                    height: '65%',
                  },
                  chart: {
                    title: 'TOTAL DE CLIENTES CADASTRADOS NO SISTEMA',
                  },

                  backgroundColor: '#223536',
                  color: '#e2431e',
                  vAxis: {
                    title: 'Quantidade de Clientes',
                    textStyle: {
                      color: '#C80520',
                    },
                    titleTextStyle: {
                      // fontName: 'Oswald',
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },

                  hAxis: {
                    title: 'Cadastros ao longo do tempo',
                    textStyle: {
                      color: '#C80520',
                    },
                    titleTextStyle: {
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },

                  legend: {
                    position: 'top',
                    alignment: 'center',

                    textStyle: { color: '#fafafa' },
                  },
                }}
                rootProps={{ 'data-testid': '2' }}
              />
            </AreaComp>
          </BoxItemCad>
          <BoxItemCadNoQuery fr="1fr">
            <AreaComp hg="400px">
              <KeyboardEventHandler
                handleKeys={['enter']}
                onKeyEvent={() => handleDias()}
              >
                <input
                  type="number"
                  name="inputDias"
                  onChange={(e) => setDias(e.target.value)}
                  placeholder="0,00"
                  className="input_cad"
                />
              </KeyboardEventHandler>

              <Chart
                width="100%"
                height="100%"
                chartType="BarChart"
                loader={<div>Gerando Gráfico</div>}
                data={dadosCard3}
                options={{
                  chartArea: {
                    left: 400,
                    width: '95%',
                    height: '70%',
                  },
                  titleTextStyle: {
                    color: '#fafafa',
                  },
                  title: `RANKING 10 MAIORES COMPRADORES NOS ÚLTIMOS ${dias} DIAS`,

                  backgroundColor: '#223536',
                  color: '#e2431e',
                  vAxis: {
                    title: 'PRINCIPAIS CLIENTES',
                    textStyle: {
                      color: '#FAFAFA',
                      fontSize: 12,
                    },
                    titleTextStyle: {
                      // fontName: 'Oswald',
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },

                  hAxis: {
                    title: 'VALOR EM COMPRAS (R$)',
                    textStyle: {
                      color: '#C80520',
                    },
                    titleTextStyle: {
                      fontSize: 16,
                      italic: false,
                      color: '#fafafa',
                    },
                  },

                  legend: {
                    position: 'top',
                    alignment: 'center',

                    textStyle: { color: '#fafafa' },
                  },
                }}
                rootProps={{ 'data-testid': '2' }}
              />
            </AreaComp>
          </BoxItemCadNoQuery>
        </Scroll>
      </Container>
    </>
  );
}
