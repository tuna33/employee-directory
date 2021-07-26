import { EmployeeInfo } from "../types"
import { Response } from "miragejs";

/**
 * Some titles/job positions
 */
const titleNames = [
  "Software Engineer",
  "Recruiter",
  "UI/UX Designer",
  "HR Representative",
];

/**
 * The structure of the (relevant) random data from randomuser.me
 */
type RandomData = {
  info: Array<unknown>,
  results: Array<{
    name: {
      title: string,
      first: string,
      last: string
    },
    picture: {
      large: string,
      medium: string,
      thumbnail: string,
    },
  }>,
};

/**
 * Generates random employees sourced from randomuser.me API
 * @param count number of random employees to generate
 * @returns array of (unassigned) employees to be sent to database for creation
 */
export const getRandomEmployeesInfo = async (count: number): Promise<EmployeeInfo[]> => {
  const result = new Array<EmployeeInfo>();
  await fetch(`https://randomuser.me/api/?inc=name,picture&results=${count}`)
  .then(res => res.json())
  .then(json => {
    const data = json as RandomData;
    const resultLength = data.results.length;
    if(resultLength !== count) {
      console.error(`Received ${resultLength} random user data instead of ${count}`);
      return;
    }
    for(let i = 0; i < resultLength; ++i) {
      const info: EmployeeInfo = {
        firstName: data.results[i].name.first,
        lastName: data.results[i].name.last,
        pictureUrl: data.results[i].picture.large,
        title: titleNames[Math.floor(Math.random() * titleNames.length)],
      };
      result.push(info);
    }
  })
  .catch(e => console.error("Error while getting random user data:", e));
  return result;
}



/**
 * Validates a payload for a given object
 * Meant to be called before calling any of server.create(), etc
 * @param payload content to validate
 * @param requiredFields each of the fields that must be present 
 * @param invalidFields each of the fields that must not be present
 * @returns whether the payload is valid or not
 */
export const isValidPayload = (payload: Record<string, unknown>, requiredFields: string[], invalidFields: string[]) : boolean => {
  const keys = Object.keys(payload);
  let validFieldCount = 0;
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(invalidFields.indexOf(key) !== -1)
      return false;
    if(requiredFields.indexOf(key) === -1)
      return false;
    validFieldCount++;
  }
  if(validFieldCount !== requiredFields.length)
    return false;

  return true;
}

/**
 * Validates a payload for a given object
 * Meant to be used to validate incoming HTTP requests in the server
 * @param payload content to validate
 * @param requiredFields each of the fields that must be present
 * @param invalidFields each of the fields that must not be present
 * @returns whether the payload is valid or not
 */
export const getPayloadResponse = (payload: Record<string, unknown>, requiredFields: string[], invalidFields: string[]) : Response | null => {
  const keys = Object.keys(payload);
  let validFieldCount = 0;
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(invalidFields.indexOf(key) !== -1)
      return new Response(400, {ErrorType: "Inclusion"}, {errors: [key]});
    if(requiredFields.indexOf(key) === -1)
      return new Response(400, {ErrorType: "Unnecessary"}, {errors: [key]});
    validFieldCount++;
  }
  if(validFieldCount !== requiredFields.length)
    return new Response(400, {ErrorType: "Exclusion"}, {errors: ["a"]});

  return null;
}