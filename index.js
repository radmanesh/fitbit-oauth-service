require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors"); // ({origin: true});
const axios = require("axios");
const qs = require("qs");
const config = require("./config.json");
const admin = require('firebase-admin');
const { downloadSensors } = require("./sensorsDownload");
const { cronJobSensors } = require("./sensorsCronJob");
const { getUserByFitbitUserId, checkAndRefreshToken,
  generateAPIEndpointFromDownloadSettings,
  generateAxiosConfigFromDownloadSettings,
  generateAPIEndpointFromCronSettings,
  generateAxiosConfigFromCronSettings,
  getDatesInDateRange,
  printObjectDescription,
} = require("./utils");
const { traverseFetchJobResults } = require("./fhir");

//const serviceAccount = require('./certs/jamasp-gcp-project-55314e729ddb.json');
//const heartData = require("./sample_fetches/fitbit_endpoints/Get Heart Rate Time Series by Date Range.json");
const { testConvertingToBigQyuery, testFindAllFiles } = require('./fhirTest');
const { initializeDataset } = require('./bigQueryTables');

const FITBIT_OAUTH_URL = 'https://api.fitbit.com/oauth2/token';


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
admin.initializeApp();

const db = admin.firestore();
const fitbitBucket = admin.storage().bucket("jamasp-fitbit");

//const bigquery = new BigQuery();

app.use(cors());

// Just testing the multiple data fetches
//initializeDataset("jamasp_fitbit", true);
// testFindAllFiles();
testConvertingToBigQyuery() ;
// fhirTest();
// testIntraday();
//testBreathingRate();

app.get("/getToken", async (req, res) => {
  const baseInfo = Buffer.from(`${config.clientID}:${config.clientSecret}`)
    .toString("base64");
  const code = req.query.code;
  const verifier = req.query.code_verifier;

  if (!(typeof code === "string") || code.length === 0 ||
    !(typeof verifier === "string") || verifier.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    res.status(500).json({
      message: 'The function must be called ' +
        'with two arguments "code" and "code_verifier" containing ' +
        'required data.'
    });
  }

  const data = {
    grant_type: "authorization_code",
    code: code,
    client_id: config.clientID,
    code_verifier: verifier,
  };

  try {
    const info = await axios({
      method: "post",
      url: FITBIT_OAUTH_URL,
      headers: {
        "Authorization": `Basic ${baseInfo}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(data),
    });
    // console.log("Fitbit authentication result :", info.authResult);

    const authResult = {
      access_token: info.data.access_token,
      refresh_token: info.data.refresh_token,
      expires_in: info.data.expires_in,
      user_id: info.data.user_id,
    };
    // console.log("auth result ", authResult);
    res.json(authResult);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data, error.response.status, error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message);
    }
    // console.log(error.config);

    console.error("fetching auth token error. ", error);
    if (Array.isArray(error)) {
      error.each((err) => {
        console.error("error", err);
      });
    }
    res.status(500).json({ error: error });
  }
});

app.get("/refreshToken", async (req, res) => {
  const baseInfo = Buffer.from(`${config.clientID}:${config.clientSecret}`)
    .toString("base64");
  const code = req.query.code;

  if (!(typeof code === "string") || code.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    res.status(500).json({
      message: 'The function must be called ' +
        'with an argument "code" containing required data.'
    });
  }
  const data = {
    grant_type: "refresh_token",
    refresh_token: code,
    client_id: config.clientID
  };

  try {
    const info = await axios({
      method: "post",
      url: FITBIT_OAUTH_URL,
      headers: {
        "Authorization": `Basic ${baseInfo}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(data),
    });
    // console.log("Fitbit authentication result :", info.authResult);

    const authResult = {
      access_token: info.data.access_token,
      refresh_token: info.data.refresh_token,
      expires_in: info.data.expires_in,
      user_id: info.data.user_id,
    };
    // console.log("auth result ", authResult);
    res.json(authResult);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message);
    }
    // console.log(error.config);

    console.error("fetching auth token error. ", error);
    if (Array.isArray(error)) {
      error.each((err) => {
        console.error("error", err);
      });
    }
    res.status(500).json({ error: error });
  }
});

app.get("/getProfiles", async (req, res) => {
  // get all users from firestore
  const snapshot = await db.collection('users').where('fitbitData.access_token', '!=', null).get();
  const users = snapshot.docs.map((doc) => doc.data());
  // console.log("fetchi profiles for users", users.length);
  const results = [];
  // get profile for each user
  for (const user of users) {
    try {
      await checkAndRefreshToken(user.uid, user.fitbitData, db);
      const accessToken = user.fitbitData.access_token;
      const userId = user.fitbitData.user_id;
      const url = `https://api.fitbit.com/1/user/${userId}/profile.json`;
      const info = await axios({
        method: "get",
        url: url,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      //console.log("Fitbit profile result :", info.data);
      results.push({
        userId: userId,
        profile: info.data,
      });
    } catch (error) {
      console.error("fetching profile error. ", error);
      results.push({
        userId: user?.fitbitData?.user_id || null,
        profile: null,
        error: JSON.stringify(error, null, 2)
      });
    }
  }
  res.status(200).json(results);
});

app.get("/fetchData", async (req, res) => {
  try {
    // 1. Get project data
    const projectId = req.query.project_id;
    const snapshot = await db.collection('projects').doc(projectId).get();
    const project = snapshot.data();
    // console.log("data", project);
    if (!project) {
      res.status(404).send('Project not found');
      return;
    }
    // 2. preparing the downloadJob
    const sensorsToDownload = downloadSensors.filter((sensor) => {
      return project.downloadSettings.some((setting) =>
        setting.sensorId === sensor.id && setting.enabled,
      );
    });

    // console.log("sensorsToDownload: %o", sensorsToDownload);

    // 3; Check range download mode
    // Checks whether range download is enabled and properly configured and how we should proceed
    const rangeDownloadMode = (project?.rangeDownloadSettings?.enabled &&
      !!project?.rangeDownloadSettings?.["start-date"] &&
      !!project?.rangeDownloadSettings?.["end-date"]) ? true : false;
    // console.log("rangeDownloadMode: ", rangeDownloadMode);
    // 3.1 Get the dates in the range
    const dates_in_range = getDatesInDateRange(project?.rangeDownloadSettings?.["start-date"], project?.rangeDownloadSettings?.["end-date"]);
    // console.log("dates_in_range: ", dates_in_range);

    // 4. Initialize data structures
    // this object will be used to store data used to export to file
    const unifiedFetchResultsData = {
      projectId: project?.id ? project.id : "null",
      date: new Date(),
      devices: [],
    };
    // this object will be used to store the fetch job history in firestore
    const fetchJobHistory = {
      projectId: project?.id ? project.id : "null",
      status: "running",
      startedAt: admin.firestore.Timestamp.now(),
      downloadSettings: project.downloadSettings,
      devices: [],
      outputFile: null,
    };

    // 5. Create fetch job in firestore
    const fetchJobRef = await db.collection("fetchJobs").add(fetchJobHistory);
    // console.log("fetchJobRef: ", fetchJobRef?.id);
    let downloadPromises;

    // 6. Start the downloadJob
    downloadPromises = project.devices.map(async (device) => {
      try {
        // 6.1 get user by fitbit user id
        let user;
        try {
          user = await getUserByFitbitUserId(device, db);
          console.debug("user.uid : %s , device: %s", user?.uid, device);
          if (!user || !user.uid)
            return Promise.reject("User not found");
        } catch (err) {
          console.error(`Error processing device ${device}: `, err);
          // Handle device specific errors, e.g., by continuing with the next device
          return Promise.reject(`Error processing device ${device} `);
        }

        // 6.2 Prepare device specific data structures and then get user data
        // This is the object that will be used to store data specific to each device and
        // ultimately export the aggregated data to a file
        const unifiedDeviceFetchResultsArray = {};
        // this object is part of the fetchJobHistory object that will be stored in firestore
        const fetchJobHistoryDeviceUnified = {};
        // Preparing result for each enpoint of the device, to be exported to file
        unifiedDeviceFetchResultsArray.deviceId = device;
        unifiedDeviceFetchResultsArray.user_id = user.uid;
        unifiedDeviceFetchResultsArray.participantUid = user?.inviteeUID;
        unifiedDeviceFetchResultsArray.invitationId = user?.invitationId;
        unifiedDeviceFetchResultsArray.endpoints = [];
        // Preparing result for each enpoint inside each device data, to be stored in firestore
        fetchJobHistoryDeviceUnified.deviceId = device;
        fetchJobHistoryDeviceUnified.endpoints = [];
        fetchJobHistoryDeviceUnified.outputFile = null;

        const fitbitData = user.fitbitData;
        let updatedFitbitData;
        try {
          // 6.2.1 Get updated fitbit data and access token
          updatedFitbitData = await checkAndRefreshToken(user.uid, fitbitData, db);
          if (updatedFitbitData?.access_token) {
            fitbitData.access_token = updatedFitbitData.access_token;
          }
        } catch (err) {
          console.error(`Error processing device ${device}: `, err);
          // Handle device specific errors, e.g., by continuing with the next device
          return Promise.reject(`Error processing device ${device} `);
        }

        // this array will be used to store promises for each sensor download
        // let sensorPromises;



        /**
         * Handles the fetching of sensor data from Fitbit API.
         * @param {Object} sensor - The sensor object.
         * @param {boolean} rangeMode - Indicates whether to fetch data within a specific date range.
         * @param {Date} startDate - The start date for fetching data (optional).
         * @param {Date} endDate - The end date for fetching data (optional).
         * @return {Promise<Array>} - A promise that resolves to an array of promises for each sensor in the date.
        */
        async function handleSensorsFetch(sensor, rangeMode = false, startDate = null, endDate = null) {
          // console.log("handleSensorsFetch, sensor: ", sensor?.id);
          // Iterate over the sensors to download in this date
          const dateSensorsPromises = sensorsToDownload.map(async (sensor) => {
            const updatedSettings = project.downloadSettings.find(
              (sd) => sd.sensorId === sensor.id);
            try {
              updatedSettings.arguments["user-id"] = device;
              const endpointUrl = rangeMode ?
                generateAPIEndpointFromDownloadSettings(sensor, updatedSettings, startDate, endDate) :
                generateAPIEndpointFromDownloadSettings(sensor, updatedSettings);
              const axiosConfig = rangeMode ?
                generateAxiosConfigFromDownloadSettings(fitbitData, sensor, updatedSettings, startDate) :
                generateAxiosConfigFromDownloadSettings(fitbitData, sensor, updatedSettings);
              const apiEndpoint = {
                sensor: sensor.label,
                endpointUrl: endpointUrl,
                axiosConfig: axiosConfig,
                projectId: project?.id ? project.id : "null",
                date: new Date(),
                device_id: device,
                sensorId: sensor.id,
                user_id: user.uid,
                participantUid: user?.inviteeUID,
                invitationId: user?.invitationId,
              };

              return fetchDataForSensor(apiEndpoint)
                .then(async (fetchJobResultItem) => {
                  // console.log("fetchJob For sensor: %s  for device: %s", apiEndpoint.sensor, device);
                  // prepare the fetchJobHistoryItem object to be stored in firestore
                  const fetchJobHistoryItem = {
                    endpoint: apiEndpoint.sensor,
                    sensorId: apiEndpoint.sensorId,
                    settings: updatedSettings,
                    status: fetchJobResultItem.response.status,
                    outputFile: null,
                  };
                  // insert the fetchJobHistoryItem into the fetchJobHistoryDeviceUnified object
                  fetchJobHistoryDeviceUnified.endpoints.push(fetchJobHistoryItem);
                  unifiedDeviceFetchResultsArray.endpoints.push(fetchJobResultItem);
                  return Promise.resolve(fetchJobResultItem);
                })
                .catch((err) => {
                  // ... handle the error
                  console.error("Error fetching data from Fitbit: ", err);
                  return Promise.reject(err);
                });
            } catch (deviceError) {
              console.error(`Error processing device ${device}: `, deviceError);
              // Handle device specific errors, e.g., by continuing with the next device
              return Promise.reject(deviceError);
            }
          });
          // return the promises for each sensor in the date
          return dateSensorsPromises;
        }

        // if rangeDownloadMode is enabled we skip the dates of each sensor and we iterate over the dates in the global date range
        // Here we itereate over the dates in the range and fetch the data for each day (maybe later chunk of the range),
        // if rangeDownloadMode is disabled dates_in_range will have only one date that ws set to today and ignore it.

        // 6.4 Iterate over the dates in the range
        for (const date of dates_in_range) {
          // console.log("date: ", date);
          const sensorPromises = handleSensorsFetch(sensorsToDownload, rangeDownloadMode, date, date);

          // 6.5 Wait for all sensor promises to resolve
          await Promise.allSettled(sensorPromises);

        }

        // 6.6 Create and prepare unifiedDeviceFetchResultsArray and fetchJobHistoryDeviceUnified
        unifiedFetchResultsData.devices.push(unifiedDeviceFetchResultsArray);
        fetchJobHistory.devices.push(fetchJobHistoryDeviceUnified);
      } catch (err) {
        console.error("We should'nt be here", err);
      }
    });

    // 7. Wait for all device promises to resolve
    await Promise.allSettled(downloadPromises);

    // 8. Export unifiedFetchResultsData to file
    // here we should export the unifiedFetchResultsArray to storage
    try {
      const filePath = `${project.id}/${fetchJobRef.id}/` +
        `all_unified_${new Date().toISOString().slice(0, 10)}.json`;
      await exportDataToStorage(filePath, unifiedFetchResultsData).then(() => {
        fetchJobHistory.outputFile = filePath;
        fetchJobHistory.status = "done";
        console.debug("fetchJobHistory updated", { "devices": fetchJobHistory?.devices, "outputFile": fetchJobHistory?.outputFile });
        fetchJobRef.update(fetchJobHistory).then(() => {
          // console.log("fetchJobHistory updated");
        }).catch((err) => {
          console.error("Error updating fetchJobHistory: ", err);
        });
      }).catch((err) => {
        console.error("Error exporting unifiedFetchResultsArray to file: ", err);
      });
    } catch (err) {
      console.error("Error exporting unifiedFetchResultsArray to file: ", err);
    }

    // 9. Update project and download history
    // this object will be used to store the fetch job history for projects in firestore
    const fetchJobHistoryProject = {
      projectId: project?.id ? project.id : "null",
      status: "done",
      startedAt: fetchJobHistory.startedAt,
      fetchJobHistoryId: fetchJobRef.id,
      outputFile: fetchJobHistory.outputFile,
    };
    await db.collection("projects").doc(project.id).update({
      "runDownloadJob": "done",
      "downloadHistory": admin.firestore.FieldValue.arrayUnion(fetchJobHistoryProject),
    });
    // 10. Return fetch job history
    res.status(200).json(fetchJobHistory);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get("/fetchCronData", async (req, res) => {
  try {
    const projectId = req.query.project_id;
    const snapshot = await db.collection('projects').doc(projectId).get();
    if (!snapshot.exists) {
      res.status(404).send('Project not found');
      return;
    }

    const project = snapshot.data();
    // console.log("project.cronSettings: ", project?.cronSettings);
    // preparing the downloadJob
    const cronSensorsToDownload = cronJobSensors.filter((sensor) => {
      return project.cronSettings.some((setting) =>
        setting.sensorId === sensor.id && setting.enabled,
      );
    });
    // console.log("cronSensorsToDownload: ", cronSensorsToDownload);
    if (!cronSensorsToDownload || cronSensorsToDownload.length === 0) {
      res.status(404).send('No sensors to download');
      return;
    }
    //)
    // this object will be used to store data used to export to file
    const unifiedFetchResultsData = {
      projectId: project?.id ? project.id : "null",
      date: new Date(),
      devices: [],
    };
    // this object will be used to store the fetch job history in firestore
    const cronJobHistory = {
      projectId: project?.id ? project.id : "null",
      status: "running",
      type: "cron",
      startedAt: admin.firestore.Timestamp.now(),
      downloadSettings: project.cronSettings,
      devices: [],
      outputFile: null,
    };
    // Adding the cron job to the fetchCronJobs collection
    const cronFetchJobRef = await db.collection("fetchCronJobs").add(cronJobHistory);
    // console.log("cronFetchJobRef: ", cronFetchJobRef?.id);

    // Start the downloadJob
    let downloadPromises;
    downloadPromises = project.devices.map(async (device) => {
      // get user by fitbit user id
      let user;
      // this array will be used to store data specific to each device and export it to file
      const unifiedDeviceFetchResultsArray = {};
      // this object is part of the fetchJobHistory object that will be stored in firestore
      const cronJobHistoryDeviceUnified = {};
      let sensorPromises;
      try {
        user = await getUserByFitbitUserId(device, db);
        console.debug("user.uid : %s , device: %s", user?.uid, device);
        unifiedDeviceFetchResultsArray.deviceId = device;
        unifiedDeviceFetchResultsArray.user_id = user.uid;
        unifiedDeviceFetchResultsArray.participantUid = user?.inviteeUID;
        unifiedDeviceFetchResultsArray.invitationId = user?.invitationId;
        unifiedDeviceFetchResultsArray.endpoints = [];
        cronJobHistoryDeviceUnified.deviceId = device;
        cronJobHistoryDeviceUnified.endpoints = [];
        cronJobHistoryDeviceUnified.outputFile = null;
        const fitbitData = user.fitbitData;
        const updatedFitbitData = await checkAndRefreshToken(user.uid, fitbitData, db);
        // console.log("Updated Fitbit data: ", updatedFitbitData);
        if (updatedFitbitData?.access_token) {
          fitbitData.access_token = updatedFitbitData.access_token;
        }
        const accessToken = fitbitData.access_token;
        // console.log("access token : %o", accessToken);
        // log("sensorsToDownload: %o", sensorsToDownload);

        // Collect promises for each sensor download
        sensorPromises = cronSensorsToDownload.map(async (sensor) => {
          const updatedSettings = project.cronSettings.find(
            (sd) => sd.sensorId === sensor.id);
          updatedSettings.arguments["user-id"] = device;
          const apiEndpoint = {
            sensor: sensor.label,
            endpointUrl: generateAPIEndpointFromCronSettings(sensor, updatedSettings),
            axiosConfig: generateAxiosConfigFromCronSettings(fitbitData, updatedSettings),
            projectId: project?.id ? project.id : "null",
            date: new Date(),
            device_id: device,
            sensorId: sensor.id,
            user_id: user.uid,
            participantUid: user?.inviteeUID,
            invitationId: user?.invitationId,
          };
          // debug("apiEndpoint: ", apiEndpoint);
          return fetchDataForSensor(apiEndpoint)
            .then(async (cronJobResultItem) => {
              console.debug("fetchJob For sensor: %s  for device: %s , result: %o", apiEndpoint.sensor, device, cronJobResultItem?.status);
              // ... process the successful result
              // Return a promise from the exportDataToStorage function
              //const filePath = generateDownloadFileName(fetchJobRef.id, apiEndpoint);
              //fetchJobResultItem.response.outputFile = filePath;
              const cronFetchJobHistoryItem = {
                endpoint: apiEndpoint.sensor,
                sensorId: apiEndpoint.sensorId,
                settings: updatedSettings,
                status: cronJobResultItem.response.status,
                outputFile: null,
              };
              // await exportDataToStorage(filePath, fetchJobResultItem).then(() => {
              //   fetchJobHistoryItem.outputFile = filePath;
              // }).catch((err) => {
              //   console.error("Error exporting data to storage: ", err);
              //   fetchJobHistoryItem.outputFile = null;
              //   fetchJobHistoryItem.error = err?.message || "Unknown error";
              // });
              cronJobHistoryDeviceUnified.endpoints.push(cronFetchJobHistoryItem);
              unifiedDeviceFetchResultsArray.endpoints.push(cronJobResultItem);
              return Promise.resolve(cronJobResultItem);
            })
            .catch((err) => {
              // ... handle the error
              console.error("Error fetching data from Fitbit: ", err);
              return Promise.reject(err);
            });
        });
      } catch (deviceError) {
        console.error(`Error processing device ${device}: `, deviceError);
        // Handle device specific errors, e.g., by continuing with the next device
      }
      // Use Promise.all to wait for all sensor promises to resolve
      await Promise.allSettled(sensorPromises);

      // creating unifiedDeviceFetchResultsArray to be added to the final output file
      try {
        unifiedFetchResultsData.devices.push(unifiedDeviceFetchResultsArray);
        cronJobHistory.devices.push(cronJobHistoryDeviceUnified);
      } catch (err) {
        console.error("Error exporting unifiedFetchResultsData to file: ", err);
      }
    });


    // Use Promise.all to wait for all device promises to resolve
    await Promise.allSettled(downloadPromises);
    // here we should export the unifiedFetchResultsArray to storage
    try {
      const filePath = `${project.id}/${cronFetchJobRef.id}/` +
        `all_unified_${new Date().toISOString().slice(0, 10)}.json`;
      await exportDataToStorage(filePath, unifiedFetchResultsData).then(() => {
        cronJobHistory.outputFile = filePath;
        cronJobHistory.status = "done";
        console.debug("cronJobHistory updated", cronJobHistory);
        cronFetchJobRef.update(cronJobHistory).then(() => {
          // console.log("cronJobHistory updated");
        }).catch((err) => {
          console.error("Error updating cronJobHistory: ", err);
        });
      }).catch((err) => {
        console.error("Error exporting unifiedFetchResultsArray to file: ", err);
      });
    } catch (err) {
      console.error("Error exporting unifiedFetchResultsArray to file: ", err);
    }

    // Then return a promise of a set operation to update the project and download history
    // this object will be used to store the fetch job history for projects in firestore
    const cronJobHistoryProject = {
      projectId: project?.id ? project.id : "null",
      status: "done",
      type: "cron",
      startedAt: cronJobHistory.startedAt,
      cronJobHistoryId: cronFetchJobRef.id,
      outputFile: cronJobHistory.outputFile,
    };
    await db.collection("projects").doc(project.id).update({
      "runCronJob": "done",
      "downloadHistory": admin.firestore.FieldValue.arrayUnion(cronJobHistoryProject),
      "cronJobHistory": admin.firestore.FieldValue.arrayUnion(cronJobHistoryProject),
    });
    res.status(200).json(cronJobHistory);

  } catch (err) {
    console.error("Error fetching data: ", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/fetchSensorData", async (req, res) => {
  const sensorId = req.query.sensor_id;
  const apiurl = req.query.api_url;
  const apikey = req.query.api_key;
  const parameters = req.query.parameters;
  // console.log(sensorId, apiurl, apikey, parameters);
  if (!sensorId || !apiurl || !apikey) {
    res.status(400).send("Missing parameters");
    return;
  }
  if (parameters?.length > 0) {
    const params = parameters.split(",");
    // console.log("params: ", params);
  }

  const config = {
    method: "get",
    url: apiurl,
    headers: {
      "Authorization": `Bearer ${fitbitData.access_token}`,
      "Content-Type": "application/json",
    },
  };
  axios(config).get(apiurl).then((response) => {
    // console.log(JSON.stringify(response.data));
  }).catch((error) => {
    console.error(error);
  });


});

app.get("/convertDataToFHIR", async (req, res) => {
  const filePath = req.query.file_path;
  fitbitBucket.file(filePath).download().then((data) => {
    // console.log("data: ", data);

    res.status(200).json(data);
  }).catch((err) => {
    console.error("Error downloading file: ", err);
    res.status(500).send("Error downloading file");
  });
});

app.get("/convertFileToFHIR", async (req, res) => {
  const filePath = req.query.file_path;
  try {
    const filesExists = await fitbitBucket.file(filePath).exists();
    if (!filesExists) {
      res.status(404).send("File not found");
      return;
    }
    const data = await fitbitBucket.file(filePath).download();
    // console.log("data: ", data);
    if (!data || !data[0] || data.length < 1) {
      res.status(405).send("No data found in file");
      return;
    }
    const fhirData = await traverseFetchJobResults(data);
    res.status(200).json(fhirData);

  } catch (err) {

  }

});

/**
 * Return a promise that resolves with the fetch result or rejects with an error
 *
 * @param {object} apiEndpoint - The endpoint configuration object
 * @return {Promise<object>} A promise that resolves with the fetch result or rejects with an error object
 */
async function fetchDataForSensor(apiEndpoint) {
  // console.log("fetchDataForSensor, apiEndpoint: ", apiEndpoint.endpointUrl);
  // Return a promise that resolves with the fetch result or rejects with an error
  const axiosConfig = {
    method: "get",
    url: apiEndpoint.endpointUrl,
    headers: apiEndpoint.axiosConfig.headers,
  }
  if (!!apiEndpoint.axiosConfig?.params && apiEndpoint.axiosConfig?.params?.length > 0)
    apiEndpoint.axiosConfig?.params?.map((key, value) => {
      axiosConfig.params[key] = value;
    });
  //console.log("axiosConfig", axiosConfig);
  try {
    const apiResponse = await axios(axiosConfig);
    // console.log("apiResponse", apiResponse?.status, apiResponse?.data?.message);
    const axiosResponse =
      (apiResponse?.status === 200) ?
        apiResponse?.data : apiResponse?.data?.message;
    return {
      request: {
        device_id: apiEndpoint.device_id,
        endpointUrl: apiEndpoint.endpointUrl,
        axiosConfig: apiEndpoint.axiosConfig,
        project_id: apiEndpoint.projectId,
        date: apiEndpoint.date,
        sensor: apiEndpoint.sensor,
        jamaspUserId: apiEndpoint.jamaspUserId,
        participantUid: apiEndpoint.participantUid,
        invitationId: apiEndpoint.invitationId,
      },
      response: {
        status: apiResponse.status,
        data: axiosResponse,
        outputFile: null,
      },
    };
  } catch (err) {
    console.error("Error fetching data for sensor: ", err);
    return {
      request: {
        device_id: apiEndpoint?.device_id,
        endpointUrl: apiEndpoint?.endpointUrl,
        axiosConfig: apiEndpoint?.axiosConfig,
        project_id: apiEndpoint?.projectId,
        date: apiEndpoint?.date,
        sensor: apiEndpoint?.sensor,
        jamaspUserId: apiEndpoint.jamaspUserId,
        participantUid: apiEndpoint.participantUid,
        invitationId: apiEndpoint.invitationId,
      },
      response: {
        status: 500,
        error: err?.message || "Unknown error",
        outputFile: null,
      },
    };
  }
}

/**
 * Uploads data to storage.
 *
 * @param {string} filePath - The path of the file in storage.
 * @param {string} data - The data to be uploaded.
 * @return {Promise<void>} - A promise that resolves when upload is completed.
 *    or rejects if an error occurs.
 */
const exportDataToStorage = async (filePath, data) => {
  try {
    await generateFoldersNeededForFilePath(filePath).then(() => {
      return;
    });

    const uploadedFile = fitbitBucket.file(filePath);
    await uploadedFile.save(JSON.stringify(data, null, 2), {
      metadata: {
        contentType: "application/json", // Set content type as JSON
      },
    },
    );
    // console.log(`File ${uploadedFile?.name} uploaded with name ${filePath} to bucket : ${fitbitBucket.name}`);

    // console.debug(`File has ${JSON.stringify(uploadedFile)}`);
    return Promise.resolve();
  } catch (err) {
    console.error("Eror uploading file to storage: ", err);
    return Promise.reject(err);
  }
};

const generateFoldersNeededForFilePath = async (filePath) => {
  try {
    if (!filePath || filePath.length < 2) {
      console.error("Invalid file path", filePath);
      return Promise.reject(
        new Error("invalid-argument Invalid file path"));
    }
    const placeholderFile = filePath.substring(0, filePath.lastIndexOf("/") + 1)
      .concat("placeholder.txt");
    // Check if placeholder file exists
    const [exists] = await fitbitBucket.file(placeholderFile).exists();
    if (!exists) {
      // console.log("Placeholder file does not exist. Creating folders. exists: ", exists);
      // Create a placeholder file to make the folder visible
      await fitbitBucket.file(placeholderFile).save("Placeholder", {
        metadata: { contentType: "text/plain" },
      });
    }
    return Promise.resolve();
  } catch (err) {
    console.error("Error generating folders: ", err);
    return Promise.reject(err);
  }
};

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  // console.log(`Server started at port ${port}`);
});

exports.db = db;
exports.admin = admin;
exports.fitbitBucket = fitbitBucket;
//exports.bigquery = bigquery;
