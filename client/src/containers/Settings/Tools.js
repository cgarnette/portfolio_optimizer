import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { GAMMA_DATA_POINTS } from '../../util/constants';
import { Button, Input } from 'semantic-ui-react';
import { Slider } from '@material-ui/core';


export const MarketTracker = (props) => {

    const [marketTracker, setMarketTracker] = useState('SPY');
    return (
        <div>
            <h3>Market Tracker</h3>
            <div className="tracker-container">
                <ToggleButtonGroup
                    value={marketTracker}
                    exclusive
                    onChange={(e, selection) => setMarketTracker(selection)}
                    aria-label="text alignment"
                    >
                    <ToggleButton value="SPY" aria-label="left aligned">
                        <span>SPY</span>
                    </ToggleButton>
                    <ToggleButton value="DLN" aria-label="centered">
                        <span>DLN</span>
                    </ToggleButton>
                    <ToggleButton value="SPLV" aria-label="right aligned">
                        <span>SPLV</span>
                    </ToggleButton>
                    <ToggleButton value="EPS" aria-label="justified">
                        <span>EPS</span>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="btn-collection">
                <Button onClick={() => props.previousStage()}>Back</Button>
                <Button onClick={(e) => props.nextStage(e, 'marketTracker', marketTracker)}>Next</Button>
            </div>
        </div>
    );
};

export const GammaSlider = (props) => {
    const [gamma, setGamma] = useState(60)
    return (
        <div className="gamma-container">
            <h3>Gamma</h3>
            <div className="slider-holder">
                <Slider
                    defaultValue={60}
                    getAriaValueText={(value) => (value/100)}
                    aria-labelledby="discrete-slider-always"
                    onChange={(e, value) => setGamma(value)}
                    step={10}
                    marks={GAMMA_DATA_POINTS}
                />
            </div>
            <div className="btn-collection">
                <Button onClick={() => props.previousStage()}>Back</Button>
                <Button onClick={(e) => props.nextStage(e, 'gamma', gamma)}>Next</Button>
            </div>
        </div>
    );
};

export const PortfolioAmount = (props) => {
    const [amount, setAmount] =  useState(props.amount);

    return (
        <div className="gamma-container">
            <h3>Initial Investment Amount</h3>
            <div className="initial-investment-holder">
                <Input value={amount} onChange={(e, value) => setAmount(value.value)}/>
            </div>
            <div className="btn-collection">
                <Button onClick={() => props.previousStage()}>Back</Button>
                <Button onClick={(e) => props.nextStage(e, 'portfolioAmount', amount)}>Next</Button>
            </div>
        </div>
    );
};