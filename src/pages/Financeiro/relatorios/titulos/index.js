import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FaPrint } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import AsyncSelectForm from '~/componentes/Select/selectAsync';
// import FormSelect from '~/componentes/Select';
import DialogInfo from '~/componentes/DialogInfo';
// import Input from '~/componentes/Input';
import { ApiService, ApiTypes } from '~/services/api';
import { ContentConsulta, Panel, ContainerConsulta } from './styles';
import {
  AreaComp,
  BoxItemCad,
  BoxItemCadNoQuery,
  DivLimitadorRow,
  DivLimitador,
  CCheck,
} from '~/pages/general.styles';

export default function REL_TITULOS({ tipo }) {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmRel = useRef(null);
  const [loading, setLoading] = useState(false);
  const [clienteForn, setClienteForn] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment());

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  const loadOptionsCliente = async (inputText, callback) => {
    if (inputText) {
      const descricao = inputText.toUpperCase();

      if (descricao.length > 2) {
        const response = await api.get(
          `v1/combos/combo_cliente?perfil=0&nome=${descricao}`
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

  // #endregion

  // #endregion

  async function handleRelatorio() {
    try {
      setLoading(true);
      const param = frmRel.current.getData();

      let tpRel = '';

      if (document.getElementById('tit_aberto').checked) tpRel = '1';
      else if (document.getElementById('tit_baixado').checked) tpRel = '2';
      else if (document.getElementById('tit_vencido').checked) tpRel = '3';
      else tpRel = '1';

      let url = ``;
      if (tipo === 'R') {
        url = `v1/fina/report/titctarec?tpRel=${tpRel}&data_ini=${moment(
          dataIni
        ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
          'YYYY-MM-DD'
        )}&cliente=${param.clifornec || ''}`;
      } else {
        url = `v1/fina/report/titctapag?tpRel=${tpRel}&data_ini=${moment(
          dataIni
        ).format('YYYY-MM-DD')}&data_fin=${moment(dataFin).format(
          'YYYY-MM-DD'
        )}&fornec=${param.clifornec || ''}&ordenar=`;
      }
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
    // comboGeral(25);
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
              <BoxItemCad fr="1fr">
                <AreaComp wd="100">
                  <AsyncSelectForm
                    name="clifornec"
                    label={tipo === 'R' ? 'CLIENTE' : 'FORNECEDOR'}
                    placeholder="NÃO INFORMADO"
                    defaultOptions
                    cacheOptions
                    value={clienteForn}
                    onChange={(c) => setClienteForn(c || [])}
                    loadOptions={
                      tipo === 'R' ? loadOptionsCliente : loadOptionsFornec
                    }
                    isClearable
                    zindex="153"
                  />
                </AreaComp>
              </BoxItemCad>
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
              <h1>TIPOS DE IMPRESSÃO</h1>

              <BoxItemCadNoQuery fr="1fr" />
              <AreaComp wd="100" ptop="5px">
                <CCheck>
                  <input type="radio" id="tit_aberto" name="titulos" />
                  <label htmlFor="tit_aberto">TITULOS EM ABERTO</label>
                </CCheck>
                <CCheck>
                  <input type="radio" id="tit_baixado" name="titulos" />
                  <label htmlFor="tit_baixado">TITULOS BAIXADO</label>
                </CCheck>
                <CCheck>
                  <input type="radio" id="tit_vencido" name="titulos" />
                  <label htmlFor="tit_vencido">
                    TITULOS VENCIDOS (NÃO PAGO)
                  </label>
                </CCheck>
              </AreaComp>
              <BoxItemCadNoQuery
                fr="1fr"
                ptop="30px"
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
        title="RELATÓRIO CONTAS A RECEBER"
        message="Aguarde Processamento..."
      />
    </>
  );
}

REL_TITULOS.propTypes = {
  tipo: PropTypes.string.isRequired,
};
