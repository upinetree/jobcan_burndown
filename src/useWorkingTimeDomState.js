import { useState, useEffect } from "react";

function hhmmToMinutes(hhmm) {
  if (hhmm === "") return 0;
  const [partialHours, partialMinutes] = hhmm.split(":");
  const minutes = Number(partialHours) * 60 + Number(partialMinutes);
  return minutes;
}

function useWorkingTimeDomState(domHandler) {
  const [contents, setContents] = useState({
    actualMinutesEachDay: [],
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
      ] = result;

      const actualMinutesEachDay = workTimeEachDay.map(hhmmToMinutes);
      const actualTotalMinutes = actualMinutesEachDay.pop();
      const requiredTotalMinutes = hhmmToMinutes(requiredWorkTime);
      const remainingMinutes = requiredTotalMinutes - actualTotalMinutes;
      const remainingWorkDays = requiredWorkDays - actualWorkDays;

      setContents({
        actualMinutesEachDay,
        actualTotalMinutes,
        requiredTotalMinutes,
        remainingMinutes,
        remainingWorkDays,
      });
    }

    handleContentsResult(domHandler());
  }, []);

  return contents;
}

export default useWorkingTimeDomState;
