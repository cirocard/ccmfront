import styled from 'styled-components';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .jodit_wysiwyg {
    color: #303531;

    padding: 10px;
    overflow: auto;
    min-height: 100% !important;
  }

  .jodit-container,
  .jodit-wysiwyg_iframe {
    width: 100%;
    height: 100% !important;
    background: #f7fad1;
    position: relative;
  }

  .jodit_theme_default,
  .jodit-wysiwyg_mode {
    width: 100%;
    height: 100% !important;
  }

  .jodit-workplace {
    color: #303531;
    position: relative;
    height: 85% !important;
  }

  .jodit-status-bar {
    display: none;
  }
`;
