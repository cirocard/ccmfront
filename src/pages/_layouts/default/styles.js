import styled from 'styled-components';

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  background: #244448;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #ebf3f4;
  width: 100%;

  border-radius: 0 0 5px 5px;
  margin: 0 auto;
  height: ${(props) => props.altura}px;
`;

export const ContentArea = styled.div`
  background: #fff;
  width: 98%;
  border-radius: 4px;
  margin: 0px auto;
  height: ${(props) => props.altura - 15}px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
`;
