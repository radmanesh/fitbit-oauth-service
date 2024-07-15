const { default: axios } = require("axios");
const admin = require("firebase-admin");
const qs = require("qs");
const { timezones, timezones_limited } = require("./timezones");
const config = require("./config.json");

exports.getUserByFitbitUserId = async (fitbitUserId, db) => {
  const usersRef = db.collection("users");
  // Replace with your actual collection name
  const snapshot = await usersRef
    .where("fitbitData.user_id", "==", fitbitUserId)
    .get();

  if (!snapshot.empty) {
    const users = [];
    snapshot.forEach((doc) => users.push(doc.data()));
    return users[0];
  }
};

/**
 * Checks the expiration of the Fitbit token and refreshes it if necessary.
 * @param {string} userId - The ID of the user.
 * @param {object} fitbitData - The Fitbit data containing the access token,
 *   refresh token, expiration time, and timestamp.
 * @param {object} db - The Firebase Firestore database instance.
 * @param {boolean} [force=false] - A flag to force the token refresh.
 * @return {Promise<object>} - A promise that resolves with the
 *   updated Fitbit data.
 */
exports.checkAndRefreshToken = async (
  userId,
  fitbitData,
  db,
  force = false
) => {
  console.log(
    "checkAndRefreshToken, userId: %o , fitbitData: %o",
    userId,
    fitbitData
  );
  if (force || checkTokenExpiration(fitbitData)) {
    console.log("Token expired, refreshing...");
    const result = await refreshToken(fitbitData).catch((err) => {
      console.error("Error refreshing Fitbit token: ", err);
      return Promise.reject(new Error("Error refreshing Fitbit token"));
    });
    if (result?.data?.access_token) {
      console.log("Fitbit token refreshed: ", result.data);
      fitbitData.access_token = result.data.access_token;
      fitbitData.refresh_token = result.data.refresh_token;
      fitbitData.expires_in = result.data.expires_in;
      fitbitData.timestamp = admin.firestore.FieldValue.serverTimestamp();
      console.log("fitbitData: %o", fitbitData);
      await db.collection("users").doc(userId).get().then((doc) => {
        if (doc.exists) {
          doc.ref.update({
            fitbitData,
          }).catch((err) => {
            console.error("Error updating Fitbit data: ", err);
            Promise.reject(new Error("Error updating Fitbit data"));
          });
          console.log("fitbitData updated");
          return Promise.resolve(fitbitData);
        } else {
          error("Error refreshing Fitbit token: ", result);
          return Projmise.reject(new Error("Error refreshing Fitbit token"));
        }
      });
    } else {
      error("Error refreshing Fitbit token: ", result);
      return Projmise.reject(new Error("Error refreshing Fitbit token"));
    }
  } else {
    console.log("Token is still valid");
    return Promise.resolve(fitbitData);
  }
};

// Check if access token is expired
/**
 * Checks if the Fitbit token has expired.
 * @param {Object} fitbitData - The Fitbit data containing the token information.
 * @param {number} [offset=0] - The offset value for expiration time in milliseconds.
 * @return {boolean} - True if the token has expired, false otherwise.
 */
function checkTokenExpiration(fitbitData, offset = 0) {
  const now = new Date().getTime();
  const expiration = fitbitData?.timestamp?.toMillis() +
    fitbitData?.expires_in * 1000;
  return now > expiration + offset;
}


// Refresh access token
/**
 * Refreshes the access token using the Fitbit API.
 * @param {object} fitbitData - The Fitbit data containing the refresh token.
 * @return {Promise} A promise that resolves with the refreshed access token.
 */
async function refreshToken(fitbitData) {
  const baseInfo = Buffer.from(`${config.clientID}:${config.clientSecret}`)
    .toString("base64");
  const data = {
    grant_type: "refresh_token",
    refresh_token: fitbitData.refresh_token,
  };
  return axios({
    url: "https://api.fitbit.com/oauth2/token",
    method: "post",
    headers: {
      Authorization: `Basic ${baseInfo}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(data),
  }).catch((err) => {
    try {
      console.error(
        "Error refreshing Fitbit token: ",
        JSON.stringify(err, null, 2)
      );
      const errorMessage = flattenToString(err);
      console.error(
        "Error refreshing access token: %o , \r\n flatter: %s",
        err,
        errorMessage
      );
      console.log(
        "Error messages (%s) : %o",
        err?.data?.errors?.length,
        err?.data?.errors
      );
      for (let e in err?.data?.errors)
        console.log(
          "error: %o, type: %s, message: %s",
          e,
          typeof e,
          e?.message
        );
    } catch (err) {
      return Promise.reject(new Error("Error refreshing Fitbit token"));
    }
    return;
  });
}

// Usage
// JSON.stringify({c: 1, a: { d: 0, c: 1, e: {a: 0, 1: 4}}}, replacer);
/**
 * A function used as a replacer in JSON.stringify to sort the keys of an object.
 *
 * @param {string} key - The current key being processed.
 * @param {any} value - The value associated with the current key.
 * @return {any} - The sorted object or the original value.
 */
const sort_replacer = (key, value) =>
  value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = value[key];
        return sorted;
      }, {})
    : value;

const replacer = (key, value, forceSort = false) => {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item) => replacer(key, item, forceSort));
    } else {
      let output = Object.entries(value).map(([key, value]) => [
        key,
        replacer(key, value),
      ]);
      if (forceSort) {
        output = output
          .sort(([key1], [key2]) => key1.localeCompare(key2))
          .reduce(
            (obj, [key, value]) => {
              obj[key] = value;
              return obj;
            },
            {}
          );
        return output;
      } else {
        return output.reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      }
    }
  } else {
    return value;
  }
};

/**
 * Flattens the given data into a string representation.
 *
 * @param {any} data - The data to be flattened.
 * @return {string} - The flattened string representation of the data.
 */
const flattenToString = (data, seen = new Set()) => {
  if (Array.isArray(data)) {
    const sArr = data.map((item) => flattenToString(item, seen));
    return `[${sArr.join(",")}]`;
  } else if (typeof data === "object" && data !== null) {
    if (seen.has(data)) {
      return '"[Circular]"';
    }
    seen.add(data);
    const sObj = Object.entries(data)
      .map(([key, value]) => `"${key}":${flattenToString(value, seen)}`)
      .join(",");
    seen.delete(data);
    return `{${sObj}}`;
  } else {
    return JSON.stringify(data);
  }
};

const fitbitApiBaseUrl = "https://api.fitbit.com";
/**
 * Generates an API endpoint URL based on the provided sensor
 *    and sensor settings.
 * @param {Object} sensor - The sensor object.
 * @param {Object} sensorSettings - The sensor settings object.
 * @return {string} The generated API endpoint URL.
 */
exports.generateAPIEndpointFromDownloadSettings = (
  sensor,
  sensorSettings,
  forceStartDate = null,
  forceEndDate = null
) => {
  const apiParams = Object.assign(
    {},
    ...sensor.arguments.map((arg, index) => {
      let value = sensorSettings.arguments[arg.name]
        ? sensorSettings.arguments[arg.name]
        : sensor.defaultValues[index];
      if (!!forceStartDate && (arg.name === "start-date" || arg.name === "date")) {
        value = forceStartDate;
        console.log("forceStartDate: %o", value);
      }
      if (!!forceEndDate && arg.name === "end-date") {
        value = forceEndDate;
        console.log("forceEndDate: %o", value);
      }
      // if ((arg === 'start-date' || arg === 'end-date') && value.toDate) {
      //    value = moment(value.toDate()).format('YYYY-MM-DD');
      // }
      return { [arg.name]: value };
    })
  );

  const endpointUrl =
    fitbitApiBaseUrl +
    sensor.link.replace(/\[(.*?)\]/g, (match, p1) => apiParams[p1]);
  return endpointUrl;
};

/**
 * Generates an Axios configuration object from the download sensor data.
 * @param {string} fitbitData - The Fitbit access token.
 * @param {string} sensor - The sensor data.
 * @param {object} sensorSettings - The sensor settings.
 * @return {object} The Axios configuration object.
 */
exports.generateAxiosConfigFromDownloadSettings = (
  fitbitData,
  sensor,
  sensorSettings,
  forceStartDate = null
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${fitbitData.access_token}`,
      "Content-Type": "application/json",
    },
  };
  if (
    !!sensorSettings &&
    !!sensorSettings?.parameters &&
    sensorSettings?.parameters?.length > 0
  ) {
    for (const item of Object.entries(sensorSettings.parameters)) {
      const [key, value, type] = item;
      // TODO: This approach doesn't work for all endpoinsts, we need to find a better way to handle this
      // for example define max range for each endpoint in sensorsDownload and based on that calculate the start and end date
      if (!!forceStartDate && type === "date") {
        value = forceStartDate;
        console.log("forceStartDate: %o", value);
      }
      config.params = { ...config.params, [key]: value };
    }
  }
  return config;
};

/**
 * Generates an API endpoint URL based on the provided sensorCron Settings
 * @param {Object} cronSensor - The sensor object from cronJobSensors.
 * @param {Object} cronSensorSettings - The cron sensor settings object from project.
 * @return {string} The generated API endpoint URL.
 */
exports.generateAPIEndpointFromCronSettings = (
  cronSensor,
  cronSensorSettings
) => {
  let apiParams = {};
  if (cronSensor?.arguments?.length > 0) {
    apiParams = Object.assign(
      {},
      ...cronSensor?.arguments?.map((arg, index) => {
        if (arg.type === "date") {
          const date = new Date();
          date.setHours(1);
          date.setMinutes(0);
          date.setSeconds(0);
          const output = { [arg.name]: formatDate(date) };
          return output;
        }
        const value = cronSensorSettings.arguments[arg.name]
          ? cronSensorSettings.arguments[arg.name]
          : cronSensor.defaultValues[index];
        const output = { [arg.name]: value };
        return output;
        // if ((arg === 'start-date' || arg === 'end-date') && value.toDate) {
        //    value = moment(value.toDate()).format('YYYY-MM-DD');
        // }
      }));
  }
  const endpointUrl = fitbitApiBaseUrl +
    cronSensor.link.replace(/\[(.*?)\]/g, (match, p1) => apiParams[p1]);
  console.log("endpoint result : ", endpointUrl);
  return endpointUrl;
};


/**
 * Generates an Axios configuration object from the cronSettings in project database.
 * @param {string} fitbitData - The Fitbit access token.
 * @param {object} cronSensorSettings - The cron fetch settings.
 * @return {object} The Axios configuration object.
 */
exports.generateAxiosConfigFromCronSettings = (
  fitbitData,
  cronSensorSettings
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${fitbitData.access_token}`,
      "Content-Type": "application/json",
    },
  };
  if (
    !!cronSensorSettings &&
    !!cronSensorSettings?.parameters &&
    cronSensorSettings?.parameters?.length > 0
  ) {
    for (const [key, value] of Object.entries(cronSensorSettings.parameters)) {
      config.params = { ...config.params, [key]: value };
    }
  }
  return config;
};


/**
 * Generates a file name for the downloaded sensor data.
 * @param {string} fetchJobId - The fetch job ID.
 * @param {object} endpoint - The endpoint object.
 * @return {string} The generated file name.
 */
exports.generateDownloadFileName = (fetchJobId, endpoint) => {
  const date = new Date();
  const fileName =
    `${endpoint.projectId}/${fetchJobId}/` +
    `${endpoint.device_id}/${date.toISOString().substring(0, 10)}_` +
    `${endpoint.sensor.replace(/ /g, "_")}.json`;
  return fileName;
};



/**
 * Formats a date string or object to "yyyy-MM-dd" format.
 * If the input is already in "yyyy-MM-dd" format, it returns the input as is.
 * If the input is not in "yyyy-MM-dd" format, it tries to convert it to a Date object and formats it as "yyyy-MM-dd".
 * If the input is not a string or a Date object, it returns the input as is.
 *
 * @param {string|Date} date - The date to be formatted.
 * @return {string} The formatted date in "yyyy-MM-dd" format.
 */
const formatDate = (date) => {
  let newDate;
  if (typeof date === "string") {
    // check if the date as a stingis in the format "yyyy-MM-dd"
    if (date.match(/^\d{4}-\d{2}-\d{2}$/) !== null) {
      return date;
    } else {
      // if the date is not in the format "yyyy-MM-dd"
      // convert it to a Date object and  the rest will format it as "yyyy-MM-dd"
      try {
        newDate = new Date(date);
      } catch (err) { // if we couldnt convert the date we will use today's date //TDOO: check for a better approach
        console.log("formatDate: ", err);
        newDate = new Date();
      }
    }
  } else {
    newDate = date;
  }
  const formatter = new Intl.DateTimeFormat("en-NY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedDate = formatter.format(newDate);
  return formattedDate.replace(/\//g, "-");
};

/**
 * Converts a date to a Firestore Timestamp.
 *
 * @param {Date|string|number} date - The date to convert.
 * @returns {Timestamp} The Firestore Timestamp.
 */
const getTimestampFromDate = (date) => {
  console.log("getTimeFromDate : %o , type : %s", date, typeof date);
  let date_time;
  try {
    date_time = Timestamp.fromDate(new Date(date));
  } catch (err) {
    console.log("getTimeFromDate: error: Timestamp.fromDate(new Date(date)) : ", err);
    try {
      date_time = Timestamp.fromDate(date);
    } catch (err) {
      console.log("getTimeFromDate: error : Timestamp.fromDate(date) : ", err);
    }
    date_time = Timestamp.fromDate(new Date());
  }
  return date_time;
};

/**
 * Converts the input date to a formatted date string.
 * If the input date is "today", it returns the current date.
 * If the input date is in the format "DD-MM-YYYY", it converts it to a Date object and returns the formatted date string.
 * If the input date is invalid or cannot be converted, it returns the current date.
 *
 * @param {string} inputDate - The input date to be converted.
 * @returns {string|null} The formatted date string or null if the input date is invalid.
 */
const convertDefaultDate = (inputDate) => {
  console.log("convertDefaultDate", inputDate);
  if (!inputDate) return null;

  if (typeof inputDate === "string") {
    if (inputDate === "today") {
      console.log("today");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const formattedDate = formatDate(today);
      console.log("formattedDate", formattedDate);
      return formattedDate;
    } else {
      try {
        const date = Date?.parse(inputDate);
        if (!(!!date && date instanceof Date)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return formatDate(today);
        }
      } catch (err) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return formatDate(today);
      }
    }
  }
  return inputDate;
};

const datesInDateRange = (startDate, endDate) => {
  const dates = [];
  try {
    const inputDataType = typeof startDate;
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate)
    while (currentDate <= endDate) {
      if (inputDataType === "string")
        dates.push(formatDate(currentDate));
      else
        dates.push(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } catch (err) {
    console.error("Error generating dates in range: %o", err);
  }
  return dates;
};

/**
 * This function prints and returns the structure of any input object type, even if it is nested or a simple elementary type.
 * @param {any} obj - The input object.
 * @returns {any} The input object.
 */
const MAX_ARRAY_ELEMENTS = 3; // Maximum number of elements to display in arrays
const MAX_DEPTH = 5; // Maximum depth to display nested objects and arrays

function getConciseJson(obj, maxArrayElements = MAX_ARRAY_ELEMENTS, maxDepth = MAX_DEPTH, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    return '...'; // Indicate that deeper levels are not shown
  }

  if (Array.isArray(obj)) {
    const result = obj.slice(0, maxArrayElements).map(item =>
      getConciseJson(item, maxArrayElements, maxDepth, currentDepth + 1)
    );
    if (obj.length > maxArrayElements) {
      result.push(`... (${obj.length - maxArrayElements} more elements)`);
    }
    return result;
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = getConciseJson(obj[key], maxArrayElements, maxDepth, currentDepth + 1);
      }
    }
    return result;
  } else {
    return obj;
  }
}

function sizeOf(variable) {
  if (variable === null || variable === undefined) {
    return 0;
  } else if (Array.isArray(variable)) {
    return variable.length;
  } else if (typeof variable === 'object') {
    return Object.keys(variable).length;
  } else if (typeof variable === 'string') {
    return variable.length;
  }
  // } else if (typeof variable === 'number') {
  //   return Math.floor(Math.log10(variable)) + 1;
  // }
  else {
    // If it's not an object or array, it doesn't have a "size" in the same sense,
    // but you might want to handle other types differently.
    return 1;
  }
}

exports.convertDefaultDate = convertDefaultDate;
exports.getDatesInDateRange = datesInDateRange;
exports.replacer = sort_replacer;
exports.flattenToString = flattenToString;
exports.formatDate = formatDate;
exports.getTimestampFromDate = getTimestampFromDate;
exports.sizeOf = sizeOf;
exports.printObjectDescription = getConciseJson;

