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
  padding-top: 120px;
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

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: ${({ pdtop }) => pdtop}px;

  /* altura da div */
  @media (min-height: 300px) {
    height: 30vh;
    border-bottom: solid 1px #000;
    overflow: auto;
  }

  @media (min-height: 600px) {
    height: 34vh;
    border-bottom: solid 1px #000;
    overflow: auto;
  }

  @media (min-height: 680px) {
    height: 38vh;
  }

  @media (min-height: 780px) {
    height: 42vh;
  }

  @media (min-height: 880px) {
    height: 45vh;
  }
`;

export const EditorFechamento = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: ${({ pdtop }) => pdtop}px;

  /* altura da div */
  @media (min-height: 300px) {
    height: 26vh;
    border-bottom: solid 1px #000;
    overflow: auto;
  }

  @media (min-height: 600px) {
    height: 28vh;
    border-bottom: solid 1px #000;
    overflow: auto;
  }

  @media (min-height: 680px) {
    height: 31vh;
  }

  @media (min-height: 780px) {
    height: 35vh;
  }

  @media (min-height: 880px) {
    height: 38vh;
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
  margin-top: -10px;

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

  button {
    border: 0;
    background: none;
    cursor: pointer;
  }

  .cell_quantity {
    font-weight: bold;
    font-size: 14px;
    color: #000 !important;
    text-align: right;
  }

  @media (min-height: 300px) {
    height: 26vh;
  }

  @media (min-height: 600px) {
    height: 28vh;
  }

  @media (min-height: 680px) {
    height: 31vh;
  }

  @media (min-height: 780px) {
    height: 35vh;
  }

  @media (min-height: 880px) {
    height: 38vh;
  }
`;

export const GridContainerMain = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 5px 0 0;

  .warn-finalizado {
    background-color: #dbf2df !important;
  }

  .warn-cancelado {
    background-color: #d81e00 !important;
    color: #fff !important;
  }

  @media (min-height: 300px) {
    height: 42vh;
  }

  @media (min-height: 600px) {
    height: 46vh;
  }

  @media (min-height: 680px) {
    height: 51vh;
  }

  @media (min-height: 780px) {
    height: 56vh;
  }

  @media (min-height: 880px) {
    height: 66vh;
  }
`;

export const DivGeral = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.wd || '200px'};
`;
