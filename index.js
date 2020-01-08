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
    octokit.activity.listReposStarredByUser({
      username: name,
      per_page: 100 // Maximum allowed by API
    }).then(starredResult => {
      var starCount = `${starredResult.data.length}`
      // If we have 100 stars, there might be more.
      if (starredResult.data.length === 100) {
        starCount = starCount + "+"
      }
      console.log(result.data)
      console.log("Starred Repos: " + starCount)   
    }).catch(() => {
      console.log("Failed to load starred repo info");
    })
  }).catch(() => {
    // Failed to get user (maybe doesn't exist?)
    console.log("Failed to load user info");
  })
	readline.close()
})