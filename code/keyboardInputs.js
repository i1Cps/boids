// my own class / exported method to handle keyboard inputs and things of that nature
// author: me, To.thekid, aka mr nou

// initialize the listener
export var KeyboardInputs = function() {
    document.addEventListener("keydown", KeyboardInputs.onKeyDown)
    document.addEventListener("keyup", KeyboardInputs.onKeyUp)
}

// non character keyboard inputs
KeyboardInputs.keys = 
{  
    8: "backspace",  9: "tab",       13: "enter",    16: "shift", 
    17: "ctrl",     18: "alt",       27: "esc",      32: "space",
    33: "pageup",   34: "pagedown",  35: "end",      36: "home",
    37: "left",     38: "up",        39: "right",    40: "down",
    45: "insert",   46: "delete",   186: ";",       187: "=",
    188: ",",      189: "-",        190: ".",       191: "/",
    219: "[",      220: "\\",       221: "]",       222: "'"
}

// keep track of keys currently be
KeyboardInputs.status = {}

// get key code from name
KeyboardInputs.getKeyCode = function (keyName) {
    if(KeyboardInputs.keys[keyName] == null) {
        return String.fromCharCode(keyName);
    } else {
        return KeyboardInputs.keys[keyName]
    }
}

// on key up
KeyboardInputs.onKeyUp = function(event) {
    let key = KeyboardInputs.getKeyCode(event.keyCode);
    // if its currently in status update press attribute as its not pressed ahlie
    if (KeyboardInputs.status[key]) {
        KeyboardInputs.status[key].pressed = false;
    }
}

// on key down
KeyboardInputs.onKeyDown = function(event) {
    let key = KeyboardInputs.getKeyCode(event.keyCode);
    // if not already in status set up the attributes for new button pressed, then handle boolean in "update" function
    if (!KeyboardInputs.status[key]) {
        KeyboardInputs.status[key] = {down: false, pressed: false, up: false, beenUpdated: false};
    }
}

KeyboardInputs.prototype.update = function() {
	for (let key in KeyboardInputs.status){
		// ensure that every keypress has "down" status exactly once
		if (!KeyboardInputs.status[key].beenUpdated) {
			KeyboardInputs.status[key].down        		= true;
			KeyboardInputs.status[key].pressed     		= true;
			KeyboardInputs.status[key].beenUpdated = true;
		}
        // already been dealt wit updated previously
		else {
			KeyboardInputs.status[key].down = false;
		}

		// key has been flagged as "up" since last update
		if (KeyboardInputs.status[key].up) {
			// remove key from status dict
            delete KeyboardInputs.status[key];
			// move on to next key in status dict
            continue; 
		}
		
		if (!KeyboardInputs.status[key].pressed) {
            // this means key has been released ahk
			KeyboardInputs.status[key].up = true;
        }
	}
}

// function to handle when a key goes down
KeyboardInputs.prototype.down = function(keyName) {
    // checks if key has status down and exists in status dict
	return (KeyboardInputs.status[keyName] && KeyboardInputs.status[keyName].down);
}

// function to handle key "pressed" 
KeyboardInputs.prototype.pressed = function(keyName) {
    // checks if key has status pressed and exists in status dict
	return (KeyboardInputs.status[keyName] && KeyboardInputs.status[keyName].pressed);
}

// function to handle when a key goes up
KeyboardInputs.prototype.up = function(keyName) {
    // checks if key status up and exists in status dict
	return (KeyboardInputs.status[keyName] && KeyboardInputs.status[keyName].up);
}

// debugging function
KeyboardInputs.prototype.debug = function()
{
	var list = "Keys active: ";
	for (var arg in KeyboardInputs.status)
		list += " " + arg
	console.log(list);
}
