
const API_URL_BASE = 'https://facilitai-api.onrender.com'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const queryInput = document.getElementById('query-input');
  const responseContainer = document.getElementById('response-container');
  const container = document.getElementById('container');
  const sampleQuery = document.getElementById('sample-query');

  let apiBaseUrl;
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    // Running on localhost - use local API server
    apiBaseUrl = 'http://localhost/api';
  } else {
    // Running on live site - use live API endpoint
    apiBaseUrl = 'https://facilitai-api.onrender.com';
  }



  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    // Show loading message
    responseContainer.innerHTML = '<p>Loading...</p>';

    // Move form to top
    container.classList.add('shrink');
    sampleQuery.classList.add('hidden');

    try {
      // Make API request
      const response = await fetch(API_URL_BASE+'/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        // Convert response to a better format 
        let resp = textToHtml(data.response)
        console.log("CHECK", data.response, resp)
        // Display the response. 
        responseContainer.innerHTML = `<h2>Response:</h2>${resp}`;
      } else {
        responseContainer.innerHTML = `<p>Error: ${response.statusText}</p>`;
      }
    } catch (error) {
      responseContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });
});

function textToHtml(inputText) {
  let lines = inputText.split('\n');
  let html = '';
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line === '') {
      i++;
      continue;
    }

    // Headers: Markdown style (#, ##, ###, etc.)
    if (line.startsWith('#')) {
      const headerMatch = line.match(/^(#+)\s*(.*)/);
      if (headerMatch) {
        const headerLevel = headerMatch[1].length;
        const headerText = headerMatch[2];
        html += `<h${headerLevel}>${headerText}</h${headerLevel}>\n`;
      }
      i++;
      continue;
    }

    // Unordered List Items: Lines starting with '-'
    if (line.startsWith('-')) {
      html += '<ul>\n';
      while (i < lines.length && lines[i].trim().startsWith('-')) {
        let line = lines[i].trim();
        // Skip empty lines
        if (line === '') {
          i++;
          continue;
        }
        const listItem = line.trim().substring(1).trim();
        html += `  <li>${listItem}</li>\n`;
        i++;
      }
      html += '</ul>\n';
      continue;
    }

    // Ordered List Items: Lines starting with numbers (e.g., '1.', '2)', etc.)
    const orderedListMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
    if (orderedListMatch) {
      html += '<ol>\n';
      while (i < lines.length) {
        let line = lines[i].trim();
        
        // Skip empty lines
        if (line === '') {
          i++;
          continue;
        }
        const orderedLine = line.trim();
        const orderedItemMatch = orderedLine.match(/^(\d+)[\.\)]\s*(.*)/);
        if (orderedItemMatch) {
          const listItem = orderedItemMatch[2];
          html += `  <li>${listItem}</li>\n`;
          i++;
        } else {
          break;
        }
      }
      html += '</ol>\n';
      continue;
    }

    // Paragraphs: Any other text
    html += `<p>${line}</p>\n`;
    i++;
  }

  return html;
}