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

my wiring says that i need to use GPIO5

    +1,5,s,0,9600,SML,1

so my complete setup is:

    >D
    >B
    ;TelePeriod 30
    =>sensor53 r
    >M 1
    ; Device: eBZ DD3 2R06 DTA SMZ1
    ; protocol is D0 SML HEX
    ; 9600@7E1 for OP-type devices, 9600@8N1 for SM-type devices
    +1,5,s,0,9600,SML,1
    ; Zählerstand zu +A, tariflos, 
    ; Zählerstände Auflösung 10 µW*h (6 Vorkomma- und 8 Nachkommastellen)
    1,77070100010800FF@100000000,Energie Bezug,kWh,1_8_0,8
    ; Zählerstand zu +A, Tarif 1
    1,77070100010801FF@100000000,Energie Bezug T1,kWh,1_8_1,8
    ; Zählerstand zu +A, Tarif 2
    1,77070100010802FF@100000000,Energie Bezug T2,kWh,1_8_2,8
    ; Zählerstand zu -A, tariflos
    1,77070100020800FF@100000000,Energie Export,kWh,2_8_0,8
    ; Summe der Momentan-Leistungen in allen Phasen, Auflösung 0,01W (5 Vorkomma- und 2 Nachkommastellen)
    1,77070100100700FF@1,Leistung,W,z16_7_0,16
    ; Momentane Leistung in Phase Lx, Auflösung 0,01W (5 Vorkomma- und 2 Nachkommastellen)
    1,77070100240700FF@1,Leistung L1,W,36_7_0,16
    1,77070100380700FF@1,Leistung L2,W,56_7_0,16
    1,770701004C0700FF@1,Leistung L3,W,76_7_0,16
    ; Spannung in Phase Lx, Auflösung 0,1V (nur über MSB)
    ;1,77070100200700FF@1,Spannung L1,V,32_70,1
    ;1,77070100340700FF@1,Spannung L2,V,52_7_0,1
    ;1,77070100480700FF@1,Spannung L3,V,72_7_0,1
    ; Statuswort, 4 Byte Information über den Betriebszustand, HEX string
    ; tasmota can decode one string per device only!
    ;1,1-0:96.5.0*255@#),Status1,,96_5_0,0
    ;1,1-0:96.8.0*255@#),Status2,,96_8_0,0
    ; Geräte-Identifikation, Nach DIN 43863-5 
    1,77070100000009FF@#),Identifikation,,96_1_0,0
    ;1,77070100000000FF@#),Identifikation,,0_0_0,0

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


           pv feed       |       withdrawel
       -(powerPerLine)   0      powerPerLine
    ----------|----------|----------|-----------
    UUUUUUUUUU|SSSSSSSSSS|DDDDDDDDDD|DDDDDDDDDD             SW0 1 | SW1 0 (Version A)
    UUUUUUUUUU|UUUUUUUUUU|SSSSSSSSSS|DDDDDDDDDD             SW0 0 | SW1 0 (Version B)
    HHHHHHHHHH|HHHHHHHHHH|HHHHHHHHHH|HHHHHHHHHH             SW0 X | SW1 1 (Version C)
    
    U Step Up a level
    S Stay on that level
    D Step Down a level
    H use value from Heatpump (SW2)
    
    PowerPerLine is the energy consumption of one phase of the water heater, in my case 2000 [W] (see script)
    
in preparation:
second input is used to overwrite function and use heatpump control as input
