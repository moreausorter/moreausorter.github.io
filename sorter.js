const inputForm = document.getElementById("MoreauInputForm");
const csvFile = document.getElementById("MoreauCsv");

class Student {
  constructor(id, classes, neighborhood, assigned) {
    this.id = id;
    this.classes = classes;
    this.neighborhood = neighborhood;
    this.assigned = assigned;
  }
}

// GLOBAL VARIABLES
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
let first = true;
function timeToMinutes(timeString, day) {
  let minutes = 0;
  if (first) {
    console.log(day);
  }
  if (day == "T") minutes += (1 * 24 * 60);
  if (day == "W") minutes += (2 * 24 * 60);
  if (day == "R") minutes += (3 * 24 * 60);
  if (day == "F") minutes += (4 * 24 * 60);

  if (timeString.split(" ")[1] == "PM") minutes += (12 * 60);

  if (first) {
    console.log(minutes);
  }

  let hourAndSecs = timeString.split(" ")[0].split(":");
  if (first) {
    console.log("----------");
    console.log(hourAndSecs[0]);
    console.log(hourAndSecs[1]);
  }
  minutes += (hourAndSecs[0] * 60);
  minutes += parseInt(hourAndSecs[1]);
  if (first) {
    console.log(minutes);
  }
  first = false;
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

inputForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = csvFile.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const data = csvToArray(text, ",");
    // Read raw JSON into student classes
    getStudentsAndMoreauClassesFromData(data);
    //  let test = getTotalClassTime(students,1);
    // print to screen to check if array was created correctly
    document.write(JSON.stringify(STUDENTS[0]));
    //  document.write(test);
    // document.write(JSON.stringify(data, null, 4));
  };
  reader.readAsText(input);
});
