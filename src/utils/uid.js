// file: src/utils/uid.js
export const uid = () => {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');
};
