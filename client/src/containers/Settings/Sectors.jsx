import React, { Component } from 'react';
import { Icon, Input, Button, Dropdown } from 'semantic-ui-react';
import * as _ from 'lodash';


class Sectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sectors: props.sectors
        };
    }

    setSectorInput = (text, index) => {
        const { sectors } = this.state;
        sectors[index]['name'] = text;
        this.setState({ sectors });
    };

    setSectorValue = (text, index, bound) => {
        const { sectors } = this.state;
        bound === 'lower' ? sectors[index].bounds.lower = text : sectors[index].bounds.upper = text;
        this.setState({ sectors });
    };

    setSectorCondition = (text, index) => {
        const { sectors } = this.state;
        sectors[index]['condition'] = text;
        this.setState({ sectors });
    };

    addSector = () => {
        const { sectors } = this.state;
        sectors.push({ name: '', condition: '', bounds: { upper: '', lower: '' } });
        this.setState({ sectors });
    };

    removeSector = (index) => {
        const { sectors } = this.state;
        this.setState({
            sectors: sectors.filter((sector, _index) => index !== _index)
        });
    };

    getSectorIcon = (index, length) => {
        if (length < 2) {
            return <Icon name="plus circle" onClick={() => this.addSector()}/>
        } else if (index < length - 1) {
            return <Icon name="minus circle" onClick={() => this.removeSector(index)}/>
        } else {
            return <Icon name="plus circle" onClick={() => this.addSector()}/>
        }
    }

    sectorInput = (index) => {
        const length = this.state.sectors.length;

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
            <Input placeholder="Tech, Healthcare, etc." disabled={this.state.lockSectors} onChange={(e, text) => this.setSectorInput(text.value, index)} value={this.state.sectors[index].name} style={{ marginRight: '1em' }}/>
            <Dropdown search selection value={this.state.sectors[index].condition} placeholder="Weight (NOT Required)" options={options} style={{ marginRight: '1em' }} onChange={(e, text) => this.setSectorCondition(text.value, index)}/>
            {!_.isEmpty(this.state.sectors[index].condition) && <Input 
                placeholder="0 to 1. e.g. 0.4" 
                disabled={this.state.lockSectors} 
                onChange={(e, text) => this.setSectorValue(text.value, index, this.state.sectors[index].condition === '<' ? 'upper' : 'lower')} 
                value={this.state.sectors[index].condition === '<' ? this.state.sectors[index].bounds.upper : this.state.sectors[index].bounds.lower} 
                style={{ marginRight: '1em' }}/>
            }

            {(this.state.sectors[index].condition === '<>') && <>
                <b style={{ marginRight: '1em' }}>AND</b>
                <Input 
                    placeholder="0 to 1. e.g. 0.4" 
                    disabled={this.state.lockSectors} 
                    onChange={(e, text) => this.setSectorValue(text.value, index, 'upper')} 
                    value={this.state.sectors[index].bounds.upper} 
                    style={{ marginRight: '1em' }}/>
            </>}
            {this.getSectorIcon(index, length)}
        </div>  
    };

    render() {
        console.log('sectors', this.state);
        return (
            <div className="sector-section">
                <div className="sector-collection">
                    <h3>Sectors</h3>
                    <div className="sector-container">
                        {this.state.sectors.map( (sector, index) => {
                            return this.sectorInput(index);
                        })}
                    </div>
                    <div className="btn-collection">
                        <Button onClick={() => this.props.previousStage()}>Back</Button>
                        <Button onClick={(e, sectors) => this.props.lockSectors(e, this.state.sectors)}>Next</Button>
                    </div>
                </div>
            </div>
        );
    }

}

export default Sectors;