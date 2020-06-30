import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
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

const WorkTimesChart = ({ data }) => (
  <LineChart width={700} height={400} data={data}>
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

function buildBurndownData(actualMinutesEachDay, requiredTotalMinutes) {
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

  const daysInMonth = actualMinutesEachDay.length;
  const idealRemainingHours = (day) =>
    (-requiredTotalMinutes / daysInMonth) * day + requiredTotalMinutes;

  const data = [requiredTotalMinutes, ...remainingMinutesEachDay].map(
    (min, i) => ({
      date: String(i),
      actual: minutesToHours(min),
      ideal: minutesToHours(idealRemainingHours(i)),
    })
  );

  return data;
}

function Burndown({ domHandler }) {
  const {
    actualMinutesEachDay,
    actualTotalMinutes,
    requiredTotalMinutes,
    remainingMinutes,
    remainingWorkDays,
  } = useWorkingTimeDomState(domHandler);

  const data = buildBurndownData(actualMinutesEachDay, requiredTotalMinutes);

  const requiredMinutesPerDay = (() => {
    if (remainingMinutes < 0) {
      return 0;
    }
    if (remainingWorkDays <= 0) {
      return remainingMinutes;
    }
    return Math.floor(remainingMinutes / remainingWorkDays);
  })();

  return (
    <>
      <div>
        <WorkTimesChart data={data} />
      </div>
      <div>
        <span>総労働時間: {minutesToHhmm(actualTotalMinutes)}</span>
      </div>
      <div>
        <span>月規定労働時間の残り: {minutesToHhmm(remainingMinutes)}</span>
      </div>
      <div>
        <span>必要労働時間/日: {minutesToHhmm(requiredMinutesPerDay)}</span>
      </div>
    </>
  );
}

export default Burndown;
