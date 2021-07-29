import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { EmployeeCard } from "../components/Card";
import { DeleteButtonDialog } from "../components/Dialog";
import { DepartmentState, EmployeeState } from "../types";
import { employeeBioPlaceholder } from "../utils/text";

type OperationStatus = "none" | "success" | "failure" | "in progress";

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [deletionStatus, setDeletionStatus] = useState(
    "none" as OperationStatus
  );

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

  const deleteEmployee = (employees: EmployeeState) => {
    setDeletionStatus("in progress");
    fetch(`/api/employees/${id}`, { method: "DELETE" }).then((res) => {
      if (res.status !== 200) {
        setDeletionStatus("failure");
        setTimeout(() => setDeletionStatus("none"), 1000);
        return;
      }
      setDeletionStatus("success");
      // Delete the employee from the cache, and redirect to employees page
      employees.data = employees.data.filter((e) => e.id !== id);
      // The new data array needs all indices to be adjusted
      const indices: Record<string, number> = {};
      let beforeId = true;
      for (const [entry, index] of Object.entries(employees.indices)) {
        if (entry === id) {
          beforeId = false;
        } else {
          indices[entry] = beforeId ? index : index - 1;
        }
      }
      employees.indices = indices;
      setTimeout(() => {
        history.push("/employees");
      }, 1000);
    });
  };

  const getStatusMessage = () => {
    if (deletionStatus === "none") return null;
    let alert = {} as JSX.Element;
    if (deletionStatus === "in progress") {
      alert = (
        <Alert status="info">
          <AlertIcon />
          Attempting to delete employee
        </Alert>
      );
    } else if (deletionStatus === "failure") {
      alert = (
        <Alert status="error">
          <AlertIcon />
          Could not delete employee
        </Alert>
      );
    } else if (deletionStatus === "success") {
      alert = (
        <Alert status="success">
          <AlertIcon />
          Successfully deleted employee
        </Alert>
      );
    }
    return (
      <Box textAlign="center" paddingTop="20px" borderRadius="15px">
        {alert}
      </Box>
    );
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
                      <DeleteButtonDialog
                        onDelete={() => deleteEmployee(employeeData)}
                        disabled={deletionStatus !== "none"}
                      />
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
                {getStatusMessage()}
              </VStack>
            )}
          </DepartmentContext.Consumer>
        )}
      </EmployeeContext.Consumer>
    </Grid>
  );
};
