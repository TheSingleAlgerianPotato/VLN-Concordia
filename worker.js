addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const getParam = url.searchParams.get('get');

  // --- Configuration ---
  const GITHUB_USERNAME = 'TheSingleAlgerianPotato'; // Your GitHub Username
  const GITHUB_REPO_NAME = 'VLN-Concordia';           // Your Repository Name
  const BASE_DATA_PATH = 'data/';                     // Path to your main data folder in the repo

  // Base URL for raw content from your GitHub repository
  const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/main/${BASE_DATA_PATH}`;
  // NOTE: 'main' is your default branch.

  // Base URL for GitHub API to list directory contents
  const GITHUB_API_BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/contents/${BASE_DATA_PATH}`;

  // Headers for JSON response
  const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allows requests from any origin (CORS)
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS preflight requests for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  // --- API Endpoint: List Entries (get=entries) ---
  if (getParam === 'entries') {
    return handleEntriesRequest(GITHUB_API_BASE_URL, JSON_HEADERS);
  }

  // --- API Endpoint: Get Specific Disability Entry (get=disability_name&lang=code) ---
  const langParam = url.searchParams.get('lang');
  if (getParam && langParam) {
    return handleDisabilityContentRequest(GITHUB_RAW_BASE_URL, getParam, langParam);
  }

  // --- Default Response for Invalid/Missing Parameters ---
  return new Response(JSON.stringify({
    error: 'Invalid API usage.',
    message: 'Please use ?get=entries to list all disabilities, or ?get=disability_name&lang=code to get specific content.'
  }, null, 2), { status: 400, headers: JSON_HEADERS });
}

/**
 * Handles the ?get=entries request to list all disabilities and their available languages.
 */
async function handleEntriesRequest(githubApiUrl, headers) {
  try {
    const response = await fetch(githubApiUrl, {
        headers: {
            'User-Agent': 'Cloudflare-Worker-VLN-Concordia' // Required by GitHub API, use a descriptive name
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({
            error: `Failed to fetch repository contents from GitHub API.`,
            details: `Status: ${response.status}, Message: ${errorText}`
        }, null, 2), { status: 500, headers });
    }

    const directoryContents = await response.json();
    const disabilities = [];

    for (const item of directoryContents) {
      if (item.type === 'dir' && !item.name.startsWith('.')) { // It's a directory (disability folder)
        const disabilityName = item.name;
        const languagesAvailable = [];

        // Fetch contents of the specific disability folder to find MD files
        const disabilityFolderApiUrl = `${githubApiUrl}${disabilityName}/`;
        const langResponse = await fetch(disabilityFolderApiUrl, {
            headers: { 'User-Agent': 'Cloudflare-Worker-VLN-Concordia' }
        });

        if (langResponse.ok) {
          const langContents = await langResponse.json();
          for (const file of langContents) {
            if (file.type === 'file' && file.name.endsWith('.md')) {
              const languageCode = file.name.replace(/\.md$/, '');
              if (languageCode) {
                languagesAvailable.push(languageCode);
              }
            }
          }
          languagesAvailable.sort();
        } else {
            // Log warning, but don't fail the entire entries request for one bad folder
            console.warn(`Could not fetch languages for ${disabilityName}: ${langResponse.status} ${await langResponse.text()}`);
        }

        disabilities.push({
          name: disabilityName,
          path: `${BASE_DATA_PATH}${disabilityName}`, // BASE_DATA_PATH needs to be available here
          languages_available: languagesAvailable
        });
      }
    }

    disabilities.sort((a, b) => a.name.localeCompare(b.name));

    const output = {
      disabilities: disabilities,
      total_count: disabilities.length,
      generated_at: new Date().toISOString(),
      source: 'Cloudflare Worker'
    };

    return new Response(JSON.stringify(output, null, 2), { status: 200, headers });

  } catch (error) {
    console.error('Error in handleEntriesRequest:', error);
    return new Response(JSON.stringify({ error: 'Internal server error while listing entries.', details: error.message }, null, 2), { status: 500, headers });
  }
}


/**
 * Handles the ?get=disability_name&lang=code request to retrieve specific Markdown content.
 */
async function handleDisabilityContentRequest(rawBaseUrl, disabilityName, languageCode) {
  const filePath = `${rawBaseUrl}${disabilityName}/${languageCode}.md`;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({
          error: 'Content not found.',
          message: `The requested disability content for '${disabilityName}' in language '${languageCode}' does not exist.`
        }, null, 2), { status: 404, headers: JSON_HEADERS });
      } else {
        const errorText = await response.text();
        return new Response(JSON.stringify({
          error: 'Failed to fetch content from GitHub.',
          details: `Status: ${response.status}, Message: ${errorText}`
        }, null, 2), { status: response.status, headers: JSON_HEADERS });
      }
    }

    // Return the raw Markdown content directly
    return new Response(await response.text(), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8', // Indicate it's Markdown
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Error in handleDisabilityContentRequest:', error);
    return new Response(JSON.stringify({ error: 'Internal server error while retrieving content.', details: error.message }, null, 2), { status: 500, headers: JSON_HEADERS });
  }
}
