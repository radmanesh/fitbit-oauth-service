const { timezones, convertDefaultDate } = require('./utils');
const cronJobSensors = [
  {
    id: "AZM_Intraday_byDate",
    label: "AZM Intraday by Date",
    link: "/1/user/[user-id]/activities/active-zone-minutes/date/[date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the active zone minute (AZM) intraday time series data for a specific date or 24 hour period. The number of minutes spent in each activity zone during the given day. The response includes activity log entries for the specified day.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    parameters: []
  },
  {
    id: "Activity_Steps_Intraday_byDate",
    label: "Activity Steps Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/steps/date/[date]/1d/[detail-level].json",
    description: "This endpoint retrieves the activity intraday time series data for step resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Calories_Intraday_byDate",
    label: "Activity Calories Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/calories/date/[date]/1d/[detail-level].json",
    description: "This endpoint retrieves the activity intraday time series data for calories resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Distance_Intraday_byDate",
    label: "Activity Distance Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/distance/date/[date]/1d/[detail-level].json",
    description: "This endpoint retrieves the activity intraday time series data for distance resource on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1min, 5min and 15min for Activity.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Elevation_Intraday_byDate",
    label: "Activity Elevation Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/elevation/date/[date]/1d/[detail-level].json",
    description: "retrieves the activity intraday time series data for elavation on a specific date range for a 24 hour period.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Activity_Floors_Intraday_byDate",
    label: "Activity Floors Time Series Intraday By Date",
    link: "/1/user/[user-id]/activities/floors/date/[date]/1d/[detail-level].json",
    description: "retrieves the activity intraday time series data for floors climbed on a specific date range for a 24 hour period.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1min', '5min', '15min'], defaultValue: '5min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    //defaultValues: ['-', ['calories' , 'distance', 'elevation', 'floors', 'steps'] ,'2023-12-10', '2024-01-01', '1min'],
    parameters: []
  },
  {
    id: "Breathing_Intraday_byDate",
    label: "Breathing Rate Intraday by Date",
    link: "/1/user/[user-id]/br/date/[date]/all.json",
    description: "retrieves a summary and list of a user's heart rate and step activities for a given day. It measures the average breathing rate throughout the day and categories your breathing rate by sleep stage. Sleep stages vary between light sleep, deep sleep, REM sleep, and full sleep.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "HeartRate_Intraday_byDate",
    label: "Heart Rate Intraday by Date",
    link: "/1/user/[user-id]/activities/heart/date/[date]/1d/[detail-level]/time/[start-time]/[end-time].json",
    description: "This endpoint retrieves the heart rate intraday time series data on a specific date or 24 hour period. Intraday support can extend the detail-level response to include 1sec, 1min, 5min or 15min for Heart Rate.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'detail-level', type: 'select', values: ['1sec', '1min', '5min', '15min'], defaultValue: '1min' },
      { name: 'start-time', type: 'time', defaultValue: '00:00' },
      { name: 'end-time', type: 'time', defaultValue: '23:59' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "HRV_Intraday_byDate",
    label: "HRV Intraday by Date",
    link: "/1/user/[user-id]/hrv/date/[date]/all.json",
    description: "This endpoint returns the Heart Rate Variability (HRV) intraday data for a single date. HRV data applies specifically to a user’s 'main sleep', which is the longest single period of time asleep on a given date. It measures the HRV rate at various times and returns Root Mean Square of Successive Differences (rmssd), Low Frequency (LF), High Frequency (HF), and Coverage data for a given measurement. Rmssd measures short-term variability in your heart rate while asleep. LF and HF capture the power in interbeat interval fluctuations within either high frequency or low frequency bands. Finally, coverage refers to data completeness in terms of the number of interbeat intervals.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "SpO2_Intraday_byDate",
    label: "SpO2 Intraday by Date",
    link: "/1/user/[user-id]/spo2/date/[date]/all.json",
    description: "pO2 intraday data for a specified date range. SpO2 applies specifically to a user’s “main sleep”, which is the longest single period of time asleep on a given date. Spo2 values are calculated on a 5-minute exponentially-moving average.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "Sleep_Log_byDate",
    label: "Sleep Log by Date",
    link: "/1.2/user/[user-id]/sleep/date/[date].json",
    description: "This endpoint returns a list of a user's sleep log entries for a given date.(Maximum range: 100 days) The data returned can include sleep periods that began on the previous date.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "VO2_Max_Summary_byDate",
    label: "VO2 Max Summary by Date",
    link: "/1/user/[user-id]/cardioscore/date/[date].json",
    description: "returns the Cardio Fitness Score (also known as VO2 Max) data for a single date. VO2 Max values will be shown as a range if no run data is available or a single numeric value if the user uses a GPS for runs.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
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
      { name: 'beforeDate', type: 'date', defaultValue: 'today' },
      { name: 'sort', type: 'hidden', defaultValue: 'desc' },
      { name: 'offset', type: 'number', defaultValue: 0 },
      { name: 'limit', type: 'number', defaultValue: 10 }
    ]
  },
  {
    id: "Temperature_Core_Summary_byDate",
    label: "Temperature (Core) Summary by Date",
    link: "/1/user/[user-id]/temp/core/date/[date].json",
    description: "returns Temperature (Core) data for a date range. Temperature (Core) data applies specifically to data logged manually by the user on a given day. It only returns a value for dates on which the Fitbit device was able to record Temperature (Core) data and the maximum date range cannot exceed 30 days.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "Temperature_Skin_Summary_byDate",
    label: "Temperature (Skin) Summary by Date",
    link: "/1/user/[user-id]/temp/skin/date/[date].json",
    description: "returns the Temperature (Skin) data for a single date. It only returns a value for dates on which the Fitbit device was able to record Temperature (skin) data. Temperature (Skin) data applies specifically to a user’s “main sleep,” which is the longest single period of time asleep on a given date. The measurement is provided at the end of a period of sleep. The data returned usually reflects a sleep period that began the day before.",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
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
      { name: 'date', type: 'date', defaultValue: 'today' },
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
    id: "Get_Activity_steps_Time_Series_byDate",
    label: "Get Activity Time Series of steps by Date (no Intraday)",
    description: "Retrieves the activity data for steps taken over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/steps/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_activityCalories_Time_Series_byDate",
    label: "Get Activity Time Series of activityCalories by Date (no Intraday)",
    description: "Retrieves the activity data for activityCalories burned over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/activityCalories/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_calories_Time_Series_byDate",
    label: "Get Activity Time Series of calories  by Date Range (no Intraday)",
    description: "Retrieves the activity data for calories used over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/calories/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_caloriesBMR_Time_Series_byDate",
    label: "Get Activity Time Series of caloriesBMR by Date(no Intraday)",
    description: "Retrieves the activity data for caloriesBMR used over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/caloriesBMR/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_distance_Time_Series_byDate",
    label: "Get Activity Time Series of distance by Date (no Intraday)",
    description: "Retrieves the activity data for distance travelled used over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/distance/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_elevation_Time_Series_byDate",
    label: "Get Activity Time Series of elevation by Date (no Intraday)",
    description: "Retrieves the activity data for elavation over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/elevation/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_floors_Time_Series_byDate",
    label: "Get Activity Time Series of floors by Date (no Intraday)",
    description: "Retrieves the activity data for floors travelled used over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/floors/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesSedentary_Time_Series_byDate",
    label: "Get Activity Time Series of minutesSedentary by Date (no Intraday)",
    description: "Retrieves the activity data for sedentaryMinutes spent over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/minutesSedentary/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesLightlyActive_Time_Series_byDate",
    label: "Get Activity Time Series of minutesLightlyActive by Date (no Intraday)",
    description: "Retrieves the activity data for minutesLightlyActive spent over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/minutesLightlyActive/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesFairlyActive_Time_Series_byDate",
    label: "Get Activity Time Series of minutesFairlyActive by Date (no Intraday)",
    description: "Retrieves the activity data for minutesFaitlyActive used spent a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/minutesFaitlyActive/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Activity_minutesVeryActive_Time_Series_byDate",
    label: "Get Activity Time Series of minutesVeryActive by Date (no Intraday)",
    description: "Retrieves the activity data for minutesVeryActive spent over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/minutesVeryActive/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m', '3m', '6m', '1y'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_Breathing_Rate_Summary_byDate",
    label: "Get Breathing Rate Summary by Date",
    description: "This endpoint returns average breathing rate data for a single date. Breathing Rate data applies specifically to a user&#146;s 'main sleep', which is the longest single period of time during which they were asleep on a given date. The measurement is provided at the end of a period of sleep. The data returned can and often does reflect a sleep period that began the day before.",
    link: "/1/user/[user-id]/br/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
    ],
    parameters: []
  },
  {
    id: "Get_Heart_Rate_Time_Series_byDate",
    label: "Get Heart Rate Time Series by Date",
    description: "Retrieves the heart rate time series data over a period of time by specifying a date and time period. The response will include only the daily summary values.",
    link: "/1/user/[user-id]/activities/heart/date/[date]/[period].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' },
      { name: 'period', type: 'select', values: ['1d', '7d', '30d', '1w', '1m'], defaultValue: '1d' }
    ],
    parameters: [
      { name: 'timezone', type: 'select', values: timezones, defaultValue: 'UTC' }
    ]
  },
  {
    id: "Get_HRV_Summary_byDate",
    label: "Get HRV Summary by Date",
    description: "This endpoint returns the Heart Rate Variability (HRV) data for a single date. HRV data applies specifically to a user&#146;s 'main sleep', which is the longest single period of time asleep on a given date. The measurement is provided at the end of a period of sleep. The data returned usually reflects a sleep period that began the day before.",
    link: "/1/user/[user-id]/hrv/date/[date].json",
    arguments: [
      { name: 'user-id', type: 'text', defaultValue: '-' },
      { name: 'date', type: 'date', defaultValue: 'today' }
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
  }
];

// cron: {
//   enabled: false,
//   schedule: '0 0 * * *',
//   timezone: 'UTC'
// }

function generateCronSensorSettings(sensor) {
  if (sensor === null || sensor === undefined) {
    return null;
  }
  const sensorSettings = {
    sensorId: sensor.id,
    arguments: sensor.arguments.reduce((acc, item) => {
      let defValue = item.defaultValue;
      if (item.type === 'date') {
        defValue = convertDefaultDate(item.defaultValue) || convertDefaultDate(new Date());
      }
      return { ...acc, [`${item.name}`]: defValue };
    }, {}),
    parameters: sensor.parameters.reduce((name, val) => ({ ...name, [`${val.name}`]: val.defaultValue }), {}),
    enabled: true,
  };
  return sensorSettings;
}

//testGenerateCronSensorSettings();
function testGenerateCronSensorSettings() {
  const sensor = cronJobSensors[0];
  const sensorSettings = generateCronSensorSettings(sensor);
  // console.log(sensorSettings);
}

exports.cronJobSensors = cronJobSensors;
exports.generateCronSensorSettings = generateCronSensorSettings;
