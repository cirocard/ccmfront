import styled from 'styled-components';

export const SelectContainer = styled.div`
  /* padding: 6px; */
  display: flex;
  flex-direction: column;
`;

export const FormLabel = styled.label`
  color: #9e9e9e;
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 600;
`;

export const FormInput = styled.input`
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #9e9e9e;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.2;
  color: #495057;
  background-color: #fff;
  /* width: 16rem; */
  width: ${(props) => props.inputWidth || 16}vw;

  &:focus {
    background-color: #fff;
    border: solid 1px #ccc;
    outline: 0;
  }
`;
