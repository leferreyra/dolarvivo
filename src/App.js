import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import get from 'lodash.get';
import styled, { keyframes } from 'styled-components';

function App() {
  const [price, setPrice] = useState('---');

  const fetchPrice = () => {
    Axios.get('/api/price')
      .then(response => response.data)
      .then(data => setPrice(get(data, 'items[1].unico', '---')))
  }

  useEffect(() => {
    fetchPrice();
    setInterval(fetchPrice, 5000);
  }, [])

  return (
    <Container>
      <Live>
        <Indicator />
        <span>En tiempo real</span>
      </Live>
      <Price>${price}</Price>
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
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 50px;
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
  display: flex;
  align-items: center;
  font-size: 20px;
`;

const Price = styled.h1`
  font-size: 300px;
  margin: 0;
  line-height: 1em;
`;

export default App;
