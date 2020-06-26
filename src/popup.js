import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function hhmmToMinutes(hhmm) {
  if (hhmm === "") return 0;
  const [partialHours, partialMinutes] = hhmm.split(":");
  const minutes = Number(partialHours) * 60 + Number(partialMinutes);
  return minutes;
}

function minutesToHhmm(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainders = ("0" + (minutes % 60)).slice(-2);
  return `${hours}:${remainders}`;
}

function fetchContents() {
  const [contents, setContents] = useState({
    workTimesInMinutes: [],
    totalMinutes: 0,
    remainingWorkMinutes: 0,
    remainingWorkDays: 0,
  });

  useEffect(() => {
    function handleContentsResult(result) {
      const [
        workTimeStrings,
        requiredWorkTimeString,
        workDays,
        requiredWorkDays,
      ] = result[0];

      const workTimesInMinutes = workTimeStrings.map(hhmmToMinutes);
      const totalMinutes = workTimesInMinutes.pop();
      const remainingWorkMinutes =
        hhmmToMinutes(requiredWorkTimeString) - totalMinutes;
      const remainingWorkDays = requiredWorkDays - workDays;

      setContents({
        workTimesInMinutes,
        totalMinutes,
        remainingWorkMinutes,
        remainingWorkDays,
      });
    }

    chrome.tabs.executeScript(
      {
        file: "content.js",
      },
      handleContentsResult
    );
  });

  return contents;
}

function App() {
  const {
    workTimesInMinutes,
    totalMinutes,
    remainingWorkMinutes,
    remainingWorkDays,
  } = fetchContents();

  const estimatedWorkTimePerDay = (() => {
    if (remainingWorkMinutes < 0) {
      return 0;
    }
    if (remainingWorkDays <= 0) {
      return remainingWorkMinutes;
    }
    return Math.floor(remainingWorkMinutes / remainingWorkDays);
  })();

  return (
    <>
      <div id="workTimes">
        <span>
          労働時間:{" "}
          {workTimesInMinutes.map((min, i) => (
            <li key={i}>{min}</li>
          ))}
        </span>
      </div>
      <div id="totalWorkTime">
        <span>総労働時間: {minutesToHhmm(totalMinutes)}</span>
      </div>
      <div id="remainingWorkTime">
        <span>残月規定: {minutesToHhmm(remainingWorkMinutes)}</span>
      </div>
      <div id="estimatedWorkTimePerDay">
        <span>
          推定必要労働時間（一日）: {minutesToHhmm(estimatedWorkTimePerDay)}
        </span>
      </div>
    </>
  );
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);

//------------

/* TODO:
- 勤務時間からグラフ書く
*/
