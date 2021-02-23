import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FaPrint } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
import Input from '~/componentes/Input';
import { ApiService, ApiTypes } from '~/services/api';
import { ContentConsulta, Panel, ContainerConsulta } from './styles';
import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitadorRow,
  DivLimitador,
} from '~/pages/general.styles';

export default function REL_CHEQUE() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmRel = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sacado, setSacado] = useState([]);
  const [optSituacao, setOptSituacao] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment().add(7, 'day'));

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const optTipoCheque = [
    { value: '1', label: 'CHEQUE PRÓPRIO' },
    { value: '2', label: 'CHEQUE RECEBIDO' },
    { value: '3', label: 'CHEQUE RECEBIDO DE TERCEIROS' },
  ];

  const optDATA = [
    { value: '1', label: 'DATA DE LANÇAMENTO' },
    { value: '2', label: 'DATA VENCIMENTO' },
    { value: '3', label: 'DATA SITUAÇÃO' }, // data que foi definido a situação informada
  ];

  const loadOptionsRepresentante = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=23&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      } else if (!Number.isNaN(descricao)) {
        // consultar com menos de 3 digitos só se for numerico como codigo do cliente
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
        );
        callback(
          response.data.retorno.map((i) => ({ value: i.value, label: i.label }))
        );
      }
    }
  };

  // combo geral
  async function comboGeral(tab_id) {
    try {
      const response = await api.get(`v1/combos/geral/${tab_id}`);
      const dados = response.data.retorno;
      if (dados) {
        if (tab_id === 25) {
          setOptSituacao(dados);
        }
      }
    } catch (error) {
      toast.error(`Erro ao carregar registro \n${error}`);
    }
  }

  // #endregion

  // #endregion

  async function handleRelatorio() {
    try {
      setLoading(true);
      const param = frmRel.current.getData();

      const url = `v1/fina/report/cheque?data_ini=${moment(dataIni).format(
        'YYYY-MM-DD'
      )}&data_fin=${moment(dataFin).format('YYYY-MM-DD')}&situacao=${
        param.chq_situacao_id
      }&tipo=${param.chq_tipo}&sacado_id=${param.chq_sacado_id || ''}&tpData=${
        param.pesq_data || '1'
      }&numero=${param.chq_numero}`;

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
    comboGeral(25);
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
                  <AsyncSelectForm
                    name="chq_sacado_id"
                    label="SACADO/RECEBEDOR"
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    value={sacado}
                    onChange={(c) => setSacado(c || [])}
                    loadOptions={loadOptionsRepresentante}
                    isClearable
                    zindex="153"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <label>emitente de cheque</label>
                  <Input
                    type="text"
                    name="chq_emitente"
                    placeholder="INFORME NOME OU CPF/CNPJ DO EMITENTE"
                    className="input_cad"
                  />
                </AreaComp>
              </BoxItemCad>
              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="filtrar por"
                    name="pesq_data"
                    optionsList={optDATA}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
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

              <BoxItemCad fr="1fr 1fr 1fr">
                <AreaComp wd="100">
                  <label>Nº Cheque</label>
                  <Input
                    type="text"
                    name="chq_numero"
                    placeholder="Nº CHEQUE"
                    className="input_cad"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="situação do cheque"
                    name="chq_situacao_id"
                    optionsList={optSituacao}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
                  />
                </AreaComp>
                <AreaComp wd="100">
                  <FormSelect
                    label="tipo de cheque"
                    name="chq_tipo"
                    optionsList={optTipoCheque}
                    placeholder="NÃO INFORMADO"
                    zindex="152"
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
