import { Grid, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Route, useRouteMatch, Switch } from "react-router-dom";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { Gallery } from "../components/Gallery";
import { EmployeeView } from "./Employee";

export const EmployeesView: React.FC = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/:employeeId`}>
        <EmployeeView />
      </Route>
      <Route path={match.path}>
        <Grid marginTop="50px">
          <VStack>
            <Heading size="md">Meet our Staff</Heading>
            <Text>
              We&apos;ve picked the very best to bring you better, faster
              results
            </Text>
          </VStack>
          <VStack marginTop="30px">
            <EmployeeContext.Consumer>
              {(employeeData) => (
                <DepartmentContext.Consumer>
                  {(departmentData) => (
                    <Gallery
                      employeeData={employeeData}
                      departmentNames={departmentData.names}
                    />
                  )}
                </DepartmentContext.Consumer>
              )}
            </EmployeeContext.Consumer>
          </VStack>
        </Grid>
      </Route>
    </Switch>
  );
};
