## node-git-version

This module creates version.js file in current directory containing object with following information:
	
	*tag* - Git tag attached to HEAD (if any)
	*hash* - SHA-1 hash of HEAD
	*timestamp* - current timestamp

This information is presented as Node.js module and can be used by Node.js app for getting version information
 
## Usage

```
$ npm install -g node-git-version
$ // Go to your repo
$ node-git-version
$ cat version.js

export const version = {
	tag: '1.0.0',
	hash: 'e037765',
	timestamp: 1425721222
};
```
