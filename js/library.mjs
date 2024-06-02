//загрузка json файла - возвращает Object
export async function loadJson(url) {
  let response = await fetch(url);
  if (response.ok) {
    // если HTTP-статус в диапазоне 200-299
    let json = await response.json(); //считаем что json всегда корректный
    return json;
  } else {
    // если HTTP-статус = 404
    throw new Error(response.status);
  }
}
