// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['query', 'error'] : ['error'],
});

export { prisma };
