import { MantineColorsTuple, MantineThemeOverride } from "@mantine/core";
import { generateColors } from "@mantine/colors-generator";

const makeVsethTheme = (newPrimaryColor?: MantineColorsTuple | string) => {
  const defaultBrand: MantineColorsTuple = [
    "#E5F9FF",
    "#D1F3FF",
    "#9EE5FF",
    "#6BD8FF",
    "#3DC8FF",
    "#1ABEFF",
    "#00B2FF",
    "#009FE3",
    "#0A8BC7",
    "#0E78AA",
  ];
  let brand = defaultBrand;
  if (typeof newPrimaryColor === "string") {
    brand = [
      "#E5F9E5",
      "#D1F3D1",
      "#9EE59E",
      "#6BD86B",
      "#3DC83D",
      "#006625", // Sixth value set to green
      "#006625",
      "#009E00",
      "#0A8B0A",
      "#0E780E",
    ];
  } else if (newPrimaryColor != undefined) {
    brand = newPrimaryColor;
  }

  const vsethTheme: MantineThemeOverride = {
    colors: {
      brand,
      vsethGray: new Array(10).fill("rgb(144, 146, 150)") as any,
    },
    primaryColor: "brand",
    autoContrast: true,
    cursorType: "pointer",
    fontFamily:
      '"Source Sans Pro",Lato,Arial,Helvetica,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol',
  };
  return vsethTheme;
};

export default makeVsethTheme;
