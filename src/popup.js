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

function minutesToHours(minutes, decimalPlace) {
  decimalPlace = decimalPlace || 2;
  return +(minutes / 60).toFixed(decimalPlace);
}

function fetchContents() {
  const [contents, setContents] = useState({
    remainingMinutesEachDay: [],
    actualTotalMinutes: 0,
    remainingMinutes: 0,
    remainingWorkDays: 0,
  });

  useEffect(() => {
    function handleContentsResult(result) {
      const [
        workTimeEachDay,
        requiredWorkTime,
        actualWorkDays,
        requiredWorkDays,
      ] = result[0];

      const actualMinutesEachDay = workTimeEachDay.map(hhmmToMinutes);
      const actualTotalMinutes = actualMinutesEachDay.pop();
      const requiredTotalMinutes = hhmmToMinutes(requiredWorkTime);
      const remainingMinutes = requiredTotalMinutes - actualTotalMinutes;
      const remainingWorkDays = requiredWorkDays - actualWorkDays;

      const accumuratedMinutesEachDays = actualMinutesEachDay.reduce(
        (accumurator, current, i) => {
          accumurator[i] = (accumurator[i - 1] || 0) + current;
          return accumurator;
        },
        []
      );

      const remainingMinutesEachDay = accumuratedMinutesEachDays.map(
        (min) => requiredTotalMinutes - min
      );

      setContents({
        remainingMinutesEachDay,
        actualTotalMinutes,
        remainingMinutes,
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
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
  </LineChart>
);

function App() {
  const {
    remainingMinutesEachDay,
    actualTotalMinutes,
    remainingMinutes,
    remainingWorkDays,
  } = fetchContents();

  const requiredMinutesPerDay = (() => {
    if (remainingMinutes < 0) {
      return 0;
    }
    if (remainingWorkDays <= 0) {
      return remainingMinutes;
    }
    return Math.floor(remainingMinutes / remainingWorkDays);
  })();

  // const idealRemainingHours = [
  //   ...Array(remainingMinutesEachDay.length),
  // ].map((_, i) => (-8 / 1) * i + 160);

  const data = remainingMinutesEachDay.map((min, i) => ({
    date: String(i + 1),
    hours: minutesToHours(min, 2),
  }));

  return (
    <>
      <div id="workTimes">
        <WorkTimesChart data={data} />
      </div>
      <div id="totalWorkTime">
        <span>総労働時間: {minutesToHhmm(actualTotalMinutes)}</span>
      </div>
      <div id="remainingWorkTime">
        <span>月規定残: {minutesToHhmm(remainingMinutes)}</span>
      </div>
      <div id="requiredMinutesPerDay">
        <span>必要労働時間/日: {minutesToHhmm(requiredMinutesPerDay)}</span>
      </div>
    </>
  );
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
