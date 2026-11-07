import json, os
import yfinance as yf
LISTS = {"IND": ("RELIANCE,TCS,HDFCBANK,ICICIBANK,INFY,BHARTIARTL,SBIN,LT,ITC,AXISBANK,KOTAKBANK,M&M,SUNPHARMA,BAJFINANCE,MARUTI,NTPC,POWERGRID,ONGC,TITAN,ADANIPORTS,HAL,BEL,TRENT,DLF,COALINDIA,JSWSTEEL,TATASTEEL,CIPLA,EICHERMOT,PERSISTENT,POLYCAB,INDIGO,ETERNAL,CHOLAFIN,MUTHOOTFIN,PFC,RECLTD,BSE,DIXON,CGPOWER,HDFCLIFE,SBILIFE,BAJAJFINSV,TECHM,WIPRO,HCLTECH,GRASIM,ULTRACEMCO,HINDALCO,VEDL,TVSMOTOR,BHARATFORG,LUPIN,TORNTPHARM,ABB,SIEMENS,JINDALSTEL,IRCTC,PNB,CANBK".split(","), ".NS", "^NSEI"), "US": ("AAPL,MSFT,NVDA,AMZN,GOOGL,META,AVGO,TSLA,JPM,V,LLY,COST,NFLX,AMD,CRM,ORCL,PLTR,UBER,SHOP,PANW,CRWD,NOW,ANET,APP,HOOD,COIN,MU,GE,CAT,WMT,ADBE,INTU,ISRG,UNH,HD,MA,BKNG,TXN,QCOM,AMAT,LRCX,KLAC,SNPS,CDNS,DDOG,NET,SNOW,ABNB,DASH,RKLB".split(","), "", "^GSPC")}
os.makedirs("hist", exist_ok=True)
for name, (syms, sfx, ix) in LISTS.items():
    tk = [s + sfx for s in syms]
    df = yf.download(tk, period="5y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
    out = {}
    for s, t in zip(syms, tk):
        try:
            d = df[t].dropna(subset=["Close", "High", "Low"])
            if len(d) < 300:
                continue
            out[s] = {"c": [round(float(x), 2) for x in d.Close], "h": [round(float(x), 2) for x in d.High], "l": [round(float(x), 2) for x in d.Low], "v": [int(x) for x in d.Volume.fillna(0)], "d": [str(x.date()) for x in d.index]}
        except Exception as e:
            print("skip", s, e)
    h = yf.Ticker(ix).history(period="5y").dropna(subset=["Close"])
    idx = {"c": [round(float(x), 2) for x in h.Close], "d": [str(x.date()) for x in h.index]}
    json.dump({"i": idx, "s": out}, open("hist/" + name + ".json", "w"), separators=(",", ":"))
    print(name, len(out), "symbols")
