/****************** РЕДАКТОР подписи сектора ****************************/
class FormEditor{
    adr = null;
    
    constructor() {
      this.curtain = document.querySelector(".curtain");
      this.form = document.querySelector(".sector_editor");
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
        if (this.adr < 1 || this.adr > nsec) return; //клик не на секторе
        selected_color=null; //снять выбор штаба
        drawScene(); 
        this.edit();
      });
  
      this.curtain.addEventListener("click",()=>{
        this.hide();
      })
      
      /* необязатльно, т.к. нажатие на ENTER всё равно вызывает событие click на первой <button> */
      this.form.addEventListener("keydown", (e) => { //запись по кнопке ENTER
        if (e.code === "Enter" || e.code === "NumpadEnter") {
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
      NOTE("Редактирование данных сектора: " + defSectors[this.adr].name, "Сохранить - ENTER, выход - ESC.");
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
      curtain.style.display = "none"; //разблокировать холст
      this.form.style.display = "none";  
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
      idb.save_sector(this.adr); //запись в базу    
      sceneFillSector(this.adr); //заливка
      drawScene();
      this.hide();
      NOTE("Данные записаны, карта обновлена.");
    }
  
  } //end class FormEditor
  
  