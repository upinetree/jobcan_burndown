function getWorkTimes() {
  const $rows = document.querySelectorAll("table.note>tbody tr");
  const $requiredWorkTime = document
    .evaluate("//tr[contains(., '月規定労働時間')]/td", document)
    .iterateNext();
  const $actualWorkDays = document
    .evaluate("//tr[contains(., '実働日数')]/td", document)
    .iterateNext();
  const $requiredWorkDays = document
    .evaluate("//tr[contains(., '所定労働日数')]/td", document)
    .iterateNext();

  if ($rows.length == 0 || $requiredWorkTime.length == 0) {
    return;
  }

  const workTimeEachDay = Array.from($rows, (row) => row.cells[5].innerText);
  workTimeEachDay.shift(); // header を除く
  const requiredWorkTime = $requiredWorkTime.innerText;
  const actualWorkDays = Number($actualWorkDays.innerText);
  const requiredWorkDays = Number(
    $requiredWorkDays.innerText.replace(/ 日/, "")
  );

  return [workTimeEachDay, requiredWorkTime, actualWorkDays, requiredWorkDays];
}

getWorkTimes();
