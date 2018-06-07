const Repository = require('../../Repository');

module.exports = class extends Repository{
  async getNearby(location){
    const id = typeof location === 'string'? location : location._id;

    return this.hydrateAll(
      this.collection.find({
        $or: [
          {start: id},
          {end: id}
        ]
      })
    );
  }

  async isNearby(from, to){
    const fromId = typeof from === 'string'? from : from._id;
    const toId = typeof to === 'string'? to : to._id;

    return this.collection.count({
      $or: [
        {start: fromId, end: toId},
        {start: toId, end: fromId}
      ]
    }) !== 0;
  }
};
