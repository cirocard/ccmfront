/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

import { toast } from 'react-toastify';
import { func } from 'prop-types';
import { Container, TitleBar, AreaComp, BoxInfoNumber } from './styles';
import { BoxItemCad, BoxItemCadNoQuery, Scroll } from '~/pages/general.styles';
import { ApiService, ApiTypes } from '~/services/api';
import { FormataMoeda, toDecimal } from '~/services/func.uteis';

export default function FINA1() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const [titCard1, setTitCard1] = useState('FATURAMENTO DO DIA');
  const [dadosCard1, setDadosCard1] = useState([]);
  const [dadosCard2, setDadosCard2] = useState(['FORMA DE PAGAMENTO', `VALOR`]);
  const [dadosCard3, setDadosCard3] = useState(['RANKING DE VENDA', `TOTAL`]);
  const [dadosCard4, setDadosCard4] = useState([['SITUAÇÃO NEGÓCIO', `TOTAL`]]);
  const [dadosCard5, setDadosCard5] = useState([
    ['SITUAÇÃO ATIVIDADE', `TOTAL`],
  ]);
  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // faturamento do dia
  async function getDataCard1(dias) {
    try {
      const response = await api.get(
        `v1/fina/dashboard/faturamento_dia?dias=${dias}`
      );
      const dados = response.data.retorno;
      if (dados) {
        setDadosCard1(dados);
        if (dias < 0) setTitCard1(`FATURAMENTO DOS ÚLTIMOS ${dias * -1} DIAS`);
        else setTitCard1('FATURAMENTO DO DIA');
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card1 \n${error}`, toastOptions);
    }
  }
  async function getDataCard2(dias) {
    try {
      const response = await api.get(
        `v1/fina/dashboard/faturamento_fpgto?dias=${dias}`
      );
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard2(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card2 \n${error}`, toastOptions);
    }
  }

  async function getDataCard3() {
    try {
      const response = await api.get('v1/fina/dashboard/saldo_contas');
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard3(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card3 \n${error}`, toastOptions);
    }
  }

  async function getDataCard4(dias) {
    try {
      const response = await api.get(
        `v1/fina/dashboard/vencimentos_pagar?dias=${dias}`
      );
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard4(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card4 \n${error}`, toastOptions);
    }
  }

  async function getDataCard5() {
    try {
      const response = await api.get(`v1/crm/consulta/situacao_atividade`);
      const dados = response.data.retorno;

      if (dados) {
        setDadosCard5(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar dados card4 \n${error}`, toastOptions);
    }
  }

  useEffect(() => {
    getDataCard3();
    getDataCard1(0);
    getDataCard2(0);
    getDataCard4(0);
  }, []);

  return (
    <>
      <Container>
        <Scroll>
          <BoxItemCad fr="1fr 1fr">
            <AreaComp lblColor="#fafafa" wd="100%" ptop="3px" pleft="0px">
              <label>SALDO DE CONTAS (CAIXA/BANCOS)</label>

              <BoxInfoNumber>
                <Chart
                  width="100%"
                  height="100%"
                  chartType="PieChart"
                  loader={<div>Gerando Gráfico</div>}
                  data={dadosCard3}
                  options={{
                    is3D: true,
                    backgroundColor: '#1a3234',
                    titleTextStyle: {
                      color: '#fafafa',
                    },
                    title: ``,
                    sliceVisibilityThreshold: 0,
                    chartArea: {
                      left: 10,
                      width: '100%',
                      height: '90%',
                    },
                    legend: {
                      textStyle: { color: '#fafafa' },
                      position: 'left',
                    },
                  }}
                  rootProps={{ 'data-testid': '1' }}
                />
              </BoxInfoNumber>
            </AreaComp>
            <AreaComp lblColor="#fafafa" ptop="5px" pleft="5px">
              <label>{titCard1}</label>
              <BoxItemCadNoQuery fr="1fr 1fr">
                <BoxInfoNumber hg="265px" fontcor="#29BBFA">
                  <span>
                    {dadosCard1[0] ? dadosCard1[0].identificador : ''}
                  </span>
                  <h1>{dadosCard1[0] ? dadosCard1[0].valor : ''}</h1>
                </BoxInfoNumber>
                <BoxInfoNumber hg="265px" fontcor="#29BBFA">
                  <span>
                    {dadosCard1[0] ? dadosCard1[1].identificador : ''}
                  </span>
                  <h1>
                    {dadosCard1[0] ? FormataMoeda(dadosCard1[1].valor) : ''}
                  </h1>
                </BoxInfoNumber>
              </BoxItemCadNoQuery>
            </AreaComp>
          </BoxItemCad>

          <BoxItemCad fr="1fr 1fr">
            <AreaComp lblColor="#fafafa" ptop="30px" pleft="5px">
              <label>CONTAS A PAGAR DO DIA</label>
              <BoxItemCadNoQuery fr="1fr">
                <BoxInfoNumber fontcor="#FC5902">
                  <Chart
                    width="100%"
                    height="100%"
                    chartType="BarChart"
                    loader={<div>Gerando Gráfico</div>}
                    data={dadosCard4}
                    options={{
                      chartArea: {
                        left: 220,
                        width: '95%',
                        height: '70%',
                      },
                      titleTextStyle: {
                        color: '#fafafa',
                      },
                      title: ``,

                      backgroundColor: '#223536',
                      color: '#e2431e',
                      vAxis: {
                        title: '',
                        textStyle: {
                          color: '#F8B054',
                          fontSize: 12,
                        },
                        titleTextStyle: {
                          // fontName: 'Oswald',
                          fontSize: 14,
                          italic: false,
                          color: '#fafafa',
                        },
                      },

                      hAxis: {
                        title: 'VALOR A PAGAR (R$)',
                        textStyle: {
                          color: '#C80520',
                        },
                        titleTextStyle: {
                          fontSize: 14,
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
                </BoxInfoNumber>
              </BoxItemCadNoQuery>
            </AreaComp>

            <AreaComp lblColor="#fafafa" ptop="30px" pleft="5px">
              <label>FATURAMENTO VS FORMA DE PAGAMENTO</label>
              <BoxItemCadNoQuery fr="1fr 6fr">
                <BoxInfoNumber>
                  <button
                    type="submit"
                    className="btn3"
                    onClick={() => {
                      getDataCard1(0);
                      getDataCard2(0);
                    }}
                  >
                    HOJE
                  </button>
                  <button
                    type="submit"
                    className="btn3"
                    onClick={() => {
                      getDataCard1(-7);
                      getDataCard2(-7);
                    }}
                  >
                    -7 DIAS
                  </button>
                  <button
                    type="submit"
                    className="btn3"
                    onClick={() => {
                      getDataCard1(-15);
                      getDataCard2(-15);
                    }}
                  >
                    -15 DIAS
                  </button>
                  <button
                    type="submit"
                    className="btn3"
                    onClick={() => {
                      getDataCard1(-30);
                      getDataCard2(-30);
                    }}
                  >
                    -30 DIAS
                  </button>
                </BoxInfoNumber>
                <BoxInfoNumber>
                  <Chart
                    width="100%"
                    height="100%"
                    chartType="PieChart"
                    loader={<div>Gerando Gráfico</div>}
                    data={dadosCard2}
                    options={{
                      is3D: true,
                      backgroundColor: '#1a3234',
                      titleTextStyle: {
                        color: '#fafafa',
                      },
                      title: ``,

                      chartArea: {
                        left: 0,
                        //    top: 30,
                        width: '100%',
                        height: '90%',
                      },
                      legend: {
                        textStyle: { color: '#fafafa' },
                        position: 'left',
                      },
                    }}
                    rootProps={{ 'data-testid': '4' }}
                  />
                </BoxInfoNumber>
              </BoxItemCadNoQuery>
            </AreaComp>
          </BoxItemCad>
        </Scroll>
      </Container>
    </>
  );
}
