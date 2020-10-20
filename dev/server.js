'use strict';
// This dev server mimics HTTP GETs to my static JSON files hosted on GitHub.

const path = require('path');
const express = require('express');
const app = express();

const host = '127.0.0.1';
const port = 3000;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/data/index.json',    (req, res) => res.sendFile(path.resolve(__dirname, 'data/index.json')));
app.get('/data/about.json',    (req, res) => res.sendFile(path.resolve(__dirname, 'data/about.json')));
app.get('/data/posts.json',    (req, res) => res.sendFile(path.resolve(__dirname, 'data/posts.json')));
app.get('/data/projects.json', (req, res) => res.sendFile(path.resolve(__dirname, 'data/projects.json')));

app.listen(port, () => console.log(`Server running at ${host}:${port}/`));
