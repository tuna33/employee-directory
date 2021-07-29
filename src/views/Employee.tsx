import {
  Button,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { EmployeeCard } from "../components/Card";
import { DepartmentState, EmployeeState } from "../types";
import { employeeBioPlaceholder } from "../utils/text";

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const getEmployeeCard = (
    employees: EmployeeState,
    departments: DepartmentState
  ) => {
    const employeeIndex = employees.indices[id];
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
      <EmployeeCard
        key={employee.id}
        employee={employee}
        departmentName={departmentName}
        url={`/employees/${employee.id}`}
        learnMore={false}
      />
    );
    return card;
  };

  return (
    <Grid marginTop="50px">
      <EmployeeContext.Consumer>
        {(employeeData) => (
          <DepartmentContext.Consumer>
            {(departmentData) => (
              <VStack>
                <HStack spacing="20">
                  <VStack>
                    {getEmployeeCard(employeeData, departmentData)}
                    <HStack paddingTop="20px" spacing="5">
                      <Button>Edit</Button>
                      <Button>Delete</Button>
                    </HStack>
                  </VStack>
                  <Wrap
                    borderRadius="10px"
                    h="70vh"
                    w="40vw"
                    overflowY="scroll"
                    padding="10px"
                  >
                    <Heading size="lg" textAlign="left">
                      About Me
                    </Heading>
                    {employeeBioPlaceholder.map((p) => (
                      <Text key={p.section} textAlign="justify">
                        {p.text}
                      </Text>
                    ))}
                  </Wrap>
                </HStack>
              </VStack>
            )}
          </DepartmentContext.Consumer>
        )}
      </EmployeeContext.Consumer>
    </Grid>
  );
};
