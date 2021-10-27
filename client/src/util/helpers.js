import * as _ from 'lodash';



export const configParser = (config) => {
  if (!validateSectors(config.sectors)) return false;
  if (!validateSectors(config.tickers)) return false;
  if (!validateMappings(config.tickers, config.mappings)) return false;

  const sectorLower = {};
  const sectorUpper = {};
  
  config.sectors.forEach( sector => {
    if (!_.includes(Object.values(config.mappings), sector.name)) return;

    if (!_.isEmpty(sector.condition)) {
       if (!_.isEmpty(sector.bounds.lower)) {
        sectorLower[sector.name] = sector.bounds.lower;
      }

      if (!_.isEmpty(sector.bounds.upper)) {
        sectorUpper[sector.name] = sector.bounds.upper;
      }
    }
  });


  const tickers = config.tickers.map(ticker => ticker.name);
  const defaultIndicies = [];
  
  config.tickers.forEach(ticker => {
    if (!_.isEmpty(ticker.condition)) {

      if (!_.isEmpty(ticker.bounds.lower)) {
        const index = { ticker: ticker.name, condition: 'greater', weight: ticker.bounds.lower };
        defaultIndicies.push(index);
      }
      if (!_.isEmpty(ticker.bounds.upper)) {
        const index = { ticker: ticker.name, condition: 'less', weight: ticker.bounds.upper };
        defaultIndicies.push(index);
      }
    }
  });

  const output = { 
    payload: {
      sectorLower, 
      sectorUpper, 
      sectorMapper: config.mappings, 
      tickers: tickers, 
      marketTracker: config.marketTracker, 
      gamma: config.gamma/100, 
      defaultIndicies,
      portfolioAmount: config.portfolioAmount
    },
    originalConfig: {
      tickers: config.tickers,
      mappings: config.mappings,
      marketTracker: config.marketTracker,
      gamme: config.gamma,
      sectors: config.sectors,
      portfolioAmount: config.portfolioAmount
    } 
  };

  return output;
};

export const validateSectors = (sectors) => {

  let weightCounter = 0;

  const invalidSector = sectors.find(sector => {

    if (_.isEmpty(sector.name)) return true;
    if (_.isEmpty(sector.condition)) return false;

    switch(sector.condition) {
      case '<>':
        if (_.isEmpty(sector.bounds.lower) || _.isEmpty(sector.bounds.upper)) return true;
        weightCounter += parseInt(sector.bounds.lower);
        return false;
      case '>':
        if (_.isEmpty(sector.bounds.lower)) return true;
        weightCounter += parseInt(sector.bounds.lower);
        return false;
      case '<':
        return false;
    }
  });

  if (weightCounter > 100 || !!invalidSector) return false;
  return true;
};


export const validateMappings = (tickers, mappings) => {
  return !tickers.find(ticker => !mappings[ticker.name]);
};


const sort = (a, b) => {

};