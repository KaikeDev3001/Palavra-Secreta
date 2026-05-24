// CSS
import './App.css';

// REACT
import { useCallback, useEffect, useState } from 'react';


// Data
import { wordsList } from './data/words';

// Components
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import GameOver from './components/GameOver';

const stages = [ // estágios do game
  {id: 1, name: "start"},
  {id: 2, name: "game"},
  {id: 3, name: "end"}
];

const guessesQtfy = 3; // quantidade de tentativas

function App() {
  const [gameStage, setGameStage] = useState(stages[0].name); // estagio do game
  const [words] = useState(wordsList); // lista de palavras

  const [pickedWord, setPickedWord] = useState(""); // escolher palavra
  const [pickedCategory, setPickedCategory] = useState(""); // escolher categoria
  const [letters, setLetters] = useState([]); // array vazio por ser uma lista de palavras

  const [guessedLetters, setGuessedLetters] = useState([]); // letras adivinhadas
  const [wrongLetters, setWrongLetters] = useState([]); // letras erradas
  const [guesses, setGuesses] = useState(guessesQtfy); // letras
  const [score, setScore] = useState(0); // pontuação


  const pickedWordCategory = useCallback(() => {
    // Categoria aleatória
    const categories = Object.keys(words);
    const category = categories[Math.floor(Math.random() * Object.keys(categories).length)]; // Math.random dar um número quebrado, por isso usa-se o Math.floor para arrendondar para baixo 

    // Palavra aleatória
    const word = words[category][Math.floor(Math.random() * words[category].length)];
    
    return {word, category}; // chaves serve para dizer que é um objeto
  }, [words]);

  // Inicializa o jogo
  const startGame = useCallback(() => {
    // limpa todas as palavras
    // eslint-disable-next-line react-hooks/immutability
    clearLetterStates();

    // picked word e picked category
    const { word, category } = pickedWordCategory();
    // cria um array de palavras
    let wordLetters = word.split("");
    wordLetters = wordLetters.map((l) => l.toLowerCase()); // mapeia cada letra e a transforma em minúscula
    

    // Preencher estados
    setPickedWord(word);
    setPickedCategory(category);
    setLetters(wordLetters);

    setGameStage(stages[1].name); // pega o nome do indice 1 (que é "game")
  }, [pickedWordCategory]);

  const normalizeLetter = (letter) => {
    return letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Processar letter input
    const verifyLetter = (letter) => {
    const normalizedInput = normalizeLetter(letter);

    // Se a letra ja foi usada
    if (
      guessedLetters.includes(normalizedInput) ||
      wrongLetters.includes(normalizedInput)
    ) {
      return;
    }

    // normaliza as letras da palavra
    const normalizedLetters = letters.map((l) =>
      normalizeLetter(l)
    );

    // Incluir as letras erradas e corretas
    if (normalizedLetters.includes(normalizedInput)) {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        normalizedInput,
      ]);
    } else {
      setWrongLetters((actualWrongLetters) => [
        ...actualWrongLetters,
        normalizedInput,
      ]);

      setGuesses((actualGuesses) => actualGuesses - 1);
    }
  };

  const clearLetterStates = () => {
    setGuessedLetters([]);
    setWrongLetters([]);
  };
  
  useEffect(() => {
    if(guesses <= 0) {
      // reseta os estados
      clearLetterStates();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameStage(stages[2].name)
    }
  }, [guesses]);

  // checa condição de vitória
  useEffect(() => {

    const uniqueLetters = [... new Set(letters)];
    
    // condição de vitória
    if(letters.length > 0 && guessedLetters.length === uniqueLetters.length) {
      // adicionar score
      // eslint-disable-next-line react-hooks/set-state-in-effect, no-useless-assignment
      setScore((actualScore) => actualScore + 100);

      // reinicia o jogo com uma nova palavra
      startGame();
    }

  }, [guessedLetters, letters, startGame])

  // Reinicia o jogo
  const retry = () => {
    setScore(0);
    setGuesses(guessesQtfy);

    setGameStage(stages[0].name)
  };


  return (
    <div className="App">
      {gameStage === "start" && <StartScreen startGame={startGame} />} {/* quando o gameStage for 'start, ele vai para a janela de start */}
      {gameStage === "game" && 
        <Game 
          verifyLetter={verifyLetter} 
          pickedWord={pickedWord} 
          pickedCategory={pickedCategory} 
          letters={letters}
          guessedLetters={guessedLetters}
          wrongLetters={wrongLetters}
          guesses={guesses}
          score={score} />}
      {gameStage === "end" && <GameOver retry={retry} score={score} />}
    </div>
  )
}

export default App