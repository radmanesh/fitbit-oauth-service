const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const { flattenToString } = require('./utils');

const datasetId = 'jamasp_fitbit';
const bigquery = new BigQuery();


/**
 * Array of tables in Google BigQuery.
 *
 * @typedef {Array<Object>} Tables These are supposed to include every possinble endpoint fitbit offers, so this variable can be
 * considered as a reference for fitbit endpoints supported and the tables that will be created.
 *
 * @property {string} name - The name of the table.
 * @property {Array<Object>} schema - The schema of the table.
 */

/**
 * The schema of a table in Google BigQuery.
 *
 * @typedef {Object} TableSchema
 *
 * @property {string} name - The name of the column.
 * @property {string} type - The data type of the column.
 * @property {string} [mode] - The mode of the column. Possible values: 'NULLABLE', 'REQUIRED', 'REPEATED'.
 * @property {string} [description] - The description of the column.
 */
const tables = [
  {
    name: 'device',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'battery', type: 'STRING', description: 'Returns the battery level of the device. Supported: High | Medium | Low | Empty' },
      { name: 'battery_level', type: 'INTEGER', description: 'Returns the battery level percentage of the device.' },
      { name: 'device_version', type: 'STRING', description: 'The product name of the device.' },
      { name: 'last_sync_time', type: 'TIMESTAMP', description: 'Timestamp representing the last time the device was syncd with the Fitbit mobile application.' }
    ]
  },
  {
    name: 'badges',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'name', type: 'STRING', mode: 'REQUIRED', description: 'The name of the badge' },
      { name: 'badge_gradient_end_color', type: 'STRING' },
      { name: 'badge_gradient_start_color', type: 'STRING' },
      { name: 'badge_type', type: 'STRING', description: 'Type of badge received.' },
      { name: 'category', type: 'STRING' },
      { name: 'date_time', type: 'STRING', description: 'Date the badge was achieved.' },
      { name: 'description', type: 'STRING' },
      { name: 'image_100px', type: 'STRING' },
      { name: 'image_125px', type: 'STRING' },
      { name: 'image_300px', type: 'STRING' },
      { name: 'image_50px', type: 'STRING' },
      { name: 'image_75px', type: 'STRING' },
      { name: 'share_image_640px', type: 'STRING' },
      { name: 'share_text', type: 'STRING' },
      { name: 'short_name', type: 'STRING' },
      { name: 'times_achieved', type: 'INTEGER', description: 'Number of times the user has achieved the badge.' },
      { name: 'value', type: 'INTEGER', description: 'Units of measure based on localization settings.' },
      { name: 'unit', type: 'STRING', description: 'The badge goal in the unit measurement.' }
    ]
  },
  {
    name: 'activity_goals',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'active_minutes', type: 'INTEGER', description: 'User defined goal for daily active minutes.' },
      { name: 'calories_out', type: 'INTEGER', description: 'User defined goal for daily calories burned.' },
      { name: 'distance', type: 'FLOAT', description: 'User defined goal for daily distance traveled.' },
      { name: 'floors', type: 'INTEGER', description: 'User defined goal for daily floor count.' },
      { name: 'steps', type: 'INTEGER', description: 'User defined goal for daily step count.' }
    ]
  },
  {
    name: 'activity_logs',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'activity_id', type: 'INTEGER', description: 'The ID of the activity.' },
      { name: 'activity_parent_id', type: 'INTEGER', description: 'The ID of the top level (\'parent\') activity.' },
      { name: 'activity_parent_name', type: 'STRING', description: 'The name of the top level (\'parent\') activity.' },
      { name: 'calories', type: 'INTEGER', description: 'Number of calories burned during the exercise.' },
      { name: 'description', type: 'STRING', description: 'The description of the recorded exercise.' },
      { name: 'distance', type: 'FLOAT', description: 'The distance traveled during the recorded exercise.' },
      { name: 'duration', type: 'INTEGER', description: 'The activeDuration (milliseconds) + any pauses that occurred during the activity recording.' },
      { name: 'has_active_zone_minutes', type: 'BOOLEAN', description: 'True | False' },
      { name: 'has_start_time', type: 'BOOLEAN', description: 'True | False' },
      { name: 'is_favorite', type: 'BOOLEAN', description: 'True | False' },
      { name: 'log_id', type: 'INTEGER', description: 'The activity log identifier for the exercise.' },
      { name: 'name', type: 'STRING', description: 'Name of the recorded exercise.' },
      { name: 'steps', type: 'INTEGER', description: 'User defined goal for daily step count.' },
      { name: 'start_datetime', type: 'TIMESTAMP', description: 'The start time of the recorded exercise.' }
    ]
  },
  {
    name: 'activity_summary',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'activity_score', type: 'INTEGER', description: 'No Description' },
      { name: 'activity_calories', type: 'INTEGER', description: 'The number of calories burned for the day during periods the user was active above sedentary level. This includes both activity burned calories and BMR.' },
      { name: 'calories_bmr', type: 'INTEGER', description: 'Total BMR calories burned for the day.' },
      { name: 'calories_out', type: 'INTEGER', description: 'Total calories burned for the day (daily timeseries total).' },
      { name: 'elevation', type: 'INTEGER', description: 'The elevation traveled for the day.' },
      { name: 'fairly_active_minutes', type: 'INTEGER', description: 'Total minutes the user was fairly/moderately active.' },
      { name: 'floors', type: 'INTEGER', description: 'The equivalent floors climbed for the day.' },
      { name: 'lightly_active_minutes', type: 'INTEGER', description: 'Total minutes the user was lightly active.' },
      { name: 'marginal_calories', type: 'INTEGER', description: 'Total marginal estimated calories burned for the day.' },
      { name: 'resting_heart_rate', type: 'INTEGER', description: 'The resting heart rate for the day' },
      { name: 'sedentary_minutes', type: 'INTEGER', description: 'Total minutes the user was sedentary.' },
      { name: 'steps', type: 'INTEGER', description: 'Total steps taken for the day.' },
      { name: 'very_active_minutes', type: 'INTEGER', description: 'Total minutes the user was very active.' }
    ]
  },
  {
    name: 'heart_rate',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'INTEGER' },
      { name: 'datetime', type: 'TIMESTAMP' }
    ]
  },
  {
    name: 'heart_rate_zones',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'out_of_range_calories_out', type: 'FLOAT', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'out_of_range_minutes', type: 'INTEGER', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'out_of_range_min_hr', type: 'INTEGER', description: 'Minimum range for the heart rate zone.' },
      { name: 'out_of_range_max_hr', type: 'INTEGER', description: 'Maximum range for the heart rate zone.' },
      { name: 'fat_burn_calories_out', type: 'FLOAT', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'fat_burn_minutes', type: 'INTEGER', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'fat_burn_min_hr', type: 'INTEGER', description: 'Minimum range for the heart rate zone.' },
      { name: 'fat_burn_max_hr', type: 'INTEGER', description: 'Maximum range for the heart rate zone.' },
      { name: 'cardio_calories_out', type: 'FLOAT', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'cardio_minutes', type: 'INTEGER', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'cardio_min_hr', type: 'INTEGER', description: 'Minimum range for the heart rate zone.' },
      { name: 'cardio_max_hr', type: 'INTEGER', description: 'Maximum range for the heart rate zone.' },
      { name: 'peak_calories_out', type: 'FLOAT', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'peak_minutes', type: 'INTEGER', description: 'Number calories burned with the specified heart rate zone.' },
      { name: 'peak_min_hr', type: 'INTEGER', description: 'Minimum range for the heart rate zone.' },
      { name: 'peak_max_hr', type: 'INTEGER', description: 'Maximum range for the heart rate zone.' }
    ]
  },
  {
    name: 'HRV_intraday_date',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'rmssd', type: 'FLOAT', description: 'rmssd value real mean squared deviation' },
      { name: 'coverage', type: 'FLOAT', description: 'coverage value' },
      { name: 'hf', type: 'FLOAT', description: 'hf value' },
      { name: 'lf', type: 'FLOAT', description: 'lf value' },
      { name: 'dateTime', type: 'TIMESTAMP' }
    ]
  },
  {
    name: 'intraday_steps',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'INTEGER', description: 'Number of steps at this time' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' }
    ]
  },
  {
    name: 'intraday_elevation',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' }
    ]
  },
  {
    name: 'intraday_floors',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' }
    ]
  },
  {
    name: 'intraday_calories',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'level', type: 'INTEGER' },
      { name: 'mets', type: 'INTEGER', description: 'METs value at the moment when the resource was recorded.' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' }
    ]
  },
  {
    name: 'intraday_distances',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' }
    ]
  },
  {
    name: 'profile',
    schema: [
      { name: 'id', type: 'STRING', description: 'Primary Key' },
      { name: 'date', type: 'DATE', description: 'Date of authorization' },
      { name: 'user_age', type: 'INTEGER', description: 'The age based on their specified birthday in the user\'s account settings.' },
      { name: 'user_city', type: 'STRING', description: 'The city specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_state', type: 'STRING', description: 'The state specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_country', type: 'STRING', description: 'The country specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_date_of_birth', type: 'DATE', description: 'The birthday date specified in the user\'s account settings.' },
      { name: 'user_display_name', type: 'STRING', description: 'The name shown when the user\'s friends look at their Fitbit profile, send a message, or other interactions within the Friends section of the Fitbit app or fitbit.com dashboard, such as challenges.' },
      { name: 'user_encoded_id', type: 'STRING', description: 'The encoded ID of the user. Use "-" (dash) for current logged-in user.' },
      { name: 'user_full_name', type: 'STRING', description: 'The full name value specified in the user\'s account settings.' },
      { name: 'user_gender', type: 'STRING', description: 'The user\'s specified gender.' },
      { name: 'user_height', type: 'FLOAT', description: 'The height value specified in the user\'s account settings.' },
      { name: 'user_height_unit', type: 'STRING', description: 'The unit system defined in the user\'s account settings. See Localization.' },
      { name: 'mets', type: 'INTEGER', description: 'METs value at the moment when the resource was recorded.' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' },
    ]
  },
  {
    name: 'intraday_distances',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The specified resource\'s value at the time it is recorded.' },
      { name: 'date_time', type: 'TIMESTAMP', description: 'Time of day' },
    ]
  },
  {
    name: 'profile',
    schema: [
      { name: 'id', type: 'STRING', description: 'Primary Key' },
      { name: 'date', type: 'DATE', description: 'Date of authorization' },
      { name: 'user_age', type: 'INTEGER', description: 'The age based on their specified birthday in the user\'s account settings.' },
      { name: 'user_city', type: 'STRING', description: 'The city specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_state', type: 'STRING', description: 'The state specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_country', type: 'STRING', description: 'The country specified in the user\'s account settings. Location scope is required to see this value.' },
      { name: 'user_date_of_birth', type: 'DATE', description: 'The birthday date specified in the user\'s account settings.' },
      { name: 'user_display_name', type: 'STRING', description: 'The name shown when the user\'s friends look at their Fitbit profile, send a message, or other interactions within the Friends section of the Fitbit app or fitbit.com dashboard, such as challenges.' },
      { name: 'user_encoded_id', type: 'STRING', description: 'The encoded ID of the user. Use "-" (dash) for current logged-in user.' },
      { name: 'user_full_name', type: 'STRING', description: 'The full name value specified in the user\'s account settings.' },
      { name: 'user_gender', type: 'STRING', description: 'The user\'s specified gender.' },
      { name: 'user_height', type: 'FLOAT', description: 'The height value specified in the user\'s account settings.' },
      { name: 'user_height_unit', type: 'STRING', description: 'The unit system defined in the user\'s account settings. See Localization.' },
      { name: 'user_timezone', type: 'STRING', description: 'The timezone defined in the user\'s account settings.' },
      { name: 'surgery_date', type: 'DATE' },
    ]
  },
  {
    name: 'temp_skin',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'dateTime', type: 'DATE', mode: 'REQUIRED', description: 'The date of the measurements' },
      { name: 'log_type', type: 'FLOAT', description: 'The type of skin temperature log created' },
      { name: 'nightly_relative', type: 'FLOAT', description: 'The user\'s average temperature during a period of sleep.' },
    ]
  },
  {
    name: 'sleep',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'awake_count', type: 'INTEGER', description: 'Number of times woken up' },
      { name: 'awake_duration', type: 'INTEGER', description: 'Amount of time the user was awake' },
      { name: 'awakenings_count', type: 'INTEGER', description: 'Number of times woken up' },
      { name: 'date_of_sleep', type: 'DATE', description: 'The date the user fell asleep' },
      { name: 'duration', type: 'INTEGER', description: 'Length of the sleep in milliseconds.' },
      { name: 'efficiency', type: 'INTEGER', description: 'Calculated sleep efficiency score. This is not the sleep score available in the mobile application.' },
      { name: 'end_time', type: 'TIMESTAMP', description: 'Time the sleep log ended.' },
      { name: 'is_main_sleep', type: 'BOOLEAN', description: 'True | False' },
      { name: 'log_id', type: 'INTEGER', description: 'Sleep log ID.' },
      { name: 'minutes_after_wakeup', type: 'INTEGER', description: 'The total number of minutes after the user woke up.' },
      { name: 'minutes_asleep', type: 'INTEGER', description: 'The total number of minutes the user was asleep.' },
      { name: 'minutes_awake', type: 'INTEGER', description: 'The total number of minutes the user was awake.' },
      { name: 'minutes_to_fall_asleep', type: 'INTEGER', description: 'The total number of minutes before the user falls asleep. This value is generally 0 for autosleep created sleep logs.' },
      { name: 'restless_count', type: 'INTEGER', description: 'The total number of times the user was restless' },
      { name: 'restless_duration', type: 'INTEGER', description: 'The total amount of time the user was restless' },
      { name: 'start_time', type: 'TIMESTAMP', description: 'Time the sleep log begins.' },
      { name: 'time_in_bed', type: 'INTEGER', description: 'Total number of minutes the user was in bed.' },
    ]
  },
  {
    name: 'sleep_summary',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'total_minutes_asleep', type: 'INTEGER', description: 'Total number of minutes the user was asleep across all sleep records in the sleep log.' },
      { name: 'total_sleep_records', type: 'INTEGER', description: 'The number of sleep records within the sleep log.' },
      { name: 'total_time_in_bed', type: 'INTEGER', description: 'Total number of minutes the user was in bed across all records in the sleep log.' },
      { name: 'stages_deep', type: 'INTEGER', description: 'Total time of deep sleep' },
      { name: 'stages_light', type: 'INTEGER', description: 'Total time of light sleep' },
      { name: 'stages_rem', type: 'INTEGER', description: 'Total time of REM sleep' },
      { name: 'stages_wake', type: 'INTEGER', description: 'Total time awake' },
    ]
  },
  {
    name: 'sleep_minutes',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'date_time', type: 'TIMESTAMP' },
      { name: 'value', type: 'INTEGER' },
    ]
  },
  {
    name: 'social',
    schema: [
      { name: 'id', type: 'STRING', description: 'Primary Key' },
      { name: 'date', type: 'DATE', description: 'The date values were extracted' },
      { name: 'friend_id', type: 'STRING', description: 'Fitbit user id' },
      { name: 'type', type: 'STRING', description: 'Fitbit user id' },
      { name: 'attributes_name', type: 'STRING', description: 'Person\'s display name.' },
      { name: 'attributes_friend', type: 'BOOLEAN', description: 'The product name of the device.' },
      { name: 'attributes_avatar', type: 'STRING', description: 'Link to user\'s avatar picture.' },
      { name: 'attributes_child', type: 'BOOLEAN', description: 'Boolean value describing friend as a child account.' },
    ]
  },
  {
    name: 'body_weight',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'bmi', type: 'FLOAT', description: 'Calculated BMI in the format X.XX' },
      { name: 'fat', type: 'FLOAT', description: 'The body fat percentage.' },
      { name: 'log_id', type: 'INTEGER', description: 'Weight Log IDs are unique to the user, but not globally unique.' },
      { name: 'source', type: 'STRING', description: 'The source of the weight log.' },
      { name: 'weight', type: 'FLOAT', description: 'Weight in the format X.XX,' },
    ]
  },
  {
    name: 'spo2',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'avg', type: 'FLOAT', description: 'The mean of the 1 minute SpO2 levels calculated as a percentage value.' },
      { name: 'min', type: 'FLOAT', description: 'The minimum daily SpO2 level calculated as a percentage value.' },
      { name: 'max', type: 'FLOAT', description: 'The maximum daily SpO2 level calculated as a percentage value.' },
    ]
  },
  {
    name: 'spo2_intraday',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The percentage value of SpO2 calculated at a specific date and time in a single day.' },
      { name: 'minute', type: 'DATETIME', description: 'The date and time at which the SpO2 measurement was taken.' },
    ]
  },
  {
    name: 'vo2_max_summary',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'vo2_max', type: 'STRING', description: 'The VO2 max value' }, // The output is sometimes in the format of one number or two numbers separated by a hyphen.
    ]
  },
  // {
  //   name: 'daily_activity_summary',
  //   schema: [
  //     { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
  //     { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
  //     // Additional schema fields can be added here if needed
  //   ]
  // },
  {
    name: 'breating_rate_summary',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The number of breaths per minute.' },
    ]
  },
  {
    name: 'breating_rate_intraday',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'deep_sleep_summary', type: 'FLOAT', description: 'The number of breaths per minute in deep sleep stages.' },
      { name: 'light_sleep_summary', type: 'FLOAT', description: 'The number of breaths per minute in light sleep stages.' },
      { name: 'rem_sleep_summary', type: 'FLOAT', description: 'The number of breaths per minute in REM sleep stages.' },
      { name: 'full_sleep_summary', type: 'FLOAT', description: 'The number of breaths per minute in full sleep stages.' },
    ]
  },
  {
    name: 'life_time_stats',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'best_total_distance', type: 'FLOAT', description: 'The best total distance in meters' },
      { name: 'best_total_steps', type: 'INTEGER', description: 'The best total steps' },
      { name: 'lifetime_total_distance', type: 'FLOAT', description: 'The lifetime total distance in meters' },
      { name: 'lifetime_total_steps', type: 'INTEGER', description: 'The lifetime total steps' },
      { name: 'lifetime_tracker_distance', type: 'FLOAT', description: 'The lifetime tracker distance in meters' },
      { name: 'lifetime_tracker_steps', type: 'INTEGER', description: 'The lifetime tracker steps' },
      { name: 'best_tracker_distance', type: 'FLOAT', description: 'The best tracker distance in meters' },
      { name: 'best_tracker_steps', type: 'INTEGER', description: 'The best tracker steps' },
    ]
  },
  {
    name: 'azm_intraday',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'FLOAT', description: 'The number of breaths per minute.' },
      { name: 'time', type: 'TIMESTAMP', description: 'The time of the measurement' },
    ]
  },
  {
    name: 'breathing_rate',
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'deepSleepSummary', type: 'FLOAT', description: 'The number of breaths per minute in deep sleep stages' },
      { name: 'lightSleepSummary', type: 'FLOAT', description: 'The number of breaths per minute in light sleep stages' },
      { name: 'remSleepSummary', type: 'FLOAT', description: 'The number of breaths per minute in REM sleep stages' },
      { name: 'fullSleepSummary', type: 'FLOAT', description: 'The number of breaths per minute in full sleep stages' },
    ]
  }
];

/**
 * Mapping of activities endpoints to corresponding BigQuery tables.
 * @type {Array<{table: string, endpoint: string, short: string}>}
 */
const activities_endpoints_tables_map = [
  { table: "activities_activity_calories", endpoint: "activities-activityCalories", short: "activityCalories" },
  { table: "activities_calories_bmr", endpoint: "activities-caloriesBMR", short: "caloriesBMR" },
  { table: "activities_distance", endpoint: "activities-distance", short: "distance" },
  { table: "activities_steps", endpoint: "activities-steps", short: "steps" },
  { table: "activities_floors", endpoint: "activities-floors", short: "floors" },
  { table: "activities_elevation", endpoint: "activities-elevation", short: "elevation" },
  { table: "activities_distance", endpoint: "activities-distance", short: "distance" },
  { table: "activities_minutes_fairly_active", endpoint: "activities-minutesFairlyActive", short: "minutesFairlyActive" },
  { table: "activities_minutes_lightly_active", endpoint: "activities-minutesLightlyActive", short: "minutesLightlyActive" },
  { table: "activities_minutes_sedentary", endpoint: "activities-minutesSedentary", short: "minutesSedentary" },
  { table: "activities_minutes_very_active", endpoint: "activities-minutesVeryActive", short: "minutesVeryActive" },
];

activities_endpoints_tables_map.forEach( (item) => {
  tables.push({
    name: item.table,
    schema: [
      { name: 'id', type: 'STRING', mode: 'REQUIRED', description: 'Primary Key' },
      { name: 'date', type: 'DATE', mode: 'REQUIRED', description: 'The date values were extracted' },
      { name: 'value', type: 'INTEGER', description: 'The value of the activity' },
      { name: 'dateTime', type: 'TIMESTAMP', description: 'The time of the measurement' },
    ]
  });
});

/**
 * Creates a dataset in BigQuery.
 * @param {string} dataset_id - The ID of the dataset to be created.
 * @returns {Promise} A promise that resolves with the result of the dataset creation.
 * @throws {Error} If the dataset ID is not provided or if an error occurs during the dataset creation.
 */
async function createDataset(dataset_id = datasetId) {
  if (!dataset_id) {
    // console.error('Dataset id is required');
    return Promise.reject('Dataset id is required');
  }
  try {
    const res = await bigquery.createDataset(dataset_id);
    // console.log(`Dataset ${datasetId} created`, res[0]);
    if (res[1].status === 200) {
      // console.log(`Dataset ${datasetId} created`);
      //return createAllTables(); // Create tables after dataset is created and return the promise
    } else {
      // console.error('Dataset does not exist');
      return Promise.reject("Dataset does not exist");
    }
  } catch (err) {
    // console.error(err);
    return Promise.reject(err);
  }
}

/**
 * Creates a BigQuery table with the specified tableId and options.
 *
 * @param {object} table - contains the name and schema of the table to be created.

 * @returns {Promise} A promise that resolves with the created table.
 * @throws {Error} If there is an error creating the table.
 */
async function createTable(table) {
  if (!table || !table.name || !table.schema) {
    // console.error('Table name and schema are required');
    return Promise.reject('Table name and schema are required');
  }
  const { name, schema } = table;

  try {
    // check if table exists
    const tableVariable = bigquery.dataset(datasetId).table(name);
    const exists = await checkTableExists(name);
    if (exists) {
      // console.log(`Table ${name} already exists`);
      return tableVariable;
    } else {
      //console.log(`Creating table ${name}`);
      const [newTable] = await bigquery.dataset(datasetId).createTable(name, {
        schema: schema,
      });
      const [secondExists] = await newTable.exists();
      if (!secondExists) {
        // console.error('Table does not exist, could not be created');
        return Promise.reject('Table does not exist, could not be created');
      } else {
        // console.log(`Table ${name} created`);
        return newTable;
      }
    }
  } catch (err) {
    // console.error(err);
    return Promise.reject(err);
  }
}

/**
 * Creates a table by name.
 * @param {string} name - The name of the table to create.
 * @returns {Promise<table>} A promise that resolves when the table is created.
 * @throws {string} If the table is not found.
 */
async function createTableByName(name) {
  const table = tables.find(table => table.name === name);
  if (!table) {
    // console.error('Table not found');
    return Promise.reject('Table not found');
  }
  return await createTable(table);
}

/**
 * Creates all necessary tables for the application.
 * @returns {Promise<void>} A promise that resolves when all tables are created successfully.
 */
async function createAllTables() {
  for (const table of tables) {
    createTable(table).catch(err => {
      // console.error(`couldn't create table ${table.name} `, err);
    });
  }
  return Promise.resolve();
}

/**
 * Checks if a table exists in the BigQuery dataset.
 * @param {string} name - The name of the table to check.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the table exists.
 */
function checkTableExists(name) {
  const dataset = bigquery.dataset(datasetId);
  const datasetTable = dataset.table(name);
  datasetTable.exists().then(res => {
    if (res) {
      //console.log(`Table ${name} exists`);
      return true;
    } else {
      //console.log(`Table ${name} does not exist`);
      return false;
    }
  });
}

/**
 * Initializes the dataset in BigQuery and creates tables if specified.
 * @param {string} [dataset_id=datasetId] - The ID of the dataset to initialize.
 * @param {boolean} [tables=true] - Specifies whether to create tables or not.
 * @returns {Promise<void>} - A Promise that resolves when the dataset is initialized.
 */
async function initializeDataset(dataset_id = datasetId, tables = false) {
  // create the dataset if it’s not available, then create all the tables if tables=true
  try {
    // console.log(`Initializing dataset ${dataset_id}`);

    const dataset = bigquery.dataset(dataset_id);
    const [exists] = await dataset.exists();
    if (!exists) {
      //console.log(`Creating dataset ${dataset_id}`);
      const [newDataset] = await createDataset(dataset_id);
      newDataset.exists().then(res => {
        if (res) {
          // console.log(`Dataset ${dataset_id} created`);
          if (tables) {
            createAllTables();
          }
        } else {
          // console.error('Dataset does not exist');
          return Promise.reject("Dataset does not exist");
        }
      });
    } else {
      // console.log(`Dataset ${dataset_id} already exists`);
      // now we should check if the tables exist or they may need updating
      if (tables) {
        createAllTables();
      }
    }
  } catch (err) {
    // console.error(err);
    return Promise.reject(err);
  }
}

const intraday_enpoints_tables_map = [
  { table: "intraday_steps", endpoint: "activities-steps", short: "steps" },
  { table: "intraday_elevation", endpoint: "activities-elevation", short: "elevation" },
  { table: "intraday_floors", endpoint: "activities-floors", short: "floors" },
  { table: "intraday_calories", endpoint: "activities-calories", short: "calories" },
  { table: "intraday_distances", endpoint: "activities-distance", short: "distance" }
]


/**
 * Represents an array of tables reports.
 */
class TablesReportArrayResult {
  constructor() {
    this.tablesReports = [];
    this.successes = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Adds a table report to the array.
   * @param {TableReport} tableReport - The table report to add.
   */
  addTableReport(tableReport) {
    this.tablesReports.push(tableReport);
    tableReport?.errors?.length > 0 && this.errors.push(tableReport.errors);
    tableReport?.successes?.length > 0 && this.successes.push(tableReport.successes);
    tableReport?.warnings?.length > 0 && this.warnings.push(tableReport.warnings);
  }

  /**
   * Gets the summary of the tables reports.
   * @returns {{tableName: string, tableReports: Array[TableReportResult] successes: number, errors: number, warnings: number, data: any}} - The summary object containing the counts of successes, errors, and warnings, and the transformed data.
   */
  getSummary() {
    return {
      tableName: this.tableName,
      tablesReports: this.tablesReports,
      successes: this.successes.length,
      errors: this.errors.length,
      warnings: this.warnings.length,
    };
  }
}

// Success and Error Result Structures

/**
 * Represents a table report result.
 */
class TableReportResult {
  constructor(tableName) {
    this.tableName = tableName;
    this.rowResults = [];
    this.successes = [];
    this.errors = [];
    this.warnings = [];
    this.transformedData = [];
  }

  addRowResult(rowResult) {
    if (!!rowResult) {
      this.rowResults.push(rowResult);
      if (!!rowResult.transformdData)
        this.transformedData.push(rowResult.transformdData);
      rowResult?.errors?.length > 0 && this.errors.push(rowResult.errors);
      rowResult?.successes?.length > 0 && this.successes.push(rowResult.successes);
      rowResult?.warnings?.length > 0 && this.warnings.push(rowResult.warnings);
    }
  }

  /**
   * Adds a success result to the report.
   * @param {any} successResult - The success result to add.
   */
  addSuccess(successResult) {
    this.successes.push(successResult);
  }

  /**
   * Adds an error result to the report.
   * @param {any} errorResult - The error result to add.
   */
  addError(errorResult) {
    this.errors.push(errorResult);
  }

  /**
   * Adds a warning result to the report.
   * @param {any} warningResult - The warning result to add.
   */
  addWarning(warningResult) {
    this.warnings.push(warningResult);
  }

  /**
   * Gets the summary of the report.
   * @returns {{tableName: string, successes: number, errors: number, warnings: number, data: any}} - The summary
   * object containing the counts of successes, errors, and warnings, and the transformed data.
 */
  getSummary() {
    return {
      tableName: this.tableName,
      successes: this.successes.length,
      errors: this.errors.length,
      warnings: this.warnings.length,
      data: this.transformedData,
    };
  }

  // Additional utility methods can be added as needed
}

/**
 * Represents a success result.
 * @class
 */
class SuccessResult {
  /**
   * Creates a new instance of SuccessResult.
   * @constructor
   * @param {string} tableName - The name of the table.
   * @param {string} field - The name of the field
   * @param {any} [value=null] - The value of the field.
   */
  constructor(tableName, field, value = null) {
    this.type = 'success';
    this.tableName = tableName;
    this.field = field;
    this.value = value;
  }
}

const ErrorType = {
  MISSING_REQUIRED: "missingRequired",
  MISSING_OPTIONAL: "missingOptional",
  TYPE_MISMATCH: "typeMismatch",
  OUT_OF_RANGE: "outOfRange",
  TABLE_NOT_FOUND: "tableNotFound",
  DATA_EMPTY_OR_NOT_AN_OBJECT: "dataEmptyOrNotAnObject",
  TABLE_ERROR: "tableError",
  TABLE_SCHEMA_NOT_FOUND: "tableSchemaNotFound",
  DUPLICATE_ENTRY: "duplicateEntry",
  TIMEOUT: "timeout",
  RATE_LIMIT_EXCEEDED: "rateLimitExceeded",
  NETWORK_ERROR: "networkError",
  UNAUTHORIZED: "unauthorized",
  INTERNAL_ERROR: "internalError",
};

/**
 * Represents an error result.
 * @class
 */
class ErrorResult {
  /**
   * Creates a new instance of ErrorResult.
   * @constructor
   * @param {string} tableName - The name of the table.
   * @param {string} field - The field name.
   * @param {string} message - The error message.
   * @param {ErrorType} [errorType=ErrorType.MISSING_REQUIRED] - The type of error.
   */
  constructor(tableName, field, message, errorType = ErrorType.MISSING_REQUIRED) {
    this.type = 'error';
    this.tableName = tableName;
    this.field = field;
    this.message = message;
    this.errorType = errorType; // New property to indicate the type of error
  }
}

/**
 * Represents a warning result.
 * @class
 */
class WarningResult {
  /**
   * Creates a new instance of WarningResult.
   * @constructor
   * @param {string} tableName - The name of the table.
   * @param {string} field - The field name.
   * @param {string} message - The error message.
   */
  constructor(tableName, field, message) {
    this.type = 'warning';
    this.tableName = tableName;
    this.field = field;
    this.message = message;
  }
}

/**
 *
 * @param {Object} data to be inserted into BigQuery, must be in compliance with the table schema and contain the table name as the key
 * the data is an object with table as the key and the data as the value
 * @returns {object} - returns an object with the table name as the key and the result of the insert as the value
 */
const assertAndPrepareStreamTablesDataForCompilanceWithDataset = (data) => {
  // the report object will contain result successes and errors for each table

  const totalResultsReportArray = new TablesReportArrayResult();
  //console.log("assertAndPrepareStreamTablesDataForCompilanceWithDataset", data);
  // data is empty or not an object
  if (!data || typeof data !== 'object' || Object?.keys(data)?.length < 1) { // data either is Array or empty
    // console.error('Data is empty or not an object', data);
    const tableReport = new TableReportResult('N/A');
    tableReport.addError(new ErrorResult('data', 'data', 'Data is empty or not an object', ErrorType.DATA_EMPTY_OR_NOT_AN_OBJECT));
    totalResultsReportArray.addTableReport(tableReport);
    return totalResultsReportArray;
  }

  if (typeof data === 'object' && Object?.keys(data)?.length > 0) {
    const dataKeys = Object.keys(data); // get the keys of the data object which are the table names
    for (const key of dataKeys) { // key is the table name and we get the data for that table in each iteration
      // console.log("assertAndPrepareStreamTablesDataForCompilanceWithDataset", key);
      var tableReport = new TableReportResult(key);
      //console.log(key);
      // let's find the table schema for the table
      const tableVariable = tables.find(table => table.name === key);
      if (tableVariable === undefined || !tableVariable) {
        // console.error('Table not found skipping', key);
        const flattedTableVariable = flattenToString(tableVariable);
        tableReport.addError(new ErrorResult(key, 'N/A', `${key} | ${flattedTableVariable} not found`, ErrorType.TABLE_NOT_FOUND));
        totalResultsReportArray.addTableReport(tableReport);
        continue;
      }
      const tableData = data[key];
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        // console.error('Data is empty or not an object', data, tableVariable);
        tableReport.addWarning(new WarningResult(key || 'Null', 'N/A', `${key} | ${fllatenToString(tableVariable)}`, ErrorType.DATA_EMPTY_OR_NOT_AN_OBJECT));
        totalResultsReportArray.addTableReport(tableReport);
        continue;
      }
      const tableReportResult = assertAndPrepareTableDataForComplianceWithTableSchema(tableData, tableVariable.name);
      //console.log("tableReportResult", tableReportResult);

      totalResultsReportArray.addTableReport(tableReportResult);
    }
    //const totalErrorsCount = totalResultsReportArray.reduce((acc, cur) => acc + cur.errors.length, 0);
    //const tablesCompilance = totalResultsReportArray.filter(table => table.errors.length > 0);
    //const errorRatio = totalErrorsCount / tablesCompilance.length * 100;
    //console.log('Error ratio', errorRatio, totalErrorsCount, tablesCompilance.length);
    //return totalResultsReportArray;
  } else { // data is empty or not an object
    totalResultsReportArray.addError(new ErrorResult('data', 'data', 'Data is empty or not an object', ErrorType.DATA_EMPTY_OR_NOT_AN_OBJECT));
  }
  return totalResultsReportArray;
}

/**
 * Checks the compliance of data with the specified table schema.
 *
 * @param {Object[]} data - The data to be checked for compliance.
 * @param {string} tableName - The name of the table to compare the data against.
 * @returns {Object<TableReportResult>} - The result of the compliance check.
 */
const assertAndPrepareTableDataForComplianceWithTableSchema = (data, tableName) => {
  const tableSchema = tables.find(t => t.name === tableName)?.schema;
  const tableReportResult = new TableReportResult(tableName);

  if (!tableSchema) { // table schema not found  so we can't check the data
    // console.error('Table schema not found', tableName);
    tableReportResult.addError(new ErrorResult(tableName, '', 'Table schema not found', ErrorType.TABLE_SCHEMA_NOT_FOUND));
    return tableReportResult;
  }

  // console.log("assertAndPrepareTableDataForComplianceWithTableSchema", data)
  // console.log("tableName: %s  , tableSchema: %s", tableName, tableSchema?.length);
  if (!data || !tableName || tableName?.length === 0 || !Array.isArray(data)) { // data is empty or not an object or tableName is empty
    // console.error('Data or table is empty', Object.entries(data)?.length, tableName);
    tableReportResult.addError(new ErrorResult(tableName || 'null', 'data', 'Data is empty or not an object', ErrorType.MISSING_REQUIRED));
    return tableReportResult;
  }
  if (data?.length < 1) { // data is empty but we know it's an array so we can add a warning
    // console.error('Data is empty', data, tableName);
    tableReportResult.addWarning(new WarningResult(tableName, 'data', 'Data is empty'));
    // return tableReportResult;
  }

  for (const row of data) {
    const rowResult = assertAndPrepareRowDataForComplianceWithTableSchema(row, tableName, tableSchema);
    if (!rowResult?.transformedData && (rowResult?.errors?.length === 0 && rowResult?.warnings?.length === 0 && rowResult?.successes?.length === 0)) {
      // console.error('Row result is empty', rowResult);
      tableReportResult.addError(new ErrorResult(tableName, '', 'Row result is empty', ErrorType.INTERNAL_ERROR));
      return tableReportResult;
    }
    rowResult.successes?.length > 0 && tableReportResult.successes.push(...rowResult.successes);
    rowResult.errors?.length > 0 && tableReportResult.errors.push(...rowResult.errors);
    rowResult.warnings?.length > 0 && tableReportResult.warnings.push(...rowResult.warnings);
    !!rowResult.transformedData && (tableReportResult.transformedData.push(rowResult.transformedData));
  }
  return tableReportResult;
}

/**
 * Checks if a row of data complies with the specified table schema.
 *
 * @param {Object} row - The row of data to be checked. { field1: value1, field2: value2, ... }
 * @param {string} tableName - The name of the table.
 * @param {Array} tableSchema - The schema of the table. [{ name: 'field1', type: 'STRING', mode: 'REQUIRED' }, ...]
 * @returns {Object} - An object containing the successes, errors and warnings found during the compliance
 * check. { successes: [], errors: [], warnings: [] }
 */
function assertAndPrepareRowDataForComplianceWithTableSchema(row, tableName, tableSchema) {
  // console.log("assertAndPrepareRowDataForComplianceWithTableSchema", row, tableName, tableSchema);

  const rowResult = {
    successes: [],
    errors: [],
    warnings: [],
    // we should set the transformed data after checking the row
    // specieally if we can't add the row to the table but in result we have the transformed data.
    transformedData: row,
  }
  if (!tableSchema) {
    // console.error('Table schema not found', tableName);
    rowResult.errors.push(new ErrorResult(tableName, '', 'Table schema not found', 'schemaNotFound'));
    return rowResult;
  }

  if (!row || !tableName || tableName?.length === 0 || typeof row !== 'object') {
    // console.error('Data or table is empty', row, tableName);
    rowResult.errors.push(new ErrorResult(tableName || 'null', 'data', 'Data is empty or not an object', ErrorType.MISSING_REQUIRED));
    return rowResult;
  }
  if (Object.keys(row).length === 0) {
    // console.error('Data is empty or not an object', row, tableName);
    rowResult.warnings.push(new WarningResult(tableName, 'data', 'Data is empty or not an object'));
    return rowResult;
  }

  // lets find the fields that are in schema but not in the row data
  const notAvailableFields = tableSchema.filter(schemaField => !row.hasOwnProperty(schemaField.name));
  for (const naField of notAvailableFields) {
    rowResult.warnings.push(new WarningResult(tableName, naField.name, `Field ${naField.name} is not in the schema`));
    if (!naField.hasOwnProperty('mode') || naField.mode === 'NULLABLE') { // field is optional so let's add it to the row data with a null value
      rowResult.warnings.push(new WarningResult(tableName, naField.name, `Missing optional field: ${naField.name} , added with a null value`));
      rowResult.transformedData = { ...row, [naField.name]: null }; // we don't have the field so we add a null value cause its allowed
    } else { // field.mode is not required because we've already checked for required fields in the schema,
      // but I'm not sure of the status of the field in the schema so let's add a warning`
      rowResult.warnings.push(new WarningResult(tableName, naField.name, `Missing optional field: ${naField.name}`));
      // TODO: !important : im going to set the field to 0 : maybe it would mess up the whole analysis
      rowResult.transformedData = { ...row, [naField.name]: 0 }; // we don't have the field so we add a null value cause its allowed
    }
  }

  // let's iterate the row data and check if the fields are in the schema , if not we will remove them from the row
  //const redundantFieldsNames = Object.keys(row).filter(fName => !tableSchema.find(schemaField => schemaField.name === fName));
  for (fName of Object.keys(row)) {
    const fValue = row[fName];
    const schemaField = tableSchema.find(schemaField => schemaField.name === fName);
    if (!schemaField) {
      // field is not in the schema, let's add a warning and remove the field from the row
      rowResult.warnings.push(new WarningResult(tableName, fName, `Field ${fName} is not in the schema`));
      delete row[fName];
    } else { // field is in the schema so let's check the type and value
      const fieldResult = assertAndPrepareFieldDataForCompilanceWithSchemaField(tableName, { [fName]: fValue }, schemaField);
      if (!!fieldResult.success) {
        rowResult.successes.push(fieldResult.success);
        rowResult.transformedData = { ...row, [fName]: fieldResult.transformedData };
      } else if (!!fieldResult.warning) {
        rowResult.warnings.push(fieldResult.warning);
        if (!!fieldResult.transformedData) {
          rowResult.transformedData = { ...row, [fName]: fieldResult.transformedData };
        }
      } else if (!!fieldResult.error) {
        rowResult.errors.push(fieldResult.error);
      }
      // TODO: i don't know if I should do this
      if (!!fieldResult?.transformedData) {
        rowResult.transformedData = { ...row, [fName]: fieldResult.transformedData };
      }
    }

  }
  return rowResult;
}

/**
 * Checks the compliance of a field with a given schema field.
 *
 * @param {string} tableName - The name of the table.
 * @param {string} fieldName - The name of the field.
 * @param {*} fieldValue - The value of the field.
 * @param {object} schemaField - The schema field to compare against.
 * @returns {object} - An object containing the result of the compliance check.
 * { success: SuccessResult , error: ErrorResult , warning: WarningResult, transformedData:  }
 */
function assertAndPrepareFieldDataForCompilanceWithSchemaField(tableName, fieldData, schemaField) {
  const result = {
    success: null,
    error: null,
    warning: null,
    transformedValue: undefined,
  }

  if (!fieldData || typeof fieldData !== 'object' || Object.keys(fieldData).length === 0) {
    result.error = new ErrorResult(tableName, '', 'Field data is empty or not an object', ErrorType.MISSING_REQUIRED);
    return result;
  }

  const fieldName = Object.keys(fieldData)[0];
  const fieldValue = Object.values(fieldData)[0];

  const transformedFieldValue = fieldValue; // For now we assume the data is transformed as is
  if (!fieldValue) { // Filed is empty or null or undefined, let's check if it's required
    if (schemaField.hasOwnProperty('mode') && schemaField.mode === 'REQUIRED') { // Field is required
      result.error = new ErrorResult(tableName, fieldName, `Missing required field: ${fieldName}`, ErrorType.MISSING_REQUIRED);
      // we return here because if the field is required and we don't have a value we can't proceed with the rest of the fields
      // of course it doesnt have any effect !!!
      return result;
    } else { // Field is not required and we don't have a value if it's nullable we can set it to null otherwise we can remove it
      if (schemaField?.mode === 'NULLABLE') {
        result.warning = new WarningResult(tableName, fieldName, `Missing optional field: ${fieldName}`);
        result.transformedValue = null;
      } else {
        result.warning = new WarningResult(tableName, fieldName, `Missing optional field: ${fieldName}`);
        // Maybe we should remove this field from the data
        // TODO: I'm not sure if this is the right thing to do, it might mess things up
        result.transformedValue = "0";
      }
    }
  } else { // Field is not empty
    result.success = new SuccessResult(tableName, fieldName, fieldValue);
    result.transformedValue = fieldValue;
  }
  return result;
}


exports.createTableByName = createTableByName;
exports.createAllTables = createAllTables;
exports.createDataset = createDataset;
exports.initializeDataset = initializeDataset;
exports.checkTableExists = checkTableExists;
exports.datasetId = datasetId;
exports.intraday_enpoints_tables_map = intraday_enpoints_tables_map;
exports.activities_endpoints_tables_map = activities_endpoints_tables_map;
exports.assertAndPrepareTableDataForComplianceWithTableSchema = assertAndPrepareTableDataForComplianceWithTableSchema;
exports.assertAndPrepareStreamTablesDataForCompilanceWithDataset = assertAndPrepareStreamTablesDataForCompilanceWithDataset;
