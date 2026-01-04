import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/* Nota rápida: para rodar o projeto localmente a partir do VS Code:
   1) Abra a pasta raiz do projeto (c:\Users\user\Documents\gaia30\gaia-11.0).
   2) Abra o terminal integrado (Ctrl+`) e execute: pnpm install && pnpm dev
   3) Acesse http://localhost:3000 (ou porta configurada).
   Use .env.local baseado em .env.example e garanta que serviços (DB, etc.) estejam rodando.
*/

/* Auditoria rápida para detectar banco de dados no projeto (cole as saídas aqui):
   1) No VS Code abra o terminal integrado (Ctrl+`) na raiz: c:\Users\user\Documents\gaia30\gaia-11.0
   2) Execute estes comandos e cole as saídas:
      - Procurar por pistas (recomendado ripgrep / git bash):
        rg "DATABASE_URL|prisma|@prisma/client|pg|mysql2|mongodb|mongoose|sequelize|typeorm|supabase|sqlite3" -n
        (ou) git grep -n "DATABASE_URL\|prisma\|@prisma/client"
        (Windows) findstr /s /i /n "DATABASE_URL prisma @prisma/client pg mysql2 mongodb mongoose" *
      - Mostrar package.json:
        cat package.json
      - Listar e mostrar Prisma se existir:
        dir prisma
        type prisma\\schema.prisma
      - Mostrar env examples:
        type .env.example
        type .env.local
   3) Interpretação rápida (quando tiver os resultados):
      - Se aparecer @prisma/client e prisma/schema.prisma -> projeto usa Prisma (provavelmente Postgres/MySQL/SQLite); veja prisma/migrations para migrações.
      - Se aparecer pg/mysql2 -> driver direto para Postgres/MySQL.
      - Se aparecer mongoose/mongodb -> usa MongoDB.
      - Se aparecer supabase/supabase-js -> usa serviço Supabase (DB externo).
      - Se não aparecer nada relevante -> provavelmente não há camada de persistência ou depende apenas de APIs externas.
   4) Se quiser, cole aqui as saídas (package.json, prisma/schema.prisma e .env.example) e eu analiso e digo exatamente qual DB e próximos passos (comandos de migração/conexão).
*/

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
