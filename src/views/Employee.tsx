import React from "react";
import { useParams } from "react-router-dom";

export const EmployeeView: React.FC = () => {
  const employeeId = useParams();
  console.log("id", employeeId);
  return <div />;
};
