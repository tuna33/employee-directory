import { FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { EmployeeInfo } from "../types";

interface EditEmployeeProps {
  placeholderData: { info: EmployeeInfo; departmentId?: string };
  resultData: { info: EmployeeInfo; departmentId?: string };
  setResultData: React.Dispatch<
    React.SetStateAction<{
      info: EmployeeInfo;
      departmentId: string | undefined;
    }>
  >;
  departmentNames: Record<string, string>;
}

// This form manipulates an external state (resultData) via its setter (setResultData)
// It takes in placeholderData to have as placeholders in each input element
// and a map <departmentId, departmentName> to generate the valid department options
export const EditEmployeeForm: React.FC<EditEmployeeProps> = ({
  placeholderData,
  resultData,
  setResultData,
  departmentNames,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState(
    placeholderData.departmentId ? placeholderData.departmentId : ""
  );

  const handleInfoChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;
    setter(value);
    // Prevent deletions from accidentally being interpreted as changes
    // None of the fields can be an empty string
    let replacementInfo = resultData.info;
    if (value.trim() !== "") {
      replacementInfo = { ...resultData.info, [name]: value };
    }
    // Sharing individual setters would be more annoying, so staying with this for now
    setResultData({
      info: replacementInfo,
      departmentId: resultData.departmentId,
    });
  };

  const handleDepartmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const target = event.target as HTMLSelectElement;
    const option = target.selectedOptions[0];
    const internalValue = option.value;
    setDepartmentId(internalValue);
    const value = internalValue === "" ? undefined : internalValue;
    setResultData({
      info: resultData.info,
      departmentId: value,
    });
  };

  // A department name with id "" will have the name "None" and be included in the list
  // This is to allow to both unassign assigned employees, and assign unassigned ones
  departmentNames[""] = "None";
  const departmentList = Object.entries(departmentNames).map((e) => {
    const [id, name] = e;
    return (
      <option key={id} value={id}>
        {name}
      </option>
    );
  });

  return (
    <form>
      <FormLabel>First Name</FormLabel>
      <Input
        value={firstName}
        name="firstName"
        placeholder={placeholderData.info.firstName}
        onChange={(event) => handleInfoChange(event, setFirstName)}
      />
      <FormLabel>Last Name</FormLabel>
      <Input
        value={lastName}
        name="lastName"
        placeholder={placeholderData.info.lastName}
        onChange={(event) => handleInfoChange(event, setLastName)}
      />
      <FormLabel>Picture Url</FormLabel>
      <Input
        value={pictureUrl}
        name="pictureUrl"
        placeholder={placeholderData.info.pictureUrl}
        onChange={(event) => handleInfoChange(event, setPictureUrl)}
      />
      <FormLabel>Title</FormLabel>
      <Input
        value={title}
        name="title"
        placeholder={placeholderData.info.title}
        onChange={(event) => handleInfoChange(event, setTitle)}
      />
      <FormLabel>Department</FormLabel>
      <Select
        value={departmentId}
        onChange={(event) => handleDepartmentChange(event)}
      >
        {departmentList}
      </Select>
    </form>
  );
};
