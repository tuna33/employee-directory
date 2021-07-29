import { Wrap, WrapItem } from "@chakra-ui/react";
import React from "react";
import { EmployeeState } from "../types";
import { EmployeeCard } from "./Card";

export const Gallery: React.FC<{
  employeeData: EmployeeState;
  departmentNames: Record<string, string>;
}> = ({ employeeData, departmentNames }) => {
  const employeeCards = employeeData.data.map((e) => (
    <WrapItem key={e.id}>
      <EmployeeCard
        employee={e}
        departmentName={
          e.departmentId ? departmentNames[e.departmentId] : "No Department"
        }
      />
    </WrapItem>
  ));
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
      {employeeCards}
    </Wrap>
  );
};
