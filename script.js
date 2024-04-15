"use strict";
//import { ModalFenster } from "./modal";

const IMG_WITH = 800; // (px)
const IMG_HEGHT = 600; // (px)

//цвета для заметок NOTE(string, COLOR);
const YELLOW = "rgb(250,255,200)"; //готово (цвет по умолчанию)
const BLUE = "rgb(200,200,255)"; // процесс
const RED = "rgb(255,150,150)"; // ошибки

const container = document.querySelector(".container"); //контейнер сцены
const curtain = document.querySelector(".curtain"); //штора блокировки на весь экран
const div_filename = document.querySelector(".file-name");

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = IMG_HEGHT; //вертикальное разрешение
canvas.width = IMG_WITH; //зависит от параметров экрана
const bufer_canvas = new OffscreenCanvas(IMG_WITH, IMG_HEGHT); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = IMG_HEGHT; //вертикальное разрешение
bufer_canvas.width = IMG_WITH; //зависит от параметров экрана

//var color_light = "hsl(20,90%,90%)"; //светлый цвет как --light в style.css
var g_color = {light: "hsl(20,90%,90%)", dark:"hsl(20,90%,10%)"}; // цвет как в style.css

canvas.addEventListener("mousemove", (e) => { cursorStyle(e); });

var data_address; //данные номеров секторов из adresses.bmp (r-компонента - номер сектора)
var data_scene; //холст для раскраски (просто прозрачный)

var selected_color = null; //по сути - выбор гильдии
const alpha = 200; //альфаканал для прозрачности заливки
const colors = [ 
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

const img_background = new Image(); //фоновое изображение водопада/вулкана
const img_borders = new Image(); //границы секторов
const fenster = new ModalFenster(); //модальное окно
const idb = new IndexedDB("foesectors", 5);  //локальная база даных IndexedDB (для автозагрузки предыдущей карты)
const editor = new FormEditor(); //форма редактирования сектора


/******************** выбор карты **************************************/
var nmap; //номер карты: 1-вулкан, 2-водопад
var nsec; //количество секторов на карте: вулкан - 60 / водопад - 61
var defSectors; //массив стандартных названий секторов

function MapChoise(map){  
  const def_sec1 = [{id: 0, name:"vulcan", os: 1, color: 0}, // os = 1 - флаг для используемой базы
  {id: 1, name: "A1M", os: 3, color: 0 }, // нумерация секторов с единицы!
  {id: 2, name: "B1O", os: 3, color: 0 },
  {id: 3, name: "C1N", os: 3, color: 0 },
  {id: 4, name: "D1B", os: 3, color: 0 },
  {id: 5, name: "A2S", os: 2, color: 0 },
  {id: 6, name: "A2T", os: 2, color: 0 },
  {id: 7, name: "B2S", os: 2, color: 0 },
  {id: 8, name: "B2T", os: 2, color: 0 },
  {id: 9, name: "C2S", os: 2, color: 0 },
  {id:10, name: "C2T", os: 2, color: 0 }, // 10
  {id:11, name: "D2S", os: 2, color: 0 },
  {id:12, name: "D2T", os: 2, color: 0 },
  {id:13, name: "A3V", os: 1, color: 0 },
  {id:14, name: "A3X", os: 1, color: 0 },
  {id:15, name: "A3Y", os: 1, color: 0 },
  {id:16, name: "A3Z", os: 1, color: 0 },
  {id:17, name: "B3V", os: 1, color: 0 },
  {id:18, name: "B3X", os: 1, color: 0 },
  {id:19, name: "B3Y", os: 1, color: 0 }, //19
  {id:20, name: "B3Z", os: 1, color: 0 },
  {id:21, name: "C3V", os: 1, color: 0 },
  {id:22, name: "C3X", os: 1, color: 0 },
  {id:23, name: "C3Y", os: 1, color: 0 },
  {id:24, name: "C3Z", os: 1, color: 0 },
  {id:25, name: "D3V", os: 1, color: 0 },
  {id:26, name: "D3X", os: 1, color: 0 },
  {id:27, name: "D3Y", os: 1, color: 0 },
  {id:28, name: "D3Z", os: 1, color: 0 },
  {id:29, name: "A4A", os: 1, color: 0 },
  {id:30, name: "A4B", os: 1, color: 0 },
  {id:31, name: "A4C", os: 1, color: 0 },
  {id:32, name: "A4D", os: 1, color: 0 },
  {id:33, name: "A4E", os: 1, color: 0 },
  {id:34, name: "A4F", os: 1, color: 0 },
  {id:35, name: "A4G", os: 1, color: 0 },
  {id:36, name: "A4H", os: 1, color: 0 },
  {id:37, name: "B4A", os: 1, color: 0 },
  {id:38, name: "B4B", os: 1, color: 0 },
  {id:39, name: "B4C", os: 1, color: 0 },
  {id:40, name: "B4D", os: 1, color: 0 },
  {id:41, name: "B4E", os: 1, color: 0 },
  {id:42, name: "B4F", os: 1, color: 0 },
  {id:43, name: "B4G", os: 1, color: 0 },
  {id:44, name: "B4H", os: 1, color: 0 },
  {id:45, name: "C4A", os: 1, color: 0 },
  {id:46, name: "C4B", os: 1, color: 0 },
  {id:47, name: "C4C", os: 1, color: 0 },
  {id:48, name: "C4D", os: 1, color: 0 },
  {id:49, name: "C4E", os: 1, color: 0 },
  {id:50, name: "C4F", os: 1, color: 0 },
  {id:51, name: "C4G", os: 1, color: 0 },
  {id:52, name: "C4H", os: 1, color: 0 },
  {id:53, name: "D4A", os: 1, color: 0 },
  {id:54, name: "D4B", os: 1, color: 0 },
  {id:55, name: "D4C", os: 1, color: 0 },
  {id:56, name: "D4D", os: 1, color: 0 },
  {id:57, name: "D4E", os: 1, color: 0 },
  {id:58, name: "D4F", os: 1, color: 0 },
  {id:59, name: "D4G", os: 1, color: 0 },
  {id:60, name: "D4H", os: 1, color: 0 },
  {id:61, name: "0", os: 1, color: 0 },
  ];
  const def_sec2 = [{id: 0, name:"waterfall", os: 2, color: 0}, // os = 2 - флаг для используемой базы
  {id: 1, name: "A5A", os: 1, color: 0 }, // нумерация секторов с единицы!
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
  nmap = map; 
  if (map == 1){
    nsec = 60; //вулкан 60 секторов
    defSectors = def_sec1;
  } else {
    nsec = 61; //водопад 61 секторов
    defSectors = def_sec2;    
  }
}

var arrSector = []; //оперативное хранилище данных карты


/******************** загрузка содержимого help.html (из скрытого фрейма) *************************/
//todo убрать фрейм / грузить хелп из json или txt ?? https://developer.mozilla.org/ru/docs/Learn/JavaScript/Asynchronous/Promises
var helpHTML; //содержимое в формате html
document.getElementById("helpbox").addEventListener("load", (event)=>{      
  let content = event.target.contentWindow.document;
  helpHTML = content.querySelector("body").innerHTML;  
});

document.querySelector(".btn-help").addEventListener("click", ()=>{     // показать/скрыть help 
  fenster.open("Help: description, about, contacts.", helpHTML);
})


/*********************** запуск инициализация *************************/
window.addEventListener("load", async () => {
  LOG("Initialization ..." , BLUE);
  //editor = new FormEditor();  
  await idb.open();   
  if (idb.empty) { //при первом запуске выбрать карту     
    btn_new.click();    
  } else { //при повторном запуске скачать карту из локальной базы
    await idb.read_to_arr(); 
    MapChoise(arrSector[0].os); //определяем вулкан или водопад
    await loadingImages();    
    sceneFillSectorAll();
    drawScene();
    LOG("READY.");
    NOTE("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору).","Редактор (правая кнопка).");
  }
})


/************************ загрузка изображений карты *************************/
function loadingImages() {
  LOG("Loading images ..." , BLUE);
  let image = new Image();
  return new Promise((resolve) => {
    img_borders.src = "images/border"+nmap+".png";
    img_borders.onload = () => {      
      img_background.src = "images/bgr"+nmap+".jpg";
      img_background.onload = () => {
        container.style.background = 'url("images/bgr'+nmap+'.jpg")';        
        image.src = "images/scene.png";
        image.onload = () => {
          LOG("Calculation scene ..." , BLUE);
          bufer_ctx.clearRect(0, 0, canvas.width, canvas.height);
          bufer_ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          data_scene = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);          
          image.src = "images/addresses" + nmap + ".bmp";
          image.onload = async () => {
            LOG("Calculation addresses ..." , BLUE);
            bufer_ctx.clearRect(0, 0, canvas.width, canvas.height);
            bufer_ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            data_address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
            await calcSectorsCenters();            
            resolve();
          };
        };
      };
    };
  });

  async function calcSectorsCenters() { // поиск центров секторов (для надписей)
    let maxX = [],  minX = [],  maxY = [],  minY = [];
    for (let s = 1; s <= nsec; s++) { 
      maxX[s] = 0;
      minX[s] = IMG_WITH;
      maxY[s] = 0;
      minY[s] = IMG_HEGHT;
    }
    let n = data_address.data.length;  
    for (let i = 0; i < n; i += 4) {
      let r = data_address.data[i]; //red компонента содержит порядковый номер сектора    
      if (data_address.data[i+1] !=0 || data_address.data[i+2] !=0) continue; //случайные пиксели (todo надо бы улучшить address.bmp)
      if (r <= nsec) { 
        let y = ~~(i / 4 / IMG_WITH);
        let x = i / 4 - y * IMG_WITH;
        if (x > maxX[r]) maxX[r] = x;
        if (y > maxY[r]) maxY[r] = y;
        if (x < minX[r]) minX[r] = x;
        if (y < minY[r]) minY[r] = y;
      }
    }
    for (let s = 1; s <= nsec; s++) { 
      arrSector[s].x = ~~(Math.abs(maxX[s] + minX[s]) / 2);
      arrSector[s].y = ~~(Math.abs(maxY[s] + minY[s]) / 2);
    }
  }
}


function sceneFillSector(adr) { //заливка сектора цветом color  
  let n=data_address.data.length;
  for (var i = 0; i < n; i += 4) {
    if (adr == data_address.data[i]) {
      fillPoint(i, colors[arrSector[adr].color]);
    }
  }
}

/* так логично и понятно
function sceneFillSectorAll() { //заливка ВСЕХ секторов соответствующим цветом  
  for (let sec = 1; sec <= nsec; sec++)
    sceneFillSector(sec);
}; */

// так быстрее
function sceneFillSectorAll() { //заливка ВСЕХ секторов соответствующим цветом    
  let n=data_address.data.length;
  for (var i = 0; i < n; i += 4) {
    let adr = data_address.data[i];
    if (adr < 62) {
      fillPoint(i, colors[arrSector[adr].color]);
    }
  }
} 



function fillPoint(adr, {r,g,b,a}){ //заливка одного пиксела в сцене
  data_scene.data[adr + 0] = r; //red
  data_scene.data[adr + 1] = g; //green
  data_scene.data[adr + 2] = b; //blue
  data_scene.data[adr + 3] = a; //alfa
}


/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 14px arial";
ctx.fontStretch = "ultra-condensed"; 
ctx.textRendering = "geometricPrecision";
ctx.shadowBlur = 3;

function drawScene() {    
  ctx.fillStyle = "transparent";
  ctx.shadowColor = "transparent";
  //ctx.clearRect(0, 0, canvas.width, canvas.height); //не обязательно ().drawImage полностью зарисует канвас)
  
  //фон
  ctx.drawImage(img_background, 0, 0, canvas.width, canvas.height);
  
  //карта секторов  
  bufer_ctx.putImageData(data_scene, 0, 0);
  ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);
  
  //границы секторов  
  ctx.shadowColor = g_color.light;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;  
  ctx.drawImage(img_borders, 0, 0, canvas.width, canvas.height);  
  
  //подписи секторов
  for (let s = 1; s <= nsec; s++) { 
    let x = arrSector[s].x;
    let y = arrSector[s].y;        
    if (arrSector[s].os==0)  //если это штаб то сместить к краю по вертикали
      y -= Math.floor((IMG_HEGHT/2-y)/15);
    let osadki = (arrSector[s].os==0) ? "штаб" : "🞇".repeat(arrSector[s].os); //🞅🞇o
    
    if (arrSector[s].color == selected_color) { //сектора выбранной гильдии
      ctx.fillStyle = g_color.light;
      ctx.shadowColor = g_color.dark;
    } else { //остальные сектора
      ctx.fillStyle = g_color.dark;
      ctx.shadowColor = g_color.light;
    }
    //подписи сектора (для "усиления" тени несколько прорисовок со смещением тени)
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(arrSector[s].name, x, y);    
    ctx.fillText(osadki, x, y + 14);
    ctx.shadowOffsetX = -1;
    ctx.shadowOffsetY = -1;
    ctx.fillText(arrSector[s].name, x, y);
    ctx.fillText(osadki, x, y + 14);     
  }
  
}



/***************** клик по сектору - выбор гильдии / заливка *********************************/
canvas.addEventListener("click", (e) => {  
  let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  let adr = data_address.data[offset]; //red component = number of address
  if (adr > nsec) {  //клик не по сектору 
    NOTE("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору)."," Редактор сектора (правая кнопка)" );
    return;
  }
  
  if (arrSector[adr].os == 0) { // (.os == 0) это штаб    
    if (selected_color == arrSector[adr].color) {
      selected_color = null;
      NOTE(`Выбрать штаб (кликнуть по штабу).`);
    } else {
      selected_color = arrSector[adr].color;
      NOTE(`Выбрать опорники для гильдии ${arrSector[adr].name} (кликнуть по сектору).`);      
    }
  } else { //это не штаб
    if (selected_color) { //цвет выбран
      if (selected_color == arrSector[adr].color) //клик по той же гильдии - отмена выделения
        arrSector[adr].color = 0; //помечаем что сектор не занят гильдией
      else 
        arrSector[adr].color = selected_color; //помечаем что сектор занят этой гильдией
      sceneFillSector(adr); //перекрашиваем сектор
      idb.save_sector(adr);
    } else { //цвет не выбран
      NOTE("Назначить штабы - редактор (правая кнопка).","Выбор гильдии - клик по штабу.");
      return;
    }
  }
  
  drawScene();
});



/*************** new - очистить всю карту ******************/
const btn_new = document.querySelector(".btn-new");
btn_new.addEventListener("click", () => {
  fenster.open(
    "Создание новой карты.",
    "<div style='text-align:center;'><h2>Выберите карту</h2> <br> ВНИМАНИЕ! <br> Текущие изменения не сохраняются! </div>",
    [
      { name:"ВУЛКАН", callback: ()=>{CreateNewMap(1)} }, 
      { name:"ВОДОПАД", callback: ()=>{CreateNewMap(2)} } 
    ]);    
});

async function CreateNewMap(map) {
  container.classList.add("anim-clear");
  MapChoise(map);
  arrSector = JSON.parse(JSON.stringify(defSectors)); //копируем названия по умолчанию
  let sec_example = (map == 1 ? 29 : 1);  //для образца поставить один штаб
  arrSector[sec_example].name = "GUILD NAME";
  arrSector[sec_example].os = 0;
  arrSector[sec_example].color = 1;

  await idb.write_to_baze();
  await loadingImages();
  sceneFillSectorAll();
  
  setTimeout(() => { //перерисовать сцену в середине анимации
    selected_color=null; //снять выбор штаба
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
  fenster.open(
    "Подтвердите действие:",
    "Удалить выбор опорников? <br> (штабы останутся на местах)",
    [ 
      {name:"OK", callback: ClearOsadki},
      {name:"CANCEL", callback: ()=>{}}
    ]    
  );
});

function ClearOsadki(){
  container.classList.add("anim-clear");
  selected_color=null; //снять выбор штаба
  for (let i = 1; i <= nsec; i++) {
    if (arrSector[i].os!=0){ // не штаб
      arrSector[i].color = 0; //отметить что сектор не занят
      sceneFillSector(i, colors[0]); //убрать заливку
      idb.save_sector(i); //отметить в IndexedDB
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
//todo правильнее записать в базу на сервер (с уникальным id)
document.addEventListener("keydown", (e)=>{keypressed(e)});
function keypressed(e){
  if (e.code == 'KeyS' && e.ctrlKey) { // Ctrl+S - записать карту в файл
    e.preventDefault();
    SaveFile();
  }
}

const btn_save = document.querySelector(".btn-save");
btn_save.addEventListener("click", ()=>{ SaveFile() } );
async function SaveFile() {  
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
    const writable = await filehandler.createWritable();
    await writable.write(content);
    await writable.close();
    LOG("File "+filename+" is saved.");
    NOTE("Файл карты " +filename +" можно переслать другому игроку", "для последующего редактирования.");
    btn_load.blur();
    div_filename.textContent = filename;
    curtain.style.display = "none";
  } catch (err) {     
    if (err.name == 'AbortError') { //если окно просто закрыли
      NOTE("Файл не записан."); 
    } else {      
      LOG("Error saving map file!" , RED);      
      NOTE("Ошибка записи: " + err.name + " , " + err.message);
    }    
  } finally {
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
//todo правильнее загрузить из базы на сервере (с уникальным id)
const btn_load = document.querySelector(".btn-load");
btn_load.addEventListener("click", async () => {
  if (!('showOpenFilePicker' in window)){
    NOTE("Невозможно открыть файл в вашем браузере."); 
    return;
    //todo альтернативный ввод выбора файла для загрузки
  }
  
  curtain.style.display = "block"; //шторка
  NOTE("Выбор файла данных карты ...");
  let fileHandler;
  try{
    const options = {
      multiple: false,
      types: [{accept: {'text/plain': '.map' }}, ],
      excludeAcceptAllOption: true
    };
    fileHandler = await window.showOpenFilePicker(options); //открывает окно для выбора клиентом локального файла
    LOG("Downloading map file ...", BLUE);
    let file = await fileHandler[0].getFile();
    let contents = await file.text();
    arrSector = JSON.parse(contents);    
    await idb.write_to_baze();    
    MapChoise(arrSector[0].os);
    
    await loadingImages();
    sceneFillSectorAll();
    drawScene();       

    LOG("Map downloaded.");
    NOTE("Карта загружена.");
    div_filename.textContent = fname(file.name);    
  } catch(err) { //если окно просто закрыли
    if (err.name == 'AbortError') { //если окно просто закрыли
      NOTE("Отмена. Файл не загружен."); 
    } else {     
      NOTE("Ошибка загрузки файла карты!");
      LOG("Error reading map file!", RED);
    }
  } finally {
    curtain.style.display = "none";
    btn_load.blur();
  }    

  function fname(fs){ //возвращает имя файла
    let n = fs.indexOf('.');
    return fs.slice(0,n);
  }
 
});



/*************** копироваине изображения карты в буфер обмена ******************/
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
  setTimeout(() => { //позволить анимации закончиться
    canvas.classList.remove("anim-copy");
    divClipBoard.style.display = "block";
    btn_imgcopy.removeAttribute("disabled"); //разблокировать кнопку copy
  }, 800);
});



/*************** save - сохранить картинку в файл ******************/
//import {SaveCanvasToFile} from './images.js';
const btn_imgsave = document.querySelector(".btn-imgsave");
btn_imgsave.addEventListener("click", async ()=>{
  LOG("Saving image file ...", BLUE);
  NOTE("Запись изображения в файл на компьютере ...");
  btn_imgsave.blur(); //убрать фокус с кнопки (свернуть выпадающее меню)
  curtain.style.display = "block";
  selected_color = null; //снять выбор штаба
  drawScene(); //перерисовать сцену
  try{ 
    await SaveCanvasToFile(canvas);    
    LOG("Image map is saved.");
    NOTE("Сохраненное изображение карты можно переслать или опубликовать.");      
  } catch (err) {    
    if (err.name == 'AbortError') {
      NOTE("Файл не записан."); 
    } else {      
      NOTE("Ошибка записи: " + err.name + " , " + err.message);
    }    
  };
  curtain.style.display = "none";
});



/*************** upload - загрузка на сервер imgbb.com ******************/
const btn_imgbb = document.querySelector(".btn-imgbb"); 
btn_imgbb.addEventListener("click", async () => {
  selected_color = null; //снять выделение выбора штаба
  drawScene();
  canvas.classList.add("anim-copy");

  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));  
  let frmdata = new FormData();
  frmdata.append("image", blob, "image.png");
 
  const myRequest = new Request(
    "https://api.imgbb.com/1/upload?key=26f6c3a3ce8d263ae81844d87abcd8ef", {
      method: "POST",
      body: frmdata
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
    let full_link = "<a target='_blank' href='" + map_link + "' > " + short_link +" </a>";
    //div_filename.innerHTML = full_link;
    LOG("Link " + short_link + " copied into clipboard.", BLUE);  
    
    imgClipBoard.src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
    divClipBoard.style.display = "block";  
    divClipBoard.setAttribute("data-text", "изображение карты на imgbb.com      (click to copy link)");
    divClipBoard.click();

    divClipBoard.addEventListener("click", ()=>{ //todo вынести отдельно (срабатывает при копи в буфер)
      writeClipboardText(short_link);
      NOTE("Ссылка на карту: " + full_link + " уже в буфере обмена.", "Нажмите Ctrl+V вставить ссылку в сообщение.");
    })
  } catch (error) {
    LOG("ERROR: " + error, RED);
    NOTE("Ошибка загрузки изображения карты на сайт imgbb.com");
  }

  setTimeout(() => {
    canvas.classList.remove("anim-copy");
  }, 800);
});


/********************** вид курсора ***************/
function cursorStyle(e) {
  let adr;
  try {
    let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
    adr = data_address.data[offset]; //получить red component = number of address
  } catch {
    return;
  }
  if (!adr || adr > nsec || adr < 1){ //за пределами секторов
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


/****************** подбор цветовой схемы  **********/
const theme = {
  hue: 20,
  change: ()=>{        
    theme.hue +=20;
    if (theme.hue > 360) theme.hue = 20;    
    g_color = getHLSColor(theme.hue);  //глобал: для текстовых надписей в канвасе
    document.documentElement.style.setProperty("--dark", g_color.dark);
    document.documentElement.style.setProperty("--light", g_color.light);    
    drawScene();
  }
}

const getHLSColor = hue => {  
  if (!hue) hue = Math.floor(Math.random() * 360);  //без параметра - случайный цвет
  let clrL = "hsl(" + hue + ", 90%, 90%)";
  let clrD = "hsl(" + hue + ", 90%, 10%)";
  return {light:clrL , dark:clrD};
}

document.querySelector(".btn-theme").addEventListener("click", ()=>{  theme.change() });




/******************************************************************
******************* СЕРВИСНЫЕ ФУНКЦИИ *****************************
*******************************************************************/

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



/*******************************************************************/
/************* функции для отладки *********************************/
/*******************************************************************/

// кнопка для отладки DEBUG 
const test = document.querySelector(".btn-test");
//test.style.visibility = "visible";  //DEBUG закоментировать
test.addEventListener("click", ()=>{  
  //fenster.open("DEBUG","Message", []);
  drawScene();
});

//вывод в логи тестового сообщения
function DBG(msg=""){
  LOG("DEBUG (" + Math.ceil(performance.now()) + ") " + msg, RED);
}