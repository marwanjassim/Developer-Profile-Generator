// Create GitHub API client
const Octokit = require("@octokit/rest");
const octokit = new Octokit();

// Create terminal input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

// Request user name
readline.question("Enter GitHub username: ", (name) => {
  // Get user info from Github
  octokit.users.getByUsername({
    username: name
  }).then(result  => {
	  // Succeeded, print info to console
    console.log(result)
  }).catch(() => {
    // Failed to get user (maybe doesn't exist?)
    console.log("Failed to load user info");
  })
	readline.close()
})
