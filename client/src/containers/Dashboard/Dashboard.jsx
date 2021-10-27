import React, { Component } from 'react';
import { 
    getMasterDataTable, 
    getWeightData, 
    getProjectedPerformance, 
    getSectorData, 
    getPastPriceChart, 
    getReturnComparisonChart, 
    getRiskAnalysisChart, 
    getOrderQuantities, 
    getCovarianceChart,
    setData
} from '../../util/apiService';
import { BACKEND_URL } from '../../util/constants';
import { TableModal, MasterTable, AllocationTable, WeightChart } from '../../components/HistoricalDataTable'; 
import Settings from '../Settings';
import * as _ from 'lodash';
import { Icon } from 'semantic-ui-react';
import './styles.css'



class Dashboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            masterData: {},
            weightData: {},
            projectedPerformanceData: {},
            pastPriceChart: '',
            sectorAllocData: {},
            returnComparisonData: [],
            orderQuantities: {},
            orderPartialQuantities: {},
            fundsLeftOver: '',
            loadingMaster: false,
            loadingWeight: false,
            loadingSector: false,
            loadingComparison: false,
            loadingOrderQuantities: false,
            configurationMode: true,
            configured: false,
            config: {}
        };
    }

    loadTableData = async () => {
        this.setState({ loadingMaster: true });
        const data = await getMasterDataTable();
        this.setState({ masterData: data, loadingMaster: false });
    }

    loadWeigtData = async () => {
        this.setState({ loadingWeight: true });
        const data = await getWeightData();
        if (data.success) {
            this.setState({ weightData: data.success, loadingWeight: false});
        } else {
            this.setState({ error: "an error occurred", loadingWeight: false});
        }
    }

    loadProjectedData = async () => {
        this.setState({ loadingProjectedData: true });
        const data = await getProjectedPerformance();
        if (data.success) {
            this.setState({ projectedPerformanceData: data.success, loadingProjectedData: false });
        } else {
            this.setState({ error: "an error occurred", loadingProjectedData: false });
        } 
    }

    loadSectorData = async () => {
        this.setState({ loadingSector: true });
        const data = await getSectorData();

        if (data.success) {
            this.setState({ loadingSector: false, sectorAllocData: data.success });
        } else {
            this.setState({ loadingSector: false, error: "an error occurred" });
        }
    }

    loadPastPriceChart = async () => {
        this.setState({ loadingPastPrice: true });
        const imgData = await getPastPriceChart();

        if (imgData.success) {
            this.setState({ loadingPastPrice: false, pastPriceChart: imgData.success });
        } else {
            this.setState({ loadPastPrice: false, error: "an error occurred" });
        }
    };

    loadCovarianceChart = async () => {
        const imgData = await getCovarianceChart();

        if (imgData.success) {
            this.setState({ covarianceChart: imgData.success });
        } else {
            this.setState({ error: "an error occurred" })
        }
    };

    loadReturnComparisonChart = async () => {
        this.setState({ loadingComparison: true });
        const data = await getReturnComparisonChart();
        const analysisData = await getRiskAnalysisChart();

        if (data.success && analysisData.success) {
            this.setState({ loadingComparison: false, returnComparisonData: [data.success[0]] });
        } else {
            this.setState({ loadingComparison: false, error: "an error occurred" });
        }
    }

    loadOrderQuantities = async () => {
        this.setState({ loadingOrderQuantities: true });
        const data = await getOrderQuantities();

        if (data.success) {
            this.setState({ 
                loadingOrderQuantities: false, 
                orderQuantities: data.success['Quantities to Buy'],
                orderPartialQuantities: data.success['Partial'], 
                fundsLeftOver: data.success.Leftover 
            });
        } else {
            this.setState({ loadingOrderQuantities: false, error: "an error occurred" });
        }
    };

    renderProjectedData = () => Object.keys(this.state.projectedPerformanceData).map(label => <h3 className="info-display">{`${label}: ${this.cleanData(this.state.projectedPerformanceData[label])}`}</h3>);

    cleanData = (data) => {
        if (data.length > 4) {
            const wholenum = data.split('.');
            return wholenum[0] + "." + wholenum[1][0] + "%";
        }
        return data;
    };

    setConfig = async (config) => {
        this.setState({ loading: true, configurationMode: false });
        await setData(config);
        this.setState({ config, configurationMode: false, configured: true, loading: false });
        await this.loadWeigtData();
        await this.loadProjectedData();
        await this.loadSectorData();
        await this.loadOrderQuantities();
        
        await this.loadPastPriceChart();
        await this.loadTableData();
        await this.loadReturnComparisonChart();
        // await this.loadCovarianceChart();
    }


    render() {
        console.log("dash state", this.state);
        return (
            <div>
                <div className="header">
                    <h2 className="page-header">Portfolio Optimizer</h2>
                    <div className="btn-group-container">
                        {(this.state.configured && !this.state.configurationMode) && <>
                            <div className="btn-container">
                                <div className="btn" onClick={() => this.setState({ configurationMode: true })}>
                                    Edit
                                </div>
                            </div>
                            <div className="btn-container" style={{ marginLeft: '1em', marginRight: '1em' }}>
                                <div className="btn">
                                    <a
                                        href={`data:text/json;charset=utf-8,${encodeURIComponent(
                                        JSON.stringify(this.state.config)
                                        )}`}
                                        download="portfolio-optimizer-config.json"
                                        className="downloadable-link"
                                    >
                                        Export
                                    </a>
                                </div>
                            </div>
                         </>}
                        {(this.state.configured && this.state.configurationMode) && <>
                            <div className="btn-container" style={{ marginLeft: '1em', marginRight: '1em' }}>
                                <div className="btn" onClick={() => this.setState({ configurationMode: false })}>
                                    Done
                                </div>
                            </div>
                        </>}
                    </div>
                </div>

                {this.state.loading && <h1><div className="fa fa-spinner fa-spin"/></h1>}

                {this.state.configurationMode && <Settings setConfig={(config) => this.setConfig(config)} gettingStarted={!this.state.configured} {...this.state.config.originalConfig}/>}

                {(!this.state.configurationMode && !this.state.loading) && <>
                    <div className="page-content info-bar">
                        {/* {(_.isEmpty(this.state.projectedPerformanceData) && !this.state.loadingProjectedData) && <button onClick={() => this.loadProjectedData()}>Get Projection Info</button>} */}
                        {!_.isEmpty(this.state.projectedPerformanceData) && this.renderProjectedData()}
                        {this.state.loadingProjectedData && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                    </div>

                    <div className="table-collection">

                        <div className="table-container" style={{ overflow: 'auto' }}>
                            {/* {(_.isEmpty(this.state.orderQuantities) && !this.state.loadingOrderQuantities) && <button onClick={() => this.loadOrderQuantities()}>Get Recommended Order Quantities</button>} */}
                            {!_.isEmpty(this.state.orderQuantities) && <>
                                    <TableModal header={"Recommended Order Quantities"} refresh={() => this.loadOrderQuantities()}>
                                        <div className="modal-action-bar">
                                            <a href={`${BACKEND_URL}/download_order_quantities`}><Icon name='cloud download' size="big"/></a>
                                            <h4>{`Funds Leftover: ${this.state.fundsLeftOver}`}</h4>
                                        </div>
                                        <AllocationTable data={this.state.orderQuantities}/>
                                        <a href={`${BACKEND_URL}/download_order_quantities_fractional`}><Icon name='cloud download' size="big"/></a>
                                        <h4>{`Partial Shares Included`}</h4>
                                        <AllocationTable data={this.state.orderPartialQuantities}/>
                                    </TableModal>
                                    <AllocationTable data={this.state.orderQuantities}/>
                                </>
                            }
                            {this.state.loadingOrderQuantities && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>

                        <div className="table-container" >
                            {/* {(_.isEmpty(this.state.weightData) && !this.state.loadingWeight) && <button onClick={() => this.loadWeigtData()}>Get Weight Data</button>} */}
                            {!_.isEmpty(this.state.weightData) && <>
                                    <TableModal header={"Portfolio Weighting"} refresh={() => this.loadWeigtData()}>
                                        <a href={`${BACKEND_URL}/download_weights`}><Icon name='cloud download' size="big"/></a>
                                        <div style={{ width: '100em', height: '70em' }}>
                                            <WeightChart data={this.state.weightData}/>
                                        </div>
                                    </TableModal>
                                    <WeightChart data={this.state.weightData}/>
                                </>
                            }
                            {this.state.loadingWeight && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>

                        <div className="table-container" >
                            {/* {(_.isEmpty(this.state.sectorAllocData) && !this.state.loadingSector) && <button onClick={() => this.loadSectorData()}>Get Allocation by Sector</button>} */}
                            {!_.isEmpty(this.state.sectorAllocData) && <>
                                    <TableModal header={"Allocation By Sector"} refresh={() => this.loadSectorData()}>
                                        <a href={`${BACKEND_URL}/download_sector_allocation`}><Icon name='cloud download' size="big"/></a>
                                        <div style={{ width: '100em', height: '70em' }}>
                                            <WeightChart data={this.state.sectorAllocData}/>
                                        </div>
                                    </TableModal>
                                    <WeightChart data={this.state.sectorAllocData}/>
                                </>
                            }
                            {this.state.loadingSector && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>
                    </div>

                    <div className="table-collection">
                        
                        <div className="table-container" style={{ overflow: 'auto' }}>
                            {/* {(_.isEmpty(this.state.masterData) && !this.state.loadingMaster) && <button onClick={() => this.loadTableData()}>Get Master Data</button>} */}
                            {!_.isEmpty(this.state.masterData) && 
                                <>
                                    <TableModal header={"Moving Average Data Table"} refresh={() => this.loadTableData()}>
                                        <a href={`${BACKEND_URL}/download_ma_data`}><Icon name='cloud download' size="big"/></a>
                                        <MasterTable masterData={this.state.masterData}/>
                                    </TableModal>
                                    <MasterTable masterData={this.state.masterData}/>
                                </>
                            }
                            {this.state.loadingMaster && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>

                        <div className="table-container" >
                                {/* {(_.isEmpty(this.state.pastPriceChart) && !this.state.loadingPastPrice) && <button onClick={() => this.loadPastPriceChart()}>Get Past Price Chart</button>} */}
                                {!_.isEmpty(this.state.pastPriceChart) && <>
                                        <TableModal header={"Price From 08 to Present"} refresh={() => this.loadPastPriceChart()}>
                                            <img style={{ height: '100%', width: '100%' }} src={this.state.pastPriceChart}/>
                                        </TableModal>
                                        <img style={{ height: '100%', width: '100%' }} src={this.state.pastPriceChart}/>
                                    </>
                                }
                                {this.state.loadingPastPrice && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>

                        <div className="table-container">
                            {/* {(_.isEmpty(this.state.returnComparisonData) && !this.state.loadingComparison) && <button onClick={() => this.loadReturnComparisonChart()}>Get Past Price Chart</button>} */}
                            {!_.isEmpty(this.state.returnComparisonData) && <>
                            <TableModal header={"Return Comparison Model"} refresh={() => this.loadReturnComparisonChart()}>
                                {this.state.returnComparisonData.map(plot => {
                                    return <img style={{ height: '100%', width: '100%' }} src={plot}/>
                                })}
                                <img className="covariance" style={{ height: '100%', width: '100%' }} src={this.state.covarianceChart}/>
                            </TableModal>
                                <div>
                                    {this.state.returnComparisonData.map(plot => {
                                        return <img style={{ height: '100%', width: '100%' }} src={plot}/>
                                    })}
                                </div>
                            </>}
                            {this.state.loadingComparison && <h1><div className="fa fa-spinner fa-spin"/></h1>}
                        </div>
                    </div>
                </>}

            </div>
        );
    }
}

export default Dashboard;