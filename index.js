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

module.exports = function (opts) {
	var versionInfo = {};
	
	var child = exec('git log --decorate -1 --date=unix', function (error, stdout, stderr) {
		if (error) {
			// Shit
			console.log('[FAILED]: Failed to run Git command');
			process.exit(error.code);
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
		var firstLine = data[0].match(/commit ([a-z0-9]{40})(?: \((.+)\))?/g);
		
		// Get commit id
		if (firstLine && firstLine.length > 0) {
			versionInfo.commit = firstLine[0];
			versionInfo.shortCommit = versionInfo.commit.slice(0,7);
		}

		// Parse decorate infos
		versionInfo.tags = [];
		if (firstLine && firstLine.length > 1) {
			var decorate = firstLine[1].split(',');
			for (var d=0; d<decorate.length; d++) {
				var e = decorate[d].trim();
				if (e.startsWith('tag: ')) { // Get tags
					versionInfo.tags.push(e.substring(5));
				} else if (e.startsWith('HEAD')) {
					var arrow = e.indexOf('->');
					if (arrow!==-1) {
						versionInfo.branch = e.substring(arrow+1);
					}
				} else if (d===decorate.length-1) {
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
				versionInfo.authorMail = authorParts[1].substring(0,-1);
			} else if (line.startsWith('Date:')) {
				versionInfo.date = line.split(':')[1].trim();
			} else if (line.startsWith('    ')) {
				versionInfo.message = line;	
			}
		}

		// Compose version file info
		var fileContents = 'module.exports = '+JSON.stringify(versionInfo, null, 2)+';\n';
		// Create git-version.js file
		fs.writeFile('git-version.js', fileContents, function(err) {
			if(err) {
				console.log('[FAILED]: can\'t create git-version.js file. Permission issue?');
			} else {
				console.log('[OK]');
			}
		});
	});
}
