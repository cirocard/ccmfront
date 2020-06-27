import styled, { css } from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const Scroll = styled(PerfectScrollbar)`
  width: 100%;
  height: 99%;
  padding-bottom: 7px;
  padding-right: 12px;
`;

export const ScrollGrid = styled(PerfectScrollbar)`
  width: 100%;
  max-height: 99%;
  padding-bottom: 15px;
  padding-right: ${(props) => (props.pding ? 15 : 2)}px;

  button {
    border: 0;
    background: none;
  }
`;

export const Container = styled.div`
  max-width: 100%;
  height: 95%;
  margin: 0 auto;
`;

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-items: center;
  padding-top: 5px;
  padding-left: 10px;
  width: ${(props) => props.wd};
  height: 30px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  background: ${(props) => props.bckgnd || '#fafafa'};

  h1 {
    width: calc(100% - 40px);
    margin-top: 5px;
    text-align: ${(props) => props.lefth1 || 'center'};
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.fontcolor || '#244448'};
  }

  button {
    border: 0;
    background: none;
  }
`;

export const Linha = styled.div`
  background: ${(props) => props.bkg || '#0c181a'};
  height: ${(props) => props.hg || '1px'};
  width: 100%;
`;

export const AreaChart = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.7);
`;

export const ToolChart = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 10px;

  background: #fafafa;

  h1 {
    width: 100%;
    text-align: center;
    display: block;
    font-size: 16px;
    font-weight: bold;
    color: #61098a;
  }
`;

export const AreaComp = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: left;
  align-self: center;
  padding-left: ${(props) => props.pleft};
  padding-top: ${(props) => props.ptop};
  padding-right: 5px;
  padding-bottom: 5px;
  width: ${(props) => props.wd}%;
  height: ${(props) => props.hg}px;
  font-size: 14px;
  font-weight: 400;
  min-height: 35px;
  color: #500569;
  margin: 0;
  font-size: 12px;
  color: #232c4f;

  ${(props) =>
    props.bright &&
    css`
      border-right: solid 1px #ccc;
    `}

  ${(props) =>
    props.btn &&
    css`
      button {
        border: 0;
        background: none;
      }
    `}
  h1 {
    color: #fa7d00;
    font-weight: 700;
    font-size: 14px;
  }

  label {
    color: '#3b535f';
    font-size: 14px;
    font-weight: 700;
  }

  h3 {
    width: 100%;
    text-align: right;
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: #61098a;
  }

  h2 {
    width: 100%;
    text-align: center;
    display: block;
    font-size: 15px;
    font-weight: bold;
    color: #cf0515;
  }

  /* cor do componente */
  .css-yk16xz-control {
    background: #eef3f5;
    border: solid 1px #ccc;
    &:focus {
      background: #eef3f5;
    }
  }

  .css-yk16xz-control,
  .css-2b097c-container,
  .css-yk16xz-control,
  .css-1hwfws3 {
    background: #eef3f5;
    font-weight: 700;
  }

  /* cor do placeholder */
  .css-1wa3eu0-placeholder {
    color: rgba(0, 0, 0, 0.4);
    font-weight: 700;
  }

  /* cor da fonte no componente sem foco */
  .css-1uccc91-singleValue {
    color: #101b1d;
  }
`;

export const AreaCad = styled.div`
  width: 100%;
`;

export const DivLimitadorRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const DivLimitador = styled.div`
  width: ${(props) => props.wd};
  height: ${(props) => props.hg};
  padding: 3px 0 5px 0;
  margin-left: 3px;
`;

export const AreaConsult = styled.div`
  width: 100%;
  padding-left: ${(props) => props.pleft};
  padding-top: ${(props) => props.ptop};
`;

export const BoxComponentes = styled.div`
  display: flex;
  justify-content: ${(props) => (props.fend ? 'flex-end' : 'flex-start')};
  justify-items: center;
  margin: 0px;
  padding-top: ${(props) => props.pdtop}px;
  width: 100%;
`;

export const BoxItemCad = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.fr};
  grid-gap: 1px;
  justify-content: stretch;
  justify-items: left;
  vertical-align: center;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1000px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const BoxItemCadNoQuery = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.fr};
  grid-gap: 1px;
  justify-content: stretch;
  justify-items: ${(props) => props.just};
  vertical-align: center;
  padding-top: ${(props) => props.ptop || 0};
  padding-bottom: ${(props) => props.pbotton || 0};
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const CModal = styled.div`
  width: ${(props) => props.wd};
  height: ${(props) => props.hg};
  margin: 0 auto;
  padding: 10px;
  background: #fafafa;

  h1 {
    font-size: 15px;
    font-weight: 700;
    color: #253739;
    padding: 5px;
    background: #dae2e5;
  }
`;

export const CCheck = styled.div`
  padding-bottom: 5px;
  input[type='checkbox'] {
    display: none;
  }

  input[type='checkbox'] + label {
    display: block;
    position: relative;
    padding-left: 25px;

    margin-bottom: 20px;
    font: 14px/20px 'Open Sans', Arial, sans-serif;
    font-weight: 700;
    color: #3b535f;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  input[type='checkbox'] + label:last-child {
    margin-bottom: 0;
  }

  input[type='checkbox'] + label:before {
    content: '';
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid #3b535f;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.6;
    -webkit-transition: all 0.12s, border-color 0.08s;
    transition: all 0.12s, border-color 0.08s;
  }

  input[type='checkbox']:checked + label:before {
    width: 10px;
    top: -5px;
    left: 5px;
    border-radius: 0;

    opacity: 1;
    border-top-color: transparent;
    border-left-color: transparent;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  input[type='radio'] {
    display: none;
  }

  input[type='radio'] + label {
    display: block;
    position: relative;
    padding-left: 25px;
    margin-bottom: 20px;
    font: 14px/20px 'Open Sans', Arial, sans-serif;
    font-weight: 700;
    color: #3b535f;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  input[type='radio'] + label:last-child {
    margin-bottom: 0;
  }

  input[type='radio'] + label:before {
    content: '';
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid #3b535f;
    border-radius: 50%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.6;
    -webkit-transition: all 0.12s, border-color 0.08s;
    transition: all 0.12s, border-color 0.08s;
  }

  input[type='radio']:checked + label:before {
    width: 10px;
    top: -5px;
    left: 5px;
    border-radius: 0;

    opacity: 1;
    border-top-color: transparent;
    border-left-color: transparent;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`;

export const ToolBarItem = styled.div`
  margin: 3px 0px;
  width: 100%;
  text-align: center;
  padding: 5px 0px 5px 0px;
  &:hover {
    background: #01293e;
    border-radius: 3px;
  }
`;
