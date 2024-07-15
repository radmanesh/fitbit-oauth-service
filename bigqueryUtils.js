const { BigQuery } = require('@google-cloud/bigquery');
const { printObjectDescription, flattenToString } = require('./utils.js');
const { createTableByName, checkTableExists } = require('./bigQueryTables.js');

const datasetId = 'jamasp_fitbit';
const bigquery = new BigQuery();

exports.insertIntoBigQuery = async (data, user_id, participantUid, table_id, sensor) => {
  // console.log('Inserting data into BigQuery... ' + user_id);

  //console.log("insertingIntoBigQuery, this is the data input : %s", flattenToString(data));
  //console.log(printObjectDescription(data) );
  //console.log("data: ", JSON.stringify(data, null, 4));
  // console.log("data", printObjectDescription(data));
  if (!data || typeof data !== 'array' || data.length <= 0) {
    console.error('Data is empty or not an array.');
    return Promise.reject('Data is empty or not an array.');
  }
  // insert data into the table
  try {
    // normalize the data
    const normalizedData = normalizeData(data);
    const table = bigquery.dataset(datasetId).table(table_id);
    const res = await table.insert(normalizedData);
    // console.log(`Inserted ${res[0]}`);
    console.debug(flattenToString(res));
    return res;
  } catch (err) {
    console.error('Error inserting data into BigQuery: ', err);
    return Promise.reject(err);
  }
}
/**
 * normalizeData - for now just ensures that none of the values are undefined and converts them to null,
 * also it should coverts the data to the correct type like timestamp, integer, float, etc.
 * @param {*} data
 */
function normalizeData(data) {
  return data.map((d) => {
    for (const key in d) {
      if (d[key] === undefined) {
        d[key] = null;
      }
    }
    return d;
  });
}

