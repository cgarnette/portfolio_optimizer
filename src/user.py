
import portfolio_optimizer

class UserPortfolio:
    def __init__(self):
        self.tickers = []
        self.prices = []
        self.market_prices = []
        self.moving_average_data = {}
        self.weights = {}
        self.past_df = {}
        self.future_df = {}
        self.gamma = .6
        self.portfolio_value = 0
        self.ticker_constraints = []


    def clear(self):
        self.tickers = []
        self.prices = []
        self.market_prices = []
        self.moving_average_data = {}
        self.weights = {}
        self.past_df = {}
        self.future_df = {}
        self.gamma = .6
        self.portfolio_value = 0
        self.ticker_constraints = []
        self.sector_upper = {}
        self.sector_lower = {}
        self.sector_mapper = {}

    def set_tickers(self, tickers):
        self.tickers = tickers
        self.prices = portfolio_optimizer.get_ticker_prices(tickers)
        self.past_df, self.future_df = portfolio_optimizer.get_past_and_future_dfs(self.prices)

    def set_market_source(self, market_source):
        self.market_prices = portfolio_optimizer.get_market_prices(market_source)

    def set_gamma(self, gamma):
        self.gamma = gamma

    def set_portfolio_value(self, value):
        self.portfolio_value = value

    def set_ticker_constraints(self, tickers):
        self.ticker_constraints = []

        for ticker in tickers:
            new_ticker = {
                "ticker": ticker['ticker'],
                "condition": ticker["condition"],
                "weight": float(ticker["weight"])
            }
            self.ticker_constraints.append(new_ticker)

    def set_sector_constraints(self, sector_lower, sector_upper, sector_mapper):
        self.sector_upper = sector_upper
        self.sector_lower = sector_lower
        self.sector_mapper = sector_mapper
        print('sector constraints set!')
        print(sector_mapper)
        

    def set_moving_average_data(self, data):
        self.moving_average_data = data

    def set_weights(self, weights):
        self.weights = weights


