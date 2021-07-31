import { FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { EmployeeInfo } from "../types";

type ResultDataSetter = React.Dispatch<
  React.SetStateAction<{
    info: EmployeeInfo;
    departmentId: string | undefined;
  }>
>;
type EmployeeData = { info: EmployeeInfo; departmentId?: string };
type InternalStateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

interface EmployeeFormProps {
  placeholderData: EmployeeData;
  resultData: EmployeeData;
  setResultData: ResultDataSetter;
  departmentNames: Record<string, string>;
}

const handleInfoChange = (
  event: ChangeEvent<HTMLInputElement>,
  setter: React.Dispatch<React.SetStateAction<string>>,
  placeholderData: EmployeeData,
  resultData: EmployeeData,
  setResultData: ResultDataSetter
) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const name = target.name;
  setter(value);
  // Prevent deletions from accidentally being interpreted as changes
  // None of the fields can be an empty string
  // Since info isn't string indexable, have to manually build up the replacement info
  // It will consist of all "new" data with the specific field to be changed as the
  const matchingEntry = Object.entries(placeholderData.info).filter(
    ([key]) => key === name
  )[0];
  const matchingValue = matchingEntry[1];
  console.log("entry:", matchingEntry);
  let replacementInfo = {
    ...resultData.info,
    [name]: matchingValue,
  };
  if (value.trim() !== "") {
    replacementInfo = { ...resultData.info, [name]: value };
  }
  // Sharing individual setters would be more annoying, so staying with this for now
  setResultData({
    info: replacementInfo,
    departmentId: resultData.departmentId,
  });
};

const handleDepartmentChange = (
  event: ChangeEvent<HTMLSelectElement>,
  setDepartmentId: InternalStateSetter<string>,
  setResultData: ResultDataSetter,
  resultData: EmployeeData
) => {
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

const generateDepartmentOptions = (
  departmentNames: Record<string, string>
): JSX.Element[] => {
  // A department name with id "" will have the name "None" and be included in the list
  // This is to allow to both unassign assigned employees, and assign unassigned ones
  const names = departmentNames;
  names[""] = "None";
  const departmentList = Object.entries(names).map((e) => {
    const [id, name] = e;
    return (
      <option key={id} value={id}>
        {name}
      </option>
    );
  });
  return departmentList;
};

// This form manipulates an external state (resultData) via its setter (setResultData)
// It takes in placeholderData to have as placeholders in each input element
// and a map <departmentId, departmentName> to generate the valid department options
export const EmployeeForm: React.FC<EmployeeFormProps> = ({
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

  const departmentList = generateDepartmentOptions(departmentNames);
  return (
    <form>
      <FormLabel>First Name</FormLabel>
      <Input
        value={firstName}
        name="firstName"
        placeholder={placeholderData.info.firstName}
        onChange={(event) =>
          handleInfoChange(
            event,
            setFirstName,
            placeholderData,
            resultData,
            setResultData
          )
        }
      />
      <FormLabel>Last Name</FormLabel>
      <Input
        value={lastName}
        name="lastName"
        placeholder={placeholderData.info.lastName}
        onChange={(event) =>
          handleInfoChange(
            event,
            setLastName,
            placeholderData,
            resultData,
            setResultData
          )
        }
      />
      <FormLabel>Picture Url</FormLabel>
      <Input
        value={pictureUrl}
        name="pictureUrl"
        placeholder={placeholderData.info.pictureUrl}
        onChange={(event) =>
          handleInfoChange(
            event,
            setPictureUrl,
            placeholderData,
            resultData,
            setResultData
          )
        }
      />
      <FormLabel>Title</FormLabel>
      <Input
        value={title}
        name="title"
        placeholder={placeholderData.info.title}
        onChange={(event) =>
          handleInfoChange(
            event,
            setTitle,
            placeholderData,
            resultData,
            setResultData
          )
        }
      />
      <FormLabel>Department</FormLabel>
      <Select
        value={departmentId}
        onChange={(event) =>
          handleDepartmentChange(
            event,
            setDepartmentId,
            setResultData,
            resultData
          )
        }
      >
        {departmentList}
      </Select>
    </form>
  );
};
