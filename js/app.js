'use strict';
//editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

//**HAVE TO REMEMBER TO NOT PULL acornParsedTree FROM THE GETGO.
//**REINSTATIATE IT EVERY TIME THE EDITOR IS HIT

//acorn parser
//var acornParsedTree = acorn.parse(editor.getValue());

$(document).ready(function(){
  init();
});

//on each key entered...
$('#editor').keyup(function() {
  init();
});

function init() {
  var acornParsedTree = acorn.parse(editor.getValue());
  var treeArr = setUpStructure(acornParsedTree);
  var notifArr = [];
  //init notifications as empty
  console.log('we are initing again');
  $('.notifications').empty();

  //whitelist
  whiteList(treeArr, 'ForStatement', notifArr);
  whiteList(treeArr, 'IfStatement', notifArr);

  //blacklist
  blackList(treeArr, 'WhileStatement', notifArr);

  //rough structure
  checkForStructure(treeArr, ['ForStatement', 'IfStatement'], notifArr);

  notifArr = removeDuplicates(notifArr);
  console.log(notifArr);
  //for loop iterating through my notifArr and appending them to ul
  for (var i = 0; i < notifArr.length; i++) {
    var $li = $('<li />');
    $li.append(notifArr[i]);

    $('.notifications').append($li);
  }
}

function setUpStructure(tree) {
  //local var to hold the types in our tree
  var treeTypes = [];

  function parseTree(node) {

    var current = node;

    //parse through tree
    while (current.body || current.consequent) {

      current = current.body || current.consequent;
      // console.log("current is: ", current);

      if (Array.isArray(current)) {
        for (var i = 0; i < current.length; i++) {
          // console.log('parseTree is triggered with: ', current[i]);
          treeTypes.push([current[i].type, current[i].start, current[i].end]);
          parseTree(current[i]);
        }
      }

      if (current.type) {
        // console.log('current.type is: ', current.type);
        treeTypes.push([current.type, current.start, current.end]);
      }

    }
    //go through and get every node type and then create a new hash and push the hash into the arr
    // return treeTypes;

  }

  parseTree(tree);

  return treeTypes;

}

//param1: treeTypes is the arr we get of every type once we go through tree
//param2: arrOfTypes is what we're checking for
//param3: notifArr is the arr we push the notifications (yes you have correct structure/
          //no you do not have correct structure) into notifArr

function checkForStructure(treeTypes, arrOfTypes, notifArr) {
  console.log('treeTypes: ', treeTypes.length);
  var origCopyArrTypes = arrOfTypes.slice(0);
  var notFound = "Sorry, we don't have a ";
  if (treeTypes.length == 0) {
    for (var k = origCopyArrTypes.length -1; k >= 0; k--) {
      if (k == (origCopyArrTypes.length-1)) {
        notFound += origCopyArrTypes[k];
      } else {
        notFound+= " within a " + origCopyArrTypes[k];
      }
    }
    notFound+= '.  Please implement this!';
    notifArr.push(notFound);
    return;
  }

  var found = false,
      start = treeTypes[0][1],
      end = treeTypes[0][2],
      startEndArr = [];

  function recursiveGetStructure(arrOfTreeTypes, arrOfThingsToCheck) {

    for (var i = 0; i < treeTypes.length; i++) {
      // console.log('old start and new:', start + ' ' + end);
      if (treeTypes[i][0] === arrOfTypes[0] && treeTypes[i][1] >= start && treeTypes[i][2] <= end) {
        // console.log('treeTypes[i][0]: ' + treeTypes[i][0] + ' and arrOfTypes[0] ' + arrOfTypes[0]);
        // if statement to return out of function if expressionstatements are found more than once in a row
        start = treeTypes[i][1];
        end = treeTypes[i][2];
        // console.log("new start and end for arrOfTypes[0]:", start + ' ' + end + ' ' + arrOfTypes[0]);
        if (arrOfTypes.length == 1) {
          found = true;
          return;
        }

        var temp = treeTypes.splice(i,1);
        startEndArr.push(temp);
        // console.log('arrOfTypes before: ', arrOfTypes);
        arrOfTypes.shift();
        // console.log('arrOfTypes after: ', arrOfTypes);
        // if we got to last index of arrOfTypes and its a valid type, then we'll change found from false to true



        recursiveGetStructure(arrOfTreeTypes, arrOfThingsToCheck);
        //else if we get to last ind of arrOfTypes and its NOT nested within
        //treeTypes, then we'll change found = false
      }
    }

  }

  recursiveGetStructure(treeTypes, arrOfTypes)

  var ifFound = "Awesome!  There is a ";
  //console.log("origCopyArrTypes", origCopyArrTypes);
  if (found) {
    for (var j = origCopyArrTypes.length -1; j >= 0; j--) {
      if (j == (origCopyArrTypes.length-1)) {
        ifFound += origCopyArrTypes[j];
      } else {
        ifFound += " within a " + origCopyArrTypes[j];
      }
    }
    ifFound += '.';
    notifArr.push(ifFound);

  } else {
    for (var k = origCopyArrTypes.length -1; k >= 0; k--) {
      if (k == (origCopyArrTypes.length-1)) {
        notFound += origCopyArrTypes[k];
      } else {
        notFound+= " within a " + origCopyArrTypes[k];
      }
    }
    notFound+= '.  Please implement this!';
    notifArr.push(notFound);
  }
}

function whiteList(treeTypes, statementSearchingFor, notifArr) {
  for (var i = 0; i < treeTypes.length; i++) {
    if (treeTypes[i][0] === statementSearchingFor) {
      notifArr.push("We were looking for " + statementSearchingFor + " to exist!  Congrats!");
    }
  }
}

function blackList(treeTypes, statementSearchingFor, notifArr) {
  for (var i = 0; i < treeTypes.length; i++) {
    if (treeTypes[i][0] === statementSearchingFor) {
      notifArr.push("We were NOT looking for you to have " + statementSearchingFor + " in your code!  Please remove.");
    }
  }
}

function removeDuplicates(arr) {
  var seen = {};
  var result = [];

  for (var i = 0; i < arr.length; i++) {
      var sentence = arr[i];

      if (sentence in seen) {
          continue;
      } else {
          seen[sentence] = true;
          result.push(arr[i]);
      }
  }
  return result;
}
