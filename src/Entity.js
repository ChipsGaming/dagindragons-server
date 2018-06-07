const Uuid = require('uuid/v4');

module.exports = class{
  constructor(){
    this._id = Uuid();
  }

  isEqual(entity){
    return this._id === entity._id;
  }
};
