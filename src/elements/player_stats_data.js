import ItemProperty from './item_property';

export default class PlayerStatsData {
  constructor() {
    this.level = 1;
    this.maxHealth = this.evaluateMaxHealth();
    this.weapon = ItemProperty.weaponItemsData[0];

    this.health = this.maxHealth;
    this.experience = 0;
    this.experienceToLevel = this.evaluateExperienceToLevel();

    this.attack = this.evaluateAttack();
    this.recentMessage = "";
  }

  evaluateMaxHealth() {
    return 100 + 30 * (this.level - 1);
  }

  evaluateExperienceToLevel() {
    return 10000 + 3000 * (this.level);
  }

  collectHealth(itemProperty) {
    this.health += itemProperty.healthValue;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }

    this.recentMessage = "Health obtained: " + itemProperty.name;
  }

  collectWeapon(itemProperty) {
    if (itemProperty.weaponLevel > this.weapon.weaponLevel) {
      this.weapon = itemProperty;
      this.attack = this.evaluateAttack();
      this.recentMessage = "Weapon obtained: " + itemProperty.name;
    }
    else {
      this.recentMessage = "Weapon obtained not better than current";
    }
  }

  contactEnemy(enemyProperty) {
    const result = {};

    this.health -= enemyProperty.attack;
    
    if (this.health <= 0) {
      result.playerDeathQ = true;
      this.health = 0;
    }
    else {
      result.playerDeathQ = false;
    }
    
    enemyProperty.health -= this.attack;
    if (enemyProperty.health <= 0 && result.playerDeathQ == false) {
      this.recentMessage = enemyProperty.name + " defeated";
      this.experience += enemyProperty.experience;
      if (this.experience >= this.experienceToLevel) {
        this.levelUp(1);
      }
      result.enemyDefeatedQ = true;
    }
    else {
      this.recentMessage = enemyProperty.name + " health: " + enemyProperty.health;
      result.enemyDefeatedQ = false;
    }

    return result;
  }

  levelUp(count) {
    // level up... given that we are, in fact, leveling up.
    // update level, maxHealth, health (depending on how much maxHealth increased), experience, experienceToLevel, and attack.
    this.level++;

    const newMaxHealth = this.evaluateMaxHealth();
    this.health = (newMaxHealth - this.maxHealth) + this.health;
    this.maxHealth = newMaxHealth;

    this.experience = this.experience - this.experienceToLevel;
    this.experienceToLevel = this.evaluateExperienceToLevel();
    this.attack = this.evaluateAttack();

    this.recentMessage += (count == 1 ? " Level up!" : " (x" + count + ")");

    if (this.experience >= this.experienceToLevel) {
      this.levelUp(2);
    }
  }

  evaluateAttack() {
    // attack power from weapon and level...
    return 100 + 30 * (this.level - 1) + 50 * this.weapon.weaponLevel;
  }

  updatePlayerStats(itemData) {
    // generic function for picking up an item
    if (itemData.type == "weapon") {
      this.collectWeapon(itemData);
    }
    else if (itemData.type == "health") {
      this.collectHealth(itemData);
    }
  }
}

