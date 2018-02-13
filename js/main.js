/**
 * jQuery stuff
 */
$(function () {
	$('[data-toggle="tooltip"]').tooltip()
});

/**
 * Vue Stuff
 */
new Vue({
	el: '#app',
	data: {
		goalScore: "",
		weightedCompleted: "--",
		weightedOverall: "--",
		assignmentData: [
			{
				"name": "",
				"weight": "",
				"score": "",
				isLocked: false
			}
		],
		backups: [],
		selectedBackup: ""
	},
	methods: {
		/**
		 * Duplicate a row of assignment and append to next
		 * @param  {Integer} idx Current row index
		 * @return {Void}
		 */
		duplicateRow(idx) {
			this.assignmentData.push(_.cloneDeep(this.assignmentData[idx]));
		},

		/**
		 * Toggle the lock status of the current row
		 * @param  {Integer} idx Current row idx
		 * @return {Void}
		 */
		toggleLock(idx) {
			this.assignmentData[idx].isLocked = !this.assignmentData[idx].isLocked;
			this.updateWeightedScores();
		},

		/**
		 * Remove a row of assignment
		 * @param  {Integer} idx Current row idx
		 * @return {Void}
		 */
		removeRow(idx) {
			if (this.assignmentData.length != 1) {
				this.assignmentData.splice(idx, 1);
			}	
		},

		/**
		 * Update weighted score at the side panel
		 * @return {Void}
		 */
		updateWeightedScores() {
			setTimeout(function() {
				this.weightedCompleted = this._completedScorePercentage();
				this.weightedOverall = this._overallScorePercentage();
			}.bind(this), 500);
		},

		/**
		 * Save assignment data to local storage
		 * @return {Void}
		 */
		saveAssignments() {
			var courseName = prompt("Enter course name to save: ");
			localStorage.setItem("COURSE_DATA_" + courseName, JSON.stringify(this.assignmentData));
			if (courseName) {
				alert("Saved!");
			} else {
				alert("Please. Enter the course name");
			}
		},

		/**
		 * Restore assignments to UI
		 * @return {Void}
		 */
		restoreAssignments(backup) {
			if (this.selectedBackup) {
				this.assignmentData = JSON.parse(localStorage.getItem(backup.key));
			} else {
				alert("Please. Select a backup!");
			}
		},

		/**
		 * Score percentage of locked/completed assignments using entered weight
		 * @return {Float}
		 */
		_completedScorePercentage() {
			var numAssignments = this.assignmentData.length;
			var totalWeight = 0.0, totalScore = 0.0;
			for (var i = 0; i < numAssignments; ++i) {
				// only considering locked assignments
				if (this.assignmentData[i].isLocked) {
					// try to parse the values
					var weight = this.assignmentData[i].weight;
					var score = this.assignmentData[i].score;
					if (!this._isNumber(weight) || !this._isNumber(score)) {
						// skip this record if input is not a valid number
						continue;
					}
					totalWeight += parseFloat(weight);
					totalScore += parseFloat(weight) * parseFloat(score);
				}
			}
			// check if in fact any row has been locked
			if (totalWeight == 0) {
				return "--";
			}
			return totalScore / totalWeight;
		},

		/**
		 * Score percentage of assignments over all assignments using entered weight
		 * @return {Float}
		 */
		_overallScorePercentage() {
			var numAssignments = this.assignmentData.length;
			var totalWeight = 0.0, totalScore = 0.0;
			for (var i = 0; i < numAssignments; ++i) {
				// try to parse the values
				var weight = this.assignmentData[i].weight;
				var score = this.assignmentData[i].score;
				if (!this._isNumber(weight) || !this._isNumber(score)) {
					// skip this record if input is not a valid number
					continue;
				}
				totalWeight += parseFloat(weight);
				totalScore += parseFloat(weight) * parseFloat(score);
			}
			// check if in fact one row has got valid value
			if (totalWeight == 0) {
				return "--";
			}
			return totalScore / totalWeight;
		},

		/**
		 * Check whether a string is number
		 * @param  {String}  str 
		 * @return {Boolean}
		 */
		_isNumber(str) {
			return str!="" && !isNaN(str);
		}

	},
	mounted: function() {
		// load existing backups if any
		var i = 0;
		while (localStorage.key(i)) {
			var keyName = localStorage.key(i);
			var idx = keyName.indexOf("COURSE_DATA_")
			if (idx != -1) {
				this.backups.push({
					courseName: keyName.slice(idx + "COURSE_DATA_".length),
					key: keyName
				});
			}
			++i;
		}
	}
});