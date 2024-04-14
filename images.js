
function SaveCanvasToFile(cnvs) {
  return new Promise(async (resolve, reject) => {
    let filehandler;
    const options = {
      //startIn: 'desktop',  //указание папки на компе (desktop - рабочий стол)
      suggestedName: "mapsnapshot",
      types: [
        {
          description: "Image Files",
          accept: { "image/jpeg": ".jpg" },
        },
      ],
    };

    try {
      filehandler = await window.showSaveFilePicker(options); //получение дескриптора файла
      cnvs.toBlob(async (blob) => {
        const writable = await filehandler.createWritable();
        await writable.write(blob);
        await writable.close();
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

//export {SaveCanvasToFile};