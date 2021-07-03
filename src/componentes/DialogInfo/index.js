import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Slide } from '@material-ui/core';
import { MdClose } from 'react-icons/md';

import { BootstrapTooltip } from '~/componentes/ToolTip';

import { TitleBar, CModal, Message } from './styles';

/**
 * Este componente de dialog é destinado apenas para exibir mensagens informativas
 * @param {isOpen} isOpen Flag que indica quando o dialog será exibido
 * @param {closeDialogFn} closeDialogFn Função responsável por fechar o dialog
 * @param {title} title Título do dialog
 * @param {message} message Mensagem que deve ser exibida no corpo do dialog
 * @param {children} children elemento opcional
 */
export default function DialogInfo({
  isOpen,
  closeDialogFn,
  title,
  message,
  children,
}) {
  return (
    <Slide direction="down" in={isOpen}>
      <Dialog
        open={isOpen}
        keepMounted
        fullWidth
        maxWidth="sm"
        onClose={closeDialogFn}
      >
        <TitleBar wd="100%">
          <h1>{title}</h1>
          <BootstrapTooltip title="Fechar Modal" placement="top">
            <button type="button" onClick={closeDialogFn}>
              <MdClose size={30} color="#61098a" />
            </button>
          </BootstrapTooltip>
        </TitleBar>

        <CModal wd="100%">
          <DialogContent>
            <Message>{message}</Message>
          </DialogContent>
          <DialogContent>{children}</DialogContent>
        </CModal>
      </Dialog>
    </Slide>
  );
}

DialogInfo.propTypes = {
  closeDialogFn: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  children: PropTypes.element,
};

DialogInfo.defaultProps = {
  children: '',
};
