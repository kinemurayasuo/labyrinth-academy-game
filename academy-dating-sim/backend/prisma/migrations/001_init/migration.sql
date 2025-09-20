-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "profile_image" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" VARCHAR(100),
    "discord_id" VARCHAR(100),
    "kakao_id" VARCHAR(100),
    "language" VARCHAR(5) NOT NULL DEFAULT 'ko',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_login_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_saves" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "save_name" VARCHAR(100) NOT NULL DEFAULT 'Auto Save',
    "player_data" JSONB NOT NULL,
    "game_progress" JSONB NOT NULL,
    "current_location" VARCHAR(100),
    "current_day" INTEGER NOT NULL DEFAULT 1,
    "current_time" VARCHAR(20) NOT NULL DEFAULT 'morning',
    "unlocked_characters" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "character_relations" JSONB NOT NULL DEFAULT '{}',
    "completed_events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "available_events" JSONB NOT NULL DEFAULT '[]',
    "game_settings" JSONB NOT NULL DEFAULT '{}',
    "save_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "playtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_auto_save" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "game_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "session_start" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_end" TIMESTAMPTZ,
    "device_info" JSONB NOT NULL DEFAULT '{}',
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "game_version" VARCHAR(20),
    "actions_count" INTEGER NOT NULL DEFAULT 0,
    "events_completed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "achievement_id" VARCHAR(100) NOT NULL,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "event_data" JSONB NOT NULL,
    "game_state" JSONB,
    "session_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_stats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "character_id" VARCHAR(100) NOT NULL,
    "total_interactions" INTEGER NOT NULL DEFAULT 0,
    "average_affection" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "route_completions" INTEGER NOT NULL DEFAULT 0,
    "choice_stats" JSONB NOT NULL DEFAULT '{}',
    "last_updated" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "character_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_id" VARCHAR(255),
    "user_agent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_discord_id_key" ON "users"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_kakao_id_key" ON "users"("kakao_id");

-- CreateIndex
CREATE INDEX "game_saves_user_id_idx" ON "game_saves"("user_id");

-- CreateIndex
CREATE INDEX "game_saves_save_date_idx" ON "game_saves"("save_date" DESC);

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_session_start_idx" ON "user_sessions"("session_start");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "user_analytics_user_id_idx" ON "user_analytics"("user_id");

-- CreateIndex
CREATE INDEX "user_analytics_event_type_idx" ON "user_analytics"("event_type");

-- CreateIndex
CREATE INDEX "user_analytics_created_at_idx" ON "user_analytics"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "character_stats_character_id_key" ON "character_stats"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "game_saves" ADD CONSTRAINT "game_saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;