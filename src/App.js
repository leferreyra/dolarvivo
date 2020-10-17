import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import get from 'lodash.get';
import styled, { keyframes } from 'styled-components';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);

  const fetchPrice = () => {
    Axios.get('https://api.bluelytics.com.ar/v2/latest')
      .then(response => response.data)
      .then(data => setData(data))
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
    fetchPrice();
    fetchHistory();
    setInterval(fetchPrice, 5000);
  }, [])

  return (
    <Container>

      <Live>
        <Indicator /> Actualizando en tiempo real
      </Live>

      <Tickers>

        <Ticker>
          <TickerTitle>Oficial</TickerTitle>
          <Prices>
            <Price>
              <PriceValue>{get(data, 'oficial.value_buy')}</PriceValue>
              <PriceTitle>Compra</PriceTitle>
            </Price>
            <Price>
              <PriceValue>{get(data, 'oficial.value_sell')}</PriceValue>
              <PriceTitle>Venta</PriceTitle>
            </Price>
          </Prices>
        </Ticker>

        <Ticker>
          <TickerTitle>Blue</TickerTitle>
          <Prices>
            <Price>
              <PriceValue>{get(data, 'blue.value_buy')}</PriceValue>
              <PriceTitle>Compra</PriceTitle>
            </Price>
            <Price>
              <PriceValue>{get(data, 'blue.value_sell')}</PriceValue>
              <PriceTitle>Venta</PriceTitle>
            </Price>
          </Prices>
        </Ticker>

      </Tickers>

      <HistoricChart>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <Tooltip />
            <Area type="monotone" dataKey="blue" fillOpacity={0.5} />
            <Area type="monotone" dataKey="oficial" fillOpacity={0.5} />
            <XAxis dataKey="date" hide />
          </AreaChart>
        </ResponsiveContainer>
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

const Live = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 10px;
  box-sizing: border-box;
  background: #f5f5f5;
`;

export default App;
