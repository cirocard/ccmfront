import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';
import Draggable from 'react-draggable';
import PopupContainer from './container';

/* ======== Styles ========== */
import { BaseModal, ModalContent, TitleBar, CModal } from './styles';
/* ======== Styles ========== */

/**
 * Este componente de dialog é destinado para exibir templates html.
 * @param {isOpen} isOpen Flag que indica quando o dialog será exibido
 * @param {closeDialogFn} closeDialogFn Função responsável por fechar o dialog
 * @param {title} title Título do dialog
 * @param {size} size Tamanho do dialog (sm, md, lg)
 * @param {isParent} isParent Use esta propriedade para sobrepor outro modal
 * @param {printMode} printMode Esta propriedade faz o modal preencher quase todo o espaço verticalmente
 * @param {children} children Template JSX que deve ficar entre as tags do dialog
 */
const Popup = ({
  isOpen,
  closeDialogFn,
  title,
  size,
  isParent,
  printMode,
  children,
}) => {
  const [haveEventListener, setEventListener] = useState(false);
  const draggableRef = useRef(null);

  const resetAndClose = () => {
    if (draggableRef.current) {
      draggableRef.current.state.x = 8;
      draggableRef.current.state.y = 10;

      closeDialogFn();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      setEventListener(true);
      if (e.key === 'Escape') {
        resetAndClose();
      }
    });

    return () => {
      if (haveEventListener) {
        document.removeEventListener('keydown');
      }
    };
  }, []);

  const getDialogSize = () => {
    let dialogSize = size;

    switch (size) {
      case 'sm':
        dialogSize = '40%';
        break;
      case 'md':
        dialogSize = '65%';
        break;
      case 'lg':
        dialogSize = '80%';
        break;
      case 'xl':
        dialogSize = '95%';
        break;

      default:
        break;
    }
    return dialogSize;
  };

  return (
    <PopupContainer isOpen={isOpen}>
      <BaseModal isOpen={isOpen} isParent={isParent}>
        {/* a propriedade bounds="parent" impede o dialog de ultrapassar as bordas da tela */}
        <Draggable
          handle="#draggable-dialog"
          defaultPosition={{ x: 8, y: 10 }}
          position={null}
          ref={draggableRef}
        >
          <ModalContent
            contentSize={getDialogSize}
            print={printMode}
            isParent={isParent}
          >
            <TitleBar wd="100%" id="draggable-dialog">
              <h1>{title}</h1>
              <button type="button" onClick={resetAndClose}>
                <MdClose size={30} color="#fff" />
              </button>
            </TitleBar>

            <CModal wd="100%" hg="170px" print={printMode}>
              {children}
            </CModal>
          </ModalContent>
        </Draggable>
      </BaseModal>
    </PopupContainer>
  );
};

export default Popup;

Popup.propTypes = {
  closeDialogFn: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.string,
  isParent: PropTypes.bool,
  printMode: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

Popup.defaultProps = {
  isParent: false,
  size: 'sm',
  printMode: false,
};
