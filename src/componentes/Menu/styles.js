import styled from 'styled-components';

export const Container = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700');
  a,
  a:hover,
  a:focus {
    color: inherit;
    text-decoration: none;
    transition: all 0.3s;
  }

  button {
    border: 0;
    background: none;

    img {
      margin-top: 1px;
      margin-right: 5px;
      padding-right: 10px;
      height: 68px;
      width: 120px;
    }
    img,
    button:active {
      border: none;
    }
  }

  button:hover {
    background: #182e31;
    -webkit-transition: all 0.5s;
    -o-transition: all 0.5s;
    transition: all 0.5s;
  }

  .pda {
    padding-right: 5px;
    width: 25px;
  }

  .pda1 {
    padding-right: 5px;
    margin-left: 15px;
    width: 25px;
  }

  .sub1 {
    margin-left: 10px;
  }

  .itens_menu {
    padding-left: 15px;
  }

  .itens_menu a label:hover {
    color: #244448;
  }

  .itens_menu_label {
    padding-left: 10px;
    height: 7px;
    color: #c1d5d7;
  }

  .navbar {
    padding: 15px 10px;
    background: #fff;
    border: none;
    border-radius: 0;
    margin-bottom: 40px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  }

  .navbar-btn {
    box-shadow: none;
    outline: none !important;
    border: none;
  }

  .line {
    width: 100%;
    height: 1px;
    border-bottom: 1px solid #01293e;
    margin: 40px 0;
  }

  /* ---------------------------------------------------
    SIDEBAR STYLE
----------------------------------------------------- */

  #sidebar {
    width: 300px;
    position: fixed;
    top: 0;
    left: -300px;
    height: 100vh;
    z-index: 999;
    background: #244448;

    color: #fff;
    transition: all 0.3s;
    overflow-y: scroll;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
  }

  #sidebar.active {
    left: 0;
  }

  #dismiss {
    width: 35px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    background: #395256;
    position: absolute;
    top: 20px;
    right: 10px;
    cursor: pointer;
    -webkit-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
  }

  #dismiss:hover {
    background: #244448;
    color: #fafafa;
  }

  .overlay {
    display: none;
    position: fixed;
    margin-top: 2px;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 998;
    opacity: 0;
    transition: all 0.9s ease-in-out;
  }
  .overlay.active {
    display: block;
    opacity: 1;
  }

  #sidebar .sidebar-header {
    width: 300px;
    padding: 10px 15px 10px 15px;
    background: #395256;

    h3 {
      padding-top: 8px;
    }
  }

  #sidebar ul.components {
    padding: 20px 0;
    border-bottom: 1px solid #244448;
  }

  #sidebar ul p {
    color: #fff;
    padding: 10px;
  }

  #sidebar ul li a {
    padding: 10px;
    font-size: 1.1em;
    color: #fff;
    display: block;
  }

  #sidebar ul li a:hover {
    color: #244448;
    background: #fff;
  }

  #sidebar ul li.active > a,
  a[aria-expanded='true'] {
    color: #fff;
    background: #244448;
  }

  a[data-toggle='collapse'] {
    position: relative;
  }

  .dropdown-toggle::after {
    display: block;
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  ul ul a {
    font-size: 0.9em !important;
    padding-left: 30px !important;
    background: #244448;
  }
`;
