const inputForm = document.getElementById("MoreauInputForm");
const csvFile = document.getElementById("MoreauCsv");

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

inputForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const data = csvToArray(text,",");
        // print to screen to check if array was created correctly
        document.write(JSON.stringify(data, null,4));
    };
    reader.readAsText(input);
});
