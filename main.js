'use strict';
var GAME = GAME || {};
GAME.main = {
	mainMenu:function(){
		GAME.interface.clearText();
		GAME.interface.addText("main menu \n test");
		GAME.interface.addText("main menu \n test2");

		GAME.interface.drawButtons({text:'New game', buttonFunction:GAME.main.newGame.sexQuestion}, {text:'Load game', buttonFunction:GAME.main.loadGame});
	},
	newGame:{ // Contains all functions related to starting a new game.
		sexQuestion:function(){
			GAME.p.reset();
			
			GAME.interface.clearTextAndButtons();
			GAME.interface.addText("Just a few questions (one for now) before starting the game.");
			GAME.interface.addText("First, are you male or female? (You might be able to mix and match parts in the game)");
			
			GAME.interface.drawButtons({text:'Male', buttonFunction:GAME.main.newGame.choseMale}, {text:'Female', buttonFunction:GAME.main.newGame.choseFemale});
		},
		choseMale:function(){
			GAME.p.hasVagina = false;
			GAME.p.hasBreasts = false;
			GAME.p.hasPenis = true;
			
			GAME.main.newGame.introText();
		},
		choseFemale:function(){
			GAME.p.hasVagina = true;
			GAME.p.hasBreasts = true;
			GAME.p.hasPenis = false;
			
			GAME.main.newGame.introText();
		},
		introText:function(){
			GAME.interface.clearTextAndButtons();
			
			GAME.interface.addText("As the sun rises and the rooster sings, you wake up. It's your 18th birthday, and for once you are excited about life in the countryside hamlet you live in.");
			GAME.interface.addText("After getting ready, you leave to the alchemist's shop. As you enter, the smell of a thousand weird concoctions and ingredients assaults your sense of smell, the alchemist opening a wide smile as she greets you.");
			GAME.interface.addText("\"So, finally ready to become a hunter? Excited, are you?\" You giggle and nod, following her as she closes the shop and heads to the backyard where there is a wolf, kept tied with a long chain. \"You probably know all of this, but let me go over it again. Just so if you die out there, it wasn't my fault.");
			GAME.interface.addText("The short version is, you go out there, you have sex with monsters, you return here while keeping their cum inside you and I buy it off you for money. But you need to take care of certain things, like for example, while keeping as much cum as possible inside you feels so nice and warm, if you go over your limit you will end up hurting yourself. Don't be afraid to run away if you think you're too full to take more. And of course, with time you soon will start to love being on all fours under a mighty beast, but you need to be careful not to love it <i>too much</i>, in fact, most of the hunters who went missing and were later found were being used as the bitch of the pack, not dead.");
			GAME.interface.addText("And if you are careful and manage to bring me just one type of cum, I'll pay you extra! I mean, pretty much every recipe I make requires cum, no matter the type, but a few call for specific monsters due to their effects. I'll occasionally get requests for those, then I pass them to you and you get me the ingredients and you get paid even more! Think of it like a hero going in a quest to save a kingdom, except you're saving a farmer who came up with a case of chopped-off-limb or rotten dick instead. I can also brew those special potions for you, the others who work for me all agree that some are very useful for your line of work.");
			GAME.interface.addText((GAME.p.hasVagina ? "I'll tell you a little trade secret that will come in handy, " : "You don't need to worry about this right now, but if like me you ever decide you want to have an extra hole between your legs, ") + "there's a certain part of the month where girls feel kinda weird thanks to their humors being unbalanced, and monsters can smell that. During that time, the beasts will do their best to get you pregnant, and you'll notice a nice difference in volume. Be <i>very</i> careful, you'll get filled up fast and you really don't want to have half a liter being pumped into you if your belly is already about to burst.");
			GAME.interface.addText('&nbsp;');
			GAME.interface.addText("Alright. That should be all about taking care of yourself and getting money. Let's talk about monsters. Most of them will be ready and eager, but some, like dragons, think they're too good to let us even touch them, let alone their dicks. You can try paying them, and beating them up and raping them always works.");
			GAME.interface.addText("When you encounter a monster, it will usually be in three situations. You surprise it, it surprises you, or you both notice each other quick enough. Then you can try to pick a fight, have sex with the monster if it's willing, or run away. Sometimes you'll only notice the monster after it's too late or it's not willing, so you might not be able to do one or two of those things.");
			GAME.interface.addText("There's more to it, this was just a quick crash course but you will figure the rest out on your own.");
			GAME.interface.addText("So, wanna try a fight against my pet?");
			GAME.interface.drawButtons({text:'Yes', buttonFunction:GAME.main.newGame.petFight}, {text:'No', buttonFunction:GAME.main.newGame.start});
		},
		petFight:function(){
			document.addEventListener('battleOver', GAME.main.newGame.petFightOver(), false);

			GAME.battle.startFight(GAME.p, 'feralWolf');
		},
		petFightOver:function(){
			GAME.interface.addText('TODO');
		}
	},
	loadGame:function(){
		GAME.interface.addText('This doesn\'t work right now.');
	}
};