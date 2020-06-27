import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';

// import { Container } from './styles';

export default function Crm1() {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const configEditor = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/
    toolbar: true,
    language: 'pt_br',
    // theme: 'dark',
    toolbarButtonSize: 'small',
    buttons:
      'bold,strikethrough,underline,eraser,brush,ul,ol,outdent,indent,font,fontsize,,image,video,table,link,align,undo,redo,selectall,hr,fullsize',
    height: 300,
    width: 800,
    uploader: {
      insertImageAsBase64URI: true,
    },
  };

  useEffect(() => {
    window.loadMenu();
  }, []);

  return (
    <div>
      <h1>Dashboard CRM</h1>
      <JoditEditor
        ref={editor}
        value={content}
        config={configEditor}
        tabIndex={1} // tabIndex of textarea
        onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
        onChange={(newContent) => {}}
      />
    </div>
  );
}
