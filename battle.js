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
		// Filling in the stopIf parameter so we can call it later without raising problems
		if(stopIf == undefined){
			stopIf = function(){return false;};
		};
		GAME.battle.stopIf = stopIf;

		if(GAME.monsters[monsterType] == undefined){
			alert('The monster '+monsterType+' does not exist, this is a bug.');
		};
		var someoneDefeated = false;
		////////////////////////////
		// GAME.battle.monster = GAME.battle.cloneMonster(GAME.monsters[monsterType]); // This is so we don't destroy the original monster in the monsters array
		// This might be a clearer way to do what we want // TODO: Test this
		GAME.battle.monster = Object.create(GAME.monsters[monsterType]);
		/////////////////////////
		GAME.battle.monster.lust = 0;
		GAME.battle.monster.health = 100;
		GAME.battle.monster.generateNew();

		GAME.battle.player = player;
		// Stop bad coders from sending a dead player into battle
		GAME.battle.checkState();

		GAME.interface.clearTextAndButtons();
		GAME.battle.monsterIntro();
		GAME.battle.updateHPDisplay();

		GAME.battle.generateButtons(GAME.battle.player);
	},
	
	cloneMonster:function(reference){
		var clone = {};
		for(var i in reference){
			if(typeof(reference[i])=="object" && reference[i] != null){
				clone[i] = GAME.battle.cloneMonster(reference[i]);
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
		for(var i=0; i < GAME.battle.player.skills.length; i++){
			if (GAME.battle.player.skills[i].canUse == true){
				var attackFunction = generateAttackFunction(GAME.battle.player.skills[i]);
				
				attackList.push({text:GAME.battle.player.skills[i].name, buttonFunction:attackFunction});
			}
		};

		GAME.interface.clearButtons();

		// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
		GAME.interface.drawButtons.apply(undefined, attackList);
	},

	doBattleRound:function(attack){
		/**
		 * @param attack - Object, contains all attack data for any possible attack, used in the calculation to set all possible variables at once.
		 	{
				attackType: String - Either "physical" or "magical". Anything else gives an error.
				element: String - String containing the damage type for magic (fire, ice, energy...). May be used for enchanted weapons too.
				attacksStat: String - Must be a Number defined on the monster.

				strength: Object {
					used - Boolean, defines if strength is used in the calculation. To make it be used but not variable, min and max must be 0.
					min - minimum percentage for the modifier, should work for negatives
					max - maximum percentage
				}
				dexterity, intelligence, wisdom, speed, constitution, sexuality - Objects following the rules of the one above
			}
		 *
		 */
		var attackPowerFunction = undefined;
		if (attack.attackType == "physical"){
			attackPowerFunction = GAME.battle.player.getPhysicalAttackPower;
		}else if(attack.attackType == "magical"){
			attackPowerFunction = GAME.battle.player.getMagicalAttackPower;
		}else{
			attackPowerFunction = function(){alert('BUG ALERT! The attack type is not physical neither magical!');};
		};

		if(!Number.isNaN(Number(GAME.battle.monster[attack.attacksStat]))){
			alert('BUG ALERT! The stat being attacked is not a number!');
		}


		var playerAttackPower = attackPowerFunction();
		playerAttackPower += (attack.strength.used ? (randomPercentageMultiplierFromInterval(attack.strength.min, attack.strength.max) * GAME.battle.player.getstrength()) : 0);
		playerAttackPower += (attack.dexterity.used ? (randomPercentageMultiplierFromInterval(attack.dexterity.min, attack.dexterity.max) * GAME.battle.player.getDexterity()) : 0);
		playerAttackPower += (attack.intelligence.used ? (randomPercentageMultiplierFromInterval(attack.intelligence.min, attack.intelligence.max) * GAME.battle.player.getIntelligence()) : 0);
		playerAttackPower += (attack.wisdom.used ? (randomPercentageMultiplierFromInterval(attack.wisdom.min, attack.wisdom.max) * GAME.battle.player.getWisdom()) : 0);
		playerAttackPower += (attack.speed.used ? (randomPercentageMultiplierFromInterval(attack.speed.min, attack.speed.max) * GAME.battle.player.getSpeed()) : 0);
		playerAttackPower += (attack.constitution.used ? (randomPercentageMultiplierFromInterval(attack.constitution.min, attack.constitution.max) * GAME.battle.player.getConstitution()) : 0);
		playerAttackPower += (attack.sexuality.used ? (randomPercentageMultiplierFromInterval(attack.sexuality.min, attack.sexuality.max) * GAME.battle.player.getSexuality() ) : 0);
		playerAttackPower += GAME.battle.player.calculateLuck();

		var monsterDefense = GAME.battle.monster.getDefense({type:attack.attackType, element:attack.element});
		var damageToEnemy = playerAttackPower - monsterDefense;
		GAME.battle.monster.health -= damageToEnemy;

		GAME.battle.printPlayerHitMessage(attack, damageToEnemy);

		if(GAME.battle.monster.health > 0){ // TODO: add support to a battle script
			var monsterAttack = GAME.battle.monster.skills[randomIntFromInterval(0, GAME.battle.monster.skills.length - 1)];
			var playerDefense = GAME.battle.player.getDefense({type:monsterAttack.attackType, element:monsterAttack.element});
			var damageToPlayer = monsterAttack.getAttackPower() - playerDefense;

			GAME.battle.player.health -= damageToPlayer;
			GAME.battle.printMonsterHitMessage(GAME.battle.monster.longName, damageToPlayer, monsterAttack);
		};

		GAME.battle.checkState();
	},

	checkState:function(){
		var stopIfCondition = GAME.battle.stopIf(GAME.battle.player, GAME.battle.monster);

		if(GAME.battle.isDefeated(GAME.battle.player)){
			GAME.battle.battleOver({playerWon:false,player:GAME.battle.player, monster:GAME.battle.monster});
		}else if(GAME.battle.isDefeated(GAME.battle.monster)){
			GAME.battle.battleOver({playerWon:true,player:GAME.battle.player, monster:GAME.battle.monster});
		}else if(stopIfCondition != false){
			GAME.battle.battleOver(stopIfCondition);
		}else{
			GAME.battle.updateHPDisplay();
			GAME.battle.generateButtons(); // next battle round
		}
	},

	printMonsterHitMessage:function(monsterName, damageToPlayer, monsterAttack){
		var monsterAttackText = monsterAttack.attackText[randomIntFromInterval(0, monsterAttack.attackText.length - 1)];
		GAME.interface.addText("The "+monsterName+' '+monsterAttackText+" you for "+damageToPlayer+"% of your HP!");
	},
	printPlayerHitMessage:function(damageToEnemy){
		GAME.interface.addText("You getWeaponAttackText() the enemy for "+damageToEnemy+"% of their HP");
	},

	battleOver:function(details){
		document.dispatchEvent(new CustomEvent('battleOver', details));
	},

	monsterIntro:function(monster){
		GAME.interface.addText("Monster intro goes here");
	},

	updateHPDisplay:function(){
		// GAME.battle.player.updateStats(); // TODO: Think more on how to call this

		GAME.interface.statContainers.hp.updateValue(GAME.battle.player.health);
		GAME.interface.statContainers.lust.updateValue(GAME.battle.player.lust);

		GAME.interface.addText(sprintf("Monster is now with %u%% health", GAME.battle.monster.health));
	},

	isDefeated:function(thing){
		// This will probably grow a lot with time?
		return thing.health <= 0;
	}
};