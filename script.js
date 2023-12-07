"use strict"; //строгий режим


const img_width = 800; // (px)
const img_height = 600; // (px)

const container = document.querySelector(".container"); //контейнер сцены
const div_selected_color = document.querySelector(".color"); //выбранный цвет

const canvas = document.querySelector("canvas"); // "экранный" канвас
const ctx = canvas.getContext("2d", { alpha: false });
canvas.height = img_height; //вертикальное разрешение
canvas.width = img_width; //зависит от параметров экрана
ctx.textAlign = "center";
ctx.font = "bold 18px arial";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.shadowBlur = 8;

const bufer_canvas = new OffscreenCanvas(img_width, img_height); //буферный канвас
const bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = img_height; //вертикальное разрешение
bufer_canvas.width = img_width; //зависит от параметров экрана

var selected_color;
var selected_gild;
var selected_sector;
var address;
var paints;
var sector = [null,
    { name: "Гильдия_1" },
    { name: "Гильдия_2" },
    { name: "Гильдия_3" },
    { name: "Гильдия_4" },
    { name: "Гильдия_5" },
    { name: "Гильдия_6" },
    { name: "Гильдия_7" },
    { name: "Гильдия_8" },
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

/*************************************************/
window.addEventListener("load", () => {
    bufer_ctx.drawImage(document.getElementById("sectors"), 0, 0, canvas.width, canvas.height);
    paints = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);

    bufer_ctx.drawImage(document.getElementById("addresses"), 0, 0, canvas.width, canvas.height);
    address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);

    scanAddressesXY();
    drawScene();

    function scanAddressesXY() { // поиск центров секторов - для позиционирования названий
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
    }

});

function drawScene() { //отрисовка сцены
    ctx.drawImage(document.getElementById("background"), 0, 0, canvas.width, canvas.height); //фон
    bufer_ctx.putImageData(paints, 0, 0);
    ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height); //раскраска из буфера
    //надписи секторов
    ctx.fontStretch = "ultra-condensed";
    for (let s = 1; s < 9; s++) { //штабы гильдий
        if (selected_gild == s) {
            ctx.fillStyle = "white";
            ctx.shadowColor = "black";
        } else {
            ctx.fillStyle = "black";
            ctx.shadowColor = "white";
        }
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
    }
    ctx.fontStretch = "normal";
    ctx.fillStyle = "black";
    ctx.shadowColor = "white";
    for (let s = 9; s <= 61; s++) { //сектора
        ctx.fillText(sector[s].name, sector[s].x, sector[s].y);
        ctx.fillText(sector[s].os, sector[s].x, sector[s].y + 16);
    }

}


/************************ заливка ************************************/
canvas.addEventListener("mousedown", (e) => { //клик левой кнопкой - заливка
    e.preventDefault();
    div_map_editor.style.visibility = "hidden";
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    if (e.button != 0) return; //клик левой кнопкой
    let color;
    let r = paints.data[offset + 0];
    let g = paints.data[offset + 1];
    let b = paints.data[offset + 2];
    let addr = address.data[offset]; //red component = number of address
    if (addr < 9) { //клик по штабу - выбор цвета
        selected_gild = addr;
        selected_color = { r: r, g: g, b: b, a: 205 };
    } else if (addr < 62 && selected_color) {
        if (selected_color.r == r && selected_color.g == g)  //достаточно сравнить два цвета
            color = { r: 0, g: 0, b: 0, a: 0 }; //убрать цвет
        else
            color = selected_color; //покрасить в выбранный цвет штаба
        fillBackground(addr, color); //покрасить в выбранный цвет штаба
    } else {
        LAB("клик по штабу - выбрать цвет, клик по сектору - покрасить в цвет штаба");
    }
    drawScene();

    function fillBackground(sec, color) {
        for (var i = 0; i < address.data.length; i += 4) {
            if (address.data[i] == sec) {
                paints.data[i + 0] = color.r; //red
                paints.data[i + 1] = color.g; //green
                paints.data[i + 2] = color.b; //blue
                paints.data[i + 3] = color.a; //alfa
            }
        }
    }
});


/****************** редактор подписи сектора ****************************/
var div_guild_editor = document.querySelector(".guild-editor");
var inp_guild_editor = document.getElementById("guild-field");
canvas.addEventListener("contextmenu", (e) => { //клик правой кнопкой - редактор надписи
    e.preventDefault();
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    let addr = address.data[offset]; //red component = number of address
    if (addr < 9) {
        selected_sector = addr;
        //div_map_editor.style.visibility = "hidden";
        div_guild_editor.style.visibility = "visible";
        let dx = sector[addr].x - 75;
        if (dx < 0) dx = 2;
        if (dx + 150 > img_width) dx = img_width - 157;
        div_guild_editor.style.left = dx + 'px'
        div_guild_editor.style.top = sector[addr].y - 20 + 'px'
        inp_guild_editor.value = sector[addr].name;
        inp_guild_editor.focus();
        inp_guild_editor.select();
    }


    inp_guild_editor.addEventListener("keypress", function handler(event) {
        console.log(event.code);
        if (event.code === "NumpadEnter" || event.code === "Enter") {
            event.preventDefault();
            sector[selected_sector].name = inp_guild_editor.value;
            div_guild_editor.style.visibility = "hidden";
            drawScene();
        }
        //        inp_guild_editor.removeEventListener('keypress', handler, true)
        event.stopPropagation()
    });

});





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
canvas.addEventListener("mousemove", (e) => {
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
});

function LAB(message) { //вывод в строку состояния
    document.querySelector(".label-box").textContent = message;
}


/************** form map-editor *********************************/
const btn_edit = document.querySelector(".btn-edit");
btn_edit.addEventListener("click", () => { editMapSettings() })

const div_map_editor = document.querySelector(".map-editor");
const btn_save = document.querySelector(".btn-save");
btn_save.addEventListener("click", (e) => { saveMapSettings(e) })

function editMapSettings() {
    LAB("реадактороваине секторов в процессе разработки");
    div_map_editor.style.visibility = "visible";
    LOG("редактирование секторов карты");
}

function saveMapSettings(e) {
    e.preventDefault();
    div_map_editor.style.visibility = "hidden";
    LOG("сохранение секторов карты в localStorage");
}
