#shelly pro3 overenergy to waterheater

## function

reading data from hichi/bitshake adapter

https://wiki.ledhed.net/index.php?title=Tasmota_Command_Line_Options

i use:
    http://<IP>/cm?cmnd=status%2010
    status 10 (in clear)
    
json assumed as:

    {
        "StatusSNS": {
            "Time": "2023-03-22T21:42:51",
            "SML": {
                "server_id": "0a01484c59020013b862",
                "z16_7_0": 352.0315,
                "XXXXX": 0
            }
        }
    }

data is read from data.StatusSNS.SML.z16_7_0

averaging aver the last 3 readings.

if pv overproducton is more than the consumption of one phase of heater it will turn on one phase
if producton is still higher. it will turn on the next phase.

as of the day of year, the first phase will switch, to ensure that every phase is used equally.


great walkthrough:

https://hessburg.de/tasmota-wifi-smartmeter-konfigurieren/
https://homeitems.de/smartmeter-mit-tasmota-auslesen/#


my concrete reader is "DD3 2R06 DTA SMZ1"

https://tasmota.github.io/docs/Smart-Meter-Interface/#ebz-dd3-obis

one thing is important:
the default configuration comes with the line:

    1,77070100100700FF@1,Leistung,W,16_7_0,16

here it needed to be adjusted to

    1,77070100100700FF@1,Leistung,W,z16_7_0,16

javascript cannot decode JSON with an element starting with a number

so 16_7_0 >> z16_7_0 needed to be changed

