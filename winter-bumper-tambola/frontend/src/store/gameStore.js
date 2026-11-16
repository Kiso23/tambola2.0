import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      // Session identity
      role: null, // 'host' | 'player'
      roomCode: null,
      playerToken: null,
      hostToken: null,
      playerName: null,
      gameName: null,
      hostName: null,

      // Game state
      status: 'waiting', // 'waiting' | 'playing' | 'finished'
      players: [],
      playerCount: 0,

      // Ticket
      ticket: null,
      markedNumbers: [],

      // Number board
      calledNumbers: [],
      lastCalledNumber: null,
      remainingCount: 90,
      recentNumbers: [],

      // Winners & patterns
      winners: [],
      patterns: {
        earlyFive: false,
        topLine: false,
        middleLine: false,
        bottomLine: false,
        fullHouse: false,
      },
      myPatterns: {
        earlyFive: false,
        topLine: false,
        middleLine: false,
        bottomLine: false,
        fullHouse: false,
      },

      // Actions
      setSession: (data) => set(data),

      setRoomState: (data) => {
        const state = get();
        const markedNumbers = data.calledNumbers?.filter((n) => {
          if (!state.ticket) return false;
          return state.ticket.rows.flat().includes(n);
        }) ?? state.markedNumbers;

        set({
          status: data.status ?? state.status,
          players: data.players ?? state.players,
          playerCount: data.playerCount ?? data.players?.length ?? state.playerCount,
          calledNumbers: data.calledNumbers ?? state.calledNumbers,
          lastCalledNumber: data.lastCalledNumber ?? state.lastCalledNumber,
          winners: data.winners ?? state.winners,
          patterns: data.patterns ?? state.patterns,
          markedNumbers,
        });
      },

      onNumberCalled: (data) => {
        const state = get();
        const { number, calledNumbers, lastCalledNumber, remainingCount } = data;

        // Auto-mark ticket
        let newMarked = [...state.markedNumbers];
        if (state.ticket) {
          const ticketNums = state.ticket.rows.flat().filter((n) => n !== null);
          if (ticketNums.includes(number) && !newMarked.includes(number)) {
            newMarked.push(number);
          }
        }

        // Recent 4 numbers
        const recent = [number, ...(state.recentNumbers || [])].slice(0, 4);

        // Recompute my winning patterns
        const myPatterns = computePatterns(state.ticket, newMarked, calledNumbers);

        set({
          calledNumbers,
          lastCalledNumber,
          remainingCount: remainingCount ?? state.remainingCount - 1,
          markedNumbers: newMarked,
          recentNumbers: recent,
          myPatterns,
        });
      },

      onGameStarted: (data) => {
        set({
          status: 'playing',
          calledNumbers: [],
          lastCalledNumber: null,
          remainingCount: 90,
          recentNumbers: [],
          players: data.players ?? [],
        });
      },

      onGameOver: (data) => {
        set({ status: 'finished', winners: data.winners ?? [] });
      },

      onWinnerAnnounced: (data) => {
        set({ winners: data.winners ?? [], patterns: data.patterns ?? {} });
      },

      onPlayersUpdate: (data) => {
        set({
          playerCount: data.playerCount ?? 0,
          players: data.players ?? get().players,
        });
      },

      clearSession: () => {
        set({
          role: null, roomCode: null, playerToken: null, hostToken: null,
          playerName: null, gameName: null, hostName: null,
          status: 'waiting', players: [], playerCount: 0,
          ticket: null, markedNumbers: [], calledNumbers: [],
          lastCalledNumber: null, remainingCount: 90, recentNumbers: [],
          winners: [], patterns: {
            earlyFive: false, topLine: false, middleLine: false,
            bottomLine: false, fullHouse: false,
          },
          myPatterns: {
            earlyFive: false, topLine: false, middleLine: false,
            bottomLine: false, fullHouse: false,
          },
        });
      },
    }),
    {
      name: 'wbt-session',
      partialize: (s) => ({
        role: s.role,
        roomCode: s.roomCode,
        playerToken: s.playerToken,
        hostToken: s.hostToken,
        playerName: s.playerName,
        gameName: s.gameName,
        hostName: s.hostName,
        ticket: s.ticket,
      }),
    }
  )
);

function computePatterns(ticket, markedNumbers, calledNumbers) {
  if (!ticket) return {};
  const marked = new Set(markedNumbers);
  const rowFilled = (rowIdx) =>
    ticket.rows[rowIdx].filter((n) => n !== null).every((n) => marked.has(n));

  return {
    earlyFive: markedNumbers.length >= 5,
    topLine: rowFilled(0),
    middleLine: rowFilled(1),
    bottomLine: rowFilled(2),
    fullHouse: ticket.rows.flat().filter((n) => n !== null).every((n) => marked.has(n)),
  };
}

export default useGameStore;
