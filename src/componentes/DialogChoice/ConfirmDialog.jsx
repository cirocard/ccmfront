import React, { Component } from 'react';
import { render } from 'react-dom';

/* ======== Styles ========== */
import { FaCheck, FaBan } from 'react-icons/fa';
import { Container, AreaConsult, AreaComp } from '~/pages/general.styles';
import {
  BaseModal,
  ModalContent,
  TitleBar,
  CModal,
  ModalBody,
  ModalFooter,
} from './styles';
/* ======== Styles ========== */

let resolve;
class Confirmation extends Component {
  static create() {
    const containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    return render(<Confirmation />, containerElement);
  }

  constructor() {
    super();

    this.state = {
      isOpen: false,
      confirmMessage: '',
    };

    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.show = this.show.bind(this);
  }

  handleCancel() {
    this.setState({ isOpen: false });
    resolve(false);
  }

  handleConfirm() {
    this.setState({ isOpen: false });
    resolve(true);
  }

  show(message = '') {
    this.setState({ isOpen: true });
    this.setState({ confirmMessage: message });
    return new Promise((res) => {
      resolve = res;
    });
  }

  render() {
    const { isOpen, confirmMessage } = this.state;
    return (
      <BaseModal isOpen={isOpen}>
        <ModalContent>
          <TitleBar wd="100%">
            <h1>Confirmação</h1>
          </TitleBar>
          <CModal wd="100%" hg="170px">
            <Container>
              <AreaConsult ptop="18px">
                <ModalBody>
                  <h2>{confirmMessage}</h2>
                </ModalBody>
                <ModalFooter>
                  <AreaComp wd="49">
                    <button
                      type="button"
                      className="btn1"
                      onClick={this.handleConfirm}
                    >
                      Confirmar
                      <FaCheck size={25} color="#fff" />
                    </button>
                  </AreaComp>
                  <AreaComp wd="49">
                    <button
                      type="button"
                      className="btn1"
                      onClick={this.handleCancel}
                    >
                      Cancelar
                      <FaBan size={25} color="#fff" />
                    </button>
                  </AreaComp>
                </ModalFooter>
              </AreaConsult>
            </Container>
          </CModal>
        </ModalContent>
      </BaseModal>
    );
  }
}

export default Confirmation;
