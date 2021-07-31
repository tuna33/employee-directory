import { Td, Tfoot } from "@chakra-ui/react";
import { Table, TableCaption, Tbody, Th, Thead, Tr } from "@chakra-ui/table";
import React from "react";
import { DepartmentState, EmployeeState } from "../types";
import { generateDepartmentsMap } from "../utils/data";

export const EmployeeTable: React.FC<{
  employees: EmployeeState;
  departments: DepartmentState;
}> = ({ employees, departments }) => {
  const departmentNames = generateDepartmentsMap(departments.data);

  const employeeTableRows = employees.data.map((e) => (
    <Tr key={e.id}>
      <Td>{e.info.firstName}</Td>
      <Td>{e.info.lastName}</Td>
      <Td>{e.info.title}</Td>
      <Td>{e.departmentId ? departmentNames[e.departmentId] : "None"}</Td>
      <Td></Td>
    </Tr>
  ));
  const tableInfo = (
    <Tr>
      <Th>First Name</Th>
      <Th>Last Name</Th>
      <Th>Title</Th>
      <Th>Department</Th>
      <Th>Actions</Th>
    </Tr>
  );

  return (
    <Table w="60vw">
      <TableCaption placement="top">Employees List</TableCaption>
      <Thead>{tableInfo}</Thead>
      <Tbody>{employeeTableRows}</Tbody>
      <Tfoot>{tableInfo}</Tfoot>
    </Table>
  );
};
