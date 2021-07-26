/**
 * @jest-environment jsdom
 */

import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import makeServer, { AppRegistry } from "../server";
import { visit } from "../utils/test";
import "@testing-library/jest-dom";
import { Server } from "miragejs";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

// Typescript will prevent compilation of any attributes to server.create() as long as the correct AppRegistry is applied
// The only room for failure in relevant scenarios would be in HTTP requests themselves
// In those test cases, `fetch` is used to test for correctness
// Thanks Typescript!

// For every invalid (fetch) test possibility, there are two reasons why that operation can fail
// 1. It missed one or more required fields
// 2. It included one or more invalid fields
// 3. It included one or more unnecessary fields

beforeEach(async () => server = await makeServer("test"));
afterEach(async () => server.shutdown());

describe("Misc", () => {
  it("should display nothing with empty data", async () => {
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
    expect(screen.queryByText("There are no departments matching your selected filters.")).toBeInTheDocument();
  });
});


describe("Department", () => {
  it("should display the department after creating it", async () => {
    server.create("department", {info: {name: "Example Department"}});
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("Example Department")).toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });

  it("should not create a department without a name", async () => {
    await fetch("/api/departments", {method: "POST", body: JSON.stringify({})})
      .then(res => {
        expect(res.status).toEqual(400);
        expect(res.headers.get("ErrorType")).toEqual("Exclusion");
        res.json()
          .then(json => expect(json.errors).toEqual(["name"]));
      });
  });

  it.todo("should not create a department with a supplied id");

  it("should not display the department after deleting it", async () => {
    const department = server.create("department", {info: {name: "Example Department"}});
    department.destroy();
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("There are no departments matching your selected filters.")).toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });

  it("should display the new name after updating it", async () => {
    const department = server.create("department", {info: {name: "Example Department"}});
    department.update("info", {name: "Updated Department"});
    visit("/", true);
    await waitForElementToBeRemoved(screen.queryByText("Loading..."), {timeout: 1500});
    expect(screen.queryByText("Updated Department")).toBeInTheDocument();
    expect(screen.queryByText("Example Department")).not.toBeInTheDocument();
    expect(screen.queryByText("There are no employees matching your selected filters.")).toBeInTheDocument();
  });
});