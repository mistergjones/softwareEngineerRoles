const express = require("express");
const app = express();
const port = 3001;

const redis = require("redis");
const client = redis.createClient();

const { promisify } = require("util");
// the below converts the client.get function into a promise. This is beacuse redis is ASYNC in nature
const getAsync = promisify(client.get).bind(client);

// add async before (req/res) to make it use the promisfy
app.get("/jobs", async (req, res) => {
    const jobs = await getAsync("github");

    // enable CORS to ensure we don't get blocked
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");

    // show the jobs as a Javascript OBJECT. Check in the console
    console.group(JSON.parse(jobs).length);

    return res.send(jobs);
});

app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
