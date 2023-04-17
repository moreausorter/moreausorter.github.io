const inputForm = document.getElementById("MoreauInputForm");
const csvFile = document.getElementById("MoreauCsv");
const startTimeForRecommender = document.getElementById("starttime");
const endTimeForRecommender = document.getElementById("endtime");
const mondayForRecommender = document.getElementById("mondayCheckbox");
const tuesdayForRecommender = document.getElementById("tuesdayCheckbox");
const wednesdayForRecommender = document.getElementById("wednesdayCheckbox");
const thursdayForRecommender = document.getElementById("thursdayCheckbox");
const fridayForRecommender = document.getElementById("fridayCheckbox");

class Student {
  constructor(id, classes, neighborhood, assigned) {
    this.id = id;
    this.classes = classes;
    this.neighborhood = neighborhood;
    this.assigned = assigned;
    this.moreau = null;
    this.inNeighborhood = false;
  }
}

class MoreauClass {
  constructor(neighborhood, crn, time) {
    this.neighborhood = neighborhood;
    this.crn = crn;
    this.time = [];
  }
}

// GLOBAL VARIABLES
// See method description for getStudentsAndMoreauClassesFromData
// to see how these are formatted
let STUDENTS = [];
let MOREAU_CLASSES = [];
let CRNS = new Set();

function csvToArray(stringVal, delimiter) {
  // use split to create an array from string by delimiter
  const [keys, ...rest] = stringVal
    .trim()
    .split("\n")
    .map((item) => item.split(delimiter));

  // Map the rows
  const newArray = rest.map((item) => {
    const object = {};
    keys.forEach((key, index) => (object[key] = item.at(index)));
    return object;
  });
  return newArray;
}

/***********************************
Converts list of classes into an array of students
Each student has an id, a list of non-moreau classes
and their neighborhood. Classes are stored as a pair
of [starting minute, ending minute] (Monday morning is minute 0)
i.e. the first Students is the following
id: 1
classes:
[['54025', '60015'],
['342025', '348015'],
['630025', '636015'],
['84000', '84050'],
['372000', '372050'],
['660000', '660050'],
['210000', '288015'],
['498000', '576015'],
['228000', '234015'],
['516000', '522015'],
['234030', '240045'],
['522030', '528045']]
neighborhood: 6

Also creates a list of avaliable Moreau classes in
the following form.
[starttime in minutes, endtime in minutes]
**************************************/
function getStudentsAndMoreauClassesFromData(data) {
  let idsToStudents = new Map();
  data.forEach(item => {
    let id = item["Student"];
    let crn = item["CRN"];
    let beginTime = item["Begin Time AM/PM"];
    let endTime = item["End Time AM/PM"];
    let className = item["Course Title Short"];
    let classDays = item["Monday to Sunday Ind"]

    // Creating student if not already created
    let currStudent;
    if (idsToStudents.has(id)) {
      currStudent = idsToStudents.get(id);
    } else {
      currStudent = new Student(id, [], "", false);
      idsToStudents.set(id, currStudent);
      STUDENTS.push(currStudent);
    }

    // Looking for "Moreau Neighborhood" class
    // Discarding "Moreau First Year Experience" class
    if (className.includes("Moreau")) {
      if (className.includes("Moreau Neighborhood")) {
        currStudent.neighborhood = parseInt(className.slice(-1));
      } else {
        if (!CRNS.has(crn)) {
          CRNS.add(crn);
          currClass = new MoreauClass(0, 0, []);
          currClass.neighborhood = currStudent.neighborhood;
          currClass.crn = crn;
          currClass.time = [timeToMinutes(beginTime, classDays.charAt(0)), timeToMinutes(endTime, classDays.charAt(0))];
          MOREAU_CLASSES.push(currClass);
        }
      }
    } else {
      // adding a separate class for each day
      // i.e. MWF class will be added 3 times to student's classes
      for (var i = 0; i < classDays.length; i++) {
        let day = classDays.charAt(i);
        currStudent.classes.push([timeToMinutes(beginTime, day), timeToMinutes(endTime, day)]);
      }
    }
  })
}

// Converts a time string (i.e 11:00 AM) and a day (i.e. M)
// to the corresponding minute of of the week (Monday morning is minute 0)
function timeToMinutes(timeString, day) {
  let minutes = 0;
  if (day == "T") minutes += (1 * 24 * 60);
  if (day == "W") minutes += (2 * 24 * 60);
  if (day == "R") minutes += (3 * 24 * 60);
  if (day == "F") minutes += (4 * 24 * 60);

  if (timeString.split(" ")[1] == "PM") {
    minutes += (12 * 60);

    // Substracting 12 hours if its a pm time starting with 12:xx to prevent double counting
    if (timeString.split(" ")[0].split(":")[0] == "12") minutes -= 12 * 60;
  }

  let hourAndSecs = timeString.split(" ")[0].split(":");
  minutes += (hourAndSecs[0] * 60);
  minutes += parseInt(hourAndSecs[1]);
  return minutes;
}

// Converts a time string from military time (i.e 08:00 or 17:00) 
// normal time string (i.e 11:00 AM) 
function convertFromMilitaryTime(militaryTime) {
  // Split the time string into hours and minutes
  var timeArray = militaryTime.split(":");
  var hours = parseInt(timeArray[0]);
  var minutes = parseInt(timeArray[1]);

  // Determine whether it's AM or PM
  var ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour clock format
  hours = hours % 12;
  hours = hours ? hours : 12; // If hours is 0, set it to 12
  var convertedTime = hours + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + ampm;

  return convertedTime;
}

// get student by id
function getStudentById(students, id) {
  return students[id - 1];
}

// returns total time spent in class by a particular student each week
function getTotalClassTime(students, id) {
  let totalMin = 0;
  getClassesById(students, id).map(function (curClass) {
    totalMin += (curClass[1] - curClass[0])
  });
  return totalMin;
}

// get neighborhood by student id
function getNeighborhoodById(students, id) {
  return getStudentById(students, id).neighborhood;
}

// get classes by student id
function getClassesById(students, id) {
  return getStudentById(students, id).classes;
}

// Course should be in the form [starttime, endtime]
function isAvaliableForClass(student, course) {
  for (let i = course[0]; i <= course[1]; i = i + 5) {
    if (!isAvailable(student, i)) return false;
  }
  return true;
}

// checks if a given time slot is available for a given student
function isAvailable(student, time) {
  for (let i = 0; i < student.classes.length; i++) {
    start = time[0] - 10;
    end = time[1] + 10;
    if (student.classes[i][0] <= start && start <= student.classes[i][1]) {
      return false;
    } else if (student.classes[i][0] <= end && end <= student.classes[i][1]) {
      return false;
    }
  }
  return true;

}
// create output table showing initial results of the sorting algorithm
// Directly outputs on page
function createTable() {
  const body = document.body;
  const tbl = document.createElement('table')

  const header = tbl.insertRow();
  const student = header.insertCell();
  student.appendChild(document.createTextNode("STUDENT"));
  student.style.border = '1px solid black'
  const neighborhood = header.insertCell();
  neighborhood.appendChild(document.createTextNode("NEIGHBORHOOD"));
  neighborhood.style.border = '1px solid black'

  const moreau = header.insertCell();
  moreau.appendChild(document.createTextNode("MOREAU CRN"))
  moreau.style.border = '1px solid black'

  const inNeighborhood = header.insertCell();
  inNeighborhood.appendChild(document.createTextNode("IN NEIGHBORHOOD?"))
  inNeighborhood.style.border = '1px solid black'

  // things to print for each student
  for (let i = 0; i < STUDENTS.length; i++) {
    const row = tbl.insertRow();
    const studentCell = row.insertCell();
    studentCell.appendChild(document.createTextNode(STUDENTS[i].id));
    studentCell.style.border = '1px solid black'
    const neighborhoodCell = row.insertCell();
    neighborhoodCell.appendChild(document.createTextNode(STUDENTS[i].neighborhood));
    neighborhoodCell.style.border = '1px solid black'
    const moreauCell = row.insertCell();
    moreauCell.appendChild(document.createTextNode(STUDENTS[i].moreau.crn));
    moreauCell.style.border = '1px solid black'
    const inNeighborhoodCell = row.insertCell();
    inNeighborhoodCell.appendChild(document.createTextNode(STUDENTS[i].inNeighborhood));
    inNeighborhoodCell.style.border = '1px solid black';
  }
  body.appendChild(tbl)

}
// function to create output csv of table for sorter algorithm
function createCSV() {
  var csv_data = []

  var rows = document.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {

    // Get each column data
    var cols = rows[i].querySelectorAll('td,th');

    // Stores each csv row data
    var csvrow = [];
    for (var j = 0; j < cols.length; j++) {

      // Get the text data of each cell of
      // a row and push it to csvrow
      csvrow.push(cols[j].innerHTML);
    }

    // Combine each column value with comma
    csv_data.push(csvrow.join(","));
  }
  // combine each row data with new line character
  csv_data = csv_data.join('\n');
  download_csv(csv_data);
}

function download_csv(csv_data) {
  // Create CSV file object and feed
  // our csv_data into it
  CSVFile = new Blob([csv_data], {
    type: "text/csv"
  });

  // Create to temporary link to initiate
  // download process
  var temp_link = document.createElement('a');

  // Download csv file
  temp_link.download = "MoreauAssignments.csv";
  var url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);


}


function scheduleStudents() {
  // Tracking students able and unable to be scheduled for a Moreau class
  let scheduledStudents = [];
  let notScheduledStudents = [];

  let maxMoreauCapacity = 18; // Based of PATH class search for Spring 2023
  let moreauSeatsFilled = new Array(MOREAU_CLASSES.length).fill(0); // Array where each index is the number of students scheduled for that Moreau class.

  STUDENTS.forEach(student => {
    student.assigned = false;

    // Checking each possible Moreau class to see if the student can be scheduled

    // check first within neighborhood
    for (let i = 0; i < MOREAU_CLASSES.length; i++) {
      let currMoreau = MOREAU_CLASSES[i];

      if (student.assigned == false && student.neighborhood == currMoreau.neighborhood) {
        if (moreauSeatsFilled[i] >= maxMoreauCapacity) continue;
        // Checking if the student is avaliable for the start and end time of the Moreau class
        if (isAvaliableForClass(student, currMoreau.time)) {
          moreauSeatsFilled[i]++;
          student.assigned = true;
          // Adding the current Moreau class to the student schedule
          student.classes.push([currMoreau.time[0], currMoreau.time[1]]);
          student.moreau = currMoreau;
          student.inNeighborhood = true;
          // updating our scheduled students before breaking out of for loop
          scheduledStudents.push(student);
          break;
        }
      }
    }

    if (student.assigned == false) {
      notScheduledStudents.push(student);
    }
  });

  // if not assigned in neighborhood, try to put in some class
  let finalNotScheduledStudents = [];
  STUDENTS.forEach(student => {
    // Checking each possible Moreau class to see if the student can be scheduled
    for (let i = 0; i < MOREAU_CLASSES.length; i++) {
      let currMoreau = MOREAU_CLASSES[i];
      if (student.assigned == false && student.neighborhood != currMoreau.neighborhood) {
        if (moreauSeatsFilled[i] >= maxMoreauCapacity) continue;
        // Checking if the student is avaliable for the start and end time of the Moreau class
        if (isAvaliableForClass(student, currMoreau.time)) {
          moreauSeatsFilled[i]++;
          student.assigned = true;
          // Adding the current Moreau class to the student schedule
          student.classes.push([currMoreau.time[0], currMoreau.time[1]]);
          student.moreau = currMoreau;
          // updating our scheduled students before breaking out of for loop
          scheduledStudents.push(student);
          break;
        }
      }
    }
    // check if a student makes it out unassigned
    if (student.assigned == false) {
      finalNotScheduledStudents.push(student);
    }
  });

  document.write("# of Students Scheduled Outside of Assigned Neighborhood: ");
  document.write(notScheduledStudents.length);
  document.write("\n");
}

// functiont o create button on page above output table
function createCSVButton() {
  const body = document.body;

  // adding download button
  const button = document.createElement('button');
  button.id = 'download-btn';
  button.innerText = 'Download .csv';
  button.addEventListener('click', () => {
    createCSV();
  })
  body.append(button);
}

function getDaysChecked() {
  let daysChecked = new Set();
  if (mondayForRecommender.checked) {
    daysChecked.add("Monday");
  }

  if (tuesdayForRecommender.checked) {
    daysChecked.add("Tuesday");
  }

  if (wednesdayForRecommender.checked) {
    daysChecked.add("Wednesday");
  }

  if (thursdayForRecommender.checked) {
    daysChecked.add("Thursday");
  }

  if (fridayForRecommender.checked) {
    daysChecked.add("Friday");
  }

  return daysChecked;
}

// table to print out recommendation table from "floating" algorithm
function createClassRecommendationTable() {
  const daysChecked = getDaysChecked();
  const starttime = convertFromMilitaryTime(startTimeForRecommender.value);
  const endtime = convertFromMilitaryTime(endTimeForRecommender.value);
  const leastBusyClassesArray = window.findLeastBusyClassTimes(STUDENTS, timeToMinutes(starttime), timeToMinutes(endtime), daysChecked);
  const leastBusyClasses = document.createElement('div');
  const topElement = document.createElement('p');
  topElement.textContent = " Recommended class times to add a Moreau Section";
  leastBusyClasses.appendChild(topElement);
  for (let i = 0; i < Math.min(10, leastBusyClassesArray.length); i++) {
    const classElement = document.createElement('p');
    classElement.textContent = leastBusyClassesArray[i];
    leastBusyClasses.appendChild(classElement);
  }

  const body = document.body;
  const firstChild = body.firstChild;
  body.insertBefore(leastBusyClasses, firstChild);
}

inputForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = csvFile.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const data = csvToArray(text, ",");
    // Read raw JSON into student classes
    getStudentsAndMoreauClassesFromData(data);
    STUDENTS.sort((a, b) => (a.classes.length > b.classes.length) ? -1 : 1);
    scheduleStudents();

    createClassRecommendationTable();
    createCSVButton();
    createTable();
  };
  reader.readAsText(input);
});
