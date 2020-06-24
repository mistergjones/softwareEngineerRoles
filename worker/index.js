var CronJob = require("cron").CronJob;

const fetchGithub = require("./tasks/fetch-github");

// here we could add a cron job for indeed, seek etc all in parallel
// run the job every minute
new CronJob("* * * * *", fetchGithub, null, true, "America/Los_Angeles");
