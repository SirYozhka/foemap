"use strict"; //строгий режим

const IMG_WITH = 800; // (px)
const IMG_HEGHT = 600; // (px)

const container = document.querySelector(".container"); //контейнер сцены

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = IMG_HEGHT; //вертикальное разрешение
canvas.width = IMG_WITH; //зависит от параметров экрана

const bufer_canvas = new OffscreenCanvas(IMG_WITH, IMG_HEGHT); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = IMG_HEGHT; //вертикальное разрешение
bufer_canvas.width = IMG_WITH; //зависит от параметров экрана

var selected_guild;
var img_background; //фоновое изображение водопада
var img_borders; //границы
var data_address; //data  номеров секторов из adresses.bmp
var data_scene; //data  холст для раскраски
var alpha = 250; //общий альфаканал для заливки

var colors = [ 
  { r: 0, g: 0, b: 0, a: 0 , name:"transparent"}, //нулевой - прозрачный
  { r: 250, g: 0, b: 250, a: alpha, name:"pink" }, //розовый
  { r: 100, g: 0, b: 180, a: alpha, name:"violet" }, //фиолетовый
  { r: 0, g: 0, b: 250, a: alpha, name:"blue" }, //синий
  { r: 250, g: 100, b: 0, a: alpha, name:"orange" }, //оранжевый
  { r: 0, g: 250, b: 250, a: alpha, name:"turquoise" }, //бирюзовый
  { r: 250, g: 250, b: 0, a: alpha, name:"yellow" }, //желтый
  { r: 50, g: 250, b: 50, a: alpha, name:"green" }, //зелёный
  { r: 250, g: 0, b: 0, a: alpha, name:"red" }, //красный
];

const defaultGuilds = [
  {name: "gild_1", sec:1, color:1},
];

const defaultSectors = [null, // нумерация секторов с единицы!
  { name: "A5A", os: 1, color: 0 },
  { name: "A5D", os: 1, color: 0 },
  { name: "B5C", os: 1, color: 0 },
  { name: "C5B", os: 1, color: 0 },
  { name: "D5A", os: 1, color: 0 },
  { name: "D5D", os: 1, color: 0 },
  { name: "E5C", os: 1, color: 0 },
  { name: "F5B", os: 1, color: 0 },
  { name: "X1X", os: 3, color: 0 },
  { name: "A4A", os: 1, color: 0 }, // 10
  { name: "A3A", os: 2, color: 0 },
  { name: "A2A", os: 2, color: 0 },
  { name: "A5B", os: 1, color: 0 },
  { name: "A4B", os: 1, color: 0 },
  { name: "A3B", os: 1, color: 0 },
  { name: "A5C", os: 1, color: 0 },
  { name: "A4C", os: 2, color: 0 },
  { name: "B2A", os: 3, color: 0 },
  { name: "B3A", os: 1, color: 0 }, //19
  { name: "B4A", os: 1, color: 0 },
  { name: "B5A", os: 1, color: 0 },
  { name: "B3B", os: 2, color: 0 },
  { name: "B4B", os: 2, color: 0 },
  { name: "B5B", os: 1, color: 0 },
  { name: "B4C", os: 1, color: 0 },
  { name: "B5D", os: 1, color: 0 },
  { name: "C2A", os: 2, color: 0 },
  { name: "C3A", os: 1, color: 0 },
  { name: "C4A", os: 2, color: 0 },
  { name: "C5A", os: 1, color: 0 },
  { name: "C3B", os: 1, color: 0 },
  { name: "C4B", os: 2, color: 0 },
  { name: "C5C", os: 1, color: 0 },
  { name: "C4C", os: 2, color: 0 },
  { name: "C5D", os: 1, color: 0 },
  { name: "D2A", os: 3, color: 0 },
  { name: "D3A", os: 2, color: 0 },
  { name: "D4A", os: 1, color: 0 },
  { name: "D3B", os: 1, color: 0 },
  { name: "D4B", os: 1, color: 0 },
  { name: "D5B", os: 1, color: 0 },
  { name: "D4C", os: 1, color: 0 },
  { name: "D5C", os: 1, color: 0 },
  { name: "E2A", os: 2, color: 0 },
  { name: "E3A", os: 1, color: 0 },
  { name: "E4A", os: 2, color: 0 },
  { name: "E5A", os: 1, color: 0 },
  { name: "E3B", os: 2, color: 0 },
  { name: "E4B", os: 2, color: 0 },
  { name: "E5B", os: 1, color: 0 },
  { name: "E4C", os: 2, color: 0 },
  { name: "E5D", os: 1, color: 0 },
  { name: "F2A", os: 3, color: 0 },
  { name: "F3A", os: 2, color: 0 },
  { name: "F4A", os: 2, color: 0 },
  { name: "F5A", os: 1, color: 0 },
  { name: "F3B", os: 1, color: 0 },
  { name: "F4B", os: 2, color: 0 },
  { name: "F5C", os: 1, color: 0 },
  { name: "F4C", os: 2, color: 0 },
  { name: "F5D", os: 1, color: 0 },
];
var arrSector = []; //текущее хранилище данных карты


/*********************** запуск инициализация *************************/
window.addEventListener("load", () => {
  LOG("......... start .........");
  dbSectorsOpen()
    .then(loadingSceneImages)
    .then(drawScene);
});


/************* IndexedDB (хранение данных на клиенте) *************************/
const dbName = "foesectors";
const dbVersion = 2; //версия базы
var dbData; //экземпляр объекта базы

function dbSectorsOpen() {
  return new Promise(function (resolve, reject) {
    let dbRequest = window.indexedDB.open(dbName, dbVersion);
    
    dbRequest.onsuccess = function (event) {
      dbData = event.target.result; //то же что = dbRequest.result
      let dbTransaction = dbData.transaction("sectors", "readonly"); 
      let txnSectors = dbTransaction.objectStore("sectors"); //работаем с хранилищем "sectors"
      txnSectors.getAll().onsuccess = (e) => {
          arrSector = e.target.result;
          LOG("Database opened.");
          resolve();
      }
    };

    //создание базы при первом запуске ( изменении версии )
    dbRequest.onupgradeneeded = function (event) { 
      LOG("Database (ver. " + dbVersion + ") setup ...");
      let db = event.target.result;
      if (db.objectStoreNames.contains("sectors")) //если есть хранилище "sectors"
        db.deleteObjectStore("sectors"); //удалить хранилище "sectors"
      let userStore =db.createObjectStore("sectors", {keyPath: 'id', autoIncrement: false}); //и сразу создать
      
      userStore.add({id:0}); //добавляем в начало пустышку (для нумерации секторов с единицы)
      for (let sec = 1; sec < 62; sec++) { //заполняем базу из инициализирующего массива defaultSectors
        arrSector[sec] = Object.assign({}, defaultSectors[sec]);
        userStore.add(getSector(sec));
      }

    };

    dbRequest.onerror = function () {
      LOG("ERROR! Database failed to open. Please, contact developer.");
    };

  });

  /* //todo прикрутить загрузку начальных данных с серверного .json
  async function loadJSON(requestURL) {
    const request = new Request(requestURL);
    const response = await fetch(request);
    const jsonTXT = await response.text(); //получение "сырого" json-текста
    return JSON.parse(jsonTXT); //преобразование текста в объект JS
  } */

}

function getSector(sec){
  return {
    id: sec,
    name: arrSector[sec].name,
    os: arrSector[sec].os,
    color: arrSector[sec].color,
  };
}

function dbSaveSector(sec) { //запись в базу сектора sec
  var txn = dbData.transaction("sectors", "readwrite");
  let newItem = getSector(sec);
  let request = txn.objectStore("sectors").put(newItem);
  request.onsuccess = function () {
    //LOG("saved : " + arrSector[sec].name);
    imgClipBoard.style.display = "none"; //убрать картинку буфера обмена
  };
  request.onerror = function () {
    LOG("ERROR saving: " + request.error, "alert");
  };
}


/************************ загрузка изображений карты *************************/
function loadingSceneImages() {
  return new Promise((resolve, reject) => {
    LOG("Loading images ...");
    img_background = new Image();
    img_background.src = "images/bgr.jpg";
    img_borders = new Image();
    img_borders.src = "images/brd.png";
    img_background.onload = () => {
      let scn = new Image();
      scn.src = "images/scene.png";
      scn.onload = () => {
        LOG("Calculation scene ...");
        let adr = new Image();
        adr.src = "images/addresses.bmp";
        bufer_ctx.drawImage(scn, 0, 0, canvas.width, canvas.height);
        data_scene = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
        adr.onload = () => {
          LOG("Calculation addresses ...");
          bufer_ctx.drawImage(adr, 0, 0, canvas.width, canvas.height);
          data_address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
          calculationSectorsCenters();
          LOG("Ready to paint.");
          resolve();
        };
      };
    };
  });

  // поиск центров секторов - для позиционирования названий и заодно - закраска в цвет гильдии
  function calculationSectorsCenters() {
    let maxX = [],  minX = [],  maxY = [],  minY = [];
    for (let s = 1; s <= 61; s++) {
      maxX[s] = 0;
      minX[s] = IMG_WITH;
      maxY[s] = 0;
      minY[s] = IMG_HEGHT;
    }
    for (let i = 0; i < data_address.data.length; i += 4) {
      let s = data_address.data[i]; //red компонента содержит порядковый номер сектора
      if (s < 62) { //остальное поле сцены оставить прозрачным
        let y = ~~(i / 4 / IMG_WITH);
        let x = i / 4 - y * IMG_WITH;
        if (x > maxX[s]) maxX[s] = x;
        if (y > maxY[s]) maxY[s] = y;
        if (x < minX[s]) minX[s] = x;
        if (y < minY[s]) minY[s] = y;
      }
    }
    for (let s = 1; s <= 61; s++) { 
      arrSector[s].x = ~~(Math.abs(maxX[s] + minX[s]) / 2);
      arrSector[s].y = ~~(Math.abs(maxY[s] + minY[s]) / 2);
      if (arrSector[s].color)
        fillBackground(s, colors[arrSector[s].color]); //заливка сектора цветом занятой гильдии
    }
  }
}


/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 18px arial";
ctx.fontStretch = "ultra-condensed";
ctx.shadowOffsetX = 0.3;
ctx.shadowOffsetY = 0.3;

function drawScene() {
  //фон - вулкан
  ctx.fillStyle = "rgba(0,0,0,0)";
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img_background, 0, 0, canvas.width, canvas.height);
  //карта секторов
  bufer_ctx.putImageData(data_scene, 0, 0);
  ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);
  //границы секторов
  ctx.shadowBlur = 2;
  ctx.shadowColor = "lightgoldenrodyellow";  //ctx.shadowColor = "transparent";
  ctx.drawImage(img_borders, 0, 0, canvas.width, canvas.height);
  
  //подписи секторов
  ctx.fillStyle = "black";
  ctx.shadowBlur = 4;
  ctx.shadowColor = "lightgoldenrodyellow";
  for (let s = 1; s <= 61; s++) { 
    if (selected_guild == s) { //выбранная гильдия
      ctx.fillStyle = "lightgoldenrodyellow";
      ctx.shadowColor = "black";
    } else { //просто штаб
      ctx.fillStyle = "black";
      ctx.shadowColor = "lightgoldenrodyellow";
    }
    for (let i = 0; i < 3; i++) //для "усиления" тени
      ctx.fillText(arrSector[s].name, arrSector[s].x, arrSector[s].y);
    let osadki = (arrSector[s].os==0) ? "штаб" : "o".repeat(arrSector[s].os); //🞔
    for (let i = 0; i < 2; i++) //для "усиления" тени
      ctx.fillText(osadki, arrSector[s].x, arrSector[s].y + 16);
  }
}

/***************** клик по сектору - выбор гильдии / заливка *********************************/
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  if (e.button != 0) return; //клик левой кнопкой
  if (editor) styleCanvasEdit(false); //закрыть редактор если открыт
  let adr = data_address.data[offset]; //red component = number of address
  if (adr > 61) {  //клик не по сектору
    LAB("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору). Редактор (правая кнопка)" );
    return;
  }
  let color;
  if (arrSector[adr].os == 0) { //клик по штабу - выбор цвета
    selected_guild = adr;
    helper(e);
  } else {
    if (selected_guild == arrSector[adr].color) { //клик по той же гильдии - отмена выделения
      arrSector[adr].color = 0; //помечаем что сектор не занят гильдией
      color = { r: 0, g: 0, b: 0, a: 0 };
    } else {
      arrSector[adr].color = selected_guild; //помечаем что сектор занят этой гильдией
      color = colors[selected_guild]; //покрасить в выбранный цвет штаба
    }
    fillBackground(adr, color); //покрасить в выбранный цвет штаба
    dbSaveSector(adr);
  }
  drawScene();
});

function fillBackground(sec, color) { //заливка сектора sec цветом color
  for (var i = 0; i < data_address.data.length; i += 4) {
    if (data_address.data[i] == sec) {
      data_scene.data[i + 0] = color.r; //red
      data_scene.data[i + 1] = color.g; //green
      data_scene.data[i + 2] = color.b; //blue
      data_scene.data[i + 3] = color.a; //alfa
    }
  }
}


/****************** РЕДАКТОР подписи сектора ****************************/
var editor = document.querySelector(".sector_editor");
var inp_name = document.querySelector(".input_name");
var inp_shtab = document.querySelector(".input_shtab");
var div_inp_osadki = document.querySelector(".input_osad");
var inp_osadki = document.querySelectorAll(".input_osad input[type='radio']");
var div_inp_color = document.querySelector(".input_color");
var inp_color = document.querySelector("#input_color");
var sel_addr;

canvas.addEventListener("contextmenu", (e) => {  //клик правой кнопкой - редактор надписи
  e.preventDefault();
  //if (editor) editModeIndice(false); //если уже был открыт любой редактор - то закрыть
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  let adr = data_address.data[offset]; // number of address (red component)
  if (adr < 1 || adr > 61) return; //клик не на секторе
  
  sel_addr = adr;
  LAB("Редактирование данных сектора ...");
  styleCanvasEdit(true);
  
  inp_name.value = arrSector[adr].name; //название сектора/гильдии
  let osd=arrSector[adr].os;  //сколько осад в секторе
  if (osd>0){ //сектор
    styleEditClrOs("osd");
    inp_osadki[osd-1].checked = true;
    inp_shtab.checked = false;
  } else { //гильдия
    styleEditClrOs("clr");
    inp_shtab.checked = true;
    for (const item of inp_osadki) item.checked = false;
  }
  let dx = arrSector[adr].x - editor.clientWidth / 2;
  if (dx < 0) dx = 2;
  if (dx + editor.clientWidth > IMG_WITH)
  dx = IMG_WITH - editor.clientWidth - 7;
  editor.style.left = dx + "px";
  editor.style.top = arrSector[adr].y - 20 + "px";
  
  inp_shtab.addEventListener("change", ()=>{
    if (inp_shtab.checked) { //поставили галочку на ШТАБ
      styleEditClrOs("clr");
      for (const item of inp_osadki) item.checked = false; //отчекнуть все radio
    } else { //сняли галочку с ШТАБА
      styleEditClrOs("osd");
      if (osd!=0)
        inp_osadki[osd-1].checked = true; //вернуть кол-во осад
    }
  })

  for (const item of inp_osadki) {
    item.addEventListener("change", ()=>{
      inp_shtab.checked=false;
    })
  }
  
  //todo form
  editor.addEventListener("keydown", (event) => {
    //event.preventDefault();
    if (event.code === "NumpadEnter" || event.code === "Enter") {
      arrSector[sel_addr].name = inp_name.value;

      let item_checked = 0; // останется 0 если штаб
      for (let i=0; i<3; i++) 
        if (inp_osadki[i].checked) 
          item_checked = i+1;
      arrSector[sel_addr].os = item_checked;

      let index = inp_color.selectedIndex;
      if (index){ //если в select был выбор
        arrSector[sel_addr].color = index; //выбранный индекс
        fillBackground(sel_addr,colors[index]);
        inp_color.selectedIndex=0;
      }

      styleCanvasEdit(false);
      drawScene();
      dbSaveSector(sel_addr);

    } else if (event.code === "Escape") {
      styleCanvasEdit(false);
    }

    LAB("...");
  });
  
  function styleEditClrOs(div){
    if (div=="osd"){
      div_inp_osadki.style.display="block";
      div_inp_color.style.display="none";
    } else { // =="clr"
      div_inp_osadki.style.display="none";
      div_inp_color.style.display="block";
    }
  }

  
});

function styleCanvasEdit(mode) { //затенение холста при входе в редактор
  if (mode) {
    canvas.classList.add("shadow-filter");
    editor.style.visibility = "visible";
  } else {
    canvas.classList.remove("shadow-filter");
    editor.style.visibility = "hidden";
  }
}



/*************** копироваине карты в буфер обмена ******************/
const btn_copy = document.querySelector(".btn-copy");
const imgClipBoard = document.querySelector(".monitor img");
btn_copy.addEventListener("click", () => {
  canvas.classList.add("anim-copy");
  canvas.toBlob((blob) => {
    imgClipBoard.style.display = "block";
    imgClipBoard.src = URL.createObjectURL(blob);

    let data = [new ClipboardItem({ "image/png": blob })]; //работает только по протоколу https или localhost !
    navigator.clipboard.write(data).then(
      () => {
        LAB("Карта скопирована в буфер обмена. Нажмите Ctr+V, чтобы вставить изображение карты (например в telegram). ");
        LOG("Imagemap copied into clipboard.");
      },
      (err) => {
        LOG("error map copy: " + err);
      }
    );
  });
  btn_copy.setAttribute("disabled", null);
  setTimeout(() => {
    canvas.classList.remove("anim-copy");
    btn_copy.removeAttribute("disabled");
  }, 500);
});


/*************** очистить опорники ******************/
const btn_clear = document.querySelector(".btn-clear");
btn_clear.addEventListener("click", () => {
  let result = confirm("Удалить все опорники? \n (штабы не удалаются)");
  if (!result) return;
  container.classList.add("anim-clear");
  for (let i = 1; i <= 61; i++) {
    if (arrSector[i].os!=0){ // не штаб
      arrSector[i].color = 0; //отметить в массиве что сектор не занят
      dbSaveSector(i); //отметить в IndexedDB
      fillBackground(i, { r: 0, g: 0, b: 0, a: 0 }); //убрать заливку на канвас-сцене
    }
  }
  drawScene();
  setTimeout(() => {
    container.classList.remove("anim-clear");
    LOG("Map cleared.")
  }, 300);

});


/************ запись данных карты в json файл на диск клиента **********/
const btn_save = document.querySelector(".btn-save");
//todo записать в базу на сервер (с уникальным id)
btn_save.addEventListener("click", async () => {
  LAB("Сохранение данных карты в файл на диске.");
  const content = JSON.stringify(arrSector,null,"\t");
  let filename = genDateString();
  let filehandler;

  const options = {
    //startIn: 'desktop',  //сохранять на рабочий стол
    suggestedName: filename,
    types: [{
      description: 'Text Files',
      accept: {'text/plain': '.json'},
    }],
  };

  try {
    filehandler = await window.showSaveFilePicker(options); //получение дескриптора файла
  } catch { //если окно просто зарыли
    LAB("");
    return;
  }

  try{
    const writable = await filehandler.createWritable();
    await writable.write(content);
    await writable.close();
    LOG("Datafile "+filename+" is saved.");
    LAB("Файл данных карты "+filename+".json можно переслать другому игроку дла редактирования.");
  }catch{
    LOG("Error saving datamap!", "alert");
    LAB("Ошибка записи файла данных карты.");
  }
  

  function genDateString(){
    let date = new Date(Date.now());
    let y = date.getFullYear();
    let m = addZero(date.getMonth()+1);
    let d = addZero(date.getDay());
    let h = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    return "PBG-"+y+m+d+"-"+h+min;
  }

  function addZero(x){
    return x <=9 ? "0" +x : x;
  }
});


/************ чтение данных карты из json файла **********/
const btn_load = document.querySelector(".btn-load");
//todo правильнее загрузить из базы на сервере (с уникальным id)
btn_load.addEventListener("click", async () => {
  if (!('showOpenFilePicker' in window)){
    LAB("Невозможно записать файл в вашем браузере."); 
    return;
    //todo альтернативный ввод выбора файла для загрузки
  }
  
  LAB("Выбор файла данных карты ...");
  let fileHandler;
  try{
    const options = {
      multiple: false,
      types: [{accept: {'text/plain': '.json' }}, ],
      excludeAcceptAllOption: true
    };
    fileHandler = await window.showOpenFilePicker(options); //открывает окно для выбора клиентом локального файла
  } catch { //если окно просто зарыли
    LAB("");
    return;
  }
  
  try{ //получение файла и загрузка данных карты
    let file = await fileHandler[0].getFile();
    let contents = await file.text();
     arrSector = JSON.parse(contents);
    LOG("Data map loaded.");
    LAB("");
  } catch {
    LAB("Ошибка загрузки файла данных карты!");
    LOG("Error reading json!", "alert");
  }

  for (let i = 1; i < 62; i++) {
    fillBackground(i, colors[arrSector[i].color]); //заливка
    dbSaveSector(i); //запись в IndexedDB
  }
  drawScene(); 
});


/************ вид курсора + подсказки ***********************/
canvas.addEventListener("mousemove", (e) => {
  helper(e);
});
function helper(e) {
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
  let adr = data_address.data[offset]; //получить red component = number of address
  if (adr > 61 || adr < 1){ //за пределами секторов
    container.style.cursor = "default";
  } else {
    if (arrSector[adr].os == 0) {    //штабы (осадки == 0)
      container.style.cursor = "pointer";
    } else { //обычные сектора 
      container.style.cursor = "cell";
    }
  }
  if (selected_guild) 
    LAB("Выбор опорников для гильдии " + arrSector[selected_guild].name + "...");
  else 
    LAB("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору). Редактор (правая кнопка)" );
}


/******************************************************/
//вывод в строку состояния
function LAB(message) {
  document.querySelector(".label-box").textContent = message;
}

//вывод логов на экран
const div_log = document.querySelector("#log-box");
function LOG(message, warning="") {
  const p_msg = document.createElement("p");
  p_msg.textContent = message;
  div_log.appendChild(p_msg);
  p_msg.scrollIntoView();
  if (warning=="alert"){
    p_msg.style.color = "#f00";  //красный
  } else {
    p_msg.style.color = "rgba(250,250,210, 1)";
    p_msg.style.color = "rgba(250,250,210, 0.2)"; //transition в css
  }
}
