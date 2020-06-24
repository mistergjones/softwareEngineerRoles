var fetch = require("node-fetch");
const redis = require("redis");
const client = redis.createClient();

const { promisify } = require("util");
// the below converts the client.get function into a promise. This is beacuse redis is ASYNC in nature
// const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const baseURL = "https://jobs.github.com/positions.json";

// iterate through all query strings
async function fetchGithub() {
    // just initialise it to one - it will break once the results = 0
    let resultCount = 1,
        onPage = 0; // used for each apge that will have 50 results each

    // hold all results of jobs in an array
    const allJobs = [];

    // fetch all pages
    while (resultCount > 0) {
        // access the URL
        const res = await fetch(`${baseURL}?page=${onPage}`);
        // pulling out the json from the response
        const jobs = await res.json();
        // create a flat array with a spread operator.
        allJobs.push(...jobs);
        resultCount = jobs.length;
        console.log("got", resultCount, "jobs");
        onPage++;
    }
    console.log("Obtained: ", allJobs.length, "jobs total");

    // before updating redis to store data, filter out senior roles
    const jrJobs = allJobs.filter((job) => {
        const jobTitle = job.title.toLowerCase();

        // algo logic. Exclude roles with the following
        if (
            jobTitle.includes("senior") ||
            jobTitle.includes("manager") ||
            jobTitle.includes("sr.") ||
            jobTitle.includes("snr") ||
            jobTitle.includes("architect")
        ) {
            return false;
        }
        return true;
    });

    console.log("filtered down to:", jrJobs.length, "total junior jobs");

    // set in redis
    // now set a key to "github" and the value to "jrJobs". i.e allJobs will be a entire string
    const success = await setAsync("github", JSON.stringify(jrJobs));

    console.log(success);
}

// fetchGithub();

module.exports = fetchGithub;
