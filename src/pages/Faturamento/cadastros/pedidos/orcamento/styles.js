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
  padding-top: 30px;
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
    &:disabled {
      cursor: not-allowed;
    }
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

export const Panel = styled.div`
  width: 100%;
  border-radius: 4px;
  margin-left: 0px;
  padding: ${(props) => props.pdding || '1px'};
  margin-top: ${(props) => props.mtop || '-10px'};

  h1 {
    width: ${(props) => props.wdh1 || '100%'};
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
  width: 100%;
  height: 40px;
  background: #fff;
  border-bottom: solid 1px #dfe7df;
  border-radius: 5px;
`;

export const GridContainerItens = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  .cell_quantity {
    font-weight: bold;
    font-size: 14px;
    color: #af2000 !important;
  }

  .cell_total {
    font-weight: bold;
    font-size: 14px;
  }

  button {
    border: 0;
    background: none;
    cursor: pointer;
  }

  @media (min-height: 300px) {
    height: 25vh;
  }

  @media (min-height: 600px) {
    height: 28vh;
  }

  @media (min-height: 680px) {
    height: 30vh;
  }

  @media (min-height: 780px) {
    height: 36vh;
  }

  @media (min-height: 880px) {
    height: 40vh;
  }
`;

export const GridContainerGrade = styled.div`
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

  h3 {
    font-size: 18px;
    color: #4d2679;
    margin-bottom: 16px;
  }
`;

export const GridContainerFina = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  .cell_quantity {
    font-weight: bold;
    font-size: 14px;
    color: #af2000 !important;
  }

  .cell_total {
    font-weight: bold;
    font-size: 14px;
  }

  button {
    border: 0;
    background: none;
    cursor: pointer;
  }

  @media (min-height: 300px) {
    height: 30vh;
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
    height: 47vh;
  }
`;

export const GridContainerMain = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  .warn-finalizado {
    background-color: #017a0c !important;
    color: #fff !important;
  }

  .warn-cancelado {
    background-color: #bd0303 !important;
    color: #fff !important;
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
    height: 58vh;
  }
`;

export const DivGeral = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.wd || '200px'};
`;
