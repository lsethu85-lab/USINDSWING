import json, time
import yfinance as yf
LISTS = {"IND": ("RELIANCE,TCS,HDFCBANK,ICICIBANK,INFY,BHARTIARTL,SBIN,LT,ITC,AXISBANK,KOTAKBANK,M&M,SUNPHARMA,BAJFINANCE,MARUTI,NTPC,POWERGRID,ONGC,TITAN,ADANIPORTS,HAL,BEL,TRENT,DLF,COALINDIA,JSWSTEEL,TATASTEEL,CIPLA,EICHERMOT,PERSISTENT,POLYCAB,INDIGO,ETERNAL,CHOLAFIN,MUTHOOTFIN,PFC,RECLTD,BSE,DIXON,CGPOWER".split(","), ".NS"), "US": ("AAPL,MSFT,NVDA,AMZN,GOOGL,META,AVGO,TSLA,JPM,V,LLY,COST,NFLX,AMD,CRM,ORCL,PLTR,UBER,SHOP,PANW,CRWD,NOW,ANET,APP,HOOD,COIN,MU,GE,CAT,WMT".split(","), "")}
for name, (syms, sfx) in LISTS.items():
    tk = [s + sfx for s in syms]
    df = yf.download(tk, period="1y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
    out = {}
    for s, t in zip(syms, tk):
        try:
            d = df[t].dropna(subset=["Close", "High", "Low"])
            if len(d) < 70:
                continue
            out[s] = {"c": [round(float(x), 2) for x in d.Close], "h": [round(float(x), 2) for x in d.High], "l": [round(float(x), 2) for x in d.Low], "v": [int(x) for x in d.Volume.fillna(0)], "last": round(float(d.Close.iloc[-1]), 2)}
        except Exception as e:
            print("skip", s, e)
    with open(f"data/{name}.json", "w") as f:
        json.dump({"t": int(time.time()), "s": out}, f, separators=(",", ":"))
    print(name, len(out), "symbols")
