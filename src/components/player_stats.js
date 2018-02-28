import React from 'react';

const PlayerStats = (props) => {
  // props: playerStats, floor, style
  /*
    floor
    level
    maxHealth
    weapon
    health
    experience
    experienceToLevel
    attack
    recentMessage
  */

  return (
    <div style={props.style}>
      <p>{"Floor " + props.floor}</p>
      <p>{"Level " + props.playerStats.level}</p>
      <p>{"Health " + props.playerStats.health + "/" + props.playerStats.maxHealth}</p>
      <p>{"Experience " + props.playerStats.experience + "/" + props.playerStats.experienceToLevel}</p>
      <p>{"Weapon " + props.playerStats.weapon.name}</p>
      <p>{"Attack " + props.playerStats.attack}</p>
      <p>{props.playerStats.recentMessage}</p>
    </div>
  );
}

export default PlayerStats;
