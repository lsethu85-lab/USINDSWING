import json, time, datetime
import yfinance as yf
LISTS = {"IND": ("RELIANCE,TCS,HDFCBANK,ICICIBANK,INFY,BHARTIARTL,SBIN,LT,ITC,AXISBANK,KOTAKBANK,M&M,SUNPHARMA,BAJFINANCE,MARUTI,NTPC,POWERGRID,ONGC,TITAN,ADANIPORTS,HAL,BEL,TRENT,DLF,COALINDIA,JSWSTEEL,TATASTEEL,CIPLA,EICHERMOT,PERSISTENT,POLYCAB,INDIGO,ETERNAL,CHOLAFIN,MUTHOOTFIN,PFC,RECLTD,BSE,DIXON,CGPOWER,HDFCLIFE,SBILIFE,BAJAJFINSV,TECHM,WIPRO,HCLTECH,GRASIM,ULTRACEMCO,HINDALCO,VEDL,TVSMOTOR,BHARATFORG,LUPIN,TORNTPHARM,ABB,SIEMENS,JINDALSTEL,IRCTC,PNB,CANBK".split(","), ".NS", "^NSEI"), "US": ("AAPL,MSFT,NVDA,AMZN,GOOGL,META,AVGO,TSLA,JPM,V,LLY,COST,NFLX,AMD,CRM,ORCL,PLTR,UBER,SHOP,PANW,CRWD,NOW,ANET,APP,HOOD,COIN,MU,GE,CAT,WMT,ADBE,INTU,ISRG,UNH,HD,MA,BKNG,TXN,QCOM,AMAT,LRCX,KLAC,SNPS,CDNS,DDOG,NET,SNOW,ABNB,DASH,RKLB".split(","), "", "^GSPC")}
def n(x):
    return x if isinstance(x, (int, float)) and x == x else None
def fund(t):
    try:
        tk = yf.Ticker(t)
        i = tk.info
        ed = None
        try:
            e = [x for x in tk.calendar.get("Earnings Date", []) if x >= datetime.date.today()]
            ed = str(e[0]) if e else None
        except Exception:
            pass
        time.sleep(0.2)
        return {"eg": n(i.get("earningsGrowth")), "rg": n(i.get("revenueGrowth")), "roe": n(i.get("returnOnEquity")), "de": n(i.get("debtToEquity")), "pm": n(i.get("profitMargins")), "sec": i.get("sector"), "ed": ed}
    except Exception:
        return None
for name, (syms, sfx, ix) in LISTS.items():
    tk = [s + sfx for s in syms]
    df = yf.download(tk, period="1y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
    out = {}
    for s, t in zip(syms, tk):
        try:
            d = df[t].dropna(subset=["Close", "High", "Low"])
            if len(d) < 70:
                continue
            out[s] = {"c": [round(float(x), 2) for x in d.Close], "h": [round(float(x), 2) for x in d.High], "l": [round(float(x), 2) for x in d.Low], "v": [int(x) for x in d.Volume.fillna(0)], "last": round(float(d.Close.iloc[-1]), 2), "d": [str(x.date()) for x in d.index], "f": fund(t)}
        except Exception as e:
            print("skip", s, e)
    idx = [round(float(x), 2) for x in yf.Ticker(ix).history(period="1y")["Close"].dropna()]
    with open(f"data/{name}.json", "w") as f:
        json.dump({"t": int(time.time()), "i": idx, "s": out}, f, separators=(",", ":"))
    print(name, len(out), "symbols,", len(idx), "index bars")
