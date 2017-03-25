import React from 'react';
import axios from './axios';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';

export class OnlineNow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        console.log("get request for online pals");
        axios.get('/onlinenow/pals').then((res) => {
            console.log(res.data.pals);
            this.setState({
                pals: res.data.pals
            });
        })
    }
    render() {
        console.log("online now rendering is occuring");
        let pals = this.state.pals;
        console.log(pals);
        if(!pals) {
            return null;
        }
        return (
            <div id="display-of-pals">
                <div id="pal-cards">
                    {pals.map(function(pal) {
                        return (
                            <div className="card-container">
                                <Link className="card" to={`/user/${pal.id}/profile`}>
                                    <div className="pal-images-div">
                                        <img className="pal-images" src={pal.image || "/computer-user.png"} />
                                    </div>
                                    <div className="card-text">
                                        <h4 className="pal-name-title">{`${pal.first_name} ${pal.last_name}`}</h4>
                                        <p className="pal-city">{pal.city}</p>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}
