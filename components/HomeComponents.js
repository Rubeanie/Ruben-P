import { useState, useEffect } from "react";
import {
  useThree,
  addEffect,
  addAfterEffect,
} from "@react-three/fiber";
import StatsImpl from "stats.js";

function Age() {
  let { AgeFromDate } = require("age-calculator");

  return new AgeFromDate(new Date("2004-07-26")).age;
}

function FPSLimiter({ limit = 60 }) {
  const { invalidate, clock, advance } = useThree();
  useEffect(() => {
    let delta = 0;
    const interval = 1 / limit;
    const update = () => {
      requestAnimationFrame(update);
      delta += clock.getDelta();

      if (delta > interval) {
        invalidate();
        delta = delta % interval;
      }
    };

    update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function Stats({ showPanel = 0, className, parent }) {
  const [stats] = useState(() => new StatsImpl());
  useEffect(() => {
    const node = (parent && parent.current) || document.body;

    stats.showPanel(showPanel);
    node.appendChild(stats.dom);

    if (className) stats.dom.classList.add(className);

    const begin = addEffect(() => stats.begin());
    const end = addAfterEffect(() => stats.end());

    return () => {
      node.removeChild(stats.dom);
      begin();
      end();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent]);
  return null;
}

export { Age, FPSLimiter, Stats };