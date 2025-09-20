import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@academy-dating-sim.com' },
    update: {},
    create: {
      email: 'demo@academy-dating-sim.com',
      username: 'demo',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj78xT7j16Fy', // password: demo123
      emailVerified: true,
      language: 'ko',
      timezone: 'Asia/Seoul'
    }
  });

  console.log('✅ 데모 사용자 생성:', demoUser.username);

  // Create sample game save
  const gameSave = await prisma.gameSave.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: demoUser.id,
      saveName: 'Tutorial Complete',
      playerData: {
        name: 'Demo Player',
        level: 5,
        stats: {
          intelligence: 15,
          charm: 12,
          athletics: 10,
          creativity: 8
        },
        experience: 250
      },
      gameProgress: {
        currentChapter: 2,
        completedTutorial: true,
        unlockedFeatures: ['save_system', 'character_interaction', 'stat_training']
      },
      currentLocation: 'academy_courtyard',
      currentDay: 7,
      currentTime: 'afternoon',
      unlockedCharacters: ['aria', 'luna', 'kai'],
      characterRelations: {
        aria: { affection: 25, friendship: 30, rivalry: 0 },
        luna: { affection: 15, friendship: 40, rivalry: 5 },
        kai: { affection: 10, friendship: 20, rivalry: 0 }
      },
      completedEvents: ['tutorial_start', 'first_day', 'meet_aria', 'meet_luna', 'meet_kai'],
      availableEvents: [
        { id: 'library_study', requirements: { intelligence: 10 } },
        { id: 'sports_club', requirements: { athletics: 8 } }
      ],
      gameSettings: {
        difficulty: 'normal',
        autoSave: true,
        soundVolume: 80,
        musicVolume: 70
      },
      playtimeMinutes: 120,
      isAutoSave: false
    }
  });

  console.log('✅ 샘플 게임 세이브 생성:', gameSave.saveName);

  // Create sample achievements
  const achievements = [
    {
      userId: demoUser.id,
      achievementId: 'first_steps',
      progress: { completed: true },
      isCompleted: true,
      completedAt: new Date()
    },
    {
      userId: demoUser.id,
      achievementId: 'social_butterfly',
      progress: { charactersMetCount: 3, requiredCount: 5 },
      isCompleted: false
    },
    {
      userId: demoUser.id,
      achievementId: 'scholar',
      progress: { intelligenceLevel: 15, requiredLevel: 20 },
      isCompleted: false
    }
  ];

  for (const achievement of achievements) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: achievement.userId,
          achievementId: achievement.achievementId
        }
      },
      update: {},
      create: achievement
    });
  }

  console.log('✅ 샘플 업적 생성 완료');

  // Create character stats
  const characterStats = [
    {
      characterId: 'aria',
      totalInteractions: 150,
      averageAffection: 22.5,
      routeCompletions: 3,
      choiceStats: {
        positive_responses: 120,
        neutral_responses: 25,
        negative_responses: 5
      }
    },
    {
      characterId: 'luna',
      totalInteractions: 89,
      averageAffection: 18.2,
      routeCompletions: 1,
      choiceStats: {
        positive_responses: 65,
        neutral_responses: 20,
        negative_responses: 4
      }
    },
    {
      characterId: 'kai',
      totalInteractions: 67,
      averageAffection: 16.8,
      routeCompletions: 2,
      choiceStats: {
        positive_responses: 45,
        neutral_responses: 18,
        negative_responses: 4
      }
    }
  ];

  for (const stats of characterStats) {
    await prisma.characterStats.upsert({
      where: { characterId: stats.characterId },
      update: stats,
      create: stats
    });
  }

  console.log('✅ 캐릭터 통계 생성 완료');

  console.log('🎉 데이터베이스 시드 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });