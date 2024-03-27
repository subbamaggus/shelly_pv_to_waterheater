let turnOffTimer = null;

function turnOff() {
    turnOffTimer = Timer.set(600 * 1000,
        true,
        function () {
            try {
                Shelly.call("Switch.Set", {"id": 1, "on": false});
                Shelly.call("Switch.Set", {"id": 2, "on": false});
                Shelly.call("Switch.Set", {"id": 3, "on": false});
            } catch(exception) {
                print("exception: ", JSON.stringify(exception));
            }
        }
    );
}

turnOff();
