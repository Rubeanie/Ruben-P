import React, { useState } from "react";
import getIt from "get-it";
import jsonResponse from "get-it/lib/middleware/jsonResponse";
import promise from "get-it/lib/middleware/promise";
import { DashboardWidget } from "@sanity/dashboard";
import { Card, Code } from "@sanity/ui";
import styled from "styled-components";

const request = getIt([promise(), jsonResponse()]);

const Image = styled.img`
  display: block;
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

function Spotify() {

  return (
    <DashboardWidget header="Spotify">
      <Column>
        <Image
          src="https://spotify-github-profile.vercel.app/api/view?uid=rubeanie&cover_image=true&theme=default&bar_color_cover=true"
          alt=""
        />
      </Column>
    </DashboardWidget>
  );
}

export default {
  name: "spotify-activity",
  component: Spotify,
};
