// function to find "floating" classes
function findLeastBusyClassTimes(STUDENTS) {
    var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let classList = [];
    STUDENTS.forEach(student => {
        classList = classList.concat(student.classes);
    });

    let timeSlots = [];
    for (let i = 0; i < 7200; i += 30) {
        timeSlots.push([i, i + 60]);
    }

    let count = new Array(timeSlots.length).fill(0);

    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = 0; j < classList.length; j++) {
            let startTimeInDay = timeSlots[i][0] % 1440;
            if (startTimeInDay < 480 || startTimeInDay > 1020) {
                count[i] = 10000;
            }
            else if (timeSlots[i][0] >= classList[j][1] || timeSlots[i][1] <= classList[j][0]) {
                // no overlap
            } else {
                count[i]++;
            }
        }
    }

    let leastBusyTimes = [];
    let sortedCounts = count.slice().sort((a, b) => a - b);
    let minCounts = sortedCounts.slice(0, 10);

    for (let i = 0; i < count.length; i++) {
        if (minCounts.includes(count[i])) {
            let startTime = timeSlots[i][0];
            let endTime = timeSlots[i][1];
            let dayOfWeek = daysOfWeek[Math.floor(startTime / 1440)];
            let startHour = Math.floor((startTime % 1440) / 60);
            let startMinute = startTime % 60;
            let endHour = Math.floor((endTime % 1440) / 60);
            let endMinute = endTime % 60;
            let startTimeString, endTimeString;
            if (startHour >= 8 && startHour < 12) {
                startTimeString = startHour + ':' + (startMinute < 10 ? '0' + startMinute : startMinute) + 'am';
            } else if (startHour === 12) {
                startTimeString = '12:' + (startMinute < 10 ? '0' + startMinute : startMinute) + 'pm';
            } else {
                startTimeString = (startHour - 12) + ':' + (startMinute < 10 ? '0' + startMinute : startMinute) + 'pm';
            }
            if (endHour >= 8 && endHour < 12) {
                endTimeString = endHour + ':' + (endMinute < 10 ? '0' + endMinute : endMinute) + 'am';
            } else if (endHour === 12) {
                endTimeString = '12:' + (endMinute < 10 ? '0' + endMinute : endMinute) + 'pm';
            } else {
                endTimeString = (endHour - 12) + ':' + (endMinute < 10 ? '0' + endMinute : startMinute) + 'pm';
            }
            let classTimeString = `${dayOfWeek} ${startTimeString}-${endTimeString} (${count[i]} students)`;
            leastBusyTimes.push(classTimeString);
        }
    }

    leastBusyTimes.sort((a, b) => {
        const countA = a.match(/\((\d+)\s+students\)/)[1];
        const countB = b.match(/\((\d+)\s+students\)/)[1];
        return countA - countB;
    });

    return leastBusyTimes;
}

module.exports = { findLeastBusyClassTimes };