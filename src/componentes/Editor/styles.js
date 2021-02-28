import styled from 'styled-components';

export const EditorContainer = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .jodit_wysiwyg {
    color: #303531;
    padding: 10px;
    overflow-x: auto;
    min-height: 40px;
  }

  .jodit-container,
  .jodit-wysiwyg,
  .jodit-container .jodit-wysiwyg,
  .jodit-wysiwyg_iframe,
  .jodit-wysiwyg_iframe {
    height: 100% !important;
    width: 100%;
  }

  .jodit-container .jodit-workplace {
    color: #303531;
    height: 88% !important;
  }

  .jodit-status-bar {
    display: none;
  }
`;
