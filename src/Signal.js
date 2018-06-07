module.exports = class{
  constructor(){
    this.observers = new Set;
  }

  observe(observer){
    this.observers.add(observer);
  }

  forget(observer){
    this.observers.delete(observer);
  }

  notify(data){
    this.observers.forEach(
      (observer) => observer(data)
    );
  }
};
