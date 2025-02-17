import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

const ColorSchemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
      variant="transparent"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {dark ? (
        <IconSun
          style={{
            color: "var(--mantine-color-white)", // Sun icon is white in dark mode
          }}
        />
      ) : (
        <IconMoon
          style={{
            color: "var(--mantine-color-white)", // Moon icon is black in light mode
          }}
        />
      )}
    </ActionIcon>
  );
};

export default ColorSchemeToggle;
