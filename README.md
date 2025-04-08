# Truck_Insurance_quote

This repository contains a Vercel serverless function that connects to a Google Sheet (MassEmailDB) 
and retrieves data for a given unique identifier (the DOT field). This is used to prefill forms 
for a truck insurance email campaign.

## Setup

1. **Google Sheets API:**
   - Enable the Google Sheets API in the Google Cloud Console.
   - Create a service account and generate a JSON key.
   - Share your Google Sheet ("MassEmailDB") with the service account email (e.g., `truckinsurancequote@sylvan-mesh-443101-b0.iam.gserviceaccount.com`).

2. **Environment Variable:**
   - In your Vercel project settings, add an environment variable named `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` 
     and paste in the contents of your JSON key.

3. **Deploy:**
   - Push this repository to GitHub.
   - Import the repository into Vercel and deploy.

## Usage

Make a GET request to the endpoint:
