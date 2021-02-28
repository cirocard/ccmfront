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
      'selectall',
      'fullsize',
      'ol',
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
    ],
    showXPathInStatusbar: false,
    showCharsCounter: true,
    showWordsCounter: true,
    toolbarSticky: true,
    style: {
      background: '#F2F3F9',
      color: '#252A26',
      fontSize: '15px',
      lineHeight: '80%',
    },
  });

  return (
    <EditorContainer>
      <JoditEditor config={config} onChange={onChangeFn} value={value} />
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
