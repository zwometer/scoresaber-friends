import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';

@Component({
  selector: 'app-old',
  templateUrl: './old.component.html',
  styleUrls: ['./old.component.css']
})
export class OldComponent implements OnInit, OnDestroy {
  title = 'scoresaber';
  scoreData: ScoreFormat[] = [];
  scoreComparison: ScoreCompare[] = [];
  subscriptionGet: Subscription;
  subscriptionPost: Subscription;
  displayModel = new DisplayModel();

  constructor(private dataService: DataService){}

  ngOnInit(){
    this.subscriptionGet = this.dataService.getData().subscribe((data) => {
      this.scoreData = data["scores"];
      this.scoreData.forEach((score) => {
        score.score = score.score / 100;
        if(
          this.scoreComparison.find((compare) => { //if this score already exists
            if (score.song == compare.song) {
              if (score.player == "ASP") {
                compare.iggyScore = score.score;
              } else if (score.player == "zwometer") {
                compare.jpScore = score.score;
              }
              return true; //hierdurch wird die bruteforce-Suche abgebrochen, wenn was gefunden wurde.
            }
          })
          == undefined) { //if this score does not exist yet
            if (score.player == "ASP") {
              this.scoreComparison.push(new ScoreCompare(score.song, score.score, 0));
            } else if (score.player == "zwometer") {
              this.scoreComparison.push(new ScoreCompare(score.song, 0, score.score));
            }
         }

      });
    });
  }

  updateData(){
    //TODO: evtl noch unsubscriben, falls schon ne subscription da ist.
    this.subscriptionPost = this.dataService.updateData().subscribe((data) => {
    });
  }

  ngOnDestroy(){
    this.subscriptionGet.unsubscribe();
    this.subscriptionPost.unsubscribe();
  }

  sortTable(sortingArg: string) {
    if(sortingArg == "Song") {
      this.scoreComparison.sort(this.sortBySong);
    } else if (sortingArg == "JP") {
      this.scoreComparison.sort(this.sortByJPScore);
    } else if (sortingArg == "Iggy") {
      this.scoreComparison.sort(this.sortByIggyScore);
    }
  }

  sortBySong(a,b){
    if (a.song.localeCompare(b.song) < 0){
      return -1;
    } else {
      return 1;
    }
  }
  sortByJPScore(a,b){
    if (a.jpScore > b.jpScore){
      return -1;
    } else {
      return 1;
    }
  }
  sortByIggyScore(a,b){
    if (a.iggyScore > b.iggyScore){
      return -1;
    } else {
      return 1;
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

export class ScoreCompare{
  song: string;
  iggyScore: number;
  jpScore: number;

  constructor(song: string, iggyScore: number, jpscore: number) {
    this.song = song;
    this.iggyScore = iggyScore;
    this.jpScore = jpscore;
  }
}

export class DisplayModel{
  sortedBy: string;
  hideZeros: boolean;

  constructor(){
    this.sortedBy = "date";
    this.hideZeros = false;
  }
}
