import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import CallerAPI from './CallerAPI';
import * as firebase from "firebase";
import config from './config';
import DatetimepickerRange from './components/DatetimepickerRange';
import moment from 'moment'
import Calendar from "./components/calendar/Calendar"
import 'resize-observer-polyfill/dist/ResizeObserver.global';
import { TimeGridScheduler, classes } from '@remotelock/react-week-scheduler';
import '@remotelock/react-week-scheduler/index.css';

const rangeStrings = [
  ['2019-03-04 00:15', '2019-03-04 01:45'],
  ['2019-03-05 09:00', '2019-03-05 10:30'],
  ['2019-03-06 22:00', '2019-03-06 22:30'],
  ['2019-03-07 01:30', '2019-03-07 03:00'],
  ['2019-03-07 05:30', '2019-03-07 10:00'],
  ['2019-03-08 12:30', '2019-03-08 01:30'],
  ['2019-03-09 22:00', '2019-03-09 23:59'],
];

function handleClick() { alert("handleclick coucou") }


function Week() {
  var currentDate = moment();

  var weekStart = currentDate.clone().startOf('isoweek');

  var days = [];


  for (var i = 0; i <= 6; i++) {
    let dayRange = [];
    dayRange.push(moment(weekStart).add(i, 'days').format("YYYY-MM-DD HH:mm"))
    dayRange.push(moment(weekStart).add(i + 1, 'days').format("YYYY-MM-DD HH:mm"))
    days.push(dayRange)

  }


  console.log('ici', days);

  const defaultSchedule = days.map(day =>
    day.map(dateString => new Date(dateString)),
  );

  console.log("là)", defaultSchedule);
  const [schedule, setSchedule] = useState(defaultSchedule);

  return (
    <div>
      <div
        className="root"
        style={{
          width: "80vw",
          height: "600px",
          "--cell-height": "20px",
          "--cell-width": "50px"
        }}
      >


      </div>
      <button onClick={() => {
        console.log('là ', { schedule })
      }}>
        Update Calendar
        </button>
    </div>

  );
}




class App extends Component {

  constructor() {
    super();
    this.value = [];
    this.refthis = this;
    this.ref = '';
    this.state = {
      loading: false,
      value: [],
      username: null,
      usernamesend: null,
    };

    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(config);
      } catch (err) {
        console.error("Firebase initialization error raised", err.stack)
      }
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ username: event.target.value });
  }

  //you can wrap the setState in a Promise and use async / await as below

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  async handleSubmit(event) {
    //this.setState({});
    event.preventDefault();

    var refthis = this;
    let alertRep;

    //if(this.state.username === this.ref.)
    this.ref.on('value', snapshot => {
      //pour chaque client
      let clientsTab = Object.keys(snapshot.val());
      let i = 0;
      let isfind = false;
      snapshot.forEach((childSnapshot) => {
        if (clientsTab[i] === refthis.state.username) {


          var key = childSnapshot.key;
          var data = childSnapshot.val();
          refthis.value = data;
          refthis.setState({ value: refthis.value });
          alertRep = 'ok ' + refthis.state.username + ' and ' + refthis.state.usernamesend;
          isfind = true;

          refthis.setState({ usernamesend: refthis.state.username, loading: true },
            function () { console.log("setState completed", this.state) }
          );

        } else {

          if (!isfind) {
            alertRep = 'your are not register contact us ';
          }
        }
        i = i + 1;
      });
      this.setState({ loading: true });
      if (alertRep === 'your are not register contact us ') {
        alert(alertRep);
        window.location.reload();
      }


      //console.log("child snap", snapshot.docs()),


    })




  }

  componentWillMount() {
    const ref = firebase.database().ref('clients');
    this.ref = ref;
    /*
    console.log("coucou", ref);
    let mythis = this;

    ref.on('value', snapshot => {
        //pour chaque client
        snapshot.forEach(() => (childSnapshot) => {
          var key = childSnapshot.key;
          var data = childSnapshot.val();
          console.log("key", key, "data", data, 'ok');
          mythis.value = data;
          mythis.setState({ value: mythis.value });
          console.log("icici", mythis.value, mythis.state.value)

        });

      //console.log("child snap", snapshot.docs()),


      console.log("in app ref will mount", this.state, this.state.value)
    })*/

  }

  componentDidMount() {
    console.log("mounted", this.state.loading);

  }

  handler() {
    this.setState({
      someVar: 'some value'
    })
  }

  render() {
    //                 <!--<Week></Week>-->

    const { messages, loading, usernamesend } = this.state;
    if (usernamesend == null) {
      return (<form onSubmit={this.handleSubmit}>
        <label>
          Name:
    <input type="text" value={this.state.username || ''} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>)
    } else {
      if (loading) {

        return (
          <div className="App">
            <Calendar users={this.state} handler={this.handler}
              selectMode={"week"}
            ></Calendar>


            <div>


              {
                <div> <header className="App-header">
                  <h1>Welcome</h1>

                  <CallerAPI users={this.state}></CallerAPI>    </header>
                </div>


              }

            </div>

          </div>

        );
      } else {
        return <div className="App"> In progress</div>

      }
    }
  }
}

export default App;
