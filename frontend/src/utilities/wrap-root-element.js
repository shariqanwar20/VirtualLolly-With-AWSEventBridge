import React from "react";
import { ThemeProvider } from "theme-ui";
import { dark } from "@theme-ui/presets";
import AmplifyClient from '../amplifyClient/client'

const newdark = {
  ...dark,
  sizes: { container: "100%" },
  buttons: {
    primary: {
      color: "background",
      bg: "primary",
      "&:hover": {
        bg: "text",
      },
    },
    secondary: {
      color: "secondary",
      bg: "background",
      "&:hover": {
        bg: "secondary",
        color: "background",
        textDecoration: "none",
      },
    },
  },
  forms: {
    label: {
      fontSize: 1,
      fontWeight: "bold",
    },
    input: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "secondary",
        boxShadow: (t) => `0 0 0 2px ${t.colors.secondary}`,
        outline: "none",
      },
    },
    select: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "secondary",
        boxShadow: (t) => `0 0 0 2px ${t.colors.secondary}`,
        outline: "none",
      },
    },
    textarea: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "secondary",
        boxShadow: (t) => `0 0 0 2px ${t.colors.secondary}`,
        outline: "none",
      },
    },
    slider: {
      bg: "muted",
    },
  },
};

export const wrapRootElement = ({ element }) => (
  <AmplifyClient>
    <ThemeProvider theme={newdark}>{element}</ThemeProvider>
  </AmplifyClient>
);
