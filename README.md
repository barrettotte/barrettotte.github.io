# Portfolio

Hosted at https://barrettotte.github.io


A simple portfolio site using Angular and Material Design Bootstrap


## Local Development
* Launch local server - ```node dev-api/server.js``` (http://127.0.0.1:3000/)
* Launch angular app - ```npm start``` or ```ng serve --watch``` (http://127.0.0.1:4200)
* Edit site data in **data/**, this gets served to the angular app by the development node server.


## Data
I decided I didn't feel like having to setup a database and host anything.
So instead I just use plain old json files in the **data/** directory with HTTP GETs.

Its kind of cheesy, but it works fine for my purpose. 
I made sure to setup my data service so it could be easily changed to point somewhere else in the future.
Maybe one day I won't be lazy and actually setup a hosted database and API.


## Commands
- Update angular - ```ng update```
- Serve angular - ```ng serve --watch```
- Build - ng build --prod --base-href "https://barrettotte.github.io/"


## References
* MD Bootstrap https://mdbootstrap.com/docs/angular/
* Hack to fix 404 error with GitHub pages https://shermandigital.com/blog/fix-404-errors-from-angular-projects-hosted-on-github-pages/
* GitHub GraphQL API https://developer.github.com/v4/guides/intro-to-graphql/#discovering-the-graphql-api
  * https://developer.github.com/v4/object/repository/
