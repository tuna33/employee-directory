import { ChakraProvider, Grid, VStack } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { DepartmentsView } from "../views/Departments";
import { DirectoryView } from "../views/Directory";
import { EmployeesView } from "../views/Employees";
import { Nav } from "./Nav";

const App: React.FC = () => {
  const endpoints = [
    { name: "Home", url: "/", view: <DirectoryView /> },
    { name: "Employees", url: "/employees", view: <EmployeesView /> },
    { name: "Departments", url: "/departments", view: <DepartmentsView /> },
  ];

  const switchContents = [];
  for (const endpoint of endpoints) {
    const route = (
      <Route exact path={endpoint.url} key={endpoint.url}>
        {endpoint.view}
      </Route>
    );
    switchContents.push(route);
  }

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Grid margin="0px 10px">
          <Nav
            endpoints={endpoints.map((e) => {
              return { name: e.name, url: e.url };
            })}
          />
          <Switch>{switchContents}</Switch>
        </Grid>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
