"use strict"; //строгий режим

const IMG_WITH = 800; // (px)
const IMG_HEGHT = 600; // (px)
const ON = true;
const OFF = false;
const BLUE = "rgb(200,200,255)"; // текущий процесс
const GREEN = "rgb(150,255,150)"; // завершение процесса 
const YELLOW = "rgb(250,255,200)"; //стандартные
const RED = "rgb(255,150,150)"; // ошибки

const container = document.querySelector(".container"); //контейнер сцены

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = IMG_HEGHT; //вертикальное разрешение
canvas.width = IMG_WITH; //зависит от параметров экрана

const bufer_canvas = new OffscreenCanvas(IMG_WITH, IMG_HEGHT); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = IMG_HEGHT; //вертикальное разрешение
bufer_canvas.width = IMG_WITH; //зависит от параметров экрана

var selected_color = null;
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

var form; //класс формы редактирования сектора

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
  LOG("Initialization started ..." , BLUE);
  dbSectorsOpen()
    .then(loadingSceneImages)
    .then(()=>{
      drawScene();
      canvas.addEventListener("mousemove", (e) => { cursorStyle(e); });
    });
  form = new FormEditor();
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
        LOG("Database opened." , GREEN);
        resolve();
      }
    };

    //создание базы при первом запуске ( изменении версии )
    dbRequest.onupgradeneeded = function (event) { 
      LOG("Database (ver. " + dbVersion + ") setup ...", GREEN);
      let db = event.target.result;
      if (db.objectStoreNames.contains("sectors")) //если есть хранилище "sectors"
        db.deleteObjectStore("sectors"); //удалить хранилище "sectors"
      let userStore =db.createObjectStore("sectors", {keyPath: 'id', autoIncrement: false}); //и сразу создать
      
      userStore.add({id:0}); //добавляем в начало пустышку (для нумерации секторов с единицы)
      for (let sec = 1; sec < 62; sec++) { 
        arrSector[sec] = Object.assign({}, defaultSectors[sec]); //копируем настройки по умолчанию 
        userStore.add(getSector(sec)); //заполняем базу из инициализирующего массива defaultSectors
      }

    };

    dbRequest.onerror = function () {
      LOG("ERROR! Database failed to open. Please, contact developer." , RED);
    };

  });

  /* //todo прикрутить загрузку начальных данных из default.json
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
    LOG("ERROR saving: " + request.error, RED);
  };
}

function dbSaveAllSectors(){
  for (let i = 1; i < 62; i++) dbSaveSector(i); //запись в IndexedDB
}


/************************ загрузка изображений карты *************************/
function loadingSceneImages() {
  return new Promise((resolve, reject) => {
    LOG("Loading images ..." , BLUE);
    img_background = new Image();
    img_background.src = "images/bgr.jpg";
    img_borders = new Image();
    img_borders.src = "images/brd_warm.png";
    img_background.onload = () => {
      let scn = new Image();
      scn.src = "images/scene.png";
      scn.onload = () => {
        LOG("Calculation scene ..." , BLUE);
        let adr = new Image();
        adr.src = "images/addresses.bmp";
        bufer_ctx.drawImage(scn, 0, 0, canvas.width, canvas.height);
        data_scene = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
        adr.onload = () => {
          LOG("Calculation addresses ..." , BLUE);
          bufer_ctx.drawImage(adr, 0, 0, canvas.width, canvas.height);
          data_address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
          calculationSectorsCenters();
          fillBackgroundAll();
          LOG("Ready to process." , GREEN);
          resolve();
        };
      };
    };
  });

  // поиск центров секторов и закраска секторов в цвет гильдии
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
    }
  }

}


/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 18px arial";
ctx.fontStretch = "ultra-condensed";
ctx.shadowOffsetX = 0.3;
ctx.shadowOffsetY = 0.3;
ctx.shadowBlur = 4;

function drawScene() {
  //фон
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.shadowColor = "transparent";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img_background, 0, 0, canvas.width, canvas.height);
  //карта секторов
  bufer_ctx.putImageData(data_scene, 0, 0);
  ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);
  //границы секторов
  ctx.drawImage(img_borders, 0, 0, canvas.width, canvas.height);
  //подписи секторов
  for (let s = 1; s <= 61; s++) { 
    if (arrSector[s].color == selected_color) { //выбранная гильдия
      ctx.fillStyle = "lightgoldenrodyellow";
      ctx.shadowColor = "black";
    } else { //просто штаб
      ctx.fillStyle = "black";
      ctx.shadowColor = "lightgoldenrodyellow";
    }
    let osadki = (arrSector[s].os==0) ? "штаб" : "o".repeat(arrSector[s].os); //🞔
    for (let i = 0; i < 2; i++){ //для "усиления" тени двойная прорисовка
      ctx.fillText(arrSector[s].name, arrSector[s].x, arrSector[s].y);
      ctx.fillText(osadki, arrSector[s].x, arrSector[s].y + 16);
    }
  }
}

function fillBackground(adr) { //заливка сектора цветом color
  let color = colors[arrSector[adr].color];
  try {
    for (var i = 0; i < data_address.data.length; i += 4) {
      if (data_address.data[i] == adr) {
        data_scene.data[i + 0] = color.r; //red
        data_scene.data[i + 1] = color.g; //green
        data_scene.data[i + 2] = color.b; //blue
        data_scene.data[i + 3] = color.a; //alfa
      }
    }
  } catch {
    LOG("Error filling sector (" + adr + ")" , RED)
  }
}

function fillBackgroundAll() { //заливка ВСЕХ секторов соответствующим цветом
  LOG("Filling sectors with colors..." , BLUE);
  for (var i = 0; i < data_address.data.length; i += 4) {
    let adr = data_address.data[i];
    if (adr < 62) {
      let color = colors[arrSector[adr].color];
      data_scene.data[i + 0] = color.r; //red
      data_scene.data[i + 1] = color.g; //green
      data_scene.data[i + 2] = color.b; //blue
      data_scene.data[i + 3] = color.a; //alfa
    }
  }
};

/***************** клик по сектору - выбор гильдии / заливка *********************************/
canvas.addEventListener("click", (e) => {
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  let adr = data_address.data[offset]; //red component = number of address
  
  form.hide(); //закрыть редактор если открыт 
  //todo или запретить выход из редактора по клику на сцене (перекрыть canvas элементом cover)
  
  if (adr > 61) {  //клик не по сектору 
    NOTE("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору)."," Редактор сектора (правая кнопка)" );
    return;
  }
  
  if (arrSector[adr].os == 0) { //клик по штабу - выбор цвета
    selected_color = arrSector[adr].color;
    NOTE("Выбрать опорники для гильдии " + arrSector[adr].name + " (кликнуть по сектору).");
  } else if (selected_color) { //цвет выбран
    if (selected_color == arrSector[adr].color) //клик по той же гильдии - отмена выделения
      arrSector[adr].color = 0; //помечаем что сектор не занят гильдией
    else 
      arrSector[adr].color = selected_color; //помечаем что сектор занят этой гильдией
    fillBackground(adr); //покрасить сектор в выбранный цвет 
    dbSaveSector(adr);
  } else { //цвет не выбран
    NOTE("Сначала выбрать гильдию (кликнуть по штабу).");
  }

  drawScene();

});



/****************** РЕДАКТОР подписи сектора ****************************/
class FormEditor{
  adr = null;
  nam = "";
  osd = null;
  clr = null;
  
  constructor() { 
    this.form_editor = document.querySelector(".sector_editor");
    this.inp_name = document.querySelector(".input_name");
    this.nodes_osadki = document.querySelectorAll(".input_osad input[type='radio']");
    this.div_inp_color = document.querySelector(".input_color");
    this.nodes_color = document.querySelectorAll(".input_color input[type='radio']");

    canvas.addEventListener("contextmenu", (event) => { //клик правой кнопкой - редактор надписи
      event.preventDefault();
      event.stopPropagation();
      let offset=(event.offsetY * IMG_WITH + event.offsetX) * 4;
      this.adr = data_address.data[offset]; // number of address (red component)
      if (this.adr < 1 || this.adr > 61) return; //клик не на секторе
      selected_color=null; //снять выбор штаба
      drawScene(); 
      NOTE("Редактирование данных сектора: " + defaultSectors[this.adr].name, "Сохранить - ENTER, выход - ESC.");
      this.edit();
    });

    this.form_editor.addEventListener("keydown", (e) => { //запись только по кнопкам
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        if (this.check()){
          this.save();
          drawScene();
          NOTE("Данные записаны, карта обновлена.");
        }
      }
      if (e.code === "Escape") {
        this.hide();
        NOTE("Данные не изменены.");
      }
    });

    for (const item of this.nodes_osadki) { //для всех кнопок (штаб/осадки)
      item.addEventListener("change", (e)=>{ 
        this.osd = [... this.nodes_osadki].findIndex(e=>e.checked);
        this.showColorCheck(this.osd==0); //показать-скрыть панель выбора цвета
        console.log(this.osd);
        //todo
        /*
        if (clr >= 0){ //если есть отмеченый элемент
          clr + 1; //выбранный индекс
        } else { //осадки
          clr=0; //очистить цвет
        }
        */

      })
    }
  } //end constructor

  showColorCheck(mode){ ////показать-скрыть панель выбора цвета
    this.div_inp_color.style.visibility = (mode ? "visible" : "hidden");
  }

  edit() { 
    //затенить холст
    canvas.classList.add("shadow-filter");
    //показать форму
    this.form_editor.style.visibility = "visible";
    //позиционирование формы
    let dx = arrSector[this.adr].x - this.form_editor.clientWidth / 2;
    if (dx < 0) 
      dx = 2;
    if (dx + this.form_editor.clientWidth > IMG_WITH)
      dx = IMG_WITH - this.form_editor.clientWidth - 2;
    let dy = arrSector[this.adr].y - this.form_editor.clientHeight / 2;
    if (dy < 0) 
      dy = 2;
    if (dy + this.form_editor.clientHeight > IMG_HEGHT)
      dy = IMG_HEGHT - this.form_editor.clientHeight - 2;
    this.form_editor.style.left = dx + "px";
    this.form_editor.style.top = dy + "px";
    //заполнение полей формы текущими данными из arrSector
    this.inp_name.value = arrSector[this.adr].name; //название сектора(гильдии)
    this.inp_name.focus();
    this.osd=arrSector[this.adr].os;  //кол-во осад в секторе (если osd == 0 тогда там штаб)
    this.nodes_osadki[this.osd].checked = true; //поставить галочку
    this.showColorCheck(this.osd==0);  //показать-скрыть панель выбора цвета
    this.clr = arrSector[this.adr].color;  //получить цвет сектора
    if (this.clr > 0) this.nodes_color[this.clr-1].checked = true; //поставить галочку
  };

  hide() { //скрыть форму + осветлить холст
    canvas.classList.remove("shadow-filter");
    this.form_editor.style.visibility = "hidden";
    this.div_inp_color.style.visibility = "hidden";
  };

  check(){ //проверка данных на корректность
    this.nam = this.inp_name.value; //название 
    this.osd = [... this.nodes_osadki].findIndex(e=>e.checked); //0 штаб или 123 кол-во осад
    this.clr = [... this.nodes_color].findIndex(e=>e.checked); //цвет
    
    if (!this.nam) {
      LOG("Empty name is not allowed!", RED);
      return false;
    }

    if (this.osd==0 && this.clr < 0) { // штаб без цвета
      LOG("Headquarters color is not selected!", RED);
      return false;
    }

    return true;
  }

  save(){
    arrSector[this.adr].name = this.nam;
    arrSector[this.adr].os = this.osd;
    arrSector[this.adr].color = this.clr + 1;
    fillBackground(this.adr); //заливка
    dbSaveSector(this.adr); //запись в базу
    this.hide(); //убрать затенение холста
  }

} //end class



/*************** копироваине карты в буфер обмена ******************/
const btn_copy = document.querySelector(".btn-copy");
const imgClipBoard = document.querySelector(".monitor img");
btn_copy.addEventListener("click", () => {
  selected_color=null; //снять выбор штаба
  drawScene(); 
  canvas.classList.add("anim-copy");
  imgClipBoard.style.display = "none";
  btn_copy.setAttribute("disabled", null);
  canvas.toBlob((blob) => {
    let data = [new ClipboardItem({ "image/png": blob })]; //работает только по протоколу https или localhost !
    navigator.clipboard.write(data).then(
      () => {
        imgClipBoard.src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
        NOTE("Карта скопирована в буфер обмена.", "Нажмите Ctr+V, чтобы вставить изображение карты (например в telegram). ");
        LOG("Imagemap copied into clipboard." , GREEN);
      },
      (err) => {
        LOG("Error imagemap copy: " + err , RED);
      }
    );
  });
  setTimeout(() => {
    canvas.classList.remove("anim-copy");
    imgClipBoard.style.display = "block";
    btn_copy.removeAttribute("disabled");
  }, 800);
});

/*************** очистить всю карту ******************/
const btn_new = document.querySelector(".btn-new");
btn_new.addEventListener("click", () => {
  let result = confirm("Полностью очистить карту? \n (убираются также штабы и названия)");
  if (!result) return;
  selected_color=null; //снять выбор штаба
  container.classList.add("anim-clear");
  for (let i = 1; i <= 61; i++) {  //перезаписать настройки по умолчанию 
    arrSector[i].name = defaultSectors[i].name; 
    arrSector[i].os = defaultSectors[i].os; 
    arrSector[i].color = 0; 
  }
  dbSaveAllSectors(); //сохранить все сектора в IndexedDB
  fillBackgroundAll();
  drawScene();
  setTimeout(() => {
    container.classList.remove("anim-clear");
    LOG("New map created.")
  }, 300);

});


/*************** очистить опорники ******************/
const btn_clear = document.querySelector(".btn-clear");
btn_clear.addEventListener("click", () => {
  let result = confirm("Удалить только все опорники? \n (штабы и настройки не меняются)");
  if (!result) return;
  selected_color=null; //снять выбор штаба
  container.classList.add("anim-clear");
  for (let i = 1; i <= 61; i++) {
    if (arrSector[i].os!=0){ // не штаб
      arrSector[i].color = 0; //отметить что сектор не занят
      fillBackground(i, colors[0]); //убрать заливку
      dbSaveSector(i); //отметить в IndexedDB
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
  NOTE("Сохранение данных карты в файл на диске.");
  const content = JSON.stringify(arrSector,null,"\t");
  let filename = genDateString();
  let filehandler;

  const options = {
    //startIn: 'desktop',  //указание папки на компе (desktop - рабочий стол)
    suggestedName: filename,
    types: [{
      description: 'Text Files',
      accept: {'text/plain': '.map'},
    }],
  };

  try {
    filehandler = await window.showSaveFilePicker(options); //получение дескриптора файла
  } catch { //если окно просто зарыли
    NOTE("");
    return;
  }

  try{
    const writable = await filehandler.createWritable();
    await writable.write(content);
    await writable.close();
    //LOG("Map metadata file "+filename+" is saved.");
    NOTE("Файл данных карты "+filename+" можно переслать другому игроку", "для последующего редактирования.");
    btn_load.blur();
  }catch{
    LOG("Error saving map metadata!" , RED);
    NOTE("Ошибка записи файла данных карты.");
  }
  
  function genDateString(){
    let addZero = (value)=>{ return (value <=9 ? '0' : '') +value; };
    
    let date = new Date(Date.now());
    let y = date.getFullYear();
    let m = addZero(date.getMonth()+1);
    let d = addZero(date.getDay());
    return "PBG"+y+m+d;
  }


});


/************ чтение данных карты из json файла **********/
const btn_load = document.querySelector(".btn-load");
//todo правильнее загрузить из базы на сервере (с уникальным id)
btn_load.addEventListener("click", async () => {
  if (!('showOpenFilePicker' in window)){
    NOTE("Невозможно записать файл в вашем браузере."); 
    return;
    //todo альтернативный ввод выбора файла для загрузки
  }
  
  NOTE("Выбор файла данных карты ...");
  let fileHandler;
  try{
    const options = {
      multiple: false,
      types: [{accept: {'text/plain': '.map' }}, ],
      excludeAcceptAllOption: true
    };
    fileHandler = await window.showOpenFilePicker(options); //открывает окно для выбора клиентом локального файла
  } catch { //если окно просто зарыли
    NOTE("");
    return;
  }
  
  try{ //получение файла и загрузка данных карты
    let file = await fileHandler[0].getFile();
    let contents = await file.text();
    arrSector = JSON.parse(contents);
    dbSaveAllSectors();
    fillBackgroundAll();
    drawScene(); 
    LOG("Map metadata downloaded.");
    NOTE("");
  } catch {
    NOTE("Ошибка загрузки файла данных карты!");
    LOG("Error reading map metadata!", RED);
  }
  btn_load.blur();
 
});

/********************************************************************/

// вид курсора
function cursorStyle(e) {
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
  let adr = data_address.data[offset]; //получить red component = number of address
  if (!adr || adr > 61 || adr < 1){ //за пределами секторов
    container.style.cursor = "default";
  } else {
    if (arrSector[adr].os == 0) {    //штабы (осадки == 0)
      container.style.cursor = "pointer";
    } else { //обычные сектора 
      container.style.cursor = "cell";
    }
  }
}

//вывод в строку состояния
function NOTE(msg1, msg2="") {
  document.querySelector(".label-box").innerHTML = msg1+"<br>"+msg2;
}

//вывод логов на экран
function LOG(message, color=YELLOW) {
  let p_msg = document.createElement("p");
  document.querySelector("#log-box").appendChild(p_msg);
  setTimeout(()=>{ //чтобы сработала анимация затенения
    p_msg.textContent = message;
    p_msg.style.color = color;
    p_msg.style.opacity = "0.3";
    p_msg.scrollIntoView();
  }, 100);
}
