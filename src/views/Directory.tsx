import { Grid, HStack, VStack } from "@chakra-ui/react";
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
                <HStack>
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
                </HStack>
                <EmployeeTable
                  employees={employeeData}
                  departments={departmentData}
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
