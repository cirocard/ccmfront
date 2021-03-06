import styled from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const Scroll = styled(PerfectScrollbar)`
  width: 100%;
  padding-bottom: 15px;
  padding-right: 15px;
`;

export const ContentBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;

  margin: 0 auto;
  height: 100%;
`;

export const ToolBar = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${(props) => props.ptop || '120px'};
  width: ${(props) => props.wd};
  height: ${(props) => props.hg};
  margin-left: ${(props) => props.mleft || -10}px;
  margin-top: 0px;
  background: #244448;
  border-top: solid 1px #244448;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);

  button {
    border: 0;
    background: none;
  }
  button:hover {
    background: #01293e;
    border-radius: 5px;
  }
`;

export const Container = styled.div`
  width: calc(100% - 55px);
  height: 98%;
  border-radius: 4px;
  margin-left: 5px;
  background: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
`;

export const ContainerConsulta = styled.div`
  width: calc(100% - 40px);
  height: 98%;
  border-radius: 1px;
  margin-left: 5px;
  background: #fff;
`;

export const Panel = styled.div`
  width: 100%;
  border-radius: 4px;
  margin-left: 0px;
  padding: ${(props) => props.pdding || '1px'};
  margin-top: ${(props) => props.mtop || '-10px'};

  h1 {
    width: 100%;
    margin-top: 0px;
    text-align: ${(props) => props.lefth1 || 'center'};
    font-size: 16px;
    font-weight: 700;
    padding: 5px;
    margin-left: 0px;
    color: ${(props) => props.fontcolor || '#244448'};
    background: ${(props) => props.bckgnd || '#244448'};
  }
`;

export const ContentConsulta = styled.div`
  display: flex;
`;

export const Content = styled.div`
  width: 100%;
  height: 95%;
  padding: 7px 10px 10px 10px;

  h1 {
    font-size: 15px;
    font-weight: 700;
    color: #253739;
    padding: 5px;
    background: #dae2e5;
  }

  img {
    height: 120px;
    width: 120px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    background: #eee;
  }

  form {
    span {
      font-size: 10px;
      color: #fb6f91;
      align-self: flex-start;
      margin: 0 0 10px;
      font-weight: bold;
    }
  }
`;

export const BoxPesquisa = styled.div`
  display: flex;
  justify-content: space-around;
  justify-items: center;
  align-items: center;
  align-content: center;

  width: 100%;
  height: 28px;
  background: #fff;
  border-bottom: solid 1px #dfe7df;

  background: #dae2e5;
  padding: 5px;
  h1 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #253739;
    padding: 0px;
    background: transparent;
  }

  button {
    margin: 0;
    border: 0;
    background: none;
    padding-right: 10px;
    cursor: pointer;
  }

  div {
    text-align: right;
    margin-top: 7px;
    width: 250px;
  }
`;

export const GridContainerItens = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  button {
    border: 0;
    background: none;
    cursor: pointer;
  }

  @media (min-height: 300px) {
    height: 29vh;
  }

  @media (min-height: 600px) {
    height: 32vh;
  }

  @media (min-height: 680px) {
    height: 36vh;
  }

  @media (min-height: 780px) {
    height: 42vh;
  }

  @media (min-height: 880px) {
    height: 53vh;
  }
`;

export const GridContainerCheque = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px;

  button {
    border: 0;
    background: none;
    cursor: pointer;
  }

  .cell_valor {
    font-weight: bold;
    font-size: 13px;
    color: #000;
    text-align: right;
  }

  .warn-baixado {
    background-color: #afe8ba !important;
    color: #03420f !important;
  }

  @media (min-height: 300px) {
    height: 29vh;
  }

  @media (min-height: 600px) {
    height: 30vh;
  }

  @media (min-height: 680px) {
    height: 30vh;
  }

  @media (min-height: 780px) {
    height: 35vh;
  }

  @media (min-height: 880px) {
    height: 45vh;
  }

  h3 {
    font-size: 18px;
    color: #4d2679;
    margin-bottom: 16px;
  }
`;

export const GridContainerMain = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  .warn-baixado {
    background-color: #afe8ba !important;
    color: #03420f !important;
  }

  .warn-cancelado {
    background-color: #ffbaab !important;
    color: #a90505 !important;
  }

  .cell_valor {
    font-weight: bold;
    font-size: 13px;
    color: #000;
    text-align: right;
  }

  @media (min-height: 300px) {
    height: 40vh;
  }

  @media (min-height: 600px) {
    height: 45vh;
  }

  @media (min-height: 680px) {
    height: 50vh;
  }

  @media (min-height: 780px) {
    height: 55vh;
  }

  @media (min-height: 880px) {
    height: 65vh;
  }
`;
