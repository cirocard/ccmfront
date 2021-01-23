import React, { useEffect, useState } from 'react';

import Select from 'react-select';
import { MdClose } from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { Slide } from '@material-ui/core';
import { toast } from 'react-toastify';
import { Container, Content } from './styles';
import {
  TitleBar,
  AreaComp,
  CCheck,
  BoxItemCad,
  BoxItemCadNoQuery,
  Linha,
  CModal,
  Scroll,
} from '~/pages/general.styles';
import { BootstrapTooltip } from '~/componentes/ToolTip';
import history from '~/services/history';
import { ApiService, ApiTypes } from '~/services/api';
import {
  getComboUf,
  getTpAmb,
  getTpEmis,
  getModeloDanfe,
} from '~/services/arrays';
import { FormataData } from '~/services/func.uteis';

export default function Parametros() {
  const api = ApiService.getInstance(ApiTypes.API1);

  const [loading, setLoading] = useState(false);
  const [msgGeral, setMsgGeral] = useState('');
  const [titleMsg, setTitleMsg] = useState('');
  const [preview, setPreview] = useState('');
  const [ufSelected, setUfSelected] = useState('UF');
  const [ambientePadrao, setAmbientePadrao] = useState(1);
  const [tipoEmis, setTipopEmis] = useState(1);
  const [optDanfe, setOptDanfe] = useState(1);
  const [tabPrecoConsig, setTabPrecoConsig] = useState(0);
  const [tabPrecoPrevend, setTabPrecoPrevend] = useState(0);
  const [openDlgMsg, setOpenDlgMsg] = useState(false);
  const [optComboTabPreco, setOptComboTabPreco] = useState([
    { value: '0', label: 'VOCÊ NÃO POSSUI TABELA CADASTRADA' },
  ]);

  const toastOptions = {
    autoClose: 4000,
    position: toast.POSITION.TOP_CENTER,
  };

  const optUf = getComboUf();
  const tpAmb = getTpAmb();
  const tpEmis = getTpEmis();
  const modeloDanfe = getModeloDanfe();

  const handleUfSelected = (e) => {
    setUfSelected(e.value);
  };
  const handleAmbienteSelected = (e) => {
    setAmbientePadrao(e.value);
  };
  const handleTpEmisSelected = (e) => {
    setTipopEmis(e.value);
  };
  const handleDanfeSelected = (e) => {
    setOptDanfe(e.value);
  };
  const handleTabConsigSelected = (e) => {
    setTabPrecoConsig(e.value);
  };
  const handleTabPrevendSelectec = (e) => {
    setTabPrecoPrevend(e.value);
  };

  // carregar parametros do sistema
  async function loadParameters(obj) {
    try {
      setPreview(`${obj.par_logomarca}`);

      document.getElementsByName('proxNumNfe')[0].value = obj.par_prox_numero;
      document.getElementsByName('serieNfe')[0].value = obj.par_serie_nf;
      document.getElementsByName('proxNumDev')[0].value =
        obj.par_prox_numero_dev;
      document.getElementsByName('serieNfeDev')[0].value = obj.par_serie_dev;
      setUfSelected(obj.par_uf_padrao);
      setTipopEmis(obj.par_tpemis);
      setOptDanfe(obj.par_modelo_danfe);
      setAmbientePadrao(obj.par_ambiente_padrao);
      document.getElementsByName('notasLote')[0].value = obj.par_qtd_notas;
      document.getElementsByName('aliqSimples')[0].value = obj.par_aliq_simples;
      document.getElementsByName('chbDiferenciaNum')[0].value =
        obj.par_diferencia_num_dev;
      document.getElementsByName('msgFiscal')[0].value = obj.par_msg_padrao;

      document.getElementById('rbPrecoAbsoluto').checked =
        obj.par_preco_absoluto === 'S';
      document.getElementById('rbPrecoFracao').checked =
        obj.par_preco_absoluto === 'N';

      setTabPrecoConsig(obj.par_tab_padrao_consignado);
      setTabPrecoPrevend(obj.par_tab_padrao_prevenda);
      document.getElementsByName('percentCota')[0].value =
        obj.par_cota_consignada;
    } catch (error) {
      toast.error(`Houve um erro ao parametros do sistema \n${error}`);
    }
  }

  // informaçoes do certificado digital
  useEffect(() => {
    async function getInfoCert() {
      try {
        const label = document.getElementById('lblCertificado');
        const response = await api.get('v1/accounts/infoCert');
        const dados = response.data.retorno[0];
        if (dados) {
          label.querySelector('span').innerHTML = `${
            dados.nome
          } validade: ${FormataData(dados.validade, 2)}`;
        } else {
          label.querySelector(
            'span'
          ).innerHTML = `Clique aqui para localizar o arquivo`;
        }
      } catch (error) {
        toast.error(
          `Houve um erro ao carregar cidades de descarregamento \n${error}`
        );
      }
    }

    async function getComboTabPreco() {
      try {
        const response = await api.get('v1/combos/tabpreco');
        const dados = response.data.retorno;
        if (dados) {
          setOptComboTabPreco(dados);
        }
      } catch (error) {
        toast.error(`Houve um erro ao buscar tabelas de preço \n${error}`);
      }
    }

    async function getParam() {
      try {
        const response = await api.get('v1/cadastros/param');
        const dados = response.data.retorno;
        if (dados) {
          await loadParameters(dados[0]);
        }
      } catch (error) {
        toast.error(`Houve um erro ao parametros do sistema \n${error}`);
      }
    }
    window.loadMenu();
    getInfoCert();
    getComboTabPreco();
    getParam();
  }, []);

  function handlePgMain() {
    history.push('/', '_blank');
    history.go(0);
  }

  // certificado
  async function handleChangeInput(e) {
    try {
      const label = document.getElementById('lblCertificado');
      label.querySelector('span').innerHTML = 'Processando...';
      if (document.getElementsByName('pwdcert')[0].value) {
        if (e.target.files[0]) {
          const datacert = new FormData();
          datacert.append('certificado', e.target.files[0]);
          datacert.append(
            'password',
            document.getElementsByName('pwdcert')[0].value
          );
          const response = await api.post('v1/accounts/certifile', datacert);

          label.querySelector('span').innerHTML = `${
            response.data.certnome
          } validade: ${FormataData(response.data.validade, 2)}`;

          setTitleMsg('Configurações do Sistema');
          setMsgGeral(
            'Para validar as configurações do certificado digital, é necessário fazer novo login no sistema!!!'
          );
        }
      } else {
        toast.warning(
          'Informe a senha do certificado antes de localizar o arquivo!!!',
          toastOptions
        );
      }
    } catch (error) {
      toast.error(`Erro ao processar operação: ${error}`, toastOptions);
    }
  }

  // logomarca
  async function handleInputLogomarca(e) {
    try {
      const label = document.getElementById('lblLogomarca');
      label.querySelector('span').innerHTML = 'Processando...';

      if (e.target.files[0]) {
        const datalogo = new FormData();
        datalogo.append('logomarca', e.target.files[0]);
        const response = await api.post('v1/cadastros/logomarca', datalogo);
        const papthImage = `${response.data}`;
        setPreview(papthImage);
        label.querySelector('span').innerHTML =
          'Logomarca Configurada no sistema!!!';
      }
    } catch (error) {
      toast.error(`Erro ao processar operação: ${error}`, toastOptions);
    }
  }

  // salvar o cadastro
  async function handleSalvar() {
    try {
      setLoading(true);
      const param = {
        par_prox_numero: document.getElementsByName('proxNumNfe')[0].value,
        par_serie_nf: document.getElementsByName('serieNfe')[0].value,
        par_prox_numero_dev: document.getElementsByName('proxNumDev')[0].value,
        par_serie_dev:
          document.getElementsByName('serieNfeDev')[0].value || null,
        par_uf_padrao: ufSelected,
        par_tpemis: tipoEmis,
        par_modelo_danfe: optDanfe,
        par_ambiente_padrao: ambientePadrao,
        par_qtd_notas: document.getElementsByName('notasLote')[0].value,
        par_aliq_simples: document.getElementsByName('aliqSimples')[0].value,
        par_diferencia_num_dev: document.getElementsByName(
          'chbDiferenciaNum'
        )[0].value,
        par_msg_padrao: document.getElementsByName('msgFiscal')[0].value,

        par_preco_absoluto: document.getElementById('rbPrecoAbsoluto').checked
          ? 'S'
          : 'N',
        par_tab_padrao_consignado: tabPrecoConsig,
        par_tab_padrao_prevenda: tabPrecoPrevend,
        par_cota_consignada: document.getElementsByName('percentCota')[0].value,
      };

      const retorno = await api.post('v1/cadastros/param', param);
      if (retorno.data.success) {
        toast.info('Cadastro atualizado com sucesso!!!', toastOptions);
      } else {
        toast.error(
          `Houve erro no processamento!! ${retorno.data.message}`,
          toastOptions
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(`Erro salvar parametros: ${error}`, toastOptions);
    }
  }

  return (
    <>
      <Container id="pgparam">
        <TitleBar wd="100%">
          <h1>CONFIGURAÇÕES GERAIS DO SISTEMA</h1>
          <BootstrapTooltip title="Voltar para Dashboard" placement="top">
            <button type="button" onClick={handlePgMain}>
              <MdClose size={30} color="#244448" />
            </button>
          </BootstrapTooltip>
        </TitleBar>
        <Content>
          <Scroll>
            <BoxItemCad fr="1fr 2fr">
              <AreaComp wd="100">
                <h1>LOGOMARCA DA EMPRESA...</h1>
                <div>
                  <input
                    type="file"
                    name="logomarca"
                    id="logomarca"
                    className="inputfile inputfile-3"
                    accept="image/png, image/jpg, image/bmp"
                    onChange={handleInputLogomarca}
                  />
                  <label id="lblLogomarca" htmlFor="logomarca">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="17"
                      viewBox="0 0 20 17"
                    >
                      <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
                    </svg>{' '}
                    <span>Clique aqui para localizar o arquivo&hellip;</span>
                  </label>
                </div>
                <img
                  src={
                    preview ||
                    'https://api.adorable.io/avatars/50/abott@adorable.png'
                  }
                  alt=""
                />
              </AreaComp>
              <AreaComp wd="99">
                <h1>CERTIFICADO DIGITAL...</h1>
                <div>
                  <input
                    type="file"
                    name="certificado"
                    id="certificado"
                    className="inputfile inputfile-3"
                    accept=".pfx"
                    onChange={handleChangeInput}
                  />
                  <label id="lblCertificado" htmlFor="certificado">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="17"
                      viewBox="0 0 20 17"
                    >
                      <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
                    </svg>{' '}
                    <span>Clique aqui para localizar o arquivo&hellip;</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="pwdcert"
                  placeholder="SENHA DO CERTIFICADO"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <Linha />
            <h1>PARÂMETROS PARA NOTA E CUPOM FISCAL...</h1>
            <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
              <AreaComp wd="100">
                <label>Próx. Número</label>
                <input
                  type="text"
                  name="proxNumNfe"
                  placeholder="Próx. Número"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Série NFe</label>
                <input
                  type="text"
                  name="serieNfe"
                  placeholder="Série NF-e"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Próx. Num. Dev</label>
                <input
                  type="text"
                  name="proxNumDev"
                  placeholder="Próx. Número Dev."
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Série NFe Dev.</label>
                <input
                  type="text"
                  name="serieNfeDev"
                  placeholder="Próx. Número"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>UF Fiscal</label>
                <Select
                  options={optUf}
                  name="ufPadrao"
                  value={optUf.filter((obj) => obj.value === ufSelected)}
                  placeholder="INFORME A UF..."
                  onChange={handleUfSelected}
                />
              </AreaComp>
            </BoxItemCad>
            <BoxItemCad fr="1fr 1fr 1fr 1fr 1fr">
              <AreaComp wd="100">
                <label>Ambiente Padrão</label>
                <Select
                  options={tpAmb}
                  name="tipoAmbiente"
                  placeholder="INFORME O AMBIENTE"
                  value={tpAmb.filter((obj) => obj.value === ambientePadrao)}
                  onChange={handleAmbienteSelected}
                />
              </AreaComp>

              <AreaComp wd="100">
                <label>Tipo de Emissão</label>
                <Select
                  options={tpEmis}
                  name="tipoEmissao"
                  placeholder="TIPO EMISSÃO"
                  value={tpEmis.filter((obj) => obj.value === tipoEmis)}
                  onChange={handleTpEmisSelected}
                />
              </AreaComp>

              <AreaComp wd="100">
                <label>Modelo Danfe</label>
                <Select
                  options={modeloDanfe}
                  name="modeloDanfe"
                  placeholder="TIPO EMISSÃO"
                  value={modeloDanfe.filter((obj) => obj.value === optDanfe)}
                  onChange={handleDanfeSelected}
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Notas por lote</label>
                <input
                  type="number"
                  name="notasLote"
                  max="50"
                  className="input_cad"
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Aliq. Simples Nac.</label>
                <input
                  type="number"
                  name="aliqSimples"
                  step="any"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>

            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="checkbox"
                    id="chbDiferenciaNum"
                    name="chbDiferenciaNum"
                    value="S"
                  />
                  <label htmlFor="chbDiferenciaNum">
                    Diferenciar numeraçao de devolução
                  </label>
                </CCheck>
              </AreaComp>
            </BoxItemCadNoQuery>
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100" hg="80">
                <label>
                  Mensagem Padrão utilizada no envio das notas fiscais aos
                  destinatários:
                </label>
                <input
                  type="text"
                  multiline="true"
                  name="msgFiscal"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCadNoQuery>

            <Linha />
            <h1>CONFIGURAÇÕES DE VENDA...</h1>

            <BoxItemCad fr="1fr 1fr 1fr 1fr">
              <AreaComp wd="100">
                <CCheck>
                  <input
                    type="radio"
                    id="rbPrecoAbsoluto"
                    name="radio"
                    value="S"
                  />
                  <label htmlFor="rbPrecoAbsoluto">
                    Gerar preço com valor absoluto
                  </label>

                  <input
                    type="radio"
                    id="rbPrecoFracao"
                    name="radio"
                    value="S"
                  />
                  <label htmlFor="rbPrecoFracao">
                    Gerar preço com precisão decimal
                  </label>
                </CCheck>
              </AreaComp>
              <AreaComp wd="100">
                <label>Tabela Preço Venda Consignada</label>
                <Select
                  options={optComboTabPreco}
                  name="tabPrecoConsig"
                  placeholder="INFORME..."
                  value={optComboTabPreco.filter(
                    (obj) => obj.value === tabPrecoConsig
                  )}
                  onChange={handleTabConsigSelected}
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>Tabela Preço para Pré-Venda</label>
                <Select
                  options={optComboTabPreco}
                  name="tabPrecoPrevenda"
                  placeholder="INFORME..."
                  value={optComboTabPreco.filter(
                    (obj) => obj.value === tabPrecoPrevend
                  )}
                  onChange={handleTabPrevendSelectec}
                />
              </AreaComp>
              <AreaComp wd="100">
                <label>% Cota venda consignada</label>
                <input
                  type="number"
                  name="percentCota"
                  step="any"
                  className="input_cad"
                />
              </AreaComp>
            </BoxItemCad>
            <Linha />
            <BoxItemCadNoQuery fr="1fr">
              <AreaComp wd="100" ptop="10px">
                <button
                  type="button"
                  className="btnGeral"
                  onClick={handleSalvar}
                >
                  {loading ? 'Aguarde Processando...' : 'Salvar Cadastro'}
                </button>
              </AreaComp>
            </BoxItemCadNoQuery>
          </Scroll>
        </Content>
      </Container>

      {/* popup geral */}
      <Slide direction="down" in={openDlgMsg}>
        <Dialog
          open={openDlgMsg}
          keepMounted
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenDlgMsg(false)}
        >
          <TitleBar wd="100%">
            <h1>{titleMsg}</h1>
            <BootstrapTooltip title="Fechar Modal" placement="top">
              <button type="button" onClick={() => setOpenDlgMsg(false)}>
                <MdClose size={30} color="#253739" />
              </button>
            </BootstrapTooltip>
          </TitleBar>

          <CModal>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                {msgGeral}
              </DialogContentText>
            </DialogContent>
          </CModal>
        </Dialog>
      </Slide>
    </>
  );
}
