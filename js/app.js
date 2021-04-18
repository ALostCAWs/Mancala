/*

48 total stones

move counter-clockwise

6 pots on each side, 1 pot on each end (player goal pots)
   0 - rightmost player pot
   6 - upper left pot beside 7
   7 - leftmost player pot
   13 - lower right pot beside 0

user can only click pots on their side
   right - upper (1-6)
   left - lower (8-13)
   user cannot click their player goal pot

user clicks mancala pot and the stones inside it move
   stones in pot ++
   num of pots that get ++ = stones in pot user clicked

first pot to add stone = clicked stone + 1
   if stone pot = oponent goal pot (0 or 7), skip pot and move to next one (1 or 8)
continue to add 1 to get next pot to add stone to until
   reach num of stones in clicked pot
   add stone pot = 13

if add stone pot reaches 13, loop back to 0
   continue this way until stones added num stones in clicked pot

if last stone land in empty pot && empty pot is on that players' side
   all stones in pot across from it go to players' goal pot

if last stone lands in players' goal pot
   take another turn

set clicked pot stones to 0

can play w numbered buttons until visuals added later
   disable / enable upper / lower buttons depending on current player

game end when all six pots on upper or lower are empty

player w stones still in their pots at game end captures those

player w most stones wins

*/

"use strict";
   // Global Variable Declarations
let pockets = [];
let currentPlayer = "";
   // Objects
function Pocket(id, type, numOfStones) {
   this.id = id;
   this.type = type;
   this.numOfStones = numOfStones;
}

function togglePlayer(player) {
   if (player == "right") {
      currentPlayer = "left";
   } else {
      currentPlayer = "right";
   }
   togglePockets();
}

function togglePockets() {
   pockets.forEach(pocket => {
      // Remove / add clickable class depending on currentPlayer
      let btnPocket = document.getElementById(String(pocket.id));
      if (currentPlayer == "right") {
         if (btnPocket.classList.contains('upper')) {
            btnPocket.classList.add('clickable');
         } else {
            btnPocket.classList.remove('clickable');
         }
      } else {
         if (btnPocket.classList.contains('lower')) {
            btnPocket.classList.add('clickable');
         } else {
            btnPocket.classList.remove('clickable');
         }
      }

      // Enable / disable certain buttons depending on currentPlayer
      if (btnPocket.classList.contains('clickable')) {
         btnPocket.disabled = false;
      } else {
         btnPocket.disabled = true;
      }
   });
}

function createPockets() {
   let id, type, numOfStones;
   for (id = 0; id < 14; id++) {
      let btnPocket = document.getElementById(String(id));
      type = String(btnPocket.classList);
      switch(type) {
         case "goal":
            numOfStones = 0;
         break;
         default:
            numOfStones = 4;
            btnPocket.addEventListener("click", function getPocket(elem) {
               let pocket = pockets.find(p => p.id == elem.target.id);
               clickPocket(pocket);
            });
      }
      if (type == "upper") {
         btnPocket.classList.add('clickable');
      }

      // Create new pocket
      let newPocket = new Pocket(id, type, numOfStones);
      pockets.push(newPocket);

      // Update pocket
      updatePocket(newPocket);
   }
   setOppositePockets();
}

function setOppositePockets() {
   // Store opposite pocket ID
   pockets.forEach(pocket => {
      let oppositePID;
      if (pocket.type == "upper") {
         // Use formula for upper pockets
         oppositePID = (pockets.length - 1) - (pocket.id - 1);
         pocket.opposite = oppositePID;
         // Find lower pocket based on above formula using the found oppositePID & set its' opposite to match
         let oppositePocket = pockets.find(p => p.id == oppositePID);
         oppositePocket.opposite = pocket.id;
      }
      console.log(pocket);
   });
}

function clickPocket(pocket) {
      // Preventions
   // Only let user spend their turn clicking a valid pocket, one that contains stones
   if (pocket.numOfStones != 0) {
      movePocketStones(pocket);
   }
}

function movePocketStones(pocket) {
   let currentPID = pocket.id;
   let extraTurn = false;
   // move stones to other pockets one by one
   for (let i = 1; i < pocket.numOfStones + 1; i++) {
      currentPID++;
      let currentPocket;
      // Handle greater than 13 loop-around
      if (currentPID > 13) {
         currentPID = currentPID - 14
      }
      // Players cannot add stones to their oponents' goal
      if ((currentPlayer == "right" && currentPID == 7) || (currentPlayer == "left" && currentPID == 0)) {
         currentPID++;
      }
      currentPocket = pockets.find(p => p.id == currentPID);
      currentPocket.numOfStones = currentPocket.numOfStones + 1;

      // Last stone
      if (i == pocket.numOfStones) {
         // Capture opposite stones when land in empty pocket on own side
         if (currentPocket.numOfStones == 1) {
            if ((currentPlayer == "right" && currentPocket.type == "upper") || (currentPlayer == "left" && currentPocket.type == "lower")) {
               // Determine player goal pocket
               let goalID;
               if (currentPlayer == "right") {
                  goalID = 0;
               } else {
                  goalID = 7;
               }

               // Capture opposite sides' stones
               let oppositePocket = pockets.find(p => p.id == currentPocket.opposite);
               let goalPocket = pockets.find(p => p.id == goalID);
               goalPocket.numOfStones += oppositePocket.numOfStones;
               oppositePocket.numOfStones = 0;

               // Update opposite pocket & goal
               updatePocket(oppositePocket);
               updatePocket(goalPocket);
            }
         }
         // Extra turn if land in own goal
         if ((currentPlayer == "right" && currentPocket.id == 0) || (currentPlayer == "left" && currentPocket.id == 7)) {
            extraTurn = true;
         }
      }
      // Update pocket
      updatePocket(currentPocket);
   }
   // Remove stones from clicked pocket
   pocket.numOfStones = 0;
   updatePocket(pocket);

   let end = endCheck();
   if (end) {
      emptyPockets();
   } else {
      // Check if player gets another turn
      if (!extraTurn) {
         togglePlayer(currentPlayer);
      }
   }
}

function updatePocket(pocket) {
   // Display numOfStones in each pocket
   let btnPocket = document.getElementById(String(pocket.id));
   btnPocket.innerText = pocket.numOfStones;
}

function emptyPockets() {
   let goalPocket;
   pockets.forEach(pocket => {
      if (pocket.type == "upper") {
         goalPocket = pockets.find(p => p.id == 0);
      }
      else if (pocket.type == "lower") {
         goalPocket = pockets.find(p => p.id == 7);
      }
      if (goalPocket != undefined) {
         console.log(goalPocket);
         console.log(pocket);
         goalPocket.numOfStones += pocket.numOfStones;
         pocket.numOfStones = 0;

         // Update pocket & goal
         updatePocket(pocket);
         updatePocket(goalPocket);
      }
   });

   winCheck();
}

function winCheck() {
   let rGoal = pockets.find(p => p.id == 0);
   let lGoal = pockets.find(p => p.id == 7);

   if (rGoal.numOfStones > lGoal.numOfStones) {
      alert("right wins");
   }
   else if (lGoal.numOfStones > rGoal.numOfStones) {
      alert("left wins");
   } else {
      alert("cats' game");
   }
}

function endCheck() {
   let uCount = 0;
   let lCount = 0;
   pockets.forEach(pocket => {
      if (pocket.type == "upper") {
         uCount += pocket.numOfStones;
      }
      else if (pocket.type == "lower") {
         lCount += pocket.numOfStones;
      }
   });

   if (uCount == 0 || lCount == 0) {
      return true;
   } else {
      return false;
   }
}

/*
-- WINDOW ONLOAD
*/
window.onload = () => {
         // Call starting functions
      createPockets();
      togglePlayer("left");
}