// запись текста в буфер обмена
export async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    LOG(error.message, RED);
  }
}
