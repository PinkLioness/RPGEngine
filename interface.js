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
		money:undefined,
		assVolume:undefined,
		vaginalVolume:undefined,
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

	addMeter:function(meter){
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



		
		GAME.interface.statContainers['hp'] = GAME.interface.addMeter(new GAME.interface.classes.statBar('HP'));
		GAME.interface.statContainers['lust'] = GAME.interface.addMeter(new GAME.interface.classes.statBar("Lust"));
		GAME.interface.statContainers['money'] = GAME.interface.addMeter(new GAME.interface.classes.meterlessStatBar("Money", "copper", true));

		var divisions = [ // TODO: Figure out the best place for this to be
			{message:'Empty', percentage:0},
			{message:'A bit of', percentage:1},
			{message:'Pretty full with', percentage:25},
			{message:'Bloated with', percentage:50},
			{message:'Bursting with', percentage:70},
			{message:'Overflowing with', percentage:80},
			{message:'Bursting with', percentage:90}
		];
		GAME.interface.statContainers['assVolume'] = GAME.interface.addMeter(new GAME.interface.classes.textStatBarWithTypeOfContents('Ass', divisions, 100));
		GAME.interface.statContainers['vaginalVolume'] = GAME.interface.addMeter(new GAME.interface.classes.textStatBarWithTypeOfContents('Vagina', divisions, 100));

		GAME.interface.statArea.appendChild(document.createElement('hr'));
		
		for(var stat in GAME.p.stats){ // Using the player stats to keep things updated, the interface class variables are merely suggestions
			var capitalizedName = stat.charAt(0).toUpperCase() + stat.substring(1);
			GAME.interface.statContainers[stat] = GAME.interface.addMeter(new GAME.interface.classes.statBar(capitalizedName));
		}
	}
};
