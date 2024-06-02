//генератор строки с датой YYYYMMDD
function dateYYYYMMDD() {
  let addZero = (value) => (value <= 9 ? "0" : "") + value;
  let date = new Date(Date.now());
  let y = date.getFullYear();
  let m = addZero(date.getMonth() + 1);
  let d = addZero(date.getDate());
  return "" + y + m + d;
}

// запись текста в буфер обмена
async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    LOG(error.message, RED);
  }
}
