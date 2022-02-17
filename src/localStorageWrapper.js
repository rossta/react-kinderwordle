function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

const canUseLocalStorage = storageAvailable('localStorage');

export function load(key) {
  try {
    if (canUseLocalStorage) {
      const value = window.localStorage.getItem(key);
      return JSON.parse(value);
    }
  } catch {}
}

export function save(key, value) {
  try {
    if (canUseLocalStorage) {
      return window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
}

export function clear() {
  try {
    if (canUseLocalStorage) {
      return window.localStorage.clear();
    }
  } catch {}
}
