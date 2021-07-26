import React, { useEffect, useState } from "react";
import { render, RenderResult } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import App from "../components/App";
import { Department, Employee } from "../types";

// Thanks to https://github.com/miragejs/tutorial/blob/master/src/lib/test-helpers.js
export function visit(url: string, toTestPage: boolean): RenderResult {
  return render(  
    <MemoryRouter initialEntries={[url]}>
      <QueryParamProvider ReactRouterRoute={Route}>
        {!toTestPage && <App />}
        {toTestPage && <Testbench />}
      </QueryParamProvider>
    </MemoryRouter>
  );
}

/**
 * A Testbench exclusively meant for running tests
 * @returns Test bench component
 */
 const Testbench: React.FC = () => {
  /**
   * Employee, Department, and Loading state are all coupled together
   * We represent that abstraction as "companyData"
   */
  const [companyData, setCompanyData] = useState({employees: Array<Employee>(), departments: Array<Department>(), isLoading: true});

  // Get all employees & departments
  useEffect(() => {
    // Timeout here is necessary to let the mock server spin up
    setTimeout(() => {
      fetch("/api/employees/")
        .then(res => res.json())
        .then(json => {
          // If there are no employees, then have to get the departments directly
          // The reason we don't do that directly is because of the relationship
          // No point getting departments first to then get employees with their department again
          const employees = json.employees as Employee[];
          let departments = (json.departments === undefined ? [] : json.departments) as Department[];
          if(employees.length === 0) {
            fetch("/api/departments")
              .then(res => res.json())
              .then(json => {
                departments = json.departments as Department[];
                setCompanyData({employees, departments, isLoading: false});
              })
              .catch(e => console.error("Error while getting departments:", e));
          }
          else {
            setCompanyData({
              employees,
              departments,
              isLoading: false
            });
          }
        })
        .catch(e => console.error("Error while getting company data:", e));
    }, 1000);
  }, []);

  if(companyData.isLoading)
    return <p>Loading...</p>;

  const departments = companyData.departments;
  const employees = companyData.employees;

  let departmentList: JSX.Element[] = [];
  if(departments.length > 0) {
    departmentList = departments.map(d => <p key={d.id}>{d.info.name}</p>);
  }

  let employeeList: JSX.Element[] = [];
  if(employees.length > 0) {
    employeeList = employees.map(e => {
      // TODO: fix this. Just store id->name for departments rather than repeat this computation
      const departmentName = departments.filter(d => d.id === e.departmentId)[0].info.name;
      const {info, id} = e;
      const {firstName, lastName, pictureUrl, title} = info;

      return (
        <div key={id}>
          <p>{lastName}</p>
          <p>{firstName}</p>
          <img src={pictureUrl} alt={pictureUrl} />
          <p>{title}</p>
          <p>{departmentName}</p>
        </div>
      );
    });
  }
  
  return (
    <div>
      <h1>Departments</h1>
      {departmentList.length === 0 && <p>There are no departments matching your selected filters.</p>}
      {departmentList}
      <h1>Employees</h1>
      {employeeList.length === 0 && <p>There are no employees matching your selected filters.</p>}
      {employeeList}
    </div>
  );
};