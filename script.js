"use strict"; //строгий режим

const img_width = 800; // (px)
const img_height = 600; // (px)
const addr = ["", "ШТАБ", "ШТАБ", "ШТАБ", "ШТАБ", "ШТАБ", "ШТАБ", "ШТАБ", "ШТАБ", "",
    "A4A", "A3A", "A2A", "A5B", "A4B", "A3B", "A5C", "A4C", "B2A", "B3A",
    "", "", "", "", "", "", "", "", "", "",
];

var container = document.querySelector(".container"); //контейнер сцены
var div_selected_color = document.querySelector(".color"); //выбранный цвет

var canvas = document.querySelector("canvas"); // "экранный" канвас
var ctx = canvas.getContext("2d");
canvas.height = img_height; //вертикальное разрешение
canvas.width = img_width; //зависит от параметров экрана

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
}

var paints;
var maps = new Image();
maps.src = "images/maps.png";
maps.onload = () => {
    bufer_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bufer_ctx.drawImage(maps, 0, 0, canvas.width, canvas.height);
    paints = bufer_ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgr, 0, 0, canvas.width, canvas.height); //todo  если не успеет загрузиться - то нет фона
    ctx.drawImage(maps, 0, 0, canvas.width, canvas.height);
}

var selected_color;
container.addEventListener("mousedown", (e) => {
    if (e.button != 0) return; //клик только левой кнопкой
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
    } else if (addr < 63)
        if (selected_color.r == r && selected_color.g == g)  //достаточно сравнить два цвета
            fillBackground(addr, { r: 0, g: 0, b: 0, a: 0 }); //убрать цвет
        else
            fillBackground(addr, selected_color); //покрасить в выбранный цвет штаба

    //LOG("" + addr + ": " + selected_color.r + " " + selected_color.g + " " + selected_color.b);
});


function fillBackground(sector, color) {
    for (var i = 0; i < address.data.length; i += 4) {
        if (address.data[i] == sector) {
            paints.data[i + 0] = color.r; //red
            paints.data[i + 1] = color.g; //green
            paints.data[i + 2] = color.b; //blue
            paints.data[i + 3] = color.a; //alfa
        }
    }
    bufer_ctx.putImageData(paints, 0, 0);
    ctx.drawImage(bgr, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(bufer_canvas, 0, 0, canvas.width, canvas.height);
}

container.addEventListener("mousemove", (e) => {
    let x = e.offsetX;
    let y = e.offsetY;
    let offset = (y * img_width + x) * 4;
    let addr = address.data[offset]; //red component = number of address
    if (addr < 10)
        container.style.cursor = "pointer";
    else if (addr < 63)
        container.style.cursor = "cell";
    else
        container.style.cursor = "default";
    let r = paints.data[offset + 0];
    let g = paints.data[offset + 1];
    let b = paints.data[offset + 2];
    LAB(addr + ": x=" + x + " y=" + y + " " + r + " " + g + " " + b);
});