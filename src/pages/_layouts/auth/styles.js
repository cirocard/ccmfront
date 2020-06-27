import styled from 'styled-components';
import { darken, lighten } from 'polished';

export const Wrapper = styled.div`
  height: 100%;
  background: #244448;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BoxLogo = styled.div`
  width: 100%;
  margin-top: -100px;
  background: #182e31;
  border-radius: 5px;
  padding: 40px 40px 80px 40px;

  box-shadow: 0px 0px 16px 1px rgba(0, 0, 0, 0.24);
`;

export const Content = styled.div`
  width: 100%;
  max-width: 450px;
  text-align: center;

  img {
    max-width: 250px;
  }

  form {
    display: flex;
    flex-direction: column;
    margin-top: 30px;

    input {
      background: #e5eff0;
      border: 0;
      border-radius: 4px;
      height: 44px;
      padding: 0 15px;
      color: #101b1d;
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 10px;
      transition: background 0.3s;
      width: 100%;
      &::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }

      &:focus {
        background: ${darken(0.1, '#E5EFF0')};
      }
    }

    span {
      color: #fb6f91;
      align-self: flex-start;
      margin: 0 0 10px;
      font-weight: bold;
    }

    button {
      margin: 5px 0 0;
      height: 44px;
      background: #182e31;
      font-weight: bold;
      color: #fff;
      border: 0;
      border-radius: 4px;
      font-size: 16px;
      transition: background 0.2s;

      &:hover {
        background: ${lighten(0.2, '#182e31')};
      }
    }

    a {
      color: #fff;
      margin-top: 15px;
      font-size: 16px;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }
  }
`;
