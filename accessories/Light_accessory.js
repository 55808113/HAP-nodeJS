var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var mqtt = require('mqtt');
var MQTT_IP = 'localhost' //change this if your MQTT broker is different
var mqttMSG = false;

var name = "Sonoff T1 2 Outlet2"; //accessory name
var sonoffUsername = "8D:2D:31:42:5A:42";
var MQTT_NAME = 'sonoff-t1-2' //MQTT topic that was set on the Sonoff firmware


var options = {
  port: 1883,
  host: MQTT_IP,
//  username: 'pi', //enable only if you have authentication on your MQTT broker
//  password: 'raspberry', //enable only if you have authentication on your MQTT broker
  clientId: MQTT_NAME+'2Sonoff2T1'
};
var sonoffTopic = 'cmnd/'+MQTT_NAME+'/power2';
var client = mqtt.connect(options);

client.on('message', function(topic, message) {
//  console.log(message.toString());
  message = message.toString();
  mqttMSG = true;
  if (message.includes('ON')){
    sonoffObject.powerOn = true;
  }
  else{
    sonoffObject.powerOn = false;
  }
  sonoff
    .getService(Service.Outlet)
    .setCharacteristic(Characteristic.On,sonoffObject.powerOn);
});

client.on('connect', function () {
  client.subscribe('stat/'+MQTT_NAME+'/POWER2')
});

var LightController = {
  name: name, //name of accessory
  pincode: "031-45-154",
  username: sonoffUsername, // MAC like address used by HomeKit to differentiate accessories.
  manufacturer: "HAP-NodeJS", //manufacturer (optional)
  model: "v1.0", //model (optional)

  power: false, //curent power status

  outputLogs: false, //output logs

  setPower: function(status) { //set power of accessory

    //only publish a new state if the new state and current state are different
    if((status === true && this.power === false) || (status === false && this.power === true) ){

      //console.log("Setting new outlet state: " + status.toString());
      if(status === true){
        client.publish(sonoffTopic, 'on');
        this.power = true;
      }
      else{
        client.publish(sonoffTopic, 'off');
        this.power = false;
      }

      this.updateIOS();
    }

    if(this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off");
    this.power = status;
  },

  //get power of accessory
  getPower: function() {
    if(this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off");
    return this.power;
  },

  //update the IOS device with the current state of the accessory
  updateIOS: function(){
    lightAccessory
      .getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On)
      .updateValue(this.power);
  },

  identify: function() { //identify the accessory
    if(this.outputLogs) console.log("Identify the '%s'", this.name);
  }
}

var lightUUID = uuid.generate('hap-nodejs:accessories:light' + name);
var lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID);

lightAccessory.username = LightController.username;
lightAccessory.pincode = LightController.pincode;

lightAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
  .setCharacteristic(Characteristic.Model, LightController.model);

// listen for the "identify" event for this Accessory
lightAccessory.on('identify', function(paired, callback) {
  LightController.identify();
  callback();
});

lightAccessory
  .addService(Service.Lightbulb, LightController.name) // services exposed to the user should have "names" like "Light" for this case
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LightController.setPower(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, LightController.getPower());
  });