#!/usr/bin/env node

/**
 * This module creates version.js file in current directory
 * containing object with following information:
 * tag - Git tag attached to HEAD (if any)
 * hash - SHA-1 hash of HEAD
 * timestamp - current timestamp
 *
 * This information is presented as Node.js module and can be used
 * by Node.js app for getting version information
 *
 * Created: Maxim Stepanov
 * Date: March 2015
 */

var fs = require('fs');
var exec = require('child_process').exec;
var child = exec('git reflog --decorate -1', function (error, stdout, stderr) {
	if (error) {
		// Shit
		console.log('[FAILED]: Failed to run Git command');
		process.exit(1);
	}

	// Example output: a32d6d8 (HEAD, tag: TAG-V.02, tag: TAG-V.01, master) HEAD@{0}: commit (initial): Asd
	// Run regular expression to extract sha and tag
	var sha = stdout.match(/[a-z0-9]+\s\(HEAD/g);
	if (sha && sha.length > 0) {
		sha = sha[0].slice(0, -6);
	}

	var tag = stdout.match(/tag\:\s[a-zA-Z0-9\-\.]+\,/g);
	if (tag && tag.length > 0) {
		tag = tag[0].slice(5, -1);
	}

	// Compose version file info
	const versionInfo = {
		tag: tag ? tag : null,
		hash: sha,
		timestamp: Math.floor(new Date().getTime() / 1000)
	};

	// Create version.js file
	fs.writeFile('version.js', buildModuleString(versionInfo), function (err) {
		if (err) {
			console.log('[FAILED]: can\'t create version.js file. Permission issue?');
		}
		else {
			console.log('[OK]');
		}
	});
});

function buildModuleString(versionInfo) {
	const versionInfoString = JSON.stringify(versionInfo);
	const moduleString = 'export const version = ' + versionInfoString.substr(1, versionInfoString.length - 2) + ';';

	return moduleString;
}