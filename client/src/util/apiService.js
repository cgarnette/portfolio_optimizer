import { 
    BACKEND_URL
} from './constants';

export const getWeightData = async () => {
    return await fetch(`${BACKEND_URL}/weights`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getMasterDataTable = async () => {
    return await fetch(`${BACKEND_URL}/full_data`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getProjectedPerformance = async () => {
    return await fetch(`${BACKEND_URL}/projected_performance`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getSectorData = async () => {
    return await fetch(`${BACKEND_URL}/sector_allocation`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getPastPriceChart = async () => {
    return await fetch(`${BACKEND_URL}/past_prices`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getReturnComparisonChart = async () => {
    return await fetch(`${BACKEND_URL}/return_comparison`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getRiskAnalysisChart = async () => {
    return await fetch(`${BACKEND_URL}/risk_analysis`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getCovarianceChart = async () => {
    return await fetch(`${BACKEND_URL}/covariance_plot`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};

export const getOrderQuantities = async () => {
    return await fetch(`${BACKEND_URL}/order_quantities`)
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};


export const setData = async (config) => {
    return await fetch(`${BACKEND_URL}/set_data`, {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(response => response.json()).then(data => data)
        .catch(error => console.log(error));
};