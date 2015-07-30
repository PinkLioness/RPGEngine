/**
 * Creates a meter bar and accompanying text. Inits the value to the max by default.
 *
 * @param name: The name displayed to the top left of the bar. Printed exactly as passed.
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

	this.container.classList.add('statContainer');
	this.container.classList.add('statBar');

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
GAME.interface.classes.statBar.prototype.updateValue = function(newValue){
	if(newValue > this.max){
		this.wentOverMax(newValue, this.max);
		this.value = this.max;
	}else if(newValue < 0){
		this.value = 0;
		this.fellUnderZero(newValue);
	}else{
		this.value = newValue;
	}

	var percentage = this.value / this.percentile;

	this.topBar.style.width = (percentage > 50 ? percentage : 50)+'%'; // Don't let the value get TOO close to the text2
	this.topBar.dataset.value = sprintf('%.1f%%', percentage);

	this.meterBar.value = percentage;
};

GAME.interface.classes.statBar.prototype.updateMax = function(newMax){
	if(this.value > newMax){
		this.wentOverMax(this.value, newMax);
		this.value = newMax;
	}

	this.percentile = max / 100;
	this.meterBar.max = newMax;
	this.updateValue(this.meterBar.value); // Realign the top text.
};
// These run when the update means the condition in their name happens
GAME.interface.classes.statBar.prototype.wentOverMax = doesNothing;
GAME.interface.classes.statBar.prototype.fellUnderZero = doesNothing;

////////////////////////////////////////////

/**
 * Creates a meterless stat bar, as in: Gold: 123 coins or Hands free: 1/2. 
 * CANNOT BE NEGATIVE
 * Inits the value to zero by default.
 *
 * @param name: The name displayed to the top left of the bar. Printed exactly as passed.
 * @param units: Text displayed to the right of the value. Can be undefined.
 * @param limitless: true if you can collect infinite things, false if you have an upper limit.
 * @param max: Maximum value for the stat. Must be bigger than zero. Ignored if limitless is true.
 *
 */
GAME.interface.classes.meterlessStatBar = function(name, unit, limitless, max){
	if (name == undefined){
		alert('ERROR: Called the meterless stat bar constructor without a name');
	}else{
		this.statName = name;
	}

	this.unit = (unit == undefined) ? '' : unit;
	
	this.max = Infinity;
	this.formattedMax = '';
	this.limitless = limitless;
	if(!limitless){
		if (max < 1){ alert('ERROR: called the meterless stat bar constructor with max set to less than one!'); }
		if (max == undefined){ max = 100; }

		this.max = max;
		this.formattedMax = '/'+max;
	}

	this.container = document.createElement('div');
	this.topBar = document.createElement('p');

	this.container.classList.add('statContainer');
	this.container.classList.add('meterlessStatBar');

	///////////////////////////////////////
	// Setting some sane values          //
	this.value = 0;                      //
	this.topBar.innerHTML = sprintf('%s: %u%s %s', this.statName, this.value, this.formattedMax, this.unit);
	this.topBar.style.width = '100%';    //
	///////////////////////////////////////

	this.container.appendChild(this.topBar);
};
GAME.interface.classes.meterlessStatBar.prototype.updateValue = function(newValue){
	if(newValue > this.max){
		this.wentOverMax(newValue, this.max);
		this.value = this.max;
	}else if(newValue < 0){
		this.value = 0;
		this.fellUnderZero(newValue);
	}else{
		this.value = newValue;
	}

	this.topBar.innerHTML = sprintf('%s: %u%s %s', this.statName, this.value, this.formattedMax, this.unit);
};

GAME.interface.classes.meterlessStatBar.prototype.updateMax = function(newMax){
	if(this.value > newMax){
		this.wentOverMax(this.value, newMax);
		this.value = newMax;
	}

	this.max = newMax;
	this.updateValue(this.value);
};
GAME.interface.classes.meterlessStatBar.prototype.wentOverMax = doesNothing;
GAME.interface.classes.meterlessStatBar.prototype.fellUnderZero = doesNothing;

////////////////////////////////////////////

/**
 * Creates a text stat bar, as in: Gold: heavy purse. Use this to hide the true value from the player.
 * Values supported are 0 to max, inclusive.
 * Inits the value to zero by default and prints the first division..
 * Percentagess are checked with an if(this.numberValue < percentage). This means that if the percentage is at 50 and value is 50, it will print the message for 50+.
 *
 * @param name: The name displayed to the top left of the bar. Printed exactly as passed.
 * @param divisions: Array of {message:string, percentage:number}. 
 * @param max: Maximum value for the stat. Must be bigger than the last division.
 *
 */
GAME.interface.classes.genericTextStatBar = function(name, divisions, max){
	if (name == undefined){
		alert('ERROR: Called the text stat bar constructor without a name');
	}else{
		this.statName = name;
	}

	this.percentile = max / 100;
	this.messages = [];
	this.percentages = [];
	if (divisions == undefined || divisions.length == 0){
		alert('ERROR: Called the text stat bar constructor without divisions');
	}else{
		divisions.sort(function(a, b){return a.percentage - b.percentage;});
		for(var i = 0; i < divisions.length; i++){
			this.messages.push(divisions[i].message);
			this.percentages.push(divisions[i].percentage);
		}
	}
	if(max == undefined || max <= this.percentages[this.percentages.length - 1]){
		alert('ERROR: Called the text stat bar constructor without max or with max smaller than the last division');
	}

	this.container = document.createElement('div');
	this.topBar = document.createElement('p');

	this.container.classList.add('statContainer');
	this.container.classList.add('textStatBar');

	///////////////////////////////////////
	// Setting some sane values          //
	this.value = 0;                      //
	this.topBar.innerHTML = sprintf('%s: %s', this.statName, this.messages[0]);
	this.topBar.style.width = '100%';    //
	///////////////////////////////////////

	this.container.appendChild(this.topBar);
};
GAME.interface.classes.genericTextStatBar.prototype.updateValue = function(newValue){
	if(newValue > this.max){
		this.wentOverMax(newValue, this.max);
		this.value = this.max;
	}else if(newValue < 0){
		this.value = 0;
		this.fellUnderZero(newValue);
	}else{
		this.value = newValue;
	}

	var percentage = this.value / this.percentile;

	var i = 0;
	while(this.percentages[i] != undefined && percentage >= this.percentages[i]){
		i += 1;
	}
	i -= 1; // This is because the above loop exits on fail, not before fail, so we need to revert the state

	this.topBar.innerHTML = sprintf('%s: %s', this.statName, this.messages[i]);
};

GAME.interface.classes.genericTextStatBar.prototype.updateMax = function(newMax){
	if(this.value > newMax){
		this.wentOverMax(this.value, newMax);
		this.value = newMax;
	}

	this.percentile = newMax / 100;
	this.max = newMax;
	this.updateValue(this.value);
};
GAME.interface.classes.genericTextStatBar.prototype.wentOverMax = doesNothing;
GAME.interface.classes.genericTextStatBar.prototype.fellUnderZero = doesNothing;


///////////////////////////////////////////////////////////////

GAME.interface.classes.textStatBarWithTypeOfContents = function(){
	this.hole = (arguments[0] == 'Ass') ? 'ass' : 'vagina'; // So we can catch the event and use this data like GAME.p.something[hole]
	GAME.interface.classes.genericTextStatBar.apply(this, arguments);
};
GAME.interface.classes.textStatBarWithTypeOfContents.prototype = Object.create(GAME.interface.classes.genericTextStatBar.prototype);
GAME.interface.classes.textStatBarWithTypeOfContents.prototype.updateValue = function(newValue, monsterName){
	this.prototype.updateValue.apply(this, [newValue]);
	this.topBar.innerHTML = sprintf('%s %s', this.topBar.innerHTML, monsterName);
	console.log(this.topBar.innerHTML);
};

GAME.interface.classes.textStatBarWithTypeOfContents.prototype.wentOverMax = function(value, max){document.dispatchEvent(new CustomEvent('statWentOverMax', {'value':value, 'max': max, 'hole': hole}));};
GAME.interface.classes.textStatBarWithTypeOfContents.prototype.fellUnderZero = function(value){document.dispatchEvent(new CustomEvent('statFellUnderZero', {'value':value, 'hole': hole}));};