import React from 'react';
import styled, { keyframes } from 'styled-components';

function Status() {
  return (
    <Container>
      <Indicator /> En vivo
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

const Indicator = styled.div`
  width: 10px;
  height: 10px;
  background: #00d600;
  border-radius: 10px;
  margin-right: 10px;
  animation: ${breathe} 1s infinite;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 12px 15px;
  box-sizing: border-box;
`;


export default Status;
