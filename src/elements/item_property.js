
class ItemProperty {
  constructor() {
    // random index: either a weapon or a health
    if (Math.random() > 0.5) {
      Object.assign(this, ItemProperty.healthItemsData[Math.floor(Math.random() * ItemProperty.healthItemsData.length)]);
    }
    else {
      Object.assign(this, ItemProperty.weaponItemsData[Math.floor(Math.random() * ItemProperty.weaponItemsData.length)]);
    }
  }
}

ItemProperty.healthItemsData = [{name: "Red Potion", healthValue: 20}, {name: "Green Potion", healthValue: 40}, {name: "Blue Potion", healthValue: 60}];
ItemProperty.healthItemsData = ItemProperty.healthItemsData.map((healthItem) => {return Object.assign(healthItem, {type: "health"});});
ItemProperty.weaponItemsData = ["Iron Shortsword", "Iron Longsword", "Steel Shortsword", "Steel Longsword", "Platinum Shortsword", "Platinum Longsword"];
ItemProperty.weaponItemsData = ItemProperty.weaponItemsData.map((weaponItem, index) => {return {name: weaponItem, weaponLevel: index, type: "weapon"};});

export default ItemProperty;

