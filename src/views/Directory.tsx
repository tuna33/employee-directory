import { Grid, Text, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { FormDialogButton } from "../components/Dialog";
import { EmployeeTable } from "../components/Table";
import { EmployeeInfo, OperationStatus } from "../types";
import { addEmployee } from "../utils/actions";
import { getStatusMessage } from "../utils/status";

export const DirectoryView: React.FC = () => {
  const defaultEmployee = {
    id: "",
    info: {
      firstName: "Somebody",
      lastName: "Jones",
      pictureUrl: "https://randomuser.me/api/portraits/men/14.jpg",
      title: "Someone",
    },
    departmentId: undefined,
  };

  const [operationStatus, setOperationStatus] = useState({
    status: "none",
    action: "add",
  } as OperationStatus);

  return (
    <EmployeeContext.Consumer>
      {(employeeData) => (
        <DepartmentContext.Consumer>
          {(departmentData) => (
            <Grid marginTop="50px">
              <VStack>
                <VStack
                  borderRadius="10px"
                  border="2px solid gray"
                  w="20vw"
                  h="20vh"
                  align="center"
                  justify="center"
                  marginBottom="20px"
                >
                  <Text size="sm">Control Panel</Text>
                  <FormDialogButton
                    employee={defaultEmployee}
                    departments={departmentData.data}
                    onSubmit={(newData: {
                      info: EmployeeInfo;
                      departmentId?: string;
                    }) =>
                      addEmployee(
                        employeeData,
                        departmentData,
                        newData,
                        setOperationStatus
                      )
                    }
                    disabled={false}
                    formType="Add"
                  />
                </VStack>
                <EmployeeTable
                  employees={employeeData}
                  departments={departmentData}
                  operationStatus={operationStatus}
                  setOperationStatus={setOperationStatus}
                />

                {getStatusMessage(operationStatus)}
              </VStack>
            </Grid>
          )}
        </DepartmentContext.Consumer>
      )}
    </EmployeeContext.Consumer>
  );
};
