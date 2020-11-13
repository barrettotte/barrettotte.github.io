# barrettotte.github.io/github

A utility node script to update my portfolio project data based on public GitHub repos.

## General Idea
- Get public repos from GitHub GraphQL API (v4)
- Fetch projects.json from gist
- Combine repos with projects.json
  - apply "overrides" to dynamically gathered data
  - add additional tags to existing repos
- Update projects.json gist
