import { Heading, HStack } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";

const NavItem: React.FC<{ name: string; url: string }> = ({ name, url }) => {
  return (
    <NavLink
      exact
      to={url}
      activeClassName="current"
      activeStyle={{ textDecoration: "underline" }}
    >
      <Heading size="md" fontWeight="normal" marginLeft="10px">
        {name}
      </Heading>
    </NavLink>
  );
};

export const Nav: React.FC<{ endpoints: { name: string; url: string }[] }> = ({
  endpoints,
}) => {
  const navLinks = endpoints.map((e) => (
    <NavItem name={e.name} url={e.url} key={e.name} />
  ));
  return (
    <HStack align="baseline" justify="space-between">
      <Heading size="lg" letterSpacing="3px">
        COMPANY DIRECTORY
      </Heading>
      <HStack>{navLinks}</HStack>
    </HStack>
  );
};
