# node-git-version

[![npm](https://img.shields.io/npm/v/node-git-version.svg)](https://www.npmjs.com/package/node-git-version)

This module creates git-version.js file in the current directory containing an object with following informations:

 - **commit** - SHA-1 hash of HEAD
 - **shortCommit** - First 7 characters of the commit hash
 - **tags** - Git tags attached to HEAD
 - **branch** - Current branch tracked by HEAD
 - **remoteBranch** - Branch on remote repository
 - **author** - Raw string of the commit author
 - **authorName** - Author name extracted from commit author
 - **authorMail** - Author mail extracted from commit author
 - **merge** - True if this commit merges commits
 - **mergeCommits** - Array of short commit hashes merged
 - **date** - An object with :
   - **timestamp** - The unix timestamp of the commit (in seconds)
   - **gmt** - The GMT formated date string
   - **iso** - The ISO 8601 formated date string
 - **summary** - The first line of the commit message
 - **message** - The entire commit message

This information is presented as Node.js module and can be used by Node.js app for getting version information

## Usage

```
$ npm install node-git-version
```

Sample test file :
```js
var gitVersion = require('node-git-version');

gitVersion(function (err, data) {
  if (err) return console.error(err);
  console.log(JSON.stringify(data, null, 2));
}, null);
```

Output :
```js
{
  "commit": "de8f6b90ab190e6f2e95d1663cfa61186d269d67",
  "shortCommit": "de8f6b9",
  "tags": [],
  "branch": " master",
  "author": "BilliAlpha <billi.pamege.300@gmail.com>",
  "authorName": "BilliAlpha",
  "authorMail": "billi.pamege.300@gmail.com",
  "date": {
    "timestamp": 1527347037,
    "iso": "2018-05-26T15:03:57.000Z",
    "gmt": "Sat, 26 May 2018 15:03:57 GMT"
  },
  "summary": "Fix various errors",
  "message": "Fix various errors\n\nNow it works !\n"
}
```
