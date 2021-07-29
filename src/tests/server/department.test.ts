/**
 * @jest-environment jsdom
 */

import makeServer, { AppRegistry } from "../../server";
import "@testing-library/jest-dom";
import { Server } from "miragejs";
import { departmentInfoInstance } from "../../utils/validation";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

beforeEach(async () => server = await makeServer("test"));
afterEach(async () => server.shutdown());

// For checking all required fields are being enforced
const requiredFields = Object.keys(departmentInfoInstance);
const requiredFieldsString = requiredFields.reduce((a, b) => `${a}, ${b}`, "").substring(2);

describe("Department", () => {
  
  /// GET => fetching data

  it("should get existing departments", async () => {
    const departments = [
      // We can take advantage of Mirage's factories here
      server.create("department"),
      server.create("department"),
      server.create("department"),
    ];
    await fetch("/api/departments/", {method: "GET"})
      .then(res => {
        expect(res.status === 200)
        res.json()
        .then(json => {
          for(let i = 0; i < departments.length; i++) {
            expect(json.departments[i].info).toEqual(departments[i].info);
            expect(json.departments[i].id).toEqual(departments[i].id);
          }
        });
      });
  });

  it.todo("should get a valid department");
  it.todo("should not get an invalid department");

  /// POST => creating data
  
  it("should create a valid department", async () => {
    await fetch("/api/departments/", {method: "POST", body: JSON.stringify(departmentInfoInstance)})
      .then(res => {
        expect(res.status).toEqual(201);
        res.json()
        .then(json => {
          expect(json.department.info).toEqual(departmentInfoInstance);
          expect(json.department.id).toEqual("1");
        });
      });
    
  });
  
  it(`should not create a department without: ${requiredFieldsString}`, async () => {
    await fetch("/api/departments", {method: "POST", body: JSON.stringify({})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Exclusion");
        res.json()
          .then(json => expect(json.errors).toEqual(requiredFields));
      });
  });

  /// DELETE => deleting data
  
  it("should delete a valid department", async () => {
    const department = server.create("department");
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "DELETE"})
      .then(res => {
        expect(res.status).toEqual(200);
        res.json()
          .then(json => {
            expect(json.department.info).toEqual(department.info);
            expect(json.department.id).toEqual(department.id);
          });
      });
  });

  it("should not delete an invalid department", async () => {
    await fetch("/api/departments/1", {method: "DELETE"})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Invalid");
        res.json()
          .then(json => expect(json.errors).toEqual(["id"]));
      });
  });

  /// PUT => updating data

  it("should update a valid department's info to valid info", async () => {
    const department = server.create("department", {info: departmentInfoInstance});
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({name: "Updated Department"})})
      .then(res => {
        expect(res.status).toEqual(200);
        res.json()
          .then(json => {
            expect(json.department.info).toEqual({...departmentInfoInstance, name: "Updated Department"});
            expect(json.department.id).toEqual(department.id);
          });
      });
  });

  it("should not update an invalid department", async () => {
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({name: "Updated Department"})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Invalid");
        res.json()
          .then(json => expect(json.errors).toEqual(["id"]));
      });
  });
  
  it(`should not update an department without: ${requiredFieldsString}`, async () => {
    const department = server.create("department", {info: departmentInfoInstance});
    expect(department.id).toEqual("1");
    await fetch("/api/departments/1", {method: "PUT", body: JSON.stringify({})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Exclusion");
        res.json()
          .then(json => expect(json.errors).toEqual(requiredFields));
      });
  });
});