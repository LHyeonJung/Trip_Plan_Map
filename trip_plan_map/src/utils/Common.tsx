export function isNullOrEmpty(value: any) {
  if (typeof value === "undefined" || value === null || value === "" || JSON.stringify(value) === "{}" || JSON.stringify(value) === "[]") return true;
  else return false;
}
