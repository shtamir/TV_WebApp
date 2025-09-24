# Yakinton 46 Digital Billboard

A web application designed to run on an Android TV web browser and display various types of information in a billboard-style format.

Lobby TV resolution is 1024x577

[Link](https://tv-web-app-mu.vercel.app)

## Features

- Real-time clock and date display
- Team messages synchronized with Google Sheets
- Rotating photo carousel
- Current weather forecast for a specified location
- News headlines from RSS feeds
- Todo list synchronized with Google Sheets
- Contact information displayed as QR codes
- Background music player

## Technology Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Google Sheets API (via published CSV)
- OpenWeatherMap API
- RSS feed integration

## Project Structure

```
yakinton46/
│
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── images/                 # Image assets
│   ├── background.jpg      # Background image
│   ├── pic1.jpeg           # Carousel photos
│   ├── pic2.jpeg
│   ├── ...
│   ├── WifiQR.svg          # QR code images
│   ├── CallQR.svg
│   └── EmailQR.svg
├── audio/                  # Audio files
│   └── music_1.mp3
└── js/                     # JavaScript files
    ├── main.js             # Core functionality
    ├── weather.js          # Weather integration
    ├── news.js             # News feed integration
    ├── data-sync.js        # Google Sheets integration
    └── photo-carousel.js   # Photo rotation
```

## Setup Instructions

1. Clone this repository
2. Update the Google Sheets URLs in `data-sync.js` to point to your published sheets
3. Replace the images in the `images` folder with your own
4. Update the OpenWeatherMap API key in `weather.js` with your own
5. Customize the city in `weather.js` to your desired location
6. Configure your photo schedule in the Google Sheet tab referenced by `photoSheetUrl`
7. Replace the audio file with your preferred background music

## Google Sheets Configuration

### Messages Sheet
- Format: First column contains messages
- Publish to web as CSV

### Todo List Sheet
- Format: First column contains todo items
- Publish to web as CSV

### Photo Schedule Sheet
- Each row describes either a default schedule entry or a holiday override
- Required columns: `day_of_week`, `time_slot`, `photo_urls`
- Optional columns: `type` (use `holiday` for overrides), `date` (ISO format `YYYY-MM-DD` or `DD/MM` for recurring annual holidays), and `holiday_name`
- Separate multiple photo URLs in `photo_urls` with the `|` character
- Valid time slots: `morning`, `noon`, `evening`, `night`, or `all` (applies to every slot)
- Publish the sheet tab to the web as CSV, similar to the messages sheet

## Deployment Options

### Free Hosting
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Heroku (Free tier)

### Paid Hosting
- DigitalOcean ($5/month)
- AWS (S3, EC2, Lightsail)
- Google Cloud Platform
- Azure Web Apps
- Linode

## Security Considerations

For production use, consider:
- Implementing a server-side proxy for API calls to avoid exposing API keys
- Setting up proper CORS headers
- Implementing SSL/TLS for secure connections

## Future Improvements

- Add geolocation for automatic weather location detection
- Implement Google Photos API integration for photo management
- Add additional data sources (calendar events, traffic, etc.)
- Implement user authentication for admin control panel
