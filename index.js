const express = require("express");
const app = express();
const cors = require("cors"); // ({origin: true});
const FITBIT_OAUTH_URL = 'https://api.fitbit.com/oauth2/token';
const axios = require("axios");
const qs = require("qs");
const config = require("./config.json");

app.use(cors());

app.get("/getToken", async (req, res) => {
  const baseInfo = Buffer.from(`${config.clientID}:${config.clientSecret}`)
        .toString("base64");
  const code = req.query.code;
  const verifier = req.query.code_verifier;

  if (!(typeof code === "string") || code.length === 0 ||
      !(typeof verifier === "string") || verifier.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    res.status(500).json({message : 'The function must be called ' +
        'with two arguments "code" and "code_verifier" containing ' +
        'required data.'});
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
    console.log("Fitbit authentication result :", info.authResult);

    const authResult = {
      access_token: info.data.access_token,
      refresh_token: info.data.refresh_token,
      expires_in: info.data.expires_in,
      user_id: info.data.user_id,
    };
    console.log("auth result ", authResult);
    res.json(authResult);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
    
    console.error("fetching auth token error. ", error);
    if (Array.isArray(error) ) {
      error.each((err)=>{
        console.error("error", err);
      });
    }
    res.status(500).json({error: error});
  }
});

app.get("/refreshToken", async (req, res) => {
  const baseInfo = Buffer.from(`${config.clientID}:${config.clientSecret}`)
        .toString("base64");
  const code = req.query.code;

  if (!(typeof code === "string") || code.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    res.status(500).json({message : 'The function must be called ' +
        'with an argument "code" containing required data.'});
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
    console.log("Fitbit authentication result :", info.authResult);

    const authResult = {
      access_token: info.data.access_token,
      refresh_token: info.data.refresh_token,
      expires_in: info.data.expires_in,
      user_id: info.data.user_id,
    };
    console.log("auth result ", authResult);
    res.json(authResult);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
    
    console.error("fetching auth token error. ", error);
    if (Array.isArray(error) ) {
      error.each((err)=>{
        console.error("error", err);
      });
    }
    res.status(500).json({error: error});
  }

});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
	console.log("Server started at port ${port}");
});
