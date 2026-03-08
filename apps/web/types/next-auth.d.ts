import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      discordId?: string;
      roles?: string[];
      verified?: boolean;
      banned?: boolean;
      accountAllowed?: boolean;
      openingFeeDue?: boolean;
      paymentMethodAdded?: boolean;
    };
  }

  interface User {
    id: string;
    discordId?: string;
    roles?: string[];
    verified?: boolean;
    banned?: boolean;
    accountAllowed?: boolean;
    openingFeeDue?: boolean;
    paymentMethodAdded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    discordId?: string;
    roles?: string[];
    verified?: boolean;
    banned?: boolean;
    accountAllowed?: boolean;
    openingFeeDue?: boolean;
    paymentMethodAdded?: boolean;
  }
}
