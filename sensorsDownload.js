const { timezones } = require("./utils");

/* eslint-disable max-len */
const downloadSensors = [
  {
    id: "AZM_Intraday",
    label: "AZM Intraday",
    link: "/1/user/[user-id]/activities/active-zone-minutes/date/[start-date]/[end-date]/[detail-level].json",
    description: "This endpoint retrieves the active zone minute (AZM) intraday time series data on a specific date range or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Active Zone Minutes,",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' },
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "AZM_Intraday_byDate",
    label: "AZM Intraday by Date",
    link: "/1/user/[user-id]/activities/active-zone-minutes/date/[start-date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the active zone minute (AZM) intraday time series data for a specific date or 24 hour period. The number of minutes spent in each activity zone during the given day. The response includes activity log entries for the specified day.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    parameters: []
  },
  {
    id: "Activity_steps_Intraday",
    label: "Activity Steps Time Series Intraday",
    link: "/1/user/[user-id]/activities/steps/date/[start-date]/[end-date]/[detail-level]/time/[start-time]/[end-time].json",
    description: "retrieves the activity intraday time series data for steps taken on a specific date range for a 24 hour period.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Steps_Intraday_byDate",
    label: "Activity Steps Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/steps/date/[start-date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the activity intraday time series data for step resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Calories_Intraday_byDate",
    label: "Activity Calories Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/calories/date/[start-date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the activity intraday time series data for calories resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Distance_Intraday_byDate",
    label: "Activity Distance Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/distance/date/[start-date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the activity intraday time series data for distance resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Elevation_Intraday_byDate",
    label: "Activity Elevation Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/elevation/date/[start-date]/1d/[detail-level].json",
    description: "retrieves the activity intraday time series data for elavation on a specific date range for a 24 hour period.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Floors_Intraday_byDate",
    label: "Activity Floors Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/floors/date/[start-date]/1d/[detail-level].json",
    description: "retrieves the activity intraday time series data for floors climbed on a specific date range for a 24 hour period.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '1min' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Breathing_Intraday",
    label: "Breathing Rate Intraday",
    link: "/1/user/[user-id]/br/date/[start-date]/[end-date]/all.json",
    description: "retrieves a summary and list of a user's heart rate and step activities for a given day. It measures the average breathing rate throughout the day and categories your breathing rate by sleep stage. Sleep stages vary between light sleep, deep sleep, REM sleep, and full sleep.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "Breathing_Intraday_byDate",
    label: "Breathing Rate Intraday by Date",
    link: "/1/user/[user-id]/br/date/[date]/all.json",
    description: "retrieves a summary and list of a user's heart rate and step activities for a given day. It measures the average breathing rate throughout the day and categories your breathing rate by sleep stage. Sleep stages vary between light sleep, deep sleep, REM sleep, and full sleep.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "HeartRate_Intraday",
    label: "Heart Rate Intraday",
    link: "/1/user/[user-id]/activities/heart/date/[start-date]/1d/[detail-level].json",
    description: "retrieves a summary and list of a user's heart rate and step activities for a given day.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1sec', '1min', '5min', '15min'], defaultValue: '1min' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "HeartRate_Intraday_byDate",
    label: "Heart Rate Intraday by Date",
    link: "/1/user/[user-id]/activities/heart/date/[date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the heart rate intraday time series data on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1sec, 1min, 5min or 15min for Heart Rate.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'detail-level', type: 'select', values: ['1sec', '1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "HRV_Intraday",
    label: "HRV Intraday",
    link: "/1/user/[user-id]/hrv/date/[start-date]/all.json",
    description: "retrieves a summary and list of a user's heart rate and step activities for a given day.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "SpO2_Intraday",
    label: "SpO2 Intraday",
    link: "/1/user/[user-id]/spo2/date/[start-date]/all.json",
    description: "retrieves the SpO2 intraday data for a single date. SpO2 applies specifically to a user’s “main sleep”, which is the longest single period of time asleep on a given date. Spo2 values are calculated on a 5-minute exponentially-moving average.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "SpO2_Intraday_Interval",
    label: "SpO2 Intraday by Interval",
    link: "/1/user/[user-id]/spo2/date/[start-date]/[end-date]/all.json",
    description: "retrieves the SpO2 intraday data for a date range (Max: 30 days). SpO2 applies specifically to a user’s “main sleep”, which is the longest single period of time asleep on a given date. Spo2 values are calculated on a 5-minute exponentially-moving average.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "SpO2_Summary_Interval",
    label: "SpO2 Summary Interval",
    link: "/1/user/[user-id]/spo2/date/[start-date]/[end-date].json",
    description: "retrieves the SpO2 summary data for a date range (Max: No limitation). SpO2 applies specifically to a user’s “main sleep”, which is the longest single period of time asleep on a given date.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "Sleep_Log",
    label: "Sleep Log by Date Range",
    link: "/1.2/user/[user-id]/sleep/date/[start-date]/[end-date].json",
    description: "returns a list of a user's sleep log entries for a date range. (Maximum range: 100 days) The data returned for either date can include a sleep period that ended that date but began on the previous date.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "Sleep_Log_List",
    label: "Sleep Log List",
    link: "/1.2/user/[user-id]/sleep/list.json",
    description: " returns a list of a user's sleep log entries before or after a given date, and specifying offset, limit (max 100) and sort order. The data returned for different dates can include sleep periods that began on the previous date.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: [
      { name: 'beforeDate', type: 'date', defaultValue: '2024-01-01' },
      { name: 'sort', type: 'hidden', defaultValue: 'desc' },
      { name: 'offset', type: 'number', defaultValue: 0 },
      { name: 'limit', type: 'number', defaultValue: 100 }
    ]
  },
  {
    id: "VO2_Max_Summary",
    label: "VO2 Max Summary",
    link: "/1/user/[user-id]/cardioscore/date/[start-date]/[end-date].json",
    description: "returns a list of a user's VO2max and resting heart rate values for a given date range.(Max 30)",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "ECG_Log_List",
    label: "ECG Log List",
    link: "/1/user/[user-id]/ecg/list.json",
    description: "returns a list of a user's ECG log entries before or after a given day; with limit max 10.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    //parameters: ['beforeDate', 'afterDate', 'sort', 'offset', 'limit']
    parameters: [
      { name: 'beforeDate', type: 'date', defaultValue: '2024-01-01' },
      { name: 'sort', type: 'hidden', defaultValue: 'desc' },
      { name: 'offset', type: 'number', defaultValue: 0 },
      { name: 'limit', type: 'number', defaultValue: 10 }
    ]
  },
  {
    id: "Temperature_Core",
    label: "Temperature (Core) Summary",
    link: "/1/user/[user-id]/temp/core/date/[start-date]/[end-date].json",
    description: "returns Temperature (Core) data for a date range. Temperature (Core) data applies specifically to data logged manually by the user on a given day. It only returns a value for dates on which the Fitbit device was able to record Temperature (Core) data and the maximum date range cannot exceed 30 days.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "Temperature_Skin",
    label: "Temperature (Skin) Summary",
    link: "/1/user/[user-id]/temp/skin/date/[start-date]/[end-date].json",
    description: "returns Temperature (Skin) data for a date range. It only returns a value for dates on which the Fitbit device was able to record Temperature (skin) data and the maximum date range cannot exceed 30 days.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' },
    ],
    parameters: []
  },
  {
    id: "AZM_Time_Series_byInterval",
    label: "Get AZM Time Series by Interval (no Intraday)",
    link: "/1/user/[user-id]/activities/active-zone-minutes/date/[start-date]/[end-date].json",
    description: "This endpoint returns the daily summary values over an interval(Maximum range: no limitation) by specifying a date range.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "AZM_Time_Series_byDate",
    label: "Get AZM Time Series by Date (no Intraday)",
    description: "This endpoint returns the daily summary values over a period of time by specifying a date and time period.",
    link: "/1/user/[user-id]/activities/active-zone-minutes/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: []
  },
  {
    id: "Activity_Lifetime_Stats",
    label: "Get Lifetime Stats",
    description: "Retrieves the user's activity statistics. Retrieves the user's activity statistics in the format requested using units in the unit system which corresponds to the Accept-Language header provided.",
    link: "/1/user/[user-id]/activities.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Activity_Log_List",
    label: "Get Activity Log List",
    description: "Retrieves a list of a user's activity log entries before or after a given day.",
    link: "/1/user/[user-id]/activities/list.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: [
      { name: 'beforeDate', type: 'date', defaultValue: '2024-01-01' },
      { name: 'sort', type: 'hidden', defaultValue: 'desc' },
      { name: 'offset', type: 'number', defaultValue: 0 },
      { name: 'limit', type: 'number', defaultValue: 100 }
    ]
  },
  // {
  //   id:"Get_Activity_Tcx",
  //   label: "Get Activity TCX",
  //   description: "Retrieves a user's activity details in TCX format.",
  //   link: "/1/user/[user-id]/activities/[log-id].tcx",
  //   arguments: [
  //     { name: 'user-id', type: 'text', defaultValue: '-' },
  //     { name: 'log-id', type: 'text', defaultValue: ' ' }
  //   ],
  //   parameters: [
  //     { name: 'includePartialTCX', type: 'boolean', defaultValue: true }
  //   ]
  // },
  {
    id: "Get_Daily_Activity_Summary",
    label: "Get Daily Activity Summary",
    description: "Retrieves a summary and list of a user's activities and activity log entries for a given day.",
    link: "/1/user/[user-id]/activities/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: [
    ]
  },
  {
    id: "Get_Activity_steps_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of steps by Date Range (no Intraday)",
    description: "retrieves the activity time series data for steps resource on a date range.",
    link: "/1/user/[user-id]/activities/steps/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_activityCalories_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of activityCalories by Date Range (no Intraday)",
    description: "retrieves the activity time series data for activityCalories resource on a date range. Max 30 datys.",
    link: "/1/user/[user-id]/activities/activityCalories/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_calories_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of calories  by Date Range (no Intraday)",
    description: "retrieves the activity time series data for calories resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/calories/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_caloriesBMR_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of caloriesBMR by Date Range (no Intraday)",
    description: "retrieves the activity time series data for caloriesBMR resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/caloriesBMR/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_distance_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of distance by Date Range (no Intraday)",
    description: "retrieves the activity time series data for distance resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/distance/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_elevation_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of elevation by Date Range (no Intraday)",
    description: "retrieves the activity time series data for elevation resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/elevation/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_floors_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of floors by Date Range (no Intraday)",
    description: "retrieves the activity time series data for floors resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/floors/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesSedentary_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of minutesSedentary by Date Range (no Intraday)",
    description: "retrieves the activity time series data for minutesSedentary resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/minutesSedentary/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesLightlyActive_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of minutesLightlyActive by Date Range (no Intraday)",
    description: "retrieves the activity time series data for minutesLightlyActive resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/minutesLightlyActive/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesFairlyActive_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of minutesFairlyActive by Date Range (no Intraday)",
    description: "retrieves the activity time series data for minutesFairlyActive resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/minutesFairlyActive/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesVeryActive_Time_Series_by_Date_Range",
    label: "Get Activity Time Series of minutesVeryActive by Date Range (no Intraday)",
    description: "retrieves the activity time series data for minutesVeryActive resource on a date range. max 1095 days.",
    link: "/1/user/[user-id]/activities/minutesVeryActive/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Breathing_Rate_Summary_by_Interval",
    label: "Get Breathing Rate Summary by Interval (30 days)",
    description: "This endpoint returns average breathing rate data for a date range. Max 30 days. Breathing Rate data applies specifically to a user's <main sleep>, which is the longest single period of time during which they were asleep on a given date.",
    link: "/1/user/[user-id]/br/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "Get_Heart_Rate_Time_Series_by_Date_Range",
    label: "Get Heart Rate Time Series by Date Range (365 days)",
    description: "Retrieves the heart rate time series data over a period of time (max 365 days) by specifying a date range. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/heart/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-01-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_HRV_Summary_by_Interval",
    label: "Get HRV Summary by Interval (30 days)",
    description: " This endpoint returns the Heart Rate Variability (HRV) data for a date range (max 30 days). HRV data applies specifically to a user's <main sleep>, which is the longest single period of time asleep on a given date.",
    link: "/1/user/[user-id]/hrv/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-10' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "Get_User_Profile",
    label: "Get User Profile",
    description: "Retrieves the user's profile data.",
    link: "/1/user/[user-id]/profile.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Badges",
    label: "Get User Badges",
    description: "Retrieves the user's badges.",
    link: "/1/user/[user-id]/badges.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Friends",
    label: "Get Friends",
    description: "Retrieves the user's friends.",
    link: "/1/user/[user-id]/friends.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Devices",
    label: "Get Devices",
    description: "Retrieves the user's devices.",
    link: "/1/user/[user-id]/devices.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Weight",
    label: "Get Weight Log",
    description: "Retrieves a list of all user's weight log entries for a given date.",
    link: "/1/user/[user-id]/body/log/weight/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "Weight Time Series by Date Range",
    label: "Get Weight Time Series by Date Range",
    description: "Retrieves the user's weight log entries for a given date range. (Maximum range: 31 days)",
    link: "/1/user/[user-id]/body/log/weight/date/[start-date]/[end-date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'start-date', type: 'date', defaultValue: '2023-12-01' },
      { name: 'end-date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "Food_Log",
    label: "Get Food Log",
    description: "Retrieves a list of a user's food log entries for a given day.",
    link: "/1/user/[user-id]/foods/log/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  },
  {
    id: "Food_Goals",
    label: "Get Food Goals",
    description: "Retrieves the user's current daily calorie consumption goal and/or food plan.",
    link: "/1/user/[user-id]/foods/log/goal.json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' }
    ],
    parameters: []
  },
  {
    id: "Sleep_Log_ByDate",
    label: "Get Sleep Log by Date",
    description: "This endpoint returns a list of a user's sleep log entries for a given date. The data returned can include sleep periods that began on the previous date.",
    link: "/1.2/user/[user-id]/sleep/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: '2024-01-01' }
    ],
    parameters: []
  }
];

for( let item of downloadSensors){
  console.log(item.label); //??
}

/**
 * Generates sensor settings based on the provided sensor object.
 * @param {Object} sensor - The sensor object.
 * @return {Object|null} - The generated sensor settings or null if the sensor is null or undefined.
 */
function generateSensorSettings(sensor) {
  if (sensor === null || sensor === undefined) {
    return null;
  }
  const sensorSettings = {
    sensorId: sensor.id,
    arguments: sensor.arguments.reduce((name, val) => ({...name, [`${val.name}`]: val.defaultValue}), {}),
    parameters: sensor.parameters.reduce((name, val) => ({...name, [`${val.name}`]: val.defaultValue}), {}),
    enabled: true,
  };
  return sensorSettings;
}

exports.generateSensorSettings = generateSensorSettings;
exports.downloadSensors = downloadSensors;
