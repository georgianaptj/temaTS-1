import csv from "csv-parser";
import fs from "fs";
import { RowModel } from "./RowModel";

var results: Array<RowModel> = [];

var now = Date.now();

fs.createReadStream("ChangeBaseNumbers.csv")
  .pipe(csv())
  .on("data", (row) => {
    results.push(row);
  })
  .on("end", () => {
    console.log(
      "Time to readfile into array (seconds):",
      (Date.now() - now) / 1000
    );

    now = Date.now();
    var data = processData(results);
    console.log("Time to process data (seconds):", (Date.now() - now) / 1000);

    now = Date.now();
    fs.writeFile("out.csv", data.join("\n"), function (err) {
      if (err) return console.log(err);
      console.log(
        "Time to write to file (seconds):",
        (Date.now() - now) / 1000
      );
    });
  });

function processData(data: Array<RowModel>) {
  return data.map((item) =>
    convertBase(
      item.NumberToBeConverted,
      item.BaseFromWhichIsConverted,
      item.BaseToBeConverted
    )
  );
}

function convertBase(value: string, from_base: number, to_base: number) {
  var range = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/".split(
    ""
  );
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);

  var dec_value = value
    .split("")
    .reverse()
    .reduce(function (carry, digit, index) {
      if (from_range.indexOf(digit) === -1)
        throw new Error(
          "Invalid digit `" + digit + "` for base " + from_base + "."
        );
      return (carry += from_range.indexOf(digit) * Math.pow(from_base, index));
    }, 0);

  var new_value = "";
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || "0";
}
