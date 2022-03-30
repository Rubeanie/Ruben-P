import React, { useEffect, useState } from "react";
import { usePalette } from "react-palette";
import sanity from "../lib/sanity";

let url = null;

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
  let rgb = `${output}`.split(",");
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
function SetStyle() {
  console.log("attempting");
  const { data, loading, error } = usePalette(url);
  useEffect(() => {
    console.log("UseEffect Loop")
    const Color = require("color");
    if (loading == false && url != null) {
      console.log("UseEffect worked");
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
      document.documentElement.style.setProperty(
        "--text-image",
        `url('${url}')`
      );
    }
    const doc = document.documentElement;
    doc.style.display = "none";
    doc.offsetHeight;
    doc.style.display = "";
  }, [data, loading]);

  return null;
}

function StyleGenerator() {
  let urls = [];
  let messages = [];
  const query = `*[_type == "theme"]{
    _id, 
    assets,
    "urls": assets[]->url,
    "messages": assets[]->message
  }`;
  sanity.fetch(query).then((themes) => {
    themes.forEach((theme) => {
      urls.push.apply(urls, theme.urls);
      messages.push.apply(messages, theme.messages);
    });
    const index = Math.floor(Math.random() * urls.length);
    url = urls[index];
    console.log(`Url: ${url} | Index: ${index}`);
    if (messages[index] != null) {
      console.log(messages[index]);
    }
    console.log("Finished");
  });
  return null;
}

function ColorValue(x) {
  const Color = require("color");
  const color = Color().hex(x);
  return `${color.red()},${color.green()},${color.blue()}`;
}

export { GetColor, GetValue, SetStyle, StyleGenerator };
