import React, { useEffect, useState } from "react";
import { usePalette } from "react-palette";

let url = null;
const Color = require("color");

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
  return Color(output).hex();
}

function GetBackgroundColor() {
  const [outputX, setOutputX] = React.useState(null);
  const [outputY, setOutputY] = React.useState(null);
  const [outputZ, setOutputZ] = React.useState(null);
  useEffect(() => {
    setOutputX((outputX) =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
    );
    setOutputY((outputY) =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-overlay-rgb")
    );
    setOutputZ((outputZ) =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-overlay-alpha")
    );
    setInterval(() => {
      setOutputX((outputX) =>
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-background")
      );
      setOutputY((outputY) =>
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-overlay-rgb")
      );
      setOutputZ((outputZ) =>
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--color-overlay-alpha")
      );
    }, 1000);
  }, [outputX, outputY, outputZ]);
  return Color(outputX).mix(Color(outputY), parseFloat(outputZ)).hex();
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
function SetStyle() {
  const { data, loading, error } = usePalette(url);
  useEffect(() => {
    //const Color = require("color");
    if (data.vibrant != null) {
      /* Foreground Color */
      document.documentElement.style.setProperty(
        "--color-foreground",
        Color(data.lightVibrant).hex()
      );
      /* Midground Color */
      document.documentElement.style.setProperty(
        "--color-mid-ground",
        Color(data.darkMuted).saturate(0.25).lighten(0.2).hex()
      );
      /* Background Color */
      document.documentElement.style.setProperty(
        "--color-background",
        Color(data.darkMuted).saturate(0.75).darken(0.55).hex()
      );
      /* Text Color */
      document.documentElement.style.setProperty(
        "--color-body-font",
        Color(data.darkMuted).saturate(1.3).lighten(2.5).hex()
      );
      /* Text Image */
      document.documentElement.style.setProperty(
        "--text-image",
        `url('${url}')`
      );
    }
    const doc = document.documentElement;
    doc.style.display = "none";
    doc.offsetHeight;
    doc.style.display = "";
  }, [data]);

  return null;
}
function StyleGenerator() {
  const urls = require("../styles/abstracts/_backgrounds.json");
  const index = Math.floor(Math.random() * urls.length);
  url = urls[index];
  console.log(`Url: ${url} | Index: ${index}`);

  return null;
}

export { GetColor, GetBackgroundColor, GetValue, SetStyle, StyleGenerator };
