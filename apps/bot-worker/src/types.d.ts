// Ambient module declarations for dependencies that may not have type
// definitions installed in this isolated environment. Declaring modules
// as `any` allows the TypeScript compiler to resolve the imports without
// error. In the real monorepo these packages should have their proper
// typings installed.

declare module 'express' {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  function express(): any;
  function Router(): any;
  namespace express {
    function Router(): any;
    function json(): any;
  }
  export default express;
}

declare module 'mongoose' {
  export type Document = any;
  export type Schema<T = any> = any;
  export type Model<T = any> = any;
  export namespace Types {
    export type ObjectId = any;
  }
  const mongoose: any;
  export = mongoose;
}

declare module 'discord.js' {
  export const Client: any;
  export const GatewayIntentBits: any;
  export const Partials: any;
  export const TextChannel: any;
  export const ActionRowBuilder: any;
  export const ButtonBuilder: any;
  export const ButtonStyle: any;
  export const Interaction: any;
  export const Role: any;
  export const RoleResolvable: any;
  export const GuildMember: any;
  export const User: any;
  export const ChatInputCommandInteraction: any;
  export const ApplicationCommandDataResolvable: any;
  export const SlashCommandBuilder: any;
  const discordjs: any;
  export = discordjs;
}

declare module 'node-cron' {
  const cron: any;
  export = cron;
}

declare module 'pino' {
  const pino: any;
  export = pino;
}

declare module 'zod' {
  export const z: any;
}