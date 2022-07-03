import { createCurrentUserHook, createClient } from "next-sanity";

import createImageUrlBuilder from "@sanity/image-url";

export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2022-07-03",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_TOKEN,
};

export const sanityclient = createClient(config);

export const urlFor = (source) => createImageUrlBuilder(config).image(source);
