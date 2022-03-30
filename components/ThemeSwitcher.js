import React from "react";
import { SetStyle, StyleGenerator } from "./Style";

export default class ThemeSwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderStyleSet: false,
    };
  }
  componentDidMount() {
    if (StyleGenerator() == null) {
      console.log("Starting");
      this.setState(() => ({ renderStyleSet: true }));
    }
  }
  render() {
    return this.state.renderStyleSet ? ( 
      <div>
        <SetStyle />
      </div>
    ) : (
      null
    );
  }
}