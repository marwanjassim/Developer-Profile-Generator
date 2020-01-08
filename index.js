// Create GitHub API client
const Octokit = require("@octokit/rest");
const octokit = new Octokit();

// Create PDF converter
var fs = require('fs'),
    convertFactory = require('electron-html-to');

var conversion = convertFactory({
  converterPath: convertFactory.converters.PDF
});
    
// Create terminal input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

// Request user name
readline.question("Enter GitHub username: ", (name) => {
  readline.question("Enter your favorite color: ", (color) => {

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

        var profileHTML = generateHTML(result.data, starCount, color)
        conversion({
          html: profileHTML,
          pdf: {
            printBackground: true
          }
        }, function(err, result) {
          if (err) {
            return console.error(err);
          }
          result.stream.pipe(fs.createWriteStream(name + '.pdf'));
          conversion.kill(); // necessary if you use the electron-server strategy, see bellow for details
        });        

      }).catch(() => {
        console.error("Failed to load starred repo info");
      })
    }).catch(() => {
      // Failed to get user (maybe doesn't exist?)
      console.error("Failed to load user info");
    })
    readline.close()
  })
})

function generateHTML(userData, starCount, favoriteColor) {
  
  var name = userData.name
  // If no name, use the username
  if (name === null) {
    name = userData.login
  }
  
  var image = userData.avatar_url
  
  var location = userData.location
  if (location === null) {
    location = "San Francisco, CA"
  }
  var locationLink = "https://www.google.com/maps/place/" + encodeURIComponent(location)
  
  var github = userData.html_url
  var blog = userData.blog
  var bio = userData.bio
  var repoCount = userData.public_repos
  var followerCount = userData.followers
  var followingCount = userData.following

  return `
  <!doctype html>
  <html lang="en">
  
  <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css">
      <title>Hello, world!</title>
      <style type="text/css">
          html,
          body {
              background-color: ${favoriteColor};
          }
      </style>
  </head>
  
  <body>
      <div class="container text-center">
          <div class="row my-3">
              <div class="col-12">
                  <div class="card">
                      <div class="card-body">
                          <img src="${image}" class="rounded-circle" style="max-width:200px;">
                          <h1> Hi, I'm ${name} </h1>
                          <p>${bio}</p>
                          <div class="row justify-content-center">
                              <div class="col-3">
                                  <a href="${locationLink}">
                                      <i class="fas fa-location-arrow"></i> ${location}
                                  </a>
                              </div>
                              <div class="col-3">
                                  <a href="https://www.github.com/${userData.login}/">
                                      <i class="fab fa-github-alt"></i> ${userData.login}
                                  </a></div>
                              <div class="col-3">
                                  <a href="${blog}">
                                      <i class="fab fa-blogger"></i> Blog
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="row mb-3">
              <div class="col-6">
                  <div class="card">
                      <h5 class="card-header"><i class="fab fa-git-alt"></i> Public Repositories <i class="fab fa-git-alt"></i></h5>
                      <div class="card-body">
                          <h5 class="card-title">${repoCount}</h5>
                      </div>
                  </div>
              </div>
              <div class="col-6">
                  <div class="card">
                      <h5 class="card-header"><i class="fas fa-user-friends"></i> Followers <i class="fas fa-user-friends"></i></h5>
                      <div class="card-body">
                          <h5 class="card-title">${followerCount}</h5>
                      </div>
                  </div>
              </div>
          </div>
          <div class="row mb-3">
              <div class="col-6">
                  <div class="card">
                      <h5 class="card-header"><i class="fas fa-star"></i> Starred Repositories <i class="fas fa-star"></i></h5>
                      <div class="card-body">
                          <h5 class="card-title">${starCount}</h5>
                      </div>
                  </div>
              </div>
              <div class="col-6">
                  <div class="card">
                      <h5 class="card-header"><i class="fas fa-users"></i> Following <i class="fas fa-users"></i></h5>
                      <div class="card-body">
                          <h5 class="card-title">${followingCount}</h5>
                      </div>
                  </div>
              </div>
          </div>
  
      </div>
  
      <!-- Optional JavaScript -->
      <!-- jQuery first, then Popper.js, then Bootstrap JS -->
      <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
          integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n"
          crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
          integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
          crossorigin="anonymous"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
          integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
          crossorigin="anonymous"></script>
  </body>
  
  </html>`
}

