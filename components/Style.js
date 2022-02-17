import React, { useEffect, useState } from "react";
import { usePalette } from "react-palette";

function GetColor(x) {
  const [output, setOutput] = React.useState(null);
  useEffect(() => {
    setOutput((output) =>
      window.getComputedStyle(document.documentElement).getPropertyValue(x)
    );
    setInterval(() => {
      setOutput((output) =>
        window.getComputedStyle(document.documentElement).getPropertyValue(x)
      );
    }, 1000);
  }, [output, x]);
  var rgb = `${output}`.split(",");
  return require("color")
    .rgb(parseFloat(rgb[0]), parseFloat(rgb[1]), parseFloat(rgb[2]))
    .hex();
}

function GetValue(x) {
  const [output, setOutput] = React.useState(null);
  useEffect(() => {
    setOutput((output) =>
      window.getComputedStyle(document.documentElement).getPropertyValue(x)
    );
    setInterval(() => {
      setOutput((output) =>
        window.getComputedStyle(document.documentElement).getPropertyValue(x)
      );
    }, 3000);
  }, [output, x]);
  return parseFloat(output);
}

/* Generator */
function SetStyle(x) {
  const url = x;
  const { data, loading, error } = usePalette(url);
  useEffect(() => {
    const Color = require("color");
    /* Foreground Color */
    document.documentElement.style.setProperty(
      "--color-foreground",
      ColorValue(Color(data.lightVibrant).hex())
    );
    /* Midground Color */
    document.documentElement.style.setProperty(
      "--color-mid-ground",
      ColorValue(Color(data.darkMuted).saturate(0.25).lighten(0.2).hex())
    );
    /* Background Color */
    document.documentElement.style.setProperty(
      "--color-background",
      ColorValue(Color(data.darkMuted).saturate(0.75).darken(0.55).hex())
    );
    /* Text Color */
    document.documentElement.style.setProperty(
      "--color-body-font",
      ColorValue(Color(data.darkMuted).saturate(1.3).lighten(2.5).hex())
    );
    /* Text Image */
    document.documentElement.style.setProperty("--text-image", `url('${url}')`);
  }, [url, data]);

  return null;
}
function StyleGenerator() {
  const url =
    "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80";
  SetStyle(url);

  return null;
}

function ColorValue(x) {
  const Color = require("color");
  const color = Color().hex(x);
  return `${color.red()},${color.green()},${color.blue()}`;
}

export { GetColor, GetValue, StyleGenerator };
