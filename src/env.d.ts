/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    requestId: string;
    adminUser?: {
      username: string;
      role: string;
    };
  }
}