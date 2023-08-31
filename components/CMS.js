import React from 'react';
import { GetAboutPageData } from '../lib/sanity';
import { PortableText } from '@portabletext/react';

class AboutPageContent extends React.Component {
  constructor() {
    super();
    this.state = {
      data: []
    };
  }
  async componentDidMount() {
    this.setState({ data: await GetAboutPageData() });
  }
  render() {
    return this.state.data.map((data) => (
      <PortableText key={data._id} value={data.content} />
    ));
  }
}

export { AboutPageContent };
