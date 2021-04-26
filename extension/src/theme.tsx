import { extendTheme } from "@chakra-ui/react";

import {
  gray,
  amber,
  emerald,
  teal,
  blue,
  indigo,
  violet,
  pink,
  rose,
} from "tailwindcss/colors";

const theme = extendTheme({
  colors: {
    gray,
    red: rose,
    yellow: amber,
    green: emerald,
    teal,
    blue,
    indigo,
    purple: violet,
    pink,
  },
  fonts: {
    body:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    heading:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  },
  space: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  sizes: {
    0.5: "0.125rem",
    1.5: "0.375rem",
    2.5: "0.625rem",
    3.5: "0.875rem",
  },
  styles: {
    global: {
      html: {
        WebkitFontSmoothing: "auto",
      },
      body: {
        fontSize: "md",
        lineHeight: "normal",
      },
    },
  },
  components: {
    Form: {
      baseStyle: {
        helperText: {
          mt: 1,
        },
      },
    },
    FormLabel: {
      baseStyle: {
        mb: 1,
      },
    },
    FormError: {
      baseStyle: {
        text: {
          mt: 1,
        },
      },
    },
  },
});

export default theme;
