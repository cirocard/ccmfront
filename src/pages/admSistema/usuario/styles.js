import styled from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const Scroll = styled(PerfectScrollbar)`
  width: 100%;
  padding-bottom: 15px;
  padding-right: 15px;
`;

export const ToolBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: top;
  justify-items: center;
  align-items: center;
  padding-top: 50px;
  width: 45px;
  height: 100%;
  margin-left: -10px;
  margin-top: 0px;
  background: #244448;
  border-top: solid 1px #244448;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);

  button {
    border: 0;
    background: none;
    width: 100%;
    padding: 3px 1px 3px 1px;
  }
  button:hover {
    background: #01293e;
    border-radius: 5px;
  }
`;

export const ToolBarGrid = styled.div`
  display: flex;
  justify-content: space-around;
  justify-items: center;
  align-items: center;
  height: 100%;
  width: 100%;
  margin-left: 1px;
  margin-top: 0px;
`;

export const Container = styled.div`
  width: calc(100% - 55px);
  height: 98%;
  border-radius: 4px;
  margin-left: 5px;

  background: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
`;

export const Content = styled.div`
  width: 100%;
  height: 98%;
  padding: 0px 10px 5px 10px;

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

export const ListaEmpresa = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 5px 7px 5px;
  border-left: solid 1px #ccc;

  ul {
    padding: 1px 0;
    margin: 1px;
  }

  li {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    padding: 3px;
    font-weight: 500;
    color: #253739;
    background: #e8eff1;
  }

  button {
    border: 0;
    background: none;
  }
`;
