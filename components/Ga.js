import { useEffect, useState } from "react";
import ReactGA from "react-ga";

const Analytics = (props) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    ReactGA.initialize("G-2ZRD55KVE8"/* , { debug: true } */);
    setInitialized(true);
  }, []);

  useEffect(() => {
      if (initialized) {
        let path = window.location.pathname + window.location.search;
        if (props.pathname != null) {
          path = props.pathname;
        }
        ReactGA.pageview(path);
      }
    },
    [initialized, props.pathname]
  );

  return(
    <div />
  );
};

export default Analytics;