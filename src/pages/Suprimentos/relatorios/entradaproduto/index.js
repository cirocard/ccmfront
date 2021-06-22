import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FaPrint } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import FormSelect from '~/componentes/Select';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import DialogInfo from '~/componentes/DialogInfo';
import { ApiService, ApiTypes } from '~/services/api';
import { ContentConsulta, Panel, ContainerConsulta } from './styles';
import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitadorRow,
  DivLimitador,
} from '~/pages/general.styles';

export default function REL_ENTRADA_PRODUTO() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmRel = useRef(null);
  const [loading, setLoading] = useState(false);
  const [optTabPreco, setOptTabPreco] = useState([]);
  const [dataIni, setDataIni] = useState(moment().add(-2, 'day'));
  const [dataFin, setDataFin] = useState(moment());
  const [optOperEst, setOptOperEst] = useState([]);
  const [fornecedor, setFornecedor] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optOrdenar = [
    { value: 'prod_referencia', label: 'REFERÊNCIA' },
    { value: 'prod_descricao', label: 'DESCRIÇÃO DO PRODUTO' },
    { value: 'quantidade desc', label: 'QUANTIDADE' },
  ];

  const loadOptionsFornec = async (inputText, callback) => {
    if (inputText) {
      const valor = inputText.toUpperCase();
      if (valor.length > 2) {
        const response = await api.get(
          `v1/combos/combo_fornecedor?valor=${valor}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  async function getComboTabPreco() {
    try {
      const response = await api.get('v1/combos/tabpreco');
      const dados = response.data.retorno;
      if (dados) {
        setOptTabPreco(dados);
        frmRel.current.setFieldValue('tabPreco', dados[0]);
      }
    } catch (error) {
      toast.error(`Houve um erro ao buscar tabelas de preço \n${error}`);
    }
  }

  async function getComboOperEst(tipo) {
    try {
      const response = await api.get(`v1/combos/oper_est/${tipo}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptOperEst(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo Operaçao de Estoque \n${error}`);
    }
  }

  // #endregion

  async function handleRelatorio() {
    try {
      setLoading(true);
      const param = frmRel.current.getData();
      const url = `v1/supr/report/entrada_produto?data_ini=${moment(
        dataIni
      ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
        'YYYY-MM-DD'
      )}&tab_id=${param.tabPreco}&order=${param.ordenar}&oper_id=${
        param.operest_id
      }&forn_id=${param.forn_id || ''}`;

      const response = await api.get(url);
      const link = response.data;
      setLoading(false);

      if (link.toString() === '0')
        toast.info(
          'NÃO HÁ INFORMAÇÕES PARA GERAR O RELATÓRIO!!!',
          toastOptions
        );
      else window.open(link, '_blank');
    } catch (err) {
      setLoading(false);
      toast.error(`Erro ao gerar relatório: ${err}`, toastOptions);
    }
  }

  useEffect(() => {
    getComboTabPreco();
    getComboOperEst('E');
    frmRel.current.setFieldValue('ordenar', 'prod_referencia');
  }, []);

  return (
    <>
      <ContentConsulta>
        <ContainerConsulta>
          <Panel
            lefth1="left"
            bckgnd="#dae2e5"
            mtop="5px"
            pdding="1px 2px 1px 7px"
          >
            <Form id="frmRel" ref={frmRel}>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataIni(new Date(date))}
                    value={dataIni}
                    label="Data Inicial"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <DatePickerInput
                    onChangeDate={(date) => setDataFin(new Date(date))}
                    value={dataFin}
                    label="Data Final"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="Tabela de preço"
                    name="tabPreco"
                    optionsList={optTabPreco}
                    placeholder="NÃO INFORMADO"
                    clearable={false}
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="ordenar por:"
                    name="ordenar"
                    optionsList={optOrdenar}
                    placeholder="NÃO INFORMADO"
                    clearable={false}
                    zindex="152"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="OPERAÇÃO DE ESTOQUE"
                    name="operest_id"
                    optionsList={optOperEst}
                    isClearable
                    placeholder="INFORME"
                    zindex="151"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="forn_id"
                    label="Informe CNPJ ou Razão Social do fornecedor para pesquisar"
                    value={fornecedor}
                    placeholder="PESQUISAR FORNECEDOR"
                    onChange={(f) => setFornecedor(f || [])}
                    loadOptions={loadOptionsFornec}
                    isClearable
                    zindex="151"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCadNoQuery
                fr="1fr"
                ptop="80px"
                pbotton="30px"
                just="center"
              >
                <DivLimitadorRow>
                  <DivLimitador wd="170px">
                    <button
                      type="button"
                      className="btn2"
                      onClick={handleRelatorio}
                    >
                      {loading ? 'Aguarde Processando...' : 'Gerar Relatório'}
                      <FaPrint size={20} color="#fff" />
                    </button>
                  </DivLimitador>
                </DivLimitadorRow>
              </BoxItemCadNoQuery>
            </Form>
          </Panel>
        </ContainerConsulta>
      </ContentConsulta>
      {/* popup para aguarde... */}
      <DialogInfo
        isOpen={loading}
        closeDialogFn={() => {
          setLoading(false);
        }}
        title="RELATÓRIO DE CHEQUE"
        message="Aguarde Processamento..."
      />
    </>
  );
}
