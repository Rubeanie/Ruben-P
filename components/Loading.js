import React from "react";
import { Html, useProgress } from '@react-three/drei'
import styled from "styled-components";

const LoadingBody = styled.div`
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
`;
const Heading = styled.h1`
  color: #000000;
  font-size: 10rem;
  font-weight: 900;
`;

function Progress() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

class Loading extends React.Component {
  render() {
    return (
      <div>
        <h2>
          <Progress />
        </h2>
      </div>
    );
  }
}

export default Loading;
