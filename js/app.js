'use strict';
//editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

//to init from the page load
$(document).ready(function(){
  init();
});

//on each key entered...
$('#editor').keyup(function() {
  init();
});

// doesn't work for var declarations or IIFE's

//init has
  //1. parse the tree with acorn
  //2. setUpStructure to get the treeArr
  //3. instantiate an empty notifArr (bc the notifications may change with every key entered)
  //4. empty out .notifications ul with jquery
  //5. white list
  //6. black list
  //7. rough structure
  //8. remove duplicates from our notifArr, which was populated by 5,6,7
  //9. make an li for each index in notifArr
function init() {
  var acornTree = acorn.parse(editor.getValue());
  var treeArr = api.setUpStructure(acornTree);
  console.log(treeArr);
  var notifArr = [];
  //init notifications as empty
  $('.notifications').empty();

  //whitelist
  api.whiteList(treeArr, 'ForStatement', notifArr);
  api.whiteList(treeArr, 'IfStatement', notifArr);

  //blacklist
  api.blackList(treeArr, 'WhileStatement', notifArr);

  //rough structure
  api.checkForStructure(treeArr, ['ForStatement', 'IfStatement'], notifArr);

  notifArr = removeDuplicates(notifArr);
  console.log(notifArr);
  //for loop iterating through my notifArr and appending them to ul
  for (var i = 0; i < notifArr.length; i++) {
    var $li = $('<li />');
    $li.append(notifArr[i]);

    $('.notifications').append($li);
  }
}

var api = {
  //setUpStructure creates a nested arr of types and start + end
  //param1: acornTree
  setUpStructure: function(tree) {
    //local var to hold the types in our tree
    var treeTypes = [];
    console.log(tree);

    function parseTree(node) {

      var current = node;

      //parse through tree
      while (current.body || current.consequent || current.declarations || current.init) {

        current = current.body || current.consequent || current.declarations || current.init;
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

    console.log(treeTypes);
    return treeTypes;
  },

  //check acorn tree for structure that follows our guidelines
  //param1: treeTypes is the arr we get of every type once we go through tree
  //param2: arrOfTypes is what we're checking for
  //param3: notifArr is the arr we push the notifications (yes you have correct structure/
            //no you do not have correct structure) into notifArr
  checkForStructure: function(treeTypes, arrOfTypes, notifArr) {
        // console.log('treeTypes: ', treeTypes.length);
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
          arrOfTypes.shift();

          recursiveGetStructure(arrOfTreeTypes, arrOfThingsToCheck);

        }
      }

    }

    recursiveGetStructure(treeTypes, arrOfTypes)

    // if every element in arrOfTypes is found, we'll return back ifFound
    var ifFound = "Awesome!  There is a ";
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
    //else, we'll return back notFound
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
  },
  //whitelist functionality
  whiteList: function(treeTypes, statementSearchingFor, notifArr) {
    console.log(treeTypes);
    for (var i = 0; i < treeTypes.length; i++) {
      if (treeTypes[i][0] === statementSearchingFor) {
        notifArr.push("We were looking for " + statementSearchingFor + " to exist!  Congrats!");
      }
    }
  },
  //blacklist functionality
  blackList: function(treeTypes, statementSearchingFor, notifArr) {
    for (var i = 0; i < treeTypes.length; i++) {
      if (treeTypes[i][0] === statementSearchingFor) {
        notifArr.push("We were NOT looking for you to have " + statementSearchingFor + " in your code!  Please remove.");
      }
    }
  }
}

//to remove dupes from notifArr
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
