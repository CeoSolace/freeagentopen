/*
 * limitsService
 *
 * Enforces per-user chat creation limits based on billing plan.
 */

let AppError;
let logger;

try {
  AppError = require('../common/errors').AppError;
} catch {
  AppError = class AppError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  };
}

try {
  logger = require('../common/logger');
} catch {
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
  };
}

const Conversation = require('../../../models/Conversation');

let BillingStatus = null;
try {
  BillingStatus = require('../../billing/models/BillingStatus');
} catch {
  logger.warn('BillingStatus model missing, defaulting to FREE plan');
}

const MAX_FREE_NEW_CHATS_PER_WEEK = 5;

async function enforceNewChatLimit(userId) {
  let plan = 'FREE';

  if (BillingStatus) {
    const status = await BillingStatus.findOne({ user: userId }).lean();
    if (status?.plan) {
      plan = status.plan.toUpperCase();
    }
  }

  if (plan === 'PRO' || plan === 'ULT') {
    return;
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentCount = await Conversation.countDocuments({
    participants: userId,
    createdAt: { $gte: oneWeekAgo },
  });

  if (recentCount >= MAX_FREE_NEW_CHATS_PER_WEEK) {
    throw new AppError(429, 'Weekly chat limit reached on Free plan');
  }
}

module.exports = { enforceNewChatLimit };
