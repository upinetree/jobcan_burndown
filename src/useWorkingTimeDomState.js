import { useState, useEffect } from "react";

function hhmmToMinutes(hhmm) {
  if (hhmm === "") return 0;
  const [partialHours, partialMinutes] = hhmm.split(":");
  const minutes = Number(partialHours) * 60 + Number(partialMinutes);
  return minutes;
}

function useWorkingTimeDomState() {
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

export default useWorkingTimeDomState;
