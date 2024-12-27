import styled from "styled-components";

export const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: ${(props) => props.width}px;
  height: 100vh;
  background-color: rgba(49, 49, 49, 255);
  box-shadow: -2px 0 5px rgba(42, 83, 99, 0.9);
  overflow-y: auto;
  z-index: 1000;
  padding: 20px;
  transition: width 0.0s ease;
`;

export const ResizeImage = styled.div`
  position: absolute;
  top: 20px;
  left: 10px; /* Ajustando a posição da imagem */
  width: 40px; /* Tamanho da imagem ajustado */
  height: 40px; /* Tamanho da imagem ajustado */
  background-color: transparent; /* Fundo transparente */
  cursor: pointer;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Remover o padding */

  /* Efeitos de hover e active */
  &:hover {
    opacity: 0.8; /* Efeito de hover */
  }

  &:active {
    opacity: 0.6; /* Efeito quando pressionado */
  }

  /* Estilos da imagem */
  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Ajustando a imagem para caber no contêiner */
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #aaaa;
    padding: 4px;
    text-align: left;
  }

  th {
    background-color: #00596b;
    font-weight: bold;
  }
`;