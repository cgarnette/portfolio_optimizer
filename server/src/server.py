from flask import Flask, jsonify, send_file, Response, make_response, request
import flask_excel as excel
import json
import portfolio_optimizer
from user import UserPortfolio
import constants
import base64
import io 
import datetime

app = Flask(__name__, static_folder='../build', static_url_path='/')


# We will work under the assumption that there is a single user
user_management = {}

portfolio = UserPortfolio()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/reset', methods=['GET'])
def reset():
    portfolio = UserPortfolio()
    return jsonify({ 'success': 'portfolio data reset successful' })

@app.route('/set_data', methods=['POST'])
def set_data():
    portfolio.clear()
    data = request.get_json()
    portfolio.set_market_source(data['payload']['marketTracker'])
    portfolio.set_gamma(data['payload']['gamma'])
    portfolio.set_ticker_constraints(data['payload']['defaultIndicies'])
    portfolio.set_sector_constraints(data['payload']['sectorLower'], data['payload']['sectorUpper'], data['payload']['sectorMapper'])
    portfolio.set_portfolio_value(float(data['payload']['portfolioAmount']))
    portfolio.set_tickers(data['payload']['tickers'])
    # portfolio.set_tickers(constants.default_tickers)
    return jsonify({ 'success': 'data has been set!' })


@app.route('/register', methods=['GET'])
def register_client():
    return jsonify({ 'success': 'registered' })

@app.route('/full_data', methods=['GET'])
def get_full_data():

    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    tickers = portfolio_optimizer.set_tickers(portfolio.tickers)
    data = portfolio_optimizer.get_moving_average_data(tickers)

    portfolio.set_moving_average_data(data)

    return jsonify(json.loads(data.to_json(orient="index")))


@app.route('/past_prices', methods=['GET'])
def get_past_prices():
    plt = portfolio_optimizer.generate_past_performance_plot(portfolio.prices)
    pic_IObytes = io.BytesIO()
    plt.figure.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    pic_hash = "data:image/png;base64," + str(base64.b64encode(pic_IObytes.read()))[2:-1]

    return jsonify({ 'success': pic_hash })

@app.route('/weights', methods=['GET'])
def get_weight_data():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    try:
        weights, performance = portfolio_optimizer.get_portfolio_weights_and_performance(portfolio.prices, portfolio.ticker_constraints, portfolio.sector_mapper, portfolio.sector_lower, portfolio.sector_upper, portfolio.gamma)
    except:
        return jsonify({ 'error': 'Check Ticker spellings and Weight Constraints' })

    portfolio.set_weights(weights)

    data = {}

    for ticker in weights.keys():
        data[ticker] = weights[ticker]

    return jsonify({ 'success': data })

@app.route('/projected_performance', methods=['GET'])
def get_projected_performance():
    weights, performance = portfolio_optimizer.get_portfolio_weights_and_performance(portfolio.prices, portfolio.ticker_constraints, portfolio.sector_mapper, portfolio.sector_lower, portfolio.sector_upper, portfolio.gamma)
    portfolio.set_weights(weights)

    return jsonify({ 'success': performance })

@app.route('/order_quantities', methods=['GET'])
def get_recommended_order_quantities():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    alloc, leftover = portfolio_optimizer.get_recommended_order_quantities(portfolio.prices, portfolio.weights, portfolio.portfolio_value)
    alloc = dict(alloc)

    partial_alloc, _leftover = portfolio_optimizer.get_recommended_order_quantities(portfolio.prices, portfolio.weights, portfolio.portfolio_value * 100000)
    partial_alloc = dict(partial_alloc)

    updated_alloc = {}
    updated_partial_alloc = {}

    today = datetime.date.today()

    for ticker in alloc.keys():
        price = portfolio.prices.tail()[ticker][-1]
        quantity = int(alloc[ticker])
        total = price * quantity

        updated_alloc[ticker] = {
            "quantity": quantity,
            "price": "{:0.2f}".format(price), # Current Price per share
            "Total Investment": "{:0.2f}".format(total)
        }

    for ticker in partial_alloc.keys():
        price = portfolio.prices.tail()[ticker][-1]
        quantity = float(partial_alloc[ticker]/100000)
        total = price * quantity

        if (total < 10):
            continue # Don't add this ticker if the investment would be less than $10

        updated_partial_alloc[ticker] = {
            "quantity": quantity,
            "price": "{:0.2f}".format(price), # Current Price per share
            "Total Investment": "{:0.2f}".format(total)
        }
        
    return jsonify({ 'success': { "Quantities to Buy": updated_alloc, "Leftover": str(leftover), "Partial": updated_partial_alloc } })


@app.route('/return_comparison', methods=['GET'])
def get_return_comparison_model():

    plots = portfolio_optimizer.generate_return_comparison_model(portfolio.past_df)
    # risk_analysis = portfolio_optimizer.generate_risk_analysis_plot(portfolio.future_df, portfolio.prices)
    # return_risk_analysis = portfolio_optimizer.generate_return_risk_analysis_plot(portfolio.past_df, portfolio.future_df)

    # plots.append(risk_analysis)
    # plots.append(return_risk_analysis)

    plot_hashes = []
    for plot in plots:
        plt = plot
        pic_IObytes = io.BytesIO()
        try:
            plt.figure.savefig(pic_IObytes,  format='png')
        except:
            plt.savefig(pic_IObytes,  format='png')
        pic_IObytes.seek(0)
        pic_hash = "data:image/png;base64," + str(base64.b64encode(pic_IObytes.read()))[2:-1]

        plot_hashes.append(pic_hash)

    return jsonify({ 'success': plot_hashes })

@app.route('/risk_analysis', methods=['GET'])
def get_risk_analysis_model():
    risk_analysis = portfolio_optimizer.generate_risk_analysis_plot(portfolio.future_df, portfolio.prices)

    plt = risk_analysis
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    pic_hash = "data:image/png;base64," + str(base64.b64encode(pic_IObytes.read()))[2:-1]

    return jsonify({ 'success': pic_hash })


@app.route('/risk_return_analysis', methods=['GET'])
def get_risk_return_model():
    return_risk_analysis = portfolio_optimizer.generate_return_risk_analysis_plot(portfolio.past_df, portfolio.future_df)

    plt = return_risk_analysis
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    pic_hash = "data:image/png;base64," + str(base64.b64encode(pic_IObytes.read()))[2:-1]

    return jsonify({ 'success': pic_hash })


@app.route('/covariance_plot', methods=['GET'])
def get_covariance_model():

    plt = portfolio_optimizer.generate_covariance_plot(portfolio.past_df, portfolio.future_df)
    pic_IObytes = io.BytesIO()
    plt.savefig(pic_IObytes,  format='png')
    pic_IObytes.seek(0)
    pic_hash = "data:image/png;base64," + str(base64.b64encode(pic_IObytes.read()))[2:-1]

    return jsonify({ 'success': pic_hash })


@app.route('/sector_allocation', methods=['GET'])
def get_sector_allocation():
    alloc = portfolio_optimizer.get_portfolio_weight_by_sector(portfolio.weights, portfolio.sector_mapper)
    return jsonify({ 'success':  alloc })


@app.route('/dividends', methods=['GET'])
def download_dividends():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    dividends = portfolio_optimizer.get_dividends(portfolio.tickers)
    return jsonify({ 'success': dividends.to_json(orient='index') })


@app.route('/dividend', methods=['GET'])
def download_dividend():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    data = request.get_json()

    ticker = data['payload']['ticker']
    dividends = portfolio_optimizer.get_dividends(ticker)
    return jsonify({ 'success': dividends.to_json(orient='index') })


@app.route('/download_order_quantities', methods=['GET'])
def download_recommended_order_quantities():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    alloc, leftover = portfolio_optimizer.get_recommended_order_quantities(portfolio.prices, portfolio.weights, portfolio.portfolio_value)
    alloc = dict(alloc)

    updated_alloc = {}

    for ticker in alloc.keys():
        updated_alloc[ticker] = int(alloc[ticker])

    csv = 'Ticker, Quantity, Price, Total Investment'

    csv_row = []
    for ticker in alloc.keys():
        price = portfolio.prices.tail()[ticker][-1]
        quantity = int(alloc[ticker])
        total = price * quantity

        csv_row.append('\n' + ticker + ', ' + str(alloc[ticker]) + ', ' + "{:0.2f}".format(price) + ', ' + "{:0.2f}".format(total))
    csv += ''.join(csv_row)

    response = make_response(csv)
    response.headers['Content-Disposition'] = 'attachment; filename=recommended_order_quantities.csv'
    response.mimetype='text/csv'

    return response

@app.route('/download_order_quantities_fractional', methods=['GET'])
def download_recommended_fractional_order_quantities():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    alloc, leftover = portfolio_optimizer.get_recommended_order_quantities(portfolio.prices, portfolio.weights, portfolio.portfolio_value * 100000)
    alloc = dict(alloc)

    updated_alloc = {}

    for ticker in alloc.keys():
        updated_alloc[ticker] = int(alloc[ticker])

    csv = 'Ticker, Quantity, Price, Total Investment'

    csv_row = []
    for ticker in alloc.keys():
        price = portfolio.prices.tail()[ticker][-1]
        quantity = float(alloc[ticker]/100000)
        total = price * quantity
        
        if total < 10:
            continue

        csv_row.append('\n' + ticker + ', ' + str(alloc[ticker]) + ', ' + "{:0.2f}".format(price) + ', ' + "{:0.2f}".format(total))
    csv += ''.join(csv_row)

    response = make_response(csv)
    response.headers['Content-Disposition'] = 'attachment; filename=recommended_fractional_order_quantities.csv'
    response.mimetype='text/csv'

    return response


@app.route('/download_sector_allocation', methods=['GET'])
def download_sector_allocation():
    alloc = portfolio_optimizer.get_portfolio_weight_by_sector(portfolio.weights, portfolio.sector_mapper)

    csv = 'Sector, Allocation %'

    csv_row = []
    for sector in alloc.keys():
        csv_row.append('\n' + sector + ', ' + str(alloc[sector]))
    csv += ''.join(csv_row)

    response = make_response(csv)
    response.headers['Content-Disposition'] = 'attachment; filename=sector_allocation.csv'
    response.mimetype='text/csv'

    return response


@app.route('/download_ma_data', methods=['GET'])
def download_master_data_csv():
    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    tickers = portfolio_optimizer.set_tickers(portfolio.tickers)
    data = portfolio.moving_average_data

    json_data = json.loads(data.to_json(orient="index"))

    tickers = list(json_data.keys())

    headers = [header for header in json_data[tickers[0]].keys()]

    csv = 'Ticker, ' + ', '.join(headers)

    csv_row = []
    for ticker in tickers:
        csv_row = ['\n' + ticker]
        for header in headers:
            csv_row.append(str(json_data[ticker][header]))
        csv += ','.join(csv_row)

    response = make_response(csv)
    response.headers['Content-Disposition'] = 'attachment; filename=moving_average_historical_data.csv'
    response.mimetype='text/csv'

    return response


@app.route('/download_weights', methods=['GET'])
def download_weights_csv():

    if (len(portfolio.tickers) < 1):
        return jsonify({ 'error': 'set tickers first' })

    weights = portfolio.weights

    csv = 'Ticker, Weight\n'

    for ticker in weights.keys():
            csv += str(ticker) + ", " + str(weights[ticker]) + "\n"

    response = make_response(csv)
    response.headers['Content-Disposition'] = 'attachment; filename=portfolio_weights.csv'
    response.mimetype='text/csv'

    return response




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3456)

