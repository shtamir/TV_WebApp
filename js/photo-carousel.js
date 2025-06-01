// photo-carousel.js - Photo carousel functionality for Yakinton 46 application

// Configuration for photo carousel
/*const photoConfig = {
  photos: [
    "images/carousel/pic3.jpg"
    "images/carousel/pic1.jpeg",
    "images/carousel/pic2.jpeg",
    "images/carousel/pic2.jpg",
    "images/carousel/pic3.gif",
    "images/carousel/pic3.jpeg",
    "images/carousel/pic4.gif",
    "images/carousel/pic4.jpeg",
    "images/carousel/pic5.jpeg"
  ],
  interval: 10000 // Change photo every 10 seconds
}; */

// Configuration for day-wise and time-wise photo display
const photoSchedule_regular = {
  "Sunday": {
    "morning": ["images/carousel/morning_03.gif", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/sunday_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Friday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg", "images/carousel/weekend_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
};

const photoSchedule_pesah = {
  "Sunday": {
    "morning": ["images/carousel/holydays/pesah/pesah_01.jpg", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/sunday_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Friday": {
    "morning": ["images/carousel/holydays/pesah/pesah_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/holydays/pesah/pesah_02.jpg","images/carousel/goodday_01.jpg"],
    "evening": ["images/carousel/holydays/pesah/pesah_03.jpg","images/carousel/goodevening_01.jpg", "images/carousel/weekend_01.jpg", "images/carousel/holydays/pesah/pesah_04.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/holydays/pesah/pesah_01.jpg", "images/carousel/morning_04.gif", "images/carousel/holydays/pesah/pesah_02.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/holydays/pesah/pesah_02.jpg", "images/carousel/weekend_01.jpg","images/carousel/holydays/pesah/pesah_02.jpg"],
    "evening": ["images/carousel/holydays/pesah/pesah_03.jpg", "images/carousel/goodevening_01.jpg", "images/carousel/holydays/pesah/pesah_04.jpg", "images/carousel/weekend_01.jpg"]
  },
};

photoSchedule_holocaust = {
  "Sunday": {
    "morning": ["images/carousel/morning_03.gif", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/sunday_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/holydays/holocaust/Holocaust_02.jpg"],
    "noon": ["images/carousel/holydays/holocaust/Holocaust_02.jpg"],
    "evening": ["images/carousel/holydays/holocaust/Holocaust_01.jpeg"]
  },
  "Friday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg", "images/carousel/weekend_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
};


const photoSchedule_memorial_day = {
  "Sunday": {
    "morning": ["images/carousel/morning_03.gif", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/sunday_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/holydays/memorial_day/1.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/holydays/memorial_day/1.jpg"],
    "noon": ["images/carousel/holydays/memorial_day/1.jpg"],
    "evening": ["images/carousel/holydays/memorial_day/1.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/holydays/independence_day/1.jpg", "images/carousel/holydays/independence_day/2.jpg", "images/carousel/holydays/independence_day/3.jpg"],
    "noon": ["images/carousel/holydays/independence_day/1.jpg", "images/carousel/holydays/independence_day/2.jpg", "images/carousel/holydays/independence_day/3.jpg"],
    "evening": ["images/carousel/holydays/independence_day/1.jpg", "images/carousel/holydays/independence_day/2.jpg", "images/carousel/holydays/independence_day/3.jpg"]
  },
  "Friday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg", "images/carousel/weekend_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
};

// shavuot
const photoSchedule = {
  "Sunday": {
    "morning": ["images/carousel/morning_03.gif", "images/carousel/sunday_01.jpg"],
    "noon": ["images/carousel/holydays/shavuot/image_01.jpg", "images/carousel/holydays/shavuot/image_02.jpg"],
    "evening": ["images/carousel/holydays/shavuot/image_01.jpg", "images/carousel/holydays/shavuot/image_02.jpg"]
  },
  "Monday": {
    "morning": ["images/carousel/holydays/shavuot/image_01.jpg", "images/carousel/morning_04.gif", "images/carousel/holydays/shavuot/image_02.jpg" , "images/carousel/morning_01.jpg"],
    "noon": ["images/carousel/holydays/shavuot/image_01.jpg", "images/carousel/holydays/shavuot/image_02.jpg"],
    "evening": ["images/carousel/holydays/shavuot/image_01.jpg", "images/carousel/holydays/shavuot/image_02.jpg"]
  },
  "Tuesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Wednesday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Thursday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg"]
  },
  "Friday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_02.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
  "Saturday": {
    "morning": ["images/carousel/morning_04.gif", "images/carousel/morning_01.jpg", "images/carousel/weekend_01.jpg"],
    "noon": ["images/carousel/goodday_01.jpg", "images/carousel/default.jpg", "images/carousel/weekend_01.jpg"],
    "evening": ["images/carousel/goodevening_01.jpg", "images/carousel/israel_01.jpg", "images/carousel/weekend_01.jpg"]
  },
};
/*
const photoSchedule = {
  "Sunday": {
    "morning": ["images/sun_morning1.jpeg", "images/sun_morning2.jpeg"],
    "noon": ["images/sun_noon1.jpeg", "images/sun_noon2.jpeg"],
    "evening": ["images/sun_evening1.jpeg", "images/sun_evening2.jpeg"]
  },
  "Monday": {
    "morning": ["images/mon_morning1.jpeg", "images/mon_morning2.jpeg"],
    "noon": ["images/mon_noon1.jpeg", "images/mon_noon2.jpeg"],
    "evening": ["images/mon_evening1.jpeg", "images/mon_evening2.jpeg"]
  },
  "Tuesday": {
    "morning": ["images/tue_morning1.jpeg", "images/tue_morning2.jpeg"],
    "noon": ["images/tue_noon1.jpeg", "images/tue_noon2.jpeg"],
    "evening": ["images/tue_evening1.jpeg", "images/tue_evening2.jpeg"]
  },
  "Wednesday": {
    "morning": ["images/wen_morning1.jpeg", "images/wen_morning2.jpeg"],
    "noon": ["images/wen_noon1.jpeg", "images/wen_noon2.jpeg"],
    "evening": ["images/wen_evening1.jpeg", "images/wen_evening2.jpeg"]
  },
  "Thursday": {
    "morning": ["images/thu_morning1.jpeg", "images/thu_morning2.jpeg"],
    "noon": ["images/thu_noon1.jpeg", "images/thu_noon2.jpeg"],
    "evening": ["images/thu_evening1.jpeg", "images/thu_evening2.jpeg"]
  },
  "Friday": {
    "morning": ["images/fri_morning1.jpeg", "images/fri_morning2.jpeg"],
    "noon": ["images/fri_noon1.jpeg", "images/fri_noon2.jpeg"],
    "evening": ["images/fri_evening1.jpeg", "images/fri_evening2.jpeg"]
  },
  "Saturday": {
    "morning": ["images/sat_morning1.jpeg", "images/sat_morning2.jpeg"],
    "noon": ["images/sat_noon1.jpeg", "images/sat_noon2.jpeg"],
    "evening": ["images/sat_evening1.jpeg", "images/sat_evening2.jpeg"]
  },
};*/

// Function to get the current time slot
function getTimeSlot() {
  const now = new Date();
  const hour = now.getHours();
  console.log(`getTimeSlot(): hour:${hour}, now: ${now}`);
  if (hour >= 5 && hour < 12) return "morning";  // 05:00 - 11:59
  if (hour >= 12 && hour < 20) return "noon";    // 12:00 - 17:59
  return "evening";                              // 18:00 - 04:59
}


// Function to get today's photo set
function getTodayPhotos() {
  const now = new Date();
  const dayName = now.toLocaleString('en-US', { weekday: 'long' });
  const timeSlot = getTimeSlot();
  console.log(`getTodayPhotos(): timeSlot:${timeSlot}, dayName: ${dayName}`);
  return photoSchedule[dayName]?.[timeSlot] || ["images/default.jpg"];
}


// Variables for rotation
let currentPhotoIndex = 0;
let photoInterval = null;

// Initialize the photo carousel
function initPhotoCarousel() {
  photoElement = document.getElementById('photoElement');

  if (!photoElement) {
    console.error('Photo element not found!');
    return;
  }

  const photos = getTodayPhotos();
  if (photos.length === 0) {
    console.error('No photos found for today!');
    return;
  }

  // Set initial photo
  photoElement.src = photos[0];

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
  }, 1000); // Wait 1 second for fade-out
}

// Preload images for smooth transitions
function preloadImages() {
  Object.values(photoSchedule).forEach(day => {
    Object.values(day).forEach(timeSlot => {
      timeSlot.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    });
  });
}


// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  preloadImages();
  initPhotoCarousel();
});

// End of photo-carousel.js
