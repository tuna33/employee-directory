import { Button, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { Employee } from "../types";

export const EmployeeCard: React.FC<{
  employee: Employee;
  departmentName: string;
  url: string;
  learnMore: boolean;
}> = ({ employee, departmentName, url, learnMore }) => {
  const { info } = employee;
  const { firstName, lastName, pictureUrl, title } = info;
  return (
    <VStack
      bgColor="#e2e2e2"
      h="400px"
      w="300px"
      justify="center"
      align="center"
      borderRadius="30px"
    >
      <img
        src={pictureUrl}
        alt={`${firstName} ${lastName}'s picture`}
        style={{ borderRadius: "300px" }}
      />
      <VStack paddingTop="30px">
        <Text fontWeight="bold">{`${lastName.toLocaleUpperCase()}, ${firstName}`}</Text>
        <Text>{title}</Text>
        <Text>{departmentName}</Text>
      </VStack>
      {learnMore && (
        <Link to={url}>
          <Button borderRadius="10px">Learn more</Button>
        </Link>
      )}
    </VStack>
  );
};
