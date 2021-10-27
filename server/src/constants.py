# default_tickers8 = "LMD" 
# default_tickers30 = "GBTC CIBR ROBO SKYY AIEQ ICLN GAMR CRSP XBI MILN ESGV GXC SUSA VFTAX CRBN" 
# default_tickers150 = "VGT VITAX SPY ARKW ARKK TXG FDN MGC SCHD VWO AMZN AAPL GOOG MSFT GE V NVDA PYPL ADBE CSCO QCOM INTU SQ TSLA ROKU TDOC Z SPOT PRLB FB PACB" 
# default_tickers210 = "BND VGIT GLTR AGG GOVT" 


default_tickers = ["GBTC", "CIBR", "SKYY", "AIEQ", "XBI","VGT", "ARKW", "ARKK", "BND", "GDX", "PACB", "ARKQ", "ARKG", "ARKF", "FSTA", "FIDU", "FUTY", "XHE", "XHS", "FZROX", "FDN", "SPY", "LIT"]

return_methods = [ "mean_historical_return", "ema_historical_return", "capm_return" ]

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

total_portfolio_value = 10000

default_market_source = 'SPY'

default_gamma = .6

default_indices = [
    {
        'ticker': 'ARKK',
        'weight': 0.03,
        'condition': 'greater'
    },
    {
        'ticker': 'ARKW',
        'weight': 0.03,
        'condition': 'greater'
    },
    {
        'ticker': 'ARKG',
        'weight': 0.03,
        'condition': 'less'
    },
    {
        'ticker': 'ARKF',
        'weight': 0.03,
        'condition': 'greater'
    },
    {
        'ticker': 'ARKQ',
        'weight': 0.03,
        'condition': 'greater'
    },
    {
        'ticker': 'GBTC',
        'weight': 0.03,
        'condition': 'less'
    },
]

sector_mapper = {
        "GBTC": "Hard Assets", 
        "CIBR": "Tech", #Spec
        "SKYY": "Tech", #Spec
        "AIEQ": "Tech", #Spec 
        "ARKW": "Ark", 
        "ARKK": "Ark", 
        "ARKQ" : "Ark", 
        "ARKG" : "Healthcare", 
        "ARKF" : "Ark",    
        "XBI": "Healthcare", 
        "VGT": "Tech", 
        "BND" : "Bonds", 
        "GDX" : "Gold", 
        "PACB" : "Healthcare",
        "FSTA" : "Consumer Products", 
        "FIDU" : "Industrials", 
        "FUTY" : "Utilities", 
        "XHE" : "Healthcare", 
        "XHS" : "Healthcare",
        "FZROX" : "Market Only",
        "FDN" : "Market",
        "SPY": "Market",
        "LIT" : "Hard Assets"
    }


# ex. .1 Tech means you want MORE than 10% of the portfolio to be tech stocks
sector_lower = {
    "Tech": 0.1,
    "Bonds" : 0,
    "Gold" : 0.05,
    "Healthcare" : 0.1,
    "Market Only" : 0.10

}

#    "Ark" : 0.15,
#    "Social": 0.05, 
#    "Hard Assets" : 0.2, #0.25 recommended
#    "Financial Services" : 0.03     
        
# ex. .4 means you want LESS than 10% of the portfolio to be tech stocks
sector_upper = {
    "Tech": 0.4,
    "Bonds" : 0,
    "Market" : 0,
    "Ark" : 0.25,
}