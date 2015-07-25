'use strict';
var GAME = GAME || {};

GAME.battle = {
	monster:undefined,
	player:undefined,

	/**
	 * Calling this starts a loop that takes complete control until either the fight ends or the stopIf function returns true.
	 * @param Player player - The player object. It's passed into the function so you can write some quest where you have a fight inside a dream or something without modifying the actual player stats.
	 * @param String monsterType - The name of the internal reference to the monster
	 * @param Function(player, monster) stopIf - Optional, returns either undefined if the condition is not fulfilled, or an object
	 *
	 * @return Object {
	 		Boolean playerWon - If the player won
			Player player - The player modified after all the battle effects
		}
	 */
	startFight:function(player, monsterType, stopIf){
		if(GAME.monsters[monsterType] == undefined){
			alert('The monster '+monsterType+' does not exist, this is a bug.');
		};
		
		// Filling in the stopIf parameter so we can call it later without raising problems
		if(stopIf == undefined){
			stopIf = function(){return undefined;};
		};
		GAME.battle.stopIf = stopIf;

		// Stop bad coders from sending a dead player into battle
		if(GAME.battle.isDefeated(player)){
			return {
				playerWon:false,
				player:player
			};
		};

		var someoneDefeated = false;
		GAME.battle.monster = GAME.battle.cloneMonster(GAME.monsters[monsterType]);
		GAME.battle.monster.generateNew();
		GAME.battle.monster.health = 100;

		while( !someoneDefeated || stopIf(player, monster) ){
			GAME.battle.simulateRound(GAME.battle.getPlayerInput(player));

			if(GAME.battle.isDefeated(monster) || GAME.battle.isDefeated(player)){
				someoneDefeated = true;
			};
		}

		var playerWon = GAME.battle.isDefeated(monster);
		return {
			playerWon:playerWon,
			player:player
		};
	},
 	
	cloneMonster:function(reference){
		var clone = {};
		for(var i in reference){
			if(typeof(reference[i])=="object" && reference[i] != null){
				clone[i] = cloneObject(reference[i]);
			}else{
				clone[i] = reference[i];
			}
		}
		return clone;
	},

	generateButtons:function(player){
		function generateAttackFunction(attack){
			// Read this to understand why this function is needed: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
			var attackClosure = attack;
			return function(){
				GAME.battle.doBattleRound(attackClosure);
			}
		}
		
		var attackList = [];
		for(var i=0; i < this.player.skills.length; i++){
			if (this.player.skills[i].canUse == true){
				var attackFunction = generateAttackFunction(this.player.skills[i]);
				
				attackList.push({text:this.player.skills.name, buttonFunction:attackFunction});
			};
		};

		// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
		GAME.interface.drawButtons.apply(undefined, attackList);
	},

	doBattleRound:function(attack){
		/**
		 * @param attack - Object, contains all attack data for any possible attack, used in the calculation to set all possible variables at once.
		 	{
				attackType: String - Either "physical" or "magical". Anything else gives an error.
				element: String - String containing the damage type for magic (fire, ice, energy...). May be used for enchanted weapons too.

				strenght: Object {
					used - Boolean, defines if strenght is used in the calculation. To make it be used but not variable, min and max must be 0.
					min - minimum percentage for the modifier, should work for negatives
					max - maximum percentage
				}
				dexterity, intelligence, wisdom, speed, constitution, sex - Objects following the rules of the one above
			}
		 *
		 */
		var attackPowerFunction = undefined;
		if (attack.attackType == "physical"){
			attackPowerFunction = this.player.getPhysicalAttackPower;
		}else if(attack.attackType == "magical"){
			attackPowerFunction = this.player.getMagicalAttackPower;
		}else{
			attackPowerFunction = function(){alert('BUG ALERT! The attack type is not physical neither magical!');};
		};

		var playerAttackPower = attackPowerFunction();
		playerAttackPower += (attack.strenght.used ? (randomPercentageMultiplierFromInterval(attack.strenght.min, attack.strenght.max) * this.player.getStrenght()) : 0);
		playerAttackPower += (attack.dexterity.used ? (randomPercentageMultiplierFromInterval(attack.dexterity.min, attack.dexterity.max) * this.player.getDexterity :) 0);
		playerAttackPower += (attack.intelligence.used ? (randomPercentageMultiplierFromInterval(attack.intelligence.min, attack.intelligence.max) * this.player.getIntelligence()) : 0);
		playerAttackPower += (attack.wisdom.used ? (randomPercentageMultiplierFromInterval(attack.wisdom.min, attack.wisdom.max) * this.player.getWisdom()) : 0);
		playerAttackPower += (attack.speed.used ? (randomPercentageMultiplierFromInterval(attack.speed.min, attack.speed.max) * this.player.getSpeed()) : 0);
		playerAttackPower += (attack.constitution.used ? (randomPercentageMultiplierFromInterval(attack.constitution.min, attack.constitution.max) * this.player.getConstitution()) : 0);
		playerAttackPower += (attack.sexuality.used ? (randomPercentageMultiplierFromInterval(attack.sexuality.min, attack.sexuality.max) * this.player.getSexuality() ) : 0);
		playerAttackPower += this.player.calculateLuck();

		var monsterDefense = this.monster.getDefense({type:attack.attackType, element:attack.element});
		var damageToEnemy = playerAttackPower - monsterDefense;
		this.monster.health -= damageToEnemy;

		GAME.battle.printPlayerHitMessage(attack, damageToEnemy);

		if(this.monster.health > 0){
			var monsterAttack = GAME.battle.monster.skills[randomIntFromInterval(0, GAME.battle.monster.skills.length - 1)];
			var playerDefense = this.player.getDefense({type:monsterAttack.attackType, element:monsterAttack.element});
			var damageToPlayer = monsterAttack.getAttackPower() - playerDefense;

			this.player.health -= damageToPlayer;
			GAME.battle.printMonsterHitMessage(damageToPlayer, monsterAttack);
		};

		this.checkState();
	},

	checkState:function(){
		var stopIfCondition = stopIf(this.player, this.monster);

		if(this.isDefeated(this.player)){
			this.battleOver({playerWon:false,player:player});
		}else if(this.isDefeated(this.monster)){
			this.battleOver({playerWon:true,player:player});
		}else if(stopIfCondition != undefined){
			this.battleOver(stopIfCondition);
		}else{
			this.generateButtons(); // next battle round
		};
	},

	printMonsterHitMessage:function(damageToPlayer, monsterAttack){
		var monsterAttackText = monsterAttack.attackText[randomIntFromInterval(0, GAME.battle.monster.skills.length - 1)];
		GAME.interface.addText("The "+GAME.battle.monster.longName+' '+monsterAttackText+" you for "+damageToPlayer+"% of your HP!");
	},
	printPlayerHitMessage:function(damageToEnemy){};
};