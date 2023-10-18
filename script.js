
let powerPerLine = 1500;
let powerAverage = 0;
let averageValues = 5;

let myState = 0;

// Do not change code below this line!
let alertTimer = null;


function startMonitor() {
    alertTimer = Timer.set(2 * 1000,
        true,
        function () {
            Shelly.call("HTTP.GET", {
                    url: 'http://192.168.178.64/strom/'
                },
                function (res, error_code, error_msg, ud) {
                    if (error_code !== 0)
                    {
                        // Not read response if there is an error, to avoid that the script stops
                    }
                    else if (res.code === 200) {
                        let st = JSON.parse(res.body);
                        let current = st.psaldo;
                        
                        powerAverage = (powerAverage * averageValues + current) / (averageValues + 1);
                        
                        if("VersionA") {
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
                        
                        // modulo 3 for day switching of switches
                        // make it more generic
                        if(myState === 0) {
                            Shelly.call("Switch.Set", {"id": 0, "on": false});
                            Shelly.call("Switch.Set", {"id": 1, "on": false});
                            Shelly.call("Switch.Set", {"id": 2, "on": false});
                        }
                        if(myState === 1) {
                            Shelly.call("Switch.Set", {"id": 0, "on": true});
                            Shelly.call("Switch.Set", {"id": 1, "on": false});
                            Shelly.call("Switch.Set", {"id": 2, "on": false});
                        }
                        if(myState === 2) {
                            Shelly.call("Switch.Set", {"id": 0, "on": true});
                            Shelly.call("Switch.Set", {"id": 1, "on": true});
                            Shelly.call("Switch.Set", {"id": 2, "on": false});
                        }
                        if(myState === 3) {
                            Shelly.call("Switch.Set", {"id": 0, "on": true});
                            Shelly.call("Switch.Set", {"id": 1, "on": true});
                            Shelly.call("Switch.Set", {"id": 2, "on": true});
                        }

                        
                    };
                },
                null
            );
        },
        null
    );
}


startMonitor();
