import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import * as _ from 'lodash';
import './settings.css'
import { validateMappings, validateSectors, configParser, configImport } from '../../util/helpers';
import Tickers from './Tickers';
import Sectors from './Sectors';
import Mapper from './Mapper';
import { MarketTracker, GammaSlider, PortfolioAmount } from './Tools';
import ProgressBar from './ProgressBar';

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tickers: props.tickers || [
                {
                    name: '',
                    condition: '',
                    bounds: {
                        upper: '',
                        lower: ''
                    }
                }
            ],
            sectors: props.sectors || [
                {
                    name: '',
                    condition: '',
                    bounds: {
                        upper: '',
                        lower: ''
                    }
                }
            ],
            mappings: props.mappings || {},
            marketTracker: props.marketTracker || 'SPY',
            gamma: props.gamma || 60,
            progressStage: 0, // Stage 0 thru 5 for each phase of input,
            portfolioAmount: props.portfolioAmount || 10000,
            gettingStarted: props.gettingStarted
        };
    }

    submit = () => {
        const payload = configParser(this.state);
        this.props.setConfig(payload);
        // console.log(payload);
        // console.log("stringified", JSON.stringify(payload))
    };
    
    lockTickers = (e, tickers) => {
        this.setState({ tickers, progressStage: 1 });
    };

    lockSectors = (e, sectors) => {
        this.setState({ sectors, progressStage: 2 });
    };

    lockMappings = (e, mappings) => {
        this.setState({ mappings, progressStage: 3 });
    };

    previousStage = () => {
        this.setState({ progressStage: this.state.progressStage - 1 });
    };

    nextStage = (e, property, value) => {
        console.log("stuff", property, value);
        this.setState({ progressStage: this.state.progressStage + 1, [property]: value });
    };

    getView = () => {
        switch(this.state.progressStage) {
            case 0:
                return <Tickers lockTickers={(e, tickers) => this.lockTickers(e, tickers)} tickers={this.state.tickers}/>
            case 1:
                return <Sectors lockSectors={(e, sectors) => this.lockSectors(e, sectors)} previousStage={() => this.previousStage()} sectors={this.state.sectors}/>
            case 2:
                return <Mapper 
                            lockMappings={(e, mappings) => this.lockMappings(e, mappings)} 
                            mappings={this.state.mappings} tickers={this.state.tickers} 
                            sectors={this.state.sectors} previousStage={() => this.previousStage()}
                        />
            case 3:
                return <MarketTracker previousStage={() => this.previousStage()} nextStage={(e, property, value) => this.nextStage(e, property, value)}/>
            case 4:
                return <GammaSlider previousStage={() => this.previousStage()} nextStage={(e, property, value) => this.nextStage(e, property, value)}/>
            case 5:
                return <PortfolioAmount amount={this.state.portfolioAmount} previousStage={() => this.previousStage()} nextStage={(e, property, value) => this.nextStage(e, property, value)}/>
        }
    };

    onFileChange = event => {
        if (!event.target.files[0]) return false;
        if (!_.includes(event.target.files[0].name, '.json')) return false;

        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const config = JSON.parse(e.target.result)
            this.setState({ ...config.originalConfig, gettingStarted: false });
        };
    };


    Landing = () => {
        return (
            <div className="landing-btn-group">
                <input type="file" onChange={this.onFileChange} className="import-btn" id="import-btn" hidden/>
                <div className="landing-btn-container">
                    <div className="landing-btn">
                        <label for="import-btn" className="import-label">Import</label>
                    </div>
                </div>
                <div className="landing-btn-container">
                    <div className="landing-btn" onClick={() => this.setState({ gettingStarted: false })}>
                        Start From Scratch
                    </div>
                </div>
            </div>
        );
    };



    render() {
        return (
            <div className="settings-container">
                <h1>Configuration</h1>
                {this.state.gettingStarted && <this.Landing/>}
                {!this.state.gettingStarted && <>
                    <ProgressBar stage={this.state.progressStage}/>
                    <div className="section-manager">
                        {this.getView()}
                    </div>
                </>}

                {this.state.progressStage === 6 &&<div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5em' }}>
                    <Button onClick={() => this.submit()}>Submit</Button>
                </div>}
            </div>
        );
    }
}


export default Settings;