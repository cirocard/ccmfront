import styled, { keyframes, css } from 'styled-components';
import { slideInDown, slideOutUp } from 'react-animations';
import { device } from '~/styles/mediaQuery';

const slideInEffect = keyframes`${slideInDown}`;
const slideOutEffect = keyframes`${slideOutUp}`;

export const BaseModal = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  /* overflow: scroll; */
  animation: 0.5s ${(props) => (props.isOpen ? slideInEffect : slideOutEffect)};
  z-index: ${(props) => (props.isParent ? 700 : 500)};
`;

export const ModalContent = styled.div`
  background-color: #fafafa;
  border-radius: 6px;
  position: absolute;
  top: ${(props) => (props.print ? '6vh' : '12vh')};
  height: ${(props) => (props.print ? '88vh' : 'auto')};

  ${(props) =>
    props.isParent &&
    css`
      z-index: 600;
    `}

  @media ${device.mobileS} {
    width: 80%;
  }

  @media ${device.tablet} {
    width: 80%;
  }

  @media ${device.laptop} {
    width: ${(props) => props.contentSize};
  }

  @media ${device.laptopL} {
    width: ${(props) => props.contentSize};
  }
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 16px;
  font-size: 16px;
  background-color: transparent;
  color: #244448;
  border: none;

  &:hover {
    background-color: #244448;
    color: #fff;
    cursor: pointer;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  width: ${(props) => props.wd};
  height: 30px;
  background-color: #244448;
  border-bottom: solid 1px #ccc;
  cursor: move;

  h1 {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
  }

  button {
    border: 0;
    background: none;
  }
`;

export const CModal = styled.div`
  width: ${(props) => props.wd};
  min-height: ${(props) => props.hg};
  height: ${(props) => (props.print ? '88vh' : 'auto')};
  margin: 0 auto;
  /* padding: 10px 20px; */
  background: #fafafa;
  border-radius: 6px;
`;
