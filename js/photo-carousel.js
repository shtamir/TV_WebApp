// photo-carousel.js - Photo carousel functionality for Yakinton 46 application

// Configuration for day-wise and time-wise photo display
const defaultPhotoSchedule = {
  "Sunday": {
    "morning": ["images/carousel/morning_03.gif", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/sunday_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Friday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg", "images/carousel/weekend_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"],
    "night": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
};

window.defaultPhotoSchedule = defaultPhotoSchedule;

if (!window.photoSchedule) {
  try {
    window.photoSchedule = JSON.parse(JSON.stringify(defaultPhotoSchedule));
  } catch (error) {
    console.warn('Unable to clone default photo schedule, using reference instead.', error);
    window.photoSchedule = defaultPhotoSchedule;
  }
}

if (!window.photoHolidaySchedule) {
  window.photoHolidaySchedule = {};
}

// Function to get the current time slot
function getTimeSlot() {
  const testing = window.testingControls;
  if (testing?.enabled && testing.overrideTimeSlot) {
    console.log(`getTimeSlot(): Using testing override ${testing.overrideTimeSlot}`);
    return testing.overrideTimeSlot;
  }

  const now = typeof window.getCurrentDate === 'function' ? window.getCurrentDate() : new Date();
  const hour = now.getHours();
  console.log(`getTimeSlot(): hour:${hour}, now: ${now}`);
  if (hour >= 20 || hour < 5) return "night";    // 20:00 - 04:59
  if (hour >= 5 && hour < 12) return "morning";  // 05:00 - 11:59
  if (hour >= 12 && hour < 18) return "noon";    // 12:00 - 17:59
  return "evening";                              // 18:00 - 19:59
}


function getHolidayPhotos() {
  const now = typeof window.getCurrentDate === 'function' ? window.getCurrentDate() : new Date();
  const testing = window.testingControls;
  const isoDate = testing?.enabled && testing.overrideDate
    ? testing.overrideDate
    : now.toISOString().split('T')[0];
  const timeSlot = getTimeSlot();
  const holidaySchedule = window.photoHolidaySchedule || {};
  const holidayForToday = holidaySchedule[isoDate];

  if (!holidayForToday) {
    if (window.activeHolidayName) {
      window.activeHolidayName = '';
    }
    return null;
  }

  const holidayPhotos =
    holidayForToday?.[timeSlot] ||
    holidayForToday?.all ||
    holidayForToday?.any ||
    holidayForToday?.default ||
    null;

  const holidayName = holidayForToday?.__meta?.name;
  if (holidayName) {
    window.activeHolidayName = holidayName;
  } else if (window.activeHolidayName) {
    window.activeHolidayName = '';
  }

  if (holidayPhotos && holidayPhotos.length) {
    console.log(
      `getHolidayPhotos(): Using holiday photos for ${isoDate}, timeSlot: ${timeSlot}${holidayName ? `, holiday: ${holidayName}` : ''}`
    );
  }

  return holidayPhotos;
}

// Function to get today's photo set
function getTodayPhotos() {
  const testing = window.testingControls;
  let dayName = null;

  if (testing?.enabled && testing.overrideDayName) {
    dayName = testing.overrideDayName;
  }

  if (!dayName) {
    const now = typeof window.getCurrentDate === 'function' ? window.getCurrentDate() : new Date();
    dayName = now.toLocaleString('en-US', { weekday: 'long' });
  }

  const timeSlot = getTimeSlot();
  console.log(`getTodayPhotos(): timeSlot:${timeSlot}, dayName: ${dayName}`);
  const holidayPhotos = getHolidayPhotos();

  if (holidayPhotos && holidayPhotos.length) {
    return holidayPhotos;
  }

  const activeSchedule = window.photoSchedule || defaultPhotoSchedule;
  return (
    activeSchedule?.[dayName]?.[timeSlot] ||
    activeSchedule?.[dayName]?.all ||
    activeSchedule?.[dayName]?.any ||
    defaultPhotoSchedule?.[dayName]?.[timeSlot] ||
    defaultPhotoSchedule?.[dayName]?.all ||
    defaultPhotoSchedule?.[dayName]?.any ||
    ["images/default.jpg"]
  );
}


// Variables for rotation
let currentPhotoIndex = 0;
let photoInterval = null;

// Initialize the photo carousel
function initPhotoCarousel() {
  const photoElement = document.getElementById('photoElement');

  if (!photoElement) {
    console.error('Photo element not found!');
    return;
  }

  if (photoInterval) {
    clearInterval(photoInterval);
    photoInterval = null;
  }

  const photos = getTodayPhotos();
  if (photos.length === 0) {
    console.error('No photos found for today!');
    return;
  }

  // Set initial photo
  currentPhotoIndex = 0;
  photoElement.src = photos[0];
  if (typeof window.setTestingCurrentPhotoSource === 'function') {
    window.setTestingCurrentPhotoSource(photos[0]);
  }

  // Start rotation if multiple photos exist
  if (photos.length > 1) {
    photoInterval = setInterval(() => rotatePhotos(photos), 15000);
  }
}

// Rotate between available photos
function rotatePhotos(photoList) {
  const photoElement = document.getElementById('photoElement');
  if (!photoElement) return;

  currentPhotoIndex = (currentPhotoIndex + 1) % photoList.length;
  
  // Fade out effect
  photoElement.style.opacity = 0;
  
  setTimeout(() => {
    photoElement.src = photoList[currentPhotoIndex];
    photoElement.style.opacity = 1;
    if (typeof window.setTestingCurrentPhotoSource === 'function') {
      window.setTestingCurrentPhotoSource(photoList[currentPhotoIndex]);
    }
  }, 1000); // Wait 1 second for fade-out
}

// Preload images for smooth transitions
function preloadImages() {
  const activeSchedule = window.photoSchedule || {};
  const scheduleToPreload = Object.keys(activeSchedule).length ? activeSchedule : defaultPhotoSchedule;
  const holidaySchedule = window.photoHolidaySchedule || {};

  const preloadFromNode = node => {
    if (!node) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(src => {
        const img = new Image();
        img.src = src;
      });
      return;
    }

    if (typeof node === 'object') {
      Object.values(node).forEach(preloadFromNode);
    }
  };

  preloadFromNode(scheduleToPreload);
  preloadFromNode(holidaySchedule);
}

/*
// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  preloadImages();
  initPhotoCarousel();
});
*/
// End of photo-carousel.js
