import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../data.service';
import { Chart } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  title = 'Friendsaber';
  subscriptionGet: Subscription;
  subscriptionPost: Subscription;
  allScores: ScoreArray = new ScoreArray();
  allLatestScores: ScoreArray = new ScoreArray();
  allScoresJP: ScoreArray = new ScoreArray();
  allLatestScoresJP: ScoreArray = new ScoreArray();
  allScoresIggy: ScoreArray = new ScoreArray();
  allLatestScoresIggy: ScoreArray = new ScoreArray();
  allScoresFromBothTeams: ScoreArray = new ScoreArray();
  allLatestScoresFromBothTeams: ScoreArray = new ScoreArray();
  allLatestScoresFromBothTeamsJP: ScoreArray = new ScoreArray();
  topTenPointsJP: ScoreArray = new ScoreArray();
  topTenPercentJP: ScoreArray = new ScoreArray();
  topTenPointsIggy: ScoreArray = new ScoreArray();
  topTenPercentIggy: ScoreArray = new ScoreArray();
  closestLeadPointsJP: ScoreArray = new ScoreArray();
  closestLeadPercentJP: ScoreArray = new ScoreArray();
  closestLeadPointsIggy: ScoreArray = new ScoreArray();
  closestLeadPercentIggy: ScoreArray = new ScoreArray();
  newestScoresJP: ScoreArray = new ScoreArray();
  newestScoresIggy: ScoreArray = new ScoreArray();
  scoresCompared: ComparisonFormat[] = [];
  scoresComparedWithMultipleEntries: ComparisonFormat[] = [];
  latestScoresCompared: ComparisonFormat[] = [];
  comparisonChart: Chart;
  idOfSongToDisplayInGraph;
  songToDrawInGraph: ComparisonFormat;


  constructor(private dataService: DataService){}
  ngOnInit(): void {
    this.subscriptionGet = this.dataService.getData().subscribe((data) => {

      this.allScores.scores = data["scores"];
      Object.assign(this.allLatestScores, this.allScores);
      this.allLatestScores.filterForMostRecentScores();

      Object.assign(this.allScoresJP, this.allScores);
      Object.assign(this.allScoresIggy, this.allScores);
      Object.assign(this.allLatestScoresJP, this.allLatestScores);
      Object.assign(this.allLatestScoresIggy, this.allLatestScores);
      this.allScoresJP.filterForValue('player', 'zwometer', Filters.filterEquals);
      this.allScoresIggy.filterForValue('player', 'ASP', Filters.filterEquals);
      this.allLatestScoresJP.filterForValue('player', 'zwometer', Filters.filterEquals);
      this.allLatestScoresIggy.filterForValue('player', 'ASP', Filters.filterEquals);

      Object.assign(this.allScoresFromBothTeams, this.allScores);
      Object.assign(this.allLatestScoresFromBothTeams, this.allLatestScores);
      this.allScoresFromBothTeams.filterScoresfromBothTeams();
      this.allLatestScoresFromBothTeams.filterScoresfromBothTeams();

      Object.assign(this.newestScoresJP, this.allScoresJP);
      Object.assign(this.newestScoresIggy, this.allScoresIggy);

      Object.assign(this.topTenPointsJP, this.allLatestScoresJP);
      Object.assign(this.topTenPercentJP, this.allLatestScoresJP);
      Object.assign(this.topTenPointsIggy, this.allLatestScoresIggy);
      Object.assign(this.topTenPercentIggy, this.allLatestScoresIggy);
      /*
      Object.assign(this.closestLeadPointsJP, this.allLatestScoresFromBothTeams);
      Object.assign(this.closestLeadPercentJP, this.allLatestScoresFromBothTeams);
      Object.assign(this.closestLeadPointsIggy, this.allLatestScoresFromBothTeams);
      Object.assign(this.closestLeadPercentIggy, this.allLatestScoresFromBothTeams);
      */
      //console.log("Scores insgesamt: " + this.allScores.scores.length);
      //console.log("Scores von beiden Teams: " + this.allScoresFromBothTeams.scores.length);

      this.topTenPointsJP.filterForValue('scoreType', 'points', Filters.filterEquals);
      this.topTenPercentJP.filterForValue('scoreType', 'percent', Filters.filterEquals);
      this.topTenPointsIggy.filterForValue('scoreType', 'points', Filters.filterEquals);
      this.topTenPercentIggy.filterForValue('scoreType', 'percent', Filters.filterEquals);

      this.topTenPointsJP.sortData('score');
      this.topTenPercentJP.sortData('score');
      this.topTenPointsIggy.sortData('score');
      this.topTenPercentIggy.sortData('score');

      this.newestScoresJP.sortData('timestamp');
      this.newestScoresIggy.sortData('timestamp');

      this.allScoresFromBothTeams.scores.forEach((currentScore) => {
        if(!(this.scoresCompared.some(scoreAlreadyStored => scoreAlreadyStored.song == currentScore.song))) {
          this.scoresCompared.push(new ComparisonFormat(currentScore.song, this.allScoresFromBothTeams));
        }
      });

      Object.assign(this.scoresComparedWithMultipleEntries, this.scoresCompared);
      this. scoresComparedWithMultipleEntries = this.scoresComparedWithMultipleEntries.filter((currentSong) => currentSong.getTotalScoreCount() > 1 );

      Object.assign(this.allLatestScoresFromBothTeamsJP, this.allLatestScoresFromBothTeams);
      this.allLatestScoresFromBothTeamsJP.filterForValue('player', 'zwometer', Filters.filterEquals);

      this.allLatestScoresFromBothTeamsJP.scores.forEach((currentScore) => {
        this.latestScoresCompared.push(new ComparisonFormat(currentScore.song, this.allLatestScoresFromBothTeams));
      });
      console.log(this.latestScoresCompared);
      /*
      this.closestLeadPointsJP.sortData('score');
      this.closestLeadPercentJP.sortData('score');
      this.closestLeadPointsIggy.sortData('score');
      this.closestLeadPercentIggy.sortData('score'); //TODO: das ist quatsch. stattdessen: filtern auf aktuellste score und dann auf abstand.
      */

      this.songToDrawInGraph = this.scoresComparedWithMultipleEntries[0];
      this.updateGraph();




    });
  }

  updateData(){
    //TODO: evtl hier noch unsubscriben, falls schon ne subscription da ist.
    this.subscriptionPost = this.dataService.updateData().subscribe((data) => {
    });
  }

  updateAllData(){
    //TODO: evtl hier noch unsubscriben, falls schon ne subscription da ist.
    this.subscriptionPost = this.dataService.updateAllData().subscribe((data) => {
    });
  }

  ngOnDestroy(){
    this.subscriptionGet.unsubscribe();
    this.subscriptionPost.unsubscribe();
  }

  onRowSelect(event){
    let songThatWasClickedOn = event.data.song;
    this.songToDrawInGraph = this.scoresComparedWithMultipleEntries.filter((currentScores) => currentScores.song == songThatWasClickedOn)[0];
    //console.log(this.songToDrawInGraph);
    this.updateGraph();
  }

  updateGraph(){
    let graphScoresIggy = [];
    let graphScoresJP = [];

    let latestDate = new Date(0);
    let earliestDate = new Date();
    let maxDisplayedDateInGraph = new Date();
    maxDisplayedDateInGraph.setDate(maxDisplayedDateInGraph.getDate() + 1);
    let fakeDateInTheFuture = new Date();
    fakeDateInTheFuture.setDate(fakeDateInTheFuture.getDate() + 2);
    let fakeDateInThePast = new Date(0);

    let highestScoreIggy = 0;
    let highestScoreJP = 0;
    let highestScoreOverall;
    let lowestScoreIggy = Number.MAX_VALUE;
    let lowestScoreJP = Number.MAX_VALUE;
    let lowestScoreOverall;
    let lowestToHighestSpread;

    for (let currentScore of this.songToDrawInGraph.scoresIggy.scores) {
      let currentTimeStampAsDate = new Date(currentScore.timestamp);
      graphScoresIggy.push({x: currentTimeStampAsDate, y: currentScore.score});
      if (currentScore.score > highestScoreIggy) { highestScoreIggy = currentScore.score; }
      if (currentScore.score < lowestScoreIggy) { lowestScoreIggy = currentScore.score; }
      if (currentTimeStampAsDate > latestDate) { latestDate = currentTimeStampAsDate; }
      if (currentTimeStampAsDate < earliestDate) { earliestDate = currentTimeStampAsDate; }
    }
    for (let currentScore of this.songToDrawInGraph.scoresJP.scores) {
      let currentTimeStampAsDate = new Date(currentScore.timestamp);
      graphScoresJP.push({x: currentTimeStampAsDate, y: currentScore.score});
      if (currentScore.score > highestScoreJP) { highestScoreJP = currentScore.score; }
      if (currentScore.score < lowestScoreJP) { lowestScoreJP = currentScore.score; }
      if (currentTimeStampAsDate > latestDate) { latestDate = currentTimeStampAsDate; }
      if (currentTimeStampAsDate < earliestDate) { earliestDate = currentTimeStampAsDate; }
    }

    let minDisplayedDateInGraph = new Date(earliestDate);
    minDisplayedDateInGraph.setDate(minDisplayedDateInGraph.getDate() - 3);

    highestScoreOverall = highestScoreJP;
    if (highestScoreIggy > highestScoreOverall) { highestScoreOverall = highestScoreIggy;}
    lowestScoreOverall = lowestScoreJP;
    if (lowestScoreIggy < lowestScoreOverall) { lowestScoreOverall = lowestScoreIggy;}

    lowestToHighestSpread = highestScoreOverall - lowestScoreOverall;
    let minDisplayedScore = Math.round(lowestScoreOverall - (lowestToHighestSpread * 0.1));
    let maxDisplayedScore = Math.round(highestScoreOverall + (lowestToHighestSpread * 0.1));

    graphScoresIggy.push({x: fakeDateInTheFuture, y: highestScoreIggy});
    graphScoresJP.push({x: fakeDateInTheFuture, y: highestScoreJP});
    graphScoresIggy.push({x: fakeDateInThePast, y: 0});
    graphScoresJP.push({x: fakeDateInThePast, y: 0});

    graphScoresIggy.sort((a, b) => a.x - b.x);
    graphScoresJP.sort((a, b) => a.x - b.x)

    if (this.comparisonChart) {
      this.comparisonChart.data.datasets[0].data = graphScoresIggy;
      this.comparisonChart.data.datasets[1].data = graphScoresJP;
      this.comparisonChart.options = {
        maintainAspectRatio: false,
        title:
        {
          text: this.songToDrawInGraph.song,
          fontSize: 18,
          display: true
        },
        spanGaps : true,
        scales: {
          xAxes: [{
            type: 'time',
            ticks: {
              max: maxDisplayedDateInGraph,
              min: minDisplayedDateInGraph,
            }
          }],
          yAxes: [{
            ticks: {
              min: minDisplayedScore,
              max: maxDisplayedScore
            }
          }]
        }
      };

      this.comparisonChart.update();}
    else {
      this.comparisonChart = new Chart('comparisonChartIdentifier', {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Iggy & Lauxpas',
              backgroundColor: "rgba(255,99,132,0.2)",
              borderColor: "rgba(255,99,132,1.0)",
              steppedLine: true,
              data:  graphScoresIggy
            },
            {
              label: 'JP & Babsi',
              backgroundColor: "rgba(132,99,255,0.2)",
              borderColor: "rgba(132,99,255,1.0)",
              steppedLine: true,
              data:  graphScoresJP
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          title:
          {
            text: this.songToDrawInGraph.song,
            fontSize: 18,
            display: true
          },
          spanGaps : true,
          scales: {
            xAxes: [{
              type: 'time',
              ticks: {
                max: maxDisplayedDateInGraph,
                min: minDisplayedDateInGraph,
              }
            }],
            yAxes: [{
              ticks: {
                min: minDisplayedScore,
                max: maxDisplayedScore

              }
            }]
          }
        }
      });
    }
  }
}

export class ScoreFormat{
  timestamp: string;
  player: string;
  song: string;
  score: number;
  modifiers: string;
  scoreType: string;
}

export class ComparisonFormat{
  song: string;
  scoresJP: ScoreArray = new ScoreArray();
  scoresIggy: ScoreArray = new ScoreArray();

  constructor(song: string, originalScoreArray: ScoreArray){
    let scoreArray = new ScoreArray();
    Object.assign(scoreArray, originalScoreArray);
    this.song = song;
    scoreArray.filterForValue('song', song, Filters.filterEquals);
    Object.assign(this.scoresJP, scoreArray);
    Object.assign(this.scoresIggy, scoreArray);
    this.scoresJP.filterForValue('player', 'zwometer', Filters.filterEquals);
    this.scoresIggy.filterForValue('player', 'ASP', Filters.filterEquals);
  }

  getTotalScoreCount() {
    return this.getJPScoreCount() + this.getIggyScoreCount();
  }

  getJPScoreCount() {
    return this.scoresJP.getScoreCount();
  }

  getIggyScoreCount() {
    return this.scoresIggy.getScoreCount();
  }
}

export class ScoreArray{
  scores: ScoreFormat[] = [];

  getScoreCount() {
    return this.scores.length;
  }

  //-------------Filtering---------------------
  filterForValue(columnToFilter: string, valueToFilter, filteringFunction) {
    this.scores = this.scores.filter(filteringFunction(columnToFilter, valueToFilter));
  }

  //THIS NEEDS BOTH TEAMS' SCORES IN THE SET
  filterScoresfromBothTeams() {
    this.sortData('song');
    this.scores = this.scores.filter(Filters.scoresFromBothTeams);
  }

  filterForMostRecentScores() {
    this.sortData('song');
    this.scores = this.scores.filter(Filters.mostRecentScoresOnly);
  }

  //--------------Sorting----------------------
  sortData(sortingArg: string) {
    if(sortingArg == "song") {
      this.scores.sort(Sorters.sortBySong);
    } else if (sortingArg == "player") {
      this.scores.sort(Sorters.sortByPlayer);
    } else if (sortingArg == "score") {
      this.scores.sort(Sorters.sortByScore);
    } else if (sortingArg == "timestamp") {
      this.scores.sort(Sorters.sortByTimestamp);
    }
  }
}


export class Filters{

  static filterEquals(columnToFilter: string, valueToFilter) {
    return function(elementToFilter) {
      return elementToFilter[columnToFilter] == valueToFilter;
    }
  }

  static scoresFromBothTeams(score: ScoreFormat, index: number, scoreArray: ScoreFormat[]){
    let originalIndex = index;
    while(index < scoreArray.length - 1) {
      if (score.song == scoreArray[index + 1].song) {
        if (score.player !== scoreArray[index + 1].player) { return true; } else { index++; }
      } else { break; }
    }
    index = originalIndex;
    while(index > 0) {
      if (score.song == scoreArray[index - 1].song) {
        if (score.player !== scoreArray[index - 1].player) { return true; } else { index--; }
      } else { break; }
    }
    //console.log(score.song + " hat bisher nur eine Score.")
    return false;
  }

  static mostRecentScoresOnly(score: ScoreFormat, index: number, scoreArray: ScoreFormat[]){
    let originalIndex = index;
    while(index < scoreArray.length - 1) {
      if (score.song == scoreArray[index + 1].song) {
        if (score.player == scoreArray[index + 1].player) {
          if (score.timestamp.replace(/\D/g,'') < scoreArray[index + 1].timestamp.replace(/\D/g,'')) {/*console.log(score.song + " hatte eine veraltete score.");*/ return false; } else { index++; }
        } else {index++;}
      } else { break; }
    }
    index = originalIndex;
    while(index > 0) {
      if (score.song == scoreArray[index - 1].song) {
        if (score.player == scoreArray[index - 1].player) {
          if (score.timestamp.replace(/\D/g,'') < scoreArray[index -1].timestamp.replace(/\D/g,'')) {/*console.log(score.song + " hatte eine veraltete score.");*/ return false; } else { index--; }
        } else {index--;}
      } else { break; }
    }
    return true;
  }
}

export class Sorters{
  static sortBySong(a: ScoreFormat, b: ScoreFormat){
    if (a.song.localeCompare(b.song) < 0){
      return -1;
    } else {
      return 1;
    }
  }
  static sortByPlayer(a: ScoreFormat, b: ScoreFormat){
    if (a.player > b.player){
      return -1;
    } else {
      return 1;
    }
  }
  static sortByScore(a: ScoreFormat, b: ScoreFormat){
    if (a.score > b.score){
      return -1;
    } else {
      return 1;
    }
  }
  static sortByTimestamp(a: ScoreFormat, b: ScoreFormat){
    if (a.timestamp.replace(/\D/g,'') > b.timestamp.replace(/\D/g,'')){
      return -1;
    } else {
      return 1;
    }
  }
}
