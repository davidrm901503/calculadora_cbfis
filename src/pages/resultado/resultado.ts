import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import {  HttpClient } from "@angular/common/http";
import { ApiProvider } from '../../providers/api/api';
/**
 * Generated class for the ResultadoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-resultado',
  templateUrl: 'resultado.html',
})
export class ResultadoPage {
 distribuciones : any ;
  cant_cbis:any;
  start_date:any;
  end_date:any;
  emisora:string;
  // Inversión inicial
  precio_i:any;
  monto_i:any;

  // Resultado final
  precio_f:any;
  monto_f:any;
  rendimiento:any;
  rendimiento_p:any;

  // Dividendos recibidos
  monto_d:any;
  dividendos_p:any;

  // Rendimiento final
  rendimiento_t:any;
  rendimiento_tp:any;
  rendimiento_a:any;
  constructor( public load: LoadingController,public navCtrl: NavController, public navParams: NavParams, private http: HttpClient,private api: ApiProvider) {
    this.cant_cbis = this.navParams.get("cbis");
    this.start_date = this.navParams.get("start_date");
    this.end_date = this.navParams.get("end_date");
    this.emisora = this.navParams.get("emisora");
  }

  ionViewDidLoad() {
    this.calcularInversion(this.cant_cbis,this.start_date,this.end_date);
    this.cant_cbis= this.WithCommas(this.cant_cbis);
  }

   calcularInversion(cbis,sd,ed){
    let loading = this.load.create({
      content: "Calculando..."
    });
     loading.present();
    var date_edate = Date.parse(ed);
    var date_sdate = Date.parse(sd);
    if(cbis!=0) {
      var start = Date.parse(sd);
      var end = Date.parse(ed);
      var distribperiodo = 0;
      var div_recibido;

      this.api.distribuciones(this.emisora).then(data => {
        data.forEach(function(item,index){
          var fecha_d=Date.parse(item["fecha"]);
          var fecha_f=Date.parse(item["fechaf"]);
          if( start<=fecha_f && end>=fecha_d ){
              distribperiodo+=item["value"]
          }
        });
        div_recibido = cbis*distribperiodo;
        this.dividendos_p =this.WithCommas(Math.round(distribperiodo * 10000) / 10000);
        this.monto_d =this.WithCommas(Math.round(div_recibido * 10000) / 10000);


        var api_url = "http://marktdaten.irstrat.com/intradate/"+this.emisora+".json?date=";
        var start_url = api_url+this.start_date;
        var end_url = api_url+this.end_date;
        var difFecha= Math.floor((date_edate - date_sdate)/86400000);
        this.http.get(start_url).subscribe(response =>{
          this.precio_i = response["precios"][0].close;
          this.monto_i = (this.precio_i * cbis).toFixed(2);


          this.http.get(end_url).subscribe(response =>{

            var cierre_f = response["precios"][0].close*1;
            var monto_f = cierre_f * cbis;


            var total = parseFloat(div_recibido + (monto_f-this.monto_i));
            var totalp = total/this.monto_i*100;
            var totalAnualizado = (totalp/(difFecha))*360;

            // Resultado final
            this.precio_f=this.WithCommas(cierre_f.toFixed(2));
            this.rendimiento= this.WithCommas((monto_f-this.monto_i).toFixed(2));
            this.rendimiento_p = this.WithCommas(((monto_f/this.monto_i-1)*100).toFixed(2));
            this.monto_f=this.WithCommas(monto_f.toFixed(2));
            this.monto_i = this.WithCommas((this.precio_i * cbis).toFixed(2));

            //rendimiento total
            this.rendimiento_t= this.WithCommas(total.toFixed(2));
            this.rendimiento_tp= this.WithCommas(totalp.toFixed(2));
            this.rendimiento_a= this.WithCommas(totalAnualizado.toFixed((2)));

            loading.dismiss();
          });

        });

        })
        .catch(error => alert(error));

    }
}

WithCommas(x) {

    var numbersString = x.toString();
    if (numbersString.indexOf(".") >=0)
    {
        var arreglo = numbersString.split(".");
        var numberComa= arreglo[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        return numberComa +"."+arreglo[1];
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

}
