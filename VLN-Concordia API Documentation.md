# VLN-Concordia API Documentation

## Introduction

This document provides API documentation for the VLN-Concordia project, hosted at `https://vln-concordia.vercel.app/`. The API provides programmatic access to Markdown-based information files about various disabilities.

## Base URL

The base URL for all API endpoints is:

```
https://vln-concordia.vercel.app/data/
```

## Authentication

No authentication is required to access this API.

## Discovering Available Entries (`/data/get.list`)

To find out which disabilities and language translations are currently available through the API, make a GET request to the `/data/get.list` endpoint.

**Request:**

```bash
curl https://vln-concordia.vercel.app/data/get.list
```

**Response:**

The response is a plain text file listing the available entries.

```text
access=data/disability_name/lang.md

autism_spectrum_disorder=ar,en
bipolar_disorder=ar,en
moebius_syndrome=ar,en
nearsightedness_myopia=ar,en
tourette_syndrome=ar,en
down_syndrome=ar,en
keip_gras_syndrome=ar,en
megalocornea_intellectual_disability_syndrome=ar,en
photophobia=ar,en
social_anxiety_disorder=ar,en
alice_in_wonderland_syndrome=ar,en
```

**Response Format Explanation:**

*   **First Line (`access=data/disability_name/lang.md`):** This line describes the general URL pattern used to access specific disability entries. It indicates that you need to replace `disability_name` with the identifier found on subsequent lines and `lang.md` with the desired language code followed by `.md` (e.g., `en.md`).
*   **Subsequent Lines (`disability_name=lang_code1,lang_code2,...`):** Each following line lists a specific disability identifier (`disability_name`) and the available two-letter language codes (`lang_code`) for that disability, separated by commas.

Use the information from this endpoint to construct valid requests to retrieve specific disability entries.

## Retrieving Specific Disability Information

Once you have identified a valid `disability_name` and `lang_code` from the `/data/get.list` endpoint, you can retrieve the specific Markdown file using the following endpoint structure:

**Endpoint Structure:**

```
{Base URL}/{disability_name}/{lang_code}.md
```

**Path Parameters:**

*   **`disability_name`** (string, required):
    *   Description: The unique identifier for the disability, obtained from the `/data/get.list` endpoint.
    *   Example: `down_syndrome`
*   **`lang_code`** (string, required):
    *   Description: The two-letter ISO 639-1 language code for the desired translation, obtained from the `/data/get.list` endpoint for the specific `disability_name`.
    *   Example: `en`

**Example Request:**

```bash
curl https://vln-concordia.vercel.app/data/down_syndrome/en.md
```

## Response Format (Disability Entry)

Successful requests to a valid disability entry route will return the raw content of the requested Markdown (`.md`) file.

*   **Content-Type**: `text/markdown; charset=utf-8` (or similar plain text type)
*   **Body**: The full Markdown content of the corresponding disability information file.

## Data Schema (Markdown Structure)

The content returned is a Markdown file containing detailed information about the requested disability. The files generally follow a consistent format:

1.  **Main Title**: The name of the disability.
2.  **Table of Contents**: Often included near the beginning, using Markdown links (`[Section Name](#section-name)`).
3.  **Sections**: Information organized into logical sections using Markdown headings (H2, H3, etc.). Common sections include definitions, symptoms, causes, diagnosis, management, etc.
4.  **Formatting**: Standard Markdown formatting (bold, italics, lists, links).

**Example Response Body (truncated for `down_syndrome/en.md`):**

```markdown
# Down Syndrome

**Access Points (Table of Contents)**
*   [What is Down Syndrome?](#what-is-down-syndrome)
*   [Key Characteristics and Symptoms](#key-characteristics-and-symptoms)
...

---

## What is Down Syndrome?

Down syndrome, also known as Trisomy 21, is a genetic disorder...

...
```

## Error Handling

If you request a route that does not correspond to an existing `disability_name` and `lang_code` combination, the API will return a standard HTTP `404 Not Found` error.

## Rate Limiting & Usage Policy

This API does not implement specific rate limits. However, it is hosted on Vercel, which may have its own platform-level policies. Avoid excessive requests.

## Data Source

The data originates from the community-driven [VLN-Concordia GitHub repository](https://github.com/TheSingleAlgerianPotato/VLN-Concordia).

