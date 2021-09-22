var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
//============================
//var request = require('request');
var $conf = require('../conf/conf');
var io = require('../conf/socketio-client');
//============================
var IRremoteLightController = {
  name: "IRremote Light", //name of accessory
  pincode: "031-45-154",
  username: "FF:3C:ED:5A:1A:1A", // MAC like address used by HomeKit to differentiate accessories. 
  manufacturer: "HAP-NodeJS", //manufacturer (optional)
  model: "v1.0", //model (optional)
  serialNumber: "A12S345KGB", //serial number (optional)

  power: false, //curent power status
  brightness: 100, //current brightness
  hue: 0, //current hue
  saturation: 0, //current saturation

  outputLogs: false, //output logs

  setPower: function(status) { //set power of accessory
    if(this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off");
    this.power = status;
    io.sendMessage({ "name" : "homekit_irremotelight_power","value" : IRremoteLightController.power});
	 /*
    request($conf.configuration.url + '',{
	   form: {
	     name: "homekit_irremotelight_power",
	     value: IRremoteLightController.power
	  	},
	   json: true
	 }, 
	 function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // 打印google首页
      }		
    })
    */
  },

  getPower: function() { //get power of accessory
    if(this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off");
    return this.power;
  },

  setBrightness: function(brightness) { //set brightness
    if(this.outputLogs) console.log("Setting '%s' brightness to %s", this.name, brightness);
    this.brightness = brightness;
    io.sendMessage({ "name" : "homekit_irremotelight_brightness","value" : IRremoteLightController.brightness});
    /*
    request($conf.configuration.url + '',{
	   form: {
	     name: "homekit_irremotelight_brightness",
	     value: IRremoteLightController.brightness
	  	},
	   json: true
	 }, 
	 function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // 打印google首页
      }		
    })
    */
  },

  getBrightness: function() { //get brightness
    if(this.outputLogs) console.log("'%s' brightness is %s", this.name, this.brightness);
    return this.brightness;
  },

  setSaturation: function(saturation) { //set brightness
    if(this.outputLogs) console.log("Setting '%s' saturation to %s", this.name, saturation);
    this.saturation = saturation;
    io.sendMessage({ "name" : "homekit_irremotelight_saturation","value" : IRremoteLightController.saturation});
    /*
    request($conf.configuration.url + '',{
	   form: {
	     name: "homekit_irremotelight_saturation",
	     value: IRremoteLightController.saturation
	  	},
	   json: true
	 }, 
	 function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // 打印google首页
      }		
    })
    */
  },

  getSaturation: function() { //get brightness
    if(this.outputLogs) console.log("'%s' saturation is %s", this.name, this.saturation);
    return this.saturation;
  },

  setHue: function(hue) { //set brightness
    if(this.outputLogs) console.log("Setting '%s' hue to %s", this.name, hue);
    this.hue = hue;
    io.sendMessage({ "name" : "homekit_irremotelight_hue","value" : IRremoteLightController.hue});
	 /*
    request($conf.configuration.url + '',{
	   form: {
	     name: "homekit_irremotelight_hue",
	     value: IRremoteLightController.hue
	  	},
	   json: true
	 }, 
	 function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // 打印google首页
      }		
    })
    */
  },

  getHue: function() { //get hue
    if(this.outputLogs) console.log("'%s' hue is %s", this.name, this.hue);
    return this.hue;
  },

  identify: function() { //identify the accessory
    if(this.outputLogs) console.log("Identify the '%s'", this.name);
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:light' + IRremoteLightController.name);

// This is the Accessory that we'll return to HAP-NodeJS that represents our light.
var lightAccessory = exports.accessory = new Accessory(IRremoteLightController.name, lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lightAccessory.username = IRremoteLightController.username;
lightAccessory.pincode = IRremoteLightController.pincode;

// set some basic properties (these values are arbitrary and setting them is optional)
lightAccessory
  .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, IRremoteLightController.manufacturer)
    .setCharacteristic(Characteristic.Model, IRremoteLightController.model)
    .setCharacteristic(Characteristic.SerialNumber, IRremoteLightController.serialNumber);

// listen for the "identify" event for this Accessory
lightAccessory.on('identify', function(paired, callback) {
  IRremoteLightController.identify();
  callback();
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
lightAccessory
  .addService(Service.Lightbulb, IRremoteLightController.name) // services exposed to the user should have "names" like "Light" for this case
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    IRremoteLightController.setPower(value);

    // Our light is synchronous - this value has been successfully set
    // Invoke the callback when you finished processing the request
    // If it's going to take more than 1s to finish the request, try to invoke the callback
    // after getting the request instead of after finishing it. This avoids blocking other
    // requests from HomeKit.
    callback();
  })
  // We want to intercept requests for our current power state so we can query the hardware itself instead of
  // allowing HAP-NodeJS to return the cached Characteristic.value.
  .on('get', function(callback) {
    callback(null, IRremoteLightController.getPower());
  });

// To inform HomeKit about changes occurred outside of HomeKit (like user physically turn on the light)
// Please use Characteristic.updateValue
// 
// lightAccessory
//   .getService(Service.Lightbulb)
//   .getCharacteristic(Characteristic.On)
//   .updateValue(true);

// also add an "optional" Characteristic for Brightness
lightAccessory
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('set', function(value, callback) {
    IRremoteLightController.setBrightness(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, IRremoteLightController.getBrightness());
  });

// also add an "optional" Characteristic for Saturation
lightAccessory
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Saturation)
  .on('set', function(value, callback) {
    IRremoteLightController.setSaturation(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, IRremoteLightController.getSaturation());
  });

// also add an "optional" Characteristic for Hue
lightAccessory
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Hue)
  .on('set', function(value, callback) {
    IRremoteLightController.setHue(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, IRremoteLightController.getHue());
  });
