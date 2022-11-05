
let symbolSel=document.querySelector('select#symbolSelector');
let levelSel=document.querySelector('select#levelSelector');

let dialog=document.querySelector('dialog#confirmDialog');



//Modulus: GameBoard setting
const GameBoard = (function () {

    const _state = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let _userSymbol = 1;
    let _aiDepth = 1;
    let _turnPlayer = 1;


    //Check if the grid is occupied
    const checkOccupied = function(placeID) {

        if (_state[placeID] == 1 || _state[placeID] == -1) {

            return true;
        }else{

            return false;
        }
    }

    //Check if someone won the game or game tie
    //Return: 1 or -1(someone win), 0(game tie), undefined(game continue)
    const checkWin = function (checkState) {

        if (checkState === undefined) {
            checkState = _state;
        }

        if ((checkState[0] == 1 && checkState[1] == 1 && checkState[2] == 1) ||
            (checkState[3] == 1 && checkState[4] == 1 && checkState[5] == 1) ||
            (checkState[6] == 1 && checkState[7] == 1 && checkState[8] == 1) ||
            (checkState[0] == 1 && checkState[3] == 1 && checkState[6] == 1) ||
            (checkState[1] == 1 && checkState[4] == 1 && checkState[7] == 1) ||
            (checkState[2] == 1 && checkState[5] == 1 && checkState[8] == 1) ||
            (checkState[0] == 1 && checkState[4] == 1 && checkState[8] == 1) ||
            (checkState[2] == 1 && checkState[4] == 1 && checkState[6] == 1)) {

            //DisplayController.showMessage(`player ${_turnPlayer} win the game!`);
            return 1;
        }
        else if ((checkState[0] == 1 && checkState[1] == 1 && checkState[2] == 1) ||
            (checkState[3] == -1 && checkState[4] == -1 && checkState[5] == -1) ||
            (checkState[6] == -1 && checkState[7] == -1 && checkState[8] == -1) ||
            (checkState[0] == -1 && checkState[3] == -1 && checkState[6] == -1) ||
            (checkState[1] == -1 && checkState[4] == -1 && checkState[7] == -1) ||
            (checkState[2] == -1 && checkState[5] == -1 && checkState[8] == -1) ||
            (checkState[0] == -1 && checkState[4] == -1 && checkState[8] == -1) ||
            (checkState[2] == -1 && checkState[4] == -1 && checkState[6] == -1)) {

            // DisplayController.showMessage(`player ${_turnPlayer} win the game!`);
            return -1;
        }
        else if (checkState.reduce(_checkFull, true)) {

            // DisplayController.showMessage('Game Tie!');
            return 0;

        } else {

            // DisplayController.showMessage('Game Continue!');
            return undefined;
        }

        function _checkFull(result, value) {
            //check if the board is full
            if (result == false) {
                return false;
            } else if (value == 1 || value == -1) {
                return true;
            } else {
                return false;
            }
        }
    }



    //play(placeID[0-8])
    const play = function (placeID) {

        // if (playerID===undefined){
        //     playerID=_turnPlayer;
        // }

        if (_state[placeID] == 1 || _state[placeID] == -1) {
            return undefined;
        }
        else {
            _state[placeID] = _turnPlayer;
        }


        DisplayController.displayBoardState(_state);

        const result = checkWin();


        let yourScore=document.querySelector('p#yourScore');
        let aiScore=document.querySelector('p#aiScore');
        let tieGame=document.querySelector('p#tieGame');


        //display message and put the score
        if (result == _userSymbol) {

            DisplayController.showMessage(`Congratulations! You win the game!`);
            yourScore.innerHTML=parseInt(yourScore.innerHTML)+1;
        
        }else if (result == _userSymbol*(-1)) {

            DisplayController.showMessage(`AI win the game!`);
            aiScore.innerHTML=parseInt(aiScore.innerHTML)+1;

        }else if (result == 0) {

            DisplayController.showMessage('Game Tie!');
            tieGame.innerHTML=parseInt(tieGame.innerHTML)+1;

        }
        else {

            DisplayController.showMessage('Game Continue!');
        }



        //turn switch
        _turnPlayer *= -1;
        console.log(_turnPlayer);


        return result;
    }


    const computerPlay =function(){

        let winOBJ=modelAI.minimax(_state,_aiDepth,_userSymbol*(-1));
        let ret=play(winOBJ.winningPosition);
        // DisplayController.displayBoardState(_state);
    
        if (ret!=undefined)
        {
            dialog.showModal();
        }

    }


    const reset = function () {

        //_state=[0,0,0,0,0,0,0,0,0];  illegal

        _userSymbol=parseInt(symbolSel.value);
        _aiDepth=parseInt(levelSel.value);

        for (let i = 0; i < 9; i++) {
            _state[i] = 0;
        }

        DisplayController.displayBoardState(_state);

        let randNumber=Math.floor(Math.random()*2);

        if (randNumber==1)
        {
            //電腦先下
            _turnPlayer=_userSymbol*(-1);
            computerPlay();
        }else{

            _turnPlayer=_userSymbol;
        }
    }

    return {checkOccupied, checkWin, play, computerPlay, reset};
})();






//Modulus: displayContorller
const DisplayController = (function () {

    const displayBoardState = function (state) {

        state.forEach((value, index) => {

            const grid = document.querySelector(`div[data-placeID='${index}']`);

            if (value == 1) {

                grid.innerHTML = 'O';
            }
            else if (value == -1) {

                grid.innerHTML = 'X';
            } else {

                grid.innerHTML = '';
            }
        });
    }

    const showMessage = function (text) {

        const pMeassge = document.querySelector('div.message>p');
        pMeassge.innerHTML = text;
    }

    return { displayBoardState, showMessage };

})();





//Modulus: modelAI

const modelAI = (function () {

    
    //AI psuedo-code ref:https://en.wikipedia.org/wiki/Minimax
    // function  minimax( node, depth, maximizingPlayer ) is
    //     if depth = 0 or node is a terminal node then
    //         return the heuristic value of node
    //     if maximizingPlayer then
    //         value := −∞
    //         for each child of node do
    //             value := max( value, minimax( child, depth − 1, FALSE ) )
    //         return value
    //     else (* minimizing player *)
    //         value := +∞
    //         for each child of node do
    //             value := min( value, minimax( child, depth − 1, TRUE ) )
    //         return value
    //
    // (* Initial call *)
    // minimax( origin, depth, TRUE )


    //state:盤勢, depth:計算深度, nextSymbol:下一步符號
    const minimax = function (state, depth, nextSymbol) {

        const status = GameBoard.checkWin(state);

        if (depth == 0 || status !== undefined)   //terminal node
        {
            if (status == 1) {
                return { winningValue: 1, winningPosition: undefined };
            }
            else if (status == -1) {
                return { winningValue: -1, winningPosition: undefined };
            }
            else {
                return { winningValue: 0, winningPosition: undefined };
            }
        }

        //計算所有下一步可能性的勝率陣列
        let mapResult = state.map((value, index) => {

            if (value == 0) {
                let newState = state.slice();
                newState[index] = nextSymbol;

                return minimax(newState, depth - 1, nextSymbol * (-1)).winningValue;
            }
            else {

                return undefined;
            }
        });


        if (nextSymbol == 1) {       //輪到o（1)下,會選擇對o最有利局勢

            //找到最有利的index （winningValue最大）
            let winningIndex = mapResult.reduce((total, currentValue, currentIndex, arr) => {

                if (currentValue === undefined) {

                    return total;

                } else if (total.length == 0) {

                    total.push(currentIndex);
                    return total;

                } else if (currentValue > mapResult[total[0]]) {

                    return [currentIndex];

                } else if (currentValue == mapResult[total[0]]) {

                    total.push(currentIndex);
                    return total;

                } else {

                    return total;
                }

            }, []);


            //從最有利的index中選一個
            let i = Math.floor(Math.random() * winningIndex.length);
            return { winningValue: mapResult[winningIndex[i]], winningPosition: winningIndex[i] };


        } else {      //輪到x（-1)下,會選擇對x最有利局勢


            //找到最有利的index （winningValue最小）
            let winningIndex = mapResult.reduce((total, currentValue, currentIndex, arr) => {

                if (currentValue === undefined) {

                    return total;

                } else if (total.length == 0) {

                    total.push(currentIndex);
                    return total;

                } else if (currentValue < mapResult[total[0]]) {

                    return [currentIndex];

                } else if (currentValue == mapResult[total[0]]) {

                    total.push(currentIndex);
                    return total;

                } else {

                    return total;
                }

            }, []);


            //從最有利的index中選一個
            let i = Math.floor(Math.random() * winningIndex.length);
            return { winningValue: mapResult[winningIndex[i]], winningPosition: winningIndex[i] };

        }
        
    }

    return {minimax};

})()




//------------ initialize-------------

symbolSel.addEventListener('change',GameBoard.reset);
levelSel.addEventListener('change',GameBoard.reset);

let btnReset=document.querySelector('button#btnReset');
btnReset.addEventListener('click',GameBoard.reset);

let board=document.querySelector('div.board');
let btnOK=document.querySelector('button#OK');

board.addEventListener('click',(e)=>{

    let placeID=e.target.dataset.placeid;

    if (GameBoard.checkOccupied(placeID)===false){

        //check if the grid is empty, continue to play
        let ret=GameBoard.play(placeID);

        if (ret!=undefined){

            dialog.showModal();
        }else{
    
            GameBoard.computerPlay();
        }
    }
    else{

        DisplayController.showMessage('please place in a empty postion.');
    }
});


dialog.addEventListener('cancel',(e)=>{

    //or disable esc function
    // e.preventDefault();
    GameBoard.reset(); 
});

btnOK.addEventListener('click',(e)=>{

    dialog.close();
    GameBoard.reset(); 
});

GameBoard.reset();