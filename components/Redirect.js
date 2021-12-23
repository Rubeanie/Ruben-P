import Head from "next/head";
import Link from "next/link";
import React from "react";

class Redirect extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    window.location.href = this.props.url;
  }
  render() {
    return (
      <div>
        <Head>
          <meta key="robots" name="robots" content="noindex,follow" />
          <meta key="googlebot" name="googlebot" content="noindex,follow" />
        </Head>
        <div className="column">
          <h2>
            <icon>{this.props.logo}</icon> Redirecting...
          </h2>
          <p>
            Click{" "}
            <Link href={this.props.url} passHref>
              <a>
                <url>here</url>
              </a>
            </Link>{" "}
            if the {this.props.name} redirect doesn't work.
          </p>
        </div>
      </div>
    );
  }
}

export default Redirect;
