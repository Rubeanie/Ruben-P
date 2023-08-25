import React, { useEffect, useState } from "react";
import { usePalette } from "react-palette";
import { getThemeUrl } from "./sanity";

let url = null;
const Color = require("color");
const fetchThemeEvent = "fetchThemeEvent";
const updateThemeEvent = "updateThemeEvent";

function GetColor(key) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    const updateColor = () => {
      setValue(
        window.getComputedStyle(document.documentElement).getPropertyValue(key)
      );
    };
    updateColor();
    window.addEventListener(updateThemeEvent, updateColor);
    return () => {
      window.removeEventListener(updateThemeEvent, updateColor);
    };
  }, [key]);
  return Color(value !== null ? value.replace(/ /g, "") : value).hex();
}

function GetBackgroundColor() {
  const [background, setBackground] = useState(null);
  const [overlayRgb, setOverlayRgb] = useState(null);
  const [overlayAlpha, setOverlayAlpha] = useState(null);
  useEffect(() => {
    const updateBackgroundColor = () => {
      setBackground(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-background")
      );
      setOverlayRgb(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-overlay-rgb")
      );
      setOverlayAlpha(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-overlay-alpha")
      );
    };
    updateBackgroundColor();
    window.addEventListener(updateThemeEvent, updateBackgroundColor);
    return () => {
      window.removeEventListener(updateThemeEvent, updateBackgroundColor);
    };
  }, []);
  return Color(background !== null ? background.replace(/ /g, "") : background)
    .mix(
      Color(overlayRgb !== null ? overlayRgb.replace(/ /g, "") : overlayRgb),
      parseFloat(overlayAlpha)
    )
    .hex();
}

function GetValue(key) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    const updateValue = () => {
      setValue(
        window.getComputedStyle(document.documentElement).getPropertyValue(key)
      );
    };
    updateValue();
    window.addEventListener(updateThemeEvent, updateValue);
    return () => {
      window.removeEventListener(updateThemeEvent, updateValue);
    };
  }, [key]);
  return parseFloat(value !== null ? value.replace(/ /g, "") : value);
}

/* Generator */
function ApplyTheme() {
  const { data, loading, error } = usePalette(url);
  useEffect(() => {
    if (data.vibrant != null) {
      /* Foreground Color */
      document.documentElement.style.setProperty(
        "--color-primary",
        Color(data.lightVibrant).hex()
      );
      /* Midground Color */
      document.documentElement.style.setProperty(
        "--color-secondary",
        Color(data.darkMuted).saturate(0.25).lighten(0.2).hex()
      );
      /* Background Color */
      document.documentElement.style.setProperty(
        "--color-background",
        Color(data.darkMuted).saturate(0.75).darken(0.55).hex()
      );
      /* Text Color */
      document.documentElement.style.setProperty(
        "--color-text",
        Color(data.darkMuted).saturate(1.3).lighten(2.5).hex()
      );
      /* Text Image */
      document.documentElement.style.setProperty(
        "--image-background",
        `url('${url}')`
      );
    }
    const doc = document.documentElement;
    doc.style.display = "none";
    doc.offsetHeight;
    doc.style.display = "";
    window.dispatchEvent(new Event(updateThemeEvent));
  }, [data, loading]);
}

function overrideTheme(theme) {
  if (theme) {
    console.log(`Url: ${theme} | These: OVERRIDE`);
    url = theme;
  }
  window.dispatchEvent(new Event(fetchThemeEvent));
}

async function restartTheme() {
  url = await getThemeUrl();
  window.dispatchEvent(new Event(fetchThemeEvent));
}

class Theme extends React.Component {
  constructor() {
    super();
    this.state = { renderTheme: false };
    this.updateTheme = this.updateTheme.bind(this);
  }
  async componentDidMount() {
    url = await getThemeUrl();
    this.setState({ renderTheme: true });
    window.overrideTheme = overrideTheme;
    window.restartTheme = restartTheme;
    window.addEventListener(fetchThemeEvent, this.updateTheme);
  }
  updateTheme() {
    this.forceUpdate();
  }
  componentWillUnmount() {
    window.removeEventListener(fetchThemeEvent, this.updateTheme);
  }
  render() {
    return this.state.renderTheme ? <ApplyTheme /> : null;
  }
}

export { GetColor, GetBackgroundColor, GetValue, Theme };
