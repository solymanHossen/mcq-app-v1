-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- Grandfather existing admins: this tier didn't exist until this migration
-- runs, so "ADMIN" was the top of the hierarchy for every account created
-- before it. Leaving them at ADMIN would silently strip the elevated
-- capabilities (managing admin-tier roles) they already had — and with no
-- SUPER_ADMIN yet in the system, nobody could ever grant it. Only an ADMIN
-- created after this migration starts at the (now lower) ADMIN tier.
UPDATE "User" SET "role" = 'SUPER_ADMIN' WHERE "role" = 'ADMIN';
