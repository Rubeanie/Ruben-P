import Link from "next/link";
import React from "react";

export default class Social extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="skills" style={{ background: this.props.color }}>
        <div className="column">
          <div className="icon">
            <div className="column">
              <div
                style={{
                  color: this.props.textColor,
                  width: "100%",
                  height: "100%",
                }}
              >
                <div className="column" style={{ fontSize: "70px" }}>
                  {this.props.logo}
                </div>
              </div>
            </div>
          </div>
          <div className="overlay">
            <div className="column">
              <p style={{ color: this.props.textColor, overflow: "visible" }}>
                {this.props.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
