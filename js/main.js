// main.js - Core functionality for Yakinton 46 application

let adminWasPresent = false; // Initialize adminWasPresent flag

const searchParams = new URLSearchParams(window.location.search || '');
const testModeEnabled =
  searchParams.has('testMode') ||
  searchParams.get('testing') === 'true' ||
  searchParams.get('testTime') === '1';

const testingControls = {
  enabled: testModeEnabled,
  overrideDayName: null,
  overrideTimeSlot: null,
  overrideDate: null,
  infoElement: null,
  imageInfoElement: null,
  currentPhotoSrc: null,
  changeCallbacks: [],
};

window.testingControls = testingControls;

function updateTestingInfoDisplay() {
  if (!testingControls.enabled) {
    return;
  }

  if (testingControls.infoElement) {
    const activeOverrides = [];
    if (testingControls.overrideDate) {
      activeOverrides.push(`Date: ${testingControls.overrideDate}`);
    }
    if (testingControls.overrideDayName) {
      activeOverrides.push(`Day: ${testingControls.overrideDayName}`);
    }
    if (testingControls.overrideTimeSlot) {
      activeOverrides.push(`Slot: ${testingControls.overrideTimeSlot}`);
    }
    testingControls.infoElement.textContent = activeOverrides.length
      ? `Testing overrides → ${activeOverrides.join(' | ')}`
      : 'Testing overrides are disabled';
  }

  if (testingControls.imageInfoElement) {
    testingControls.imageInfoElement.textContent = testingControls.currentPhotoSrc
      ? `Current image source → ${testingControls.currentPhotoSrc}`
      : 'Current image source → (not set)';
  }
}

function setTestingCurrentPhotoSource(src) {
  if (!testingControls.enabled) {
    return;
  }
  testingControls.currentPhotoSrc = src || null;
  updateTestingInfoDisplay();
}

window.setTestingCurrentPhotoSource = setTestingCurrentPhotoSource;

function registerTestingChangeCallback(callback) {
  if (typeof callback === 'function') {
    testingControls.changeCallbacks.push(callback);
  }
}

function notifyTestingChange() {
  testingControls.changeCallbacks.forEach(callback => {
    try {
      callback(testingControls);
    } catch (error) {
      console.error('Testing change callback failed:', error);
    }
  });
  updateTestingInfoDisplay();
}

function getCurrentDate() {
  const baseDate = new Date();

  if (!testingControls.enabled) {
    return baseDate;
  }

  const simulatedDate = new Date(baseDate.getTime());

  if (testingControls.overrideDate) {
    const parts = testingControls.overrideDate.split('-').map(Number);
    if (parts.length === 3 && parts.every(part => Number.isFinite(part))) {
      const [year, month, day] = parts;
      simulatedDate.setFullYear(year, month - 1, day);
    }
  } else if (testingControls.overrideDayName) {
    const dayNameToIndex = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const desiredIndex = dayNameToIndex[testingControls.overrideDayName];
    if (typeof desiredIndex === 'number') {
      const diff = desiredIndex - simulatedDate.getDay();
      simulatedDate.setDate(simulatedDate.getDate() + diff);
    }
  }

  if (testingControls.overrideTimeSlot) {
    const timeSlotHour = {
      morning: 9,
      noon: 13,
      evening: 18,
      night: 22,
    }[testingControls.overrideTimeSlot];

    if (typeof timeSlotHour === 'number') {
      simulatedDate.setHours(timeSlotHour, 0, 0, 0);
    }
  }

  return simulatedDate;
}

window.getCurrentDate = getCurrentDate;

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (testingControls.enabled) {
    setupTestingControls();
  }

  // Start the clock
  initClock();

  // Load all data sources
  loadAllData();

  // Set up periodic refresh for dynamic data
  setupRefreshTimers();
});

registerTestingChangeCallback(() => {
  updateTimeAndDate();
  if (typeof preloadImages === 'function') {
    preloadImages();
  }
  if (typeof initPhotoCarousel === 'function') {
    initPhotoCarousel();
  }
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

  const now = getCurrentDate();
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

  updateTestingInfoDisplay();

  //document.getElementById('timeDateBox').innerHTML = formattedDateTime;
}

// Load all data sources initially
function loadAllData() {
  // These functions are defined in their respective JS files
  //fetchWeather();
  fetchNewsBreaks();
  fetchMessagesFromGoogleSheet();
  fetchTodoListFromGoogleSheet();
  //initPhotoCarousel();
  fetchPhotoScheduleFromGoogleSheet()
    .catch(error => {
      console.error('Failed to fetch photo schedule from Google Sheets. Using fallback schedule.', error);
    })
    .finally(() => {
      preloadImages();
      initPhotoCarousel();
    });
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

function setupTestingControls() {
  const panel = document.createElement('div');
  panel.id = 'testingControlsPanel';
  panel.style.position = 'fixed';
  panel.style.top = '10px';
  panel.style.right = '10px';
  panel.style.background = 'rgba(0, 0, 0, 0.75)';
  panel.style.border = '1px solid #ffffff55';
  panel.style.padding = '12px';
  panel.style.zIndex = '9999';
  panel.style.fontFamily = 'Arial, sans-serif';
  panel.style.fontSize = '14px';
  panel.style.color = '#fff';
  panel.style.borderRadius = '8px';
  panel.style.maxWidth = '260px';

  const title = document.createElement('div');
  title.textContent = 'Testing Controls';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '8px';
  panel.appendChild(title);

  const infoLine = document.createElement('div');
  infoLine.style.fontSize = '12px';
  infoLine.style.marginBottom = '8px';
  infoLine.textContent = 'Testing overrides are disabled';
  panel.appendChild(infoLine);
  testingControls.infoElement = infoLine;

  const imageInfoLine = document.createElement('div');
  imageInfoLine.style.fontSize = '12px';
  imageInfoLine.style.marginBottom = '8px';
  imageInfoLine.textContent = 'Current image source → (not set)';
  panel.appendChild(imageInfoLine);
  testingControls.imageInfoElement = imageInfoLine;

  const createField = (labelText, inputElement) => {
    const wrapper = document.createElement('label');
    wrapper.style.display = 'block';
    wrapper.style.marginBottom = '6px';

    const label = document.createElement('span');
    label.textContent = labelText;
    label.style.display = 'block';
    label.style.marginBottom = '2px';

    wrapper.appendChild(label);
    wrapper.appendChild(inputElement);
    panel.appendChild(wrapper);
  };

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.style.width = '100%';
  dateInput.addEventListener('change', event => {
    testingControls.overrideDate = event.target.value || null;

    if (testingControls.overrideDate) {
      const selectedDate = new Date(`${testingControls.overrideDate}T00:00:00`);
      if (!Number.isNaN(selectedDate.getTime())) {
        const dayName = selectedDate.toLocaleString('en-US', { weekday: 'long' });
        testingControls.overrideDayName = dayName;
        daySelect.value = dayName;
      }
    }

    notifyTestingChange();
  });

  createField('Override date', dateInput);

  const daySelect = document.createElement('select');
  daySelect.style.width = '100%';
  ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .forEach(dayName => {
      const option = document.createElement('option');
      option.value = dayName || '';
      option.textContent = dayName || 'Current day';
      daySelect.appendChild(option);
    });

  daySelect.addEventListener('change', event => {
    testingControls.overrideDayName = event.target.value || null;
    if (!event.target.value) {
      if (testingControls.overrideDate) {
        testingControls.overrideDate = null;
        dateInput.value = '';
      }
    }
    notifyTestingChange();
  });

  createField('Override day of week', daySelect);

  const timeSlotSelect = document.createElement('select');
  timeSlotSelect.style.width = '100%';
  ['', 'morning', 'noon', 'evening', 'night'].forEach(slot => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = slot ? slot.charAt(0).toUpperCase() + slot.slice(1) : 'Current slot';
    timeSlotSelect.appendChild(option);
  });

  timeSlotSelect.addEventListener('change', event => {
    testingControls.overrideTimeSlot = event.target.value || null;
    notifyTestingChange();
  });

  createField('Override time slot', timeSlotSelect);

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.textContent = 'Reset overrides';
  resetButton.style.marginTop = '6px';
  resetButton.style.width = '100%';
  resetButton.style.padding = '6px';
  resetButton.style.border = 'none';
  resetButton.style.borderRadius = '4px';
  resetButton.style.cursor = 'pointer';
  resetButton.style.background = '#2c7be5';
  resetButton.style.color = '#fff';

  resetButton.addEventListener('click', () => {
    testingControls.overrideDate = null;
    testingControls.overrideDayName = null;
    testingControls.overrideTimeSlot = null;
    dateInput.value = '';
    daySelect.value = '';
    timeSlotSelect.value = '';
    notifyTestingChange();
  });

  panel.appendChild(resetButton);

  document.body.appendChild(panel);
  notifyTestingChange();
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
function updateResolution() {
  const resolutionElement = document.getElementById('resolutionBox');
  if (!resolutionElement) {
    return;
  }

  if (!testingControls.enabled) {
    resolutionElement.textContent = '';
    resolutionElement.style.display = 'none';
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  resolutionElement.style.display = 'block';
  resolutionElement.textContent = `Resolution: ${width} x ${height}`;
}

// Update resolution on load and when the window resizes
document.addEventListener('DOMContentLoaded', updateResolution);
window.addEventListener('resize', updateResolution);

// Check for Admin presence
function checkForAdminPresence() {
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
