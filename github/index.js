// Update project data gist with github repo info

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {Octokit} = require('./node_modules/@octokit/rest');
const octokit = new Octokit({auth: `token ${process.env.GITHUB_TOKEN}`});

// https://gist.github.com/barrettotte/ee6348040d495ad2ab19bc40fbcff6be
const gist_id = 'ee6348040d495ad2ab19bc40fbcff6be';

// Languages to ignore. Can be changed via override tags
const lang_ignore = [
  'Batchfile', 'Shell', 'PowerShell',  // shell
  'Makefile', 'Dockerfile',            // build
  'HTML', 'CSS', 'SCSS',               // frontend 
  'Visual Basic', 'VBA',               // BASIC mismatches
];

async function main(){
  try{
    const repos = await getRepos();
    const overrides = await getProjectOverrides();
    const projects = buildProjects(repos, overrides);

    if(projects.length > 0){
      await updateProjectsGist(projects);
      console.log('Successfully updated gist!');
    } else{
      throw new Error("Projects list is empty!");
    }
  } catch(err){
    console.error(`Error updating projects.json\n${err.stack}`);
  }
}

// build merged list of repos and overrides
function buildProjects(repos, overrides){
  const projects = [];

  repos.forEach(repo => {
    const ov = overrides.find(x => x.id.toUpperCase() === repo.name.toUpperCase());

    if(ov === undefined){
      return;
    }
    projects.push({
      'id': repo.name,
      'name': repo.name,
      'description': repo.description,
      'url': repo.url,
      'tags': Array.from(new Set(
        repo.languages.nodes
          .filter(l => lang_ignore.indexOf(l.name) < 0)
          .map(l => adjustLang(l.name))
          .concat(ov.languages === undefined ? [] : ov.languages)
          .concat(ov.tags === undefined ? [] : ov.tags)
          .flat()
      )),
      'updated': repo.updatedAt.slice(0,10) // YYYY-MM-DD
    });
  });
  return projects;
}

// query GitHub v4 API for all public repos
async function getRepos(){
  const gqlFile = path.join(__dirname, 'repos.gql');
  const gql = fs.readFileSync(gqlFile, {encoding: 'utf8'});
    
  const resp = await octokit.graphql(gql);
  return resp.user.repositories.nodes.filter(r => r.name !== 'barrettotte');
}

// fetch project overrides from gist to combine with repo data
async function getProjectOverrides(){
  const resp = await octokit.gists.get({gist_id});
  return JSON.parse(resp['data']['files']['overrides.json']['content'])['projects'];
}

// update projects.json
async function updateProjectsGist(projects){
  const filename = 'projects.json';

  await octokit.gists.update({
    gist_id: gist_id,
    files: {
      [filename]: {
        filename: filename,
        content: JSON.stringify({projects: projects}, null, 2)
      }
    }
  })
}

// Adjust some language tags
function adjustLang(l){
  switch(l){
    case "Jupyter Notebook": return "Jupyter";
    case 'SQLPL':            return 'SQL';
    case 'PlPgSQL':          return 'SQL';
    case 'PLSQL':            return 'SQL';
    case 'TSQL':             return 'SQL';
  }
  return l;
}

(async () => await main())();
