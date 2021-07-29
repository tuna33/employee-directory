import { Button, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Employee } from "../types";

export const EmployeeCard: React.FC<{
  employee: Employee;
  departmentName: string;
}> = ({ employee, departmentName }) => {
  const { info } = employee;
  const { firstName, lastName, pictureUrl, title } = info;
  return (
    <VStack
      bgColor="#e2e2e2"
      h="400px"
      minW="300px"
      justify="space-around"
      align="center"
      borderRadius="30px"
    >
      <img
        src={pictureUrl}
        alt={`${firstName} ${lastName}'s picture`}
        style={{ borderRadius: "300px" }}
      />
      <VStack>
        <Text fontWeight="bold">{`${lastName.toLocaleUpperCase()}, ${firstName}`}</Text>
        <Text>{title}</Text>
        <Text>{departmentName}</Text>
      </VStack>
      <Button borderRadius="10px">Learn more</Button>
    </VStack>
  );
};
