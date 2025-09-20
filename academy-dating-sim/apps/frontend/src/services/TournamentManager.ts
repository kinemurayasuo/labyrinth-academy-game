import { EventEmitter } from 'events';

interface TournamentType {
  id: string;
  name: string;
  format: string;
  participants: number;
  rounds?: number;
  rules?: Record<string, any>;
  prizes: Record<string, any>;
}

interface Participant {
  id: string;
  name: string;
  stats: Record<string, number>;
  seed?: number;
  wins: number;
  losses: number;
  points?: number;
}

interface Match {
  id: string;
  round: number;
  participant1: string;
  participant2: string;
  winner?: string;
  score?: { p1: number, p2: number };
  status: 'scheduled' | 'in_progress' | 'completed';
  spectators: number;
  bets: Map<string, { participant: string, amount: number }>;
}

interface Tournament {
  id: string;
  type: string;
  status: 'registration' | 'qualifiers' | 'main_event' | 'finals' | 'completed';
  participants: Map<string, Participant>;
  bracket: Match[];
  currentRound: number;
  champion?: string;
  startDate: Date;
  prizes: Record<string, any>;
}

interface TrainingSession {
  participantId: string;
  facility: string;
  duration: number;
  startTime: Date;
  statGains: Record<string, number>;
}

export class TournamentManager extends EventEmitter {
  private tournaments: Map<string, Tournament> = new Map();
  private activeTournament: Tournament | null = null;
  private tournamentTypes: Map<string, TournamentType> = new Map();
  private participants: Map<string, Participant> = new Map();
  private trainingSessions: Map<string, TrainingSession> = new Map();
  private bettingPool: Map<string, number> = new Map();
  private tournamentHistory: Tournament[] = [];
  private achievements: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.loadTournamentData();
  }

  private loadTournamentData(): void {
    console.log('Loading tournament data...');
  }

  public createTournament(typeId: string, customSettings?: Partial<TournamentType>): string {
    const tournamentType = this.tournamentTypes.get(typeId);
    if (!tournamentType) {
      throw new Error(`Tournament type ${typeId} not found`);
    }

    const tournamentId = `tournament_${Date.now()}`;
    const tournament: Tournament = {
      id: tournamentId,
      type: typeId,
      status: 'registration',
      participants: new Map(),
      bracket: [],
      currentRound: 0,
      startDate: new Date(),
      prizes: { ...tournamentType.prizes, ...customSettings?.prizes }
    };

    this.tournaments.set(tournamentId, tournament);
    this.activeTournament = tournament;

    this.emit('tournament-created', { tournamentId, type: typeId });

    // Start registration phase
    this.startRegistrationPhase(tournamentId);

    return tournamentId;
  }

  private startRegistrationPhase(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    this.emit('registration-opened', { tournamentId });

    // Auto-close registration after 7 days (in-game time)
    setTimeout(() => {
      this.closeRegistration(tournamentId);
    }, 7 * 24 * 60 * 60 * 1000);
  }

  public registerParticipant(tournamentId: string, participantId: string, stats: Record<string, number>): boolean {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'registration') {
      return false;
    }

    const participant: Participant = {
      id: participantId,
      name: participantId,
      stats,
      wins: 0,
      losses: 0,
      points: 0
    };

    tournament.participants.set(participantId, participant);
    this.participants.set(participantId, participant);

    this.emit('participant-registered', { tournamentId, participantId });

    return true;
  }

  private closeRegistration(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'qualifiers';
    this.generateBracket(tournament);

    this.emit('registration-closed', {
      tournamentId,
      totalParticipants: tournament.participants.size
    });

    this.startQualifiers(tournamentId);
  }

  private generateBracket(tournament: Tournament): void {
    const participants = Array.from(tournament.participants.values());

    // Seed participants based on stats
    participants.sort((a, b) => {
      const aTotal = Object.values(a.stats).reduce((sum, val) => sum + val, 0);
      const bTotal = Object.values(b.stats).reduce((sum, val) => sum + val, 0);
      return bTotal - aTotal;
    });

    participants.forEach((p, index) => {
      p.seed = index + 1;
    });

    // Create matches based on format
    const type = this.tournamentTypes.get(tournament.type);
    if (!type) return;

    switch (type.format) {
      case 'elimination':
        this.createEliminationBracket(tournament, participants);
        break;
      case 'round_robin':
        this.createRoundRobinBracket(tournament, participants);
        break;
      case 'swiss':
        this.createSwissBracket(tournament, participants);
        break;
    }
  }

  private createEliminationBracket(tournament: Tournament, participants: Participant[]): void {
    const rounds = Math.ceil(Math.log2(participants.length));
    let currentRoundParticipants = [...participants];

    for (let round = 1; round <= rounds; round++) {
      const roundMatches: Match[] = [];

      for (let i = 0; i < currentRoundParticipants.length; i += 2) {
        if (i + 1 < currentRoundParticipants.length) {
          const match: Match = {
            id: `match_${tournament.id}_r${round}_m${i/2}`,
            round,
            participant1: currentRoundParticipants[i].id,
            participant2: currentRoundParticipants[i + 1].id,
            status: 'scheduled',
            spectators: 0,
            bets: new Map()
          };
          roundMatches.push(match);
          tournament.bracket.push(match);
        }
      }
    }
  }

  private createRoundRobinBracket(tournament: Tournament, participants: Participant[]): void {
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match: Match = {
          id: `match_${tournament.id}_p${i}_p${j}`,
          round: 0,
          participant1: participants[i].id,
          participant2: participants[j].id,
          status: 'scheduled',
          spectators: 0,
          bets: new Map()
        };
        tournament.bracket.push(match);
      }
    }
  }

  private createSwissBracket(tournament: Tournament, participants: Participant[]): void {
    // Swiss pairing will be done dynamically each round
    tournament.currentRound = 1;
  }

  private startQualifiers(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    this.emit('qualifiers-started', { tournamentId });
    this.processNextMatch(tournamentId);
  }

  private processNextMatch(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const nextMatch = tournament.bracket.find(m => m.status === 'scheduled');
    if (!nextMatch) {
      this.advanceToNextPhase(tournamentId);
      return;
    }

    this.startMatch(tournamentId, nextMatch.id);
  }

  public startMatch(tournamentId: string, matchId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const match = tournament.bracket.find(m => m.id === matchId);
    if (!match) return;

    match.status = 'in_progress';

    this.emit('match-started', { tournamentId, matchId, match });

    // Simulate match
    this.simulateMatch(tournament, match);
  }

  private simulateMatch(tournament: Tournament, match: Match): void {
    const p1 = tournament.participants.get(match.participant1);
    const p2 = tournament.participants.get(match.participant2);

    if (!p1 || !p2) return;

    // Calculate winner based on stats and RNG
    const p1Power = this.calculatePower(p1, tournament.type);
    const p2Power = this.calculatePower(p2, tournament.type);

    const p1Chance = p1Power / (p1Power + p2Power);
    const winner = Math.random() < p1Chance ? match.participant1 : match.participant2;
    const loser = winner === match.participant1 ? match.participant2 : match.participant1;

    match.winner = winner;
    match.score = {
      p1: winner === match.participant1 ? 3 : 0,
      p2: winner === match.participant2 ? 3 : 0
    };
    match.status = 'completed';

    // Update participant records
    const winnerParticipant = tournament.participants.get(winner)!;
    const loserParticipant = tournament.participants.get(loser)!;

    winnerParticipant.wins++;
    loserParticipant.losses++;

    this.emit('match-completed', {
      tournamentId: tournament.id,
      matchId: match.id,
      winner,
      loser,
      score: match.score
    });

    // Process betting payouts
    this.processBettingPayouts(match);

    // Continue to next match
    setTimeout(() => {
      this.processNextMatch(tournament.id);
    }, 1000);
  }

  private calculatePower(participant: Participant, tournamentType: string): number {
    const type = this.tournamentTypes.get(tournamentType);
    if (!type) return 0;

    let power = 0;
    const weights = this.getStatWeights(tournamentType);

    for (const [stat, value] of Object.entries(participant.stats)) {
      power += value * (weights[stat] || 1);
    }

    // Add randomness
    power *= (0.8 + Math.random() * 0.4);

    return power;
  }

  private getStatWeights(tournamentType: string): Record<string, number> {
    const weights: Record<string, Record<string, number>> = {
      combat: { combat: 3, athletics: 2, magic: 1 },
      magic: { magic: 3, intelligence: 2, combat: 0.5 },
      academic: { intelligence: 3, academics: 3, charm: 1 },
      athletics: { athletics: 3, stamina: 2, strength: 2 },
      romance: { charm: 3, beauty: 2, popularity: 2 }
    };

    return weights[tournamentType] || {};
  }

  private advanceToNextPhase(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    switch (tournament.status) {
      case 'qualifiers':
        tournament.status = 'main_event';
        this.startMainEvent(tournamentId);
        break;
      case 'main_event':
        tournament.status = 'finals';
        this.startFinals(tournamentId);
        break;
      case 'finals':
        this.completeTournament(tournamentId);
        break;
    }
  }

  private startMainEvent(tournamentId: string): void {
    this.emit('main-event-started', { tournamentId });
    this.processNextMatch(tournamentId);
  }

  private startFinals(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    this.emit('finals-started', { tournamentId });

    // Special finals setup
    const finalists = this.getFinalists(tournament);
    if (finalists.length === 2) {
      const finalsMatch: Match = {
        id: `finals_${tournamentId}`,
        round: 99,
        participant1: finalists[0],
        participant2: finalists[1],
        status: 'scheduled',
        spectators: 1000,
        bets: new Map()
      };

      tournament.bracket.push(finalsMatch);
      this.startMatch(tournamentId, finalsMatch.id);
    }
  }

  private getFinalists(tournament: Tournament): string[] {
    const standings = this.calculateStandings(tournament);
    return standings.slice(0, 2).map(s => s.id);
  }

  private calculateStandings(tournament: Tournament): Participant[] {
    const participants = Array.from(tournament.participants.values());

    participants.sort((a, b) => {
      // Sort by wins, then by points, then by power
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);

      const aPower = this.calculatePower(a, tournament.type);
      const bPower = this.calculatePower(b, tournament.type);
      return bPower - aPower;
    });

    return participants;
  }

  private completeTournament(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'completed';

    const standings = this.calculateStandings(tournament);
    tournament.champion = standings[0]?.id;

    // Award prizes
    this.awardPrizes(tournament, standings);

    // Record achievements
    this.recordAchievements(tournament, standings);

    // Move to history
    this.tournamentHistory.push(tournament);

    if (this.activeTournament?.id === tournamentId) {
      this.activeTournament = null;
    }

    this.emit('tournament-completed', {
      tournamentId,
      champion: tournament.champion,
      standings: standings.slice(0, 3)
    });
  }

  private awardPrizes(tournament: Tournament, standings: Participant[]): void {
    const prizes = tournament.prizes;

    if (standings[0] && prizes.champion) {
      this.emit('prize-awarded', {
        participantId: standings[0].id,
        prize: prizes.champion
      });
    }

    if (standings[1] && prizes.runnerUp) {
      this.emit('prize-awarded', {
        participantId: standings[1].id,
        prize: prizes.runnerUp
      });
    }

    if (standings[2] && standings[3] && prizes.semifinals) {
      this.emit('prize-awarded', {
        participantId: standings[2].id,
        prize: prizes.semifinals
      });
      this.emit('prize-awarded', {
        participantId: standings[3].id,
        prize: prizes.semifinals
      });
    }
  }

  private recordAchievements(tournament: Tournament, standings: Participant[]): void {
    const champion = standings[0];
    if (!champion) return;

    if (!this.achievements.has(champion.id)) {
      this.achievements.set(champion.id, new Set());
    }

    const playerAchievements = this.achievements.get(champion.id)!;

    // First tournament win
    if (!playerAchievements.has('first_tournament')) {
      playerAchievements.add('first_tournament');
      this.emit('achievement-unlocked', {
        participantId: champion.id,
        achievement: 'first_tournament'
      });
    }

    // Perfect record
    if (champion.losses === 0) {
      playerAchievements.add('undefeated');
      this.emit('achievement-unlocked', {
        participantId: champion.id,
        achievement: 'undefeated'
      });
    }

    // Type-specific achievements
    playerAchievements.add(`${tournament.type}_champion`);
  }

  public placeBet(
    tournamentId: string,
    matchId: string,
    bettorId: string,
    participantId: string,
    amount: number
  ): boolean {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return false;

    const match = tournament.bracket.find(m => m.id === matchId);
    if (!match || match.status !== 'scheduled') return false;

    match.bets.set(bettorId, { participant: participantId, amount });

    const poolKey = `${tournamentId}_${matchId}`;
    const currentPool = this.bettingPool.get(poolKey) || 0;
    this.bettingPool.set(poolKey, currentPool + amount);

    this.emit('bet-placed', { tournamentId, matchId, bettorId, participantId, amount });

    return true;
  }

  private processBettingPayouts(match: Match): void {
    if (!match.winner) return;

    for (const [bettorId, bet] of match.bets) {
      if (bet.participant === match.winner) {
        const payout = bet.amount * this.calculateOdds(match, bet.participant);
        this.emit('bet-won', { bettorId, amount: payout });
      } else {
        this.emit('bet-lost', { bettorId, amount: bet.amount });
      }
    }
  }

  private calculateOdds(match: Match, participantId: string): number {
    // Simple odds calculation based on seed differences
    return 2.0;
  }

  public startTraining(
    participantId: string,
    facility: string,
    duration: number
  ): boolean {
    if (this.trainingSessions.has(participantId)) {
      return false;
    }

    const session: TrainingSession = {
      participantId,
      facility,
      duration,
      startTime: new Date(),
      statGains: this.calculateTrainingGains(facility, duration)
    };

    this.trainingSessions.set(participantId, session);

    this.emit('training-started', { participantId, facility, duration });

    setTimeout(() => {
      this.completeTraining(participantId);
    }, duration * 1000);

    return true;
  }

  private calculateTrainingGains(facility: string, duration: number): Record<string, number> {
    const baseGains: Record<string, Record<string, number>> = {
      combat_arena: { combat: 5, stamina: 3 },
      magic_chamber: { magic: 5, intelligence: 3 },
      library: { academics: 5, intelligence: 5 },
      gym: { athletics: 5, stamina: 5 }
    };

    const gains = baseGains[facility] || {};
    const multiplier = duration / 3600;

    const scaledGains: Record<string, number> = {};
    for (const [stat, value] of Object.entries(gains)) {
      scaledGains[stat] = Math.floor(value * multiplier);
    }

    return scaledGains;
  }

  private completeTraining(participantId: string): void {
    const session = this.trainingSessions.get(participantId);
    if (!session) return;

    this.trainingSessions.delete(participantId);

    this.emit('training-completed', {
      participantId,
      statGains: session.statGains
    });
  }

  public spectateMatch(matchId: string, spectatorId: string): void {
    const tournament = this.activeTournament;
    if (!tournament) return;

    const match = tournament.bracket.find(m => m.id === matchId);
    if (!match || match.status !== 'in_progress') return;

    match.spectators++;

    this.emit('spectator-joined', { matchId, spectatorId, totalSpectators: match.spectators });
  }

  public getTournamentStandings(tournamentId: string): Participant[] {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return [];

    return this.calculateStandings(tournament);
  }

  public getActiveTournament(): Tournament | null {
    return this.activeTournament;
  }

  public getTournamentHistory(): Tournament[] {
    return this.tournamentHistory;
  }

  public getPlayerAchievements(playerId: string): string[] {
    return Array.from(this.achievements.get(playerId) || []);
  }
}