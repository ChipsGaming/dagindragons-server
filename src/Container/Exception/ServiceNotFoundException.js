const Exception = require('../../Exception');

module.exports = class extends Exception{
  constructor(name){
    super(`Service "${name}" not found in container`);
  }
};
