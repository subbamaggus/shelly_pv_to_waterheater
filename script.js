let powerPerLine = 2000;

let powerAverage = powerPerLine + 1234;
let current = powerPerLine + 1234;
let averageValues = 1;

let maxThreshold = 0;
let minThreshold = 0;

let myState = 0;
let myunixdayint = 0;
let mycount = 0;

// Do not change code below this line!
let alertTimer = null;


function startMonitor() {
    alertTimer = Timer.set(10 * 1000,
        true,
        function () {
            getData();
            getDate();
            
            powerAverage = (powerAverage * averageValues + current) / (averageValues + 1);

            print("----- LOG -----");
            print("powerCurrent " + current + ", powerAverage " + powerAverage);

            mycount = mycount + 1;
            if(mycount < 3) {
                return;
            }
            mycount = 0;
                        
            maxThreshold = 0;
            minThreshold = -1 * powerPerLine;
            
            if(powerAverage > maxThreshold) {
                myState = myState - 1;
            }
            if(powerAverage < minThreshold) {
                myState = myState + 1;
            }
            
            // make sure that only allowed states are used
            if(myState < 0)
                myState = 0;
            if(myState > 3)
                myState = 3;
            
            // modulo 3 for day cycling of switches
            let switch1 = myunixdayint % 3;
            let switch2 = (myunixdayint + 1) % 3;
            let switch3 = (myunixdayint + 2) % 3;

            print("minThreshold " + minThreshold + ", maxThreshold " + maxThreshold);
            print("myState " + myState + ", myunixdayint " + myunixdayint);
            
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
            current = powerPerLine + 1234;
            if (error_code !== 0) {
                print("error" + error_code);
            }
            else if (res.code === 200) {
                let st = JSON.parse(res.body);
                if(undefined !== st.StatusSNS.SML.z16_7_0) {
                    current = st.StatusSNS.SML.z16_7_0;
                }
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
                myunixdayint = Math.floor(result.unixtime / 86400);
            }
        },
        null
    );
}


startMonitor();