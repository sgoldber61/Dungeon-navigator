import React from 'react';
import PlayerStatsData from '../elements/player_stats_data';
import MainStage from './main_stage';
import PlayerStats from './player_stats';
import {COLS, PIXEL_SIZE} from '../constants';

export default class CompleteGame extends React.Component {
  constructor(props) {
    super(props);

    const playerStats = new PlayerStatsData();

    this.updatePlayerStats = this.updatePlayerStats.bind(this);
    this.contactEnemy = this.contactEnemy.bind(this);
    this.moveUpFloor = this.moveUpFloor.bind(this);
    this.gameComplete = this.gameComplete.bind(this);
    this.specialDisplay = this.specialDisplay.bind(this);
    this.playerDefeated = this.playerDefeated.bind(this);
    this.restartGame = this.restartGame.bind(this);

    this.state = {playerStats: playerStats, floor: 1, stageDisplayQ: true};
  }

  updatePlayerStats(itemData) {
    this.state.playerStats.updatePlayerStats(itemData);
    this.setState({playerStats: this.state.playerStats});
  }

  contactEnemy(enemyData) {
    const returnValue = this.state.playerStats.contactEnemy(enemyData);
    this.setState({playerStats: this.state.playerStats});

    return returnValue;
  }

  moveUpFloor() {
    if (this.state.floor < 2) {
      this.setState({stageDisplayQ: false}, () => {
        this.setState({floor: this.state.floor + 1, stageDisplayQ: true});
      });
    }
    else {
      this.gameComplete();
    }
  }

  playerDefeated() {
    this.setState({stageDisplayQ: false}, () => {
      this.setState({specialState: "death"});
    });
  }

  gameComplete() {
    this.setState({stageDisplayQ: false, specialState: "complete"});
  }

  specialDisplay() {
    if (this.state.specialState === "death") {
      return (
        <div>
          <p>{"Game Lost"}</p>
          <button onClick={this.restartGame}>
            {"Restart"}
          </button>
        </div>
      );
    }
    else if (this.state.specialState === "complete") {
      return (
        <div>
          <p>{"Game Complete"}</p>
          <button onClick={this.restartGame}>
            {"Restart"}
          </button>
        </div>
      );
    }
  }
  
  restartGame() {
    const playerStats = new PlayerStatsData();
    this.setState({playerStats: playerStats, floor: 1, stageDisplayQ: true});
  }
  
  render() {
    console.log(this.state.stageDisplayQ);

    return (
      <div style={{position: "relative"}}>
        {this.state.stageDisplayQ ? <MainStage updatePlayerStats={this.updatePlayerStats} contactEnemy={this.contactEnemy} moveUpFloor={this.moveUpFloor} playerDefeated={this.playerDefeated} floor={this.state.floor} /> : this.specialDisplay()}
        <PlayerStats playerStats={this.state.playerStats} style={{position: "absolute", left: COLS * PIXEL_SIZE, top: 0}} floor={this.state.floor}>
        </PlayerStats>
      </div>
    );
  }
}

