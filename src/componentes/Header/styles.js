import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  background: #244448;
  padding: 0 10px 0px 1px;
`;

export const Dvspace = styled.div`
  padding: 2px;
`;
export const Content = styled.div`
  height: 70px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  aside {
    display: flex;
    align-items: center;
  }
`;

export const Grupo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  width: ${(props) => props.wd};
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;
  height: 64px;
  margin-left: ${(props) => props.mleft};
  width: ${(props) => props.wd};
  img {
    margin-right: 10px;
    padding-right: 10px;
    height: 120px;
    width: 150px;
  }

  a {
    font-size: 16px;
    font-weight: bold;
    color: #61098a;
  }
  span {
    padding-top: 5px;
    padding-left: 15px;
    display: block;

    font-size: 14px;
    color: #7ba1a5;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: baseline;
  button {
    border: 0;
    background: none;
  }

  .notif {
    display: block;
    position: relative;
    top: -20px;
    left: 33px;
    line-height: 16px;
    height: 20px;
    padding: 1px 6px;
    font-family: Arial, sans-serif;
    background: #dc2a03;
    color: white;
    text-shadow: 0 1px rgba(0, 0, 0, 0.25);
    border: 1px solid #000;
    border-radius: 10px;
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.3),
      0 1px 1px rgba(0, 0, 0, 0.09);
  }
`;

export const Profile = styled.div`
  display: flex;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #eee;

  div {
    text-align: right;
    margin-right: 10px;
    width: 200px;
    strong {
      display: block;
      color: #fff;
      font-size: 13px;
    }

    a {
      display: block;
      margin-top: 2px;
      font-size: 12px;
      color: #fafafa;
    }
  }

  button {
    border: 0;
    background: none;
  }

  img {
    width: 55px;
    height: 55px;
    border-radius: 50%;
  }

  span {
    padding-top: 5px;
    padding-left: 15px;
    display: block;

    font-size: 14px;
    color: #7ba1a5;
  }
`;
