import React, { Component } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "daypilot-pro-react";
import "./CalendarStyles.css";
import moment from 'moment';
//import * as Modal from './daypilot-modal.min.js';
import * as firebase from "firebase";
//import { Modal } from "./daypilot-modal.min.js";
//import { Modal } from "@daypilot/modal";
import { Modal } from "./daypilot-modal.js";

//var Modal = require("./daypilot-modal.min.js");



// TODO

// Firebase event
// where calendar on client??? calendrier -
//                                      lundi mardi mercredi jeudi vendredi samedi dimanche
//                                            - event: horaire  YYYY-MM-DD[T]HH:MM:SS event <id,text,start,end,backColor> where text=radioid


const styles = {
  left: {
    float: "left",
    width: "220px"
  },
  main: {
    marginLeft: "220px"
  }
};

class Calendar extends Component {
  ressourcesElmt = [{ name: "Resource A", id: "A" },
  { name: "Resource B", id: "B" },
  { name: "Resource C", id: "C" },];

  database = firebase.database();
  refWeekcalendar = null;
  dbWeekEventData = [];
  usersref;
  weekcalendarref;
  audio;
  isPlaying = false;


  async snapshotToArray(snapshot) {
    var returnArr = [];
    const arraySnapChild = []
    snapshot.forEach((child) => {
      arraySnapChild.push(child)
      return false
    })
    for await (const child of arraySnapChild) {
      console.log(snapshot.val)
      var item = child.val();
      item.key = child.key;

      returnArr.push(item);
    }
    return returnArr;

  }

  constructor(props) {
    // DATA BASE FIREBASE

    // IN PROGRESS
    super(props);
    // this.state = {}

    this.usersref = firebase.database().ref('clients');




    //FIN BD

    this.state = {
      // item as radio
      // fetch it
      items: [],
      ressources: [],
      error: null,
      isLoaded: false,
      olditems: null,
      clientRadio: null,
      selectValue: "test",
      viewType: "Week",
      durationBarVisible: false,
      timeRangeSelectedHandling: "Enabled",
      onTimeRangeSelected: args => {
        let that = this;
        let dp = this.calendar;


        DayPilot.Modal.prompt("Create a new event:", "Event 1").then(function (modal) {
          dp.clearSelection();
          if (!modal.result) { return; }
          dp.events.add(new DayPilot.Event({
            start: args.start,
            end: args.end,
            id: that.state.events.length + 1,
            text: modal.result,
            idRadio: 1
          }));
          // add to FB

          let weekday = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(args.start).getDay()]

          let refEventDay = that.weekcalendarref.child(
            weekday).child('événements')
          let name = modal.result;
          let event4FB = { 'end': args.end.value, 'id': that.state.events.length + 1, 'idRadio': args.idRadio, 'start': args.start.value, 'text': modal.result, idRadio: 1 }
          let jsonvariable = {};
          jsonvariable[name] = event4FB
          console.log("jsonvariable", jsonvariable, args)
          refEventDay.update(jsonvariable)

        });
      },



      eventDeleteHandling: "Update",
      onEventClick: args => {
        let dp = this.calendar;
        //les whatIneed recuperer on les même id que les event


        //HERE
        var resources = [];
        console.log('coucou items', this.state.items);
        let cpt = 0;
        for (let elmt in this.state.items) {
          console.log("coucou2", this.state.items[cpt])
          resources.push({ name: this.state.items[cpt].station.name, id: this.state.items[cpt].station.id })
          cpt++;
        }

        var form = [

          { name: "Text", id: "text" },
          {
            name: "Resource", id: "resource", options:
              resources
          },
        ];
        //ICIlA
        var data = {
          text: args.e.data.text,

          resource: args.e.data.idRadio
        };

        let that = this;
        var modal = new DayPilot.Modal();


        Modal.form(form, data).then(function (args2) {
          //tOdO Quand on quitte la modal on mets a jour les state.event dispo.......?
          // ajouter ressource = radio...

          // quand je quitte la modal je veux assigné la radio id choisi à une structure representant event + radioId
          console.log("events:", that.state.events, "and", args.e.data, 'and2', data, args2)

          console.log("samtest", args.e.data.start, new Date(args.e.data.start.value), new Date(args.e.data.begin).getDay())
          // j'ai besoin du jour de l'evenement => tODO
          let weekday = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(args.e.data.start.value).getDay()]
          // de id de l'event actuel (!) il faut que tout les evenement soit unique...  id qu'importe le jour unique...
          console.log('weekday', weekday)

          //args.e.data.id

          var e = that.calendar.events.find(args.e.data.id);
          console.log('la', e)
          e.text(args2.result.text); // update the event text
          e.data.idRadio = args2.result.resource
          //e.idRadio(args2.result.resource)
          that.calendar.events.update(e).queue();
          console.log("begin update firebase", that.weekcalendarref.child(
            weekday).child('événements'))
          // puis update BD firebase
          that.weekcalendarref.child(
            weekday).child('événements').once('value', (snapshot) => {
              console.log('snapshot', snapshot, snapshot.key, snapshot.val())

              //MAUVAISE LOgiqUE oN veut regardé dans les evenements courant du calendrier

              //pour chaque evenement du jour je regarde dans l'ensemble des evenement
              snapshot.forEach((eventFB) => {
                console.log(eventFB, eventFB.val().id);

                var e = that.calendar.events.find(eventFB.val().id);
                console.log("heltest", eventFB.val().id, args.e.data.id,)
                if (eventFB.val().id == args.e.data.id) {
                  console.log('refupdater', eventFB.ref, eventFB, 'datafrom', e.data);

                  let event4FB = { 'end': e.data.end, 'id': e.data.id, 'idRadio': e.data.idRadio, 'start': e.data.start, 'text': e.data.text }

                  //WTF NOT WORKING ???? NOW THAT WE CHANGE THING
                  eventFB.ref.update(event4FB)
                }
              })


            })
          console.log("end update firebase")
        })
      },
    };

  }

  setDateZero(date) {
    return date < 10 ? '0' + date : date;
  }


  //end construct 
  // firebase

  async getEventDataDay(dayRef) {
    console.log("dayref:", dayRef, dayRef.key)
    const dayEvents = dayRef.child('événements');
    let dayData = [];
    let that = this;
    let dp = this.calendar;

    dayEvents.once('value').then(
      (snap) => {
        console.log("okbsrSNAP", snap, snap.key, snap.val(), snap.child(), snap.child().val())
        dayData = snap.val();
        //this.snapshotToArray(snap).then(res => dayData = res)
        if (dayData) {
          console.log('day data is RESP: ', dayData, 'parse', JSON.stringify(dayData), JSON.parse(JSON.stringify(dayData)))
          //  dp.events.add(dayData);

        }
        let res = []
        //LA format année jour mois "AAAA-MM-JJT20:40:00"
        for (let elmt in dayData) {
          console.log("yoo", dayData[elmt], dayData[elmt].end, typeof (dayData[elmt].end), dayData[elmt].end.toString())

          let weekday = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

          var now = new Date();
          var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          var lastsunday = new Date(today.setDate(today.getDate() - today.getDay()));
          console.log("azer", lastsunday, weekday.indexOf(dayRef.key))
          console.log("reza", new Date(lastsunday.getTime() + weekday.indexOf(dayRef.key) * (1000 * 60 * 60 * 24)));
          let Day = new Date(lastsunday.getTime() + weekday.indexOf(dayRef.key) * (1000 * 60 * 60 * 24));
          let DayString = Day.getFullYear() + "-" + this.setDateZero((Day.getMonth() + 1)) + "-" + this.setDateZero(Day.getDate()); //replace 1-9 01-09
          //.toISOString().split('T')[0]
          // .toISOString().split('T')[0]
          console.log("actualDay", Day, DayString)
          dayData[elmt].end = DayString + 'T' + dayData[elmt].end.split('T')[1]
          dayData[elmt].start = DayString + 'T' + dayData[elmt].start.split('T')[1]

          // ICI NOUS CHERCHONS le day actuelle
          console.log('dataaa:', dayData[elmt])

          dp.events.add(dayData[elmt]);
          //          var o = JSON.parse(json); // is a javascript object
          //json = JSON.stringify(o);
        }


        //dp.calendar.update()


        // dp.events.add(res);
        // return dayData;
        /*  snap.child().forEach(function (child) {
         let val = child.val()
         console.log("hello", child.key + ": " + Object.keys({ val }));
   
       for (let elmt in Object.keys({ val })) {
            console.log('eeelmt', elmt, dayData, elmt,)
            console.log('eeelmt2', elmt)
   
            let data = {
              id: "1",
              start: "2015-01-01T09:00:00",
              end: "2015-01-01T13:00:00",
              text: "Event 1",
   
            }
   
            let x = new DayPilot.Event(data)
            dp.events.add(x);
          }
          // this.events.push(dayData)
          console.log(dp, dayData, dp.events, 'ICICI');
        })*/
      })




    console.log('day data is: ', dayData)
    if (this.calendar != null && dayData != null) {
      //  this.calendar.events.update(dayData).queue();
    }


    return dayData;



  }


  playPause(e) {
    // mettre a jour dans la base de donnée
    console.log('ok', this.audio, this.calendar, this.calendar.events, this.state.events);
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = !this.isPlaying
    } else {
      this.audio.play();
      this.isPlaying = !this.isPlaying

    }

    console.log('icit', this.audio)
  }

  componentWillMount() {
    console.log(" calendar will mount");

  }

  componentDidUpdate() {




  }





  async componentDidMount() {
    this.multifetch();

    this.calendarPerDay()

    console.log("didi mount  calendar");
    //let fetchArr = this.multifetch();
    console.log("helllo");
    //console.log('lalalala', fetchArr);
    //Promise.all(fetchArr).then((values) => {
    //  console.log('coucocuocu', values);
    //})
    console.log('after', this.dbWeekEventData, this.dbWeekEventData[0]);

    let dateBegin = this.weekNow()
    // load event data

    // let ok = null;
    // let ok = this.getEventDataDay(this.dbWeekEventData[0])
    //console.log("monok", ok)
    console.log("helloo", this.dbWeekEventData[0], typeof (this.dbWeekEventData[0]));
    let that = this;
    this.setState({
      startDate: dateBegin,
      //ok
      events: [

      ]
    });

    this.calendar.onEventDeleted = function (evt) {


      let weekday = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      that.userRef = that.usersref.child(that.props.users.username)
      //weekend calendar
      that.weekcalendarref = that.userRef.child(
        'weekcalendar')
      // remove via ref in firebase todo
      for (let day of weekday) {
        that.weekcalendarref.child(
          day).child('événements').once('value', (snapshot) => {

            //MAUVAISE LOgiqUE oN veut regardé dans les evenements courant du calendrier

            //pour chaque evenement du jour je regarde dans l'ensemble des evenement
            snapshot.forEach((eventFB) => {
              if (eventFB.val().id === evt.e.data.id) {
                console.log('refupdater', eventFB.ref, eventFB, 'datafrom', evt.e.data);


                //WTF NOT WORKING ???? NOW THAT WE CHANGE THING
                eventFB.ref.remove()
              }
            })
          })
      }
    }
  }

  handleDropdownChange(e) {
    this.setState({ selectValue: e.target.value });
  }

  weekNow() {
    var currentDate = moment();




    return currentDate.clone().startOf('isoweek').format('YYYY-MM-DD')

  }

  fetchOneRadioBeta(radioNum) {
    console.log("heyfetchoneRadio", this.props)
    return new Promise((resolve, reject) => {
      fetch(`http://104.131.59.27/api/nowplaying/${radioNum}`)
      this.audio = new Audio(this.url);



      this.audio.play();
      console.log("hello");

    })
  }

  fetchOneRadio(radioNum) {
    console.log("heyfetchoneRadio", this.props)
    return new Promise((resolve, reject) => {
      fetch(`http://104.131.59.27/api/nowplaying/${radioNum}`)

        .then(res => res.json(), res => console.log(res))
        .then(
          (result) => {
            console.log("result onefetch", result)
            this.state.items.push(result)
            this.setState({
              isLoaded: true,
              items: this.state.items
            });
            resolve();
          },
          // Remarque : il est important de traiter les erreurs ici
          // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
          // des exceptions provenant de réels bugs du composant.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    })
  }



  multifetch() {
    console.log("call multifetch", this.state.items, this.props);
    if (this.state.items !== this.state.olditems) {
      this.state.olditems = this.state.items
      //var obj = JSON.parse(this.props.users.client1.radioid);
      console.log("check props", Object.values(this.props.users));
      console.log("stateLlLll", this.state)
      this.state.clientRadio = Object.values(this.props.users);
      console.log("coucou ici", this.props.users, this.state.clientRadio, this.state.clientRadio[1].radioid);
      let val = Object.values(this.state.clientRadio[1].radioid);
      console.log("val", val);
      let promiseArr = [];
      val.forEach(element => {
        console.log(element);
        promiseArr.push(this.fetchOneRadio(element))

      });
      return promiseArr
    }
  }


  async calendarPerDay() {
    this.userRef = this.usersref.child(this.props.users.username)
    //weekend calendar
    this.weekcalendarref = this.userRef.child(
      'weekcalendar')
    const lundi = this.weekcalendarref.child(
      'lundi')

    const mardi = this.weekcalendarref.child(
      'mardi')
    const mercredi = this.weekcalendarref.child(
      'mercredi');
    const jeudi = this.weekcalendarref.child(
      'jeudi')
    const vendredi = this.weekcalendarref.child(
      'vendredi')
    const samedi = this.weekcalendarref.child(
      'samedi')
    const dimanche = this.weekcalendarref.child(
      'dimanche')

    //this.dbWeekEventData.push(lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche)

    // RECUPÉRER EVENEMENT LUNDI

    // TODO essayer de recuperer les noeud fils...

    // aLL TO BE ENDED 
    let datalundi = await this.getEventDataDay(lundi)
    let datamardi = await this.getEventDataDay(mardi)
    let datamercredi = await this.getEventDataDay(mercredi)
    let datajeudi = await this.getEventDataDay(jeudi)
    let datavendredi = await this.getEventDataDay(vendredi)
    let datasamedi = await this.getEventDataDay(samedi)
    let datadimanche = await this.getEventDataDay(dimanche)



    let d = new Date(new DayPilot.Date().getTime());
    console.log("date is", d, d.getTime())
    d.setHours(d.getHours() - 1);
    console.log("date is 2", d, d.getTime())

    // Date(now).setHours(Date(now).getHours() - 1);
    var now = d.getTime()
    let dp = this.calendar;

    console.log('now:', now, this.calendar.events['list'], dp.events.list, this.calendar.events, this.calendar.events['list'], dp.events, dp.events['list']);
    for (let obj of this.calendar.events['list']) {
      if (obj == undefined) {
        continue;
      }
      console.log('event', obj)
      let start = Date.parse(obj.start.value);
      let end = Date.parse(obj.end.value);
      console.log('event', obj, obj.end, obj.start, obj.end.value, end, start, now)

      if (now < end && now > start) {
        //ICITODO
        return new Promise((resolve, reject) => {
          fetch(`http://104.131.59.27/api/nowplaying/${obj.idRadio}`)

            .then(res => res.json(), res => console.log(res))
            .then(
              (result) => {
                console.log("result onefetch before audio", this.audio, result.station.listen_url)
                this.audio = new Audio(result.station.listen_url);
                console.log("result onefetch audio", this.audio)

              });
          resolve();
        },
          // Remarque : il est important de traiter les erreurs ici
          // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
          // des exceptions provenant de réels bugs du composant.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
      }



      //alert("la radio est la radio", obj, obj.idRadio);



    }
    // toDO get current event

    /*this.dbWeekEventData.push(datalundi);
    this.dbWeekEventData.push(datamardi);
    this.dbWeekEventData.push(datamercredi);
    this.dbWeekEventData.push(datajeudi);
    this.dbWeekEventData.push(datavendredi);
    this.dbWeekEventData.push(datasamedi);
    this.dbWeekEventData.push(datadimanche);*/

    /*datamardi, datamercredi, datajeudi, datavendredi, datasamedi, datadimanche*/


    console.log('cc', this.dbWeekEventData[0], datalundi)


  }


  render() {
    var { ...config } = this.state;
    return (
      <div>
        <div>
          <div style={styles.left}>
            <DayPilotNavigator
              selectMode={"week"}
              showMonths={3}
              skipMonths={3}
              onTimeRangeSelected={args => {
                this.setState({
                  startDate: args.day
                });
              }}
            />
          </div>
          <div style={styles.main}>
            <DayPilotCalendar
              {...config}
              ref={component => {
                this.calendar = component && component.control;
              }}
            />
          </div>
        </div>
        <button onClick={this.playPause.bind(this)}>
          Stop audio
 </button>
      </div>
    );
  }
}

export default Calendar;
