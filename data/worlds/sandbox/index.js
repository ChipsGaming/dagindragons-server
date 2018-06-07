module.exports = {
  world: {
    locations: [
      {
        name: "Деревня",
        description: "",
        isStart: true,
        startMoney: 5,
        cardStore: [
          {
            prototype: "Mock",
            price: 2
          }
        ],
        abilityStore: [
          {
            prototype: "HealAll",
            price: 1
          }
        ],
        roads: ["Дорога"]
      },
      {
        name: "Дорога",
        description: "",
        roads: ["Прилесок"]
      },
      {
        name: "Прилесок",
        description: "",
        roads: ["Лес"]
      },
      {
        name: "Лес",
        description: ""
      }
    ]
  }
};
