'use strict';
var GAME = GAME || {};
GAME.interface = {
	// If any of these are accessed before they're defined, that's a bug
	buttonArea:undefined,
	textArea:undefined,
	statArea:undefined,


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

	init:function(){
		// These are set inside a function called after the DOMContentLoaded event just in case the DOM isn't fully built by the time the JS runs. Better play it safe.
		GAME.interface.buttonArea = document.getElementById('buttonArea');
		GAME.interface.textArea = document.getElementById('textArea');
		GAME.interface.statArea = document.getElementById('statArea');
	}
};