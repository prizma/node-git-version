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
 * Modified: BilliAlpha
 * Date: May 2018
 */

var fs = require('fs');
var exec = require('child_process').exec;

module.exports = function (callback) {
	var versionInfo = {};

	var child = exec('git log --decorate -1 --date=unix', function (error, stdout, stderr) {
		if (error) { // Shit
			console.log('[Git-Version]: Failed to run Git command');
			if (callback) callback(error);
			return;
		}

		// Example output:
		//
		// commit 6f78514ee4c055453ac8effba2680b5fd5304f04 (HEAD -> master, tag: v1.1.0, origin/master)
		// Merge: db7fb4a 0b5a3e4
		// Author: BilliAlpha <???>
		// Date:   Fri May 25 21:50:04 2018 +0200
		//
		//     Merge branch 'master'
		//

		var data = stdout.split('\n');

		// Run regular expression to extract firstLine parts
		var firstLine = data[0].match(/commit ([a-z0-9]{40})(?:\s\((.+)\))?/);
		if (!firstLine || firstLine.length<2) {
			if (callback) callback("Invalid log entry");
			return;
		}

		// Get commit id
		versionInfo.commit = firstLine[1].substr(0,40);
		versionInfo.shortCommit = versionInfo.commit.substr(0,7);

		// Parse decorate infos
		versionInfo.tags = [];
		if (firstLine.length > 2) {
			var decorate = firstLine[2].split(',');
			for (var d=0; d<decorate.length; d++) {
				var e = decorate[d].trim();
				// console.log("Decorate "+d+": "+e); // Debug
				if (e.startsWith('tag: ')) { // Get tags
					versionInfo.tags.push(e.substring(5));
				} else if (e.startsWith('HEAD ->')) {
					versionInfo.branch = e.substr(7);
				} else if (!versionInfo.remoteBranch && e.indexOf('/')!==-1) {
					versionInfo.remoteBranch = e;
				}
			}
		}

		for (var l=1; l<data.length; l++) {
			var line = data[l];
			if (line.startsWith('Merge:')) {
				versionInfo.merge = true;
				var mergeCommits = line.substring(-15).split(' ');
				versionInfo.mergeCommits = mergeCommits;
			} else if (line.startsWith('Author:')) {
				versionInfo.author = line.split(':')[1].trim();
				var authorParts = versionInfo.author.split('<');
				versionInfo.authorName = authorParts[0].trim()
				versionInfo.authorMail = authorParts[1].slice(0,-1);
			} else if (line.startsWith('Date:')) {
				versionInfo.date = {};
				var date = new Date(line.split(':')[1].trim()*1000)
				versionInfo.date.timestamp = date.getTime()/1000;
				versionInfo.date.iso = date.toISOString();
				versionInfo.date.gmt = date.toGMTString();
			} else if (!versionInfo.message && line.startsWith('    ')) {
				versionInfo.summary = line.substring(4);
				versionInfo.message = versionInfo.summary+'\n';
			} else if (versionInfo.message && line.startsWith('    ')) {
				versionInfo.message += line.substring(4)+'\n';
			}
		}

		// Call callback
		if (callback) callback(null, versionInfo);

		// Compose version file info
		var fileContents = 'module.exports = '+JSON.stringify(versionInfo, null, '\t')+';\n';
		// Create git-version.js file
		fs.writeFile('git-version.js', fileContents, function(err) {
			if(err) {
				console.warn('[Git-Version]: Can\'t create git-version.js file. Permission issue?');
			}
		});
	});
}
