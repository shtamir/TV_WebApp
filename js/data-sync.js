// data-sync.js - Google Sheets data synchronization for Yakinton 46 application

// Configuration for Google Sheets
const sheetsConfig = {
  //messagesSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm_3aSAL3tnmyOHuAXMIc0IF6V3MlR-CmB3rmebHON0V_V3r3ido3hdq2qr_ByTbIayW1AKZjp45IL/pub?gid=0&single=true&output=csv',  
  messagesSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm_3aSAL3tnmyOHuAXMIc0IF6V3MlR-CmB3rmebHON0V_V3r3ido3hdq2qr_ByTbIayW1AKZjp45IL/pub?gid=0&single=true&output=csv',
  todoSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm_3aSAL3tnmyOHuAXMIc0IF6V3MlR-CmB3rmebHON0V_V3r3ido3hdq2qr_ByTbIayW1AKZjp45IL/pub?gid=1147753220&single=true&output=csv',
  photoSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm_3aSAL3tnmyOHuAXMIc0IF6V3MlR-CmB3rmebHON0V_V3r3ido3hdq2qr_ByTbIayW1AKZjp45IL/pub?gid=1165060238&single=true&output=csv',
  maxMessages: 10,
  maxTodoItems: 16
};

// Fetch team messages from Google Sheets
function fetchMessagesFromGoogleSheet() {
  document.getElementById('messagesBox').innerHTML = '<div class="loading-indicator">Loading messages...</div>';

  fetch(sheetsConfig.messagesSheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n');
      const messageData = lines
        .map(line => line.split(',')) // Split each line into columns
        .slice(0, sheetsConfig.maxMessages) // Take all rows, including the first one
        .map(row => ({
          text: row[0]?.trim() || '',         // First column: Message
          color: row[1]?.trim() || '#000000', // Second column: Text color (default black)
          fontSize: row[2]?.trim() || '16px'  // Third column: Font size (default 16px)
        }))
        .filter(item => item.text.length > 0); // Remove empty messages

      // Generate HTML
      const messagesHTML = `
        ${messageData.map(item => `
          <div style="color: ${item.color}; font-size: ${item.fontSize};">
            ${item.text}
          </div>
        `).join('')}
      `;

      document.getElementById('messagesBox').innerHTML = messagesHTML;
    })
    .catch(error => {
      console.error('Error fetching sheet data:', error);
      showError('messagesBox', 'Unable to load messages');
    });
}

function cloneDefaultPhotoSchedule() {
  if (typeof window !== 'undefined' && window.defaultPhotoSchedule) {
    try {
      return JSON.parse(JSON.stringify(window.defaultPhotoSchedule));
    } catch (error) {
      console.warn('Unable to clone default photo schedule, using shallow copy instead.', error);
      return Object.assign({}, window.defaultPhotoSchedule);
    }
  }
  return {};
}

// Fetch photo schedule from Google Sheets
function fetchPhotoScheduleFromGoogleSheet() {
  if (!sheetsConfig || !sheetsConfig.photoSheetUrl) {
    console.warn('Photo sheet URL is not configured. Falling back to default schedule.');
    window.photoSchedule = cloneDefaultPhotoSchedule();
    return Promise.resolve(window.photoSchedule);
  }

  return fetch(sheetsConfig.photoSheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const lines = data
        .split('\n')
        .map(line => line.replace(/\r/g, '').trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        console.warn('Photo schedule sheet is empty. Using default schedule.');
        window.photoSchedule = cloneDefaultPhotoSchedule();
        return window.photoSchedule;
      }

      const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
      const headerRow = rows[0].map(cell => cell.toLowerCase());
      const hasHeader = headerRow.includes('day_of_week') || headerRow.includes('time_slot') || headerRow.includes('photo_urls');

      let dayIndex = 0;
      let timeIndex = 1;
      let urlsIndex = 2;
      let dataRows = rows;

      if (hasHeader) {
        dayIndex = headerRow.indexOf('day_of_week');
        timeIndex = headerRow.indexOf('time_slot');
        urlsIndex = headerRow.indexOf('photo_urls');

        if (dayIndex === -1 || timeIndex === -1 || urlsIndex === -1) {
          console.warn('Photo schedule sheet headers are incomplete. Using default schedule.');
          window.photoSchedule = cloneDefaultPhotoSchedule();
          return window.photoSchedule;
        }

        dataRows = rows.slice(1);
      }

      const updatedSchedule = cloneDefaultPhotoSchedule();
      const validTimeSlots = new Set(['morning', 'noon', 'evening']);
      const dayNameMap = {
        'sunday': 'Sunday',
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday'
      };

      dataRows.forEach(row => {
        const dayRaw = row[dayIndex] || '';
        const timeRaw = row[timeIndex] || '';
        const urlsRaw = row[urlsIndex] || '';

        const normalizedDay = dayNameMap[dayRaw.trim().toLowerCase()];
        const normalizedTimeSlot = timeRaw.trim().toLowerCase();

        if (!normalizedDay || !normalizedTimeSlot || urlsRaw.length === 0) {
          return;
        }

        const photoUrls = urlsRaw
          .split('|')
          .map(url => url.trim())
          .filter(url => url.length > 0);

        if (photoUrls.length === 0 || !validTimeSlots.has(normalizedTimeSlot)) {
          return;
        }

        if (!updatedSchedule[normalizedDay]) {
          updatedSchedule[normalizedDay] = {};
        }

        updatedSchedule[normalizedDay][normalizedTimeSlot] = photoUrls;
      });

      window.photoSchedule = updatedSchedule;
      return window.photoSchedule;
    })
    .catch(error => {
      console.error('Error fetching photo schedule:', error);
      window.photoSchedule = cloneDefaultPhotoSchedule();
      throw error;
    });
}


// Fetch todo list items from Google Sheets
function fetchTodoListFromGoogleSheet_prev() {
  // Show loading state
  document.getElementById('todoListBox').innerHTML = '<div class="loading-indicator">Loading todo list...</div>';
  
  // For this example, we'll use the same sheet URL but you should use a different sheet or tab in production
  fetch(sheetsConfig.todoSheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n');
      
      // For each line, take only the first column
      const todoItems = lines
        .map(line => line.split(',')[0])  // split by comma, take first cell
        .map(value => value.trim())       // remove extra whitespace
        .filter(value => value.length > 0) // remove any empty lines
        .slice(1, sheetsConfig.maxTodoItems + 1); // Skip header, take up to max items

      // If no items, show a message
      if (todoItems.length === 0) {
        document.getElementById('todoListBox').innerHTML = 'No todo items';
        return;
      }

      // Display todo items with a header and checkbox styling
      const todoHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">Todo List:</div>
        ${todoItems.map(item => `☐ ${item}`).join('<br>')}
      `;
      document.getElementById('todoListBox').innerHTML = todoHTML;
    })
    .catch(error => {
      console.error('Error fetching todo data:', error);
      showError('todoListBox', 'Unable to load todo list');
    });
}


// Fetch todo list table from Google Sheets
function fetchTodoListFromGoogleSheet_prev1() {
  const todoListBox = document.getElementById('todoListBox');
  if (!todoListBox) {
    console.error("todoListBox element not found!");
    return;
  }

  // Show loading state
  todoListBox.innerHTML = '<div class="loading-indicator">Loading todo list...</div>';

  // Validate sheetsConfig
  if (!sheetsConfig || !sheetsConfig.todoSheetUrl) {
    console.error("sheetsConfig is not defined or missing todoSheetUrl.");
    showError('todoListBox', 'Configuration error: Missing Google Sheets URL');
    return;
  }

  fetch(sheetsConfig.todoSheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n').map(line => line.split(',')); // Convert CSV to array of rows

      if (lines.length < 2) { // Check if there's data beyond the header
        todoListBox.innerHTML = 'No todo items';
        return;
      }

      // Extract headers and rows
      const headers = lines[1];  // First row is headers (Apartment, month#1, month#2, ...)
      const rows = lines.slice(2, sheetsConfig.maxTodoItems + 1); // Skip headers, limit rows

      // Build the table HTML
      let tableHTML = `<table class="todo-table">`;
      
      // Create table headers
      tableHTML += `<tr>${headers.map(header => `<th>${header.trim()}</th>`).join('')}</tr>`;

      // Create table rows
      rows.forEach(row => {
        tableHTML += `<tr>${row.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
      });

      tableHTML += `</table>`;

      // Insert table into the HTML
      todoListBox.innerHTML = tableHTML;
    })
    .catch(error => {
      console.error('Error fetching todo data:', error);
      showError('todoListBox', 'Unable to load todo list');
    });
}

function fetchTodoListFromGoogleSheet() {
  const todoListBox = document.getElementById('todoListBox');
  if (!todoListBox) {
    console.error("todoListBox element not found!");
    return;
  }

  // Show loading state
  todoListBox.innerHTML = '<div class="loading-indicator">Loading todo list...</div>';

  // Validate sheetsConfig
  if (!sheetsConfig || !sheetsConfig.todoSheetUrl) {
    console.error("sheetsConfig is not defined or missing todoSheetUrl.");
    showError('todoListBox', 'Configuration error: Missing Google Sheets URL');
    return;
  }

  fetch(sheetsConfig.todoSheetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n').map(line => line.split(',')); // Convert CSV to array of rows

      if (lines.length < 2) { // Check if there's data beyond the header
        todoListBox.innerHTML = 'No todo items';
        return;
      }

      // Extract the first row as the heading
      const heading = lines[0].join(' ').trim();

      // Extract table headers and rows
      const headers = lines[1];  // First row is headers (Apartment, month#1, month#2, ...)
      const rows = lines.slice(2, sheetsConfig.maxTodoItems + 1); // Skip headers, limit rows

      // Build the table HTML
      let tableHTML = `<table class="todo-table">`;
      
      // TAMIR
      // Add the heading as a merged and centered table row
      tableHTML += `<tr><td colspan="${headers.length}" style="text-align: center; font-weight: bold;">${heading}</td></tr>`;
      

      // Create table headers
      tableHTML += `<tr>${headers.map(header => `<th>${header.trim()}</th>`).join('')}</tr>`;

      // Create table rows
      rows.forEach(row => {
        tableHTML += `<tr>${row.map((cell, index) => {
          if (index === 0) {
            return `<td class="sub-header">${cell.trim()}</td>`;
          } else {
            let icon;
            switch (cell.trim()) {
              case '1':
                icon = '✔'; // Paid
                break;
              case '0':
                icon = '✘'; // Didn't pay
                break;
              case '-1':
                icon = '⧖'; // Waiting for payment
                break;
              default:
                icon = '?'; // Unknown status
            }
            return `<td>${icon}</td>`;
          }
        }).join('')}</tr>`;
      });

      tableHTML += `</table>`;

      // Insert table into the HTML
      todoListBox.innerHTML = tableHTML;

    })
    .catch(error => {
      console.error('Error fetching todo data:', error);
      showError('todoListBox', 'Unable to load todo list');
    });
}