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
var address;
var paints;
var sector = [null,
    { name: "Гильдия_1", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_2", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_3", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_4", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_5", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_6", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_7", os: "", pn: 0 },
    { name: "ГИЛЬДИЯ_8", os: "", pn: 0 },
    { name: "X1X", os: 3, pn: 10 },
    { name: "A4A", os: 1, pn: 10 }, // 10
    { name: "A3A", os: 1, pn: 10 },
    { name: "A2A", os: 2, pn: 10 },
    { name: "A5B", os: 1, pn: 10 },
    { name: "A4B", os: 1, pn: 10 },
    { name: "A3B", os: 1, pn: 10 },
    { name: "A5C", os: 1, pn: 10 },
    { name: "A4C", os: 1, pn: 10 },
    { name: "B2A", os: 2, pn: 10 },
    { name: "B3A", os: 1, pn: 10 }, //19
    { name: "B4A", os: 1, pn: 10 },
    { name: "B5A", os: 1, pn: 10 },
    { name: "B3B", os: 1, pn: 10 },
    { name: "B4B", os: 1, pn: 10 },
    { name: "B5B", os: 1, pn: 10 },
    { name: "B4C", os: 1, pn: 10 },
    { name: "B5D", os: 1, pn: 10 },
    { name: "C2A", os: 2, pn: 10 },
    { name: "C3A", os: 1, pn: 10 },
    { name: "C4A", os: 1, pn: 10 },
    { name: "C5A", os: 1, pn: 10 },
    { name: "C3B", os: 1, pn: 10 },
    { name: "C4B", os: 1, pn: 10 },
    { name: "C5C", os: 1, pn: 10 },
    { name: "C4C", os: 1, pn: 10 },
    { name: "C5D", os: 1, pn: 10 },
    { name: "D2A", os: 2, pn: 10 },
    { name: "D3A", os: 1, pn: 10 },
    { name: "D4A", os: 1, pn: 10 },
    { name: "D3B", os: 1, pn: 10 },
    { name: "D4B", os: 1, pn: 10 },
    { name: "D5D", os: 1, pn: 10 },
    { name: "D4C", os: 1, pn: 10 },
    { name: "D5C", os: 1, pn: 10 },
    { name: "E2A", os: 2, pn: 10 },
    { name: "E3A", os: 1, pn: 10 },
    { name: "E4A", os: 1, pn: 10 },
    { name: "E5A", os: 1, pn: 10 },
    { name: "E3B", os: 1, pn: 10 },
    { name: "E4B", os: 1, pn: 10 },
    { name: "E5B", os: 1, pn: 10 },
    { name: "E4C", os: 1, pn: 10 },
    { name: "E5C", os: 1, pn: 10 },
    { name: "F2A", os: 2, pn: 10 },
    { name: "F3A", os: 1, pn: 10 },
    { name: "F4A", os: 1, pn: 10 },
    { name: "F5A", os: 1, pn: 10 },
    { name: "F3B", os: 1, pn: 10 },
    { name: "F4B", os: 1, pn: 10 },
    { name: "F5C", os: 1, pn: 10 },
    { name: "F4C", os: 1, pn: 10 },
    { name: "F5D", os: 1, pn: 10 }
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
        SectorTextPrint(sector[s], sector[s].x, sector[s].y)
    }
    ctx.fontStretch = "normal";
    ctx.fillStyle = "black";
    ctx.shadowColor = "white";
    for (let s = 9; s <= 61; s++) { //сектора
        SectorTextPrint(sector[s], sector[s].x, sector[s].y)
    }

    function SectorTextPrint(txt, x, y) {
        ctx.fillText(txt.name, x, y);
        ctx.fillText(txt.os, x, y + 16);
    }
}


container.addEventListener("mousedown", (e) => {
    if (e.button != 0) return; //клик только левой кнопкой
    let color;
    let offset = (e.offsetY * img_width + e.offsetX) * 4;
    let r = paints.data[offset + 0];
    let g = paints.data[offset + 1];
    let b = paints.data[offset + 2];
    let addr = address.data[offset]; //red component = number of address
    if (addr < 9) { //клик по штабу - выбор цвета
        selected_gild = addr;
        selected_color = { r: r, g: g, b: b, a: 205 };
    } else if (addr < 62) {
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


container.addEventListener("mousemove", (e) => {
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

/************************************************/
const btn_copy = document.querySelector(".copy");
btn_copy.addEventListener("click", () => { copyPicture() })

function copyPicture() {
    canvas.toBlob((blob) => {
        let data = [new ClipboardItem({ [blob.type]: blob })];

        navigator.clipboard.write(data).then(
            () => { alert("good"); },
            (err) => { alert("error"); },
        );
    });
};