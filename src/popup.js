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
    remainingWorkMinutesEachDays: [],
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
      const requiredWorkMinutes = hhmmToMinutes(requiredWorkTimeString);
      const remainingWorkMinutes = requiredWorkMinutes - totalMinutes;
      const remainingWorkDays = requiredWorkDays - workDays;

      const accumuratedWorkMinutesEachDays = workTimesInMinutes.reduce(
        (accumurator, current, i) => {
          accumurator[i] = (accumurator[i - 1] || 0) + current;
          return accumurator;
        },
        []
      );
      const remainingWorkMinutesEachDays = accumuratedWorkMinutesEachDays.map(
        (min) => requiredWorkMinutes - min
      );

      setContents({
        remainingWorkMinutesEachDays,
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
  }, []);

  return contents;
}

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const WorkTimesChart = ({ data }) => (
  <LineChart width={400} height={400} data={data}>
    <Line type="linear" dataKey="hours" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
  </LineChart>
);

function App() {
  console.log("rendered");

  const {
    remainingWorkMinutesEachDays,
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

  const data = remainingWorkMinutesEachDays.map((min, i) => ({
    name: String(i),
    hours: Math.floor((min / 60) * 100) / 100,
  }));

  return (
    <>
      <div id="workTimes">
        <WorkTimesChart data={data} />
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
