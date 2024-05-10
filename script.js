"use strict";

const IMG_WITH = 800; // (px)
const IMG_HEGHT = 600; // (px)

//цвета для заметок NOTE(string, COLOR);
const YELLOW = "rgb(255,255,200)"; //готово (цвет по умолчанию)
const BLUE = "rgb(200,255,255)"; // процесс
const RED = "rgb(255,150,150)"; // ошибки

const container = document.querySelector(".container"); //контейнер сцены
const curtain = document.querySelector(".curtain"); //штора блокировки на весь экран
const spinner = document.querySelector(".spinner"); //индикатор загрузки
const div_filename = document.querySelector(".file-name");

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = IMG_HEGHT; //вертикальное разрешение
canvas.width = IMG_WITH; //зависит от параметров экрана
const bufer_canvas = new OffscreenCanvas(IMG_WITH, IMG_HEGHT); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = IMG_HEGHT; //вертикальное разрешение
bufer_canvas.width = IMG_WITH; //зависит от параметров экрана

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
var editor; // = new FormEditor(); //форма редактирования сектора

var map_link; //полная ссылка на загруженную карту на https://imgbb.com
var jsonbin_id; //id файла карты для работы с https://jsonbin.io   "661f8a66ad19ca34f85b5e88";  
var LANG;    //Object - языковый пакет
var helpHTML; //содержимое help в формате html

var g_color; //цветовая палитра


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



/*********************** запуск инициализация *************************/
window.addEventListener("load", async () => {
  LOG("Initialization ..." , BLUE);
  dimension.set();

  editor = new FormEditor(); //форма редактирования сектора
  await idb.open();  

  ColorTheme.set();
  await Language.set();  
  
  const searchParams = new URLSearchParams(window.location.search); //параметры строки запроса
  try {
    if (searchParams.has('id')) {
      jsonbin_id = searchParams.get('id');
      await jsonDownload();    
    } else {
      if (idb.empty) { //при первом запуске выбрать карту     
        btn_new.click();    
      } else { //при повторном запуске скачать карту из локальной базы
        await idb.read_to_arr(); 
        MapChoise(arrSector[0].os); //определяем вулкан или водопад
        await loadingImages();    
        sceneFillSectorAll();
        sceneDraw();    
      }  
    }
    LOG("READY");
    NOTE(LANG.note.common_message);
  } catch {    
    NOTE("");
  }
   
})


window.addEventListener("resize", () => {
  dimension.set();
});

/********************** коэффициент масштаба *****************************/
const dimension = {
  x: null,
  y: null,
  set(){
    this.x = container.clientWidth / IMG_WITH;
    this.y = container.clientHeight / IMG_HEGHT;     
  },
  offset(e){
    let Y = ~~(e.offsetY/this.y);
    let X = ~~(e.offsetX/this.x);
    return (Y * IMG_WITH + X) * 4;    
  }
}


/****************** быстрые клавиши *********************************/
document.addEventListener("keydown", (e)=>{keypressed(e)});
function keypressed(e){  
  if (e.code == 'KeyS' && e.ctrlKey) { // Ctrl+S - записать карту в файл
    e.preventDefault();
    FileSave();
  }
  if (e.code == 'KeyO' && e.ctrlKey) { // Ctrl+S - считать карту из файла
    e.preventDefault();
    FileLoad();
  }
}



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
        container.style.backgroundSize = "cover";
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
            div_clipboard.style.display = "none"
            div_monitor_imgbb.style.display = "none";         
            resolve();
          };
        };
      };
    };
  });
}

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

function sceneFillSector(adr) { //заливка сектора цветом color  
  let n=data_address.data.length;
  for (var i = 0; i < n; i += 4) {
    if (adr == data_address.data[i]) {
      fillPoint(i, colors[arrSector[adr].color]);
    }
  }
}

function sceneFillSectorAll() { //заливка ВСЕХ секторов соответствующим цветом    
  //for (let sec = 1; sec <= nsec; sec++) sceneFillSector(sec); //так логично и понятно
  //но так быстрее
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



/****************** РЕДАКТОР подписи сектора ****************************/
class FormEditor{
  adr = null;
  
  constructor() {            
    this.form = document.querySelector(".sector_editor");
    this.inp_name = document.querySelector(".input_name");
    this.nodes_osadki = document.querySelectorAll(".input_osad input[type='radio']");
    this.div_inp_color = document.querySelector(".input_color");
    this.nodes_color = document.querySelectorAll(".input_color input[type='radio']");
    this.btn_save = document.querySelector(".btn_edit_save");
    this.btn_canc = document.querySelector(".btn_edit_cancel");
    
    canvas.addEventListener("contextmenu", (event) => { //клик правой кнопкой - редактор надписи
      event.preventDefault();
      event.stopPropagation();      
      let offset = dimension.offset(event);
      this.adr = data_address.data[offset]; // number of address (red component)
      if (this.adr < 1 || this.adr > nsec) return; //клик не на секторе
      selected_color=null; //снять выбор штаба
      sceneDraw(); 
      this.edit();
    });

    curtain.addEventListener("click",()=>{      
      this.hide();
    })
    
    this.form.addEventListener("keydown", (e) => { 
    if (e.code === "Enter" || e.code === "NumpadEnter") { //запись по кнопке ENTER
      /* необязатльно, т.к. нажатие на ENTER всё равно вызывает событие click на первой <button> */
        this.save();        
        this.hide();
      }      
      if (e.code === "Escape") {          
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
    NOTE(LANG.note.edit_sector + defSectors[this.adr].name + LANG.note.save_esc);
    curtain.style.display = "block";
    this.form.style.display = "flex";
    //позиционирование формы
    let dx = arrSector[this.adr].x - this.form.clientWidth / 2;
    if (dx < 0) 
      dx = 2;
    if (dx + this.form.clientWidth > IMG_WITH)
      dx = IMG_WITH - this.form.clientWidth - 2;
    let dy = arrSector[this.adr].y - this.form.clientHeight / 2;
    if (dy < 0) 
      dy = 2;
    if (dy + this.form.clientHeight > IMG_HEGHT)
      dy = IMG_HEGHT - this.form.clientHeight - 2;
    this.form.style.left = dx + "px";
    this.form.style.top = dy + "px";
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
    if (this.form.style.display == "none") 
      return; //костыль - если окно не открыто не обрабатывать клик (иначе закрывается шторка)        
    curtain.style.display = "none"; //разблокировать холст
    this.form.style.display = "none";  
    NOTE(""); 
  };

  save(){ //проверка данных на корректность и запись
    let nam = this.inp_name.value; //название 
    let osd = [... this.nodes_osadki].findIndex(e=>e.checked); //0 штаб или 123 кол-во осад
    let clr = [... this.nodes_color].findIndex(e=>e.checked); //цвет
    if (!nam) { //пустое имя
      NOTE(LANG.note.validate_title, "red");
      return;
    }
    if (osd == 0 && clr == 0) { // штаб без цвета      
      NOTE(LANG.note.select_color, "red");
      return;
    }
    arrSector[this.adr].name = nam;
    arrSector[this.adr].os = osd;
    arrSector[this.adr].color = clr;
    idb.save_sector(this.adr); //запись в базу    
    sceneFillSector(this.adr); //заливка
    sceneDraw();
    this.hide();
    LOG("Data province saved.");
    NOTE("...");    
  }

} //end class FormEditor



/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 14px arial";
ctx.fontStretch = "ultra-condensed"; 
ctx.textRendering = "geometricPrecision";
ctx.shadowBlur = 3;

function sceneDraw() {    
  ctx.fillStyle = "transparent";
  ctx.shadowColor = "transparent";
  
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



/***************** клики по сектору *********************************/
canvas.addEventListener("click", (e) => {  
  //let offset = (e.offsetY * IMG_WITH + e.offsetX) * 4;
  let offset = dimension.offset(e);
  let adr = data_address.data[offset]; //red component = number of address
  if (adr > nsec) {  //клик не по сектору 
    NOTE(LANG.note.common_message);
    return;
  }
  
  if (arrSector[adr].os == 0) { // (.os == 0) это штаб    
    if (selected_color == arrSector[adr].color) {
      selected_color = null; 
      NOTE(LANG.note.common_message);
    } else {
      selected_color = arrSector[adr].color;
      NOTE(LANG.note.choose_support_for + arrSector[adr].name);
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
      NOTE(LANG.note.common_message);      
      return;
    }
  }
  
  sceneDraw();
});



/*************** new - очистить всю карту ******************/
const btn_new = document.querySelector(".btn_new");
btn_new.addEventListener("click", () => {
  fenster.open(
    LANG.fenster.create_map_title,
    LANG.fenster.create_map_message,
    [
      { name:LANG.fenster.vulkan, callback: ()=>{CreateNewMap(1)} }, 
      { name:LANG.fenster.waterfall, callback: ()=>{CreateNewMap(2)} } 
    ]);    
});

async function CreateNewMap(map) {
  container.classList.add("anim-new");
  MapChoise(map);
  arrSector = JSON.parse(JSON.stringify(defSectors)); //копируем названия по умолчанию
  let sec_example = (map == 1 ? 29 : 1);  //для образца поставить один штаб
  arrSector[sec_example].name = "GUILD NAME";
  arrSector[sec_example].os = 0;
  arrSector[sec_example].color = 1;

  await idb.write_to_baze();
  await loadingImages();
  sceneFillSectorAll();

  jsonbin_id = null;
  setLocation("");
  div_filename.textContent = "";  
  
  setTimeout(() => { //перерисовать сцену в середине анимации (общая длительность 1000ms)
    selected_color=null; //снять выбор штаба
    sceneDraw();
  }, 500);

  container.onanimationend = () => { //по окончании анимации 
    container.classList.remove("anim-new");
    LOG("New map created.")
  };

  
};



/*************** clear - очистить опорники ******************/
const btn_clear = document.querySelector(".btn_clear");
btn_clear.addEventListener("click", () => {
  fenster.open(
    LANG.fenster.confirm,
    LANG.fenster.clear_support,
    [ 
      {name:"OK", callback: ClearOsadki},
      {name:"CANCEL", callback: ()=>{}}
    ]    
  );
});

function ClearOsadki(){
  container.classList.add("anim-clear");  
  for (let i = 1; i <= nsec; i++) {
    if (arrSector[i].os!=0){ // не штаб
      arrSector[i].color = 0; //отметить что сектор не занят
      sceneFillSector(i, colors[0]); //убрать заливку
      idb.save_sector(i); //отметить в IndexedDB
    }
  }
  
  setTimeout(() => { //перерисовать сцену в середине анимации
    selected_color=null; //снять выбор штаба
    sceneDraw();
  }, 500);

  container.onanimationend = () => { //todo постоянно создаётся новый листенер
    container.classList.remove("anim-clear");
    LOG("Map cleared.")
  };

}



/************ запись данных карты в файл на локальный диск **********/
document.querySelector(".btn_save").addEventListener("click", ()=>{ FileSave() } );

async function FileSave() {  
  curtain.style.display = "block";
  NOTE(LANG.note.save_map_to_file);  
  
  let filename = genDateString();
  let fileHandler;  
  try {
    const options = {
      //startIn: 'desktop',  //указание папки на компе (desktop - рабочий стол)
      suggestedName: filename,
      types: [{
        description: 'Text Files',
        accept: {'text/plain': '.map'},
      }],
    };
    fileHandler = await window.showSaveFilePicker(options); //получение дескриптора файла  
    spinner.style.display = "block";
    filename = fileHandler.name;
    const writable = await fileHandler.createWritable();
    const content = JSON.stringify(arrSector, null, "\t");
    await writable.write(content);
    await writable.close();
    LOG("File "+filename+" saved.");
    NOTE('"' + filename + '" ' + LANG.note.can_send_another_player);    
  } catch (err) {     
    if (err.name == 'AbortError') { //если окно просто закрыли
      NOTE("..."); 
    } else {      
      LOG("Error file saving!" , RED);      
      NOTE(LANG.note.error_file_save + err.name + " , " + err.message);
    }    
  } finally {
    curtain.style.display = "none";   
    spinner.style.display = "none";     
  }  
  
};



/************ чтение данных карты из json файла с компьютера **********/
document.querySelector(".btn_load").addEventListener("click", ()=>{ FileLoad() } );
async function FileLoad() {
  if (!('showOpenFilePicker' in window)){
    NOTE(LANG.note.deprecated_operation); 
    //todo нужен альтернативный ввод выбора файла для загрузки
    return;
  }
  
  curtain.style.display = "block"; //шторка
  NOTE(LANG.note.select_file);
  try{
    const options = {
      multiple: false,
      types: [{accept: {'text/plain': '.map' }}, ],
      excludeAcceptAllOption: true
    };
    let fileHandler = await window.showOpenFilePicker(options); //окно для выбора клиентом локального файла
    spinner.style.display = "block";
    LOG("Downloading map ...", BLUE);
    let file = await fileHandler[0].getFile();
    let contents = await file.text();
    
    arrSector = JSON.parse(contents);   
    MapChoise(arrSector[0].os);    
    await idb.write_to_baze();    
    await loadingImages();
    sceneFillSectorAll();
    sceneDraw();       

    jsonbin_id = NaN;
    div_filename.textContent = "";
    setLocation("");

    LOG("Map loaded.");
    NOTE(LANG.note.map_loaded);
  } catch(err) { //если окно просто закрыли
    if (err.name == 'AbortError') { //если окно просто закрыли
      NOTE("..."); 
    } else {     
      LOG("Error reading map file!", RED);
      NOTE(LANG.note.error_file_read +  + "("+ err.name + " , " + err.message + ")");
    }
  } finally {
    curtain.style.display = "none";
    spinner.style.display = "none";        
  }    
 
}



/*************** копироваине изображения карты в буфер обмена ******************/
const btn_imgcopy = document.querySelector(".btn_imgcopy");
const div_clipboard = document.querySelector(".clipboard");

btn_imgcopy.addEventListener("click", () => {  
  btn_imgcopy.parentElement.style.display = "none"; //убрать выпавшее меню  
  selected_color=null; //снять выбор штаба
  sceneDraw(); 
  canvas.classList.add("transit_clipboard");  
  canvas.toBlob((blob) => {
    let data = [new ClipboardItem({ "image/png": blob })]; //работает только по протоколу https или localhost !
    navigator.clipboard.write(data).then(
      () => {        
        document.querySelector(".clipboard img").src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
        NOTE(LANG.note.map_copied_to_clipboard);
        LOG("Image copied into clipboard.");
      },
      (err) => {
        LOG("Copying failed: " + err , RED);
        NOTE(LANG.note.deprecated_operation + " Error: " + err);
      }
    );
  });
  
  setTimeout(() => { //позволить трансформации закончиться
    div_clipboard.style.display = "block";
    canvas.classList.remove("transit_clipboard");        
    btn_imgcopy.parentElement.style.display = "flex"; //восстановить выпадающее меню
  }, 1000);
});


/*************** save - сохранить картинку в файл ******************/
document.querySelector(".btn_imgsave").addEventListener("click", async ()=>{
  LOG("Saving image to file ...", BLUE);
  NOTE(LANG.note.save_img_to_file);  
  curtain.style.display = "block";
  selected_color = null; //снять выбор штаба
  sceneDraw(); //перерисовать сцену
  try{ 
    let filename = await SaveCanvasToFile();        
    LOG("Image saved.");
    NOTE(LANG.note.img_saved_to_file + `"${filename}"`);      
  } catch (err) {    
    if (err.name == 'AbortError') {
      NOTE("..."); 
    } else {      
      NOTE(LANG.note.error_file_save + err.name + " , " + err.message);
    }    
  } finally {
    curtain.style.display = "none";
    spinner.style.display = "none";
  }

  function SaveCanvasToFile() {
    return new Promise(async (resolve, reject) => {      
      try {          
        const options = {
          //startIn: 'desktop',  //указание папки на компе (desktop - рабочий стол)
          suggestedName: "mapsnapshot",
          types: [
            {
              description: "Image Files",
              accept: { "image/jpeg": ".jpg" },
            },
          ]
        };        
        let fileHandler = await window.showSaveFilePicker(options); //получение дескриптора файла        
        spinner.style.display = "block";
        canvas.toBlob(async (blob) => {
          const writable = await fileHandler.createWritable();
          await writable.write(blob);
          await writable.close();
          resolve(fileHandler.name);
        });
      } catch (error) {        
        reject(error);
      }
    });
  }
  
});


/*************** upload - загрузка на сервер imgbb.com ******************/
document.querySelector(".btn_imgbb").addEventListener("click", (event)=>{ ImgUpload(event) });
const div_monitor_imgbb = document.querySelector(".monitor_imgbb");

async function ImgUpload(e){  
  selected_color = null; //снять выделение выбора штаба
  sceneDraw();
  canvas.classList.add("transit_monitor_imgbb");
  e.target.parentElement.style.display = "none"; //убрать выпавшее меню  
  LOG("Uploading image to server imgbb.com ... ", BLUE);
  NOTE(LANG.note.save_to_imgbb);

  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));  
  let frmdata = new FormData();
  frmdata.append("image", blob, "image.png");
 
  try {
    const myRequest = new Request(
      "https://api.imgbb.com/1/upload?key=26f6c3a3ce8d263ae81844d87abcd8ef", {
        method: "POST",
        body: frmdata
      }
    );
    const response = await fetch(myRequest);
    if (!response.ok) {      
      throw new Error("problem imgbb.com connection");
    }
    const result = await response.json(); 
    map_link = result.data.url_viewer; //ссылка на загруженную карту на imgbb.com
    LOG("Imagemap uploaded to imgbb.com server.");
    document.querySelector(".monitor_imgbb img").src = URL.createObjectURL(blob); //установить картинку в "монитор" (правый-верхний угол)
    div_monitor_imgbb.setAttribute("data-text", "image on imgbb.com      (click to copy link)");
    setTimeout(() => {
      div_monitor_imgbb.style.display = "block";}, 800); 
    div_monitor_imgbb.click(); //скопировать в буфер обмена
  } catch (error) {
    LOG("ERROR: " + error.message, RED);
    NOTE(LANG.note.error_img_download_to_imgbb, "red");
  }
  
  setTimeout(() => {      
    canvas.classList.remove("transit_monitor_imgbb");
    e.target.parentElement.style.display = "flex"; //восстановить выпавшее меню  
  }, 1000);
}

div_monitor_imgbb.addEventListener("click", ()=>{  
  let short_link = map_link.slice(8); //короткая ссылка (без https://)
  let full_link = "<a target='_blank' href='" + map_link + "' > " + short_link +" </a>";
  writeClipboardText(short_link);
  LOG("Link " + short_link + " copied to clipboard.");  
  NOTE('"' + full_link +'" ' + LANG.note.link_copied_to_clibboard);
})

 

/************* отправка карты на  https://jsonbin.io/ ************************/
const btn_json_upload = document.querySelector(".btn_upload");
btn_json_upload.addEventListener("click", ()=>{ jsonUpload() });

function jsonUpload() { //upload to  https://jsonbin.io/
  LOG("Uploading map to jsonbin.io ...",BLUE)
  NOTE(LANG.note.save_to_jsonbin);
  curtain.style.display = "block";
  spinner.style.display = "block";
  
  const content = JSON.stringify(arrSector, null, "\t");
  let request = new XMLHttpRequest();    
    
  if (!jsonbin_id){ //создание нового json
    request.open("POST", "https://api.jsonbin.io/v3/b", true);
    request.setRequestHeader("X-Bin-Name", genDateString()); //в принципе имя задавать нет смысла
  } else { //если задан id то презапись того же самого
    request.open("PUT", "https://api.jsonbin.io/v3/b/" + jsonbin_id, true);
  }
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("X-Master-Key", "$2a$10$2AS39h/1.QOdB8zw.VW9A.2Tm0RLqK9TH7Qes68PC.DpcG3ROYyEq");
  request.send(content);
   
  request.onreadystatechange = () => {
    if (request.readyState == XMLHttpRequest.DONE) {
      let responce = JSON.parse(request.responseText);
      if (!jsonbin_id) jsonbin_id = responce.metadata.id;        
      div_filename.textContent = jsonbin_id;
      let link = "https://siryozhka.github.io/foemap?id=" + jsonbin_id;
      let linkHTML = "<a target='_blank' href='" + link + "'> " + link +" </a>";
      setLocation("?id="+jsonbin_id);
      NOTE(LANG.note.map_uploaded_to_jsonbin + jsonbin_id, linkHTML);
      LOG("Map uploaded to jsonbin.io");
      curtain.style.display = "none";
      spinner.style.display = "none";
    }
  }
    
  request.onerror = (error) => {
    LOG("ERROR: " + error, RED);
    NOTE(LANG.note.error_uploading_map_to + "jsonbin.io", "red"); 
    reject();
  }  
    
}



/************** получение карты с  https://jsonbin.io/ ************************/
const btn_json_download = document.querySelector(".btn_download");
btn_json_download.addEventListener("click", ()=>{
  fenster.open(
    LANG.fenster.download_from_jsonbin + "jsonbin.io",
    "<div style='text-align:center;'> ID: <input type='text' class='input_id_jasonbin' name='id' autocomplete='on'/> </div> ",
    [
      { name:"LOAD", callback: ()=>{
        jsonbin_id = document.querySelector(".input_id_jasonbin").value;
        jsonDownload();
      } } 
    ]);    
})

function jsonDownload(){
  LOG("Downloading map from jsonbin.io ...",BLUE)
  NOTE(LANG.fenster.download_from_jsonbin + "jsonbin.io ...");
  curtain.style.display = "block";
  spinner.style.display = "block";

  let request = new XMLHttpRequest();    
  request.open("GET", "https://api.jsonbin.io/v3/b/" + jsonbin_id, true);
  request.setRequestHeader("X-Master-Key", "$2a$10$2AS39h/1.QOdB8zw.VW9A.2Tm0RLqK9TH7Qes68PC.DpcG3ROYyEq");
  request.send();   
  
  request.onreadystatechange = async () => {
    if (request.readyState == XMLHttpRequest.DONE) {
      try {
        arrSector = JSON.parse(request.responseText).record;        
        LOG("Map downloaded from jsonbin.io");
        NOTE(LANG.note.map_loaded);         
        setLocation("?id="+jsonbin_id);      
        div_filename.textContent = jsonbin_id;
        
        await idb.write_to_baze();        
        MapChoise(arrSector[0].os); //определяем вулкан или водопад
        await loadingImages();
        sceneFillSectorAll();
        sceneDraw();
      
      } catch(error) {
        LOG("ERROR: " + error, RED);
        NOTE(LANG.note.error_downloading_map_from + "jsonbin.io", "red");     
        throw new Error("failed to load json");    
      } finally {
        curtain.style.display = "none";
        spinner.style.display = "none";
      }
    }                    
  } 
  
}



/******************************* вид курсора ***************************/
function cursorStyle(e) {
  let adr;
  try { //чтобы не проверять offset в границах data_address    
    let offset = dimension.offset(e);    
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



/****************** выбор языка **************************/
const btn_language = document.querySelector(".btn_language");
btn_language.addEventListener("click", ()=>{Language.change()});

const Language = {  
  name: ["en","ru"],
  fullname: ["English","Russian"],
  n: Number(window.localStorage.getItem("pbgmap_lang")) || 0,
  async change(){        
    this.n++;
    if(this.n >= this.name.length) this.n = 0;    
    window.localStorage.setItem("pbgmap_lang", this.n);   
    this.set();
  },
  async set(){            
    btn_language.textContent = this.fullname[Language.n];
    LANG = await loadJson("lang/" + this.name[this.n] + ".json");
    { //обновление сообщений и хэлпа
      document.querySelectorAll('button[class^="btn_"]').forEach((btn)=>{;   //https://www.w3.org/TR/selectors-3/#selectors
        let s = btn.className;
        if (LANG.btn_tips[s])      
          btn.setAttribute("data-text", LANG.btn_tips[s]);
      });
      div_helpbox.src = "help_"+ this.name[this.n] +".html";         
      NOTE("..."); //просто очистить строку подсказок
      LOG(this.fullname[Language.n]+ " language selected");
    }    
  }
}


/******************** установка цветовой схемы  *******************/
document.querySelector(".btn_theme").addEventListener("click", ()=>{  
  SetColorTheme();  
});

const ColorTheme = {
  hue: Number(window.localStorage.getItem("pbgmap_theme")) || 20,  
  save(){
    window.localStorage.setItem("pbgmap_theme", this.hue);    
  },
  set(hue = this.hue){
    g_color = hslset(hue);
    document.documentElement.style.setProperty("--dark", g_color.dark);
    document.documentElement.style.setProperty("--light", g_color.light);    
  }
};

const hslset = (hue) => ({  
  light: "hsl(" + hue + ", 90%, 90%)",
  dark: "hsl(" + hue + ", 90%, 10%)"
})

function SetColorTheme(){
  fenster.open(
    "Select color theme",
    "<div style='text-align:center; width:300px;'> <input type='range' id='theme_clr' min='0' max='360' step='10' /> </div> "        
  );
  //нельзя двигать - трудно восстановить! fenster.m_window.style.transform = "translate(100px, -300px)";
  let inp_range = document.querySelector('#theme_clr');
  inp_range.value = ColorTheme.hue;
  inp_range.oninput = (e) => {   
    let hue = e.target.value;
    ColorTheme.hue = hue;
    ColorTheme.set(hue);
  }
  fenster.closed = () => {
    ColorTheme.save();    
    sceneDraw();    
  };
}

/**************** подгрузка содержимого help.html (из скрытого фрейма) ********************/
const div_helpbox = document.getElementById("helpbox");
div_helpbox.addEventListener("load", (event)=>{      
  let content = event.target.contentWindow.document;
  helpHTML = content.querySelector("body").innerHTML;          
} );

document.querySelector(".btn_help").addEventListener("click", ()=>{     // показать/скрыть help 
  fenster.open(LANG.fenster.help_message, helpHTML);
})


/******************************************************************
******************* СЕРВИСНЫЕ ФУНКЦИИ *****************************
*******************************************************************/

//генератор строки с датой YYYYMMDD
function genDateString(){
  let addZero = (value)=>{ return (value <=9 ? '0' : '') +value; };
  let date = new Date(Date.now());
  let y = date.getFullYear();
  let m = addZero(date.getMonth()+1);
  let d = addZero(date.getDay());
  return "pbg-"+y+m+d;
}

// вывод в строку состояния
const note_box = document.querySelector(".label-box");
function NOTE(message, clr="var(--dark)") {  //область вывода (для второй строки вставить <br>)
  note_box.innerHTML = message;  
  note_box.style.color = clr;
}

//вывод логов на экран (цвет сообщений по умолчанию - жёлтый)
function LOG(message, color=YELLOW) {
  let p_msg = document.createElement("p");
  document.querySelector("#log_box").appendChild(p_msg);
  setTimeout(()=>{ //чтобы предварительно сработала анимация затенения в css
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

//добавить параметр id в строку запроса htpp
function setLocation(state){  
  let url = window.location.origin + window.location.pathname;
  console.log(url);
  try {    
    window.history.replaceState({id: state}, null, url + state);
  } catch (error) {
    LOG("Error: state is illegal, ", error);
  }
}

//загрузка json файла - возвращает Object
async function loadJson(url){
  let response = await fetch(url);
  if (response.ok) { // если HTTP-статус в диапазоне 200-299  
    let json = await response.json();
    return json;
  } else {  
    LOG("ERROR file reading: " + response.status);    
    NOTE(LANG.note.error_file_read + url);    
    return {};
  }
}


// кнопка для отладки DEBUG 
const test = document.querySelector(".btn_test");
//test.style.visibility = "visible";  //todo закоментировать
test.addEventListener("click", async ()=>{  
  DBG("Test start");  
  
});

//вывод в логи тестового сообщения
function DBG(msg=""){
  //todo вычислять время между запусками
  LOG("DEBUG (" + Math.ceil(performance.now()) + ") " + msg, "rgb(200,255,200)");
}



