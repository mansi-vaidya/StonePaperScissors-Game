"use client"


import { useState, useCallback, useEffect, useRef } from "react"

fetch("https://your-railway-backend.up.railway.app/api/games")
const API_URL = "http://localhost:8080/api/games";

import {
  Hand,
  Scissors,
  FileText,
  RotateCcw,
  Trophy,
  Swords,
  Volume2,
  VolumeX,
  Monitor,
  Users,
  History,
  X,
  Sparkles,
  User,
  Play,
} from "lucide-react"
import confetti from "canvas-confetti"

type Choice = "rock" | "paper" | "scissors" | null
type Result = "player1" | "player2" | "draw" | null
type GameMode = "2player" | "computer"

interface RoundHistory {
  round: number
  player1Choice: Choice
  player2Choice: Choice
  winner: Result
}

const choices = [
  { id: "rock" as const, label: "Rock", icon: Hand },
  { id: "paper" as const, label: "Paper", icon: FileText },
  { id: "scissors" as const, label: "Scissors", icon: Scissors },
]

function getWinner(p1: Choice, p2: Choice): Result {
  if (!p1 || !p2) return null
  if (p1 === p2) return "draw"
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return "player1"
  }
  return "player2"
}

function getRandomChoice(): Choice {
  const options: Choice[] = ["rock", "paper", "scissors"]
  return options[Math.floor(Math.random() * options.length)]
}

// Sound URLs (using Web Audio API with oscillators for simplicity)
function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.15) => {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type
      
      // Soft attack and decay for modern/clean feel
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    },
    [getAudioContext]
  )

  // Modern clean click - soft pop
  const playClick = useCallback(() => {
    playTone(1200, 0.06, "sine", 0.1)
  }, [playTone])

  // Subtle ascending chime for win
  const playWin = useCallback(() => {
    playTone(880, 0.12, "sine", 0.12)
    setTimeout(() => playTone(1100, 0.15, "sine", 0.1), 80)
  }, [playTone])

  // Soft neutral tone for tie
  const playTie = useCallback(() => {
    playTone(600, 0.15, "sine", 0.08)
  }, [playTone])

  // Elegant victory melody - gentle ascending notes
  const playVictory = useCallback(() => {
    const notes = [880, 1047, 1175, 1319]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.1 - i * 0.015), i * 120)
    })
  }, [playTone])

  return { playClick, playWin, playTie, playVictory }
}

export default function RockPaperScissors() {

  const [dbHistory, setDbHistory] = useState<any[]>([]);

  // Login state
  const [gameStarted, setGameStarted] = useState(false)
  const [player1Name, setPlayer1Name] = useState("")
  const [player2Name, setPlayer2Name] = useState("")
  const [loginGameMode, setLoginGameMode] = useState<GameMode>("2player")

  // Game state
  const [player1Choice, setPlayer1Choice] = useState<Choice>(null)
  const [player2Choice, setPlayer2Choice] = useState<Choice>(null)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [round, setRound] = useState(1)
  const [result, setResult] = useState<Result>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [gamePhase, setGamePhase] = useState<"player1" | "player2" | "result">("player1")
  const [gameMode, setGameMode] = useState<GameMode>("2player")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [history, setHistory] = useState<RoundHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [finalWinner, setFinalWinner] = useState<"player1" | "player2" | null>(null)

  useEffect(() => {
  if (showFinalResult === true && finalWinner !== null) {
    console.log("🔥 Game ended → calling API");
    saveGameToBackend();
  }
  }, [showFinalResult, finalWinner]); 

  useEffect(() => {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      setDbHistory(data);
      console.log("Fetched from DB:", data);
    })
    .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
  const container = document.getElementById("history-container");
  if (container) container.scrollTop = 0;
}, [dbHistory]);

  const { playClick, playWin, playTie, playVictory } = useSound()

  const WINNING_SCORE = 3

  const triggerConfetti = useCallback(() => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#22d3ee", "#a855f7", "#ec4899"],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#22d3ee", "#a855f7", "#ec4899"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

const saveGameToBackend = async () => {
  const payload = {
    player1: player1Name,
    player2: player2Name,
    finalWinner:
      finalWinner === "player1" ? player1Name : player2Name,
    rounds: JSON.stringify(history),
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Saved!");

    const res = await fetch(API_URL);
    const data = await res.json();

    setDbHistory(data);
  } catch (err) {
    console.error(err);
  }
}; 


// <-- THIS BRACE IS IMPORTANT
  const handleChoice = useCallback(
    (player: 1 | 2, choice: Choice) => {
      if (soundEnabled) playClick()

      if (player === 1 && gamePhase === "player1") {
        setPlayer1Choice(choice)

        if (gameMode === "computer") {
          setGamePhase("player2")
          setIsRevealing(true)

          // Computer "thinking" delay
          setTimeout(() => {
            const computerChoice = getRandomChoice()
            setPlayer2Choice(computerChoice)

            setTimeout(() => {
              const winner = getWinner(choice, computerChoice)
              setResult(winner)

              if (winner === "player1") {
                const newScore = player1Score + 1
                setPlayer1Score(newScore)
                if (soundEnabled) playWin()
                if (newScore >= WINNING_SCORE) {
                  setFinalWinner("player1")
                  setShowFinalResult(true)
                  if (soundEnabled) playVictory()
                  triggerConfetti()
                }
              } else if (winner === "player2") {
                const newScore = player2Score + 1
                setPlayer2Score(newScore)
                if (soundEnabled) playWin()
                if (newScore >= WINNING_SCORE) {
                  setFinalWinner("player2")
                  setShowFinalResult(true)
                  if (soundEnabled) playVictory()
                  triggerConfetti()
                }
              } else {
                if (soundEnabled) playTie()
              }

              setHistory((h) => [
                ...h,
                { round, player1Choice: choice, player2Choice: computerChoice, winner },
              ])
              setGamePhase("result")
              setIsRevealing(false)
            }, 800)
          }, 1200)
        } else {
          setGamePhase("player2")
        }
      } else if (player === 2 && gamePhase === "player2" && gameMode === "2player") {
        setPlayer2Choice(choice)
        setIsRevealing(true)

        setTimeout(() => {
          const winner = getWinner(player1Choice, choice)
          setResult(winner)

          if (winner === "player1") {
            const newScore = player1Score + 1
            setPlayer1Score(newScore)
            if (soundEnabled) playWin()
            if (newScore >= WINNING_SCORE) {
              setFinalWinner("player1")
              setShowFinalResult(true)
              if (soundEnabled) playVictory()
              triggerConfetti()
            }
          } else if (winner === "player2") {
            const newScore = player2Score + 1
            setPlayer2Score(newScore)
            if (soundEnabled) playWin()
            if (newScore >= WINNING_SCORE) {
              setFinalWinner("player2")
              setShowFinalResult(true)
              if (soundEnabled) playVictory()
              triggerConfetti()
            }
          } else {
            if (soundEnabled) playTie()
          }

          setHistory((h) => [...h, { round, player1Choice, player2Choice: choice, winner }])
          setGamePhase("result")
          setIsRevealing(false)
        }, 1000)
      }
    },
    [
      gamePhase,
      player1Choice,
      gameMode,
      soundEnabled,
      playClick,
      playWin,
      playTie,
      playVictory,
      player1Score,
      player2Score,
      round,
      triggerConfetti,
    ]
  )

  const nextRound = useCallback(() => {
    if (soundEnabled) playClick()
    setPlayer1Choice(null)
    setPlayer2Choice(null)
    setResult(null)
    setRound((r) => r + 1)
    setGamePhase("player1")
  }, [soundEnabled, playClick])

  const resetGame = useCallback(() => {
    if (soundEnabled) playClick()
    setPlayer1Choice(null)
    setPlayer2Choice(null)
    setPlayer1Score(0)
    setPlayer2Score(0)
    setRound(1)
    setResult(null)
    setGamePhase("player1")
    setHistory([])
    setShowFinalResult(false)
    setFinalWinner(null)
  }, [soundEnabled, playClick])

  const toggleGameMode = useCallback(() => {
    if (soundEnabled) playClick()
    setGameMode((m) => (m === "2player" ? "computer" : "2player"))
    resetGame()
  }, [soundEnabled, playClick, resetGame])

  const startGame = useCallback(() => {
    if (soundEnabled) playClick()
    const p1Name = player1Name.trim() || "Player 1"
    const p2Name = loginGameMode === "computer" ? "Computer" : (player2Name.trim() || "Player 2")
    setPlayer1Name(p1Name)
    setPlayer2Name(p2Name)
    setGameMode(loginGameMode)
    setGameStarted(true)
  }, [soundEnabled, playClick, player1Name, player2Name, loginGameMode])

  const exitToLogin = useCallback(() => {
    if (soundEnabled) playClick()
    setGameStarted(false)
    resetGame()
    setPlayer1Name("")
    setPlayer2Name("")
  }, [soundEnabled, playClick, resetGame])

  



  // Show login screen if game hasn't started
  if (!gameStarted) {
    return (
      <LoginScreen
        player1Name={player1Name}
        setPlayer1Name={setPlayer1Name}
        player2Name={player2Name}
        setPlayer2Name={setPlayer2Name}
        gameMode={loginGameMode}
        setGameMode={setLoginGameMode}
        onStart={startGame}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={exitToLogin}
          className="glass-card p-3 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Exit to Menu"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="glass-card p-3 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Game History"
        >
          <History className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="glass-card p-3 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 active:scale-95"
          title={soundEnabled ? "Mute Sound" : "Enable Sound"}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Swords className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Rock Paper Scissors
          </h1>
          <Swords className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-slate-400 text-lg">Game in Progress</p>
      </div>
      

      {/* Scoreboard */}
      <div className="relative z-10 flex items-center gap-4 md:gap-8 mb-6">
        <div className="glass-card px-6 py-3 text-center transition-all duration-300 hover:scale-105">
          <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1 truncate max-w-24">
            {player1Name}
          </p>
          <p className="text-3xl font-bold text-white">{player1Score}</p>
        </div>

        <div className="glass-card px-4 py-2">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Round</p>
          <p className="text-2xl font-bold text-white text-center">{round}</p>
          <p className="text-xs text-slate-500 text-center">First to {WINNING_SCORE}</p>
        </div>

        <div className="glass-card px-6 py-3 text-center transition-all duration-300 hover:scale-105">
          <p className="text-xs text-purple-400 uppercase tracking-wider mb-1 truncate max-w-24">
            {player2Name}
          </p>
          <p className="text-3xl font-bold text-white">{player2Score}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-5xl">
        {/* Player 1 Panel */}
        <PlayerPanel
          player={1}
          label={player1Name}
          choice={player1Choice}
          isActive={gamePhase === "player1"}
          onChoice={(choice) => handleChoice(1, choice)}
          isRevealing={isRevealing && gameMode === "computer" && gamePhase === "player2"}
          showChoice={gamePhase === "result" || gamePhase === "player2"}
          isWinner={result === "player1"}
          soundEnabled={soundEnabled}
        />

        {/* VS Divider */}
        <div className="flex md:flex-col items-center justify-center gap-2">
          <div className="h-px md:h-auto md:w-px flex-1 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
          <div className="glass-card p-3 rounded-full">
            <span className="text-xl font-bold text-slate-400">VS</span>
          </div>
          <div className="h-px md:h-auto md:w-px flex-1 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
        </div>

        {/* Player 2 / Computer Panel */}
        <PlayerPanel
          player={2}
          label={player2Name}
          choice={player2Choice}
          isActive={gamePhase === "player2" && gameMode === "2player"}
          onChoice={(choice) => handleChoice(2, choice)}
          isRevealing={isRevealing}
          showChoice={gamePhase === "result"}
          isWinner={result === "player2"}
          isComputer={gameMode === "computer"}
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Result Display */}
      {gamePhase === "result" && !showFinalResult && (
        <div className="relative z-10 mt-8 animate-fade-in">
          <div
            className={`glass-card px-8 py-4 text-center border-2 ${
              result === "draw"
                ? "border-yellow-500/50"
                : result === "player1"
                  ? "border-cyan-500/50"
                  : "border-purple-500/50"
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy
                className={`w-6 h-6 ${
                  result === "draw"
                    ? "text-yellow-400"
                    : result === "player1"
                      ? "text-cyan-400"
                      : "text-purple-400"
                }`}
              />
              <p className="text-2xl font-bold text-white">
                {result === "draw"
                  ? "It's a Draw!"
                  : `${result === "player1" ? player1Name : player2Name} Wins!`}
              </p>
            </div>
            <p className="text-slate-400 capitalize">
              {player1Choice} vs {player2Choice}
            </p>
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={nextRound}
              className="game-button bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Next Round
            </button>
            <button
              onClick={resetGame}
              className="game-button bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {gamePhase !== "result" && (
        <div className="relative z-10 mt-8 animate-pulse">
          <p className="text-lg text-slate-400">
            {isRevealing ? (
              <span className="text-yellow-400">
                {gameMode === "computer" ? `${player2Name} is thinking...` : "Revealing..."}
              </span>
            ) : (
              <>
                <span className={gamePhase === "player1" ? "text-cyan-400" : "text-purple-400"}>
                  {gamePhase === "player1" ? player1Name : player2Name}
                </span>
                {" - Make your choice!"}
              </>
            )}
          </p>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={dbHistory}
          onClose={() => setShowHistory(false)}
          player1Name={player1Name}
          player2Name={player2Name}
        />
      )}

      {/* Final Result Screen */}
      {showFinalResult && (
        <FinalResultScreen
          winner={finalWinner}
          player1Score={player1Score}
          player2Score={player2Score}
          player1Name={player1Name}
          player2Name={player2Name}
          onPlayAgain={resetGame}
        />
      )}
    </main>
  )
}

interface PlayerPanelProps {
  player: 1 | 2
  label: string
  choice: Choice
  isActive: boolean
  onChoice: (choice: Choice) => void
  isRevealing: boolean
  showChoice: boolean
  isWinner: boolean
  isComputer?: boolean
  soundEnabled?: boolean
}

function PlayerPanel({
  player,
  label,
  choice,
  isActive,
  onChoice,
  isRevealing,
  showChoice,
  isWinner,
  isComputer,
}: PlayerPanelProps) {
  const accentColor = player === 1 ? "cyan" : "purple"

  return (
    <div
      className={`flex-1 glass-card p-6 md:p-8 transition-all duration-500 ${
        isActive ? `ring-2 ring-${accentColor}-500/50 shadow-lg shadow-${accentColor}-500/20` : ""
      } ${isWinner ? "ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/20" : ""}`}
    >
      {/* Player Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${
            player === 1 ? "from-cyan-500 to-blue-600" : "from-purple-500 to-pink-600"
          } flex items-center justify-center transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
        >
          {isComputer ? (
            <Monitor className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white font-bold">P{player}</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{label}</h2>
          <p
            className={`text-sm ${isActive ? (player === 1 ? "text-cyan-400" : "text-purple-400") : "text-slate-500"}`}
          >
            {isActive ? "Your turn" : showChoice ? "Locked in" : "Waiting..."}
          </p>
        </div>
        {isWinner && <Trophy className="w-6 h-6 text-yellow-400 ml-auto animate-bounce" />}
      </div>

      {/* Choice Display */}
      {showChoice && choice && !isRevealing && (
        <div className="mb-6 flex justify-center animate-scale-in">
          <div
            className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${
              player === 1
                ? "from-cyan-500/20 to-blue-600/20 border-cyan-500/30"
                : "from-purple-500/20 to-pink-600/20 border-purple-500/30"
            } border flex items-center justify-center`}
          >
            {choice === "rock" && <Hand className="w-12 h-12 text-white" />}
            {choice === "paper" && <FileText className="w-12 h-12 text-white" />}
            {choice === "scissors" && <Scissors className="w-12 h-12 text-white" />}
          </div>
        </div>
      )}

      {/* Hidden Choice Indicator */}
      {!isActive && !showChoice && choice && (
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center animate-pulse">
            <span className="text-4xl">?</span>
          </div>
        </div>
      )}

      {/* Revealing Animation */}
      {isRevealing && (
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-spin" />
          </div>
        </div>
      )}

      {/* Choice Buttons */}
      {!isComputer && (
        <div className="grid grid-cols-3 gap-3">
          {choices.map(({ id, label: choiceLabel, icon: Icon }) => (
            <button
              key={id}
              onClick={() => isActive && onChoice(id)}
              disabled={!isActive}
              className={`choice-button group transition-all duration-300 ${
                !isActive
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95 hover:shadow-lg"
              } ${
                choice === id && !showChoice
                  ? player === 1
                    ? "border-cyan-500 bg-cyan-500/20 shadow-cyan-500/20"
                    : "border-purple-500 bg-purple-500/20 shadow-purple-500/20"
                  : ""
              }`}
              style={
                isActive
                  ? {
                      boxShadow:
                        choice === id && !showChoice
                          ? player === 1
                            ? "0 0 20px rgba(34, 211, 238, 0.3)"
                            : "0 0 20px rgba(168, 85, 247, 0.3)"
                          : undefined,
                    }
                  : undefined
              }
            >
              <Icon
                className={`w-8 h-8 mb-2 transition-transform duration-300 ${
                  isActive ? "group-hover:scale-110 group-active:scale-90" : ""
                } ${player === 1 ? "text-cyan-400" : "text-purple-400"}`}
              />
              <span className="text-sm text-slate-300">{choiceLabel}</span>
            </button>
          ))}
        </div>
      )}

      {/* Computer Panel - No buttons */}
      {isComputer && !showChoice && !isRevealing && (
        <div className="flex flex-col items-center justify-center py-8">
          <Monitor className="w-16 h-16 text-purple-400/50 mb-4" />
          <p className="text-slate-500">Waiting for your move...</p>
        </div>
      )}
    </div>
  )
}

interface HistoryPanelProps {
  history: RoundHistory[]
  onClose: () => void
  player1Name: string
  player2Name: string
}

function HistoryPanel({ history, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="glass-card p-6 w-full max-w-md h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600">
        <h2 className="text-xl text-white mb-4">Game History</h2>

        {history.length === 0 ? (
          <p className="text-slate-400">No games found</p>
        ) : (
          history.map((game: any, i: number) => {
            let rounds = [];

            try {
              rounds = JSON.parse(game.rounds || "[]");
            } catch {
              rounds = [];
            }

            return (
              <div key={i} className="mb-6 p-3 bg-slate-900 rounded-xl">

                {/* 🔥 Game Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold">
                    Game {i + 1}
                  </span>
                  <span className="text-green-400 text-sm">
                    Winner: {game.finalWinner}
                  </span>
                </div>

                {/* 🔥 Rounds */}
                {rounds.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-800 rounded-lg p-2 mb-2"
                  >
                    <div className="text-xs text-slate-400">
                      R{idx + 1}
                    </div>

                    <div className="text-sm">
                      <span className="text-cyan-400">
                        {r.player1Choice}
                      </span>
                      <span className="mx-2 text-slate-500">vs</span>
                      <span className="text-purple-400">
                        {r.player2Choice}
                      </span>
                    </div>

                    <div className="text-xs font-medium">
                      {r.winner === "tie" ? (
                        <span className="text-yellow-400">Tie</span>
                      ) : (
                        <span className="text-pink-400">
                          {r.winner === "player1"
                            ? game.player1
                            : game.player2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ChoiceIcon({ choice, className }: { choice: Choice; className?: string }) {
  if (choice === "rock") return <Hand className={className} />
  if (choice === "paper") return <FileText className={className} />
  if (choice === "scissors") return <Scissors className={className} />
  return null
}

interface FinalResultScreenProps {
  winner: "player1" | "player2" | null
  player1Score: number
  player2Score: number
  player1Name: string
  player2Name: string
  onPlayAgain: () => void
}

function FinalResultScreen({
  winner,
  player1Score,
  player2Score,
  player1Name,
  player2Name,
  onPlayAgain,
}: FinalResultScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative glass-card p-8 w-full max-w-lg text-center animate-scale-in">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-30 blur-xl ${
            winner === "player1" ? "bg-cyan-500" : "bg-purple-500"
          }`}
        />

        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>

          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Game Over!
          </h2>

          <p
            className={`text-2xl font-bold mb-6 ${
              winner === "player1" ? "text-cyan-400" : "text-purple-400"
            }`}
          >
            {winner === "player1" ? player1Name : player2Name} Wins!
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-cyan-400 mb-1 truncate max-w-24">
                {player1Name}
              </p>
              <p className="text-4xl font-bold text-white">{player1Score}</p>
            </div>
            <div className="text-slate-500 text-2xl">-</div>
            <div className="text-center">
              <p className="text-sm text-purple-400 mb-1 truncate max-w-24">
                {player2Name}
              </p>
              <p className="text-4xl font-bold text-white">{player2Score}</p>
            </div>
          </div>

          <button
            onClick={onPlayAgain}
            className="game-button bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 hover:scale-105 active:scale-95 transition-all duration-300 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}

interface LoginScreenProps {
  player1Name: string
  setPlayer1Name: (name: string) => void
  player2Name: string
  setPlayer2Name: (name: string) => void
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  onStart: () => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

function LoginScreen({
  player1Name,
  setPlayer1Name,
  player2Name,
  setPlayer2Name,
  gameMode,
  setGameMode,
  onStart,
  soundEnabled,
  setSoundEnabled,
}: LoginScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Sound Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="glass-card p-3 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 active:scale-95"
          title={soundEnabled ? "Mute Sound" : "Enable Sound"}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-cyan-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Swords className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Rock Paper Scissors
          </h1>
          <Swords className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-slate-400 text-lg">Game In Progress</p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 glass-card p-8 w-full max-w-md animate-scale-in">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Setup</h2>

        {/* Game Mode Selection */}
        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-3 block">Game Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGameMode("2player")}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 ${
                gameMode === "2player"
                  ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <Users className={`w-6 h-6 ${gameMode === "2player" ? "text-cyan-400" : "text-slate-400"}`} />
              <span className={`text-sm font-medium ${gameMode === "2player" ? "text-cyan-400" : "text-slate-300"}`}>
                2 Players
              </span>
            </button>
            <button
              onClick={() => setGameMode("computer")}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 ${
                gameMode === "computer"
                  ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <Monitor className={`w-6 h-6 ${gameMode === "computer" ? "text-purple-400" : "text-slate-400"}`} />
              <span className={`text-sm font-medium ${gameMode === "computer" ? "text-purple-400" : "text-slate-300"}`}>
                vs Computer
              </span>
            </button>
          </div>
        </div>

        {/* Player Name Inputs */}
        <div className="space-y-4 mb-8">
          {/* Player 1 Input */}
          <div>
            <label className="text-sm text-cyan-400 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              {gameMode === "computer" ? "Your Name" : "Player 1 Name"}
            </label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder={gameMode === "computer" ? "Enter your name" : "Enter Player 1 name"}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300"
              maxLength={15}
            />
          </div>

          {/* Player 2 Input - Only show in 2 player mode */}
          {gameMode === "2player" && (
            <div className="animate-fade-in">
              <label className="text-sm text-purple-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Player 2 Name
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter Player 2 name"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all duration-300"
                maxLength={15}
              />
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full game-button bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 justify-center text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/20"
        >
          <Play className="w-6 h-6" />
          Start Game
        </button>

        {/* Game Info */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-center text-sm text-slate-500">
            First player to win <span className="text-cyan-400 font-medium">3 rounds</span> wins the match
          </p>
        </div>
      </div>

      {/* Game Rules */}
      <div className="relative z-10 mt-8 glass-card p-6 w-full max-w-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-lg font-semibold text-white mb-4 text-center">How to Play</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <Hand className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs text-slate-400">Rock beats Scissors</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400">Paper beats Rock</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-xs text-slate-400">Scissors beats Paper</span>
          </div>
        </div>
      </div>
    </main>
  )
}
