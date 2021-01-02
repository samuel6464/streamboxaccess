import React from 'react';

class CallerAPI extends React.Component {
  constructor(props) {
    super(props);
    console.log("callerapi props", this.props)
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      olditems: null,
      clientRadio: null
    };

    this.url = "";
    this.audio = new Audio(this.url);


  }

  play = src => {
    // pause permet d'évité la démultiplication des sources audio
    this.audio.pause();

    this.setState({ play: true, pause: false })
    this.url = src;
    this.audio = new Audio(this.url);
    console.log("call play", src);
    this.audio.play();
  }

  pause = () => {
    this.setState({ play: false, pause: true })
    console.log("call stop");
    this.audio.pause();
  }

  fetchOneRadio(radioNum) {
    console.log("heyfetchoneRadio", this.props)
    return new Promise((resolve, reject) => {
      fetch(`http://207.154.224.184/api/nowplaying/${radioNum}`)

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


  componentWillMount() {
    console.log(" apicaller will mount");


    // `messages/${uid}`
    /* console.log("hey", this.props)
     fetch("http://207.154.224.184/api/nowplaying")
       .then(res => res.json(), res => console.log(res))
       .then(
         (result) => {
           this.setState({
             isLoaded: true,
             items: result
           });
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
       )*/
  }

  multifetch() {
    console.log("call multifetch", this.state.items, this.props);
    if (this.state.items !== this.state.olditems) {
      this.state.olditems = this.state.items
      //var obj = JSON.parse(this.props.users.client1.radioid);
      console.log("check props", Object.values(this.props.users));
      this.state.clientRadio = Object.values(this.props.users);
      console.log("coucou ici", this.state);
      let val = Object.values(this.state.clientRadio[1].radioid);
      console.log("val", val);
      val.forEach(element => {
        console.log(element)
        this.fetchOneRadio(element)
      });

    }
  }

  componentDidUpdate() {
    console.log("didi update  apicaller");
    this.multifetch();
    /*this.url = "http://207.154.224.184/radio/8010/radio.mp3?1602030193";
    this.audio = new Audio(this.url);
   
    this.audio.play();*/


  }

  render() {

    console.log("SomeComponent re-rendered!", this.props.users, this.state);

    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Erreur : {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Chargement…</div>;
    } else {
      if (isLoaded) {

        return (


          <ul>

            {items.map(item => (
              <li>
                {item.station.name}

                <div>
                  <button onClick={() => this.play(item.station.listen_url)}>Play</button>
                  <button onClick={() => this.pause()}>Pause</button>
                </div>
              </li>
            ))}
          </ul>
        );
      }
    }
  }
}

export default CallerAPI;