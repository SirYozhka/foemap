"use strict"; //строгий режим

const img_width = 800; // (px)
const img_height = 600; // (px)

const container = document.querySelector(".container"); //контейнер сцены

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = img_height; //вертикальное разрешение
canvas.width = img_width; //зависит от параметров экрана

const bufer_canvas = new OffscreenCanvas(img_width, img_height); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = img_height; //вертикальное разрешение
bufer_canvas.width = img_width; //зависит от параметров экрана

var selected_guild;
var img_background; //фоновое изображение водопада
var img_borders; //границы
var data_address; //data  номеров секторов из adresses.bmp
var data_scene; //data  холст для раскраски
var alpha = 250; //общий альфаканал для заливки
var gld_color = [null, //нумерация с единицы  gld_color[i]
    { r: 250, g: 0, b: 250, a: alpha }, //розовый
    { r: 100, g: 0, b: 180, a: alpha }, //фиолетовый
    { r: 0, g: 0, b: 250, a: alpha }, //синий
    { r: 250, g: 100, b: 0, a: alpha }, //оранжевый
    { r: 0, g: 250, b: 250, a: alpha }, //бирюзовый
    { r: 250, g: 250, b: 0, a: alpha }, //желтый
    { r: 50, g: 250, b: 50, a: alpha }, //зелёный
    { r: 250, g: 0, b: 0, a: alpha } //красный
];
var sector = [null, //для нумерации с 1
    { name: "Гильдия_1", os: 0, guild: 1 },
    { name: "Гильдия_2", os: 0, guild: 2 },
    { name: "Гильдия_3", os: 0, guild: 3 },
    { name: "Гильдия_4", os: 0, guild: 4 },
    { name: "Гильдия_5", os: 0, guild: 5 },
    { name: "Гильдия_6", os: 0, guild: 6 },
    { name: "Гильдия_7", os: 0, guild: 7 },
    { name: "Гильдия_8", os: 0, guild: 8 },
    { name: "X1X", os: 3, guild: 0 },
    { name: "A4A", os: 1, guild: 0 }, // 10
    { name: "A3A", os: 2, guild: 0 },
    { name: "A2A", os: 2, guild: 0 },
    { name: "A5B", os: 1, guild: 0 },
    { name: "A4B", os: 1, guild: 0 },
    { name: "A3B", os: 1, guild: 0 },
    { name: "A5C", os: 1, guild: 0 },
    { name: "A4C", os: 2, guild: 0 },
    { name: "B2A", os: 3, guild: 0 },
    { name: "B3A", os: 1, guild: 0 }, //19
    { name: "B4A", os: 1, guild: 0 },
    { name: "B5A", os: 1, guild: 0 },
    { name: "B3B", os: 2, guild: 0 },
    { name: "B4B", os: 2, guild: 0 },
    { name: "B5B", os: 1, guild: 0 },
    { name: "B4C", os: 1, guild: 0 },
    { name: "B5D", os: 1, guild: 0 },
    { name: "C2A", os: 2, guild: 0 },
    { name: "C3A", os: 1, guild: 0 },
    { name: "C4A", os: 2, guild: 0 },
    { name: "C5A", os: 1, guild: 0 },
    { name: "C3B", os: 1, guild: 0 },
    { name: "C4B", os: 2, guild: 0 },
    { name: "C5C", os: 1, guild: 0 },
    { name: "C4C", os: 2, guild: 0 },
    { name: "C5D", os: 1, guild: 0 },
    { name: "D2A", os: 3, guild: 0 },
    { name: "D3A", os: 2, guild: 0 },
    { name: "D4A", os: 1, guild: 0 },
    { name: "D3B", os: 1, guild: 0 },
    { name: "D4B", os: 1, guild: 0 },
    { name: "D5C", os: 1, guild: 0 },
    { name: "D4C", os: 1, guild: 0 },
    { name: "D5C", os: 1, guild: 0 },
    { name: "E2A", os: 2, guild: 0 },
    { name: "E3A", os: 1, guild: 0 },
    { name: "E4A", os: 2, guild: 0 },
    { name: "E5A", os: 1, guild: 0 },
    { name: "E3B", os: 2, guild: 0 },
    { name: "E4B", os: 2, guild: 0 },
    { name: "E5B", os: 1, guild: 0 },
    { name: "E4C", os: 2, guild: 0 },
    { name: "E5D", os: 1, guild: 0 },
    { name: "F2A", os: 3, guild: 0 },
    { name: "F3A", os: 2, guild: 0 },
    { name: "F4A", os: 2, guild: 0 },
    { name: "F5A", os: 1, guild: 0 },
    { name: "F3B", os: 1, guild: 0 },
    { name: "F4B", os: 2, guild: 0 },
    { name: "F5C", os: 1, guild: 0 },
    { name: "F4C", os: 2, guild: 0 },
    { name: "F5D", os: 1, guild: 0 }
];


//************************* IndexedDB ****************************************
const dbName = "foesectors";
const dbVersion = 2; //версия базы
var dbData; //экземпляр объекта db, где мы храним открытую базу данных

function dbSectorsOpen() {
    return new Promise(function (resolve, reject) {
        let dbRequest = window.indexedDB.open(dbName, dbVersion);
        dbRequest.onerror = function () { // база данных не открылась
            LOG("Database failed to open. Please, contact developer.");
        };
        dbRequest.onsuccess = function () { // база открыта - чтение в масив sectors
            dbData = dbRequest.result;
            let dbTransaction = dbData.transaction("sectors");
            for (let i = 1; i < 62; i++) {
                let txnRequest = dbTransaction.objectStore("sectors").get(i);
                txnRequest.onsuccess = (event) => {
                    let myRecord = txnRequest.result;
                    sector[i].name = myRecord.name;
                    sector[i].os = myRecord.osad;
                    sector[i].guild = myRecord.guild;
                    //LOG("loaded :" + sector[i].name + " = " + sector[i].os);
                };
            }
            dbTransaction.oncomplete = function () {
                LOG("Database opened.");
                resolve();
            };
        };
        dbRequest.onupgradeneeded = function (event) { //создание базы при первом запуске или изменении версии
            LOG("Database ( version " + dbVersion + " ) setup...");
            let db = event.target.result;
            if (db.objectStoreNames.contains("sectors")) //если есть хранилище "sectors" (если меняем версию БД)
                db.deleteObjectStore("sectors"); //удалить хранилище "sectors"
            db.createObjectStore("sectors", { autoIncrement: true });
            let dbTransaction = event.target.transaction;
            for (let i = 1; i < 62; i++) {
                let newItem = { name: sector[i].name, osad: sector[i].os, guild: sector[i].guild };
                let txnRequest = dbTransaction.objectStore("sectors").add(newItem);
                txnRequest.onsuccess = function () {
                    //LOG("added :" + i + " = " + sector[i].name);
                };
            }
            dbTransaction.onerror = function () {
                LOG("Transaction error: " + txnRequest.error);
                reject();
            };
            dbTransaction.oncomplete = function () {
                LOG("Database setup finished.");
            };
        };
    });
}

function saveSector(sec) { //запись в базу сектора sec
    var txn = dbData.transaction("sectors", "readwrite");
    let newItem = { name: sector[sec].name, osad: sector[sec].os, guild: sector[sec].guild };
    let request = txn.objectStore("sectors").put(newItem, sec);
    request.onsuccess = function () {
        //LOG("saved : " + sector[sec].name);
    };
    request.onerror = function () {
        LOG("Transaction SAVE error: " + request.error);
    };
    imgClipBoard.style.display = "none";
}


/************************ загрузка изображений карты *************************/
function loadingSceneImages() {
    return new Promise((resolve, reject) => {
        LOG("Loading images ...");
        img_background = new Image();
        img_background.src = "images/background.jpg";
        img_borders = new Image();
        img_borders.src = "images/borders.png";
        let scn = new Image();
        scn.src = "images/scene.png";
        let adr = new Image();
        adr.src = "images/addresses.bmp";
        img_background.onload = ()=>{
            scn.onload = () => {
                LOG("Calculation scene ...");
                bufer_ctx.drawImage(scn, 0, 0, canvas.width, canvas.height);
                data_scene = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
                adr.onload = () => {
                    LOG("Calculation addresses ...");
                    bufer_ctx.drawImage(adr, 0, 0, canvas.width, canvas.height);
                    data_address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
                    calculationSectorsCenters();
                    LOG("Images loaded.");
                    resolve();
                };
            };
        };
    });

    function calculationSectorsCenters() { // поиск центров секторов - для позиционирования названий и заодно - закраска в цвет гильдии
        let maxX = [], minX = [], maxY = [], minY = [];
        for (let s = 1; s < 62; s++) { //перебор всех 61 секторов
            maxX[s] = 0;
            minX[s] = img_width;
            maxY[s] = 0;
            minY[s] = img_height;
        }
        for (let i = 0; i < data_address.data.length; i += 4) {
            let s = data_address.data[i];
            if (s < 62) { //остальное поле - белый цвет
                let y = ~~(i / 4 / img_width);
                let x = i / 4 - y * img_width;
                if (x > maxX[s]) maxX[s] = x;
                if (y > maxY[s]) maxY[s] = y;
                if (x < minX[s]) minX[s] = x;
                if (y < minY[s]) minY[s] = y;
            }
        }
        for (let s = 1; s <= 61; s++) {
            sector[s].x = ~~(Math.abs(maxX[s] + minX[s]) / 2);
            sector[s].y = ~~(Math.abs(maxY[s] + minY[s]) / 2);
            let gld = sector[s].guild;
            if (gld > 0) fillBackground(s, gld_color[gld]); //заливка сектора цветом занятой гильдии
        }
    }
}


/*********************** запуск инициализация *************************/
window.addEventListener("load", () => {

    dbSectorsOpen()
        .then(loadingSceneImages)
        .then(drawScene);

    setTimeout(() => { //debug
        //document.querySelector(".log-box").style.visibility = "hidden"; //скрыть логи
    }, 10000);
});


/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 18px arial";
ctx.shadowOffsetX = 1;
ctx.shadowOffsetY = 1;

function drawScene() {
    //LOG("Scene drawing ...");

    //фон - вулкан
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img_background, 0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";

    //раскраска карты
    bufer_ctx.putImageData(data_scene, 0, 0);
    ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);

    //раскраска границ секторов
    ctx.drawImage(img_borders, 0, 0, canvas.width, canvas.height);

    //подписи штабов
    ctx.shadowBlur = 8;
    ctx.fontStretch = "ultra-condensed";
    for (let s = 1; s < 9; s++) {
        if (selected_guild == s) { //выбранный штаб
            ctx.fillStyle = "lightgoldenrodyellow";
            ctx.shadowColor = "black";
        } else { //просто штаб
            ctx.fillStyle = "black";
            ctx.shadowColor = "lightgoldenrodyellow";
        }
        for (let i = 0; i < 3; i++) //для "усиления" тени
            ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
    }

    //подписи секторов
    ctx.fontStretch = "normal";
    ctx.fillStyle = "black";
    ctx.shadowColor = "lightgoldenrodyellow";
    for (let s = 9; s <= 61; s++) { //сектора
        for (let i = 0; i < 2; i++)//для "усиления" тени
            ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
        let osadki = "";
        for (let i = 0; i < sector[s].os; i++) {
            osadki += "+"; //🞔
        }
        ctx.fillText(osadki, sector[s].x, sector[s].y + 16);
        ctx.fillText(osadki, sector[s].x, sector[s].y + 16);
    }
}


/***************** клик по сектору - выбор гильдии / заливка *********************************/
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    if (e.button != 0) return; //клик левой кнопкой
    if (editor) editModeIndice(false); //закрыть редактор если открыт
    let addr = data_address.data[offset]; //red component = number of address
    if (addr > 62) { //клик не по сектору
        LAB("Выбор гильдии (клик по штабу). Выбор опорника (клик по сектору). Редактор (правая кнопка)");
        return;
    }
    let color;
    if (addr < 9) { //клик по штабу - выбор цвета
        selected_guild = addr;
        helper(e);
    } else {
        if (selected_guild == sector[addr].guild) {   //клик по той же гильдии - отмена выделения
            sector[addr].guild = 0; //помечаем что сектор не занят гильдией
            color = { r: 0, g: 0, b: 0, a: 0 };
        } else {
            sector[addr].guild = selected_guild; //помечаем что сектор занят этой гильдией
            color = gld_color[selected_guild]; //покрасить в выбранный цвет штаба
        }
        fillBackground(addr, color); //покрасить в выбранный цвет штаба
        saveSector(addr);
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


/****************** редактор подписи сектора ****************************/
var editor;
var sel_addr;
var inp_name;
var inp_siege;
canvas.addEventListener("contextmenu", (e) => { //клик правой кнопкой - редактор надписи
    e.preventDefault();
    if (editor) editModeIndice(false); //если уже был открыт любой редактор - то закрыть
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    let addr = data_address.data[offset]; //red component = number of address
    if (addr > 61) return;
    sel_addr = addr;
    if (addr < 9) {
        LAB("Редактироване названия гильдии...")
        editor = document.querySelector(".guild-editor");
        inp_name = document.querySelectorAll(".name-editor")[0];
        inp_name.focus();
    } else if (addr < 62) {
        LAB("Редактироване сектора...")
        editor = document.querySelector(".sector-editor");
        inp_name = document.querySelectorAll(".name-editor")[1];
        inp_siege = document.querySelector(".siege-editor");
        inp_siege.value = sector[addr].os;
        inp_siege.focus();
    }
    editModeIndice(true);
    let dx = sector[addr].x - editor.clientWidth / 2;
    if (dx < 0) dx = 2;
    if (dx + editor.clientWidth > img_width) dx = img_width - editor.clientWidth - 7;
    editor.style.left = dx + 'px'
    editor.style.top = sector[addr].y - 20 + 'px'
    inp_name.value = sector[addr].name;
    if (addr < 9) {
        inp_name.select();
    } else if (addr < 62) {
        inp_siege.select();
    }

    editor.addEventListener("keydown", (event) => {
        if (event.code === "NumpadEnter" || event.code === "Enter") {
            sector[sel_addr].name = inp_name.value;
            if (sel_addr > 8)
                sector[sel_addr].os = inp_siege.value;
            editModeIndice(false)
            drawScene();
            saveSector(sel_addr);
        } else if (event.code === "Escape") {
            editModeIndice(false)
        }
        LAB("...");
    });

});

function editModeIndice(mode) { //затенение фона при входе в редактор
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
        
        let data = [new ClipboardItem({ 'image/png': blob })]; //работает только по протоколу https или localhost !
        navigator.clipboard.write(data).then(
            () => {
                LAB("Карта скопирована в буфер обмена.");
                setTimeout(() => { LAB("Нажмите Ctr+V, чтобы вставить изображение карты (например в telegram). ") }, 2000);
            },
            (err) => {
                LOG("error map copy: " + err);
            },
        );
    });
    btn_copy.setAttribute("disabled",null);
    setTimeout(() => { 
        canvas.classList.remove("anim-copy") 
        btn_copy.removeAttribute("disabled");
    }, 1000);
    
})


/*************** очистить опорники ******************/
const btn_clear = document.querySelector(".btn-clear");
btn_clear.addEventListener("click", () => {
    let result = confirm("Удалить все опорники?");
    if (!result) return;
    container.classList.add("anim-clear");
    for (let i = 9; i < 62; i++) {
        sector[i].guild = 0;
        saveSector(i);
        fillBackground(i, { r: 0, g: 0, b: 0, a: 0 }); //убрать заливку
    };
    drawScene();
    setTimeout(() => {
        container.classList.remove("anim-clear");
    }, 300);
})

/************ вид курсора + подсказки ***********************/
canvas.addEventListener("mousemove", (e) => { helper(e) });
function helper(e) {
    var offset = (e.offsetY * img_width + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
    var addr = data_address.data[offset]; //получить red component = number of address
    if (addr < 9) { //штабы
        container.style.cursor = "pointer";
    } else if (addr < 62) { //сектора
        container.style.cursor = "cell";
    } else { //окружение
        container.style.cursor = "default";
        return;
    }
    if (!selected_guild)
        LAB("Выбрать гильдию (кликнуть по штабу).");
    else
        LAB("Выбор опорников для гильдии " + sector[selected_guild].name + "...");

}


/******************************************************/
function LAB(message) { //вывод в строку состояния
    document.querySelector(".label-box").textContent = message;
}

function LOG(message) { //вывод логов на экран
    const div_log = document.querySelector(".log-box");
    div_log.style.visibility = "visible"; //при первом же логе делаем видимым
    const p_msg = document.createElement("p");
    p_msg.textContent = message;
    div_log.appendChild(p_msg);
    p_msg.scrollIntoView();
}
