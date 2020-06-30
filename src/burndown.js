import React from "react";
import useWorkingTimeDomState from "./useWorkingTimeDomState";

function minutesToHhmm(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainders = ("0" + (minutes % 60)).slice(-2);
  return `${hours}:${remainders}`;
}

function minutesToHours(minutes, decimalPlace) {
  decimalPlace = decimalPlace || 2;
  return +(minutes / 60).toFixed(decimalPlace);
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

function Burndown() {
  const {
    remainingMinutesEachDay,
    actualTotalMinutes,
    requiredTotalMinutes,
    remainingMinutes,
    remainingWorkDays,
  } = useWorkingTimeDomState();

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

export default Burndown;
