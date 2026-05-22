"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ulid } from "ulid";
import { generateInviteCode, generateAdminCode } from "@/lib/codes";
import type { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import { parseLocalDate } from "@/lib/dates";

// ─── Event ────────────────────────────────────────────────────────────────────

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function createEvent(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get("cf-turnstile-response") as string;
  if (!token || !(await verifyTurnstile(token))) {
    return { error: "Verifica anti-spam fallita. Riprova." };
  }

  const name = formData.get("name") as string;
  const totalCost = parseFloat(formData.get("totalCost") as string);
  const paymentInfo = (formData.get("paymentInfo") as string) ?? "";
  const startDateRaw = formData.get("startDate") as string | null;
  const endDateRaw = formData.get("endDate") as string | null;
  const startDate = startDateRaw ? parseLocalDate(startDateRaw) : null;
  const endDate = endDateRaw ? parseLocalDate(endDateRaw) : null;

  if (!name || isNaN(totalCost)) return { error: "Dati non validi" };

  let inviteCode: string;
  let adminCode: string;

  // ensure uniqueness
  while (true) {
    inviteCode = generateInviteCode();
    const exists = await prisma.event.findUnique({ where: { inviteCode } });
    if (!exists) break;
  }
  while (true) {
    adminCode = generateAdminCode();
    const exists = await prisma.event.findUnique({ where: { adminCode } });
    if (!exists) break;
  }

  const event = await prisma.event.create({
    data: { id: ulid(), name, totalCost, paymentInfo, startDate, endDate, inviteCode: inviteCode!, adminCode: adminCode! },
  });

  // auto-login as admin
  const cookieStore = await cookies();
  cookieStore.set(`admin_${event.id}`, "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(`/evento/${event.id}/admin`);
}

export async function updateEvent(
  eventId: string,
  _prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get(`admin_${eventId}`)) return { error: "Non autorizzato" };

    const name = formData.get("name") as string;
    const totalCost = parseFloat(formData.get("totalCost") as string);
    const paymentInfo = (formData.get("paymentInfo") as string) ?? "";
    const startDateRaw = formData.get("startDate") as string | null;
    const endDateRaw = formData.get("endDate") as string | null;
    const startDate = startDateRaw ? parseLocalDate(startDateRaw) : null;
    const endDate = endDateRaw ? parseLocalDate(endDateRaw) : null;

    if (!name || isNaN(totalCost)) return { error: "Dati non validi" };

    await prisma.event.update({
      where: { id: eventId },
      data: { name, totalCost, paymentInfo, startDate, endDate },
    });

    revalidatePath(`/evento/${eventId}/admin`);
    revalidatePath(`/evento/${eventId}`);
    return { success: true };
  } catch {
    return { error: "Errore durante il salvataggio" };
  }
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export async function verifyAdminCode(
  eventId: string,
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event || event.adminCode !== code) return { error: "Codice admin non valido" };

  const cookieStore = await cookies();
  cookieStore.set(`admin_${eventId}`, "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath(`/evento/${eventId}/admin`);
  return {};
}

// ─── Participant auth ─────────────────────────────────────────────────────────

export async function verifyInviteCode(
  eventId: string,
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event || event.inviteCode !== code) return { error: "Codice invito non valido" };

  const cookieStore = await cookies();
  cookieStore.set(`invite_${eventId}`, "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath(`/evento/${eventId}`);
  return {};
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function addParticipant(
  eventId: string,
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Nome obbligatorio" };

  const cookieStore = await cookies();
  if (!cookieStore.get(`admin_${eventId}`)) return { error: "Non autorizzato" };

  const quotes = Math.max(1, parseInt(formData.get("quotes") as string) || 1);

  await prisma.participant.create({ data: { eventId, name, quotes } });

  revalidatePath(`/evento/${eventId}/admin`);
  revalidatePath(`/evento/${eventId}`);
  return {};
}

export async function updateParticipantQuotes(
  participantId: string,
  quotes: number,
  eventId: string
) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`admin_${eventId}`)) return;

  await prisma.participant.update({
    where: { id: participantId },
    data: { quotes: Math.max(1, quotes) },
  });

  revalidatePath(`/evento/${eventId}/admin`);
  revalidatePath(`/evento/${eventId}`);
}

export async function removeParticipant(participantId: string, eventId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`admin_${eventId}`)) return;

  await prisma.participant.delete({ where: { id: participantId } });

  revalidatePath(`/evento/${eventId}/admin`);
  revalidatePath(`/evento/${eventId}`);
}

export async function updateParticipantStatus(
  participantId: string,
  status: ParticipantStatus,
  eventId: string
) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`invite_${eventId}`) && !cookieStore.get(`admin_${eventId}`)) return;

  await prisma.participant.update({
    where: { id: participantId },
    data: { status },
  });

  revalidatePath(`/evento/${eventId}`);
  revalidatePath(`/evento/${eventId}/admin`);
}

export async function updatePaymentStatus(
  participantId: string,
  paymentStatus: PaymentStatus,
  eventId: string
) {
  const cookieStore = await cookies();
  if (!cookieStore.get(`admin_${eventId}`)) return;

  await prisma.participant.update({
    where: { id: participantId },
    data: { paymentStatus },
  });

  revalidatePath(`/evento/${eventId}/admin`);
  revalidatePath(`/evento/${eventId}`);
}
