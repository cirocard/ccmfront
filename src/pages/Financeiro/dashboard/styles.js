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

export const Container = styled.div`
  width: 100%;
  height: 100%;
  margin: 0px;
  background: #fff;
  margin-top: 0px;
  background: #1f3b3e;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
`;

export const TitleBar = styled.div`
  margin-top: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-items: center;
  padding: 5px;
  width: 100%;
  height: 30px;
  background: #213f41;
  border-top: solid 1px #d4f7f9;

  h1 {
    width: 100%;

    text-align: ${(props) => props.lefth1 || 'center'};
    font-size: 16px;
    font-weight: 700;
    color: #b7e0e3;
  }

  button {
    border: 0;
    background: none;
  }
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

export const AreaComp = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: left;
  align-self: ${(props) => props.alself || 'center'};
  padding-left: ${(props) => props.pleft};
  padding-top: ${(props) => props.ptop};
  padding-right: ${(props) => props.pright || '5px'};
  padding-bottom: 5px;
  width: ${(props) => props.wd || '99%'};
  height: ${(props) => props.hg || '300px'};
  font-weight: 400;
  margin: 0;

  label {
    text-align: center;
    color: ${(props) => props.lblColor || '#3b535f'};
    font-size: ${(props) => props.lblFontSize || '12px'};
    font-weight: 700;
    margin: 7px 0 3px 0;
    font-size: 16px;
  }

  input {
    margin-left: 10px;
    margin-right: 12px;
    width: calc(100% -23px);
  }
`;

export const BoxInfoNumber = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-self: center;
  width: 99%;
  height: ${(props) => props.hg || '300px'};
  font-weight: 700;
  margin: 0;
  background-color: #1a3234;

  span {
    text-align: center;
    color: ${(props) => props.fontcor};
    font-size: 18px;
    font-weight: 700;
    margin: 7px 0 3px 0;
  }

  h1 {
    text-align: center;
    color: ${(props) => props.fontcor};
    font-size: 30px;
    font-weight: 700;
  }
`;
