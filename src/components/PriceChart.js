import React, { useState, useEffect, useContext } from 'react';
import Axios from 'axios';
import get from 'lodash.get';
import styled, { ThemeContext } from 'styled-components';
import { ResponsiveContainer, ComposedChart, Area, Line, Tooltip as ChartTooltip, XAxis } from 'recharts';

function PriceChart() {
  const [history, setHistory] = useState(null);
  const theme = useContext(ThemeContext);

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
    fetchHistory();
  }, []);

  return (
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
  );
}

const HistoricChart = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
`;

export default PriceChart;
