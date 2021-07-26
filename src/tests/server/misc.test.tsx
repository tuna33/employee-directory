/**
 * @jest-environment jsdom
 */

import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import makeServer, { AppRegistry } from "../../server";
import { visit } from "../../utils/testing";
import "@testing-library/jest-dom";
import { Server } from "miragejs";

// The exact registry has to be shared from server to allow for Intellisense here
let server: Server<AppRegistry>;

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