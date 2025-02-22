import * as React from "react";
import { Container, Group } from "@mantine/core";
import type { MantineSize } from "@mantine/core";
import { NavItem, translate } from "./GlobalNav";
import ExternalNavElement from "./ExternalNav";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import classes from "./BottomHeader.module.css";
import ColorSchemeToggle from "../color-scheme-toggle";

interface Props {
  lang: "en" | "de" | string;
  appNav: NavItem[];
  title: string;
  loginButton?: ReactNode;
  size: MantineSize | undefined;
}

const BottomHeader: React.FC<Props> = ({
  lang,
  appNav,
  title,
  loginButton,
  size,
  signet,
}) => {
  return (
    <Container visibleFrom="md" className={classes.navbar} fluid={true}>
      <Container size={size ? size : "md"} className={classes.container}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={
              signet
                ? signet
                : "https://biddit.app/static/media/SHSG_Logo_Icon_Title_small_white.79a3fc7c.png"
            }
            alt="Signet of the student organization"
            className={classes.logo}
          />
          <Link to={""} className={classes.title}>
            {title}
          </Link>
        </div>

        <Group
          style={{
            justifyContent: "flex-end",
          }}
          wrap="nowrap"
          gap="2.75rem"
        >
          {translate(appNav, lang).map((item, i) => {
            return (
              <ExternalNavElement
                item={item}
                mobile={false}
                isExternal={false}
                key={i}
              />
            );
          })}
          <ColorSchemeToggle />
          {loginButton}
        </Group>
      </Container>
    </Container>
  );
};

export default BottomHeader;
