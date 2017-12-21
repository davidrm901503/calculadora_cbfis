import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ResultadoPage } from '../resultado/resultado';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  cbis:number;
  start_date:any;
  end_date:any;
  emisora:string;
  constructor(public navCtrl: NavController) {

  }
  calcular(){
   this.navCtrl.push(ResultadoPage,{
    cbis:this.cbis,
    start_date:this.start_date,
    end_date:this.end_date,
    emisora:this.emisora
   });
  }

}
