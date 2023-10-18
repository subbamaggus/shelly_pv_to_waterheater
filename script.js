 // IP from the remote shelly plug / plug-s we'd like to monitor
let remoteip = '192.168.178.64';


// the number of consecutive times the check will run until the appliance is considered as finished power consumption has to be below "minUsage" 
let timesInactive = 5; // in minutes

// minimum watts usage .. above this value the appliance is considered as "started".. 
// below this value and timesInactive is reached the appliance is considered as finished. 
let minUsage = 10; // Watts
// CONFIG END 


// Do not change code below this line!
let countInactive = 0;
let alertTimer = null;
let active = false;
let stopped = false;


function startMonitor() {
    alertTimer = Timer.set(2 * 1000,
        true,
        function () {
            Shelly.call("HTTP.GET", {
                    url: 'http://' + remoteip + '/strom/'
                },
                function (res, error_code, error_msg, ud) {
                    if (error_code !== 0)
                    {
                        // Not read response if there is an error, to avoid that the script stops
                    }
                    else if (res.code === 200) {
                        let st = JSON.parse(res.body);
                        let current = st.psaldo;
                        print("data" + JSON.stringify(current));
                   
                    };
                },
                null
            );
        },
        null
    );
}


print("mystart");
startMonitor();
print("myend");