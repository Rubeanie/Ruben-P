import Link from "next/link";
import React from "react";

class Social extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="socials" style={{ background: this.props.color }}>
          <div className="row">
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
                  <p
                    style={{ color: this.props.textColor, overflow: "visible" }}
                  >
                    {this.props.name}
                    <br />
                    {this.props.username}
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Social;
