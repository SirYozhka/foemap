/************* IndexedDB (хранение данных у клиента) *************************/
class IndexedDB {  
  baze; //экземпляр объекта базы
  empty = false; //база пустая (true будет при первом запуске или изменении версии)

  constructor(name, ver) {
    this.name = name || "foesectors" ; //название базы
    this.version = ver || 1; //версия базы
  }

  open() {
    let newbaze = false;
    return new Promise((resolve, reject) => {
      let dbRequest = window.indexedDB.open(this.name, this.version);

      dbRequest.onupgradeneeded = (event) => { //создание базы при первом запуске ( изменении версии )
        LOG("Database version " + this.version + " setup ...", BLUE);
        let db = event.target.result;
        if (db.objectStoreNames.contains("sectors")) //если есть хранилище "sectors"
          db.deleteObjectStore("sectors"); //проще удалить хранилище "sectors" (и создать заново)
        db.createObjectStore("sectors", {
          keyPath: "id",
          autoIncrement: false,
        });        
        newbaze = true;
      };

      dbRequest.onsuccess = async (event) => {
        this.baze = event.target.result; //this.baze = dbRequest.result //то же самое
        if (newbaze){ //если создание (первый запуск программы или новая версия)
          await this.create_new(); //заполнить нулями
          this.empty = true;
        } else 
          await idb.check_empty(); //проверить если база заполнена нулями
        LOG("Database opened successfully.");
        resolve();
      };

      dbRequest.onerror = () => {
        LOG("ERROR! Database failed to open. Please, contact developer.", RED);
        reject();
      };
    });
  }

  create_new() {
    //заполнение базы нулями
    return new Promise((resolve) => {
      let txn = this.baze.transaction("sectors", "readwrite");
      let store = txn.objectStore("sectors");
      let request;
      for (
        let sec = 0;
        sec <= 61;
        sec++ //универсальный размер 61 сектор (для вулкана 61-й сектор пустой )
      )
        request = store.add({ id: sec, name: "", os: 0, color: 0 }); //заполняем базу нулями
      request.onsuccess = () => {
        LOG("Created new empty database");
        resolve();
      };
    });
  }

  check_empty() {
    return new Promise((resolve) => {
      let txn = this.baze.transaction("sectors", "readonly");
      let store = txn.objectStore("sectors"); //работаем с хранилищем "sectors"
      let request = store.getAll(0);
      request.onsuccess = (e) => {
        let map = e.target.result;
        this.empty = !map[0].os; //проверяем нулевую запись (os содержит номер карты)
        resolve();
      };
    });
  }

  read_to_arr() {
    //считываем базу в arrSector
    return new Promise((resolve) => {
      let txn = this.baze.transaction("sectors", "readonly");
      let store = txn.objectStore("sectors"); //работаем с хранилищем "sectors"
      store.getAll().onsuccess = (e) => {
        arrSector = e.target.result; //считываем сразу всю базу
        LOG("Database loaded.");
        resolve();
      };
    });
  }

  write_to_baze() { //заполняем базу из массива arrSector
    return new Promise((resolve) => {
      let txn = this.baze.transaction("sectors", "readwrite");
      let store = txn.objectStore("sectors");
      let request;
      for (let sec = 0; sec <= 61; sec++) {
        //для вулкана 61-й сектор пустой (размер базы тот же)
        request = store.put(arrSector[sec]); //заполняем базу
      }
      request.onsuccess = () => {
        LOG("Database writed.");
        resolve();
      };
      request.onerror = () => {
        LOG("ERROR writing baze: " + request.error, RED);
      };
    });
  }

  save_sector(sec) { //записать(изменить) запись сектора sec из arrSector[sec]
    var txn = this.baze.transaction("sectors", "readwrite");
    let request = txn.objectStore("sectors").put(arrSector[sec]);    
    request.onerror = () => {
      LOG("ERROR saving: " + request.error, RED);
    };
  }
} //end class IndexedDB
