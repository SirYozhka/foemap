"use strict";

const IMG_WITH = 800; // (px)
const IMG_HEGHT = 600; // (px)

const BLUE = "rgb(200,200,255)"; // текущий процесс
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

var color_light = "hsl(20,90%,90%)"; //светлый цвет как --light в style.css

const curtain = document.querySelector(".curtain"); //штора блокировки на весь экран
var Confirm; //окно подтверждения действия клясс ModalFenster
const div_filename = document.querySelector(".file-name");
var selected_color = null;
var form; //класс формы редактирования сектора
var img_background = new Image(); //фоновое изображение водопада
var img_borders = new Image(); //границы секторов
var data_address; //данные номеров секторов из adresses.bmp (r-компонента - номер сектора)
var data_scene; //холст для раскраски (просто прозрачный)
var alpha = 200; //альфаканал для прозрачности заливки

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

const defSectors = [{id: 0 }, // нумерация секторов с единицы!
  {id: 1, name: "A5A", os: 1, color: 0 },
  {id: 2, name: "A5D", os: 1, color: 0 },
  {id: 3, name: "B5C", os: 1, color: 0 },
  {id: 4, name: "C5B", os: 1, color: 0 },
  {id: 5, name: "D5A", os: 1, color: 0 },
  {id: 6, name: "D5D", os: 1, color: 0 },
  {id: 7, name: "E5C", os: 1, color: 0 },
  {id: 8, name: "F5B", os: 1, color: 0 },
  {id: 9, name: "X1X", os: 3, color: 0 },
  {id:10, name: "A4A", os: 1, color: 0 }, // 10
  {id:11, name: "A3A", os: 2, color: 0 },
  {id:12, name: "A2A", os: 2, color: 0 },
  {id:13, name: "A5B", os: 1, color: 0 },
  {id:14, name: "A4B", os: 1, color: 0 },
  {id:15, name: "A3B", os: 1, color: 0 },
  {id:16, name: "A5C", os: 1, color: 0 },
  {id:17, name: "A4C", os: 3, color: 0 },
  {id:18, name: "B2A", os: 2, color: 0 },
  {id:19, name: "B3A", os: 1, color: 0 }, //19
  {id:20, name: "B4A", os: 1, color: 0 },
  {id:21, name: "B5A", os: 1, color: 0 },
  {id:22, name: "B3B", os: 2, color: 0 },
  {id:23, name: "B4B", os: 2, color: 0 },
  {id:24, name: "B5B", os: 1, color: 0 },
  {id:25, name: "B4C", os: 1, color: 0 },
  {id:26, name: "B5D", os: 1, color: 0 },
  {id:27, name: "C2A", os: 2, color: 0 },
  {id:28, name: "C3A", os: 1, color: 0 },
  {id:29, name: "C4A", os: 2, color: 0 },
  {id:30, name: "C5A", os: 1, color: 0 },
  {id:31, name: "C3B", os: 1, color: 0 },
  {id:32, name: "C4B", os: 2, color: 0 },
  {id:33, name: "C5C", os: 1, color: 0 },
  {id:34, name: "C4C", os: 2, color: 0 },
  {id:35, name: "C5D", os: 1, color: 0 },
  {id:36, name: "D2A", os: 3, color: 0 },
  {id:37, name: "D3A", os: 2, color: 0 },
  {id:38, name: "D4A", os: 1, color: 0 },
  {id:39, name: "D3B", os: 1, color: 0 },
  {id:40, name: "D4B", os: 1, color: 0 },
  {id:41, name: "D5B", os: 1, color: 0 },
  {id:42, name: "D4C", os: 1, color: 0 },
  {id:43, name: "D5C", os: 1, color: 0 },
  {id:44, name: "E2A", os: 2, color: 0 },
  {id:45, name: "E3A", os: 1, color: 0 },
  {id:46, name: "E4A", os: 2, color: 0 },
  {id:47, name: "E5A", os: 1, color: 0 },
  {id:48, name: "E3B", os: 2, color: 0 },
  {id:49, name: "E4B", os: 2, color: 0 },
  {id:50, name: "E5B", os: 1, color: 0 },
  {id:51, name: "E4C", os: 2, color: 0 },
  {id:52, name: "E5D", os: 1, color: 0 },
  {id:53, name: "F2A", os: 3, color: 0 },
  {id:54, name: "F3A", os: 2, color: 0 },
  {id:55, name: "F4A", os: 2, color: 0 },
  {id:56, name: "F5A", os: 1, color: 0 },
  {id:57, name: "F3B", os: 1, color: 0 },
  {id:58, name: "F4B", os: 2, color: 0 },
  {id:59, name: "F5C", os: 1, color: 0 },
  {id:60, name: "F4C", os: 2, color: 0 },
  {id:61, name: "F5D", os: 1, color: 0 },
];
var arrSector = []; //текущее хранилище данных карты


/*********************** запуск инициализация *************************/
window.addEventListener("load", () => {
  LOG("Initialization started ..." , BLUE);
  dbSectorsOpen()
  .then(loadingSceneImages)
  .then(()=>{
    canvas.addEventListener("mousemove", (e) => { cursorStyle(e); }); //тут из-за возможного случайного дергания мышкой при загрузке страницы
    form = new FormEditor();
    drawScene();
  });
  Confirm = new ModalFenster("Подтвердите действие");
});


/*********** нажатия клавиш в документе ***/
document.addEventListener("keydown", (e)=>{keypressed(e)});
function keypressed(e){
  if (e.code == 'KeyS' && e.ctrlKey) { // Ctrl+S - записать карту в файл
    e.preventDefault();
    SaveFile();
  }
  if (e.code === "Escape") { //общий ESC для любого окна - закрывает все/любые окна
    help.hide(); 
    form.hide();
    Confirm.close();
    NOTE("");
  }
}

curtain.addEventListener("click", ()=>{  
  help.hide(); 
  form.hide();
  Confirm.close();
  NOTE("");
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

    dbRequest.onupgradeneeded = function (event) {  //создание базы при первом запуске ( изменении версии )
      btn_help.click(); //показать help при первом запуске
      LOG("Database (ver. " + dbVersion + ") setup ...");
      arrSector = JSON.parse(JSON.stringify(defSectors)); //копируем настройки по умолчанию 
      let db = event.target.result;
      if (db.objectStoreNames.contains("sectors")) //если есть хранилище "sectors"
        db.deleteObjectStore("sectors"); //удалить хранилище "sectors"
      let userStore = db.createObjectStore("sectors", {keyPath: 'id', autoIncrement: false}); //и создать
      for (let sec = 0; sec <= 61; sec++)
        userStore.add(arrSector[sec]); //заполняем базу
    };

    dbRequest.onerror = function () {
      LOG("ERROR! Database failed to open. Please, contact developer." , RED);
    };

  });

  //todo прикрутить загрузку начальных данных из default.json
  /* 
  async function loadJSON(requestURL) {
    const request = new Request(requestURL);
    const response = await fetch(request);
    const jsonTXT = await response.text(); //получение "сырого" json-текста
    return JSON.parse(jsonTXT); //преобразование текста в объект JS
  } 
  */
}

function dbSaveSector(sec) { //записать в базу сектор sec из arrSector[sec]
  var txn = dbData.transaction("sectors", "readwrite");
  let request = txn.objectStore("sectors").put(arrSector[sec]);
  request.onsuccess = ()=>{
    divClipBoard.style.display = "none"; //убрать картинку буфера обмена
  };
  request.onerror = ()=>{
    LOG("ERROR saving: " + request.error, RED);
  };
}

function dbSaveAllSectors(){
  for (let i = 1; i < 62; i++) 
    dbSaveSector(i); //запись в IndexedDB
}


/************************ загрузка изображений карты *************************/
function loadingSceneImages() {
  return new Promise(async (resolve, reject) => {
    LOG("Loading images ..." , BLUE);
    img_borders.src = "images/border.png";
    img_background.src = "images/bgr.jpg";
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
          sceneFillSectorAll();
          LOG("Ready to process.");
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
ctx.font = "bold 16px arial";
ctx.fontStretch = "ultra-condensed"; 
ctx.textRendering = "geometricPrecision";
ctx.shadowOffsetX = 0.3;
ctx.shadowOffsetY = 0.3;
ctx.shadowBlur = 4;

function drawScene() {
  //фон
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.shadowColor = color_light;
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
      ctx.fillStyle = color_light;
      ctx.shadowColor = "black";
    } else { //просто штаб
      ctx.fillStyle = "black";
      ctx.shadowColor = color_light;
    }
    let osadki = (arrSector[s].os==0) ? "штаб" : "🞅".repeat(arrSector[s].os); //🞔🞕🞅🞇🞖🞚🞛
    ctx.fillText(arrSector[s].name, arrSector[s].x, arrSector[s].y);
    ctx.fillText(arrSector[s].name, arrSector[s].x, arrSector[s].y); //для "усиления" тени двойная прорисовка
    ctx.fillText(osadki, arrSector[s].x, arrSector[s].y + 16);
    ctx.fillText(osadki, arrSector[s].x, arrSector[s].y + 16);  //для "усиления" тени двойная прорисовка
  }
}

function sceneFillSector(adr) { //заливка сектора цветом color
  let color = colors[arrSector[adr].color];
  for (var i = 0; i < data_address.data.length; i += 4) {
    if (data_address.data[i] == adr) {
      fillPoint(i, color);
    }
  }
}

function sceneFillSectorAll() { //заливка ВСЕХ секторов соответствующим цветом
  LOG("Filling sectors with colors..." , BLUE);
  for (var i = 0; i < data_address.data.length; i += 4) {
    let adr = data_address.data[i];
    if (adr < 62) {
      fillPoint(i, colors[arrSector[adr].color]);
    }
  }
};

function fillPoint(adr, color){
  data_scene.data[adr + 0] = color.r; //red
  data_scene.data[adr + 1] = color.g; //green
  data_scene.data[adr + 2] = color.b; //blue
  data_scene.data[adr + 3] = color.a; //alfa
}


/***************** клик по сектору - выбор гильдии / заливка *********************************/
canvas.addEventListener("click", (e) => {
  form.hide(); //закрыть другой редактор если открыт (на всяк случай)
  help.hide(); //закрыть help если открыт
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  let adr = data_address.data[offset]; //red component = number of address
  if (adr > 61) {  //клик не по сектору 
    NOTE("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору)."," Редактор сектора (правая кнопка)" );
    return;
  }
  
  if (arrSector[adr].os == 0) { // (.os == 0) это штаб
    if (selected_color == arrSector[adr].color) 
      selected_color = null;
    else {
      selected_color = arrSector[adr].color;
      NOTE("Выбрать опорники для гильдии " + arrSector[adr].name + " (кликнуть по сектору).");
    }
  } else if (selected_color) { //цвет выбран
    if (selected_color == arrSector[adr].color) //клик по той же гильдии - отмена выделения
      arrSector[adr].color = 0; //помечаем что сектор не занят гильдией
    else 
      arrSector[adr].color = selected_color; //помечаем что сектор занят этой гильдией
    sceneFillSector(adr); //покрасить сектор в выбранный цвет 
    dbSaveSector(adr);
  } else { //цвет не выбран
    NOTE("Сначала нужно назначить штабы (правая кнопка - редактор).","И выбрать гильдию (клик по штабу).");
  }

  drawScene();
});



/****************** РЕДАКТОР подписи сектора ****************************/
class FormEditor{
  adr = null;
  
  constructor() { 
    this.form_editor = document.querySelector(".sector_editor");
    this.inp_name = document.querySelector(".input_name");
    this.nodes_osadki = document.querySelectorAll(".input_osad input[type='radio']");
    this.div_inp_color = document.querySelector(".input_color");
    this.nodes_color = document.querySelectorAll(".input_color input[type='radio']");
    this.btn_save = document.querySelector(".btn-edit-save");
    this.btn_canc = document.querySelector(".btn-edit-cancel");
    
    canvas.addEventListener("contextmenu", (event) => { //клик правой кнопкой - редактор надписи
      event.preventDefault();
      event.stopPropagation();
      let offset=(event.offsetY * IMG_WITH + event.offsetX) * 4;
      this.adr = data_address.data[offset]; // number of address (red component)
      if (this.adr < 1 || this.adr > 61) return; //клик не на секторе
      selected_color=null; //снять выбор штаба
      drawScene(); 
      this.edit();
    });
    
    /* необязатльно, т.к. нажатие на ENTER всё равно вызывает событие click на первой <button> */
    this.form_editor.addEventListener("keydown", (e) => { //запись по кнопке ENTER
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        this.save();        
        this.hide();
      }      
    });
    
    this.btn_save.addEventListener("click", ()=>{ //кнопка SAVE
      this.save();      
    });

    this.btn_canc.addEventListener("click", ()=>{ //кнопка CANCEL
      this.hide();        
    });

    for (const item of this.nodes_osadki) { //для всех кнопок (штаб/осадки)
      item.addEventListener("change", (e)=>{ 
        let osd = [... this.nodes_osadki].findIndex(e=>e.checked);
        this.div_inp_color.style.display = (osd ? "none" : "flex"); // = 0 показать панель выбора цвета
        if (osd){ //если ставим осадку то сбросить имя сектора на "по умолчанию" и отключить цвет
          this.inp_name.value = defSectors[this.adr].name;
          this.nodes_color[0].checked = true; //поставить галочку (нет цвета - невидимый radio)
        } else { //если ставим "штаб" - сразу редактировать его имя
          this.inp_name.focus();
          this.inp_name.select();
        }
      })
    };

  } //end constructor

  edit() {     
    NOTE("Редактирование данных сектора: " + defSectors[this.adr].name, "Сохранить - ENTER, выход - ESC.");
    curtain.style.display = "block";
    this.form_editor.style.display = "flex";
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
    let osd=arrSector[this.adr].os;  //кол-во осад в секторе (если osd == 0 тогда там штаб)
    this.nodes_osadki[osd].checked = true; //поставить галочку
    this.div_inp_color.style.display = (osd ? "none" : "flex"); // показать/скрыть панель выбора цвета
    let clr = arrSector[this.adr].color; //цвет сектора
    this.nodes_color[clr].checked = true; //поставить галочку (если нет цвета будет невидимый radio)
  };

  hide() { //скрыть форму 
    curtain.style.display = "none"; //разблокировать холст
    this.form_editor.style.display = "none";  
    NOTE("");  
  };

  save(){ //проверка данных на корректность и запись
    let nam = this.inp_name.value; //название 
    let osd = [... this.nodes_osadki].findIndex(e=>e.checked); //0 штаб или 123 кол-во осад
    let clr = [... this.nodes_color].findIndex(e=>e.checked); //цвет
    if (!nam) { //пустое имя
      NOTE("Пустое название недопустимо.");
      return;
    }
    if (osd == 0 && clr == 0) { // штаб без цвета      
      NOTE("Выберите цвет штаба.");
      return;
    }
    arrSector[this.adr].name = nam;
    arrSector[this.adr].os = osd;
    arrSector[this.adr].color = clr;
    dbSaveSector(this.adr); //запись в базу    
    sceneFillSector(this.adr); //заливка
    drawScene();
    this.hide();
    NOTE("Данные записаны, карта обновлена.");
  }

} //end edit class


/*************** new - очистить всю карту ******************/
const btn_new = document.querySelector(".btn-new");
btn_new.addEventListener("click", () => {
  Confirm.open("Создать новую чистую карту? <br> (названия всех секторов и количество осадок буду установлены по умолчанию)", ClearMap);
});

function ClearMap() {
  selected_color=null; //снять выбор штаба
  container.classList.add("anim-clear");
  for (let i = 1; i <= 61; i++) {  //перезаписать настройки по умолчанию (id, x, y - не меняем !!!)
    arrSector[i].name = defSectors[i].name; 
    arrSector[i].os = defSectors[i].os; 
    arrSector[i].color = 0; 
  }
  dbSaveAllSectors(); //сохранить все сектора в IndexedDB
  sceneFillSectorAll();
  setTimeout(() => { //перерисовать сцену в середине анимации
    drawScene();
  }, 500);  
  setTimeout(() => { //дать возможность закончить анимацию
    container.classList.remove("anim-clear");
    LOG("New map created.")
  }, 1000);

};


/*************** clear - очистить опорники ******************/
const btn_clear = document.querySelector(".btn-clear");
btn_clear.addEventListener("click", () => {
  Confirm.open("Удалить опорники? <br> (штабы останутся на местах)" , ClearOsadki);  
});

function ClearOsadki(){
  selected_color=null; //снять выбор штаба
  container.classList.add("anim-clear");
  for (let i = 1; i <= 61; i++) {
    if (arrSector[i].os!=0){ // не штаб
      arrSector[i].color = 0; //отметить что сектор не занят
      sceneFillSector(i, colors[0]); //убрать заливку
      dbSaveSector(i); //отметить в IndexedDB
    }
  }
  setTimeout(() => { //перерисовать сцену в середине анимации
    drawScene();
  }, 500);
  setTimeout(() => { //дать возможность закончить анимацию
    container.classList.remove("anim-clear");
    LOG("Map cleared.")
  }, 1000);
}


/************ запись данных карты в файл на локальный диск **********/
const btn_save = document.querySelector(".btn-save");
btn_save.addEventListener("click", ()=>{ SaveFile() } );

async function SaveFile() {
  //todo правильнее записать в базу на сервер (с уникальным id)
  curtain.style.display = "block";
  NOTE("Сохранение данных карты в файл на диске.");
  const content = JSON.stringify(arrSector, null, "\t");
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
    filename = filehandler.name;
  } catch { //если окно просто зарыли
    NOTE("");
    curtain.style.display = "none";
    return;
  }

  try {
    const writable = await filehandler.createWritable();
    await writable.write(content);
    await writable.close();
    LOG("Map metadata file "+filename+" is saved.");
    NOTE("Файл данных карты " +filename +" можно переслать другому игроку", "для последующего редактирования.");
    btn_load.blur();
    div_filename.textContent = filename;
    curtain.style.display = "none";
  } catch {
    LOG("Error saving map metadata!" , RED);
    NOTE("Ошибка записи файла данных карты.");
    curtain.style.display = "none";
  }
  
  function genDateString(){
    let addZero = (value)=>{ return (value <=9 ? '0' : '') +value; };
    let date = new Date(Date.now());
    let y = date.getFullYear();
    let m = addZero(date.getMonth()+1);
    let d = addZero(date.getDay());
    return "PBG"+y+m+d;
  }

};



/************ чтение данных карты из json файла **********/
const btn_load = document.querySelector(".btn-load");
btn_load.addEventListener("click", async () => {
  //todo правильнее загрузить из базы на сервере (с уникальным id)
  if (!('showOpenFilePicker' in window)){
    NOTE("Невозможно записать файл в вашем браузере."); 
    return;
    //todo альтернативный ввод выбора файла для загрузки
  }
  
  curtain.style.display = "block";
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
    curtain.style.display = "none";
    return;
  }
  
  try{ //получение файла и загрузка данных карты
    let file = await fileHandler[0].getFile();
    let contents = await file.text();
    arrSector = JSON.parse(contents);
    dbSaveAllSectors();
    sceneFillSectorAll();
    drawScene(); 
    LOG("Map metadata downloaded.");
    NOTE("");
    div_filename.textContent = fname(file.name);
    curtain.style.display = "none";
  } catch {
    NOTE("Ошибка загрузки файла данных карты!");
    LOG("Error reading map metadata!", RED);
    curtain.style.display = "none";
  }
  btn_load.blur();

  function fname(fs){ //возвращает имя файла
    let n = fs.indexOf('.');
    return fs.slice(0,n);
  }
 
});


/*************** копироваине карты в буфер обмена ******************/
const btn_imgcopy = document.querySelector(".btn-imgcopy");
const divClipBoard = document.querySelector(".monitor");
const imgClipBoard = document.querySelector(".monitor img");
btn_imgcopy.addEventListener("click", () => {
  selected_color=null; //снять выбор штаба
  drawScene(); 
  canvas.classList.add("anim-copy");  
  btn_imgcopy.setAttribute("disabled", null); //временно заблокировать кнопку copy
  canvas.toBlob((blob) => {
    let data = [new ClipboardItem({ "image/png": blob })]; //работает только по протоколу https или localhost !
    navigator.clipboard.write(data).then(
      () => {
        imgClipBoard.src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
        divClipBoard.setAttribute("data-text", "изображение карты в буфере обмена");
        NOTE("Карта скопирована в буфер обмена.", "Нажмите Ctr+V, чтобы вставить изображение карты (например в telegram). ");
        LOG("Imagemap copied into clipboard.");
      },
      (err) => {
        LOG("Error imagemap copy: " + err , RED);
      }
    );
  });
  setTimeout(() => {
    canvas.classList.remove("anim-copy");
    divClipBoard.style.display = "block";
    btn_imgcopy.removeAttribute("disabled"); //разблокировать кнопку copy
  }, 800);
});


/*************** save - сохранить картинку в файл ******************/
const btn_imgsave = document.querySelector(".btn-imgsave");
btn_imgsave.addEventListener("click", ()=>{
  btn_imgsave.blur();
  curtain.style.display = "block";
  selected_color=null; //снять выбор штаба
  drawScene(); 
  SaveImage();
});

async function SaveImage() {
  let filehandler;
  const options = {
    //startIn: 'desktop',  //указание папки на компе (desktop - рабочий стол)
    suggestedName: "mapsnapshot",
    types: [{
      description: 'Image Files',
      accept: {'image/jpeg': '.jpg'},
    }],
  };

  try {
    filehandler = await window.showSaveFilePicker(options); //получение дескриптора файла
  } catch { //если окно просто закрыли
    NOTE("");
    curtain.style.display = "none";
    return;
  };

  canvas.toBlob(async (blob) => {
    try{
      const writable = await filehandler.createWritable();
      await writable.write(blob);
      await writable.close();
      LOG("Image map is saved.");
      NOTE("Сохраненное изображение карты можно переслать или опубликовать.");
      curtain.style.display = "none";
    }catch{
      LOG("Error saving image map!" , RED);
      NOTE("Ошибка записи изображения карты.");
      curtain.style.display = "none";
    }
  });

};


/*************** upload - загрузка на сервер imgbb.com ******************/
const btn_imgbb = document.querySelector(".btn-imgbb"); 
btn_imgbb.addEventListener("click", async () => {
  selected_color = null; //снять выделение выбора штаба
  drawScene();
  canvas.classList.add("anim-copy");

  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  imgClipBoard.src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
  let formData = new FormData();
  formData.append("image", blob, "image.png");
 
  const myRequest = new Request(
    "https://api.imgbb.com/1/upload?key=26f6c3a3ce8d263ae81844d87abcd8ef", {
      method: "POST",
      body: formData
    }
  );

  try {
    const response = await fetch(myRequest);
    if (!response.ok) {
      throw new Error("Error network IMGBB.COM connection!");
    }
    const result = await response.json(); 
    LOG("Map image uploaded to imgbb.com server.");
    let map_link = result.data.url_viewer; //ссылка на загруженную карту на imgbb.com
    let short_link= map_link.slice(8); //короткая ссылка (без https://)
    writeClipboardText(short_link);
    let full_link = "<a target='_blank' href='" + map_link + "' > " + short_link +" </a>";
    div_filename.innerHTML = full_link;
    NOTE("Ссылка на карту: " + full_link + " скопирована в буфер обмена.", "Ctrl+V вставить ссылку в сообщение.");
    LOG("Link " + short_link + " copied into clipboard.", BLUE);  
    setTimeout(() => {
      canvas.classList.remove("anim-copy");
      divClipBoard.style.display = "block";  
      divClipBoard.setAttribute("data-text", "изображение карты на imgbb.com      (click to copy link)");
    }, 800);
    divClipBoard.addEventListener("click", ()=>{
      writeClipboardText(short_link);
    })
  } catch (error) {
    LOG("ERROR: " + error, RED);
    NOTE("Ошибка загрузки изображения на сайт imgbb.com");
  }
});


// показать/скрыть help 
var help = {
  div: document.querySelector(".help-box"),  
  hide: ()=>{
    curtain.style.display = "none";
    help.div.style.display = "none";    
  },
  show: ()=>{
    curtain.style.display = "block";
    help.div.style.display = "flex";    
  }  
}
document.querySelector(".btn-help").addEventListener("click", ()=>{   help.show(); });
document.querySelector(".help-box_close").addEventListener("click", ()=>{   help.hide(); });



//*********************** модальное окно *************************/
class ModalFenster{  
  m_window = document.querySelector(".modal_window");
  m_title = document.querySelector(".modal_title");  
  m_message = document.querySelector(".modal_message");
  m_close = document.querySelector(".modal_close");
  m_buttonOk = document.querySelector(".modal_ok"); 
  m_buttonCanc = document.querySelector(".modal_cancel"); 
  m_callback; //внешняя функция, выполняющаяся при нажании OK или ENTER
  
  constructor(title){    
    this.m_title.textContent = title || "Window title.";
    this.m_window.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter"){    
        this.m_callback(); 
        this.close();
      }
    });
    this.m_buttonOk.addEventListener("click", ()=>{      
      this.m_callback(); 
      this.close();
    });
    this.m_close.addEventListener("click", ()=>{  
      this.close();
    });
    this.m_buttonCanc.addEventListener("click", ()=>{  
      this.close();
    });
  }
  
  open(message, callback){
    this.m_message.innerHTML = message;
    this.m_callback = callback;
    curtain.style.display = "block";
    this.m_window.style.display = "flex";    
    this.m_window.setAttribute("tabindex", "0"); //чтобы работали события клавиатуры
    this.m_window.focus();  
  }

  close(){
    curtain.style.display = "none";
    this.m_window.style.display = "none";    
  }

}


// подбор цветовой схемы 
var frameHelpName = document.getElementById("helpbox");
var frameCnt;
frameHelpName.onload = ()=>{
  frameCnt = frameHelpName.contentWindow.document; //чтобы цвет менять и во фрейме  
}
const theme = {
  hue: 20,
  change: ()=>{    
    theme.hue +=20;
    if (theme.hue > 360) theme.hue = 0;
    let clr = getHLSColor(theme.hue);   
    color_light = clr.light;  //глобал: для текстовых надписей в канвасе
    document.documentElement.style.setProperty("--dark", clr.dark);
    document.documentElement.style.setProperty("--light", clr.light);
    frameCnt.documentElement.style.setProperty("--dark", clr.dark);
    frameCnt.documentElement.style.setProperty("--light", clr.light);
    drawScene();
  }
}
function getHLSColor(hue) {  
  if (!hue) hue = Math.floor(Math.random() * 360);  //без параметра - случайный цвет
  let clrL = "hsl(" + hue + ", 90%, 90%)";
  let clrD = "hsl(" + hue + ", 90%, 10%)";
  return {light:clrL , dark:clrD};
}
document.querySelector(".btn-theme").addEventListener("click", ()=>{  theme.change() });


// вид курсора
function cursorStyle(e) {
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
  let adr = data_address.data[offset]; //получить red component = number of address
  if (!adr || adr > 61 || adr < 1){ //за пределами секторов
    container.style.cursor = "default";
  } else {
    if (arrSector[adr].os == 0) {    //штаб - пипетка
      container.style.cursor = "url('images/pip.png') 0 16, pointer";
    } else { //обычный сектор
      if (selected_color) //цвет выбран
        container.style.cursor = "url('images/pbt.png') 0 16, cell";
      else //цвет не выбран
        container.style.cursor = "help"; //not-allowed
    }
  }
}

// вывод в строку состояния
function NOTE(msg1, msg2="") {
  document.querySelector(".label-box").innerHTML = msg1+"<br>"+msg2;
}

//вывод логов на экран (цвет сообщений по умолчанию - жёлтый)
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

// запись текста в буфер обмена
async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    LOG(error.message, RED);
  }
}