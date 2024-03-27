let turnOffTimer = null;

function turnOff() {
    turnOffTimer = Timer.set(600 * 1000,
        true,
        function () {
            try {
                Shelly.call("Switch.Set", {"id": switch1, "on": false});
                Shelly.call("Switch.Set", {"id": switch2, "on": false});
                Shelly.call("Switch.Set", {"id": switch3, "on": false});
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
}

turnOff();
