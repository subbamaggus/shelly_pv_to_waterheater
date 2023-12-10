# shelly pro3 spare energy to waterheater

## purpose

a script for a shelly 3pro to control a water heater with spare PV energy.

read data from a tasmota meter reader.
use data to control water heater with shelly.

## great walkthrough to setup the system

https://hessburg.de/tasmota-wifi-smartmeter-konfigurieren/

https://homeitems.de/smartmeter-mit-tasmota-auslesen/#


## setup tasmota/esp

my reader is "DD3 2R06 DTA SMZ1"

https://tasmota.github.io/docs/Smart-Meter-Interface/#ebz-dd3-obis

one thing is important:
the default configuration comes with the line:

    1,77070100100700FF@1,Leistung,W,16_7_0,16

here it needed to be adjusted to

    1,77070100100700FF@1,Leistung,W,z16_7_0,16

javascript cannot decode JSON with an element starting with a number

so "16_7_0" >> "z16_7_0" needed to be changed


## read data from tasmota

reading data from hichi/bitshake adapter

https://wiki.ledhed.net/index.php?title=Tasmota_Command_Line_Options

i use:
    
    http://[IP]/cm?cmnd=status%2010
    "status 10" (in clear)
    
result in json assumed as (with my setup):

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


## parsing data with shelly

data is read from data.StatusSNS.SML.z16_7_0

averaging the last 3 readings.

if pv overproducton is more than the consumption of one phase of heater, it will turn on one phase
if producton is still higher. it will turn on the next phase.

as of the day of year, the first phase will switch, to ensure that every phase is used equally.

one input is used to allow different aproaches while active



       -(powerPerLine)   0      powerPerLine
    ----------|----------|----------|-----------
    UUUUUUUUUU|SSSSSSSSSS|DDDDDDDDDD|DDDDDDDDDD             SW1 1 | SW2 0
    UUUUUUUUUU|UUUUUUUUUU|SSSSSSSSSS|DDDDDDDDDD             SW1 0 | SW2 0
    HHHHHHHHHH|HHHHHHHHHH|HHHHHHHHHH|HHHHHHHHHH             SW1 X | SW2 1
    
    U Step Up a level
    S Stay on that level
    D Step Down a level
    H use value from Heatpump
    
in preparation:
second input is used to overwrite function and use heatpump control as input
