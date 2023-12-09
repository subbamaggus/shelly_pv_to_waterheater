let powerPerLine = 2000;
let powerAverage = 1040;
let averageValues = 3;
let current = 0;

let maxThreshold = 0;
let minThreshold = 0;

let myState = 0;
let myunixdayint = 0;
let myInput = false;

// Do not change code below this line!
let alertTimer = null;


function startMonitor() {
    alertTimer = Timer.set(10 * 1000,
        true,
        function () {
            getData();
            getDate();
            
            powerAverage = (powerAverage * averageValues + current) / (averageValues + 1);
            
            // get this info from in input switch
            if(myInput) {
                maxThreshold = powerPerLine;
                minThreshold = 0;
            }
            else { // Version B
                maxThreshold = 0;
                minThreshold = -1 * powerPerLine;
            }
            
            if(powerAverage > maxThreshold) {
                myState = myState + 1;
            }
            if(powerAverage < minThreshold) {
                myState = myState - 1;
            }
            
            if(myState < 0)
                myState = 0;
            if(myState > 3)
                myState = 3;
            
            print("powerCurrent " + JSON.stringify(current) + ", powerAverage " + JSON.stringify(powerAverage));
            print("minThreshold " + JSON.stringify(minThreshold) + ", maxThreshold " + JSON.stringify(maxThreshold));
            print("myState " + JSON.stringify(myState) + ", myunixdayint " + JSON.stringify(myunixdayint));
            print("myInput " + JSON.stringify(myInput));
            print("-----");
            
            // modulo 3 for day cycling of switches
            let switch1 = myunixdayint % 3;
            let switch2 = (myunixdayint + 1) % 3;
            let switch3 = (myunixdayint + 2) % 3;
            
            // make it more generic
            if(myState === 0) {
                Shelly.call("Switch.Set", {"id": switch1, "on": false});
                Shelly.call("Switch.Set", {"id": switch2, "on": false});
                Shelly.call("Switch.Set", {"id": switch3, "on": false});
            }
            if(myState === 1) {
                Shelly.call("Switch.Set", {"id": switch1, "on": true});
                Shelly.call("Switch.Set", {"id": switch2, "on": false});
                Shelly.call("Switch.Set", {"id": switch3, "on": false});
            }
            if(myState === 2) {
                Shelly.call("Switch.Set", {"id": switch1, "on": true});
                Shelly.call("Switch.Set", {"id": switch2, "on": true});
                Shelly.call("Switch.Set", {"id": switch3, "on": false});
            }
            if(myState === 3) {
                Shelly.call("Switch.Set", {"id": switch1, "on": true});
                Shelly.call("Switch.Set", {"id": switch2, "on": true});
                Shelly.call("Switch.Set", {"id": switch3, "on": true});
            }
        },
        null
    );
}

function getData() {
    Shelly.call("HTTP.GET", {
            url: 'http://192.168.178.119/cm?cmnd=status%2010'
        },
        function (res, error_code, error_msg, ud) {
            if (error_code !== 0) {
                print("error" + JSON.stringify(error_code));
                // Not read response if there is an error, to avoid that the script stops
            }
            else if (res.code === 200) {
                let st = JSON.parse(res.body);
                current = st.StatusSNS.SML.z16_7_0;
            };
        },
        null
    );
};

function getDate() {
    Shelly.call("Sys.GetStatus",
        {},
        function(result, err_code, err_message, user_data) {
            if (err_code === 0) {
                // processing successful result
                myunixdayint = result.unixtime / 86400 | 0;
            }
        },
        null
    );
}

function getInput() {
    Shelly.call(
        "switch.getStatus",
        { id: 0 },
        function (response) {
            myInput = response.output;
        },
        null
    );    
}

getInput();

startMonitor();