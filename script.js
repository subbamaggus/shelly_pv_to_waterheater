let powerPerLine = 2000;

// Do not change code below this line!

let powerAverage = powerPerLine + 1234;
let current = powerPerLine + 1234;
let averageValues = 1;

let myState = 0;
let myunixdayint = 0;
let mycount = 0;

// will be different later:
let maxThreshold = 0;
let minThreshold = -1 * powerPerLine;

let dataPollTimer = null;
let unixdayPollTimer = null;

function startMonitor() {
    dataPollTimer = Timer.set(10 * 1000,
        true,
        function () {
            try {
                getData();
                
                powerAverage = (powerAverage * averageValues + current) / (averageValues + 1);
                print("powerAverage " + powerAverage);
                
                // only use every third calls result
                mycount = mycount + 1;
                if(mycount < 3) {
                    return;
                }
                mycount = 0;
                            
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

                print("myState " + myState);
                
                // modulo 3 for day cycling of switches
                let switch1 = myunixdayint % 3;
                let switch2 = (myunixdayint + 1) % 3;
                let switch3 = (myunixdayint + 2) % 3;
                
                value1 = false;
                if(myState > 0) {
                    value1 = true;
                }
                value2 = false;
                if(myState > 1) {
                    value2 = true;
                }
                value3 = false;
                if(myState > 2) {
                    value3 = true;
                }
                print("value1 " + value1 + ", value2 " + value2 + ", value3 " + value3);
                
                Shelly.call("Switch.Set", {"id": switch1, "on": value1});
                Shelly.call("Switch.Set", {"id": switch2, "on": value2});
                Shelly.call("Switch.Set", {"id": switch3, "on": value3});
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
}

function getData() {
    Shelly.call("HTTP.GET", {
            url: 'http://192.168.178.119/cm?cmnd=status%2010'
        },
        function (res, error_code, error_msg, ud) {
            try {
                // if call is not successful, this should prevent the outputs from beeing turned on
                current = powerPerLine + 1234;
                if (error_code !== 0) {
                    print("error " + JSON.stringify(error_code));
                }
                else if (res.code === 200) {
                    let st = JSON.parse(res.body);
                    if(undefined !== st.StatusSNS.SML.z16_7_0) {
                        current = st.StatusSNS.SML.z16_7_0;
                        print("current " + current);
                    }
                };
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
};

function startDatePoll() {
    // get date is once per day enough
    unixdayPollTimer = Timer.set(86400 * 1000,
        true,
        function () {
            try {
                getDate();
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
}

function getDate() {
    Shelly.call("Sys.GetStatus",
        {},
        function(result, err_code, err_message, user_data) {
            try {
                if (err_code === 0) {
                    // processing successful result
                    myunixdayint = Math.floor(result.unixtime / 86400);
                    print("myunixdayint " + myunixdayint);
                }
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
}

//ensure the day is read before start
getDate();
startDatePoll();
startMonitor();
