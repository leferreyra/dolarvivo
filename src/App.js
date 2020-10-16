import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import get from 'lodash.get';
import styled from 'styled-components';

function App() {
  const [price, setPrice] = useState('---');

  const fetchPrice = () => {
    Axios.get('/api/price')
      .then(response => response.data)
      .then(data => setPrice(get(data, 'items[1].unico', '---')))
  }

  useEffect(() => {
    setInterval(fetchPrice, 1000);
  }, [])

  return (
    <Container>
      <Price>${price}</Price>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Price = styled.h1`
  font-size: 300px;
`;

export default App;
