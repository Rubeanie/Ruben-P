'use client';

import { Component, useEffect, useState, createRef } from 'react';
import { usePalette } from 'react-palette';
import { getThemeUrl } from './sanity';
import seedrandom from 'seedrandom';

let url = '';
const Color = require('color');
const fetchThemeEvent = 'fetchThemeEvent';
const updateThemeEvent = 'updateThemeEvent';

function useColor(key) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !document) return;
    const updateColor = () => {
      const newColor = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(key);
      setValue(newColor ? newColor.trim() : null);
    };
    updateColor();
    window.addEventListener(updateThemeEvent, updateColor);
    return () => {
      window.removeEventListener(updateThemeEvent, updateColor);
    };
  }, [key]);
  if (!value) return null;
  return Color(value).hex();
}

function useValue(key) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !document) return;
    const updateValue = () => {
      const newValue = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(key);
      setValue(newValue ? newValue.trim() : null);
    };
    updateValue();
    window.addEventListener(updateThemeEvent, updateValue);
    return () => {
      window.removeEventListener(updateThemeEvent, updateValue);
    };
  }, [key]);
  if (value === null) return null;
  return value;
}

/* Generator */
function ApplyTheme() {
  const { data, loading, error } = usePalette(url);
  useEffect(() => {
    if (loading !== true) {
      // Preload background image
      const preloadImage = new Image();
      preloadImage.src = url;
      preloadImage.onload = () => {
        document.documentElement.style.setProperty(
          '--image-background',
          `url('${url}')`
        );
      };

      const newPrimaryColor = Color(data.lightVibrant).hex();
      const newSecondaryColor = Color(data.darkMuted)
        .saturate(0.25)
        .lighten(0.2)
        .hex();
      const newBackgroundColor = Color(data.darkMuted)
        .saturate(0.75)
        .darken(0.55)
        .hex();
      const newTextColor = Color(data.darkMuted)
        .saturate(1.3)
        .lighten(2.5)
        .hex();

      // Set variables sequentially
      document.documentElement.style.setProperty(
        '--color-primary',
        newPrimaryColor
      );
      document.documentElement.style.setProperty(
        '--color-secondary',
        newSecondaryColor
      );
      document.documentElement.style.setProperty(
        '--color-background',
        newBackgroundColor
      );
      document.documentElement.style.setProperty('--color-text', newTextColor);
    }
    window.dispatchEvent(new Event(updateThemeEvent));
  }, [data, loading]);
}

function randomTheme(data) {
  const rng = seedrandom.xor4096();
  const index = Math.floor(rng() * data.length);
  console.log(`Url: ${data[index].image} | Index: ${index}`);
  if (data[index].message !== null) {
    console.log(data[index].message);
  }
  return data[index].image;
}

function overrideTheme(theme) {
  if (theme) {
    console.log(`Url: ${theme} | Index: OVERRIDE`);
    url = theme;
  }
  window.dispatchEvent(new Event(fetchThemeEvent));
}

async function restartTheme() {
  const data = await getThemeUrl();
  url = randomTheme(data);

  window.dispatchEvent(new Event(fetchThemeEvent));
}

class Theme extends Component {
  constructor(props) {
    super(props);
    this.state = { renderTheme: false };
    this.preloadRef = createRef();
  }
  componentDidMount() {
    url = randomTheme(this.props.url);

    if (this.preloadRef.current) {
      this.preloadRef.current.style.backgroundImage = `url('${url}')`;
    }

    this.setState({ renderTheme: true });
    window.overrideTheme = overrideTheme;
    window.restartTheme = restartTheme;
    window.addEventListener(fetchThemeEvent, this.updateTheme);
  }
  updateTheme = () => {
    if (this.preloadRef.current) {
      this.preloadRef.current.style.backgroundImage = `url('${url}')`;
    }
    this.forceUpdate();
  };
  componentWillUnmount() {
    window.removeEventListener(fetchThemeEvent, this.updateTheme);
  }
  render() {
    return (
      <div ref={this.preloadRef} style={{ visibility: 'hidden' }}>
        {this.state.renderTheme ? <ApplyTheme /> : null}
      </div>
    );
  }
}

export { useColor, useValue, Theme };
