import { ChakraProvider, Grid } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Department, DepartmentState, Employee, EmployeeState } from "../types";
import { DepartmentsView } from "../views/Departments";
import { DirectoryView } from "../views/Directory";
import { EmployeesView } from "../views/Employees";
import { Nav } from "./Nav";

export const EmployeeContext = React.createContext({} as EmployeeState);
EmployeeContext.displayName = "Employee Data";

export const DepartmentContext = React.createContext({} as DepartmentState);
DepartmentContext.displayName = "Department Data";

const App: React.FC = () => {
  const [employees, setEmployees] = useState({
    data: [],
    indices: {},
    isLoading: true,
    isUpdating: false,
  } as EmployeeState);
  const [departments, setDepartments] = useState({
    data: [],
    indices: {},
    isLoading: true,
    isUpdating: false,
  } as DepartmentState);

  useEffect(() => {
    // Fetch all employees and departments from the server
    // They'll be passed around as global state via Context for other components to use
    // Note: we have to use a timeout to give the mock server time to ready up
    setTimeout(() => {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((json) => {
          const departments: Department[] = json.departments
            ? json.departments
            : [];
          const indices: Record<string, number> = {};
          for (let i = 0; i < departments.length; i++)
            indices[departments[i].id] = i;
          setDepartments({
            data: departments,
            indices,
            isLoading: false,
            isUpdating: false,
          });
          console.log("Finished fetching departments");
        })
        .catch((e) => {
          console.error("Error while getting departments:", e);
          // TODO: handle better
        });
      fetch("/api/employees")
        .then((res) => res.json())
        .then((json) => {
          // TODO: currently, departments are sent here as well by the server serializer
          // It may be smarter to just send both separately now, since there can be unassigned employees
          const employees: Employee[] = json.employees ? json.employees : [];
          const indices: Record<string, number> = {};
          for (let i = 0; i < employees.length; i++)
            indices[employees[i].id] = i;
          setEmployees({
            data: employees,
            indices,
            isLoading: false,
            isUpdating: false,
          });
          console.log("Finished fetching employees");
        })
        .catch((e) => {
          console.error("Error while getting employees:", e);
          // TODO: handle better
        });
    }, 1000);
  }, []);

  const endpoints = [
    {
      name: "Home",
      url: "/",
      view: <DirectoryView />,
    },
    { name: "Employees", url: "/employees", view: <EmployeesView /> },
    { name: "Departments", url: "/departments", view: <DepartmentsView /> },
  ];

  const switchContents = [];
  if (employees.isLoading || departments.isLoading)
    switchContents.push(<p>Loading...</p>);
  else {
    for (let i = endpoints.length - 1; i >= 0; i--) {
      const endpoint = endpoints[i];
      const route = (
        <Route path={endpoint.url} key={endpoint.url}>
          {endpoint.view}
        </Route>
      );
      switchContents.push(route);
    }
  }

  let mainContent: JSX.Element;
  if (employees.isLoading || departments.isLoading)
    mainContent = <p>Loading...</p>;
  else {
    mainContent = (
      <EmployeeContext.Provider value={employees}>
        <DepartmentContext.Provider value={departments}>
          <Switch>{switchContents}</Switch>
        </DepartmentContext.Provider>
      </EmployeeContext.Provider>
    );
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
          {mainContent}
        </Grid>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
