import React, { useState } from 'react';
import PropTypes from 'prop-types';
import JoditEditor from 'jodit-react';
import { EditorContainer } from './styles';

export default function TextEditor({
  readOnly,
  showToolbar,
  onChangeFn,
  value,
}) {
  const [config] = useState({
    readonly: readOnly,
    toolbar: showToolbar,
    language: 'pt_br',
    toolbarButtonSize: 'middle',
    toolbarAdaptive: false,
    enableDragAndDropFileToEditor: true,
    buttons: [
      'bold',
      'italic',
      'underline',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      'left',
      'center',
      'right',
      'justify',
      'hr',
      'fullsize',
    ],

    allowResizeY: false,
    uploader: {
      insertImageAsBase64URI: true,
    },
    removeButtons: [
      'brush',
      'file',
      'link',
      'brush',
      'image',
      'table',
      'link',
      'eraser',
      'fullsize',
      'ol',
      'selectall',
    ],
    showXPathInStatusbar: false,
    showCharsCounter: true,
    showWordsCounter: true,
    toolbarSticky: true,
    style: {
      background: '#F7FAD1',
      position: 'absolute',
      height: '100% !important',
      color: '#252A26',
      fontSize: '15px',
      lineHeight: '1.6',
    },
  });

  return (
    <EditorContainer>
      <JoditEditor config={config} onChange={onChangeFn} value={value || ''} />
    </EditorContainer>
  );
}

TextEditor.propTypes = {
  readOnly: PropTypes.bool,
  showToolbar: PropTypes.bool,
  onChangeFn: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

TextEditor.defaultProps = {
  readOnly: false,
  showToolbar: true,
};
