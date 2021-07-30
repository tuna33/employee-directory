import { Grid, Heading, HStack, Text, VStack, Wrap } from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { DepartmentContext, EmployeeContext } from "../components/App";
import { DeleteButtonDialog, EditButtonDialog } from "../components/Dialog";
import { EmployeeInfo, OperationStatus } from "../types";
import {
  deleteEmployee,
  editEmployee,
  getEmployeeCard,
} from "../utils/actions";
import { getStatusMessage } from "../utils/status";
import { employeeBioPlaceholder } from "../utils/text";

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  // An operation can be either a deletion or an edit
  // Since they're mutually exclusive (can't happen at the same time) they can share state
  const [operationStatus, setOperationStatus] = useState({
    status: "none",
    action: "update",
  } as OperationStatus);

  return (
    <Grid marginTop="50px">
      <EmployeeContext.Consumer>
        {(employeeData) => (
          <DepartmentContext.Consumer>
            {(departmentData) => (
              <VStack>
                <HStack spacing="20">
                  <VStack>
                    {getEmployeeCard(employeeData, departmentData, id)}
                    <HStack paddingTop="20px" spacing="5">
                      <EditButtonDialog
                        employee={employeeData.data[employeeData.indices[id]]}
                        departments={departmentData}
                        onEdit={(newData: {
                          info: EmployeeInfo;
                          departmentId?: string;
                        }) =>
                          editEmployee(
                            employeeData,
                            id,
                            departmentData,
                            newData,
                            setOperationStatus
                          )
                        }
                        disabled={operationStatus.status !== "none"}
                      />
                      <DeleteButtonDialog
                        onDelete={() =>
                          deleteEmployee(
                            employeeData,
                            id,
                            setOperationStatus,
                            (path) => history.push(path)
                          )
                        }
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
                {getStatusMessage(operationStatus)}
              </VStack>
            )}
          </DepartmentContext.Consumer>
        )}
      </EmployeeContext.Consumer>
    </Grid>
  );
};
