import { Grid, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Route, useRouteMatch, Switch } from "react-router-dom";
import { Gallery } from "../components/Gallery";
import { EmployeeView } from "./Employee";

export const EmployeesView: React.FC = () => {
  const match = useRouteMatch<{ id: string }>();

  return (
    <Switch>
      <Route path={`${match.path}/:id`} component={EmployeeView} />
      <Route path={match.path}>
        <Grid marginTop="50px">
          <VStack>
            <Heading size="md">Meet our staff</Heading>
            <Text>
              We&apos;ve picked the very best to bring you better, faster
              results
            </Text>
          </VStack>
          <VStack marginTop="30px">
            <Gallery />
          </VStack>
        </Grid>
      </Route>
    </Switch>
  );
};
