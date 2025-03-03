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
  signet?: string;
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
    <Container visibleFrom="md" className={classes.navbar} fluid={true} px={0}>
      <Container size={size ? size : "md"} className={classes.container} style={{ marginInline: 0, width: '100%', maxWidth: '100%' }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={
              signet
                ? signet
                : "favicon.svg"
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
