import { useEffect } from 'react';
import ReactDOM from 'react-dom';

// elemento ccmmodal esta no public/index.html
const modalContainer = document.getElementById('ccmmodal');
const el = document.createElement('div');

function PopupContainer({ children, isOpen }) {
  useEffect(() => {
    if (isOpen) {
      modalContainer.appendChild(el);
    } else {
      try {
        modalContainer.removeChild(el);
      } catch (err) {}
    }
  }, [isOpen]);

  return ReactDOM.createPortal(children, el);
}

export default PopupContainer;
