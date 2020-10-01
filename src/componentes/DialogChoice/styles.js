import styled, { keyframes } from 'styled-components';
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
  animation: 0.6s ${(props) => (props.isOpen ? slideInEffect : slideOutEffect)};
  z-index: 500;
`;

export const ModalContent = styled.div`
  background-color: #fafafa;
  border-radius: 6px;
  position: absolute;
  top: 12vh;

  @media ${device.mobileS} {
    width: 90%;
  }

  @media ${device.tablet} {
    width: 50%;
  }

  @media ${device.laptop} {
    width: 30%;
  }

  @media ${device.laptopL} {
    width: 25%;
  }
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 16px;
  font-size: 16px;
  background-color: transparent;
  color: #4e2a77;
  border: none;

  &:hover {
    background-color: #4e2a77;
    color: #fff;
    cursor: pointer;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-items: center;
  align-content: center;
  padding-left: 10px;
  width: ${(props) => props.wd};
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: solid 1px #ccc;

  h1 {
    padding-top: 5px;
    font-size: 16px;
    font-weight: bold;
    color: #244448;
  }

  button {
    border: 0;
    background: none;
  }
`;

export const CModal = styled.div`
  width: ${(props) => props.wd};
  min-height: ${(props) => props.hg};
  margin: 0 auto;
  /* padding: 10px 20px; */
  background: #fafafa;
  border-radius: 6px;
`;

export const ModalBody = styled.div`
  display: flex;
  width: 100%;
  padding: 23px 16px 0 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h2 {
    color: #af1901;
    padding-bottom: 16px;

    @media ${device.mobileS} {
      font-size: 12px;
    }

    @media ${device.tablet} {
      font-size: 12px;
    }

    @media ${device.laptop} {
      font-size: 14px;
    }

    @media ${device.laptopL} {
      font-size: 18px;
    }
  }

  img {
    width: 90%;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  width: 100%;
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
`;
