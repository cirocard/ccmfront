import styled from 'styled-components';

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  width: ${(props) => props.wd};
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: solid 1px #ccc;

  h1 {
    font-size: 15px;
    font-weight: 700;
    color: #244448;
  }

  button {
    border: 0;
    background: none;
  }
`;

export const Message = styled.div`
  padding: 10px 10px 20px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #e76906;
`;

export const CModal = styled.div`
  width: ${(props) => props.wd};
  height: ${(props) => props.hg};
  margin: 0 auto;
  padding: 10px;
  background: #fafafa;
`;
