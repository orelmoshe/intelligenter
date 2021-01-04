# Intelligenter

Technologies: Node.js/Typescript & MongoDB

my node version: 14.13.1

my npm version: 6.14.8

---

The application using this following components:

1. PM2 as process manager.
2. GCP Pubsub service for asynchronous messaging service ( for high scale to the following services: VT service ,Who is service).
3. MongoDB as a DB.
4. Cache in-memory data structure store for higher performance.
5. Tests - using Mocha and Chai.

methods:

POST: /scanDomain

GET:/getResultsByDomain

---

# Project explanation:

Intelligenter is an API NodeJS / Typescript component which enhances data about a given domain.
The component is reading the domain from the database on a given interval and updating results. The
results are also stored on a database for future use. The Data of each domain includes data from
VirusTotal and from Whois reops (See example).

The component is asynchronous and supports restAPI requests using NodeJS-Express. The restAPI will
include two methods, GET and POST.
GET will extract all the stored data on a domain and will return a JSON response,
if the domain does not exist, it will be sent to analysis and the user will get an “OnAnalysis” message.
POST will get the domain name and will send it to analysis.
In any case, all requests and results will be stored on the database.

The scheduler will verify that the record is valid and will automatically update the records occasionally.
The scheduler will verify that every valid record is being updated once a month.

---

# Example GET request:

GET localhost:3000/getResultsByDomain?domain=google.com

response: { domain: google.com, VTData: {numberOfDetection: 1, numberOfScanners: 70, detectedEngines: [“CLEAN MX”], lastUpdated: “09.09.19” },
WhoisData:{ dateCreated: “09.15.97”, ownerName: “MarkMonitor, Inc.”, expriedOn: ”09.13.28” }.

# Example POST request:

POST localhost:3000/scanDomain BODY: { domain=google.com }

response: { domain: google.com, status: ”onAnalysis” }

---

# Run:

1. npm install pm2@latest -g.
2. npm install.
3. npm run build.
4. npm start.

---

VirusTotal API key - https://support.virustotal.com/hc/en-us/articles/115002088769-Please-give-me-an-API-key.

Who is API key- https://whois.whoisxmlapi.com/overview.

GCP(google cloud platform) - register,create new your project and download your auth file.json from: https://cloud.google.com/docs/authentication/production.

---

# Design - Architecture :

![alt text](https://res.cloudinary.com/dyy8fcstp/image/upload/v1609707082/intelligenter/design-architecture_ayikb7.svg)
