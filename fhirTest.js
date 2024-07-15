// Filename: fhirTest.js

const { convertEndpointDataToFHIR, traverseFetchJobResults } = require("./fhir");
const fs = require("fs");
const { printObjectDescription, flattenToString, formatDate, sizeOf } = require("./utils");
//const { insertIntoBigQuery } = require("./bigqueryUtils");
const path = require('path');
const { assertAndPrepareStreamTablesDataForCompilanceWithDataset } = require("./bigQueryTables");

const endpoints_data = [
  {
    endpoint: "Get Heart Rate Time Series by Date Range",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Heart Rate Time Series by Date Range.json"
      )
    ),
  },
  {
    endpoint: "Get Heart Rate Intraday by Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Heart Rate Intraday by Date.json"
      )
    ),
  },
  {
    endpoint: "Badges",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/Get Badges.json")
    ),
  },
  {
    endpoint: "Sleep Log by Date Range",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Sleep Log by Date Range.json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of steps by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of steps by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of activityCalories by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of activityCalories by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of distance by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of distance by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of elevation by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of elevation by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of floors by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of floors by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of minutesSedentary by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesSedentary by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of minutesLightlyActive by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesLightlyActive by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of minutesFairlyActive by Date Range (no Intraday)",
    data: JSON.parse(fs.readFileSync("./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesFairlyActive by Date Range (no Intraday).json"))
  },
  {
    endpoint: "Get Activity Time Series of minutesVeryActive by Date Range (no Intraday)",
    data: JSON.parse(fs.readFileSync("./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesVeryActive by Date Range (no Intraday).json"))
  },
  {
    endpoint: "Get Breathing Rate Summary by Interval",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Breathing Rate Summary by Interval (30 days).json"
      )
    ),
  },
  {
    endpoint: "Breathing Rate Intraday",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Breathing Rate Intraday.json"
      )
    ),
  },
  {
    endpoint: "Get Daily Activity Summary",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Daily Activity Summary.json"
      )
    ),
  },
  {
    endpoint: "Get AZM Time Series by Date (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/GET AZM Time Series by Date (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "AZM Intraday",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/AZM Intraday.json")
    ),
  },
  {
    endpoint: "Activity Calories Time Series Intraday By Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Calories Time Series Intraday By Date.json"
      )
    ),
  },
  {
    endpoint: "Activity Steps Time Series Intraday By Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Steps Time Series Intraday By Date.json"
      )
    ),
  },
  {
    endpoint: "Activity Distance Time Series Intraday By Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Distance Time Series Intraday By Date.json"
      )
    ),
  },
  {
    endpoint: "Activity Floors Time Series Intraday By Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Floors Time Series Intraday By Date.json"
      )
    ),
  },
  {
    endpoint: "Activity Elevation Time Series Intraday By Date",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Elevation Time Series Intraday By Date.json"
      )
    ),
  },
  {
    endpoint: "Get Activity Log List",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Activity Log List.json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of calories  by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of activityCalories by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of steps by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of steps by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of distance by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of distance by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Get Activity Time Series of floors by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of floors by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of elevation by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of elevation by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of minutesSedentary by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesSedentary by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of minutesLightlyActive by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesLightlyActive by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of minutesFairlyActive by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesFairlyActive by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint:
      "Get Activity Time Series of minutesVeryActive by Date Range (no Intraday)",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get Activity Time Series of minutesVeryActive by Date Range (no Intraday).json"
      )
    ),
  },
  {
    endpoint: "Devices",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/Get Devices.json")
    ),
  },
  {
    endpoint: 'Get HRV Summary by Interval',
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Get HRV Summary by Interval.json"
      )
    ),
  },
  {
    endpoint: "HRV Intraday",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/HRV Intraday.json")
    ),
  },
  {
    endpoint: "Profile",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/Profile.json")
    ),
  },
  {
    endpoint: "Sleep Log List",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/Sleep Log List.json")
    ),
  },
  {
    endpoint: "SpO2 Summary Interval",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/SpO2 Summary Interval.json"
      )
    ),
  },
  {
    endpoint: "SpO2 Intraday",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/SpO2 Intraday.json")
    ),
  },
  {
    endpoint: "VO2 Max Summary",
    data: JSON.parse(
      fs.readFileSync("./sample_fetches/fitbit_endpoints/VO2 Max Summary.json")
    ),
  },
  {
    endpoint: "Temperature (Skin) Summary",
    data: JSON.parse(
      fs.readFileSync(
        "./sample_fetches/fitbit_endpoints/Temperature (Skin) Summary.json"
      )
    ),
  },
];

function fhirTest() {
  // Implementation of the fhirTest function goes here
  for (var item of endpoints_data) {
    //console.log(item.endpoint, item.data);
    const fhirResult = convertEndpointDataToFHIR(item.endpoint, item.data, "user_id" + Math.random().toString(36).substring(7), "");
    // console.log("fhirResult", flattenToString(fhirResult));

    // i want to save the fhirResult to a File
    if (fhirResult == null || fhirResult == undefined || Object.keys(fhirResult)?.length <= 0) {
      console.error('FHIR Result is empty or not an object. : %s', fhirResult);
      continue;
    } else {
      // console.log('FHIR Result is not empty. : %s', fhirResult);
      // Save converted data to file
      const filePath = path.join(__dirname, 'sample_fetches', 'fitbit_endpoints', `${item.endpoint}.out.json`);
      fs.writeFileSync(filePath, JSON.stringify(fhirResult, null, 2));

      //Check if data is in compilance with table schema
      const res = assertAndPrepareStreamTablesDataForCompilanceWithDataset(fhirResult);
      console.log("assertAndPrepareStreamTablesDataForCompilanceWithDataset , res: ", res);

      // console.log("res", res);
      // console.log("res", flattenToString(res));

      // Save converted data to FHIR server
      // prepareAndInsertData(fhirResult, item)
      //insertIntoBigQuery(normalizeData(result), "user_id", "participantUid", "table_id", "sensor");
      // insertIntoBigQuery(fhirResult, "user_id", "participantUid", "table_id", item.edpoint)
      //console.log(printObjectDescription(fhirResult));
      //console.log(flattenToString(fhirResult));
    }
  }
}

function testIntraday() {
  const stepsEnd = endpoints_data.find((item) => item.endpoint === "Activity Steps Time Series Intraday By Date");
  const stepsOut = convertEndpointDataToFHIR(stepsEnd.endpoint, stepsEnd.data, "user_id" + Math.random().toString(36).substring(7), "");
  const floorsEnd = endpoints_data.find((item) => item.endpoint === "Activity Floors Time Series Intraday By Date");
  const floorsOut = convertEndpointDataToFHIR(floorsEnd.endpoint, floorsEnd.data, "user_id" + Math.random().toString(36).substring(7), "");
  // console.log("steps: ", stepsOut);
  // console.log("floors: ", floorsOut);
}

function prepareAndInsertDataIntoBigQuery(fhirData, item) {
  // after converting the data to FHIR, we traverse the data and insert it into BigQuery
  for (let key in fhirData) {
    // console.log('key : %s, fhirData[key] : %sß', key, String.value(fhirData[key]).truncate * (10, 2));
    const table_id = key;
    const table_data = fhirData[key];

    // console.log('Data converted to BigQuery Table Format : %s', table_id);
    //console.log(JSON.stringify(table_data, null, 2));

    // Save converted data to FHIR server
    // insertIntoBigQuery(table_data, "uuu" + Math.random().toString(36).substring(7), "", table_id, "").then((result) => {
    //   // console.log('Data saved to BigQuery: %s', printObjectDescription(result));
    // }).catch((err) => {
    //   // console.log('Error in saving data to BigQuery', err);
    // });
  }
}

/**
 * Traverse all files in the given directory, combines them, and passes them to traverseFetchJobResults
 * @returns void
 */
function testConvertingToBigQyuery() {

  const dataFiles = findAllJsonFilesInDirectory('./sample_fetches/jamasp_fetch_files/zl11ABiZnYjxpFddMhaD/');
  const combined_data = {};
  for(var f of dataFiles){
    var d = fs.readFileSync(f);
    d = JSON.parse(d);
    const { projectId, date, devices } = d;
    combined_data['projectId'] = projectId;
    combined_data['date'] = date;
    !!combined_data['devices'] ? combined_data['devices'].push(devices) : combined_data['devices'] = devices;
  }

  let results = [];
  traverseFetchJobResults(d).then((result) => {
    console.log("inserting data to BigQuery, result: ", sizeOf(result));
    results.push({result});
  }).catch((err) => {
    console.log('Error in saving data to BigQuery', err);
    results.push({errorMessage: err?.message});
  });
}


function findAllJsonFilesInDirectory(directoryPath) {
  let files = [];

  function traverseDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (let item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        traverseDirectory(itemPath);
      } else if (item.endsWith('.json')) {
        files.push(itemPath);
      }
    }
  }

  traverseDirectory(directoryPath);
  return files;
}

function testFindAllFiles() {
  const files = findAllJsonFilesInDirectory('./sample_fetches/jamasp_fetch_files/zl11ABiZnYjxpFddMhaD/');
  console.log('files', files);
}


exports.fhirTest = fhirTest;
exports.endpoints_data = endpoints_data;
exports.testIntraday = testIntraday;
exports.testConvertingToBigQyuery = testConvertingToBigQyuery;
exports.prepareAndInsertData = prepareAndInsertDataIntoBigQuery;
exports.testFindAllFiles = testFindAllFiles;
