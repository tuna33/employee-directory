import { Wrap, WrapItem } from "@chakra-ui/react";
import React from "react";
import { DepartmentState, EmployeeState } from "../types";
import { DepartmentContext, EmployeeContext } from "./App";
import { EmployeeCard } from "./Card";

export const Gallery: React.FC = () => {
  const getEmployeeCards = (
    employees: EmployeeState,
    departments: DepartmentState
  ) => {
    const cards = [];
    for (const employeeIndex of Object.values(employees.indices)) {
      const employee = employees.data[employeeIndex];
      const departmentId = employee.departmentId;
      let departmentName: string;
      if (!departmentId) {
        departmentName = "No Department";
      } else {
        const departmentIndex = departments.indices[departmentId];
        departmentName = departments.data[departmentIndex].info.name;
      }
      const card = (
        <WrapItem key={employee.id}>
          <EmployeeCard
            key={employee.id}
            employee={employee}
            departmentName={departmentName}
            url={`/employees/${employee.id}`}
            learnMore={true}
          />
        </WrapItem>
      );
      cards.push(card);
    }
    return cards;
  };

  return (
    <Wrap
      h="60vh"
      w="80vw"
      bgColor="black"
      borderRadius="20px"
      justify="space-around"
      align="center"
      overflowY="scroll"
      overflowX="clip"
      padding="10px"
    >
      <EmployeeContext.Consumer>
        {(employeeData) => (
          <DepartmentContext.Consumer>
            {(departmentData) => getEmployeeCards(employeeData, departmentData)}
          </DepartmentContext.Consumer>
        )}
      </EmployeeContext.Consumer>
    </Wrap>
  );
};
