"use strict"; //строгий режим

const img_width = 800; // (px)
const img_height = 600; // (px)
var sector = [null,
    { name: "ГИЛЬДИЯ-1", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_2", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_3", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_4", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_5", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_6", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_7", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_8", os: "", pn: 0 },
    { name: "X1X", os: 1, pn: 10 },
    { name: "A4A", os: 1, pn: 10 }, // 10
    { name: "A3A", os: 1, pn: 10 },
    { name: "A2A", os: 1, pn: 10 },
    { name: "A5B", os: 1, pn: 10 },
    { name: "A4B", os: 1, pn: 10 },
    { name: "A3B", os: 1, pn: 10 },
    { name: "A5C", os: 1, pn: 10 },
    { name: "A4C", os: 1, pn: 10 },
    { name: "B2A", os: 1, pn: 10 },
    { name: "B3A", os: 1, pn: 10 }, //19
    { name: "B4A", os: 1, pn: 10 },
    { name: "B5A", os: 1, pn: 10 },
    { name: "B3B", os: 1, pn: 10 },
    { name: "B4B", os: 1, pn: 10 },
    { name: "B5B", os: 1, pn: 10 },
    { name: "B4C", os: 1, pn: 10 },
    { name: "B5D", os: 1, pn: 10 },
    { name: "C2A", os: 1, pn: 10 },
    { name: "C3A", os: 1, pn: 10 },
    { name: "C4A", os: 1, pn: 10 },
    { name: "C5A", os: 1, pn: 10 },
    { name: "C3B", os: 1, pn: 10 },
    { name: "C4B", os: 1, pn: 10 },
    { name: "C5C", os: 1, pn: 10 },
    { name: "C4C", os: 1, pn: 10 },
    { name: "C5D", os: 1, pn: 10 },
    { name: "D2A", os: 1, pn: 10 },
    { name: "D3A", os: 1, pn: 10 },
    { name: "D4A", os: 1, pn: 10 },
    { name: "D3B", os: 1, pn: 10 },
    { name: "D4B", os: 1, pn: 10 },
    { name: "D5D", os: 1, pn: 10 },
    { name: "D4C", os: 1, pn: 10 },
    { name: "D5C", os: 1, pn: 10 },
    { name: "E2A", os: 1, pn: 10 },
    { name: "E3A", os: 1, pn: 10 },
    { name: "E4A", os: 1, pn: 10 },
    { name: "E5A", os: 1, pn: 10 },
    { name: "E3B", os: 1, pn: 10 },
    { name: "E4B", os: 1, pn: 10 },
    { name: "E5B", os: 1, pn: 10 },
    { name: "E4C", os: 1, pn: 10 },
    { name: "E5C", os: 1, pn: 10 },
    { name: "F2A", os: 1, pn: 10 },
    { name: "F3A", os: 1, pn: 10 },
    { name: "F4A", os: 1, pn: 10 },
    { name: "F5A", os: 1, pn: 10 },
    { name: "F3B", os: 1, pn: 10 },
    { name: "F4B", os: 1, pn: 10 },
    { name: "F5C", os: 1, pn: 10 },
    { name: "F4C", os: 1, pn: 10 },
    { name: "F5D", os: 1, pn: 10 }
];

var container = document.querySelector(".container"); //контейнер сцены
var div_selected_color = document.querySelector(".color"); //выбранный цвет

var canvas = document.querySelector("canvas"); // "экранный" канвас
canvas.height = img_height; //вертикальное разрешение
canvas.width = img_width; //зависит от параметров экрана
var ctx = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.shadowOffsetX = 0.5;
ctx.shadowOffsetY = 0.5;
ctx.shadowBlur = 2;


let bufer_canvas = new OffscreenCanvas(img_width, img_height); //буферный канвас
let bufer_ctx = bufer_canvas.getContext("2d", { willReadFrequently: true });
bufer_canvas.height = img_height; //вертикальное разрешение
bufer_canvas.width = img_width; //зависит от параметров экрана


/*************************************************/
var bgr = new Image();
bgr.src = "images/bg.jpg";

var address;
var mapa = new Image();
mapa.src = "images/mapa.bmp";
mapa.onload = () => {
    bufer_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bufer_ctx.drawImage(mapa, 0, 0, canvas.width, canvas.height);
    address = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
    // поиск центров секторов
    let maxX = [], minX = [], maxY = [], minY = [];
    for (let s = 1; s <= 61; s++) {
        maxX[s] = 0;
        minX[s] = img_width;
        maxY[s] = 0;
        minY[s] = img_height;
    }
    for (let i = 0; i < address.data.length; i += 4) {
        let y = ~~(i / 4 / img_width);
        let x = i / 4 - y * img_width;
        let s = address.data[i];
        if (s < 63 && s > 0) {
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

var paints;
var maps = new Image();
maps.src = "images/maps.png";
maps.onload = () => {
    bufer_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bufer_ctx.drawImage(maps, 0, 0, canvas.width, canvas.height);
    paints = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
}

window.addEventListener("load", () => {
    drawScene();
});

function drawScene() { //отрисовка сцены
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bgr, 0, 0, canvas.width, canvas.height); //фон
    ctx.shadowColor = "rgba(255, 255, 255, 1)";
    bufer_ctx.putImageData(paints, 0, 0);
    ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height); //раскраска из буфера
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(5, 5, 5, 1)";
    for (let s = 1; s < 9; s++) {
        SectorTextPrint(sector[s], sector[s].x, sector[s].y)
    }
    ctx.fillStyle = "black";
    ctx.shadowColor = "rgba(255, 255, 255, 1)";
    for (let s = 9; s <= 61; s++) {
        SectorTextPrint(sector[s], sector[s].x, sector[s].y)
    }
    function SectorTextPrint(txt, x, y) {
        ctx.font = "bold 16px arial";
        ctx.fillText(txt.name, x, y);
        ctx.font = "bold 12px arial";
        ctx.fillText(txt.os, x, y + 16);
    }
}

var selected_color;
container.addEventListener("mousedown", (e) => {
    if (e.button != 0) return; //клик только левой кнопкой
    let color;
    let x = e.offsetX;
    let y = e.offsetY;
    let offset = (y * img_width + x) * 4;
    let r = paints.data[offset + 0];
    let g = paints.data[offset + 1];
    let b = paints.data[offset + 2];
    let addr = address.data[offset]; //red component = number of address
    if (addr < 10) { //клик по штабу - выбор цвета
        div_selected_color.style.backgroundColor = "rgba(" + r + "," + g + "," + b + ",1" + ")";
        selected_color = { r: r, g: g, b: b, a: 155 };
    } else if (addr < 62) {
        if (selected_color.r == r && selected_color.g == g)  //достаточно сравнить два цвета
            color = { r: 0, g: 0, b: 0, a: 0 }; //убрать цвет
        else
            color = selected_color; //покрасить в выбранный цвет штаба
        fillBackground(addr, color); //покрасить в выбранный цвет штаба
        drawScene();
    }

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


container.addEventListener("mousemove", (e) => {
    let x = e.offsetX;
    let y = e.offsetY;
    let offset = (y * img_width + x) * 4;
    let addr = address.data[offset]; //red component = number of address
    if (addr < 10)
        container.style.cursor = "pointer";
    else if (addr < 62)
        container.style.cursor = "cell";
    else
        container.style.cursor = "default";
    let r = paints.data[offset + 0];
    let g = paints.data[offset + 1];
    let b = paints.data[offset + 2];
    if (!addr || addr > 61)
        LAB("клик по штабу - выбрать цвет, клик по сектору - покрасить в цвет штаба")
    else
        LAB(sector[addr].name);
});