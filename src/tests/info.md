# Tests

## Folder Structure

- `tests/server`: these are tests that test only that communication with the (mock) server behaves as expected

There may be more folders in the future for other categories of tests (i.e specific React elements, etc). More likely than not, it is outside of the scope of this iteration.

## Information

Typescript will prevent compilation of any attributes to server.create()/etc as long as the correct AppRegistry is applied
Those calls are performed only on the (mock) server itself and (potentially) on this test suite
They are type checked with the exception of an empty object ({}) which would create the respective object through its factory default values
For that reason, it only really makes sense to check the HTTP requests themselves (either through the testbench or `fetch` directly)
The mock (and real) server should validate the input they receive first before calling server.create()/etc

For every invalid (fetch) test possibility, there are two reasons why that operation can fail

1. It missed one or more required fields
2. It included one or more invalid fields
3. It included one or more unnecessary fields
