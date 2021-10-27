import React, { Component } from 'react';
import { Input, Button, Dropdown } from 'semantic-ui-react';
import * as _ from 'lodash';


class Mapper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mappings: props.mappings
        };
    }

    setMapping = (ticker, text) => {
        const { mappings } = this.state;
        mappings[ticker] = text;
        this.setState({ mappings });
    };

    mappingInput = (ticker) => {
        const sectorOptions = this.props.sectors.map( (sector, index) => {
            return {
                key: sector.name,
                text: sector.name,
                value: sector.name,
            };
           
        });

        return <div className="input-container">
            <Input disabled value={ticker} style={{ marginRight: '1em' }}/>
            <Dropdown placeholder='Sector' value={this.state.mappings[ticker]} onChange={(e, sector) => this.setMapping(ticker, sector.value)} search selection options={sectorOptions} style={{ marginRight: '1em' }}/>
        </div>  
    };

    render() {
        return (
            <div className="mapping-section">
                <div className="mapping-collection">
                    <h3>Mapping</h3>
                    <div className="mapping-container">
                        {this.props.tickers.map( (ticker, index) => {
                            if (!_.isEmpty(ticker)) {
                                return this.mappingInput(ticker.name);
                            }
                        })}
                    </div>
                    <div className="btn-collection">
                        <Button onClick={() => this.props.previousStage()}>Back</Button>
                        <Button onClick={(e, mappings) => this.props.lockMappings(e, this.state.mappings)}>Next</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Mapper;