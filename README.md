#shelly pro3 overenergy to waterheater

## function

reading data from hichi adapter

json assumed as:

    {
        "hostname": "amis",
        "psaldo": 1040,
        "qsaldo": -186,
        "wpf": 7419448,
        "wpr": 0,
        "wqf": 28565,
        "wqr": 2906946,
        "uptime": 0,
        "freememory": 35704,
        "time": 1555071841,
        "phase1": -100,
        "phase2": -100,
        "phase3": -100,
        "zeit": "2019-04-12 14:24:01",
        "ip": "10.0.0.141",
        "mac": "DC:4F:22:66:0B:A1",
        "rssi": "-61"
    }

data is read from data.psaldo

averaging aver the last 3 readings.

if pv overproducton is more than the consumptio of one phase of heater it will turn on one phase
if producton is still higher. it will turn on the next phase.

as of the day of year, the first phase will switch, to ensure that every phase is used equally.

