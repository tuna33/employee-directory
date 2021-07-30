import {
  Alert,
  AlertIcon,
  Box,
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
import { DeleteButtonDialog, EditButtonDialog } from "../components/Dialog";
import { DepartmentState, EmployeeInfo, EmployeeState } from "../types";
import { employeeBioPlaceholder } from "../utils/text";

interface OperationStatus {
  status: "none" | "success" | "failure" | "in progress";
  action: "update" | "delete";
}

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  // An operation can be either a deletion or an edit
  // Since they're mutually exclusive (can't happen at the same time) they can share state
  const [operationStatus, setOperationStatus] = useState({
    status: "none",
    action: "update",
  } as OperationStatus);

  // Pass the setter to the form so that it can prepare the replacement
  // The edit handler will use this for update requests
  // const [replacement, setReplacement] = useState({ id } as Employee);
  // const getFormReplacement = () => {
  //   const employeeIndex = employees.indices[id];
  //   const employee = employees.data[employeeIndex];
  //   return { info: employee.info, departmentId: employee.departmentId };
  // };
  // const setFormReplacement = (info: EmployeeInfo, departmentId?: string) => {
  //   setReplacement({ id, info, departmentId });
  // };

  /**
   * Gets the current employee's card
   * @param employees global employee state
   * @param departments global department state
   * @returns EmployeeCard element for this employee
   */
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

  /**
   * Deletes the current employee
   * @param employees global employee state
   */
  const deleteEmployee = (employees: EmployeeState) => {
    setOperationStatus({ status: "in progress", action: "delete" });
    fetch(`/api/employees/${id}`, { method: "DELETE" }).then((res) => {
      if (res.status !== 200) {
        setOperationStatus({ status: "failure", action: "delete" });
        setTimeout(
          () => setOperationStatus({ status: "none", action: "delete" }),
          1000
        );
        return;
      }
      setOperationStatus({ status: "success", action: "delete" });
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

  /**
   * Edit (update) the current employee
   * Note: this uses the `replacement` variable for the changes
   * It is manipulated by the edit form
   * @param employees global employee state
   * @param departments global department state
   */
  const editEmployee = (
    employees: EmployeeState,
    departments: DepartmentState,
    newData: { info: EmployeeInfo; departmentId?: string }
  ) => {
    setOperationStatus({ status: "in progress", action: "update" });
    fetch(`/api/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...newData.info,
        departmentId: newData.departmentId,
      }),
    }).then((res) => {
      if (res.status !== 200) {
        setOperationStatus({ status: "failure", action: "update" });
        setTimeout(
          () => setOperationStatus({ status: "none", action: "update" }),
          1000
        );
        return;
      }

      // Only valid departments are shown on the edit form
      // However, from the time they're rendered to when this update happens the department may have been invalidated
      // Have department cleanup be responsible for invalidating the cache entry *first*
      // That way, here we only have to check for its existance
      const requestedDepartmentId = newData.departmentId;
      if (requestedDepartmentId) {
        if (!departments.indices[requestedDepartmentId]) {
          // The id doesn't have a corresponding index (and thus no data entry)
          // Operation has failed
          setOperationStatus({ status: "failure", action: "update" });
          setTimeout(() => {
            setOperationStatus({ status: "none", action: "update" });
          }, 1000);
        }
      }

      // Update the employee on the cache **before** updating the status
      // This is so that the new values are used on the render
      // There's also no need to update the indices themselves, or the other employee entries
      const employeeIndex = employees.indices[id];
      employees.data[employeeIndex] = {
        id: id,
        info: newData.info,
        departmentId: newData.departmentId,
      };
      setOperationStatus({ status: "success", action: "update" });

      setTimeout(() => {
        setOperationStatus({ status: "none", action: "update" });
      }, 1000);
    });
  };

  /**
   * Get the status message according to the edit & delete status
   * @returns Alert element according to status
   */
  const getStatusMessage = () => {
    if (operationStatus.status === "none") return null;
    let alert = {} as JSX.Element;
    if (operationStatus.status === "in progress") {
      alert = (
        <Alert status="info">
          <AlertIcon />
          Attempting to {operationStatus.action} employee
        </Alert>
      );
    } else if (operationStatus.status === "failure") {
      alert = (
        <Alert status="error">
          <AlertIcon />
          Failed to {operationStatus.action} employee
        </Alert>
      );
    } else if (operationStatus.status === "success") {
      alert = (
        <Alert status="success">
          <AlertIcon />
          Successfully {operationStatus.action}d employee
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
                      <EditButtonDialog
                        employee={employeeData.data[employeeData.indices[id]]}
                        departments={departmentData}
                        onEdit={(newData: {
                          info: EmployeeInfo;
                          departmentId?: string;
                        }) =>
                          editEmployee(employeeData, departmentData, newData)
                        }
                        disabled={operationStatus.status !== "none"}
                      />
                      <DeleteButtonDialog
                        onDelete={() => deleteEmployee(employeeData)}
                        disabled={operationStatus.status !== "none"}
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
