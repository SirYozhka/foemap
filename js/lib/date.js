//генератор строки с датой YYYYMMDD
export function dateYYYYMMDD() {
  let addZero = (value) => (value <= 9 ? "0" : "") + value;
  let date = new Date(Date.now());
  let y = date.getFullYear();
  let m = addZero(date.getMonth() + 1);
  let d = addZero(date.getDate());
  return "" + y + m + d;
}
