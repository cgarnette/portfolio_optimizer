import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

import datetime as dt
from datetime import timedelta
#import pandas_datareader.data as web
from pandas import Series, DataFrame
import matplotlib.pyplot as plt
from matplotlib import style

import pypfopt

from pypfopt import black_litterman, risk_models
from pypfopt import BlackLittermanModel, plotting
from pypfopt import EfficientFrontier, objective_functions
from pypfopt import DiscreteAllocation
from pypfopt import risk_models, expected_returns, plotting
from pypfopt import objective_functions
from pypfopt import CLA, plotting

import csv

import constants


# Utility Functions
def set_tickers(tickers):
    #Start Dates
    date = dt.datetime.today().strftime("%Y-%m-%d")

    st210 = dt.date.today() + dt.timedelta(-210)
    st210 = st210.strftime("%Y-%m-%d")
    st200 = dt.date.today() + dt.timedelta(-200)
    st200 = st210.strftime("%Y-%m-%d")
    st150 = dt.date.today() + dt.timedelta(-150)
    st150 = st150.strftime("%Y-%m-%d")
    st72 = dt.date.today() + dt.timedelta(-72)
    st72 = st150.strftime("%Y-%m-%d")
    st30 = dt.date.today() + dt.timedelta(-30)
    st30 = st30.strftime("%Y-%m-%d")
    st8 = dt.date.today() + dt.timedelta(-8)
    st8 = st8.strftime("%Y-%m-%d")

    return { 
        "tickers_8": (st8, date),
        "tickers_30": (st30, date),
        "tickers_72": (st72, date),  
        "tickers_150": (st150, date),
        "tickers_200": (st200, date), 
        "tickers_210": (st210, date),
        "tickers": tickers
    }


def build_sector(mapper, lower_preferences, upper_preferences):
    return { 'sector_mapper': mapper, 'sector_lower': lower_preferences, 'sector_upper': upper_preferences }


def get_ticker_prices(tickers):
    prices = yf.download(tickers, period="max")['Adj Close']
    return prices

def get_market_prices(market_source):
    market_prices = yf.download(market_source, period="max")["Adj Close"]
    return market_prices


def get_past_and_future_dfs(ticker_prices):
    past_df, future_df = ticker_prices.iloc[:-150], ticker_prices.iloc[-150:]
    return (past_df, future_df)


def get_portfolio_weights_and_performance(ticker_prices, indices, sector_mapper, sector_lower, sector_upper, gamma):
    print(ticker_prices)
    print(indices)
    print(sector_mapper)
    print(sector_lower)
    print(sector_upper)
    print(gamma)

    mu = expected_returns.capm_return(ticker_prices)
    S = risk_models.CovarianceShrinkage(ticker_prices).ledoit_wolf()

    ef = EfficientFrontier(mu, S)  # weight_bounds automatically set to (0, 1)
    ef.add_sector_constraints(sector_mapper, sector_lower, sector_upper)

    for index in indices:
        test_index = ef.tickers.index(index['ticker'])

        if index['condition'] is 'greater':
            ef.add_constraint(lambda w: w[test_index] >= index['weight'])
        elif index['condition'] is 'less':
            ef.add_constraint(lambda w: w[test_index] <= index['weight'])


    ef.add_objective(objective_functions.L2_reg, gamma=gamma)  # gamme is the tuning parameter

    try:
        ef.efficient_risk(0.08)
    except:
        try:
            ef.efficient_risk(0.1)
        except:
            try:
                ef.efficient_risk(0.13)
            except:
                try:
                    ef.efficient_risk(0.15)
                except:
                    ef.efficient_risk(0.18)




    weights = ef.clean_weights()

    performance = ef.portfolio_performance(verbose=False)

    performance = {
        'Expected Annual Return': str(performance[0] * 100),
        'Annual Volatility': str(performance[1] * 100),
        "Sharpe Ratio": str(performance[2] * 100)
    }

    return (weights, performance)


def write_weights_to_file(weights):
    with open("weight_export.csv", "w+") as filewriter:
        filewriter.write("Ticker, Weight\n")
        for ticker in weights.keys():
            filewriter.write(str(ticker) + ", " + str(weights[ticker]) + "\n")


def get_portfolio_weight_by_sector(weights, sector_mapper):
    weight_by_sector = {}
    for sector in set(sector_mapper.values()):
        weight_by_sector[sector] = 0
        for t,w in weights.items():
            if sector_mapper[t] == sector:
                weight_by_sector[sector] += w

    return weight_by_sector


def get_recommended_order_quantities(ticker_prices, weights, total_portfolio_value):
    latest_prices = ticker_prices.iloc[-2]  # prices as of the day you are allocating
    da = DiscreteAllocation(weights, latest_prices, total_portfolio_value=total_portfolio_value, short_ratio=0.3)
    alloc, leftover = da.lp_portfolio()

    return (alloc, leftover)


# takes in list of tickers as strings
# Very slow. The more tickers, the slower it processes.
def get_dividends(tickers):
    new_df = {}
    _tickers = yf.Tickers(' '.join(tickers))
    for item in _tickers.tickers:
        ticker = item.ticker
        new_df[ticker] = [i for i in range(13)]
        div_yield = item.info['dividendYield']
        if div_yield is not None:
            new_df[ticker][0] = div_yield * 100

    for item in _tickers.tickers:
        dividends = pd.DataFrame(item.dividends)
        past_year = dividends.loc[dividends.index > '2020-01-01']

        for date in past_year.index:
            new_df[item.ticker][date.month] = True

    cols = constants.months.copy()
    cols.insert(0, 'APY')
    new_df = pd.DataFrame.from_dict(new_df, orient='index', columns=cols)
    return new_df

def get_dividend(ticker):
    new_df = {}
    curr_ticker = yf.Ticker(ticker)

    new_df[ticker.ticker] = [i for i in range(13)]
    div_yield = ticker.info['dividendYield']
    if div_yield is not None:
            new_df[ticker.ticker][0] = div_yield * 100
    
    dividends = pd.DataFrame(ticker.dividends)
    past_year = dividends.loc[dividends.index > '2020-01-01']

    for date in past_year.index:
        new_df[ticker.ticker][date.month] = True

    cols = constants.months.copy()
    cols.insert(0, 'APY')
    new_df = pd.DataFrame.from_dict(new_df, orient='index', columns=cols)
    return new_df



def get_dunlap_moving_average(tickers):
    
    inv150c = yf.download(tickers['tickers'], start=tickers['tickers_150'][0], end=tickers['tickers_150'][1])['Close']
    inv30h = yf.download(tickers['tickers'], start=tickers['tickers_30'][0], end=tickers['tickers_30'][1])['High']
    inv30l = yf.download(tickers['tickers'], start=tickers['tickers_30'][0], end=tickers['tickers_30'][1])['Low']
    inv8h = yf.download(tickers['tickers'], start=tickers['tickers_8'][0], end=tickers['tickers_8'][1])['High']
    inv8l = yf.download(tickers['tickers'], start=tickers['tickers_8'][0], end=tickers['tickers_8'][1])['Low']


    inv_last_price150 = inv150c.tail(1)
    inv_last_price150 = inv_last_price150.T

    ma150c = inv150c.mean(axis=0)
    ma30h = inv30h.mean(axis=0)
    ma30l = inv30l.mean(axis=0)
    ma8h = inv8h.mean(axis=0)
    ma8l = inv8l.mean(axis=0)

    ma150c = pd.DataFrame(ma150c)
    ma150c = ma150c.rename(columns = {0: '150 Moving Average'}, inplace = False)

    ma30h = pd.DataFrame(ma30h)
    ma30l = pd.DataFrame(ma30l)
    ma8h = pd.DataFrame(ma8h)
    ma8l = pd.DataFrame(ma8l)

    prop150c = ma150c.insert(1,"Last Price",inv_last_price150)
    prop150c = ma150c.insert(2,"30 MA High",ma30h)
    prop150c = ma150c.insert(3,"8 MA High",ma8h)
    prop150c = ma150c.insert(4,"30 MA Low",ma30l)
    prop150c = ma150c.insert(5,"8 MA Low",ma8l)

    ma150c["150 %Delta"]= ((ma150c["Last Price"]-ma150c["150 Moving Average"])/ma150c["150 Moving Average"])*100
    ma150c["30H %Delta"]= ((ma150c["Last Price"]-ma150c["30 MA High"])/ma150c["30 MA High"])*100
    ma150c["8H %Delta"]= ((ma150c["Last Price"]-ma150c["8 MA High"])/ma150c["8 MA High"])*100
    ma150c["30L %Delta"]= ((ma150c["Last Price"]-ma150c["30 MA Low"])/ma150c["30 MA Low"])*100
    ma150c["8L %Delta"]= ((ma150c["Last Price"]-ma150c["8 MA Low"])/ma150c["8 MA Low"])*100

    ma150c.loc[((ma150c["150 %Delta"] > 0) & (ma150c["150 %Delta"] <= 12)) | (ma150c["30H %Delta"] > 0) , "Buy/ Sell"] = "Possibly Buy"
    ma150c.loc[(ma150c["150 %Delta"] > 0) & (ma150c["150 %Delta"] <= 12) & (ma150c["30H %Delta"] > 0) & (ma150c["8H %Delta"] > 0), "Buy/ Sell"] = "Buy"
    ma150c.loc[(ma150c["150 %Delta"] > 12) & (ma150c["30H %Delta"] > 0) & (ma150c["8H %Delta"] > 0), "Buy/ Sell"] = "Buy Cautiously"
    ma150c.loc[(ma150c["8H %Delta"] > 0) & (ma150c["150 %Delta"] <= 0) & (ma150c["30H %Delta"] < 0), "Buy/ Sell"] = "Review Buy"
    ma150c.loc[(ma150c["150 %Delta"] <= 0) & (ma150c["30L %Delta"] < 0), "Buy/ Sell"] = "Sell"
    ma150c.loc[(ma150c["150 %Delta"] <= 0) & (ma150c["30L %Delta"] < 0) & (ma150c["8L %Delta"] < 0), "Buy/ Sell"] = "Really Sell"

    return ma150c

# Requires the output from set_tickers function
# Moving average based assessments. 
def get_moving_average_data(tickers):

    inv150c = yf.download(tickers['tickers'], start=tickers['tickers_150'][0], end=tickers['tickers_150'][1])['Close']
    inv30h = yf.download(tickers['tickers'], start=tickers['tickers_30'][0], end=tickers['tickers_30'][1])['High']
    inv30l = yf.download(tickers['tickers'], start=tickers['tickers_30'][0], end=tickers['tickers_30'][1])['Low']
    inv8h = yf.download(tickers['tickers'], start=tickers['tickers_8'][0], end=tickers['tickers_8'][1])['High']
    inv8l = yf.download(tickers['tickers'], start=tickers['tickers_8'][0], end=tickers['tickers_8'][1])['Low']


    inv_last_price150 = inv150c.tail(1)
    inv_last_price150 = inv_last_price150.T

    ma150c = inv150c.mean(axis=0)
    ma30h = inv30h.mean(axis=0)
    ma30l = inv30l.mean(axis=0)
    ma8h = inv8h.mean(axis=0)
    ma8l = inv8l.mean(axis=0)

    ma150c = pd.DataFrame(ma150c)
    ma150c = ma150c.rename(columns = {0: '150 Moving Average'}, inplace = False)

    ma30h = pd.DataFrame(ma30h)
    ma30l = pd.DataFrame(ma30l)
    ma8h = pd.DataFrame(ma8h)
    ma8l = pd.DataFrame(ma8l)

    prop150c = ma150c.insert(1,"Last Price",inv_last_price150)
    prop150c = ma150c.insert(2,"30 MA High",ma30h)
    prop150c = ma150c.insert(3,"8 MA High",ma8h)
    prop150c = ma150c.insert(4,"30 MA Low",ma30l)
    prop150c = ma150c.insert(5,"8 MA Low",ma8l)

    ma150c["150 %Delta"]= ((ma150c["Last Price"]-ma150c["150 Moving Average"])/ma150c["150 Moving Average"])*100
    ma150c["30H %Delta"]= ((ma150c["Last Price"]-ma150c["30 MA High"])/ma150c["30 MA High"])*100
    ma150c["8H %Delta"]= ((ma150c["Last Price"]-ma150c["8 MA High"])/ma150c["8 MA High"])*100
    ma150c["30L %Delta"]= ((ma150c["Last Price"]-ma150c["30 MA Low"])/ma150c["30 MA Low"])*100
    ma150c["8L %Delta"]= ((ma150c["Last Price"]-ma150c["8 MA Low"])/ma150c["8 MA Low"])*100

    ma150c.loc[((ma150c["150 %Delta"] > 0) & (ma150c["150 %Delta"] <= 12)) | (ma150c["30H %Delta"] > 0) , "Buy/ Sell"] = "Possibly Buy"
    ma150c.loc[(ma150c["150 %Delta"] > 0) & (ma150c["150 %Delta"] <= 12) & (ma150c["30H %Delta"] > 0) & (ma150c["8H %Delta"] > 0), "Buy/ Sell"] = "Buy"
    ma150c.loc[(ma150c["150 %Delta"] > 12) & (ma150c["30H %Delta"] > 0) & (ma150c["8H %Delta"] > 0), "Buy/ Sell"] = "Buy Cautiously"
    ma150c.loc[(ma150c["8H %Delta"] > 0) & (ma150c["150 %Delta"] <= 0) & (ma150c["30H %Delta"] < 0), "Buy/ Sell"] = "Review Buy"
    ma150c.loc[(ma150c["150 %Delta"] <= 0) & (ma150c["30L %Delta"] < 0), "Buy/ Sell"] = "Sell"
    ma150c.loc[(ma150c["150 %Delta"] <= 0) & (ma150c["30L %Delta"] < 0) & (ma150c["8L %Delta"] < 0), "Buy/ Sell"] = "Really Sell"

    return ma150c


def generate_weight_chart(weights):
    pd.Series(weights).plot.pie(figsize=(10,10))


def generate_past_performance_plot(ticker_prices):
    return ticker_prices[ticker_prices.index >= "2008-01-01"].plot(figsize=(15,10))

def generate_return_comparison_model(past_df, return_methods=constants.return_methods):
    fig, axs = plt.subplots( 1, len(return_methods),sharey=True, figsize=(15,10))

    plots = []
    for i, method in enumerate(return_methods):
        mu = expected_returns.return_model(past_df, method=method)
        axs[i].set_title(method)
        plots.append(mu.plot.barh(ax=axs[i]))

    return plots


def generate_return_risk_analysis_plot(past_df, future_df, return_methods=constants.return_methods):
    future_rets = expected_returns.mean_historical_return(future_df)
    mean_abs_errors = []

    for method in return_methods:
        mu = expected_returns.return_model(past_df, method=method)
        mean_abs_errors.append(np.sum(np.abs(mu - future_rets)) / len(mu))
        
    xrange = range(len(mean_abs_errors))
    plt.barh(xrange, mean_abs_errors)
    plt.yticks(xrange, return_methods)
    return plt


def generate_risk_analysis_plot(future_df, ticker_prices):
    future_cov = risk_models.sample_cov(future_df)
    future_variance = np.diag(future_cov)
    mean_abs_errors = []

    risk_methods = [
        "sample_cov",
        "semicovariance",
        "exp_cov",
        "ledoit_wolf",
        "ledoit_wolf_constant_variance",
        "ledoit_wolf_single_factor",
        "ledoit_wolf_constant_correlation",
        "oracle_approximating",
    ]

    for method in risk_methods:
        S = risk_models.risk_matrix(ticker_prices, method=method)
        variance = np.diag(S)
        mean_abs_errors.append(np.sum(np.abs(variance - future_variance)) / len(variance))
        
    xrange = range(len(mean_abs_errors))
    plt.barh(xrange, mean_abs_errors)
    plt.yticks(xrange, risk_methods)
    return plt


def generate_covariance_plot(past_df, future_df):
    future_cov = risk_models.sample_cov(future_df)

    sample_cov = risk_models.sample_cov(past_df)
    plotting.plot_covariance(sample_cov, plot_correlation=True)
    plotting.plot_covariance(future_cov, plot_correlation=True)

    return plt

