const { endpoints_data } = require("./fhirTest");

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

const endpoint = endpoints_data[1];
//console.log("endpoint: ", endpoint);

