module.exports = {
  cards: {
    Mock: {
      name: 'Моб',
      maxLife: 4,
      maxAttack: 2,
      cost: 1,
      abilities: ['Berserk']
    },
    Healer: {
      name: 'Лекарь',
      maxLife: 2,
      maxAttack: 1,
      cost: 1,
      abilities: ['HealAll']
    }
  },
  abilities: {
    Berserk: {
      name: 'Берсерк',
      description: 'наносит дополнительную единицу повреждения цели, но при этом сам теряет единицу здоровья',
      class: require('./Ability/Active/Berserk')
    },
    HealAll: {
      name: 'Врачевание',
      description: 'в начале каждого хода излечивает одну единицу здоровья всем на столе',
      class: require('./Ability/Passive/HealAll')
    }
  }
};
