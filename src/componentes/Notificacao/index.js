import React, { useEffect, useState, useRef } from 'react';
import { Form } from '@unform/web';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';
import DialogInfo from '~/componentes/DialogInfo';
import { ApiService, ApiTypes } from '~/services/api';
import { gridTraducoes } from '~/services/gridTraducoes';
import {
  ContentConsulta,
  Panel,
  ContainerConsulta,
  GridCliente,
} from './styles';
import { AreaComp, BoxItemCadNoQuery } from '~/pages/general.styles';

export default function NOTIFICACOES() {
  const api = ApiService.getInstance(ApiTypes.API1);
  const frmNotific = useRef(null);
  const [loading, setLoading] = useState(false);
  const [ntCliente, setNtCliente] = useState([]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  // #region COMBO ========================

  // #endregion

  async function handleCliente() {
    try {
      const response = await api.get(`v1/crm/consulta/notific_cliente_detalhe`);
      const dados = response.data.retorno;
      if (dados) {
        setNtCliente(dados);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        `Erro ao consultar notificaçoes de cliente \n${error}`,
        toastOptions
      );
    }
  }

  useEffect(() => {
    handleCliente();
  }, []);

  const gridColumnCliente = [
    {
      field: 'cli_id',
      headerName: 'CÓD. CLIENTE',
      width: 120,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cli_razao_social',
      headerName: 'RAZÃO SOCIAL',
      width: 300,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      field: 'cli_datanasc',
      headerName: 'DATA NASCIMENTO',
      width: 150,
      sortable: true,
      resizable: true,
      filter: false,
      lockVisible: true,
    },
    {
      flex: 1,
    },
  ];

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
            <Form id="frmNotific" ref={frmNotific}>
              <BoxItemCadNoQuery fr="1fr">
                <AreaComp wd="100">
                  <h1>CLIENTES ANIVERSARIANTES DO DIA</h1>
                  <GridCliente className="ag-theme-balham">
                    <AgGridReact
                      columnDefs={gridColumnCliente}
                      rowData={ntCliente}
                      rowSelection="single"
                      animateRows
                      gridOptions={{ localeText: gridTraducoes }}
                    />
                  </GridCliente>
                </AreaComp>
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
        title="NOTIFICAÇÕES DO SISTEMA"
        message="Aguarde Processamento..."
      />
    </>
  );
}
