export function isNullOrEmpty(value: any) {
  if (typeof value === "undefined" || value === null || value === "" || JSON.stringify(value) === "{}" || JSON.stringify(value) === "[]") return true;
  else return false;
}

// GUID 생성
export function createGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
