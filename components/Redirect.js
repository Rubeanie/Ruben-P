import Head from "next/head";
import Link from "next/link";
import React from "react";

export default class Redirect extends React.Component {
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
          <title>{`${this.props.name} redirect`}</title>
          <meta
            name="description"
            content={`${this.props.name} redirect page.`}
          />
          <meta key="robots" name="robots" content="index,follow" />
          <meta key="googlebot" name="googlebot" content="index,follow" />
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
            if the {this.props.name} redirect doesn’t work.
          </p>
        </div>
      </div>
    );
  }
}
