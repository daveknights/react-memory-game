const { useState, Fragment } = React;
const gameContainer = document.querySelector('#memory-game');

const Tile = props => <div data-index={props.index} className={props.classes} onClick={props.clicked}>
                        <div className="front">?</div>
                        <div className="back">{props.tileWord}</div>
                    </div>;

const MatchedPairs = props => <Fragment>
                                <span>{props.matches}</span>
                                /<span>{props.wordCount}</span>
                            </Fragment>;

const MemoryGame = props => {
    const [gameStatus, setGameStatus] = useState('New');
    const [textInput, setTextInput] = useState('');
    const [wordsData, setWordsData] = useState({});
    const [error, setError] = useState('');
    const [matches, setMatches] = useState(0);
    const [status, setStatus] = useState('Choose a tile');
    const [revealedTile, setRevealedTile] = useState('');
    let gameContent = null;
    let tiles = null;
    let errorMessage = null;

    const processWords = e => {
        e.preventDefault();
        const inputArray = textInput.split(' ');

        const userWords = [...inputArray, ...inputArray].sort(() => Math.random() - 0.5);
        const data = {};
        const longWords = userWords.some(word => word.length > 10);

        switch (true) {
            case inputArray.length < 3:
                setError('Please enter at least 3 words');
                break;
            case longWords:
                setError('Words should not be longer than 10 characters');
                break;
            case new Set(inputArray).size !== inputArray.length:
                setError('No duplicate words or multiple spaces please');
                break;
            default:
                setWordsData(data);

                setGameStatus('Play');
                userWords.forEach((word, id) =>
                    data[id] = {
                            word: word,
                            tileStatus: 'unturned'
                        }
                );
        }
    };

    const checkForMatch = (tile1='', tile2) => {
        const updatedTiles = {...wordsData};
        const updatedTile = {...updatedTiles};

        if (updatedTile[tile1].word === updatedTile[tile2].word) {
            updatedTile[tile1].tileStatus = 'correct';
            updatedTile[tile2].tileStatus = 'correct';

            setStatus('Yes, they matched!');

            if (matches + 1 === Object.keys(wordsData).length/2) {
                setStatus(`You've found all ${Object.keys(wordsData).length/2} pairs, Well done!`);
            } else {
                setTimeout(() => {
                    setStatus('Choose a tile');
                }, 1000);
            }

            setWordsData(updatedTiles);
            setMatches(matches + 1);
        } else {
            updatedTile[tile1].tileStatus = 'wrong';
            updatedTile[tile2].tileStatus = 'wrong';

            setStatus('Sorry, those didn\'t match');

            setTimeout(() => {
                updatedTile[tile1].tileStatus = 'unturned';
                updatedTile[tile2].tileStatus = 'unturned';
                setWordsData(updatedTiles);
                setStatus('Choose a tile');
            }, 1000);
        }

        setRevealedTile('');
    };

    const revealTile = e => {
        const index = e.target.parentNode.dataset.index;
        const tile = wordsData[index];
        const updatedTiles = {...wordsData};
        const updatedTile = {...updatedTiles};

        if (tile !== revealedTile && updatedTile[index].tileStatus !== 'correct') {
            updatedTile[index].tileStatus = 'revealed';

            setRevealedTile(index);
            setWordsData(updatedTiles);
            setStatus('Now try to find the matching tile');

            if (revealedTile) {
                checkForMatch(revealedTile, index);
            }
        }
    };

    const resetGame = () => {
        setMatches(0);
        setError('');
        setStatus('Choose a tile');
        setGameStatus('New');
    };

    if (error) {
        errorMessage = <p className="error">{error}</p>;
    }

    if (gameStatus === 'New') {
        gameContainer.style.width = `400px`;
        gameContent = <form onSubmit={processWords}>
                        <label htmlFor="words-input">Enter words separated by spaces</label>
                        <div className="input-container">
                            <input type="text" id="words-input" onChange={e => setTextInput(e.target.value)} />
                            <button className="start-game" onClick={processWords}>Start</button>
                        </div>
                        {errorMessage}
                    </form>;
    } else {
        const wordCount = Object.keys(wordsData).length/2;
        gameContainer.style.width = `${(wordCount * 100) + ((wordCount -1) * 10)}px`;
        const gridColumns = {gridTemplateColumns: `repeat(${wordCount}, 100px)`};

        tiles = Object.entries(wordsData).map(data => {
                                const classes = `tile ${data[1].tileStatus}`;

                                return <Tile
                                    key={data[0]}
                                    classes={classes}
                                    clicked={revealTile}
                                    index={data[0]}
                                    tileWord={data[1].word} />;
                            });

        gameContent = <Fragment>
                        <p className="match-count">
                            (
                                <MatchedPairs
                                matches={matches}
                                wordCount={wordCount} />
                            )
                        </p>
                        <p className="game-status"> {status}</p>
                        <div className="game-board" style={gridColumns}>
                            {tiles}
                        </div>
                        <button className="new-game" onClick={resetGame}>Start new game</button>
                    </Fragment>;
    }

    return (gameContent);
}

ReactDOM.render(<MemoryGame />, gameContainer);
