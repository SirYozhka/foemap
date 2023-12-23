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

var selected_color;
var selected_gild;
var address;
var scene;
var sector = [null,
    { name: "Гильдия_1", os: 0 },
    { name: "Гильдия_2", os: 0 },
    { name: "Гильдия_3", os: 0 },
    { name: "Гильдия_4", os: 0 },
    { name: "Гильдия_5", os: 0 },
    { name: "Гильдия_6", os: 0 },
    { name: "Гильдия_7", os: 0 },
    { name: "Гильдия_8", os: 0 },
    { name: "X1X", os: 3 },
    { name: "A4A", os: 1 }, // 10
    { name: "A3A", os: 2 },
    { name: "A2A", os: 2 },
    { name: "A5B", os: 1 },
    { name: "A4B", os: 1 },
    { name: "A3B", os: 1 },
    { name: "A5C", os: 1 },
    { name: "A4C", os: 2 },
    { name: "B2A", os: 3 },
    { name: "B3A", os: 1 }, //19
    { name: "B4A", os: 1 },
    { name: "B5A", os: 1 },
    { name: "B3B", os: 2 },
    { name: "B4B", os: 2 },
    { name: "B5B", os: 1 },
    { name: "B4C", os: 1 },
    { name: "B5D", os: 1 },
    { name: "C2A", os: 2 },
    { name: "C3A", os: 1 },
    { name: "C4A", os: 2 },
    { name: "C5A", os: 1 },
    { name: "C3B", os: 1 },
    { name: "C4B", os: 2 },
    { name: "C5C", os: 1 },
    { name: "C4C", os: 2 },
    { name: "C5D", os: 1 },
    { name: "D2A", os: 3 },
    { name: "D3A", os: 2 },
    { name: "D4A", os: 1 },
    { name: "D3B", os: 1 },
    { name: "D4B", os: 1 },
    { name: "D5C", os: 1 },
    { name: "D4C", os: 1 },
    { name: "D5C", os: 1 },
    { name: "E2A", os: 2 },
    { name: "E3A", os: 1 },
    { name: "E4A", os: 2 },
    { name: "E5A", os: 1 },
    { name: "E3B", os: 2 },
    { name: "E4B", os: 2 },
    { name: "E5B", os: 1 },
    { name: "E4C", os: 2 },
    { name: "E5D", os: 1 },
    { name: "F2A", os: 3 },
    { name: "F3A", os: 2 },
    { name: "F4A", os: 2 },
    { name: "F5A", os: 1 },
    { name: "F3B", os: 1 },
    { name: "F4B", os: 2 },
    { name: "F5C", os: 1 },
    { name: "F4C", os: 2 },
    { name: "F5D", os: 1 }
];


//************************* IndexedDB ****************************************
const dbName = "foesectors";
const dbVersion = 1; //версия базы
var dbData; //экземпляр объекта db, где мы сможем хранить открытую базу данных
var SectorsDBOpen = new Promise(function (resolve, reject) {
    let request = window.indexedDB.open(dbName, dbVersion);
    request.onerror = function () { // база данных не открылась успешно
        console.log("Database failed to open");
    };
    request.onsuccess = function (event) { // база открыта - чтение в масив sectors
        dbData = request.result;
        let txn = dbData.transaction("sectors");
        for (let i = 1; i < 62; i++) {
            let oRequest = txn.objectStore("sectors").get(i);
            oRequest.onsuccess = (event) => {
                let myRecord = oRequest.result;
                sector[i].name = myRecord.name;
                sector[i].os = myRecord.osad;
                //LOG("loaded :" + sector[i].name + " = " + sector[i].os);
            };
        }
        LOG("Database opened successfully");
        resolve();
    };
    request.onupgradeneeded = function (event) { //создание локальной базы при первом запуске
        LOG("Database setup. dbVersion: " + dbVersion);
        let dbData = event.target.result;
        dbData.createObjectStore("sectors", { autoIncrement: true });
        let txn = event.target.transaction;
        for (let i = 1; i < 62; i++) {
            let newItem = { name: sector[i].name, osad: sector[i].os };
            let request = txn.objectStore("sectors").add(newItem);
            request.onsuccess = function () {
                //LOG("added :" + i + " = " + sector[i].name);
            };
            request.onerror = function () {
                LOG("Transaction ADD error: " + request.error);
            };
        }
        txn.oncomplete = function () {
            LOG("Database setup finished.");
        };
    };
});

function saveSector(i) {
    var txn = dbData.transaction("sectors", "readwrite");
    let newItem = { name: sector[i].name, osad: sector[i].os };
    let request = txn.objectStore("sectors").put(newItem, i);
    request.onsuccess = function () {
        LOG("saved : " + sector[i].name);
    };
    request.onerror = function () {
        LOG("Transaction SAVE error: " + request.error);
    };

}

/************************ инициализация *************************/
var img_background;
var loadImages = new Promise(function (resolve, reject) {
    img_background = new Image();
    img_background.src = "images/background.jpg";
    let scene = new Image();
    scene.src = "images/scene.png";
    let addresses = new Image();
    addresses.src = "images/addresses.bmp";
    resolve({ scene: scene, addresses: addresses });
});

window.addEventListener("load", () => {
    loadImages.then((res) => {
        bufer_ctx.drawImage(res.scene, 0, 0, canvas.width, canvas.height);
        scene = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
        bufer_ctx.drawImage(res.addresses, 0, 0, canvas.width, canvas.height);
        address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height); //then

        // поиск центров секторов - для позиционирования названий
        let maxX = [], minX = [], maxY = [], minY = [];
        for (let s = 1; s < 62; s++) { //перебор всех 61 секторов
            maxX[s] = 0;
            minX[s] = img_width;
            maxY[s] = 0;
            minY[s] = img_height;
        }
        for (let i = 0; i < address.data.length; i += 4) {
            let s = address.data[i];
            if (s < 62) {
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
        }

        SectorsDBOpen.then((res) => {
            drawScene();
        }, () => {
            alert("Hren wam!")
        }
        );
    });
});

/************************ отрисовка сцены *********************************/
ctx.textAlign = "center";
ctx.font = "bold 18px arial";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.shadowBlur = 8;
function drawScene() {
    //фон
    ctx.drawImage(img_background, 0, 0, canvas.width, canvas.height);
    //раскраска карты
    bufer_ctx.putImageData(scene, 0, 0);
    ctx.shadowColor = "#ffffbb";
    ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);
    //подписи штабов
    ctx.fontStretch = "ultra-condensed";
    for (let s = 1; s < 9; s++) {
        if (selected_gild == s) {
            ctx.fillStyle = "white";
            ctx.shadowColor = "black";
        } else {
            ctx.fillStyle = "black";
            ctx.shadowColor = "white";
        }
        ctx.shadowBlur = 8;
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
    }
    //подписи секторов
    ctx.fontStretch = "normal";
    ctx.fillStyle = "black";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 3;
    for (let s = 9; s <= 61; s++) { //сектора
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
        ctx.fillText(sector[s].os, sector[s].x, sector[s].y + 16);
    }

}


/************************ заливка ************************************/
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    if (e.button != 0) return; //клик левой кнопкой
    let color;
    let r = scene.data[offset + 0];
    let g = scene.data[offset + 1];
    let b = scene.data[offset + 2];
    let addr = address.data[offset]; //red component = number of address
    if (addr < 9) { //клик по штабу - выбор цвета
        selected_gild = addr;
        selected_color = { r: r, g: g, b: b, a: 200 };
    } else if (addr < 62 && selected_color) {
        if (selected_color.r == r && selected_color.g == g)  //клик по тому же цвету (достаточно сравнить два цвета)
            color = { r: 0, g: 0, b: 0, a: 0 }; //убрать цвет
        else
            color = selected_color; //покрасить в выбранный цвет штаба
        fillBackground(addr, color); //покрасить в выбранный цвет штаба
    } else {
        LAB("клик по штабу - выбрать цвет, клик по сектору - покрасить в цвет штаба");
    }
    drawScene();
});

function fillBackground(sec, color) {
    for (var i = 0; i < address.data.length; i += 4) {
        if (address.data[i] == sec) {
            scene.data[i + 0] = color.r; //red
            scene.data[i + 1] = color.g; //green
            scene.data[i + 2] = color.b; //blue
            scene.data[i + 3] = color.a; //alfa
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
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    let addr = address.data[offset]; //red component = number of address
    if (addr > 61) return;
    sel_addr = addr;
    if (editor)
        editor.removeEventListener("keydown", handler, false);
    if (addr < 9) {
        editor = document.querySelector(".guild-editor");
        inp_name = document.querySelectorAll(".name-editor")[0];
    } else if (addr < 62) {
        editor = document.querySelector(".sector-editor");
        inp_name = document.querySelectorAll(".name-editor")[1];
        inp_siege = document.querySelector(".siege-editor");
    }
    document.querySelector(".guild-editor").style.visibility = "hidden";
    document.querySelector(".sector-editor").style.visibility = "hidden";
    editor.style.visibility = "visible";
    let dx = sector[addr].x - editor.clientWidth / 2;
    if (dx < 0) dx = 2;
    if (dx + editor.clientWidth > img_width) dx = img_width - editor.clientWidth - 7;
    editor.style.left = dx + 'px'
    editor.style.top = sector[addr].y - 20 + 'px'
    inp_name.value = sector[addr].name;
    if (addr < 9) {
        inp_name.focus();
        inp_name.select();
    } else if (addr < 62) {
        inp_siege.value = sector[addr].os;
        inp_siege.focus();
        inp_siege.select();
    }
});

container.addEventListener("keydown", (e) => handler(e));
function handler(event) {
    if (event.code === "NumpadEnter" || event.code === "Enter") {
        sector[sel_addr].name = inp_name.value;
        if (sel_addr > 8)
            sector[sel_addr].os = inp_siege.value;
        editor.style.visibility = "hidden";
        drawScene();
        saveSector(sel_addr);
    } else if (event.code === "Escape") {
        editor.style.visibility = "hidden";
    }
}




/*************** копироваине карты в буфер обмена ******************/
const btn_copy = document.querySelector(".btn-copy");
btn_copy.addEventListener("click", () => { copyPicture() })

function copyPicture() { //todo разобраться
    canvas.toBlob((blob) => {
        let data = [new ClipboardItem({ [blob.type]: blob })];
        navigator.clipboard.write(data).then(
            () => { alert("карта скопирована в буфер обмена"); },
            (err) => { alert("error map copy: " + err); },
        );
    });
};


/************ указатель сектора в строку состояния + вид курсора ***********************/
canvas.addEventListener("mousemove", (e) => { showName(e) });
function showName(e) {
    var offset = (e.offsetY * img_width + e.offsetX) * 4; //todo - если другие размеры container нужен коэффициент
    var addr = address.data[offset]; //получить red component = number of address
    if (addr < 10) //штабы
        container.style.cursor = "pointer";
    else if (addr < 62) //сектора
        container.style.cursor = "cell";
    else { //окружение
        container.style.cursor = "default";
        return;
    }
    LAB(sector[addr].name);
}

function LAB(message) { //вывод в строку состояния
    document.querySelector(".label-box").textContent = message;
}
