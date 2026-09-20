ALTER TABLE "Devotee" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "Devotee" ADD COLUMN IF NOT EXISTS "wantsNews" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Devotee" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;
UPDATE "Devotee" SET "role" = 'user' WHERE "role" = 'devotee';

DO $$ BEGIN
  ALTER TABLE "Devotee" ALTER COLUMN "username" SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Devotee_username_key" ON "Devotee"("username");

CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
