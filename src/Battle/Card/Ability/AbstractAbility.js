module.exports = class{
  constructor(_id, name, description, sourceCard){
    this._id = _id;
    this.sourceCard = sourceCard;
    this.name = name;
    this.description = description;
  }
};
