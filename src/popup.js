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
    requiredTotalMinutes: 0,
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
        requiredTotalMinutes,
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
  Legend,
} from "recharts";

const WorkTimesChart = ({ data }) => (
  <LineChart width={500} height={400} data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
    <Line
      type="linear"
      dataKey="ideal"
      stroke="#82ca9d"
      dot={false}
      isAnimationActive={false}
    />
    <Line
      type="linear"
      dataKey="actual"
      stroke="#8884d8"
      isAnimationActive={false}
    />
  </LineChart>
);

function App() {
  const {
    remainingMinutesEachDay,
    actualTotalMinutes,
    requiredTotalMinutes,
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

  const daysInMonth = remainingMinutesEachDay.length;
  const idealRemainingHours = (day) =>
    (-requiredTotalMinutes / daysInMonth) * day + requiredTotalMinutes;

  const data = [requiredTotalMinutes, ...remainingMinutesEachDay].map(
    (min, i) => ({
      date: String(i),
      actual: minutesToHours(min),
      ideal: minutesToHours(idealRemainingHours(i)),
    })
  );

  return (
    <>
      <div id="workTimes">
        <WorkTimesChart data={data} />
      </div>
      <div id="totalWorkTime">
        <span>総労働時間: {minutesToHhmm(actualTotalMinutes)}</span>
      </div>
      <div id="remainingWorkTime">
        <span>月規定労働時間の残り: {minutesToHhmm(remainingMinutes)}</span>
      </div>
      <div id="requiredMinutesPerDay">
        <span>必要労働時間/日: {minutesToHhmm(requiredMinutesPerDay)}</span>
      </div>
    </>
  );
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
