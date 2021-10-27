import React, { Component } from 'react';
import { Icon, Input, Button, Dropdown } from 'semantic-ui-react';
import * as _ from 'lodash';


class Tickers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tickers: props.tickers
        };
    }

    setTickerInput = (text, index) => {
        const { tickers } = this.state;
        tickers[index]['name'] = text;
        this.setState({ tickers });
    };

    setTickerValue = (text, index, bound) => {
        const { tickers } = this.state;
        console.log("text", text, index, bound);
        bound === 'lower' ? tickers[index].bounds.lower = text : tickers[index].bounds.upper = text;
        this.setState({ tickers });
    };

    setTickerCondition = (text, index) => {
        const { tickers } = this.state;
        tickers[index]['condition'] = text;
        this.setState({ tickers });
    };

    addTicker = () => {
        const { tickers } = this.state;
        tickers.push({ name: '', condition: '', bounds: { upper: '', lower: '' } });
        console.log("state", this.state);
        this.setState({ tickers });
    };

    removeTicker = (index) => {
        const { tickers } = this.state;
        this.setState({
            tickers: tickers.filter((ticker, _index) => index !== _index)
        });
    };

    getTickerIcon = (index, length) => {
        if (length < 2) {
            return <Icon name="plus circle" onClick={() => this.addTicker()}/>
        } else if (index < length - 1) {
            return <Icon name="minus circle" onClick={() => this.removeTicker(index)}/>
        } else {
            return <Icon name="plus circle" onClick={() => this.addTicker()}/>
        }
    }

    tickerInput = (index) => {
        const length = this.state.tickers.length;

        const options = [
            {
                key: 'Between',
                text: 'Between',
                value: '<>',
            },
            {
                key: 'Less Than',
                text: 'Less Than',
                value: '<',
            },
            {
                key: 'Greater Than',
                text: 'Greater Than',
                value: '>',
            },
            {
                key: 'N/A',
                text: 'N/A',
                value: '',
            },
        ];


        return <div className="input-container">
            <Input placeholder="Ticker" onChange={(e, text) => this.setTickerInput(text.value, index)} value={this.state.tickers[index].name} style={{ marginRight: '1em' }}/>
            <Dropdown search selection value={this.state.tickers[index].condition} placeholder="Weight (NOT Required)" options={options} style={{ marginRight: '1em' }} onChange={(e, text) => this.setTickerCondition(text.value, index)}/>
            {!_.isEmpty(this.state.tickers[index].condition) && <Input 
                placeholder="0 to 1. e.g. 0.4" 
                onChange={(e, text) => this.setTickerValue(text.value, index, this.state.tickers[index].condition === '<' ? 'upper' : 'lower')} 
                value={this.state.tickers[index].condition === '<' ? this.state.tickers[index].bounds.upper : this.state.tickers[index].bounds.lower} 
                style={{ marginRight: '1em' }}/>
            }

            {(this.state.tickers[index].condition === '<>') && <>
                <b style={{ marginRight: '1em' }}>AND</b>
                <Input 
                    placeholder="0 to 1. e.g. 0.4" 
                    onChange={(e, text) => this.setTickerValue(text.value, index, 'upper')} 
                    value={this.state.tickers[index].bounds.upper} 
                    style={{ marginRight: '1em' }}/>
            </>}
            {this.getTickerIcon(index, length)}
        </div>  
    };

    render() {
        return (
            <div className="sector-section">
                <div className="sector-collection">
                    <h3>Tickers</h3>
                    <div className="sector-container">
                        {this.state.tickers.map( (ticker, index) => {
                            return this.tickerInput(index);
                        })}
                    </div>
                    <div className="btn-collection">
                        <Button onClick={(e, tickers) => this.props.lockTickers(e, this.state.tickers)}>Next</Button>
                    </div>
                </div>
            </div>
        );
    }
}




export default Tickers;