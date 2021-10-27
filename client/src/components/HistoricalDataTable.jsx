import React from 'react';
import { Table, Button, Modal, Icon } from 'semantic-ui-react';
import { ResponsivePie } from '@nivo/pie'

const MasterTable = ({ masterData }) => {

    //add the option to filter out which columns are displayed

    const keys = Object.keys(masterData);
    const cols = Object.keys(masterData[keys[0]]);

    const tableContent = keys.map(key => {
        const dataRow = cols.map(col => {
            return <Table.Cell>{masterData[key][col]}</Table.Cell>
        });
        return <Table.Row><Table.Cell><b>{key}</b></Table.Cell>{dataRow}</Table.Row>
    });

    const Headers = cols.map(header => <Table.HeaderCell>{header}</Table.HeaderCell>)
    
    return <Table>
        <Table.Header>
            <Table.HeaderCell>Ticker</Table.HeaderCell>
            {Headers}
        </Table.Header>

        <Table.Body>
            {tableContent}
        </Table.Body>
    </Table>

};

const AllocationTable = ({ data }) => {
    const headers = <Table.Header>
        <Table.HeaderCell>Ticker</Table.HeaderCell>
        <Table.HeaderCell>Purchase Quantity</Table.HeaderCell>
        <Table.HeaderCell>Price</Table.HeaderCell>
        <Table.HeaderCell>Total Investment</Table.HeaderCell>
    </Table.Header>

    return <Table>
        {headers}

        <Table.Body>
            { Object.keys(data).map(ticker => {
                return <Table.Row>
                        <Table.Cell>{ticker}</Table.Cell>
                        <Table.Cell>{data[ticker]['quantity']}</Table.Cell>
                        <Table.Cell>{data[ticker]['price']}</Table.Cell>
                        <Table.Cell>{data[ticker]['Total Investment']}</Table.Cell>
                    </Table.Row>
            })}
        </Table.Body>
    </Table>

};

const TriggerComponent = ({ text, refresh }) => {
    return (
        <div className="trigger-container">
            <div className="trigger-component top" onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                refresh();
            }}>
                <Icon name="refresh"/>
            </div>
            <div className="trigger-component">
                <h4>{text}</h4>
            </div>
            <div className="trigger-component bottom">
                <Icon name="magnify"/>
            </div>
        </div>
    );
};



const TableModal = ({ children, header, refresh }) => {
  const [open, setOpen] = React.useState(false)

    return (
        <Modal
            closeIcon
            open={open}
            trigger={<div><TriggerComponent text={header} refresh={refresh}/></div>}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            style={{ minWidth: '95%'}}
            >
            <Modal.Header className="modal-header">{header}</Modal.Header>
            <Modal.Content>
                <div className="modal-table-container">
                    {children}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
};

const WeightChart = ({ data }) => {
    const fixedData = Object.keys(data).map( (ticker, index) => {
        return {
            id: ticker,
            label: ticker,
            value: data[ticker],
            color: `hsl(${172 + (index * 5)}, 70%, 50%)`
        };
    });

    return (
            <ResponsivePie
            data={fixedData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#333333"
            radialLabelsLinkColor={{ from: 'color' }}
            enableSliceLabels={false}
            sliceLabelsSkipAngle={10}
            sliceLabelsTextColor="#333333"
        />
    );
};

export { MasterTable, AllocationTable, TableModal, WeightChart };