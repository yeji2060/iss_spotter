const request = require('request');
const fetchMyIP = function(callback) { 
  // use request to fetch IP address from JSON API
  const ipAddressUrl = 'https://api64.ipify.org?format=json';

  request(ipAddressUrl,(error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg),null);
      return;
    }
      const data = JSON.parse(body);
      const ip = data.ip;
      callback(null, ip);
  })
}

const fetchCoordsByIP = function(ip, callback) {
  const coordAddressUrl = 'http://ipwho.is/' + ip;

  request(coordAddressUrl, (error, response, body) => {
    if(error) {
      callback(error, null);
      return;
    }

    const parsedBody = JSON.parse(body);

    if(!parsedBody.success) {
      const message = `Success status was ${parsedBody.success}. Server message says: ${parseBody.message} when fetching for IP ${parsedBody.ip}`;
      callback(Error(message), null);
      return
    }
    const {latitude, longitude} = parsedBody;

   callback(null, {latitude, longitude});
  })
}

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };