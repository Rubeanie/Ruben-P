import { useState, useEffect } from 'react';
import { addEffect, addAfterEffect } from '@react-three/fiber';
import StatsImpl from 'stats.js';
import { AgeFromDate } from 'age-calculator';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function Age() {
  return new AgeFromDate(new Date('2004-07-26')).age;
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
  }, [showPanel, className, parent, stats]);
  return null;
}

export { debounce, Age, Stats };
