import styled from 'styled-components';

export const BoxMenu = styled.div`
  width: 100%;
  z-index: 99;
`;

export const AreaComp = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.wd};
  font-size: 14px;
  font-weight: 700;
  color: #fafafa;
  padding: 0 7px 5px 5px;
  &:hover {
    label {
      font-size: 11px;
      transition: font-size 0.4s;
    }
  }

  span {
    padding: 3px 0px 4px 0px;
  }

  div {
    font-size: 13px;
    font-weight: 700;
    color: #544a57;
    label {
      color: #fafafa;
    }
  }

  /* cor do componente */
  .css-yk16xz-control {
    background: #244448;
    border: solid 1px #244448;
    &:focus {
      background: #244448;
    }
  }

  .css-yk16xz-control,
  .css-2b097c-container,
  .css-yk16xz-control,
  .css-1hwfws3 {
    background: #244448;
  }

  /* cor do placeholder */
  .css-1wa3eu0-placeholder {
    color: #fafafa;
  }

  /* cor da fonte no componente sem foco */
  .css-1uccc91-singleValue {
    color: #fafafa;
  }
`;
