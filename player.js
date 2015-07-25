'use strict';
var GAME = GAME || {};
GAME.p = {
	cumInside:{vagina:0, ass:0},
	cumLimit:1500,
	vaginalCumLimit:500,
	soreness:{vagina:0, ass:0},
	basePregnancyRate:1,
	addiction:0,
	lust:50,
	tired:0,
	cash:300,
	canGetPregnantFrom:{vagina:true, ass:false}, canGetPregnant:function(){return GAME.p.canGetPregnantFrom.ass || GAME.p.canGetPregnantFrom.vagina;},
	hasVagina:true,
	hasBreasts:true, // TODO: Think on a structure for breast size. TODO: Think on what breast size should do, possibly serve to train strenght, constitution and dexterity faster while lowering dexterity and strenght while they're big
	hasPenis:true,
	currentlyInHeat:false,

	reset:function(){
		this.cumInside ={vagina:{amount:0, type:''},
						 ass:{amount:0, type:''}
						};
		this.cumLimit = 1500;
		this.vaginalCumLimit = 500;
		this.soreness = {vagina:0, ass:0};
		this.basePregnancyRate = 1;
		this.addiction = 0;
		this.canGetPregnantFrom = {vagina:true, ass:false};
		this.hasVagina = true;
		this.hasBreasts = true;
		this.hasPenis = true;

		for (var i = this.upgrades.length - 1; i >= 0; i--) {
			this.upgrades[i].bought = false;
		};
	},
	upgrades:[
	// TODO: Move all upgrades from here to the upgrade shop whenever it's done
	// TODO: Think on more of these
	// TODO: Think more on the structure of each upgrade:
	/* 1- An onlyIf parameter is needed, for male-only items, only if breasts/dick are bigger than a certain size, etc etc. The best way is to probably make it be a function?
	 * 2- Maybe a better way to define what each upgrade affects? Events would make this VERY easy on the modders, not so much for the main coders
	 * 3- Maybe a timer, as some only work for some time?
	 */
		{
			fancyName:"MPreg",
			description:"Allows you to get pregnant from your ass, and allows men to get in heat for extra cum.",
			affectsCash:false,
			affectsCum:false,
			onPurchase:function(){p.canGetPregnantFrom.ass = true;},
			onSex:doesNothing,
			bought:false,
			price:50,
			onlyIf:function(){return !GAME.p.canGetPregnantFrom.ass;}
		},
		
		{
			fancyName:"Size Queen",
			affectsCash:false,
			affectsCum:false,
			onPurchase:function(){ 
				alert('HOW THE FUCK DO I PATCH THIS IN OMG'); // TODO: figure this out, more probably give up because this doesn't really makes sense, though if it doesn't makes much sense might as well add it to a possible mode in the cheat mode?
				// Dica do alê: fazer um GAME.events.monsterGenerated.dispatch() e capturar ele, praí aumentar o bixo
			},
			onSex:doesNothing,
			bought:false,
			price:50
		},
		
		{
			fancyName:"Birth control",
			affectsCash:false,
			affectsCum:false,
			onPurchase:function(){p.canGetPregnantFrom.vagina = false; // TODO: Add a timer to this one if it's decided to do so
								  p.canGetPregnantFrom.ass = false;},
			onSex:doesNothing,
			bought:false,
			price:50,
			onlyIf:function(){return GAME.p.canGetPregnant();}
		}
	],
	applyCashUpgrades:function(cash){
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].bought && this.upgrades[i].affectsCash) {
				cash = this.upgrades[i].does(cash);
			};
		};
		
		return cash;
	},
	applyCumUpgrades:function(cum){
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].bought && this.upgrades[i].affectsCum) {
				cum = this.upgrades[i].does(cum);
			};
		};
		
		return cum;
	},
	applyLustUpgrades:function(lust){
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].bought && this.upgrades[i].affectsLust) {
				lust = this.upgrades[i].does(lust);
			};
		};
		
		return lust;
	},
	applyAddictionUpgrades:function(addiction){
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].bought && this.upgrades[i].affectsLust) {
				addiction = this.upgrades[i].does(addiction);
			};
		};
		
		return addiction;
	},
	applyTiredUpgrades:function(tired){
		for (var i = 0; i < this.upgrades.length; i++) {
			if (this.upgrades[i].bought && this.upgrades[i].affectsLust) {
				tired = this.upgrades[i].does(tired);
			};
		};
		
		return tired;
	},
	treatOverflow:function(where){
		if (where == 'vagina'){
			if (this.cumInside.vagina.amount > this.vaginalCumLimit){
				var overflow = (this.cumInside.vagina.amount - this.vaginalCumLimit);
				
				this.soreness.vagina.amount += overflow / 10; // extra pain because overfilling
				
				// reset amount of cum to limit
				this.cumInside.vagina.amount = this.vaginalCumLimit;
				
				// increase limits a bit after resetting // TODO: PASS THESE TO SKILL-INCREASE-RELATED FUNCTIONS
				this.vaginalCumLimit += overflow / 10;
				this.cumLimit += overflow / 10;
				
				
				// text about leaking from vagina
			};
			
			if ((this.cumInside.ass.amount + this.cumInside.vagina.amount) > this.cumLimit){
				var overflow = (this.cumInside.ass.amount + this.cumInside.vagina.amount) - this.cumLimit;
				this.cumLimit += overflow / 10; // increase limit a little bit // TODO: PASS THESE TO SKILL-INCREASE-RELATED FUNCTIONS
				
				this.cumInside.ass.amount -= overflow;
				
				// text about leaking from ass
			};
		}else{
			if ((pthis.cumInside.ass.amount + this.cumInside.vagina.amount) > this.cumLimit){
				var overflow = (this.cumInside.ass.amount + this.cumInside.vagina.amount) - this.cumLimit;
				this.soreness.ass += overflow / 10; // extra pain because overfilling
				this.cumLimit += overflow / 10; // increase limit a little bit // TODO: PASS THESE TO SKILL-INCREASE-RELATED FUNCTIONS
				
				this.cumInside.ass.amount -= overflow;
				
				// text about leaking from ass
			};
		};
	},
	inHeat:function(){
		// Technically I could make everything access that variable instead, but since the point is ease of modification instead of performance...
		return this.currentlyInHeat;
	},
	/*
	 *
	 *
	 *
	 *
	 */
	addLust:function(times){
		var lustToBeAdded = times * 10; // TODO: Test in gameplay if this works.
		lustToBeAdded = this.applyLustUpgrades(lustToBeAdded);
		
		this.lust += lustToBeAdded;
	},
	addAddiction:function(value){
		value = this.applyAddictionUpgrades(value);
		
		this.addiction += value;
	},
	addTired:function(value){
		value = this.applyTiredUpgrades(value);
		
		this.tired += value;
		
		// Negative values may be passed so we must check for negative tiredness
		if (this.tired < 0){this.tired = 0;};
	},
	addCum:function(where, cumAmount, monsterType){
		this.cumInside[where].amount += cumAmount; // add cum
		
		if(this.cumInside[where].type == ''){ // if nothing is there
			this.cumInside[where].type = monsterType; // then the cum type in that hole is the monster's type.
		}else if(this.cumInside[where].type != monsterType){ // If the type being added is different than the type that's already there
			this.cumInside[where].type = 'mixed'; // The type becomes mixed
		}
		
		this.treatOverflow(where);
	},
	changeLustToAfterOrgasm:function(){
		this.lust = 20; // TODO: Think more on this, probably perks to change this value.
	},
	texts:{
		generateOrgasmText:function(){ // TODO
			var baseTexts = ['You let off a long, pleased moan, as ', 'You scream in bliss, the sensations moving your body as ', ];
			var text = '';
			if(GAME.p.hasPenis){
				;
			}
		}
	}
	skills:[
		{
			name: 'Attack',
			canUse: true,
			attackType: 'physical',
			element: 'physical',
			strenght:{used:true, min:0, max:0},
			dexterity:{used:true, min:0, max:0},
			intelligence:{used:true, min:0, max:0},
			wisdom:{used:true, min:0, max:0},
			speed:{used:true, min:0, max:0},
			constitution:{used:true, min:0, max:0},
			sexuality:{used:true, min:0, max:0},
		},
		{

		}
	]
};