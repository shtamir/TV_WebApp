// main.js - Core functionality for Yakinton 46 application

let adminWasPresent = false; // Initialize adminWasPresent flag

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Start the clock
  initClock();
  
  // Load all data sources
  loadAllData();
  
  // Set up periodic refresh for dynamic data
  setupRefreshTimers();
});

// Initialize the clock/calendar
function initClock() {
  updateTimeAndDate();
  setInterval(updateTimeAndDate, 1000);
}

// Update the time and date display
function updateTimeAndDate() {
  const dateElement = document.getElementById('date');
  const timeElement = document.getElementById('time');

  const now = new Date();
  /*
  // Format date as DD.MM.YYYY
  let day = String(now.getDate()).padStart(2, '0');
  let month = String(now.getMonth() + 1).padStart(2, '0');
  let year = now.getFullYear();
  
  // Format time as HH:MM:SS
  let hours = String(now.getHours()).padStart(2, '0');
  let mins = String(now.getMinutes()).padStart(2, '0');
  let seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Put it all together
  //const formattedDateTime = `${day}.${month}.${year}<BR>${hours}:${mins}:${seconds}`;
  */

  // Display it in the box
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('he-IL', options);
  const timeString = now.toLocaleTimeString('he-IL');
  dateElement.innerHTML = dateString;
  timeElement.innerHTML = timeString;
  
  //document.getElementById('timeDateBox').innerHTML = formattedDateTime;
}

// Load all data sources initially
function loadAllData() {
  // These functions are defined in their respective JS files
  //fetchWeather();
  fetchNewsBreaks();
  fetchMessagesFromGoogleSheet();
  fetchTodoListFromGoogleSheet();
  initPhotoCarousel();
}

// Set up timers for periodic refresh of data
function setupRefreshTimers() {
  // Refresh weather every 30 minutes
  //setInterval(fetchWeather, 30 * 60 * 1000);
  
  // Refresh news every 15 minutes
  setInterval(fetchNewsBreaks, 15 * 60 * 1000);
  
  // Refresh messages and todo lists every 5 minutes
  setInterval(fetchMessagesFromGoogleSheet, 5 * 60 * 1000);
  //setInterval(fetchTodoListFromGoogleSheet, 5 * 60 * 1000);

  // Refresh photo carousel every 10 minutes
  setInterval(initPhotoCarousel, 10 * 60 * 1000); // Refresh every 10 minutes

  // Check for refresh every 60 seconds (adjust as needed)
  setInterval(checkForRemoteRefresh, 60000);

  // Check for Admin presence every 1 seconds
  //setInterval(checkForAdminPresence, 1000);  // check every 1s
}

// Helper function to show error states
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerHTML = message || 'An error occurred';
  element.classList.add('error-state');
  
  // Log to console for debugging
  console.error(`Error in ${elementId}: ${message}`);
}

// Refresh the page every 60 minutes (adjust as needed)
setTimeout(() => {
  location.reload();
}, 60 * 60 * 1000);  // 1 hour in milliseconds


function checkForRemoteRefresh() {
  fetch("refresh_trigger.txt") // URL of your remote refresh trigger
      .then(response => response.text())
      .then(data => {
          if (data.trim() === "refresh") {
              console.log("Remote refresh triggered!");
              location.reload(); // Reload the page
          }
          else {
            console.log(`No refresh triggered..`);
          }
      })
      .catch(error => console.error("Error checking refresh status:", error));
}
/*
function updateResolution() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  document.getElementById('resolutionBox').innerHTML = `Resolution: ${width} x ${height}`;
}


// Update resolution on load and when window resizes
document.addEventListener('DOMContentLoaded', updateResolution);*/
//
// Compare this snippet from js/data-sync.js:
window.addEventListener('resize', updateResolution);

const NETLIFY_BASE = 'https://yakinton-46.netlify.app/.netlify/functions';
const LOCAL_API_BASE = "http://localhost:8888/.netlify/functions";

// Determine which base URL to use based on an environment variable or condition
//const API_BASE = process.env.USE_REMOTE === 'true' ? NETLIFY_BASE : LOCAL_API_BASE;
const API_BASE = NETLIFY_BASE;
//console.log(`Using API base: ${API_BASE}`);


// Check for Admin presence
function checkForiPhonePresence() {
  fetch(`${API_BASE}/status`)
    .then(res => res.json())
    .then(data => {
      if (data.iphone_present) {
        switchToAlternateView();
      } else {
        restoreNormalView();
      }
    })
    .catch(err => console.warn("Presence check failed:", err));
}

function checkForAdminPresence_old() {
  fetch("https://v0-tvw-eb-app-os.vercel.app/api/admin-status")
    .then(res => res.json())
    .then(data => {
      if (data.admin_present) {
        console.log("Admin just connected. Switching to alternate view.");
        console.log("Admin is on same WiFi – switching view...");
        switchToAlternateView();
      } else {
        console.log("Admin not connected - restoring view...");
        restoreNormalView();
      }
    })
    .catch(err => console.warn("Presence check failed:", err));
}

// Switch to an alternate view when Admin is present
function switchToAlternateView() {
  console.log("Here 7... switchToAlternateView");

  // Change image
  document.getElementById('photoElement').src = "admin/images/admin_pic_01.jpg";

  // Change audio
  const mediaElement = document.getElementById('radioPlayer');
  mediaElement.src = "admin/audio/track_01.mp3";
  mediaElement.play().catch(() => {
    console.warn("Autoplay blocked. Adding user interaction to play.");
    document.addEventListener('click', function playAudio() {
      mediaElement.play();
      document.removeEventListener('click', playAudio);
    });
  });

   // Auto-restore to default mode after 2 minutes
   setTimeout(() => {
    restoreNormalView();
  }, 2 * 60 * 1000); // 2 minutes
}

// Restore to normal view after Admin leaves
function restoreNormalView() {
  console.log("Restoring to normal view");

  // Restart photo carousel
  initPhotoCarousel(); // this reloads the regular time/day-based photo set

  // Restart music
  const mediaElement = document.getElementById('radioPlayer');
  mediaElement.src = "audio/music_2.mp3";
  mediaElement.play().catch(err => console.warn("Autoplay blocked"));

  // Optionally reset presence file if needed (e.g., with another API call)
}
