# Projeto STAER - Visualização e Análise de Dados de Radares Secundários

Este repositório contém o projeto desenvolvido na Unidade Curricular de STAER, que visa a criação de uma aplicação em Python para recolha, tratamento e visualização de dados recolhidos por radares secundários em modo S.

---

## 📋 Enquadramento

Os radares secundários em modo S permitem recolher informação sobre as aeronaves em voo num dado momento. O tratamento e análise desta informação fornecem uma visão detalhada sobre o estado do espaço aéreo, sendo útil para diversas aplicações como segurança e monitoramento de tráfego aéreo.

---

## 🎯 Objetivos

O objetivo deste projeto é desenvolver um programa que:

1. Recolha dados de aeronaves a partir de radares secundários SSR.
2. Realize o tratamento e armazenamento desses dados.
3. Visualize a informação recolhida de forma interativa e em tempo real.

---

## 🛠️ Desenvolvimento do Trabalho

### **Fase 1: Recolha e Manutenção da Informação Modo S**

- **Fonte de Dados:** O software `dump1090` é utilizado para recolher os dados, que estão disponíveis em formato JSON no endpoint `dump1090/aircraft.json`.
- **Manutenção dos Dados:** Os dados recolhidos serão armazenados numa base de dados local. 
  - Opcionalmente, poderá ser criada uma API para servir como proxy da informação.

### **Fase 2: Visualização dos Dados**

- **Mapa Interativo:** A informação será exibida num mapa utilizando OpenStreetMap.
- **Filtros de Dados:** A visualização permitirá aplicar filtros como:
  - Aeronaves num espaço aéreo específico.
  - Aeronaves com destino a determinado aeroporto.
  - ...

- **Plataforma:** Os dados serão apresentados num servidor web.

### **Fase 3: Criação de uma Web App**

- A aplicação será convertida numa web app, permitindo o acesso fácil e centralizado à funcionalidade desenvolvida.

---

## 🚀 Tecnologias Utilizadas

- **Linguagem:** Python, JavaScript
- **Ferramentas de Visualização:** OpenStreetMap
- **Base de Dados:** SQLAlchemy
- **Servidor Web:** Flask, Vite
- **API (Opcional):** Ferramenta própria para proxy de dados

---

## 🌐 Como Executar o Projeto

### Pré-requisitos

- Python 
- `pip` para instalação de dependências

Num terminal no diretório backend executar o comando: **source .venv/bin/activate**
Com isto usamos o virtual environment para dar run ao projeto.
Depois usar o comando **python3 main.py** para começar a usar a base de dados e fazer pedidos GET á antena disponibilizada. 
Com isto iremos ter os dados necessários para a representação dos aviões e como tal podemos colocar tudo isto na base de dados.

Depois disto num segundo terminal no **frontend** iremos colocar o comando **npm run dev** que irá abrir uma web page mostrando
o projeto com os dados a serem atualizados de X em X segundos.

### Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/username/projeto-staer.git
   cd projeto-staer
