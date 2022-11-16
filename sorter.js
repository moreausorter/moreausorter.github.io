const inputForm = document.getElementById("MoreauInputForm");
const csvFile = document.getElementById("MoreauCsv");

class Student {
  constructor(id, classes, neighborhood, assigned) {
    this.id = id;
    this.classes = classes;
    this.neighborhood = neighborhood;
    this.assigned = assigned;
    this.moreau = null;
  }
}

// GLOBAL VARIABLES
// See method description for getStudentsAndMoreauClassesFromData
// to see how these are formatted
let STUDENTS = [];
let MOREAU_CLASSES = [];

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
        MOREAU_CLASSES.push([timeToMinutes(beginTime, classDays.charAt(0)), timeToMinutes(endTime, classDays.charAt(0))]);
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

function createTable(){
  const body = document.body;
  const tbl = document.createElement('table');
  
  const header = tbl.insertRow();
  const student = header.insertCell();
  student.appendChild(document.createTextNode("STUDENT"));
  student.style.border = '1px solid black'
  const neighborhood = header.insertCell();
  neighborhood.appendChild(document.createTextNode("NEIGHBORHOOD"));
  neighborhood.style.border = '1px solid black'

  const moreau = header.insertCell();
  moreau.appendChild(document.createTextNode("MOREAU"))
  moreau.style.border = '1px solid black'
  const classhead = header.insertCell();
  classhead.appendChild(document.createTextNode("CLASSES"));
  classhead.style.border = '1px solid black'

  for (let i = 0; i < STUDENTS.length; i++) {
    const row = tbl.insertRow();
    const studentCell = row.insertCell();
    studentCell.appendChild(document.createTextNode(STUDENTS[i].id));
    studentCell.style.border = '1px solid black'
    const neighborhoodCell = row.insertCell();
    neighborhoodCell.appendChild(document.createTextNode(STUDENTS[i].neighborhood));
    neighborhoodCell.style.border = '1px solid black'
    const moreauCell = row.insertCell();
    moreauCell.appendChild(document.createTextNode(STUDENTS[i].moreau));
    moreauCell.style.border = '1px solid black'
    const classes = row.insertCell();
    classes.appendChild(document.createTextNode(STUDENTS[i].classes));
    classes.style.border = '1px solid black'


    ;
  }
  body.appendChild(tbl)
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
    for (let i = 0; i < MOREAU_CLASSES.length; i++) {
      if (moreauSeatsFilled[i] >= maxMoreauCapacity) continue;
      let currMoreau = MOREAU_CLASSES[i];
      // Checking if the student is avaliable for the start and end time of the Moreau class
      if (isAvaliableForClass(student, currMoreau)) {
        moreauSeatsFilled[i]++;
        student.assigned = true;
        // Adding the current Moreau class to the student schedule
        student.classes.push([currMoreau[0], currMoreau[1]]);
        student.moreau = currMoreau;
        // updating our scheduled students before breaking out of for loop
        scheduledStudents.push(student);
        break;
      }
    }

    if (student.assigned == false) {
      notScheduledStudents.push(student);
    }
  })
  document.write("Number of not scheduled Students: ");
  document.write(notScheduledStudents.length);
  document.write("\nNumber of scheduled Students: ");
  document.write(scheduledStudents.length);
  document.write(JSON.stringify(scheduledStudents[0]));
  document.write(JSON.stringify(scheduledStudents[1]));
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
    scheduleStudents();
    console.log(STUDENTS);
    createTable();
    //  let test = getTotalClassTime(students,1);
    // print to screen to check if array was created correctly
    // document.write(JSON.stringify(STUDENTS[0]));
    //  document.write(test);
    // document.write(JSON.stringify(data, null, 4));
  };
  reader.readAsText(input);
});
