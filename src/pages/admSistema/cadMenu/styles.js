import styled from 'styled-components';
import PerfectScrollbar from 'react-perfect-scrollbar';

export const Scroll = styled(PerfectScrollbar)`
  width: 100%;
  padding-bottom: 15px;
  padding-right: 15px;
`;

export const Container = styled.div`
  width: 99%;
  height: 98%;
  border-radius: 4px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
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
