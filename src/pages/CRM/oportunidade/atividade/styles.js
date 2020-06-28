import styled, { css } from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { lighten, darken } from 'polished';

export const Scroll = styled(PerfectScrollbar)`
  width: 100%;
  padding-bottom: 15px;
  padding-right: 15px;
`;

export const ToolBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-content: center;
  padding-top: 50px;
  width: 45px;
  height: 100%;
  margin-left: -5px;
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
    border-radius: 3px;
  }
`;

export const Container = styled.div`
  width: calc(100% - 50px);
  height: 98%;
  border-radius: 4px;
  margin-left: 5px;
  background: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
`;

export const Content = styled.div`
  width: 100%;
  height: 98%;
  padding: 5px 10px 5px 10px;

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

export const BoxRaia = styled.div`
  display: flex;
  width: 100%;
  height: 99%;
`;
export const Raia = styled.div`
  display: flex;
  flex-direction: column;

  width: ${(props) => props.wd || '300px'};
  flex-shrink: 0; /* para manter a largura informar zero */
  height: 99%;
  padding: 0px 5px 5px 5px;
  border-right: solid 2px #fff;
  background: #f5f7f8;

  h1 {
    padding: 5px 0px 5px 0px;
    text-align: center;
    background: #244448;
    font-weight: 700;
    font-size: 14px;
    color: #edfafc;
    width: 100%;
  }

  button {
    border: 0;
    background: none;
    border: none !important;
    outline: none !important;
  }
`;

export const Oportunidade = styled.div`
  display: flex;
  flex-direction: column;
  first-child {
    margin: 0px;
  }
  margin: 5px 0px;
  width: 100%;
  height: 100px;
  background: #fff;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);

  h1 {
    margin: 0px;
    text-align: left;
    width: 100%;
    font-size: 12px;
    font-weight: bold;
    background: none;
    color: #000;
    padding: 0px 0px 3px;
  }
  h2 {
    margin: 0px;
    text-align: left;
    width: 100%;
    font-size: 10px;
    font-weight: bold;
    color: #ce6503;
    padding: 0px 0px 3px;
  }
  h3 {
    margin: 0px;
    text-align: left;
    width: 100%;
    white-space: nowrap;
    padding-right: 5px;
    font-size: 11px;
    font-weight: bold;
    color: #4b4743;
    padding: 3px 0px 0px;
  }
`;

export const Atividade = styled.div`
  display: flex;
  flex-direction: column;

  margin: 5px 0px;
  width: 100%;
  height: 380px;
  background: #fff;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);

  h1 {
    margin: 0px;
    background: transparent;
    text-align: center;
    width: 100%;
    font-size: 13px;
    font-weight: bold;
    color: #244448;
    padding: 0px 0px 3px;
  }
  label {
    margin: 0px;
    text-align: left;
    width: 100%;
    font-size: 12px;
    font-weight: bold;
    background: none;
    color: #273128;
    padding: 0px 0px 3px;
  }

  span {
    margin: 0px;
    text-align: left;
    font-size: 11px;
    font-weight: bold;
    color: #ce6503;
    padding: 3px 0px 3px;
  }
`;

export const Fluxoatv = styled.div`
  background: ${(props) => props.bkg || '#0c181a'};
  height: ${(props) => props.hg || '1px'};
  width: 100%;
  &::after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
    margin-left: 50%;
    width: 0;
    height: 0;

    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 25px solid #f00;
  }
`;

export const ToolbarAtv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-items: center;
  width: 100%;

  h1 {
    padding: 4px 5px 3px 10px;
    border-radius: 3px;
    text-align: center;
    color: #3a3d4b;
    background: #dadbdf;
    width: calc(100% - 100px);
  }
`;

export const ColunaAtv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-left: ${(props) => props.bleft || 'none'};
  padding: 10px 5px 5px 7px;
`;

export const BtnFiltroAtv = styled.div`
  display: flex;
  width: 100%;
  height: 35px;
  background: #fff;
  border: solid 1px #fafafa;
  border-radius: 3px;

  button {
    margin: 0px 3px 0px 3px;
    height: 33px;
    background: #3b535f;
    text-align: center;
    font-weight: bold;
    color: #fff;
    border: 0;
    border-radius: 4px;
    padding: 0px 10px 0px 10px;
    font-size: 14px;
    transition: background 0.2s;

    &:hover {
      background: ${lighten(0.2, '#3b535f')};
    }
  }
`;
