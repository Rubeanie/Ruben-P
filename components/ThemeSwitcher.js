import React from "react";
import { SetStyle, StyleGenerator } from "./Style";

export default class ThemeSwitcher extends React.Component {
  componentDidMount() {
    StyleGenerator();

  }
  render() {
    return ( 
      <div>
        <SetStyle />
      </div>
    );
  }
}