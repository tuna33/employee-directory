import { belongsTo, createServer, Factory, hasMany, Model, Registry, RestSerializer, Server, Response } from "miragejs";
import { EmployeeInfo } from "./types";
import { getPayloadResponse, getRandomEmployeesInfo } from "./utils/data";

/**
 * The server is a mock representation through MirageJS of an actual backend
 * In a development setting, it will generate fake data and process requests accordingly
 * In a production setting, it will do nothing - the "real" API should handle those calls
 */

/**
 * Used for representing our objects in Mirage's DB
 * An employee belongs to a department (1-1)
 * A department has many employees (1-Many)
 */
const models = {
  employee: Model.extend({
    department: belongsTo(),
  }),
  department: Model.extend({
    employees: hasMany(),
  }),
};

/**
 * Used for mirage to know how to create specific models
 * Note: these are 1-1 representations of their interfaces without the database-related fields
 * Have to be updated manually to match that constraint, tedious but error-prone in the long run
 */
const factories = {
  employee: Factory.extend({
    info: {
      firstName: "Unassigned",
      lastName: "Employee",
      pictureUrl: "",
      title: "",
    } as EmployeeInfo,
  }),
  department: Factory.extend({
    info: {
      name: "Unassigned department",
    },
  }),
};

/**
 * Used to serialize specific models
 * Have requests that include employees also include departments separately
 */
const serializers = {
  employee: RestSerializer.extend({
    include: ["department"],
    embed: false,
    keyForForeignKey(relationshipName) {
      return relationshipName + "Id";
    }
  }),
};

/**
 * Keep track of the "configuration" of this server (the Registry)
 * This is important as it needs to be passed over to whoever needs to use the functionality (for Intellisense)
 */
export type AppRegistry = Registry<typeof models, typeof factories>;
let server: Server<AppRegistry>;

/**
 * Creates a MirageJS server
 * If the environment is 'test', then there is no seeding of data
 * If the environment is 'development', then there is seeding of data
 * @params environment environment to run the server in
 * @returns A Promise to the server
 */
export default async (environment = "development") : Promise<Server> => {
  const randomEmployeeCount = Math.floor(Math.random() * 100) + 1;
  await getRandomEmployeesInfo(randomEmployeeCount).then(employeesInfo => {
    server = createServer({
      environment,
      serializers,
      models,
      factories,

      /**
       * Populate a server with initial data
       * @param server the server to apply the seeds on
       */
      seeds(server) {
        const departments = [
          server.create("department", {info: {name: "Engineering"}}),
          server.create("department", {info: {name: "Management"}}),
          server.create("department", {info: {name: "Human Resources"}}),
        ];
        employeesInfo.forEach(info => {
          const randomDepartmentIdx = Math.floor(Math.random() * departments.length);
          const newEmployee = {
            info: info,
            department: departments[randomDepartmentIdx],
          };
          server.create("employee", newEmployee);
        });
      },

      /**
       * Process requests according to their route (url)
       */
      routes() {
        /**
         * Process all the requests from the api namespace
         */
        this.namespace = "api";

        /**
         * Get all employees
         */
        this.get("/employees", (schema) => {
          return schema.all("employee");
        });

        /**
         * Create an employee
         */
        this.post("/employees", (schema, request) => {
          const attrs = JSON.parse(request.requestBody);
          // TODO: validate
          return schema.create("employee", attrs);
        });

        /**
         * Delete an employee by id
         */
        this.delete("/employees/:id", (schema, request) => {
          // TODO: validate
          const id = request.params.id;
          const employee = schema.find("employee", id);
          if(!employee)
            return {};
          employee.destroy();
          return employee;
        });

        /**
         * Get all of a department's employees
         */
        this.get("/departments/:id/employees", (schema, request) => {
          // TODO: validate
          const departmentId = request.params.id;
          const department = schema.find("department", departmentId);
          if(!department)
            return [];
          return department.employees;
        });

        /**
         * Get all departments
         */
        this.get("/departments", (schema) => {
          return schema.all("department");
        });

        /**
         * Create a department
         * Note: only the info object's body should be in the request's body
         */
        this.post("/departments", (schema, request) => {
          const requiredFields = ["name"];
          const body = request.requestBody;
          if(body === null)
            return new Response(400, {ErrorType: "Exclusion"}, {errors: requiredFields});
          
          const payload = JSON.parse(body);
          const response = getPayloadResponse(payload, requiredFields);
          if(response !== null)
            return response;

          // Payload is valid, so deliver it
          return schema.create("department", {info: payload});
        });

        /**
         * Delete a department
         */
        this.delete("/departments/:id", (schema, request) => {
          const id = request.params.id;
          const department = schema.find("department", id);
          if(!department)
            return new Response(400, {ErrorType: "Invalid"}, {errors: ["id"]});
          department.destroy();
          return department;
        });

        /**
         * Update a department
         * Note: only the info object's body should be in the request's body
         */
        this.put("/departments/:id", (schema, request) => {
          const id = request.params.id;
          const requiredFields = ["name"];
          const body = request.requestBody;
          if(body === null)
            return new Response(400, {ErrorType: "Exclusion"}, {errors: requiredFields});
          
          const payload = JSON.parse(body);
          const response = getPayloadResponse(payload, requiredFields);
          if(response !== null)
            return response;
          
          const department = schema.find("department", id);
          if(!department)
            return new Response(400, {ErrorType: "Invalid"}, {errors: ["id"]});
          
          // Payload is valid, so update
          department.update("info", payload);
          return department;
        });
      },
    });
  }).catch(e => console.error("Error when starting mock server:", e));
  return server;
}