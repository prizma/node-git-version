## node-git-version

This module creates version.js file in current directory containing object with following information:
	
	*tag* - Git tag attached to HEAD (if any)
	*hash* - SHA-1 hash of HEAD
	*timestamp* - current timestamp

This information is presented as Node.js module and can be used by Node.js app for getting version information
 
## Usage

```
npm install node-git-version
node ./node_modules/node-git-version/index.js 
cat version.js
```
