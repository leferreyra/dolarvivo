import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import get from 'lodash.get';
import styled, { keyframes } from 'styled-components';
import Firebase from 'firebase/app';
import { Helmet } from 'react-helmet';
import { Tooltip } from 'antd';
import { ResponsiveContainer, ComposedChart, Area, Line, Tooltip as ChartTooltip, XAxis } from 'recharts';
import { MdInfoOutline as InfoIcon, MdBrightness6 as SunIcon } from 'react-icons/md';
import 'firebase/firestore';

Firebase.initializeApp({
  apiKey: "AIzaSyBdeMCMOfFkz92Rzb2InwOZkk3W3e3RBfw",
  authDomain: "dolar-vivo.firebaseapp.com",
  databaseURL: "https://dolar-vivo.firebaseio.com",
  projectId: "dolar-vivo",
  storageBucket: "dolar-vivo.appspot.com",
  messagingSenderId: "22418687401",
  appId: "1:22418687401:web:ee69887a48f4186a0730b8",
  measurementId: "G-HN229N9NMK"
});

var db = Firebase.firestore();

const PAGE_TITLE = "Dolar Vivo | El precio del dolar en tiempo real";

const DARK = 'DARK';
const LIGHT = 'LIGHT';

const THEMES = {
  [LIGHT]: {
    highlight: '#0099ff',
    foreground: 'black',
    background: 'white'
  },
  [DARK]: {
    highlight: '#0099ff',
    foreground: '#CCC',
    background: '#222'
  }
}

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);
  const [themeId, setThemeId] = useState(LIGHT);

  const theme = THEMES[themeId];

  const toggleTheme = () => {
    const t = themeId === LIGHT ? DARK : LIGHT;
    setThemeId(t);
    localStorage.setItem('theme', t);
  }

  const fetchHistory = () => {
    Axios.get('https://api.bluelytics.com.ar/data/graphs/evolution.json')
      .then(response => response.data)
      .then(data => {
        const dataByDate = data.reduce((map, item) => {
          const date = get(item, 'date');
          const source = get(item, 'source');
          const value = get(item, 'value');
          const itemData = map[date] || {};
          const key = source === 'Oficial' ? 'oficial' : 'blue';
          map[date] = { ...itemData, [key]: value, date }
          return map;
        }, {})
        setHistory(Object.values(dataByDate).slice(0, 100).reverse())
      });
  }

  useEffect(() => {

    const themeId = localStorage.getItem('theme');
    
    if (themeId) {
      setThemeId(themeId);
    }

    fetchHistory();
    db
      .collection('prices')
      .doc('default')
      .onSnapshot(doc => {
        setData(doc.data())
      })
  }, [])
  
  const officialBuy = get(data, 'officialBuy', 0).toFixed(1);
  const officialSell = get(data, 'officialSell', 0).toFixed(1);
  const blueBuy = get(data, 'blueBuy', 0).toFixed(1);
  const blueSell = get(data, 'blueSell', 0).toFixed(1);

  return (
    <Container theme={theme}>

      <Helmet>
        <title>
          [{blueBuy} / {blueSell} BLUE] {PAGE_TITLE}
        </title>
      </Helmet>

      <TopBar>
        <Status>
          <Indicator /> Actualizando en tiempo real
        </Status>
        <ThemeToggleIcon onClick={toggleTheme} />
      </TopBar>

      <Tickers>

        <Ticker>
          <Tooltip title="Fuente: Infobae / Ambito">
            <TickerTitle>
              Blue
              <StyledInfoIcon />
            </TickerTitle>
          </Tooltip>
          <Prices>
            <Price>
              <PriceValue>{blueBuy}</PriceValue>
              <PriceTitle>Compra</PriceTitle>
            </Price>
            <Price>
              <PriceValue>{blueSell}</PriceValue>
              <PriceTitle>Venta</PriceTitle>
            </Price>
          </Prices>
        </Ticker>

        <Ticker>
          <Tooltip title="Fuente: Banco Nacion">
            <TickerTitle>
              Oficial
              <StyledInfoIcon />
            </TickerTitle>
          </Tooltip>
          <Prices>
            <Price>
              <PriceValue>{officialBuy}</PriceValue>
              <PriceTitle>Compra</PriceTitle>
            </Price>
            <Price>
              <PriceValue>{officialSell}</PriceValue>
              <PriceTitle>Venta</PriceTitle>
            </Price>
          </Prices>
        </Ticker>

      </Tickers>

      <HistoricChart>
        { history ? <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={history} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.highlight} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.highlight} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <ChartTooltip />
            <Area type="natural" dataKey="blue" fillOpacity={1} stroke="#0099ff" strokeWidth={1} fill="url(#colorBlue)" />
            <Line type="natural" dataKey="oficial" dot={false} stroke="#00ab00" strokeDasharray="3 3" />
            <XAxis dataKey="date" domain={['dataMin', 'dataMax']} scale="point" hide />
          </ComposedChart>
        </ResponsiveContainer> : null}
      </HistoricChart>

    </Container>
  );
}

const breathe = keyframes`
  0% {
    opacity: 100%;
  }

  50% {
    opacity: 50%;
  }

  100% {
    opacity: 100%;
  }
`;


const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  background: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
`;

const Tickers = styled.div`
  display: flex;
  flex: 0 0 auto;
  width: 100%;
  padding: 20px 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const Ticker = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: stretch;
  border-left: 1px solid #ccc;

  &:first-child {
    border-left: 0;
  }

  @media (max-width: 700px) {
    border-left: 0;

    &:first-child {
      margin-bottom: 20px;
    }
  }
`;

const TickerTitle = styled.div`
  display: flex;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
`;

const StyledInfoIcon = styled(InfoIcon)`
  margin-left: 3px;
`;

const Prices = styled.div`
  display: flex;
  margin-top: 10px;
`;

const Price = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: center;
`;

const PriceTitle = styled.div`
  text-transform: uppercase;
  font-size: 14px;
`;

const PriceValue = styled.div`
  font-size: 50px;
  font-weight: 300;
  line-height: 1em;
`;

const HistoricChart = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
`;

const Indicator = styled.div`
  width: 10px;
  height: 10px;
  background: #00d600;
  border-radius: 10px;
  margin-right: 10px;
  animation: ${breathe} 1s infinite;
`;

const Status = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 12px 15px;
  box-sizing: border-box;
`;

const ThemeToggleIcon = styled(SunIcon)`
  width: 20px;
  height: 20px;
  margin: 0 15px;
  cursor: pointer;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.05);
`;

export default App;
