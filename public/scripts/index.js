
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
    console.log(uid);
    prevHum="unkown";
    prevTemp="unkown";
//todo make the room,device and date dinamicly chosen
    // Database paths (with user UID)
    updateReadings();
    
        // Function to update page with new readings
    function updateReadings() {
        var dateTime = moment().format('D-M-YYYY - HH-mm'); 
        var dbPathTemp = uid.toString()+'/Living Room/'+ dateTime + '/temperature';
        var dbPathHum =  uid.toString()+'/Living Room/'+dateTime + '/humidity';
        console.log(dbPathTemp);
        console.log(dbPathHum);
    
        // Database references
        var dbRefTemp = firebase.database().ref().child(dbPathTemp);
        var dbRefHum = firebase.database().ref().child(dbPathHum);
        

        dbRefTemp.once('value', snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
            prevTemp = val; // Update previous value
            }
            tempElement.innerText = prevTemp; // Use previous value if no new value
            console.log(prevTemp);
        });

        dbRefHum.once('value', snap => {
            var val = snap.val();
            if (val !== null && val !== undefined) {
            prevHum = val; // Update previous value
            }
            humElement.innerText = prevHum; // Use previous value if no new value
            console.log(prevHum);
        });
    }

    // Call updateReadings every 10seconds
    setInterval(updateReadings, 10000);


   

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
       console.log("user logged in");
       console.log(user);
       setupUI(user);
       var uid = user.uid;
       console.log(uid);
     } else {
       console.log("user logged out");
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
       console.log(email);
     })
     .catch((error) =>{
       const errorCode = error.code;
       const errorMessage = error.message;
       document.getElementById("error-message").innerHTML = errorMessage;
       console.log(errorMessage);
     });
    });
    
    // logout
    const logout = document.querySelector('#logout-link');
    logout.addEventListener('click', (e) => {
     e.preventDefault();
     auth.signOut();
    });
  });