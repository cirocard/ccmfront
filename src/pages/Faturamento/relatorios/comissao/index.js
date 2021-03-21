import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FaPrint } from 'react-icons/fa';
import DatePickerInput from '~/componentes/DatePickerInput';
import FormSelect from '~/componentes/Select';
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

export default function BC_COMISSAO() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmRel = useRef(null);
  const [loading, setLoading] = useState(false);
  const [optUsers, setOptUsers] = useState([]);
  const [dataIni, setDataIni] = useState(moment());
  const [dataFin, setDataFin] = useState(moment().add(7, 'day'));

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  async function getComboUsers(emp_id) {
    try {
      const response = await api.get(`v1/combos/user_empresa/${emp_id}`);
      const dados = response.data.retorno;
      if (dados) {
        setOptUsers(dados);
      }
    } catch (error) {
      toast.error(`Erro ao carregar combo usuarios \n${error}`);
    }
  }

  // #endregion

  async function handleRelatorio() {
    try {
      setLoading(true);
      const param = frmRel.current.getData();
      if (!param.vendedor) {
        toast.error('INFORME O VENDEDOR(A) PARA CONTINUAR', toastOptions);
        setLoading(false);
        return;
      }

      const url = `v1/fat/report/comissao?data_ini=${moment(dataIni).format(
        'YYYY-MM-DD'
      )}&data_fin=${moment(dataFin).format('YYYY-MM-DD')}&usr_id=${
        param.vendedor
      }`;

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
    getComboUsers(0);
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
              <BoxItemCad fr="1fr">
                <AreaComp wd="100">
                  <FormSelect
                    label="VENDEDOR(A)"
                    name="vendedor"
                    optionsList={optUsers}
                    placeholder="NÃO INFORMADO"
                    clearable={false}
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
        title="BASE CÁLCULO COMISSÕES"
        message="Aguarde Processamento..."
      />
    </>
  );
}
