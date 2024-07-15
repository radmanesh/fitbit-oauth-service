// Description: This file contains the functions to convert the Fitbit data to FHIR format.const { logger } = require('./logger');
const { formatDate, flattenToString, printObjectDescription } = require('./utils');
const { datasetId, initializeDataset, intraday_enpoints_tables_map, activities_endpoints_tables_map } = require('./bigQueryTables');
const path = require('path');
const fs = require('fs');
//const { BigQuery } = require('@google-cloud/bigquery');

//const bigquery = new BigQuery();

/**
 * Traverses and fetches job results from the provided data.
 * @param {Object} data - The data object containing projectId, date, and devices.
 */
exports.traverseFetchJobResults = async (data) => {
  //await initializeDataset(datasetId, true);
  const { projectId, date, devices } = data;
  /**
   * Merged result object.
   * @type {Object} { table_name<String>: tableData<Array> , table_name2<String>: tableData2<Array> , ... },
   */
  const combined_bq_data = {};
  if (!!devices && devices.length > 0) {
    // Let's be sure bigquery is initialized
    devices.forEach((device) => {
      const { deviceId, user_id, participantUid, endpoints } = device;
      // console.log('device : %s , user_id : %s , participantUid : %s , endpoints.length : %s', deviceId, user_id, participantUid, endpoints?.length);
      if (!!endpoints && endpoints.length > 0) {
        endpoints.forEach(async (endpoint) => {
          try {
            const { sensor, endpointUrl } = endpoint?.request;
            const { status, data } = endpoint?.response;
            //console.log('sensor : %s , endpointUrl : %s , status : %s , data length: %s', sensor, endpointUrl, status, printObjectDescription(data));
            //console.debug("data :", data);
            if (status !== 200) { // Error in fetching data from endpoint
              console.log("The endpoint %s returned status %s", sensor, status);
            } else { // Success in fetching data from endpoint
              // Convert endpoint data to FHIR
              // console.log('Converting endpoint data to FHIR ' + sensor,);

              const fhirData = this.convertEndpointDataToFHIR(sensor, data, user_id, endpointUrl);
              if (!fhirData || Object.keys(fhirData).length <= 0) {
                console.error('Error in converting endpoint data to FHIR, missing parameters');

              } else {
                for (let tableName in fhirData) {
                  const normalizedData = fhirData[tableName]; // we should normalize the data

                  if (combined_bq_data[tableName]) {
                    combined_bq_data[tableName].push(...normalizedData);
                  } else {
                    combined_bq_data[tableName] = normalizedData;
                  }
                }
              }
              // printing the data into console
              // console.log('fhirData :  done', printObjectDescription(fhirData));

              // save the data to a file
              // const flittleName = projectId + '-' + user_id + '-' + date + '-' + deviceId + '-' + sensor + '.json.out';
              // const fpath = path.join(__dirname, 'sample_fetches', flittleName);
              // fs.writeFileSync(fpath, JSON.stringify(fhirData, null, 2));
            }
          } catch (err) {
            console.log('Error in fetching data from endpoint', err);

          }

        });
      } else { // No endpoints found for device!
        console.log('No endpoints found for device', deviceId);
        //return Promise.reject('No endpoints found for device');
      }
    });

    // prepare the files for the bigquery
    console.log('starting to prepare the files for the bigquery', Object.keys(combined_bq_data)?.length);
    return await prepareFilesForBigQueryInsertionFromCombinedData(combined_bq_data, projectId)
      .catch((err) => {
        console.error('Error in preparing the files for the bigquery', err);
        return Promise.reject('Error in preparing the files for the bigquery');
      });
  } else {
    console.log('No devices found');
    //throw new Error('No devices found');
    return Promise.reject('No devices found');
  }
};

/**
 * Converts endpoint data to FHIR format.
 * @param {string} sensor - The sensor type.
 * @param {Object} data - The data object.
 * @param {string} user - The user ID.
 * @param {string} endpointUrl - The endpoint URL.
  * @returns {Object} - The converted endpoint data in FHIR format.
 */
exports.convertEndpointDataToFHIR = (sensor, data, user, endpointUrl) => {
  //console.log(sensor, data, user, endpointUrl);
  //console.log(`Converting endpoint data to BigQuery ${sensor} data length: ${flattenToString(data).length}`);
  let fhirData = {};
  try {
    if (!sensor || !data || !user) {
      // console.log('Error in converting endpoint data to FHIR, missing parameters');
      return fhirData;
    }

    if (sensor.indexOf('Heart Rate') > -1) { // Heart Rate
      if (sensor.indexOf('Intraday') === -1) { // Not Intraday
        fhirData = convertHeartRateDataToFHIR(data, user);

      } else { // Intraday HR
        fhirData = convertHeartRateIntradayDataToFHIR(data, user);

      }
    } else if (sensor.indexOf('Get Activity Time Series') > -1 && // Activity Time Series by Date Range (no Intraday)
      sensor.indexOf('no Intraday') > -1) {
      fhirData = convertActivityTimeSeriesToFHIR(data, user);

    } else if (sensor.indexOf('Daily Activity Summary') > -1) { // Daily Activity Summary
      fhirData = convertDailyActivitySummaryToFHIR(data, user);

    } else if (
      sensor.indexOf("Series Intraday") > -1 && // Intraday Activity for Elavation, Floors, Distance, Steps
      (sensor.indexOf("Distance") > 0 || sensor.indexOf("Elevation") > 0 || sensor.indexOf("Floors") > 0 || sensor.indexOf("Steps") > 0)
    ) { // Intraday activity for Elevation, Floors, Distance, Steps
      fhirData = convertIntradayDataToFHIR(data, user, sensor);
    } else if (sensor.indexOf('Activity Calories Time Series Intraday') > -1) { // Intraday Calories
      fhirData = convertIntradayCaloriesToFHIR(data, user);

    } else if (sensor.indexOf('Temperature (Skin)') > -1) { // Skin Temperature Summary
      fhirData = convertSkinTemperatureSummaryToFHIR(data, user);

    } else if (sensor.indexOf('SpO2 Summary Interval') > -1) { // SpO2
      fhirData = convertSPO2ToFHIR(data, user);

    } else if (sensor.indexOf('SpO2 Intraday') > -1) { // SpO2 Intraday
      fhirData = convertSpO2IntradayToFHIR(data, user);

    } else if (sensor.indexOf('Profile') > -1) { // Profile
      fhirData = convertUserProfileToFHIR(data, user);

    } else if (sensor.indexOf('Devices') > -1) { // Devices
      fhirData = convertDevicesToFHIR(data, user);

    } else if (sensor.indexOf('Badges') > -1) { // Badges
      fhirData = convertBadgesToFHIR(data, user);

    } else if (sensor.indexOf('Friends') > -1) { // Friends
      fhirData = convertFriendsToFHIR(data, user);

    } else if (sensor.indexOf('Weight Logs') > -1) { // Weight Logs
      fhirData = convertWeightLogsToFHIR(data, user);

    } else if (sensor.indexOf('Get HRV Summary by Interval') > -1) { // HRV Summary by Interval
      fhirData = convertHRVSummaryToFHIR(data, user);

    } else if (sensor.indexOf('HRV Intraday') > -1) { // HRV Intraday
      fhirData = convertHRVIntradayToFHIR(data, user);

      // } else if (sensor.indexOf('Heart Rate Time Series by Date Range') > -1) { // HR Time Series by Date Range
      //   fhirData = convertHeartRateTimeSeriesToFHIR(data, user);

    } else if (sensor.indexOf('Breathing Rate Intraday') > -1) { // Breathing Rate Intraday
      fhirData = convertBreathingRateIntradayToFHIR(data, user);

    } else if (sensor.indexOf('Get Breathing Rate Summary by Interval') > -1) { // Breathing Rate Summary
      fhirData = convertBreathingRateSummaryToFHIR(data, user);

    } else if (sensor.indexOf('Activity Log List') > -1) { // Activity Log List
      fhirData = convertActivityLogListToFHIR(data, user);

    } else if (sensor.indexOf('Get Lifetime Stats') > -1) { // Lifetime Stats
      fhirData = convertLifetimeStatsToFHIR(data, user);

    } else if (sensor.indexOf('Sleep Log by Date Range') > -1) { // Sleep Logs Date Range
      fhirData = convertSleepLogsDateRangeToFHIR(data, user);

    } else if (sensor.indexOf('Get Sleep Log by Date') > -1) { // Sleep Log of one day
      fhirData = convertSleepLogByDateToFHIR(data, user);

    } else if (sensor.indexOf('Sleep Log List') > -1) { // Sleep Logs List
      fhirData = convertSleepLogListToFHIR(data, user);

    } else if (sensor.indexOf('Sleep Log by Date Range') > -1) { // Sleep Logs by Date Range
      fhirData = convertSleepLogByDateRangeToFHIR(data, user);

    } else if (sensor.indexOf('Get AZM Time Series by Interval') > -1) { // Activity Zone Minutes Time Series by Interval
      fhirData = convertAZMTimeSeriesToFHIR(data, user);

    } else if (sensor.indexOf('VO2 Max Summary') > -1) { // VO2 Max Summary
      fhirData = convertVO2MaxSummaryToFHIR(data, user);

    } else if (sensor.indexOf('AZM Intraday') > -1) { // AZM Intraday or AZM Intraday by Date
      fhirData = convertAZMIntradayToFHIR(data, user);

    } else {
      console.warn("sensor not found in if conditions, : %s", sensor)
    }
  } catch (error) {
    console.log('Error in converting endpoint data to FHIR', error);
    //throw new Error('Error in converting endpoint data to FHIR');
  }

  console.warn(" OUT : %n %n \\n\n\n \b\r ", flattenToString(fhirData), fhirData);
  return fhirData;
}

/**
 * Converts daily activity summary data to FHIR format.
 * @param {Object} data - The data object.
 * @param {string} user - The user ID.
 * @returns {Object} - output object contains the name of the tables and theier data.
 */
function convertDailyActivitySummaryToFHIR(data, user) {
  //activity_goals_columns=["activeMinutes","caloriesOut","distance","floors","steps",]
  //activites_columns = ["activityId", "activityParentId", "activityParentName", "calories", "description", "distance", "duration", "hasActiveZoneMinutes", "hasStartTime", "isFavorite", "lastModified", "logId", "name", "startDate", "startTime", "steps",]
  //activity_summary_columns = ["activeScore", "activityCalories", "caloriesBMR", "caloriesOut", "elevation", "fairlyActiveMinutes", "floors", "lightlyActiveMinutes", "marginalCalories", "restingHeartRate", "sedentaryMinutes", "steps", "veryActiveMinutes",]

  //#activity_distances_columns = "activity", "total_distance", "tracker_distance", "logged_activites_distance", "very_active_distance", "moderetly_active_distance", "lightly_active_distance", "sedentary_active_distance",]
  // //const fhirActivityDistances = [];

  const fhirActivitySummary = [];
  const fhirActivityGoals = [];
  const activityLogs = [];
  let dateString;
  for (itemKey in data?.activities) {
    const item = data?.activities[itemKey];
    if (!dateString)
      dateString = item?.startDate;
    const userActivity = { // getcolumns from activity_columns
      id: user,
      date: dateString,
      activity_id: item?.activityId,
      activity_parent_id: item?.activityParentId,
      activity_parent_name: item?.activityParentName,
      calories: item?.calories,
      description: item?.description,
      distance: item?.distance,
      duration: item?.duration,
      has_active_zone_minutes: item?.hasActiveZoneMinutes,
      has_start_time: item?.hasStartTime,
      is_favorite: item?.isFavorite,
      last_modified: item?.lastModified,
      log_id: item?.logId,
      name: item?.name,
      start_date: item?.startDate,
      start_time: item?.startTime,
      steps: item?.steps,
    };
    activityLogs.push(userActivity);
  }

  // Goals
  const fhirActivityGoal = {
    id: user,
    date: dateString,
    active_minutes: data?.goals?.activeMinutes,
    calories_out: data?.goals?.caloriesOut,
    distance: data?.goals?.distance,
    floors: data?.goals?.floors,
    steps: data?.goals?.steps,
  };
  fhirActivityGoals.push(fhirActivityGoal);

  // Distances

  // Summary
  const fhirActivitySummaryItem = {
    id: user,
    date: dateString,
    activeScore: data?.summary?.activeScore,
    activityCalories: data?.summary?.activityCalories,
    caloriesBMR: data?.summary?.caloriesBMR,
    caloriesOut: data?.summary?.caloriesOut,
    elevation: data?.summary?.elevation,
    fairlyActiveMinutes: data?.summary?.fairlyActiveMinutes,
    floors: data?.summary?.floors,
    lightlyActiveMinutes: data?.summary?.lightlyActiveMinutes,
    marginalCalories: data?.summary?.marginalCalories,
    restingHeartRate: data?.summary?.restingHeartRate,
    sedentaryMinutes: data?.summary?.sedentaryMinutes,
    steps: data?.summary?.steps,
    veryActiveMinutes: data?.summary?.veryActiveMinutes,
  };
  fhirActivitySummary.push(fhirActivitySummaryItem);

  return { "activity_logs": activityLogs, "activity_goals": fhirActivityGoals, "activity_summary": fhirActivitySummary };
}

/**
 * Converts activity log list data to FHIR format.
 *
 * @param {Object} data - The activity log list data. the data has the structure of the following example.
 * @example {"activities":[{"activeDuration":1536000,"activityLevel":[{"minutes":3,"name":"sedentary"},{"minutes":9,"name":"lightly"},{"minutes":2,"name":"fairly"},{"minutes":11,"name":"very"}],"activityName":"Walk","activityTypeId":90013,"calories":204,"caloriesLink":"https://api.fitbit.com/1/user/-/activities/calories/date/2019-01-03/2019-01-03/1min/time/12:08/12:34.json","duration":1536000,"elevationGain":0,"lastModified":"2019-01-04T19:31:15.000Z","logId":19018673358,"logType":"auto_detected","manualValuesSpecified":{"calories":false,"distance":false,"steps":false},"originalDuration":1536000,"originalStartTime":"2019-01-03T12:08:29.000-08:00","startTime":"2019-01-03T12:08:29.000-08:00","steps":1799,"tcxLink":"https://api.fitbit.com/1/user/-/activities/19018673358.tcx"}],"pagination":{"afterDate":"2019-01-01","limit":1,"next":"https://api.fitbit.com/1/user/-/activities/list.json?offset=0&limit=1&sort=asc&afterDate=2019-01-01","offset":0,"previous":"","sort":"asc"}}
 * @param {string} user - The user ID.
 * @returns {Object} - The activity log list in FHIR format.
 */
function convertActivityLogListToFHIR(data, user) {
  // My sample data file is missing many possible columns
  // refer to: https://dev.fitbit.com/build/reference/web-api/activity/get-activity-log-list/
  const fhirActivityLogList = [];
  // activity_log_list_columns = ["activityDuration", "activityName", "activityTypeId", "calories", "duration", "elavationGain", "lastModified", "logId", "logType", "manual", "originalDuration", "originalStartTime", "startTime", "steps", "tcxLink", "caloriesLink"]
  for (item in data?.activities) {
    const userActivityLog = {
      id: user,
      date: formatDate(item?.originalStartTime),
      activity_duration: item?.activityDuration,
      activity_name: item?.activityName,
      activity_type_id: item?.activityTypeId,
      calories: item?.calories,
      duration: item?.duration,
      elavation_gain: item?.elavationGain,
      last_modified: item?.lastModified,
      log_id: item?.logId,
      log_type: item?.logType,
      manual: item?.manual,
      original_duration: item?.originalDuration,
      original_start_time: item?.originalStartTime,
      start_time: item?.startTime,
      steps: item?.steps,
      tcx_link: item?.tcxLink,
      calories_link: item?.caloriesLink,
    };
    for (activity_level in item?.activityLevel) {
      if (activity_level?.minutes && activity_level?.name)
        userActivityLog["activity_level_" + activity_level?.name] = activity_level?.minutes;
    }
    fhirActivityLogList.push(userActivityLog);
  }
  return { "activity_log_list": fhirActivityLogList };
}

/**
 * Converts intraday data to FHIR format.
 * @param {Object} data - The data object.
 * @param {string} user - The user ID.
 * @param {string} resourceType - The resource type.
 * @returns {Object} - output object contains the name of the tables and theier data.
 */
function convertIntradayDataToFHIR(data, user, resourceType) {
  // intraday_steps_columns = ["time", "value"]
  // intraday_distance_columns = ["time", "value"]
  // intraday_elevation_columns = ["time", "value"]
  // intraday_floors_columns = ["time", "value"]\
  if (!data || typeof data !== 'object' || Object.keys(data).length <= 0) {
    console.error('Data is empty or not an object.');
    return {};
  }

  const fhirIntradayData = [];
  const intradayName = Object.keys(data)[0];

  const dateTime = data?.[intradayName]?.[0]?.dateTime;
  const totalDayValue = data?.[intradayName]?.[0]?.value; // We are wasting this info and won't save it to bigQuery

  const { dataset, datasetType, datasetInterval } = data?.[intradayName + '-intraday'];
  for (let item of dataset) {
    const userIntradayActivityRow = {
      id: user,
      date: dateTime,
      time: item?.time,
      value: item?.value,
    };
    fhirIntradayData.push(userIntradayActivityRow);
  }
  const tableName = intraday_enpoints_tables_map.find((item) => { return item.endpoint === intradayName })?.table;
  return { [tableName]: fhirIntradayData };
}

/**
 * Converts Fitbit intraday calories data to FHIR format.
 * @param {Object} data - The Fitbit intraday calories data.
 * @param {string} user - The user ID.
 * @returns {Object} - The converted FHIR intraday calories data.
 */
function convertIntradayCaloriesToFHIR(data, user) {
  // intraday_calories_columns = ["level", "mets", "time", "value"]
  const dateTime = data?.["activities-calories"]?.[0]?.dateTime;
  const totalCalories = data?.["activities-calories"]?.[0]?.value; // we are wasting this info and won't save it to bigQuery
  const fhirIntradayCalories = [];

  const { dataset } = data["activities-calories-intraday"];
  for (let item in dataset) {
    const { level, mets, time, value } = dataset[item];
    const userCalories = {
      id: user,
      date: dateTime,
      level: level,
      mets: mets,
      time: time,
      value: value,
    }
    fhirIntradayCalories.push(userCalories);
  }
  return { "intraday_calories": fhirIntradayCalories };
}

/**
 * Converts HRV summary data to FHIR format.
 *
 * @param {Object} data - The HRV summary data. with the following format: "dateTime", "value.dailyRmssd", "value.deepRmssd"
 * @param {string} user - The user ID.
 * @returns {Object} - The HRV summary data in FHIR format.
 */
function convertHRVSummaryToFHIR(data, user) {
  // hrv_summary_columns = ["date", "value"]
  const fhirHRVSummary = [];
  for (item in data?.hrv) {
    const { dateTime, value } = data.hrv[item];
    const userHRVSummary = {
      id: user,
      date: dateTime,
      daily_rmssd: value?.dailyRmssd || null,
      deep_rmssd: value?.deepRmssd || null,
    };
    fhirHRVSummary.push(userHRVSummary);
  }
  return { "hrv_summary": fhirHRVSummary };
}

//TODO : Does this have datetime?

/**
 * Converts HRV Intraday data to FHIR format.
 *
 * @param {Object} data - The HRV Intraday data. with the following format: "dateTime", "minutes" with the following format: "minute", "value.rmssd", "value.coverage", "value.hf", "value.lf"
 * @param {string} user - The user ID.
 * @returns {Object} - The HRV Intraday data in FHIR format.
 */
function convertHRVIntradayToFHIR(data, user) {
  // hrv_intraday_columns = ["date", "value"]
  const fhirHRVIntraday = [];
  for (item in data?.hrv) {
    const { minutes } = data.hrv[item];
    for (let i = 0; i < minutes.length; i++) {
      const { minute, value } = minutes[i];
      const userHRVIntraday = {
        id: user,
        date: minute?.split('T')[0],
        rmssd: value?.rmssd,
        coverage: value?.coverage,
        hf: value?.hf,
        lf: value?.lf,
      };
      fhirHRVIntraday.push(userHRVIntraday);
    }
  }
  return { "hrv_intraday": fhirHRVIntraday };
}


/**
 * Converts user profile data to FHIR format.
 *
 * @param {Object} data - The user profile data. with the following format: "user.age", "user.city", "user.state", "user.country", "user.dateOfBirth", "user.displayName", "user.encodedId", "user
 * @param {string} user - The user ID.
 * @returns {Object} - The profile data in FHIR format.
 */
function convertUserProfileToFHIR(data, user) {
  // profile_columns=["id","user.age","user.city","user.state","user.country","user.dateOfBirth","user.displayName","user.encodedId","user.fullName","user.gender","user.height","user.heightUnit","user.timezone",]
  const { profile } = data;
  const fhirProfile = [];
  fhirProfile.push({
    id: user,
    date: new Date().toISOString().split('T')[0], //TODO: find the correct date
    user_age: profile?.user?.age,
    user_city: profile?.user?.city,
    user_state: profile?.user?.state,
    user_country: profile?.user?.country,
    user_dateOfBirth: profile?.user?.dateOfBirth,
    user_displayName: profile?.user?.displayName,
    user_encodedId: profile?.user?.encodedId,
    user_fullName: profile?.user?.fullName,
    user_gender: profile?.user?.gender,
    user_height: profile?.user?.height,
    user_heightUnit: profile?.user?.heightUnit,
    user_timezone: profile?.user?.timezone,
  });
  return { "profile": fhirProfile };
}

/**
 * Converts skin temperature summary data to FHIR format.
 *
 * @param {Object} data - The skin temperature summary data. with the following format: "dateTime", "logType", "value.nightlyRelative"
 * @param {string} user - The user identifier.
 * @returns {Object} - The converted FHIR skin temperature summary data.
 */
function convertSkinTemperatureSummaryToFHIR(data, user) {
  // temp_columns=["dateTime","logType","value.nightlyRelative"]
  const fhirSkinTemperatureSummary = [];
  console.debug(("data.tempSkin", data?.tempSkin?.length))
  for (i = 0; i < data?.tempSkin?.length; i++) {
    let item = data?.tempSkin[i];
    // console.log("item", typeof item);
    const fhirSkinTempItem = {
      id: user,
      date: item?.dateTime,
      log_type: item?.logType,
      nightly_relative: item?.value?.nightlyRelative,
    };
    fhirSkinTemperatureSummary.push(fhirSkinTempItem);
  }
  return { "temp_skin": fhirSkinTemperatureSummary };
}

/**
 * Converts SPO2 data to FHIR format.
 *
 * @param {Object} data - The SPO2 data to convert. with the following format: "dateTime", "value.avg", "value.min", "value.max"
 * @param {string} user - The user ID.
 * @returns {Array} - The converted SPO2 data in FHIR format.
 */
function convertSPO2ToFHIR(data, user) {
  const fhirSpO2 = [];
  // spo2_columns = ["avg", "min", "max",]
  for (var item of data) {
    const { dateTime, value } = item;
    const fhirSpO2Item = {
      id: user,
      date: dateTime,
      avg: value?.avg || null,
      min: value?.min || null,
      max: value?.max || null,
    };
    fhirSpO2.push(fhirSpO2Item);
  }
  return { "spo2": fhirSpO2 };
}

/**
 * Converts SpO2 intraday data to FHIR format.
 *
 * @param {Object} data - The SpO2 intraday data. with the following format: "dateTime", "minutes" with the following format: "minute", "value.avg", "value.min", "value.max"
 * @param {string} user - The user ID.
 * @returns {Array} - The SpO2 intraday data in FHIR format.
 */
function convertSpO2IntradayToFHIR(data, user) {
  // intraday_spo2_columns=["value","minute"]
  const fhirSpO2Intraday = [];
  const { dateTime, minutes } = data;
  for (let item of minutes) {
    const { value, minute } = item;
    const userSpO2 = {
      id: user,
      date: dateTime,
      value: value,
      minute: minute,
    };
    fhirSpO2Intraday.push(userSpO2);
  }
  return { "spo2_intraday": fhirSpO2Intraday };
}


/**
 * Converts sleep logs data to FHIR format.
 *
 * @param {Object} inputData - The sleep logs data. with the following format: "dateOfSleep", "duration", "efficiency", "endTime", "infoCode", "levels", "logId", "minutesAfterWakeup", "minutesAsleep", "minutesAwake", "minutesToFallAsleep", "startTime", "timeInBed", "type", "isMainSleep"
 * @param {string} user - The user ID.
 * @returns {Array} - The converted sleep logs data in FHIR format.
 */
function convertSleepLogsDateRangeToFHIR(inputData, user) {
  // TODO: We don't extract the sleep_minutes table yet
  const fhirSleepLogs = [];
  const fhirSleepSummaries = [];
  for (item in inputData?.sleep) {
    try {
      const { dateOfSleep, duration, efficiency, endTime, infoCode, levels, logId, minutesAfterWakeup, minutesAsleep, minutesAwake, minutesToFallAsleep, startTime, timeInBed, type, isMainSleep } = inputData.sleep[item];

      const { data, shortData, summary: summaryTop } = levels;
      let stages_deep, stages_light, stages_rem, stages_wake;
      for (let key in levels.summary) {
        let value = levels.summary[key];
        if (key === 'deep') {
          stages_deep = {
            total: value.minutes,
            count: value.count,
            thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
          };
        } else if (key === 'light') {
          stages_light = {
            total: value.minutes,
            count: value.count,
            thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
          };
        } else if (key === 'rem') {
          stages_rem = {
            total: value.minutes,
            count: value.count,
            thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
          };
        } else if (key === 'wake') {
          stages_wake = {
            total: value.minutes,
            count: value.count,
            thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
          };
        }
      }
      const userSleepLog = {
        id: user,
        date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
        awake_count: !!stages_wake?.count ? stages_wake.count : 0,
        awake_duration: !!stages_wake?.total ? stages_wake.total : 0,
        awakenings_count: 0, //TODO: how to calculate awakenings_count
        date_of_sleep: dateOfSleep, //TODO: chcek if dateOfSleep has the correct format and date
        duration: duration,
        efficiency: efficiency,
        end_time: endTime,
        is_main_sleep: isMainSleep,
        log_id: logId,
        minutes_after_wakeup: minutesAfterWakeup,
        minutes_asleep: minutesAsleep,
        minutes_awake: minutesAwake,
        minutes_to_fall_asleep: minutesToFallAsleep,
        restless_count: 0, //TODO: how to calculate restless_count
        restless_duration: 0, //TODO: how to calculate restless_duration
        start_time: startTime, //TODO: I know we should add startTime to date_pulled to get the desired date
        time_in_bed: timeInBed,
      };
      const userSleepSummary = {
        date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
        total_minutes_asleep: minutesAsleep,
        total_sleep_records: 1, //TODO: how to calculate total_sleep_records
        total_time_in_bed: timeInBed, // TODO: check if timeInBed should be assigned to total_time_in_bed
        stages_deep: stages_deep?.total || 0,
        stages_light: stages_light?.total || 0,
        stages_rem: stages_rem?.total || 0,
        stages_wake: stages_wake?.total || 0,
      };
      fhirSleepLogs.push(userSleepLog);
      fhirSleepSummaries.push(userSleepSummary);
    } catch (error) {
      // console.log('Error in converting sleep logs data to FHIR', error);
      //throw new Error('Error in converting sleep logs data to FHIR');
    }
  }
  return { "sleep": fhirSleepLogs, "sleep_summary": fhirSleepSummaries };
}

/**
 * Converts sleep log data to FHIR format.
 *
 * @param {Object[]} inputData - The sleep log data to convert. with the following format:
 * @example {"sleep":[{"dateOfSleep":"2020-02-21","duration":27720000,"efficiency":96,"endTime":"2020-02-21T07:03:30.000","infoCode":0,"isMainSleep":true,"levels":{"data":[{"dateTime":"2020-02-20T23:21:30.000","level":"wake","seconds":630},{"dateTime":"2020-02-20T23:32:00.000","level":"light","seconds":30},{"dateTime":"2020-02-20T23:32:30.000","level":"deep","seconds":870},{"dateTime":"2020-02-21T06:32:30.000","level":"light","seconds":1860}],"shortData":[{"dateTime":"2020-02-21T00:10:30.000","level":"wake","seconds":30},{"dateTime":"2020-02-21T00:15:00.000","level":"wake","seconds":30},{"dateTime":"2020-02-21T06:18:00.000","level":"wake","seconds":60}],"summary":{"deep":{"count":5,"minutes":104,"thirtyDayAvgMinutes":69},"light":{"count":32,"minutes":205,"thirtyDayAvgMinutes":202},"rem":{"count":11,"minutes":75,"thirtyDayAvgMinutes":87},"wake":{"count":30,"minutes":78,"thirtyDayAvgMinutes":55}}},"logId":26013218219,"minutesAfterWakeup":0,"minutesAsleep":384,"minutesAwake":78,"minutesToFallAsleep":0,"logType":"auto_detected","startTime":"2020-02-20T23:21:30.000","timeInBed":462,"type":"stages"}],"summary":{"stages":{"deep":104,"light":205,"rem":75,"wake":78},"totalMinutesAsleep":384,"totalSleepRecords":1,"totalTimeInBed":462}}
 * @param {string} user - The user associated with the sleep log data.
 * @returns {Object} - An object containing the converted sleep logs and summaries in FHIR format.
 */
function convertSleepLogByDateToFHIR(inputData, user) {
  const fhirSleepLogs = [];
  const fhirSleepSummaries = [];

  const { sleep, summary: summaryTop } = inputData;
  for (var item of sleep) {
    const { dateOfSleep, duration, efficiency, endTime, infoCode, isMainSleep, levels, logId, minutesAfterWakeup, minutesAsleep, minutesAwake, minutesToFallAsleep, startTime, timeInBed, type } = item;
    const { data, shortData, summary } = levels;
    const stages_obj = [];
    for (let key in summary) {
      let value = summary[key];
      const stage_obj = {
        name: key,
        total: value.minutes,
        count: value.count,
        thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
      };
      stages_obj.push(stage_obj);
    };
    const stages_deep = stages_obj.find(s => s.name === 'deep');
    const stages_light = stages_obj.find(s => s.name === 'light');
    const stages_rem = stages_obj.find(s => s.name === 'rem');
    const stages_wake = stages_obj.find(s => s.name === 'wake');
    const userSleepLog = {
      id: user,
      date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
      awake_count: !!stages_wake?.count ? stages_wake.count : 0,
      awake_duration: !!stages_wake?.total ? stages_wake.total : 0,
      awakenings_count: 0, //TODO: how to calculate awakenings_count
      date_of_sleep: dateOfSleep, //TODO: chcek if dateOfSleep has the correct format and date
      duration: duration,
      efficiency: efficiency,
      end_time: endTime,
      is_main_sleep: isMainSleep,
      log_id: logId,
      minutes_after_wakeup: minutesAfterWakeup,
      minutes_asleep: minutesAsleep,
      minutes_awake: minutesAwake,
      minutes_to_fall_asleep: minutesToFallAsleep,
      restless_count: 0, //TODO: how to calculate restless_count
      restless_duration: 0, //TODO: how to calculate restless_duration
      start_time: startTime, //TODO: I know we should add startTime to date_pulled to get the desired date
      time_in_bed: timeInBed,
      //info_code: infoCode,
      //type: type,
    };
    const userSleepSummary = {
      date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
      total_minutes_asleep: minutesAsleep,
      total_sleep_records: 1, //TODO: how to calculate total_sleep_records
      total_time_in_bed: timeInBed, // TODO: check if timeInBed should be assigned to total_time_in_bed
      stages_deep: stages_deep?.total || 0,
      stages_light: stages_light?.total || 0,
      stages_rem: stages_rem?.total || 0,
      stages_wake: stages_wake?.total || 0,
    };
    fhirSleepLogs.push(userSleepLog);
    fhirSleepSummaries.push(userSleepSummary);
  }
  return { "sleep": fhirSleepLogs, "sleep_summary": fhirSleepSummaries };
}

/**
 * Converts a sleep log list to FHIR format.
 *
 * @param {Array} inputData - The sleep log data to convert.
 * @param {string} user - The user associated with the sleep log data.
 * @returns {Object} - An object containing the converted sleep logs and summaries in FHIR format.
 */
function convertSleepLogListToFHIR(inputData, user) {
  const fhirSleepLogs = [];
  const fhirSleepSummaries = [];

  const { sleep, pagination } = inputData;
  for (var item of sleep) {
    const { dateOfSleep, duration, efficiency, endTime, infoCode, isMainSleep, levels, logId, logType, minutesAfterWakeup, minutesAsleep, minutesAwake, minutesToFallAsleep, startTime, timeInBed, type } = item;
    const { data, shortData, summary } = levels;
    const stages_obj = [];
    for (let key in summary) {
      let value = summary[key];
      const stage_obj = {
        name: key,
        total: value.minutes,
        count: value.count,
        thirtyDayAvgMinutes: value.thirtyDayAvgMinutes,
      };
      stages_obj.push(stage_obj);
    };
    const stages_deep = stages_obj.find(s => s.name === 'deep');
    const stages_light = stages_obj.find(s => s.name === 'light');
    const stages_rem = stages_obj.find(s => s.name === 'rem');
    const stages_wake = stages_obj.find(s => s.name === 'wake');
    const userSleepLog = {
      id: user,
      date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
      awake_count: !!stages_wake?.count ? stages_wake.count : 0,
      awake_duration: !!stages_wake?.total ? stages_wake.total : 0,
      awakenings_count: 0, //TODO: how to calculate awakenings_count
      date_of_sleep: dateOfSleep, //TODO: chcek if dateOfSleep has the correct format and date
      duration: duration,
      efficiency: efficiency,
      end_time: endTime,
      is_main_sleep: isMainSleep,
      log_id: logId,
      minutes_after_wakeup: minutesAfterWakeup,
      minutes_asleep: minutesAsleep,
      minutes_awake: minutesAwake,
      minutes_to_fall_asleep: minutesToFallAsleep,
      restless_count: 0, //TODO: how to calculate restless_count
      restless_duration: 0, //TODO: how to calculate restless_duration
      start_time: startTime, //TODO: I know we should add startTime to date_pulled to get the desired date
      time_in_bed: timeInBed,
      //info_code: infoCode,
      //type: type,
    };
    const userSleepSummary = {
      date: dateOfSleep, // TODO: chcek if dateOfSleep should assigned to date
      total_minutes_asleep: minutesAsleep,
      total_sleep_records: 1, //TODO: how to calculate total_sleep_records
      total_time_in_bed: timeInBed, // TODO: check if timeInBed should be assigned to total_time_in_bed
      stages_deep: stages_deep?.total || 0,
      stages_light: stages_light?.total || 0,
      stages_rem: stages_rem?.total || 0,
      stages_wake: stages_wake?.total || 0,
    };
    fhirSleepLogs.push(userSleepLog);
    fhirSleepSummaries.push(userSleepSummary);
  }
  return { "sleep": fhirSleepLogs, "sleep_summary": fhirSleepSummaries };
}

/**
 * Converts lifetime stats data to FHIR format.
 *
 * @param {Object} data - The lifetime stats data.
 * @param {Object} user - The user object.
 * @returns {Object} - The FHIR formatted lifetime stats.
 */
function convertLifetimeStatsToFHIR(data, user) {
  // TODO: I don't have the data structure of the lifetime stats in bigquery schema
  //{
  //   best: {
  //     total: { distance: [Object], steps: [Object] },
  //     tracker: { distance: [Object], steps: [Object] }
  //   },
  //   lifetime: {
  //     total: {
  //       activeScore: -1,
  //         caloriesOut: -1,
  //           distance: 136.08,
  //             steps: 201278
  //     },
  //     tracker: {
  //       activeScore: -1,
  //         caloriesOut: -1,
  //           distance: 136.08,
  //             steps: 201278
  //     }
  //   }
  // }
  const fhirLifetimeStats = [];
  const { best, lifetime } = data;
  const { total: best_total, tracker: best_tracker } = best;
  const { total: lifetime_total, tracker: lifetime_tracker } = lifetime;

  const userLifetimeStats = {
    id: user,
    date: new Date().toISOString().split('T')[0],
    best_total_distance: best_total?.distance,
    best_total_steps: best_total?.steps,
    best_tracker_distance: best_tracker?.distance,
    best_tracker_steps: best_tracker?.steps,
    lifetime_total_distance: lifetime_total?.distance,
    lifetime_total_steps: lifetime_total?.steps,
    lifetime_tracker_distance: lifetime_tracker?.distance,
    lifetime_tracker_steps: lifetime_tracker?.steps,
  };
  fhirLifetimeStats.push(userLifetimeStats);

  return { "lifetime_stats": fhirLifetimeStats };
}

/**
 * Converts AZM Time Series data to FHIR format.
 *
 * @param {Array} data - The AZM Time Series data to be converted.
 * @param {string} user - The user associated with the data.
 * @returns {Object} - The converted FHIR data.
 */
function convertAZMTimeSeriesToFHIR(data, user) {
  const fhirAZMTimeSeries = [];
  for (var item of data?.["activities-active-zone-minutes"]) {
    const { dateTime, value } = item;
    const userAZMTimeSeries = {
      id: user,
      date: dateTime,
      value: value?.activeZoneMinutes || 0,
    };
    fhirAZMTimeSeries.push(userAZMTimeSeries);
  }
  return { "azm_time_series": fhirAZMTimeSeries };
}

/**
 * Converts AZM Intraday data to FHIR format.
 * @param {Array} data - The AZM Intraday data to be converted.
 * @param {string} user - The user associated with the data.
 * @returns {Object} - The converted data in FHIR format.
 */
function convertAZMIntradayToFHIR(data, user) {
  const fhirAZMIntraday = [];
  for (var item of data?.["activities-active-zone-minutes-intraday"]) {
    const { dateTime, minutes } = item;
    for (var zone of minutes) {
      const { minute, value } = zone;
      const userAZMIntraday = {
        id: user,
        date: dateTime,
        time: minute,
        value: value?.activeZoneMinutes || 0,
      };
      fhirAZMIntraday.push(userAZMIntraday);
    }
  }
  return { "azm_intraday": fhirAZMIntraday };
}

/**
 * Converts VO2Max summary data to FHIR format.
 *
 * @param {Object} data - The VO2Max summary data.
 * @param {string} user - The user associated with the data.
 * @returns {Object} - The converted FHIR VO2Max summary data.
 */
function convertVO2MaxSummaryToFHIR(data, user) {
  const fhirVO2MaxSummary = [];
  for (var item of data?.cardioScore) {
    const { dateTime, value } = item;
    const userVO2MaxSummary = {
      id: user,
      date: dateTime,
      value: value?.vo2Max || null,
    };
    fhirVO2MaxSummary.push(userVO2MaxSummary);
  }
  //TODO: Implement this function
  return { "vo2_max_summary": fhirVO2MaxSummary };
}

/**
 * Converts heart rate data to FHIR format.
 *
 * @param {Object} data - The heart rate data.
 * @param {string} user - The user ID.
 * @returns {Array} - The converted sleep logs data in FHIR format.
 */
function convertHeartRateDataToFHIR(data, user) { // We are leaving "resting_heart_rate" field to waste
  const fhirHeartRateData = [];
  try {
    const activities_heart = data?.["activities-heart"];
    // console.log("data", activities_heart);
    // console.log(" **** THIS SPECIAL : %s", activities_heart?.length);
    if (!activities_heart || activities_heart?.length <= 0) {
      // console.log("No heart rate data found");
      return {};
    }
    // console.log("data", activities_heart);
    // const hr_zones_columns = ["id", "date", "out_of_range_calories_out", "out_of_range_minutes", "out_of_range_min_hr", "out_of_range_max_hr", "fat_burn_calories_out", "fat_burn_minutes", "fat_burn_min_hr", "fat_burn_max_hr", "cardio_calories_out", "cardio_minutes", "cardio_min_hr", "cardio_max_hr", "peak_calories_out", "peak_minutes", "peak_min_hr", "peak_max_hr"];
    for (var item of activities_heart) {
      const { dateTime, value } = item;
      //const hrZones ;
      const userHr = {
        id: user,
        date: dateTime,
      };
      const hrZones = value?.["heartRateZones"];
      // console.log("hrZones", hrZones);
      for (var zone of hrZones) {
        const zoneName = zone["name"].toLowerCase().replace(" ", "_");
        userHr[`${zoneName}_calories_out`] = zone["caloriesOut"];
        userHr[`${zoneName}_minutes`] = zone["minutes"];
        userHr[`${zoneName}_min_hr`] = zone["min"];
        userHr[`${zoneName}_max_hr`] = zone["max"];
      }
      fhirHeartRateData.push(userHr);
    }
  } catch (error) {
    // console.log('Error in converting endpoint data to FHIR', error);
    return {};
  }
  return { "heart_rate_zones": fhirHeartRateData };
}

/**
 * Converts heart rate intraday data to FHIR format.
 * @param {Object} data - The heart rate intraday data.
 * @param {string} user - The user identifier.
 * @returns {Array} - The heart rate intraday data in FHIR format.
 * @throws {Error} - If there is an error in converting the data to FHIR format.
 */
function convertHeartRateIntradayDataToFHIR(data, user) {
  const fhirHeartRateIntradayData = [];
  try {
    const dateTime = data?.["activities-heart"]?.[0]?.dateTime;
    dateTime;
    const activities = data?.["activities-heart"];
    const intraday = data?.["activities-heart-intraday"];
    // console.log(intraday?.dataset);
    for (var item of intraday?.dataset) {
      const userhr = {
        id: user,
        date: dateTime,
        time: item?.time,
        value: item?.value,
      };
      fhirHeartRateIntradayData.push(userhr);
    }
  } catch (error) {
    // console.log('Error in converting endpoint data to FHIR', error);
    //throw new Error('Error in converting endpoint data to FHIR');
  }
  return { "heart_rate": fhirHeartRateIntradayData };
}


/**
 * Converts breathing rate summary data to FHIR format.
 * @param {*} data has the following columns: "dateTime", "value"; where value has the following columns: "breathingRate"
 * @param {*} user ID of the user
 * @returns {Object} - The converted breathing rate summary data in FHIR format.
 */
function convertBreathingRateSummaryToFHIR(data, user) {
  //const table_name = "breathing_rate_summary";
  const fhirBreathingRateSummary = [];
  const brData = data?.["br"];

  if (!brData || brData === undefined || brData.length === 0) {
    // console.log("No breathing rate data found");
    return {};
  }
  for (var item of brData) {
    const { dateTime, value } = item;
    // console.log("value", value?.["breathingRate"]);
    const brItem = {
      id: user,
      date: dateTime,
      value: value?.["breathingRate"],
    };
    if (!!brItem.value)
      fhirBreathingRateSummary.push(brItem);
  }
  return { "breathing_rate_summary": fhirBreathingRateSummary };
}

/**
 * Converts breathing rate intraday data to FHIR format.
 * @param {Object} data - The intraday breathing rate data with properties for different sleep summaries (deepSleepSummary, remSleepSummary, fullSleepSummary, lightSleepSummary) each containing a `breathingRate`, and a `dateTime`.
 * @example
 * {
 *   "br": [{
 *     "value": {
 *       "deepSleepSummary": { "breathingRate": 13.2 },
 *       "remSleepSummary": { "breathingRate": 12.6 },
 *       "fullSleepSummary": { "breathingRate": 13.2 },
 *       "lightSleepSummary": { "breathingRate": 12.8 }
 *     },
 *     "dateTime": "2024-03-01"
 *   }]
 * }
 * @param {string} user - The user identifier.
 * @returns {Object} - The formatted breathing rate data in FHIR format.
 */
function convertBreathingRateIntradayToFHIR(data, user) {
  const fhirBreathingRateIntraday = [];
  for (item in data?.["br"]) {
    const { dateTime, value } = data?.["br"]?.[item];
    let fhirItem = {
      id: user,
      date: dateTime,
    };

    const keys = Object.keys(value);
    for (var k of keys) {
      if (value[k]?.["breathingRate"]) {
        fhirItem = { ...fhirItem, [k]: value[k]?.["breathingRate"] };
      }
    }
    fhirBreathingRateIntraday.push(fhirItem);
  }
  return { "breathing_rate": fhirBreathingRateIntraday };
}

/**
 * Converts badges data to FHIR format.
 *
 * @param {Object} data - The badges data. The schema of the data is as follows:
    "badges": [
      {
        "badgeGradientEndColor": "FF677C",
        "badgeGradientStartColor": "D24958",
        "badgeType": "DAILY_STEPS",
        "category": "Daily Steps",
        "cheers": [],
        "dateTime": "2016-07-17",
        "description": "35,000 steps in a day",
        "earnedMessage": "Congrats on earning your first Hiking Boot badge!",
        "encodedId": "GGNJL9",
        "image100px": "https://static0.fitbit.com/images/badges_new/100px/badge_daily_steps35k.png",
        "image125px": "https://static0.fitbit.com/images/badges_new/125px/badge_daily_steps35k.png",
        "image300px": "https://static0.fitbit.com/images/badges_new/300px/badge_daily_steps35k.png",
        "image50px": "https://static0.fitbit.com/images/badges_new/badge_daily_steps35k.png",
        "image75px": "https://static0.fitbit.com/images/badges_new/75px/badge_daily_steps35k.png",
        "marketingDescription": "You've walked 35,000 steps  And earned the Hiking Boot badge!",
        "mobileDescription": "Woot, woot! There's no mountain you can't climb and no goal you can't get.",
        "name": "Hiking Boot (35,000 steps in a day)",
        "shareImage640px": "https://static0.fitbit.com/images/badges_new/386px/shareLocalized/en_US/badge_daily_steps35k.png",
        "shareText": "I took 35,000 steps and earned the Hiking Boot badge! #Fitbit",
        "shortDescription": "35,000 steps",
        "shortName": "Hiking Boot",
        "timesAchieved": 1,
        "value": 35000
      }
    ]
  }
 * @param {string} user - The user ID.
 * @returns {Object} - The badges data in FHIR format.
 */
function convertBadgesToFHIR(data, user) {
  // badges_columns = ["badgeGradientEndColor","badgeGradientStartColor","badgeType","category","cheers","dateTime","description","earnedMessage","encodedId","image100px","image125px","image300px","image50px","image75px","marketingDescription","mobileDescription","name","shareImage640px","shareText","shortDescription","shortName","timesAchieved","value","unit"]
  const fhirBadges = [];
  for (itemKey in data?.badges) {
    const item = data?.badges[itemKey];
    const userBadge = {
      id: user,
      date: item?.dateTime,
      badge_type: item?.badgeType,
      category: item?.category,
      cheers: item?.cheers,
      description: item?.description,
      earned_message: item?.earnedMessage,
      encoded_id: item?.encodedId,
      image_100px: item?.image100px,
      image_125px: item?.image125px,
      image_300px: item?.image300px,
      image_50px: item?.image50px,
      image_75px: item?.image75px,
      marketing_description: item?.marketingDescription,
      mobile_description: item?.mobileDescription,
      name: item?.name,
      share_image_640px: item?.shareImage640px,
      share_text: item?.shareText,
      short_description: item?.shortDescription,
      short_name: item?.shortName,
      times_achieved: item?.timesAchieved,
      value: item?.value,
      unit: item?.unit,
    };
    fhirBadges.push(userBadge);
  }
  return { "badges": fhirBadges };
}

/**
 * Converts devices data to FHIR format.
 *
 * @param {Array} data - The devices data to be converted.
 * @param {string} user - The user identifier.
 * @returns {Object} - The devices data in FHIR format.
 */
function convertDevicesToFHIR(data, user) {
  // "battery","deviceVersion","features","id","lastSyncTime","mac","type","device_type"
  // const devices_columns = ["battery","batteryLevel","deviceVersion","lastSyncTime"]
  const fhirDevices = [];
  for (itemKey in data) {
    const item = data[itemKey];
    const userDevice = {
      id: user,
      date: new Date().toISOString().split('T')[0],
      battery: item?.battery,
      battery_level: item?.batteryLevel,
      device_version: item?.deviceVersion,
      last_sync_time: item?.lastSyncTime,
    };
    fhirDevices.push(userDevice);
  }
  return { "device": fhirDevices };
}

/**
 * Converts friends data to FHIR format.
 *
 * @param {Array} data - The array of friends data.
 * @param {Object} user - The user object.
 * @returns {Object} - The friends data in FHIR format.
 */
function convertFriendsToFHIR(data, user) {
  // data = ["type","id","attributes.avatar","attributes.child", "attributes.firiend", "attributes.name"]
  // friends_columns = ["friend_id","type","attributes.name","attributes.friend","attributes.avatar","attributes.child"]
  const fhirFriends = [];
  for (let item of data?.data) {
    const userFriend = {
      id: user,
      date: new Date().toISOString().split('T')[0],
      friend_id: item?.id,
      type: item?.type,
      attributes_name: item?.attributes?.name,
      attributes_friend: item?.attributes?.friend,
      attributes_avatar: item?.attributes?.avatar,
      attributes_child: item?.attributes?.child,
    };
    //TODO: check if the firend is correctly defined
    fhirFriends.push(userFriend);
  }
  return { "social": fhirFriends };
}

/**
 * Converts weight logs to FHIR format.
 *
 * @param {Array} data - The weight logs data to be converted.
 * @param {string} user - The user associated with the weight logs.
 * @returns {Object} - The weight logs data in FHIR format.
 */
function convertWeightLogsToFHIR(data, user) {
  // weight_logs_columns = ["bmi","fat","logId","source","weight"]
  const fhirWeightLogs = [];
  for (let item of data?.weightLog) {
    const weightLog = {
      id: user,
      date: item?.dateTime,
      bmi: item?.bmi,
      fat: item?.fat,
      log_id: item?.logId,
      source: item?.source,
      weight: item?.weight,
    };
    //TODO: check if weightLog is correctly defined
    fhirWeightLogs.push(weightLog);
  }
  return { "body_weight": fhirWeightLogs };
}

async function insertBatchDataToBigQuery(data, projectId, datasetId) {
  // Here we have the combined data from all devices and will insert it into BigQuery
  /**
   * Result report object.
   *
   */
  const resultReport = {};
  for (let key in data) {
    const table_id = key;
    const table_data = data[key];

    // Partition the data into reasonable chunks
    const chunkSize = 100; // Adjust the chunk size as needed
    for (let i = 0; i < table_data.length; i += chunkSize) {
      const chunk = table_data.slice(i, i + chunkSize);

      // try {
      //   const [job] = await bigquery
      //     .dataset(datasetId)
      //     .table(table_id)
      //     .insert(chunk);

      //   console.log(`Inserted ${chunk.length} rows into ${table_id}`);
      //   if (!resultReport[table_id]) {
      //     resultReport[table_id] = [];
      //   }
      //   resultReport[table_id].push({
      //     chunkIndex: i / chunkSize,
      //     status: 'success',
      //     rowCount: chunk.length,
      //     jobId: job.id,
      //   });
      // } catch (error) {
      //   console.error(`Error inserting rows into ${table_id}:`, error);
      //   if (!resultReport[table_id]) {
      //     resultReport[table_id] = [];
      //   }
      //   resultReport[table_id].push({
      //     chunkIndex: i / chunkSize,
      //     status: 'error',
      //     error: error.message,
      //   });
      // }
    }
  }

  console.log('Data inserted into BigQuery , resultReport : ', printObjectDescription(resultReport));
  return resultReport;
}

/**
 * Converts activity time series (no Intraday) data to FHIR format.
 * @param {Object} data - The activity time series data.
 * @param {string} user - The user identifier.
 * @returns {Object} - The converted activity time series data in FHIR format.
 */
function convertActivityTimeSeriesToFHIR(data, user) {
  // activity_time_series_columns = ["dateTime", "value"]
  const fhirActivityTimeSeries = [];
  const key = Object.keys(data)[0]; // "activities-steps", "activities-distance", "activities-elevation", "activities-floors", "activities-calories"
  const tableName = normalizeTableName(activities_endpoints_tables_map.find(item => item.endpoint.toLowerCase() === key.toLowerCase())?.table || key);
  // console.log("key", key, data[key]);
  const data_array = data[key];
  for (var i of data_array) { //todo: it has errors
    const { dateTime, value } = i;
    const userActivityTimeSeries = {
      id: user,
      date: dateTime,
      value: value,
    };
    fhirActivityTimeSeries.push(userActivityTimeSeries);
  }
  return { [tableName]: fhirActivityTimeSeries };
}

/**
 * This function converts returned Fitbit Endpoint name into a normalized table name
 * @param {*} tableName  - The Fitbit Endpoint name
 * @returns {String} The normalized table name
 */
function normalizeTableName(tableName) {
  return tableName.replace(/-/g, "_");
}

async function prepareFilesForBigQueryInsertionFromCombinedData(data, projectId) {
  // Here we have the combined data from all devices and will prepare each table data in a speparate file with jsonl format
  /**
   * Result report object.
   *
   */
  for (let key in data) {
    const table_id = key;
    const table_data = data[key];
    if (!!table_id && !!table_data) {
      try {
        const flittleName = projectId + '-' + formatDate(new Date()) + '-' + table_id + '.jsonl';
        //const flittleName =' table_id + '.jsonl';
        //const dirName = path.join(__dirname, 'sample_fetches/'.concat(projectId).concat('/').concat(formatDate(new Date())) );
        const dirName = path.join(__dirname, 'sample_fetches/bq_output');
        //console.log('dirName', dirName);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName);
        }
        const fpath = path.join(__dirname, 'sample_fetches/bq_output/', flittleName);
        console.log('fpath', fpath);
        writeDataToJsonlFile(table_data, fpath)
      } catch (err) {
        console.error('Error while preparing data for BigQuery insertion', err);
      }
    }
  }
  return data;
}

// Function to convert data to JSONL and write to a file
function writeDataToJsonlFile(data, filePath) {
  let jsonlContent = '';
  data.forEach(item => {
    jsonlContent += JSON.stringify(item) + '\n';
  });
  fs.writeFileSync(filePath, jsonlContent);
}

