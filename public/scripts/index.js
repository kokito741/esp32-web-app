
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector("#authentication-bar");
// Elements for sensor readings
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");

// MANAGE LOGIN/LOGOUT UI
function setupUI(user) {
  if (user) {

    //toggle UI elements
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display ='block';
    userDetailsElement.style.display ='block';
    userDetailsElement.innerHTML = user.email;

    // get user UID to get data from database
    var uid = user.uid;
    prevHum="unkown";
    prevTemp="unkown";
    document.getElementById('draw').addEventListener('click', function() {
      const date = document.getElementById('date').value;
      drawHistogramPerHour(date,uid);
      drawHistogramPerDay(date,uid);
    });

    //todo make the room,device and date dinamicly chosen
    // Database paths (with user UID)
    updateReadings();
    drawHistogram_PER_HOUR(uid);
    drawHistogram_PER_DAY(uid);
    drawHistogram_PER_MONTH(uid);

    function drawHistogram_PER_HOUR(uid) {
      // Define the start and end times
      log.debug("start drawHistogram_PER_HOUR")
      const start=performance.now();
      var startTime = moment().startOf('day'); // This sets the start time to the beginning of today
      var endTime = moment(); // This sets the end time to the current time
      var temperatures = [];
      var humidities = [];
      // Initialize empty arrays for temperature and humidity
      var temperaturePromises = [];
      var humidityPromises = [];
      var date = moment().format('DD-MM-YYYY'); // Get the current date

      // Loop through each hour between the start and end times
      for (var m = moment(startTime); m.isBefore(endTime); m.add(1, 'hours')) {
        // Format the current time
        var hour = m.format('HH');
        // Define the database paths
        var dbPathTemp = uid.toString()+'/Average per hour/Living Room/'+date+ " - "+ hour + '/temperature';
        var dbPathHum = uid.toString()+'/Average per hour/Living Room/'+date+ " - "+ hour + '/humidity';
        // Get the hour from the database path
    
        // Get the temperature and humidity data from the Firebase database
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);

        // Get the temperature 
        
        var tempPromise = ((hour) => {
          return dbRefTemp.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              temperatures.push({hours: hour, value: val});
            }
          });
        })(hour);
        temperaturePromises.push(tempPromise);

        // Get the humidity value
        // Get the humidity value
        var humPromise = ((hour) => {
          return dbRefHum.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              humidities.push({hours: hour, value: val});
            }
          });
        })(hour);
        humidityPromises.push(humPromise);
      }

      // Wait for all promises to resolve, then draw the chart
      Promise.all(temperaturePromises.concat(humidityPromises)).then(() => {
        // After the loop, draw the histogram using the Chart.js library
        var canvas = document.getElementById('myChart_PER_HOURS');
         var parent = canvas.parentNode;

         // Remove the canvas
         parent.removeChild(canvas);

         // Create a new canvas
         var newCanvas = document.createElement('canvas');
         newCanvas.id = 'myChart_PER_HOURS';

         // Append the new canvas to the parent container
         parent.appendChild(newCanvas);

         // Now you can create a new chart
         var ctx = newCanvas.getContext('2d');
        var myChart_PER_HOURS = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: temperatures.map(item => item.hours), // Use the hours from the temperatures array as labels
            datasets: [{
              label: 'Temperature',
              data: temperatures.map(item => item.value), // Use the values from the temperatures array as data
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }, {
              label: 'Humidity',
              data: humidities.map(item => item.value), // Use the values from the humidities array as data
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'HOURLY AVERAGE'
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });

      const end = performance.now();
      const executionTime = end - start;
      console.log("drawHistogram_PER_HOUR Execution time: " + executionTime + "ms");
    }
    
    function drawHistogram_PER_DAY(uid) {
      // Define the start and end times
      log.debug("start drawHistogram_PER_DAY")
      const start=performance.now();
      var startTime = moment().startOf('month'); // This sets the start time to the beginning of the first day of the current month
      var endTime = moment().startOf('day'); // This sets the end time to the start of today
      var temperatures = [];
      var humidities = [];
      // Initialize empty arrays for temperature and humidity
      var temperaturePromises = [];
      var humidityPromises = [];

      // Loop through each day between the start and end times
      for (var m = moment(startTime); m.isBefore(endTime); m.add(1, 'days')) {
        // Format the current time
        var date = m.format('DD-MM-YYYY');
        // Define the database paths
        var dbPathTemp = uid.toString()+'/Average per day/Living Room/'+ date + '/temperature';
        var dbPathHum = uid.toString()+'/Average per day/Living Room/'+date + '/humidity';
        // Get the date from the database path
        var dateTempSegment = dbPathTemp.split('/')[3];
        var dateHumSegment = dbPathHum.split('/')[3];
         // Corrected here
        // Get the temperature and humidity data from the Firebase database
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);

        // Get the temperature value
        var tempPromise = ((date) => {
          return dbRefTemp.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              temperatures.push({date: date, value: val});
            }
          }).catch(error => {
            console.error('Error reading data:', error);
          });
        })(date);
        temperaturePromises.push(tempPromise);
          
        // Get the humidity value
        // Get the humidity value
        var humPromise = ((date) => {
          return dbRefHum.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              humidities.push({date: date, value: val});
            }
          });
        })(date);
        humidityPromises.push(humPromise);
      }

      // Wait for all promises to resolve, then draw the chart
      Promise.all(temperaturePromises.concat(humidityPromises)).then(() => {
        // Create an array of days
        var daysInMonth = moment().daysInMonth();
        var days = Array.from({length: daysInMonth}, (_, i) => moment().startOf('month').add(i, 'days').format('DD-MM-YYYY'));
        // After the loop, draw the histogram using the Chart.js library
         // Get the canvas and its parent container
         var canvas = document.getElementById('myChart_PER_DAYS');
         var parent = canvas.parentNode;

         // Remove the canvas
         parent.removeChild(canvas);

         // Create a new canvas
         var newCanvas = document.createElement('canvas');
         newCanvas.id = 'myChart_PER_DAYS';

         // Append the new canvas to the parent container
         parent.appendChild(newCanvas);

         // Now you can create a new chart
         var ctx = newCanvas.getContext('2d');
        var myChart_PER_DAYS = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: temperatures.map(item => item.date), // Use the dates from the temperatures array as labels
            datasets: [{
              label: 'Temperature',
              data: temperatures.map(item => item.value), // Use the values from the temperatures array as data
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }, {
              label: 'Humidity',
              data: humidities.map(item => item.value), // Use the values from the humidities array as data
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'DAILY AVERAGE'
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });
      const end = performance.now();
      const executionTime = end - start;
      console.log("drawHistogram_PER_DAY Execution time: " + executionTime + "ms");
    }

    function drawHistogram_PER_MONTH(uid) {
      // Define the start and end times
      log.debug("start drawHistogram_PER_DAY")
      const start=performance.now();
      var startTime = moment().subtract(1, 'years').startOf('year'); // This sets the start time to the beginning of the previous year
      var endTime = moment(); // This sets the end time to the current time
      var temperatures = [];
      var humidities = [];
      // Initialize empty arrays for temperature and humidity
      var temperaturePromises = [];
      var humidityPromises = [];

      // Loop through each month between the start and end times
      for (var m = moment(startTime); m.isBefore(endTime); m.add(1, 'months')) {
        // Format the current month
        var month = m.format('MM-YYYY');
        // Define the database paths
        var dbPathTemp = uid.toString()+'/Average per month/Living Room/'+ month + '/temperature';
        var dbPathHum = uid.toString()+'/Average per month/Living Room/'+ month + '/humidity';
        // Get the temperature and humidity data from the Firebase database
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);
        // Get the temperature 
        var tempPromise = ((month) => {
          return dbRefTemp.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              temperatures.push({month: month, value: val});
            }
          });
        })(month);
        temperaturePromises.push(tempPromise);

        // Get the humidity value
        var humPromise = ((month) => {
          return dbRefHum.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              humidities.push({month: month, value: val});
            }
          });
        })(month);
        humidityPromises.push(humPromise);
      }

      // Wait for all promises to resolve, then draw the chart
      Promise.all(temperaturePromises.concat(humidityPromises)).then(() => {
        // After the loop, draw the histogram using the Chart.js library
        // After the loop, draw the histogram using the Chart.js library

        var canvas = document.getElementById('myChart_PER_MONTH');
          var parent = canvas.parentNode;

          // Remove the canvas
          parent.removeChild(canvas);

          // Create a new canvas
          var newCanvas = document.createElement('canvas');
          newCanvas.id = 'myChart_PER_MONTH';

          // Append the new canvas to the parent container
          parent.appendChild(newCanvas);

          // Now you can create a new chart
          var ctx = newCanvas.getContext('2d');
        var myChart_PER_MONTH = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: temperatures.map(item => item.month), // Use the months from the temperatures array as labels
            datasets: [{
              label: 'Temperature',
              data: temperatures.map(item => item.value), // Use the values from the temperatures array as data
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }, {
              label: 'Humidity',
              data: humidities.map(item => item.value), // Use the values from the humidities array as data
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'MONTHLY AVERAGE'
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
        
      });
      const end = performance.now();
      const executionTime = end - start;
      log.debug("drawHistogram_PER_MONTH Execution time: " + executionTime + "ms");
    }

    function drawHistogramPerHour(date,uid) {
      // Convert the date to a Date object
      const selectedDate = new Date(date);
      log.debug("start drawHistogram_PER_HOUR_SELECTED")
      const start=performance.now();
      var startTime = moment(selectedDate).startOf('day'); // This sets the start time to the beginning of the selected day
      var endTime = moment(selectedDate).endOf('day'); // This sets the end time to the end of the selected day
      var temperatures = [];
      var humidities = [];
      // Initialize empty arrays for temperature and humidity
      var temperaturePromises = [];
      var humidityPromises = [];
      var date = moment(selectedDate).format('DD-MM-YYYY'); // Use the selected date
      for (var m = moment(startTime); m.isBefore(endTime); m.add(1, 'hours')) {
        // Format the current time
        var hour = m.format('HH');
        // Define the database paths
        var dbPathTemp = uid.toString()+'/Average per hour/Living Room/'+date+ " - "+ hour + '/temperature';
        var dbPathHum = uid.toString()+'/Average per hour/Living Room/'+date+ " - "+ hour + '/humidity';
        // Get the hour from the database path
        // Get the temperature and humidity data from the Firebase database
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);

        // Get the temperature 
        
        var tempPromise = ((hour) => {
          return dbRefTemp.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              temperatures.push({hours: hour, value: val});
            }
          });
        })(hour);
        temperaturePromises.push(tempPromise);

        // Get the humidity value
        // Get the humidity value
        var humPromise = ((hour) => {
          return dbRefHum.once('value').then(snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
              humidities.push({hours: hour, value: val});
            }
          });
        })(hour);
        humidityPromises.push(humPromise);
      }
      // Wait for all promises to resolve, then draw the chart
      Promise.all(temperaturePromises.concat(humidityPromises)).then(() => {
        // Get the canvas and its parent container
          var canvas = document.getElementById('myChart_PER_HOURS_SELECTED');
          var parent = canvas.parentNode;

          // Remove the canvas
          parent.removeChild(canvas);

          // Create a new canvas
          var newCanvas = document.createElement('canvas');
          newCanvas.id = 'myChart_PER_HOURS_SELECTED';

          // Append the new canvas to the parent container
          parent.appendChild(newCanvas);

          // Now you can create a new chart
          var ctx = newCanvas.getContext('2d');
        var myChart_PER_HOURS_SELECTED = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: temperatures.map(item => item.hours), // Use the hours from the temperatures array as labels
            datasets: [{
              label: 'Temperature',
              data: temperatures.map(item => item.value), // Use the values from the temperatures array as data
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }, {
              label: 'Humidity',
              data: humidities.map(item => item.value), // Use the values from the humidities array as data
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'HOURLY AVERAGE'
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });

      const end = performance.now();
      const executionTime = end - start;
      console.log("drawHistogram_PER_HOUR_SELECTED Execution time: " + executionTime + "ms");

      // Your code to draw the histogram here...
      // Use the selectedDate object to filter your data by date
    }
    function drawHistogramPerDay(date,uid) {
        // Define the start and end times
        log.debug("start drawHistogram_PER_DAY_SELECTED")
        const start=performance.now();
        const selectedDate = new Date(date);
        var startTime = moment(selectedDate).startOf('month'); 
        var endTime = moment(selectedDate).startOf('day'); 
        var temperatures = [];
        var humidities = [];
        // Initialize empty arrays for temperature and humidity
        var temperaturePromises = [];
        var humidityPromises = [];
  
        // Loop through each day between the start and end times
        for (var m = moment(startTime); m.isBefore(endTime); m.add(1, 'days')) {
          // Format the current time
          var date = m.format('DD-MM-YYYY');
          // Define the database paths
          var dbPathTemp = uid.toString()+'/Average per day/Living Room/'+ date + '/temperature';
          var dbPathHum = uid.toString()+'/Average per day/Living Room/'+date + '/humidity';
          // Get the date from the database path
          var dateTempSegment = dbPathTemp.split('/')[3];
          var dateHumSegment = dbPathHum.split('/')[3];
           // Corrected here
          // Get the temperature and humidity data from the Firebase database
          var dbRefTemp = firebase.database().ref().child(dbPathTemp);
          var dbRefHum = firebase.database().ref().child(dbPathHum);
  
          // Get the temperature value
          var tempPromise = ((date) => {
            return dbRefTemp.once('value').then(snap => {
              var val = snap.val();
              if (val !== null && val !== undefined) {
                temperatures.push({date: date, value: val});
              }
            }).catch(error => {
              console.error('Error reading data:', error);
            });
          })(date);
          temperaturePromises.push(tempPromise);
            
          // Get the humidity value
          // Get the humidity value
          var humPromise = ((date) => {
            return dbRefHum.once('value').then(snap => {
              var val = snap.val();
              if (val !== null && val !== undefined) {
                humidities.push({date: date, value: val});
              }
            });
          })(date);
          humidityPromises.push(humPromise);
        }
  
        // Wait for all promises to resolve, then draw the chart
        Promise.all(temperaturePromises.concat(humidityPromises)).then(() => {
          // Create an array of days
          var daysInMonth = moment().daysInMonth();
          var days = Array.from({length: daysInMonth}, (_, i) => moment().startOf('month').add(i, 'days').format('DD-MM-YYYY'));
          // After the loop, draw the histogram using the Chart.js library
           // Get the canvas and its parent container
           var canvas = document.getElementById('myChart_PER_DAYS_SELECTED');
           var parent = canvas.parentNode;
  
           // Remove the canvas
           parent.removeChild(canvas);
  
           // Create a new canvas
           var newCanvas = document.createElement('canvas');
           newCanvas.id = 'myChart_PER_DAYS_SELECTED';
  
           // Append the new canvas to the parent container
           parent.appendChild(newCanvas);
  
           // Now you can create a new chart
           var ctx = newCanvas.getContext('2d');
          var myChart_PER_DAYS = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: temperatures.map(item => item.date), // Use the dates from the temperatures array as labels
              datasets: [{
                label: 'Temperature',
                data: temperatures.map(item => item.value), // Use the values from the temperatures array as data
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }, {
                label: 'Humidity',
                data: humidities.map(item => item.value), // Use the values from the humidities array as data
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'DAILY AVERAGE'
                  }
                },
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        });
        const end = performance.now();
        const executionTime = end - start;
        console.log("drawHistogram_PER_DAY_SELECTED Execution time: " + executionTime + "ms");

    }
        // Function to update page with new readings
    function updateReadings() {
        var dateTime = moment().format('D-M-YYYY - HH-mm'); 
        var dbPathTemp = uid.toString()+'/Living Room/'+ dateTime + '/temperature';
        var dbPathHum =  uid.toString()+'/Living Room/'+dateTime + '/humidity';
    
        // Database references
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);
        

        dbRefTemp.once('value', snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
            prevTemp = val; // Update previous value
            }
            tempElement.innerText = prevTemp; // Use previous value if no new value
        });

        dbRefHum.once('value', snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
            prevHum = val; // Update previous value
            }
            humElement.innerText = prevHum; // Use previous value if no new value
        });

    }    
    // Call updateReadings every 10seconds
    setInterval(updateReadings, 10000);
    // Call drawHistogram every 10 minutes
    setInterval(drawHistogram_PER_HOUR(uid), 10 * 60 * 1000);
    setInterval(drawHistogram_PER_DAY(uid), 10 * 60 * 1000);
    setInterval(drawHistogram_PER_MONTH(uid), 10 * 60 * 1000);

  // if user is logged out
  } else{
    // toggle UI elements
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}
document.addEventListener("DOMContentLoaded", function(){
    // listen for auth status changes
    auth.onAuthStateChanged(user => {
     if (user) {
       setupUI(user);
       var uid = user.uid;
     } else {
       setupUI();
     }
    });
    
    // login
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (e) => {
     e.preventDefault();
     // get user info
     const email = loginForm['input-email'].value;
     const password = loginForm['input-password'].value;
     // log the user in
     auth.signInWithEmailAndPassword(email, password).then((cred) => {
       // close the login modal & reset form
       loginForm.reset();
     })
     .catch((error) =>{
       const errorCode = error.code;
       const errorMessage = error.message;
       document.getElementById("error-message").innerHTML = errorMessage;
       console.error(errorMessage);
     });
    });
    
    // logout
    const logout = document.querySelector('#logout-link');
    logout.addEventListener('click', (e) => {
     e.preventDefault();
     auth.signOut();
    });
  });