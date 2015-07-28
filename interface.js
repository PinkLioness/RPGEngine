'use strict';
var GAME = GAME || {};
GAME.interface = {
	classes:{},
	// If any of these are accessed before they're defined, that's a bug
	buttonArea:undefined,
	textArea:undefined,
	statArea:undefined,
	header:undefined,
	footer:undefined,
	middle:undefined,
	statContainers:{ // These variables are merely suggestions, they should be the same as the player stats all the time but might not be
		hp:undefined,
		lust:undefined,
		bellyVolume:undefined,
		////////////////////////////
		strength:undefined,
		dexterity:undefined,
		intelligence:undefined,
		wisdom:undefined,
		speed:undefined,
		constitution:undefined,
		sexuality:undefined,
		luck:undefined
	},




	addButton:function(text, buttonFunction){
		var button = document.createElement('button');
		button.innerHTML = text;
		button.addEventListener('click', buttonFunction);
		GAME.interface.buttonArea.appendChild(button);
	},
	clearButtons:function(){
		GAME.interface.buttonArea.innerHTML = ""; // TODO: This VERY probably causes problems, the buttons have functions that aren't removed before killing the buttons. Alê, help plz
	},
	drawButtons:function(){
		// Modders, read this if you don't understand the lack of arguments: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
		for (var i = 0; i < arguments.length; i++) {
			GAME.interface.addButton(arguments[i].text, arguments[i].buttonFunction);
		};
	},
	addText:function(text){
		GAME.interface.textArea.innerHTML += ('<p>' + text + '</p>');
	},
	clearText:function(){
		GAME.interface.textArea.innerHTML = "";
	},
	clearTextAndButtons:function(){
		this.clearText();
		this.clearButtons();
	},
	updatePlayerStats:function(player){
		// Use the player argument whenever it's sent, this is so battles are easier, we can easily set up fantasy battles, etc.
		if (player == undefined){ // But if it's not sent, well, it must be the main player object.
			player = GAME.p;
		}
		// TODO: updating
	},

	initMeter:function(name, max){
		var meter = new GAME.interface.classes.statBar(name, max);

		GAME.interface.statArea.appendChild(meter.container);

		return meter;
	},
	setWindowSize:function(){
		requestAnimationFrame(function(){
			var availableSize = window.innerHeight - (GAME.interface.header.offsetHeight + GAME.interface.footer.offsetHeight);
			if(availableSize < 460){availableSize = 460;}
			GAME.interface.textArea.style.height = GAME.interface.statArea.style.height = GAME.interface.middle.style.height = availableSize + 'px';
		});
	},

	init:function(){
		// These are set inside a function called after the DOMContentLoaded event just in case the DOM isn't fully built by the time the JS runs. Better play it safe.
		GAME.interface.buttonArea = document.getElementById('buttonArea');
		GAME.interface.textArea = document.getElementById('textArea');
		GAME.interface.statArea = document.getElementById('statArea');
		GAME.interface.header = document.getElementsByTagName('header')[0];
		GAME.interface.footer = document.getElementsByTagName('footer')[0];
		GAME.interface.middle = document.getElementsByClassName('middle')[0];

		GAME.interface.setWindowSize();
		window.addEventListener('resize', GAME.interface.setWindowSize);

		
		GAME.interface.statContainers['hp'] = GAME.interface.initMeter("HP");
		GAME.interface.statContainers['lust'] = GAME.interface.initMeter("Lust");
		GAME.interface.statContainers['bellyVolume'] = GAME.interface.initMeter("Belly volume");
		GAME.interface.statArea.appendChild(document.createElement('hr'));
		
		for(var stat in GAME.p.stats){ // Using the player stats to keep things updated, the interface class variables are merely suggestions
			var capitalizedName = stat.charAt(0).toUpperCase() + stat.substring(1);
			GAME.interface.statContainers[stat] = GAME.interface.initMeter(capitalizedName);
		}
	}
};


////////////////////////////////////////////////////////////////////
// Classes go here
// So far only the statbars

/**
 * Creates a meter bar and accompanying text. Inits the value to the max by default.
 *
 * @param name: The name displayed to the top left of the bar. Printed exactly as is.
 * @param max: Maximum value for the meter. Must be bigger than zero.
 *
 */
GAME.interface.classes.statBar = function(name, max){
	if (name == undefined){ alert('ERROR: Called the stat bar constructor without a name'); }
	if (max < 1){ alert('ERROR: called the stat bar constructor with max set to less than one!'); }
	if (max == undefined){ max = 100; }

	// This is required for things with a maximum that isn't 100.
	this.percentile = max / 100;

	this.container = document.createElement('div');
	this.topBar = document.createElement('p');
	this.meterBar = document.createElement('meter');

	this.container.className = 'statContainer';

	///////////////////////////////////////
	// Setting some sane values          //
	this.topBar.innerHTML = name;        //
	this.topBar.style.width = '100%';    //
	this.topBar.dataset.value = 100+'%'; //
	                                     //
	this.meterBar.max = max;             //
	this.meterBar.value = max;           //
	///////////////////////////////////////

	this.container.appendChild(this.topBar);
	this.container.appendChild(this.meterBar);
};
GAME.interface.classes.statBar.prototype.updateValue = function(value){
	var percentage = value / this.percentile;

	this.topBar.style.width = (percentage > 50 ? percentage : 50)+'%'; // Don't let the value get TOO close to the text2
	this.topBar.dataset.value = percentage + '%';

	this.meter.value = sprintf('%f.1%%', percentage);
};

GAME.interface.classes.statBar.prototype.updateMax = function(newMax){
	this.percentile = max / 100;
	this.meterBar.max = newMax;
	this.updateValue(this.meter.value); // Realign the top text.
};

////////////////////////////////////////////