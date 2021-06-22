import React, { useState, useEffect } from 'react';
import get from 'lodash.get';
import styled, { ThemeProvider } from 'styled-components';
import Firebase from 'firebase-initialized';
import PriceChart from 'components/PriceChart';
import NotificationButton from 'components/NotificationsButton';
import Status from 'components/Status';
import { getTheme, LIGHT, DARK } from 'themes';
import { Helmet } from 'react-helmet';
import { Tooltip } from 'antd';
import {
  MdInfoOutline as InfoIcon,
  MdBrightness6 as SunIcon,
} from 'react-icons/md';

const db = Firebase.firestore();

const PAGE_TITLE = "Dolar Vivo | El precio del dolar en tiempo real";

function App() {
  const [data, setData] = useState(null);
  const [themeId, setThemeId] = useState(LIGHT);

  const theme = getTheme(themeId);

  const toggleTheme = () => {
    const t = themeId === LIGHT ? DARK : LIGHT;
    setThemeId(t);
    localStorage.setItem('theme', t);
    window.gtag('event', 'toggle-theme', { themeId: t });
  }

  useEffect(() => {
    const themeId = localStorage.getItem('theme');

    if (themeId) {
      setThemeId(themeId);
    }

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
    <ThemeProvider theme={theme}>
      <Container>

        <Helmet>
          <title>
            [{blueBuy} / {blueSell} BLUE] {PAGE_TITLE}
          </title>
        </Helmet>

        <Message>
          Este sitio no sera actualizado mas. No lo uses ;)
        </Message>

        <TopBar>
          <Status />
          <NotificationButton />
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

        <PriceChart />

      </Container>
    </ThemeProvider>
  );
}


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

const ThemeToggleIcon = styled(SunIcon)`
  width: 20px;
  height: 20px;
  margin-right: 20px;
  cursor: pointer;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.05);
  min-height: 40px;
`;

const Message = styled.div`
  padding: 20px;
  text-align: center;
  width: 100%;
  background-color: red;
  color: white;
`;

export default App;
