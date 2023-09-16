-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "regno" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dep" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "filterdep" TEXT NOT NULL,
    "gen" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depTable" (
    "id" SERIAL NOT NULL,
    "dep" TEXT NOT NULL,

    CONSTRAINT "depTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_regno_key" ON "User"("regno");
