import { createGlobalStyle } from 'styled-components';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { lighten, darken } from 'polished';

export default createGlobalStyle`

  @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
 
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  *:focus {
    outline: 0;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    -webkit-font-smoothing: antialiased;
  }

  body, input, button {
    font: 14px 'Roboto', sans-serif;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
  }

  #clear_input {
    position: relative;
    float: right;
    height: 19px;
    width: 19px;
    font-weight:bold;
    font-size:14px;
    margin-top: -25px;
    right: 5px;
    border-radius: 20px;
    background: #E8E9EE;
    color: white;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
  }
  #clear_input:hover {
    background: #ccc;
  }

  .input_cad{
    background: #EEF3F5;
      border: solid 1px #ccc;
      border-radius: 4px;
      height: 30px;
      padding: 5px 10px 5px 10px;
      color: #243043;
      font-size: 14px;
      font-weight: 700;
     
      width:100%;
      transition: background 0.3s;

      &::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }

      &:focus {
        background: ${darken(0.1, '#EEF3F5')};
      }
  }
  .btnGeral {
      margin: 5px 0 0;
      height: 40px;
      background: #3b535f;;
      text-align:center;
      font-weight: bold;
      color: #fff;
      border: 0;
      border-radius: 4px;
      font-size: 16px;
      transition: background 0.2s;

      &:hover {
        background: ${lighten(0.2, '#3b535f')};
      }
    }

    .btnGeralCenter {
      display: flex;
      justify-content: center;
      justify-items: center;
      align-items: center;
      height: 40px;
      background: #3b535f;;
      text-align:center;
      font-weight: bold;
      color: #fff;
      border: 0;
      border-radius: 4px;
      font-size: 16px;
      transition: background 0.2s;

      &:hover {
        background: ${lighten(0.2, '#3b535f')};
      }

      label{
        color: #EEEFF8;
        font-size: 16px;
        padding-right: 15px;
      }
    }

    .btnGeralForm {
      margin: 5px 0 0;
      height: 32px;
      background: #3b535f;;
      text-align:center;
      font-weight: bold;
      color: #fff;
      border: 0;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;

      &:hover {
        background: ${lighten(0.2, '#3b535f')};
      }
    }

  .btn1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0 0;
  margin-top: 1px;
  padding: 0 10px 0 10px;
 
  height: 32px;
  background: #3b535f;
  font-weight: bold;
  color: #fff;
  border: 0;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${lighten(0.2, '#3b535f')};
  }
  }

  .btn2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  margin-top: 1px;
  padding: 0 10px 0 10px;
  height: 32px;
  background: #149918;
  font-weight: bold;
  color: #fff;
  border: 0;
  width: 100%;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${lighten(0.2, '#149918')};
  }
  }

  /*==== padrao para tab bar =========*/
  .MuiPaper-elevation4, .MuiTabs-root {
    box-shadow: none !important;
    background: #fafafa;
    border-bottom: solid 1px #176C02;
  }

  .MuiTabs-indicator {
    background-color: #176C02;
  }

  .MuiTab-textColorPrry {
    color: #176C02;
  }

  .MuiTab-textColorPrimary.Mui-selected {
    color: #154908;
  }

/*==== box geral tab bar =========*/
  .MuiBox-root, .MuiBox-root-14, .MuiBox-root-14{
    padding: 15px !important;
  }

/*==== altura dos seletores de aba tab bar =========*/
.MuiButtonBase-root{
  padding: 3px 10px 3px 10px !important;
}
.MuiTooltip-pooper{
  padding: 0px !important;
}
.MuiTabs-root{
  height: 62px;
  padding: 0px;
  margin-top: 1px !important;
}
  .MuiTabs-flexContainer{
    height: 60px;
  }

  .MuiTab-wrapper{
    height: 53px;
    margin-top: -12px !important;
  }


  /* ========= Customizações AG-Grid ============ */
div.ag-root .ag-cell-focus { /* permitir seleçao na gride */
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

.grid-red-row {
  background-color: #e42a3c !important;
}

.ag-theme-balham .grid-red-row.ag-row-selected {
  background-color: #e42a3c !important;
}

.ag-theme-balham {
  font-family: 'Roboto',sans-serif !important;
}

.ag-theme-balham .ag-row-selected {
  background-color: #FA6505 !important;
}

.ag-theme-balham  .ag-row-selected .ag-cell {
  color: #fff;
}

.ag-theme-balham  .ag-row-selected .ag-cell .ag-cell-editor {
  color: #000;
}

.ag-theme-balham .ag-select .ag-picker-field-wrapper {
  color: #000;
}

.ag-header-cell-text {  /* fonte e cor do header da gride */
  font-weight: bold;
  font-size: 12px;
  color: #ECF9EF;

}

.ag-header-cell-label, .ag-cell-label-container, .ag-header-cell-sorted-none, 
.ag-header-cell{ /* cor do header */
  background-color: #3E5171;
  color: #ECF9EF; 
}

.ag-icon, .ag-icon-menu{  /* indicadores na barra de titulo */
  color: #ECF9EF; 
}

.ag-input-id-54, .ag-input-field-input, .ag-text-field-input{
  color: #2D3137 !important;
  font-size: 12px !important;
  font-weight: bold !important;
  padding: 3px 2px 3px 3px !important;
  
}

`;
