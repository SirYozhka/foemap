//*********************** модальное окно *************************/
class ModalFenster {
  m_window = document.querySelector(".modal_window"); //окно
  m_curtain = document.querySelector(".curtain"); //шторка
  m_controls = document.querySelector(".modal_controls"); //блок кнопок
  m_buttons = document.querySelectorAll(".modal_button"); //кнопки
  m_callbacks = []; //при инициализации создать пустые колбэки 
  m_ctrl = false;

  constructor() {
    for (let i = 0; i < this.m_buttons.length; i++) {
      this.m_callbacks.push(()=>{}); //к каждой кнопке цепляем пустой колбэк
      this.m_buttons[i].addEventListener("click", () => { //todo делегировать один листенер (modal_controls) на все кнопки 
        this.close();
        this.m_callbacks[i]();
      });
    }
    this.m_window.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        if (!this.m_ctrl) //если нет блока кнопок - закрыть на ENTER
          this.close();
      }
      e.code === "Escape" && this.close(); //трюк с применением && вместо if (только для примера)
    });
    document.querySelector(".modal_close").addEventListener("click", () => {
      this.close();
    });
    this.m_curtain.addEventListener("click", () => { //клик по штоке - закрыть окно
      this.close();
    });
  }

  open(title, body, buttons) {
    this.m_curtain.style.display = "block"; //блок-шторка на весь экран
    document.querySelector(".modal_title").textContent = title;
    document.querySelector(".modal_body").innerHTML = body; //innerHTML позволяет включить в тело окна активное содержимое
    if (buttons) { //если передан массив кнопок
      this.m_ctrl = true; //блок кнопок включен (если его нет то можно закрыть ENTERом)
      this.m_controls.style.visibility = "visible";
      for (let i = 0; i < buttons.length; i++) {
        this.m_buttons[i].style.display = "block";
        this.m_buttons[i].textContent = buttons[i].name;
        this.m_callbacks[i] = buttons[i].callback;
      }
      for (let i = buttons.length; i < this.m_buttons.length; i++) { //на всяк случай пройти до конца и убрать лишние кнопки
        this.m_buttons[i].style.display = "none";
      }
    } else {
      this.m_ctrl = false;
      this.m_controls.style.visibility = "hidden";
    }
    this.m_window.style.display = "flex";
    this.m_window.setAttribute("tabindex", "0"); //чтобы сработало событие нажатия ENTER
    this.m_window.focus();
  }

  close() {
    this.m_curtain.style.display = "none";
    this.m_window.style.display = "none";
    NOTE("");
  }
}

//export { ModalFenster };